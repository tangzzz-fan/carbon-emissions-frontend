import React, { useEffect, useState } from 'react';
import { Table, Card, Badge, Tag, Space, Button, Progress, Typography, Alert } from 'antd';
import { SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../../../hooks/reduxHooks';
import { useSelector } from 'react-redux';
import { fetchTaskStatus, selectIoTMockTasks } from '../../../store/slices/iotMockSlice';
import { IoTMockTask } from '../../../types/iotMock';

const { Text } = Typography;

const TaskList: React.FC = () => {
    const dispatch = useAppDispatch();
    const tasks = useSelector(selectIoTMockTasks);
    const [loading, setLoading] = useState(false);
    const [polling, setPolling] = useState(false);
    const [pollingInterval, setPollingIntervalState] = useState<number | null>(null);

    // 格式化任务类型
    const formatTaskType = (type: string) => {
        const typeMap: Record<string, string> = {
            'generate-random': '随机设备生成',
            'generate-logistics': '物流设备生成',
            'generate-basic': '基础设备生成',
            'vehicle-entry': '车辆进入场景',
            'loading': '货物装卸场景',
            'carbon-peak': '碳排放高峰场景',
            'carbon-reduction': '碳减排场景',
            'loading/async': '异步装卸场景',
            'workday-peak': '工作日高峰模式',
            'night': '夜间模式',
        };

        return typeMap[type] || type;
    };

    // 启动轮询
    const startPolling = () => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
        }

        setPolling(true);

        // 获取进行中的任务
        const runningTasks = tasks.filter(task => task.status === 'running' || task.status === 'pending');

        // 如果有运行中的任务，每2秒更新一次状态
        if (runningTasks.length > 0) {
            const interval = setInterval(() => {
                runningTasks.forEach(task => {
                    dispatch(fetchTaskStatus(task.id));
                });
            }, 2000);

            setPollingIntervalState(interval);
        } else {
            setPolling(false);
        }
    };

    // 停止轮询
    const stopPolling = () => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingIntervalState(null);
        }
        setPolling(false);
    };

    // 刷新所有任务状态
    const refreshAllTasks = () => {
        setLoading(true);
        Promise.all(tasks.map(task => dispatch(fetchTaskStatus(task.id))))
            .finally(() => {
                setLoading(false);
            });
    };

    // 组件卸载时清除轮询
    useEffect(() => {
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [pollingInterval]);

    // 任务状态标签
    const getStatusTag = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge status="warning" text="等待中" />;
            case 'running':
                return <Badge status="processing" text="执行中" />;
            case 'completed':
                return <Badge status="success" text="已完成" />;
            case 'failed':
                return <Badge status="error" text="失败" />;
            default:
                return <Badge status="default" text={status} />;
        }
    };

    // 表格列定义
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            ellipsis: true,
            width: 220,
        },
        {
            title: '任务类型',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => formatTaskType(type)
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => getStatusTag(status)
        },
        {
            title: '进度',
            dataIndex: 'progress',
            key: 'progress',
            render: (progress: number, record: IoTMockTask) => (
                <Progress
                    percent={progress}
                    size="small"
                    status={
                        record.status === 'failed' ? 'exception' :
                            record.status === 'completed' ? 'success' : 'active'
                    }
                />
            )
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (time: string) => new Date(time).toLocaleString()
        },
        {
            title: '完成时间',
            dataIndex: 'completedAt',
            key: 'completedAt',
            render: (time: string) => time ? new Date(time).toLocaleString() : '-'
        },
        {
            title: '操作',
            key: 'action',
            render: (text: string, record: IoTMockTask) => (
                <Space size="small">
                    <Button
                        type="text"
                        size="small"
                        icon={<SyncOutlined />}
                        onClick={() => dispatch(fetchTaskStatus(record.id))}
                    >
                        刷新
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title="任务监控"
            extra={
                <Space>
                    <Button
                        icon={<SyncOutlined />}
                        onClick={refreshAllTasks}
                        loading={loading}
                    >
                        刷新所有
                    </Button>
                    <Button
                        type={polling ? 'primary' : 'default'}
                        onClick={polling ? stopPolling : startPolling}
                    >
                        {polling ? '停止自动刷新' : '自动刷新'}
                    </Button>
                </Space>
            }
        >
            {tasks.length === 0 ? (
                <Alert
                    message="暂无任务"
                    description="尚未执行任何数据生成或模拟任务"
                    type="info"
                    showIcon
                />
            ) : (
                <Table
                    columns={columns}
                    dataSource={tasks}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    expandable={{
                        expandedRowRender: record => (
                            <div style={{ padding: '0 48px' }}>
                                {record.error && (
                                    <Alert
                                        message="错误信息"
                                        description={record.error}
                                        type="error"
                                        showIcon
                                    />
                                )}
                                {record.result && (
                                    <div>
                                        <Text strong>执行结果:</Text>
                                        <pre>{JSON.stringify(record.result, null, 2)}</pre>
                                    </div>
                                )}
                            </div>
                        ),
                    }}
                />
            )}
        </Card>
    );
};

export default TaskList; 