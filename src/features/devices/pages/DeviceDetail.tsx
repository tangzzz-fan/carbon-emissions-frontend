import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../hooks/reduxHooks';
import {
    Card,
    Row,
    Col,
    Descriptions,
    Tag,
    Button,
    Tabs,
    Spin,
    Modal,
    message,
    Empty,
    Statistic,
    Space,
    Divider,
    Typography,
    Alert
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import {
    fetchDeviceById,
    deleteDevice,
    fetchDeviceData,
    updateDeviceStatus,
    selectSelectedDevice,
    selectDevicesStatus,
    selectDevicesError,
    selectDeviceData,
    selectDataStatus,
    selectDataError
} from '../../../store/slices/deviceSlice';
import DeviceForm from '../components/DeviceForm';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

const { TabPane } = Tabs;
const { confirm } = Modal;
const { Title } = Typography;

interface DeviceData {
    date: string;
    energyConsumption: number;
    co2Emission: number;
    operationalHours: number;
}

// 设备类型映射
const deviceTypeMap: Record<string, string> = {
    truck: '卡车',
    forklift: '叉车',
    packaging: '包装设备',
    lighting: '照明设备',
    GATE: '闸机',
    CAMERA: '摄像头',
    WEIGHT_SCALE: '称重设备',
    SECURITY: '安防设备',
    CHARGING_STATION: '充电站',
    other: '其他'
};

// 设备状态映射
const deviceStatusMap: Record<string, string> = {
    active: '运行中',
    inactive: '已停用',
    maintenance: '维护中'
};

// 能源类型映射
const energyTypeMap: Record<string, string> = {
    electricity: '电力',
    diesel: '柴油',
    gas: '天然气',
    solar: '太阳能'
};

// 获取设备类型对应的标签颜色
const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
        truck: 'blue',
        forklift: 'cyan',
        packaging: 'orange',
        lighting: 'yellow',
        GATE: 'purple',
        CAMERA: 'magenta',
        WEIGHT_SCALE: 'volcano',
        SECURITY: 'green',
        CHARGING_STATION: 'red',
        other: 'default'
    };
    return typeColors[type] || 'default';
};

// 获取设备状态对应的标签颜色
const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
        active: 'green',
        inactive: 'red',
        maintenance: 'gold'
    };
    return statusColors[status] || 'default';
};

const DeviceDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // 从Redux获取设备信息、状态和图表数据
    const device = useSelector(selectSelectedDevice);
    const status = useSelector(selectDevicesStatus);
    const reduxError = useSelector(selectDevicesError);
    const deviceDataFromRedux = useSelector(selectDeviceData);
    const dataStatus = useSelector(selectDataStatus);
    const dataError = useSelector(selectDataError);

    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
    const [dataLoading, setDataLoading] = useState(false);
    const [timeRange, setTimeRange] = useState('7d');
    const [localLoading, setLocalLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    console.log('当前设备ID:', id);
    console.log('Redux设备状态:', status);
    console.log('Redux设备数据:', device);
    console.log('Redux错误信息:', reduxError);

    // 通过URL查询参数检测是否需要自动打开编辑模态框
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('edit') === 'true') {
            setIsEditModalVisible(true);
            // 移除查询参数，避免刷新页面后再次打开模态框
            navigate(`/devices/${id}`, { replace: true });
        }
    }, [location, id, navigate]);

    // 获取设备详情 - 只使用Redux方式，移除本地fetchDeviceDetail
    useEffect(() => {
        if (id) {
            console.log(`正在通过Redux获取设备详情，ID: ${id}`);
            dispatch(fetchDeviceById(id));
        } else {
            console.error('设备ID缺失');
        }
    }, [dispatch, id]);

    // 获取设备图表数据
    useEffect(() => {
        if (id && device) {
            const now = new Date();
            let startDate = new Date();

            if (timeRange === '7d') {
                startDate.setDate(now.getDate() - 7);
            } else if (timeRange === '30d') {
                startDate.setDate(now.getDate() - 30);
            } else if (timeRange === '90d') {
                startDate.setDate(now.getDate() - 90);
            }

            console.log(`正在获取设备图表数据，ID: ${id}, 时间范围: ${timeRange}`);
            setDataLoading(true);

            // 使用模拟数据进行测试
            // 实际环境中，取消注释下面的代码，使用真实API
            /*
            dispatch(fetchDeviceData({
                deviceId: id,
                params: {
                    startDate: startDate.toISOString(),
                    endDate: now.toISOString(),
                    interval: 'daily'
                }
            }));
            */

            // 测试用模拟数据 - 在API可用前使用
            const mockData = Array.from({ length: timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90 }, (_, i) => {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                return {
                    date: date.toISOString().split('T')[0],
                    energyConsumption: Math.round(Math.random() * 100 + 50),  // 50-150 kWh
                    co2Emission: Math.round(Math.random() * 50 + 20),         // 20-70 kg
                    operationalHours: Math.round(Math.random() * 16 + 4)       // 4-20 小时
                };
            });
            setDeviceData(mockData);
            console.log('设置模拟图表数据:', mockData.length, '条记录');

            // 模拟加载时间
            setTimeout(() => {
                setDataLoading(false);
            }, 500);
        }
    }, [id, timeRange, device]);

    // 删除设备
    const handleDelete = () => {
        if (!id) {
            message.error('设备ID无效');
            return;
        }

        confirm({
            title: '确认删除该设备?',
            icon: <ExclamationCircleOutlined />,
            content: '删除后将无法恢复，是否继续？',
            okText: '确认',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                dispatch(deleteDevice(id)).then(() => {
                    message.success('设备删除成功');
                    navigate('/devices');
                }).catch((error) => {
                    console.error('删除设备失败:', error);
                    message.error('删除设备失败');
                });
            }
        });
    };

    // 编辑设备
    const handleEdit = () => {
        setIsEditModalVisible(true);
    };

    // 刷新设备数据
    const handleRefresh = () => {
        if (id) {
            dispatch(fetchDeviceById(id));
            dispatch(fetchDeviceData({
                deviceId: id,
                params: {
                    startDate: new Date().toISOString(),
                    endDate: new Date().toISOString(),
                    interval: 'daily'
                }
            }));
            message.success('正在刷新设备数据');
        }
    };

    // 返回设备列表
    const handleBack = () => {
        navigate('/devices');
    };

    // 添加更新设备状态功能
    const handleStatusChange = (newStatus: string) => {
        if (id) {
            dispatch(updateDeviceStatus({ deviceId: id, status: newStatus }))
                .then(() => {
                    message.success(`设备状态已更新为: ${newStatus}`);
                })
                .catch((error) => {
                    message.error(`更新设备状态失败: ${error.message}`);
                });
        }
    };

    // 添加图表配置函数 - 碳排放
    const getEmissionChartOption = () => {
        // 使用动态生成的deviceData，而不是静态的mockDeviceData
        const data = deviceData;

        const dates = data.map(item => item.date);
        const co2Values = data.map(item => item.co2Emission);

        return {
            title: {
                text: 'CO2排放量趋势',
                left: 'center',
                textStyle: {
                    fontSize: 16
                }
            },
            tooltip: {
                trigger: 'axis',
                formatter: '{b}<br/>{a}: {c} kg CO₂',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: '#ccc',
                borderWidth: 1,
                textStyle: {
                    color: '#333'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: dates,
                axisLabel: {
                    rotate: 45,
                    formatter: (value: string) => {
                        // 格式化日期显示
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                    }
                },
                axisTick: {
                    alignWithLabel: true
                }
            },
            yAxis: {
                type: 'value',
                name: 'CO₂排放量 (kg)',
                nameTextStyle: {
                    padding: [0, 0, 0, 40]
                },
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                }
            },
            series: [
                {
                    name: 'CO₂排放量',
                    type: 'bar',
                    data: co2Values,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#83bff6' },
                            { offset: 0.5, color: '#52c41a' },
                            { offset: 1, color: '#188033' }
                        ])
                    },
                    emphasis: {
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#5470c6' },
                                { offset: 0.7, color: '#91cc75' },
                                { offset: 1, color: '#52c41a' }
                            ])
                        }
                    },
                    barWidth: '60%',
                    label: {
                        show: false,
                        position: 'top',
                        formatter: '{c} kg'
                    }
                }
            ],
            toolbox: {
                feature: {
                    saveAsImage: {}
                },
                right: 20
            }
        };
    };

    // 添加图表配置函数 - 能源消耗
    const getEnergyConsumptionChartOption = () => {
        // 使用动态生成的deviceData，而不是静态的mockDeviceData
        const data = deviceData;

        const dates = data.map(item => item.date);
        const energyValues = data.map(item => item.energyConsumption);

        return {
            title: {
                text: '能源消耗趋势',
                left: 'center',
                textStyle: {
                    fontSize: 16
                }
            },
            tooltip: {
                trigger: 'axis',
                formatter: '{b}<br/>{a}: {c} kWh',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: '#ccc',
                borderWidth: 1,
                textStyle: {
                    color: '#333'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: dates,
                axisLabel: {
                    rotate: 45,
                    formatter: (value: string) => {
                        // 格式化日期显示
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                    }
                },
                axisTick: {
                    alignWithLabel: true
                }
            },
            yAxis: {
                type: 'value',
                name: '能源消耗 (kWh)',
                nameTextStyle: {
                    padding: [0, 0, 0, 40]
                },
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                }
            },
            series: [
                {
                    name: '能源消耗',
                    type: 'line',
                    smooth: true,
                    data: energyValues,
                    symbol: 'emptyCircle',
                    symbolSize: 8,
                    lineStyle: {
                        width: 3,
                        shadowColor: 'rgba(0,0,0,0.3)',
                        shadowBlur: 10,
                        shadowOffsetY: 8
                    },
                    itemStyle: {
                        color: '#1890ff',
                        borderWidth: 2
                    },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                { offset: 0, color: 'rgba(24, 144, 255, 0.8)' },
                                { offset: 0.5, color: 'rgba(24, 144, 255, 0.4)' },
                                { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
                            ]
                        }
                    },
                    markPoint: {
                        data: [
                            { type: 'max', name: '最大值' },
                            { type: 'min', name: '最小值' }
                        ]
                    }
                }
            ],
            toolbox: {
                feature: {
                    saveAsImage: {}
                },
                right: 20
            }
        };
    };

    // 添加图表配置函数 - 运行时间
    const getOperatingHoursChartOption = () => {
        // 使用动态生成的deviceData，而不是静态的mockDeviceData
        const data = deviceData;

        const dates = data.map(item => item.date);
        const hoursValues = data.map(item => item.operationalHours);

        return {
            title: {
                text: '设备运行时间',
                left: 'center',
                textStyle: {
                    fontSize: 16
                }
            },
            tooltip: {
                trigger: 'axis',
                formatter: '{b}<br/>{a}: {c} 小时',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: '#ccc',
                borderWidth: 1,
                textStyle: {
                    color: '#333'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: dates,
                axisLabel: {
                    rotate: 45,
                    formatter: (value: string) => {
                        // 格式化日期显示
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                    }
                },
                axisTick: {
                    alignWithLabel: true
                }
            },
            yAxis: {
                type: 'value',
                name: '运行时间 (小时)',
                nameTextStyle: {
                    padding: [0, 0, 0, 40]
                },
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                }
            },
            series: [
                {
                    name: '运行时间',
                    type: 'line',
                    step: 'middle',
                    data: hoursValues,
                    lineStyle: {
                        width: 3,
                        color: '#fa8c16'
                    },
                    itemStyle: {
                        color: '#fa8c16',
                        borderWidth: 2
                    },
                    symbol: 'roundRect',
                    symbolSize: 8,
                    markArea: {
                        itemStyle: {
                            color: 'rgba(250, 140, 22, 0.1)'
                        },
                        data: [
                            [
                                { yAxis: 0 },
                                { yAxis: 8 }  // 0-8小时标记为低运行区域
                            ]
                        ]
                    },
                    markLine: {
                        data: [
                            { type: 'average', name: '平均运行' }
                        ],
                        lineStyle: {
                            color: '#ff4d4f',
                            type: 'dashed'
                        },
                        label: {
                            position: 'middle',
                            formatter: '平均: {c} 小时'
                        }
                    }
                }
            ],
            toolbox: {
                feature: {
                    saveAsImage: {}
                },
                right: 20
            }
        };
    };

    // 加载中状态
    if (status === 'loading') {
        return (
            <Card>
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: 16 }}>正在加载设备详情...</p>
                </div>
            </Card>
        );
    }

    // 错误状态
    if (status === 'failed' || reduxError) {
        return (
            <Card>
                <div style={{ padding: '20px 0' }}>
                    <Alert
                        message="获取设备详情失败"
                        description={reduxError || `无法加载ID为 ${id} 的设备信息`}
                        type="error"
                        showIcon
                        action={
                            <Space>
                                <Button size="small" onClick={handleRefresh}>
                                    重试
                                </Button>
                                <Button size="small" type="primary" onClick={handleBack}>
                                    返回列表
                                </Button>
                            </Space>
                        }
                    />
                </div>
            </Card>
        );
    }

    // 空数据状态
    if (!device) {
        return (
            <Card>
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Empty description={
                        <span>没有找到设备信息 {id ? `(ID: ${id})` : ''}</span>
                    } />
                    <div style={{ marginTop: 20 }}>
                        <Button type="primary" onClick={handleBack}>
                            返回设备列表
                        </Button>
                    </div>
                </div>
            </Card>
        );
    }

    // 正常渲染设备详情
    return (
        <div>
            <Card
                title={
                    <Space>
                        <Button
                            type="link"
                            icon={<ArrowLeftOutlined />}
                            onClick={handleBack}
                            style={{ marginLeft: -16 }}
                        >
                            返回
                        </Button>
                        <Divider type="vertical" />
                        <Title level={4} style={{ margin: 0 }}>设备详情</Title>
                    </Space>
                }
                extra={
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                        >
                            刷新
                        </Button>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={handleEdit}
                        >
                            编辑
                        </Button>
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={handleDelete}
                        >
                            删除
                        </Button>
                    </Space>
                }
            >
                <Card title="基本信息" style={{ marginBottom: 16 }}>
                    <Descriptions bordered column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}>
                        <Descriptions.Item label="设备ID">{device.id}</Descriptions.Item>
                        <Descriptions.Item label="设备名称">{device.name}</Descriptions.Item>
                        <Descriptions.Item label="设备类型">
                            <Tag color={getTypeColor(device.type)}>
                                {deviceTypeMap[device.type] || device.type}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="设备状态">
                            <Tag color={getStatusColor(device.status)}>
                                {deviceStatusMap[device.status] || device.status}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="序列号">{device.serialNumber || '-'}</Descriptions.Item>
                        <Descriptions.Item label="位置">{device.location || '-'}</Descriptions.Item>
                        <Descriptions.Item label="制造商">{device.manufacturer || '-'}</Descriptions.Item>
                        <Descriptions.Item label="型号">{device.model || '-'}</Descriptions.Item>
                        <Descriptions.Item label="激活状态">
                            <Tag color={device.isActive ? 'green' : 'red'}>
                                {device.isActive ? '已激活' : '未激活'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="安装日期">
                            {device.installationDate ? new Date(device.installationDate).toLocaleDateString() : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="最后校准日期">
                            {device.lastCalibrationDate ? new Date(device.lastCalibrationDate).toLocaleDateString() : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="创建时间">
                            {device.createdAt ? new Date(device.createdAt).toLocaleString() : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="更新时间">
                            {device.updatedAt ? new Date(device.updatedAt).toLocaleString() : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="描述" span={2}>
                            {device.description || '-'}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card title="能源与排放信息" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="能源类型"
                                    value={device.energyType ? (energyTypeMap[device.energyType] || device.energyType) : '-'}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="功率(W)"
                                    value={device.powerRating || 0}
                                    precision={2}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="排放因子"
                                    value={device.emissionFactor || 0}
                                    precision={2}
                                    suffix="kg CO₂/kWh"
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="容量"
                                    value={device.capacity || 0}
                                    precision={2}
                                    suffix={device.unit || ''}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Card style={{ marginTop: 16 }}>
                        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <Button
                                    type={timeRange === '7d' ? 'primary' : 'default'}
                                    onClick={() => setTimeRange('7d')}
                                    style={{ marginRight: 8 }}
                                >
                                    近7天
                                </Button>
                                <Button
                                    type={timeRange === '30d' ? 'primary' : 'default'}
                                    onClick={() => setTimeRange('30d')}
                                    style={{ marginRight: 8 }}
                                >
                                    近30天
                                </Button>
                                <Button
                                    type={timeRange === '90d' ? 'primary' : 'default'}
                                    onClick={() => setTimeRange('90d')}
                                >
                                    近90天
                                </Button>
                            </div>
                            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                                刷新数据
                            </Button>
                        </div>

                        <Spin spinning={dataLoading}>
                            <Tabs defaultActiveKey="emission">
                                <TabPane tab="碳排放" key="emission">
                                    {deviceData.length > 0 ? (
                                        <ReactECharts option={getEmissionChartOption()} style={{ height: 400 }} />
                                    ) : (
                                        <Empty description="暂无碳排放数据" />
                                    )}
                                </TabPane>
                                <TabPane tab="能源消耗" key="energy">
                                    {deviceData.length > 0 ? (
                                        <ReactECharts option={getEnergyConsumptionChartOption()} style={{ height: 400 }} />
                                    ) : (
                                        <Empty description="暂无能源消耗数据" />
                                    )}
                                </TabPane>
                                <TabPane tab="运行时间" key="hours">
                                    {deviceData.length > 0 ? (
                                        <ReactECharts option={getOperatingHoursChartOption()} style={{ height: 400 }} />
                                    ) : (
                                        <Empty description="暂无运行时间数据" />
                                    )}
                                </TabPane>
                            </Tabs>
                        </Spin>
                    </Card>
                </Card>
            </Card>

            <Modal
                title="编辑设备"
                visible={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <DeviceForm
                    initialValues={device}
                    onSuccess={() => {
                        setIsEditModalVisible(false);
                        if (id) {
                            dispatch(fetchDeviceById(id));
                        }
                        message.success('设备更新成功');
                    }}
                    onCancel={() => setIsEditModalVisible(false)}
                />
            </Modal>
        </div>
    );
};

export default DeviceDetail;