import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
    Statistic
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import {
    fetchDeviceById,
    deleteDevice,
    selectSelectedDevice,
    selectDevicesStatus
} from '../../../store/slices/deviceSlice';
import DeviceForm from '../components/DeviceForm';
import ReactECharts from 'echarts-for-react';
import * as deviceService from '../../../services/device.service';

const { TabPane } = Tabs;
const { confirm } = Modal;

interface DeviceData {
    date: string;
    energyConsumption: number;
    co2Emission: number;
    operationalHours: number;
}

const DeviceDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const deviceId = Number(id);

    const device = useSelector(selectSelectedDevice);
    const status = useSelector(selectDevicesStatus);

    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
    const [dataLoading, setDataLoading] = useState(false);
    const [timeRange, setTimeRange] = useState('7d');

    // 获取设备详情
    useEffect(() => {
        if (deviceId) {
            dispatch(fetchDeviceById(deviceId));
        }
    }, [dispatch, deviceId]);

    // 获取设备数据
    useEffect(() => {
        if (deviceId) {
            fetchDeviceData();
        }
    }, [deviceId, timeRange]);

    const fetchDeviceData = async () => {
        try {
            setDataLoading(true);
            const now = new Date();
            let startDate = new Date();

            if (timeRange === '7d') {
                startDate.setDate(now.getDate() - 7);
            } else if (timeRange === '30d') {
                startDate.setDate(now.getDate() - 30);
            } else if (timeRange === '90d') {
                startDate.setDate(now.getDate() - 90);
            }

            const response = await deviceService.getDeviceData(deviceId, {
                startDate: startDate.toISOString(),
                endDate: now.toISOString(),
                interval: 'daily'
            });

            setDeviceData(response.data.data);
        } catch (error) {
            message.error('获取设备数据失败');
        } finally {
            setDataLoading(false);
        }
    };

    // 删除设备
    const handleDelete = () => {
        confirm({
            title: '确认删除该设备?',
            icon: <ExclamationCircleOutlined />,
            content: '删除后将无法恢复，是否继续？',
            okText: '确认',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                dispatch(deleteDevice(deviceId)).then(() => {
                    message.success('设备删除成功');
                    navigate('/devices');
                });
            }
        });
    };

    // 设备状态对应的Tag颜色
    const getStatusTag = (status: string) => {
        switch (status) {
            case 'active':
                return <Tag color="green">正常</Tag>;
            case 'inactive':
                return <Tag color="volcano">离线</Tag>;
            case 'maintenance':
                return <Tag color="gold">维护中</Tag>;
            default:
                return <Tag>未知</Tag>;
        }
    };

    // 碳排放趋势图表配置
    const getEmissionChartOption = () => {
        const dates = deviceData.map(item => item.date);
        const emissions = deviceData.map(item => item.co2Emission);

        return {
            title: {
                text: '碳排放趋势',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
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
                    smooth: true,
                    lineStyle: {
                        width: 3
                    },
                    areaStyle: {
                        opacity: 0.2
                    },
                    markPoint: {
                        data: [
                            { type: 'max', name: '最大值' },
                            { type: 'min', name: '最小值' }
                        ]
                    }
                }
            ]
        };
    };

    // 能耗图表配置
    const getEnergyChartOption = () => {
        const dates = deviceData.map(item => item.date);
        const energy = deviceData.map(item => item.energyConsumption);

        return {
            title: {
                text: '能源消耗趋势',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: dates
            },
            yAxis: {
                type: 'value',
                name: '能源消耗 (kWh)'
            },
            series: [
                {
                    name: '能源消耗',
                    type: 'bar',
                    data: energy,
                    itemStyle: {
                        color: '#5470c6'
                    }
                }
            ]
        };
    };

    // 运行时间图表配置
    const getOperatingHoursChartOption = () => {
        const dates = deviceData.map(item => item.date);
        const hours = deviceData.map(item => item.operationalHours);

        return {
            title: {
                text: '运行时间趋势',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: dates
            },
            yAxis: {
                type: 'value',
                name: '运行时间 (小时)'
            },
            series: [
                {
                    name: '运行时间',
                    type: 'line',
                    data: hours,
                    smooth: true
                }
            ]
        };
    };

    if (status === 'loading') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                <Spin size="large" tip="加载中..." />
            </div>
        );
    }

    if (!device) {
        return <Empty description="没有找到设备信息" />;
    }

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <h2>{device.name} - 设备详情</h2>
                <div>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        style={{ marginRight: 8 }}
                        onClick={() => setIsEditModalVisible(true)}
                    >
                        编辑
                    </Button>
                    <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                        删除
                    </Button>
                </div>
            </div>

            <Card>
                <Descriptions title="基本信息" bordered column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                    <Descriptions.Item label="设备名称">{device.name}</Descriptions.Item>
                    <Descriptions.Item label="设备类型">{device.type}</Descriptions.Item>
                    <Descriptions.Item label="状态">{getStatusTag(device.status)}</Descriptions.Item>
                    <Descriptions.Item label="位置">{device.location}</Descriptions.Item>
                    <Descriptions.Item label="制造商">{device.manufacturer}</Descriptions.Item>
                    <Descriptions.Item label="型号">{device.model}</Descriptions.Item>
                    <Descriptions.Item label="序列号">{device.serialNumber}</Descriptions.Item>
                    <Descriptions.Item label="安装日期">{device.installationDate}</Descriptions.Item>
                    <Descriptions.Item label="最后维护日期">
                        {device.lastMaintenanceDate || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="描述" span={3}>
                        {device.description || '-'}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

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
                    <Button icon={<ReloadOutlined />} onClick={fetchDeviceData}>
                        刷新数据
                    </Button>
                </div>

                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={8}>
                        <Card>
                            <Statistic
                                title="平均碳排放量"
                                value={deviceData.length > 0 ? deviceData.reduce((sum, item) => sum + item.co2Emission, 0) / deviceData.length : 0}
                                precision={2}
                                suffix="kg/天"
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card>
                            <Statistic
                                title="平均能源消耗"
                                value={deviceData.length > 0 ? deviceData.reduce((sum, item) => sum + item.energyConsumption, 0) / deviceData.length : 0}
                                precision={2}
                                suffix="kWh/天"
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card>
                            <Statistic
                                title="平均运行时间"
                                value={deviceData.length > 0 ? deviceData.reduce((sum, item) => sum + item.operationalHours, 0) / deviceData.length : 0}
                                precision={1}
                                suffix="小时/天"
                            />
                        </Card>
                    </Col>
                </Row>

                <Spin spinning={dataLoading}>
                    <Tabs defaultActiveKey="emission">
                        <TabPane tab="碳排放" key="emission">
                            {deviceData.length > 0 ? (
                                <ReactECharts option={getEmissionChartOption()} style={{ height: 400 }} />
                            ) : (
                                <Empty description="暂无数据" />
                            )}
                        </TabPane>
                        <TabPane tab="能源消耗" key="energy">
                            {deviceData.length > 0 ? (
                                <ReactECharts option={getEnergyChartOption()} style={{ height: 400 }} />
                            ) : (
                                <Empty description="暂无数据" />
                            )}
                        </TabPane>
                        <TabPane tab="运行时间" key="hours">
                            {deviceData.length > 0 ? (
                                <ReactECharts option={getOperatingHoursChartOption()} style={{ height: 400 }} />
                            ) : (
                                <Empty description="暂无数据" />
                            )}
                        </TabPane>
                    </Tabs>
                </Spin>
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
                        dispatch(fetchDeviceById(deviceId));
                        message.success('设备更新成功');
                    }}
                    onCancel={() => setIsEditModalVisible(false)}
                />
            </Modal>
        </div>
    );
};

export default DeviceDetail; 