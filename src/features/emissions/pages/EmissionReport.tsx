import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Form, DatePicker, Input, Select, Modal, message, Tag, Space } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined, FileTextOutlined, DownloadOutlined } from '@ant-design/icons';
import api from '../../../services/api';
import { EmissionReport } from '../../../types/emission';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { confirm } = Modal;

interface ReportFormValues {
    title: string;
    startDate: moment.Moment;
    endDate: moment.Moment;
    status: 'draft' | 'finalized';
}

const EmissionReportPage: React.FC = () => {
    const [reports, setReports] = useState<EmissionReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    // 获取报告列表
    useEffect(() => {
        fetchReports();
    }, [pagination.current, pagination.pageSize]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await api.get('/emissions/reports', {
                params: {
                    page: pagination.current,
                    limit: pagination.pageSize
                }
            });
            setReports(response.data.data);
            setPagination({
                ...pagination,
                total: response.data.total
            });
        } catch (error) {
            message.error('获取报告列表失败');
        } finally {
            setLoading(false);
        }
    };

    // 创建新报告
    const handleCreateReport = async (values: ReportFormValues) => {
        try {
            await api.post('/emissions/reports', {
                title: values.title,
                startDate: values.startDate.format('YYYY-MM-DD'),
                endDate: values.endDate.format('YYYY-MM-DD'),
                status: values.status
            });

            message.success('报告创建成功');
            setIsModalVisible(false);
            form.resetFields();
            fetchReports();
        } catch (error) {
            message.error('报告创建失败');
        }
    };

    // 删除报告
    const handleDeleteReport = (id: number) => {
        confirm({
            title: '确认删除此报告?',
            icon: <ExclamationCircleOutlined />,
            content: '删除后将无法恢复，是否继续？',
            okText: '确认',
            okType: 'danger',
            cancelText: '取消',
            onOk: async () => {
                try {
                    await api.delete(`/emissions/reports/${id}`);
                    message.success('报告删除成功');
                    fetchReports();
                } catch (error) {
                    message.error('报告删除失败');
                }
            }
        });
    };

    // 下载报告
    const handleDownloadReport = (id: number) => {
        api.get(`/emissions/reports/${id}/download`, { responseType: 'blob' })
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `碳排放报告_${id}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch(() => {
                message.error('报告下载失败');
            });
    };

    // 改变报告状态
    const handleChangeStatus = async (id: number, status: 'draft' | 'finalized') => {
        try {
            await api.patch(`/emissions/reports/${id}`, { status });
            message.success('状态更新成功');
            fetchReports();
        } catch (error) {
            message.error('状态更新失败');
        }
    };

    // 表格列定义
    const columns = [
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: EmissionReport) => (
                <a onClick={() => handleDownloadReport(record.id)}>{text}</a>
            )
        },
        {
            title: '开始日期',
            dataIndex: 'startDate',
            key: 'startDate'
        },
        {
            title: '结束日期',
            dataIndex: 'endDate',
            key: 'endDate'
        },
        {
            title: '生成日期',
            dataIndex: 'generatedAt',
            key: 'generatedAt'
        },
        {
            title: '总排放量 (kg)',
            dataIndex: 'totalEmission',
            key: 'totalEmission',
            render: (value: number) => value.toFixed(2)
        },
        {
            title: '减排量 (kg)',
            dataIndex: 'reduction',
            key: 'reduction',
            render: (value: number) => value > 0 ? value.toFixed(2) : '-'
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                return status === 'draft' ?
                    <Tag color="gold">草稿</Tag> :
                    <Tag color="green">已定稿</Tag>;
            }
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: EmissionReport) => (
                <Space>
                    <Button
                        type="link"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownloadReport(record.id)}
                    >
                        下载
                    </Button>
                    {record.status === 'draft' ? (
                        <Button
                            type="link"
                            onClick={() => handleChangeStatus(record.id, 'finalized')}
                        >
                            定稿
                        </Button>
                    ) : (
                        <Button
                            type="link"
                            onClick={() => handleChangeStatus(record.id, 'draft')}
                        >
                            回退
                        </Button>
                    )}
                    <Button
                        type="link"
                        danger
                        onClick={() => handleDeleteReport(record.id)}
                    >
                        删除
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div>
            <h2>碳排放报告</h2>

            <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalVisible(true)}
                    >
                        生成新报告
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={reports}
                    rowKey="id"
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条报告`
                    }}
                    loading={loading}
                    onChange={(newPagination) => {
                        setPagination({
                            current: newPagination.current || 1,
                            pageSize: newPagination.pageSize || 10,
                            total: pagination.total
                        });
                    }}
                />
            </Card>

            <Modal
                title="生成碳排放报告"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateReport}
                >
                    <Form.Item
                        name="title"
                        label="报告标题"
                        rules={[{ required: true, message: '请输入报告标题' }]}
                    >
                        <Input placeholder="请输入报告标题" />
                    </Form.Item>

                    <Form.Item
                        name="dateRange"
                        label="报告日期范围"
                        rules={[{ required: true, message: '请选择日期范围' }]}
                    >
                        <RangePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="报告状态"
                        initialValue="draft"
                    >
                        <Select>
                            <Option value="draft">草稿</Option>
                            <Option value="finalized">定稿</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button style={{ marginRight: 8 }} onClick={() => setIsModalVisible(false)}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit">
                                生成报告
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EmissionReportPage; 