import React, { useEffect, useState } from 'react';
import { Table, Card, DatePicker, Button, Tabs, Space, Tag } from 'antd';
import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import api from '../../../services/api';
import { EmissionData } from '../../../types/emission';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const EmissionList: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [emissionData, setEmissionData] = useState<EmissionData[]>([]);
    const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    // 加载排放数据
    useEffect(() => {
        fetchEmissionData();
    }, [pagination.current, pagination.pageSize, dateRange]);

    const fetchEmissionData = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: pagination.current,
                limit: pagination.pageSize
            };

            if (dateRange) {
                params.startDate = dateRange[0].format('YYYY-MM-DD');
                params.endDate = dateRange[1].format('YYYY-MM-DD');
            }

            const response = await api.get('/emissions', { params });
            setEmissionData(response.data.data);
            setPagination({
                ...pagination,
                total: response.data.total
            });
        } catch (error) {
            console.error('Failed to fetch emission data:', error);
        } finally {
            setLoading(false);
        }
    };

    // 处理日期范围变化
    const handleDateRangeChange = (range: any) => {
        setDateRange(range);
        setPagination({ ...pagination, current: 1 });
    };

    // 处理表格分页变化
    const handleTableChange = (newPagination: any) => {
        setPagination({
            current: newPagination.current,
            pageSize: newPagination.pageSize,
            total: pagination.total
        });
    };

    // 导出报告
    const handleExport = (type: 'excel' | 'pdf') => {
        const params: any = {};

        if (dateRange) {
            params.startDate = dateRange[0].format('YYYY-MM-DD');
            params.endDate = dateRange[1].format('YYYY-MM-DD');
        }

        api.get(`/emissions/export/${type}`, {
            params,
            responseType: 'blob'
        }).then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `碳排放数据_${new Date().toISOString().slice(0, 10)}.${type}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        }).catch(error => {
            console.error(`Failed to export as ${type}:`, error);
        });
    };

    // 表格列定义
    const columns = [
        {
            title: '日期',
            dataIndex: 'date',
            key: 'date'
        },
        {
            title: '总碳排放量 (kg)',
            dataIndex: 'totalCo2',
            key: 'totalCo2',
            render: (value: number) => value.toFixed(2)
        },
        {
            title: '电力排放 (kg)',
            dataIndex: 'sourcesBreakdown',
            key: 'electricity',
            render: (breakdown: any) => breakdown.electricity.toFixed(2)
        },
        {
            title: '燃料排放 (kg)',
            dataIndex: 'sourcesBreakdown',
            key: 'fuel',
            render: (breakdown: any) => breakdown.fuel.toFixed(2)
        },
        {
            title: '加热排放 (kg)',
            dataIndex: 'sourcesBreakdown',
            key: 'heating',
            render: (breakdown: any) => breakdown.heating.toFixed(2)
        },
        {
            title: '其他排放 (kg)',
            dataIndex: 'sourcesBreakdown',
            key: 'other',
            render: (breakdown: any) => breakdown.other.toFixed(2)
        },
        {
            title: '与目标比较',
            dataIndex: 'comparisonWithTarget',
            key: 'comparisonWithTarget',
            render: (value: number) => {
                const color = value <= 0 ? 'green' : 'red';
                const prefix = value <= 0 ? '-' : '+';
                return <Tag color={color}>{`${prefix}${Math.abs(value).toFixed(2)}%`}</Tag>;
            }
        }
    ];

    // 趋势图表选项
    const getTrendChartOption = () => {
        const dates = emissionData.map(item => item.date);
        const emissions = emissionData.map(item => item.totalCo2);

        return {
            title: {
                text: '碳排放趋势',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                data: dates
            },
            yAxis: {
                type: 'value',
                name: '碳排放量 (kg)'
            },
            series: [
                {
                    name: '碳排放量',
                    type: 'line',
                    data: emissions,
                    markPoint: {
                        data: [
                            { type: 'max', name: '最大值' },
                            { type: 'min', name: '最小值' }
                        ]
                    },
                    markLine: {
                        data: [{ type: 'average', name: '平均值' }]
                    },
                    smooth: true,
                    lineStyle: {
                        width: 3
                    },
                    areaStyle: {
                        opacity: 0.2
                    }
                }
            ]
        };
    };

    // 排放来源图表选项
    const getSourcesChartOption = () => {
        // 汇总排放来源数据
        const sources = {
            electricity: 0,
            fuel: 0,
            heating: 0,
            other: 0
        };

        emissionData.forEach(item => {
            sources.electricity += item.sourcesBreakdown.electricity;
            sources.fuel += item.sourcesBreakdown.fuel;
            sources.heating += item.sourcesBreakdown.heating;
            sources.other += item.sourcesBreakdown.other;
        });

        return {
            title: {
                text: '碳排放来源分布',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} kg ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: ['电力', '燃料', '加热', '其他']
            },
            series: [
                {
                    name: '排放来源',
                    type: 'pie',
                    radius: '60%',
                    center: ['50%', '60%'],
                    data: [
                        { value: sources.electricity, name: '电力' },
                        { value: sources.fuel, name: '燃料' },
                        { value: sources.heating, name: '加热' },
                        { value: sources.other, name: '其他' }
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
    };

    return (
        <div>
            <h2>碳排放管理</h2>

            <Card style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <RangePicker onChange={handleDateRangeChange} style={{ marginRight: 8 }} />
                        <Button type="primary" onClick={fetchEmissionData}>
                            查询
                        </Button>
                    </div>
                    <Space>
                        <Button
                            icon={<FileExcelOutlined />}
                            onClick={() => handleExport('excel')}
                        >
                            导出Excel
                        </Button>
                        <Button
                            icon={<FilePdfOutlined />}
                            onClick={() => handleExport('pdf')}
                        >
                            导出PDF
                        </Button>
                    </Space>
                </div>

                <Tabs defaultActiveKey="table">
                    <TabPane tab="数据表格" key="table">
                        <Table
                            columns={columns}
                            dataSource={emissionData}
                            rowKey="id"
                            pagination={{
                                current: pagination.current,
                                pageSize: pagination.pageSize,
                                total: pagination.total,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total) => `共 ${total} 条记录`
                            }}
                            loading={loading}
                            onChange={handleTableChange}
                        />
                    </TabPane>
                    <TabPane tab="排放趋势" key="trend">
                        <ReactECharts option={getTrendChartOption()} style={{ height: 400 }} />
                    </TabPane>
                    <TabPane tab="排放来源" key="sources">
                        <ReactECharts option={getSourcesChartOption()} style={{ height: 400 }} />
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default EmissionList; 