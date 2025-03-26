import React, { useState } from 'react';
import { Form, Button, Select, InputNumber, Card, Row, Col, Alert, message, Divider, TimePicker, Switch, Space } from 'antd';
import { useAppDispatch } from '../../../hooks/reduxHooks';
import { simulateScenario } from '../../../store/slices/iotMockSlice';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = TimePicker;

const timePatternOptions = [
    { value: 'workday-peak', label: '工作日高峰模式' },
    { value: 'night', label: '夜间模式' }
];

const TimePatternForm: React.FC = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [patternType, setPatternType] = useState<string>('workday-peak');
    const [isRecurring, setIsRecurring] = useState(false);

    const handleSubmit = async (values: any) => {
        setLoading(true);

        // 处理时间范围
        let params = { ...values };
        if (values.timeRange) {
            params.startTime = values.timeRange[0].format('HH:mm');
            params.endTime = values.timeRange[1].format('HH:mm');
            delete params.timeRange;
        }

        // 添加是否循环参数
        params.recurring = isRecurring;

        try {
            await dispatch(simulateScenario({
                scenarioType: patternType,
                params
            })).unwrap();

            message.success(`成功触发"${timePatternOptions.find(p => p.value === patternType)?.label}"时间模式`);
        } catch (error: any) {
            message.error(`设置时间模式失败: ${error.message || '未知错误'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="时间模式设置">
            <Alert
                message="时间模式说明"
                description="此功能用于设置基于时间的数据模拟模式，比如工作日高峰、夜间模式等。系统将根据所选模式在特定时间段内产生相应的数据模式。"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <Divider orientation="left">选择时间模式</Divider>

            <Row gutter={16} style={{ marginBottom: 16 }}>
                {timePatternOptions.map(pattern => (
                    <Col span={12} key={pattern.value}>
                        <Card
                            hoverable
                            className={patternType === pattern.value ? 'selected-card' : ''}
                            onClick={() => setPatternType(pattern.value)}
                            style={{ borderColor: patternType === pattern.value ? '#1890ff' : undefined }}
                        >
                            <div style={{ textAlign: 'center' }}>
                                <h3>{pattern.label}</h3>
                                <p>{pattern.value === 'workday-peak' ? '模拟工作日早晚高峰时段的数据特征' : '模拟夜间低活动时段的数据特征'}</p>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Divider orientation="left">模式参数配置</Divider>

            <Form
                form={form}
                name="timePatternForm"
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    duration: 60,
                    intensity: patternType === 'workday-peak' ? 'high' : 'low'
                }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="duration"
                            label="持续时间(分钟)"
                            rules={[{ required: true, message: '请输入持续时间' }]}
                        >
                            <InputNumber min={5} max={1440} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="intensity"
                            label="数据强度"
                            rules={[{ required: true, message: '请选择数据强度' }]}
                        >
                            <Select>
                                <Option value="low">低强度</Option>
                                <Option value="medium">中等强度</Option>
                                <Option value="high">高强度</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="timeRange"
                    label="时间段设置"
                >
                    <RangePicker format="HH:mm" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item label="循环模式">
                    <Switch
                        checked={isRecurring}
                        onChange={setIsRecurring}
                        checkedChildren="开启"
                        unCheckedChildren="关闭"
                    />
                    <span style={{ marginLeft: 8 }}>
                        {isRecurring ? '每天在设定时间自动启动此模式' : '仅运行一次'}
                    </span>
                </Form.Item>

                {patternType === 'workday-peak' && (
                    <Form.Item
                        name="peakType"
                        label="高峰类型"
                    >
                        <Select defaultValue="both">
                            <Option value="morning">早高峰</Option>
                            <Option value="evening">晚高峰</Option>
                            <Option value="both">早晚高峰</Option>
                        </Select>
                    </Form.Item>
                )}

                <Form.Item style={{ marginTop: 16 }}>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            应用时间模式
                        </Button>
                        {isRecurring && (
                            <Button danger onClick={() => {
                                dispatch(simulateScenario({
                                    scenarioType: `${patternType}/cancel`,
                                    params: {}
                                }));
                                message.success('已取消循环模式');
                            }}>
                                取消循环模式
                            </Button>
                        )}
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default TimePatternForm; 