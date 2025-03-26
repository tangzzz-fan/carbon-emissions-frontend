import React, { useState } from 'react';
import { Form, Input, Button, Select, InputNumber, Card, Row, Col, Alert, message, Divider } from 'antd';
import { useAppDispatch } from '../../../hooks/reduxHooks';
import { generateRandomDevices, generateLogisticsDevices, generateBasicDevices } from '../../../store/slices/iotMockSlice';

const { Option } = Select;

const DeviceGeneratorForm: React.FC = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [generatorType, setGeneratorType] = useState('random');

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            let result;
            switch (generatorType) {
                case 'random':
                    result = await dispatch(generateRandomDevices(values)).unwrap();
                    break;
                case 'logistics':
                    result = await dispatch(generateLogisticsDevices(values)).unwrap();
                    break;
                case 'basic':
                    result = await dispatch(generateBasicDevices(values)).unwrap();
                    break;
                default:
                    throw new Error('未知生成器类型');
            }
            message.success(`成功触发${values.count}个设备的生成任务`);
            form.resetFields();
        } catch (error: any) {
            message.error(`生成设备失败: ${error.message || '未知错误'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="设备生成器">
            <Alert
                message="设备生成说明"
                description="此功能用于生成模拟设备数据。您可以选择不同类型的生成器，并设置参数来生成符合需求的测试设备。"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <Divider orientation="left">选择生成器类型</Divider>

            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                    <Card
                        hoverable
                        className={generatorType === 'random' ? 'selected-card' : ''}
                        onClick={() => setGeneratorType('random')}
                        style={{ borderColor: generatorType === 'random' ? '#1890ff' : undefined }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <h3>随机设备生成器</h3>
                            <p>生成各种类型的随机设备</p>
                        </div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card
                        hoverable
                        className={generatorType === 'logistics' ? 'selected-card' : ''}
                        onClick={() => setGeneratorType('logistics')}
                        style={{ borderColor: generatorType === 'logistics' ? '#1890ff' : undefined }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <h3>物流专用设备</h3>
                            <p>生成物流行业专用的设备</p>
                        </div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card
                        hoverable
                        className={generatorType === 'basic' ? 'selected-card' : ''}
                        onClick={() => setGeneratorType('basic')}
                        style={{ borderColor: generatorType === 'basic' ? '#1890ff' : undefined }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <h3>基础设备生成器</h3>
                            <p>生成基础设施类设备</p>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">设置参数</Divider>

            <Form
                form={form}
                name="deviceGenerator"
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ count: 10 }}
            >
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="count"
                            label="设备数量"
                            rules={[{ required: true, message: '请输入要生成的设备数量' }]}
                        >
                            <InputNumber min={1} max={100} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            name="type"
                            label="设备类型"
                        >
                            <Select placeholder="选择设备类型（可选）">
                                <Option value="truck">卡车</Option>
                                <Option value="forklift">叉车</Option>
                                <Option value="packaging">包装设备</Option>
                                <Option value="lighting">照明设备</Option>
                                <Option value="GATE">闸机</Option>
                                <Option value="CAMERA">摄像头</Option>
                                <Option value="WEIGHT_SCALE">称重设备</Option>
                                <Option value="SECURITY">安防设备</Option>
                                <Option value="CHARGING_STATION">充电站</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            name="template"
                            label="数据模板"
                        >
                            <Select placeholder="选择数据模板（可选）">
                                <Option value="standard">标准模板</Option>
                                <Option value="highload">高负载模板</Option>
                                <Option value="fault">故障模板</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {generatorType === 'random' && (
                    <Form.Item
                        name="randomSeed"
                        label="随机种子 (可选)"
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                )}

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        生成设备
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default DeviceGeneratorForm; 