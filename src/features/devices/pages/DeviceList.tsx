import React, { useEffect, useState } from 'react';
import { Button, Table, Tag, Space, Input, Select, Modal, message } from 'antd';
import { PlusOutlined, SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxHooks';
import { fetchDevices, deleteDevice, selectAllDevices, selectDevicesStatus, selectDeviceTotal } from '../../../store/slices/deviceSlice';
import DeviceForm from '../components/DeviceForm';
import { Device } from '../../../types/device';

const { confirm } = Modal;
const { Option } = Select;

const DeviceList: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const devices = useAppSelector(selectAllDevices);
    const status = useAppSelector(selectDevicesStatus);
    const total = useAppSelector(selectDeviceTotal);

    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    // 获取设备列表
    useEffect(() => {
        loadDevices();
    }, [pagination.current, pagination.pageSize, statusFilter]);

    const loadDevices = () => {
        setLoading(true);
        dispatch(fetchDevices({
            page: pagination.current,
            limit: pagination.pageSize,
            filter: {
                ...(searchText && { name: searchText }),
                ...(statusFilter && { status: statusFilter })
            }
        })).then(() => {
            setLoading(false);
        });
    };

    // 处理搜索
    const handleSearch = () => {
        setPagination({ ...pagination, current: 1 });
        loadDevices();
    };

    // 处理状态筛选
    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        setPagination({ ...pagination, current: 1 });
    };

    // 处理分页变化
    const handleTableChange = (newPagination: any) => {
        setPagination({
            current: newPagination.current,
            pageSize: newPagination.pageSize
        });
    };

    // 查看设备详情
    const handleViewDevice = (id: number) => {
        navigate(`/devices/${id}`);
    };

    // 删除设备
    const handleDeleteDevice = (id: number) => {
        confirm({
            title: '确认删除该设备?',
            icon: <ExclamationCircleOutlined />,
            content: '删除后将无法恢复，是否继续？',
            okText: '确认',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                dispatch(deleteDevice(id))
                    .then(() => {
                        message.success('设备删除成功');
                        loadDevices();
                    })
                    .catch(() => {
                        message.error('设备删除失败');
                    });
            }
        });
    };

    // 表格列定义
    const columns = [
        {
            title: '设备名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Device) => (
                <a onClick={() => handleViewDevice(record.id)}>{text}</a>
            )
        },
        {
            title: '设备类型',
            dataIndex: 'type',
            key: 'type'
        },
        {
            title: '位置',
            dataIndex: 'location',
            key: 'location'
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'green';
                let text = '正常';

                if (status === 'inactive') {
                    color = 'volcano';
                    text = '离线';
                } else if (status === 'maintenance') {
                    color = 'gold';
                    text = '维护中';
                }

                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: '安装日期',
            dataIndex: 'installationDate',
            key: 'installationDate'
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: Device) => (
                <Space size="middle">
                    <a onClick={() => handleViewDevice(record.id)}>查看</a>
                    <a onClick={() => handleDeleteDevice(record.id)}>删除</a>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <Input
                        placeholder="搜索设备名称"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 200, marginRight: 8 }}
                        onPressEnter={handleSearch}
                    />
                    <Select
                        placeholder="设备状态"
                        style={{ width: 120, marginRight: 8 }}
                        allowClear
                        onChange={handleStatusFilterChange}
                    >
                        <Option value="active">正常</Option>
                        <Option value="inactive">离线</Option>
                        <Option value="maintenance">维护中</Option>
                    </Select>
                    <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                        搜索
                    </Button>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalVisible(true)}
                >
                    添加设备
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={devices}
                rowKey="id"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条记录`
                }}
                loading={loading || status === 'loading'}
                onChange={handleTableChange}
            />

            <Modal
                title="添加设备"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <DeviceForm
                    onSuccess={() => {
                        setIsModalVisible(false);
                        loadDevices();
                    }}
                    onCancel={() => setIsModalVisible(false)}
                />
            </Modal>
        </div>
    );
};

export default DeviceList; 