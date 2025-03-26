import React, { useState } from 'react';
import { Card, Row, Col, Button, Statistic, Typography, Space, Tabs, Divider, message, Spin, Alert } from 'antd';
import {
    ReloadOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
    ThunderboltOutlined,
    AppstoreAddOutlined,
    BarChartOutlined,
    ClockCircleOutlined,
    SyncOutlined
} from '@ant-design/icons';
import { useAppDispatch } from '../../../hooks/reduxHooks';
import { useSelector } from 'react-redux';
import {
    fetchMockStatus,
    startMockGeneration,
    stopMockGeneration,
    generateRandomDevices,
    generateLogisticsDevices,
    simulateScenario,
    selectMockSystemStatus,
    selectIoTMockDevices,
    selectIoTMockStatus,
    selectIoTMockError
} from '../../../store/slices/iotMockSlice';
import DeviceGeneratorForm from '../components/DeviceGeneratorForm';
import ScenarioForm from '../components/ScenarioForm';
import TimePatternForm from '../components/TimePatternForm';
import TaskList from '../components/TaskList';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const IoTMockDashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const mockStatus = useSelector(selectMockSystemStatus);
    const devices = useSelector(selectIoTMockDevices);
    const status = useSelector(selectIoTMockStatus);
    const error = useSelector(selectIoTMockError);

    const [activeTab, setActiveTab] = useState('dashboard');

    const isLoading = status === 'loading';
    const isRunning = mockStatus?.status === 'running' || mockStatus?.isRunning || false;

    // 启动模拟数据生成
    const handleStart = () => {
        dispatch(startMockGeneration())
            .then(() => {
                message.success('已启动IoT数据模拟系统');
                // 获取最新状态
                dispatch(fetchMockStatus());
            })
            .catch(err => {
                message.error('启动模拟系统失败: ' + (err.message || '未知错误'));
                // 即使失败也刷新一次状态
                dispatch(fetchMockStatus());
            });
    };

    // 停止模拟数据生成
    const handleStop = () => {
        dispatch(stopMockGeneration())
            .then(() => {
                message.success('已停止IoT数据模拟系统');
                // 获取最新状态
                dispatch(fetchMockStatus());
            })
            .catch(err => {
                message.error('停止模拟系统失败: ' + (err.message || '未知错误'));
                // 即使失败也刷新一次状态
                dispatch(fetchMockStatus());
            });
    };

    // 刷新状态
    const handleRefresh = () => {
        dispatch(fetchMockStatus());
        message.info('正在刷新数据...');
    };

    // 快速生成随机设备
    const handleQuickGenerate = () => {
        dispatch(generateRandomDevices({ count: 10 }))
            .then(() => {
                message.success('已触发随机设备生成任务');
                setTimeout(() => dispatch(fetchMockStatus()), 1000);
            })
            .catch(err => {
                message.error('生成随机设备失败');
            });
    };

    // 快速生成物流设备
    const handleGenerateLogistics = () => {
        dispatch(generateLogisticsDevices({ count: 5 }))
            .then(() => {
                message.success('已触发物流设备生成任务');
                setTimeout(() => dispatch(fetchMockStatus()), 1000);
            })
            .catch(err => {
                message.error('生成物流设备失败');
            });
    };

    // 快速模拟车辆进入场景
    const handleSimulateVehicleEntry = () => {
        dispatch(simulateScenario({
            scenarioType: 'vehicle-entry',
            params: { duration: 30, intensity: 'medium' }
        }))
            .then(() => {
                message.success('已触发车辆进入场景模拟');
            })
            .catch(err => {
                message.error('模拟场景失败');
            });
    };

    // 快速模拟工作日高峰模式
    const handleSimulateWorkdayPeak = () => {
        dispatch(simulateScenario({
            scenarioType: 'workday-peak',
            params: { duration: 60 }
        }))
            .then(() => {
                message.success('已触发工作日高峰模式模拟');
            })
            .catch(err => {
                message.error('模拟工作日高峰模式失败');
            });
    };

    return (
        <div className="iot-mock-dashboard">
            <Card
                title={
                    <Space>
                        <Title level={4} style={{ margin: 0 }}>IoT数据模拟系统</Title>
                        {isLoading && <Spin size="small" />}
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
                        {isRunning ? (
                            <Button
                                danger
                                icon={<PauseCircleOutlined />}
                                onClick={handleStop}
                            >
                                停止模拟
                            </Button>
                        ) : (
                            <Button
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                onClick={handleStart}
                            >
                                启动模拟
                            </Button>
                        )}
                    </Space>
                }
            >
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="控制面板" key="dashboard">
                        {error && (
                            <Alert
                                message="获取数据失败"
                                description={error}
                                type="error"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />
                        )}

                        <Row gutter={[16, 16]}>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="模拟系统状态"
                                        value={isRunning ? "运行中" : "已停止"}
                                        valueStyle={{ color: isRunning ? '#3f8600' : '#cf1322' }}
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="模拟设备数量"
                                        value={mockStatus?.activeDevices || mockStatus?.deviceCount || devices.length || 0}
                                        suffix="个"
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="数据上传"
                                        value={mockStatus?.recentDataUploads || mockStatus?.dataPointsGenerated || 0}
                                        suffix="个"
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="运行时间"
                                        value={mockStatus?.uptime || 0}
                                        suffix="秒"
                                    />
                                </Card>
                            </Col>
                        </Row>

                        <Divider orientation="left">快速操作</Divider>

                        <Row gutter={[16, 16]}>
                            <Col span={6}>
                                <Card hoverable onClick={handleQuickGenerate}>
                                    <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
                                        <AppstoreAddOutlined style={{ fontSize: 24 }} />
                                        <div>生成随机设备</div>
                                    </Space>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card hoverable onClick={handleGenerateLogistics}>
                                    <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
                                        <ThunderboltOutlined style={{ fontSize: 24 }} />
                                        <div>生成物流设备</div>
                                    </Space>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card hoverable onClick={handleSimulateVehicleEntry}>
                                    <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
                                        <BarChartOutlined style={{ fontSize: 24 }} />
                                        <div>模拟车辆进入</div>
                                    </Space>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card hoverable onClick={handleSimulateWorkdayPeak}>
                                    <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
                                        <ClockCircleOutlined style={{ fontSize: 24 }} />
                                        <div>工作日高峰模式</div>
                                    </Space>
                                </Card>
                            </Col>
                        </Row>

                        <Divider orientation="left">系统状态</Divider>

                        <Card>
                            {mockStatus ? (
                                <>
                                    <Paragraph>
                                        <strong>最后更新时间：</strong> {mockStatus?.lastUpdate ? new Date(mockStatus.lastUpdate).toLocaleString() : (mockStatus?.timestamp ? new Date(mockStatus.timestamp).toLocaleString() : '未知')}
                                    </Paragraph>
                                    <Paragraph>
                                        <strong>错误信息：</strong> {mockStatus?.errors?.length ? mockStatus.errors.join(', ') : '无错误'}
                                    </Paragraph>
                                </>
                            ) : (
                                <Paragraph>
                                    <Button type="primary" onClick={handleRefresh}>
                                        获取系统状态
                                    </Button>
                                </Paragraph>
                            )}
                        </Card>
                    </TabPane>

                    <TabPane tab="设备生成" key="device-generator">
                        <DeviceGeneratorForm />
                    </TabPane>

                    <TabPane tab="场景模拟" key="scenario">
                        <ScenarioForm />
                    </TabPane>

                    <TabPane tab="时间模式" key="time-pattern">
                        <TimePatternForm />
                    </TabPane>

                    <TabPane tab="任务监控" key="tasks">
                        <TaskList />
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default IoTMockDashboard; 