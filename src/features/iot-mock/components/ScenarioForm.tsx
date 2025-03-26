import React, { useState } from 'react';
import { Form, Button, Select, InputNumber, Card, Row, Col, Alert, message, Divider, DatePicker, Space, Collapse } from 'antd';
import { useAppDispatch } from '../../../hooks/reduxHooks';
import { simulateScenario } from '../../../store/slices/iotMockSlice';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

const scenarioOptions = [
    { value: 'vehicle-entry', label: '车辆进入场景' },
    { value: 'loading', label: '货物装卸场景' },
    { value: 'carbon-peak', label: '碳排放高峰场景' },
    { value: 'carbon-reduction', label: '碳减排场景' },
    { value: 'loading/async', label: '异步装卸场景(后台执行)' }
];

const ScenarioForm: React.FC = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [scenarioType, setScenarioType] = useState<string>('vehicle-entry');

    const handleSubmit = async (values: any) => {
        setLoading(true);

        // 处理日期范围
        let params = { ...values };
        if (values.timeRange) {
            params.startTime = values.timeRange[0].toISOString();
            params.endTime = values.timeRange[1].toISOString();
            delete params.timeRange;
        }

        try {
            await dispatch(simulateScenario({
                scenarioType: scenarioType,
                params
            })).unwrap();

            message.success(`成功触发"${scenarioOptions.find(s => s.value === scenarioType)?.label}"场景模拟`);
        } catch (error: any) {
            message.error(`模拟场景失败: ${error.message || '未知错误'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="场景模拟器">
            <Alert
                message="场景模拟说明"
                description="此功能用于模拟物流园区中的不同业务场景，生成对应的设备数据。选择场景类型并设置相关参数后，系统将生成符合该场景的设备活动数据。"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <Divider orientation="left">选择场景类型</Divider>

            <Row gutter={16} style={{ marginBottom: 16 }}>
                {scenarioOptions.map(scenario => (
                    <Col span={Math.floor(24 / scenarioOptions.length)} key={scenario.value}>
                        <Card
                            hoverable
                            className={scenarioType === scenario.value ? 'selected-card' : ''}
                            onClick={() => setScenarioType(scenario.value)}
                            style={{ borderColor: scenarioType === scenario.value ? '#1890ff' : undefined }}
                        >
                            <div style={{ textAlign: 'center' }}>
                                <h3>{scenario.label}</h3>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Divider orientation="left">场景参数配置</Divider>

            <Form
                form={form}
                name="scenarioForm"
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    duration: 30,
                    intensity: 'medium',
                    deviceCount: 5
                }}
            >
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="duration"
                            label="场景持续时间(分钟)"
                            rules={[{ required: true, message: '请输入场景持续时间' }]}
                        >
                            <InputNumber min={1} max={1440} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            name="intensity"
                            label="场景强度"
                            rules={[{ required: true, message: '请选择场景强度' }]}
                        >
                            <Select>
                                <Option value="low">低强度</Option>
                                <Option value="medium">中等强度</Option>
                                <Option value="high">高强度</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            name="deviceCount"
                            label="涉及设备数量"
                            rules={[{ required: true, message: '请输入涉及设备数量' }]}
                        >
                            <InputNumber min={1} max={100} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="timeRange"
                    label="时间范围(可选)"
                >
                    <RangePicker showTime style={{ width: '100%' }} />
                </Form.Item>

                <Collapse ghost>
                    <Panel header="高级选项" key="advanced">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="deviceTypes"
                                    label="设备类型(可选)"
                                >
                                    <Select mode="multiple" placeholder="选择设备类型">
                                        <Option value="truck">卡车</Option>
                                        <Option value="forklift">叉车</Option>
                                        <Option value="packaging">包装设备</Option>
                                        <Option value="lighting">照明设备</Option>
                                        <Option value="GATE">闸机</Option>
                                        <Option value="CAMERA">摄像头</Option>
                                        <Option value="WEIGHT_SCALE">称重设备</Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    name="randomFactor"
                                    label="随机因子 (0-1)"
                                >
                                    <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Panel>
                </Collapse>

                <Form.Item style={{ marginTop: 16 }}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        启动场景模拟
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default ScenarioForm; 