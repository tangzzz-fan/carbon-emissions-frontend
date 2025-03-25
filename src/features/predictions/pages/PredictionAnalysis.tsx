import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Select, DatePicker, Tabs, Spin, Alert, Radio, Space, InputNumber, Table, message } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, ReloadOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import api from '../../../services/api';
import { PredictionModel, PredictionResult } from '../../../types/prediction';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface PredictionParameters {
    modelId: number;
    startDate: string;
    endDate: string;
    interval: 'daily' | 'weekly' | 'monthly';
    includeConfidenceInterval: boolean;
    factors?: string[];
}

const PredictionAnalysis: React.FC = () => {
    const [form] = Form.useForm();
    const [models, setModels] = useState<PredictionModel[]>([]);
    const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
    const [loadingModels, setLoadingModels] = useState(false);
    const [loadingPrediction, setLoadingPrediction] = useState(false);
    const [chartType, setChartType] = useState<'line' | 'bar'>('line');
    const [showHistorical, setShowHistorical] = useState(true);
    const [historicalData, setHistoricalData] = useState<any[]>([]);
    const [accuracyData, setAccuracyData] = useState<any[]>([]);

    // 获取预测模型列表
    useEffect(() => {
        fetchPredictionModels();
    }, []);

    const fetchPredictionModels = async () => {
        try {
            setLoadingModels(true);
            const response = await api.get('/predictions/models');
            setModels(response.data);
        } catch (error) {
            message.error('获取预测模型失败');
        } finally {
            setLoadingModels(false);
        }
    };

    // 获取历史数据（用于对比）
    const fetchHistoricalData = async (startDate: string, endDate: string, interval: string) => {
        try {
            const response = await api.get('/emissions/historical', {
                params: { startDate, endDate, interval }
            });
            setHistoricalData(response.data);
        } catch (error) {
            message.error('获取历史数据失败');
        }
    };

    // 提交预测请求
    const handleSubmit = async (values: any) => {
        const { modelId, dateRange, interval, includeConfidenceInterval, factors } = values;

        if (!dateRange || dateRange.length !== 2) {
            message.error('请选择有效的日期范围');
            return;
        }

        const params: PredictionParameters = {
            modelId,
            startDate: dateRange[0].format('YYYY-MM-DD'),
            endDate: dateRange[1].format('YYYY-MM-DD'),
            interval: interval || 'daily',
            includeConfidenceInterval: includeConfidenceInterval || false,
            factors
        };

        try {
            setLoadingPrediction(true);
            const response = await api.post('/predictions/analyze', params);
            setPredictionResult(response.data);

            // 获取对应的历史数据用于对比
            if (showHistorical) {
                await fetchHistoricalData(params.startDate, params.endDate, params.interval);
            }

            // 获取准确度分析数据
            await fetchAccuracyData(response.data.id);
        } catch (error) {
            message.error('预测分析失败');
        } finally {
            setLoadingPrediction(false);
        }
    };

    // 获取准确度分析数据
    const fetchAccuracyData = async (predictionId: number) => {
        try {
            const response = await api.get(`/predictions/${predictionId}/accuracy`);
            setAccuracyData(response.data);
        } catch (error) {
            message.error('获取准确度分析失败');
        }
    };

    // 构建预测结果图表选项
    const getPredictionChartOption = () => {
        if (!predictionResult) return {};

        const dates = predictionResult.results.map(item => item.date);
        const predictions = predictionResult.results.map(item => item.predictedCo2);
        const lowerBounds = predictionResult.results.map(item => item.lowerBound);
        const upperBounds = predictionResult.results.map(item => item.upperBound);
        const historical = historicalData.map(item => item.co2Emission);

        const series: any[] = [
            {
                name: '预测碳排放量',
                type: chartType,
                data: predictions,
                smooth: chartType === 'line',
                itemStyle: {
                    color: '#5470c6'
                },
                markPoint: chartType === 'line' ? {
                    data: [
                        { type: 'max', name: '最大值' },
                        { type: 'min', name: '最小值' }
                    ]
                } : undefined
            }
        ];

        if (showHistorical && historical.length > 0) {
            series.push({
                name: '历史碳排放量',
                type: 'line',
                data: historical,
                smooth: true,
                itemStyle: {
                    color: '#91cc75'
                }
            });
        }

        if (predictionResult.results[0].lowerBound !== undefined && predictionResult.results[0].upperBound !== undefined) {
            series.push({
                name: '置信区间',
                type: 'line',
                data: lowerBounds,
                lineStyle: {
                    opacity: 0
                },
                stack: 'confidence',
                symbol: 'none'
            });
            series.push({
                name: '置信区间',
                type: 'line',
                data: upperBounds,
                lineStyle: {
                    opacity: 0
                },
                areaStyle: {
                    color: '#5470c6',
                    opacity: 0.2
                },
                stack: 'confidence',
                symbol: 'none'
            });
        }

        return {
            title: {
                text: '碳排放预测分析',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['预测碳排放量', '历史碳排放量', '置信区间'],
                bottom: 0
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                top: '10%',
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
            series
        };
    };

    // 准确度分析图表选项
    const getAccuracyChartOption = () => {
        if (!accuracyData || accuracyData.length === 0) return {};

        const metrics = accuracyData.map(item => item.metric);
        const values = accuracyData.map(item => item.value);
        const colors = values.map(value => {
            if (value >= 80) return '#52c41a';
            if (value >= 60) return '#faad14';
            return '#f5222d';
        });

        return {
            title: {
                text: '预测模型准确度分析',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                formatter: '{b}: {c}%'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: metrics
            },
            yAxis: {
                type: 'value',
                name: '准确度 (%)',
                max: 100
            },
            series: [
                {
                    type: 'bar',
                    data: values.map((value, index) => ({
                        value,
                        itemStyle: {
                            color: colors[index]
                        }
                    })),
                    label: {
                        show: true,
                        position: 'top',
                        formatter: '{c}%'
                    }
                }
            ]
        };
    };

    // 准确度比较表格列
    const accuracyColumns = [
        {
            title: '指标',
            dataIndex: 'metric',
            key: 'metric'
        },
        {
            title: '值',
            dataIndex: 'value',
            key: 'value',
            render: (value: number) => `${value.toFixed(2)}%`
        },
        {
            title: '评级',
            dataIndex: 'value',
            key: 'rating',
            render: (value: number) => {
                if (value >= 80) return <span style={{ color: '#52c41a' }}>优秀</span>;
                if (value >= 60) return <span style={{ color: '#faad14' }}>良好</span>;
                return <span style={{ color: '#f5222d' }}>较差</span>;
            }
        }
    ];

    return (
        <div>
            <h2>碳排放预测分析</h2>

            <Card style={{ marginBottom: 16 }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                        <Form.Item
                            name="modelId"
                            label="预测模型"
                            rules={[{ required: true, message: '请选择预测模型' }]}
                            style={{ width: '220px' }}
                        >
                            <Select placeholder="选择预测模型" loading={loadingModels}>
                                {models.map(model => (
                                    <Option key={model.id} value={model.id}>{model.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="dateRange"
                            label="预测日期范围"
                            rules={[{ required: true, message: '请选择日期范围' }]}
                            style={{ width: '300px' }}
                        >
                            <RangePicker />
                        </Form.Item>

                        <Form.Item
                            name="interval"
                            label="时间间隔"
                            initialValue="daily"
                            style={{ width: '150px' }}
                        >
                            <Select>
                                <Option value="daily">每日</Option>
                                <Option value="weekly">每周</Option>
                                <Option value="monthly">每月</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="includeConfidenceInterval"
                            label="置信区间"
                            initialValue={true}
                            valuePropName="checked"
                            style={{ width: '150px', display: 'flex', alignItems: 'flex-end' }}
                        >
                            <Radio.Group>
                                <Radio value={true}>显示</Radio>
                                <Radio value={false}>隐藏</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <Button type="primary" htmlType="submit" loading={loadingPrediction}>
                                开始预测
                            </Button>
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="factors"
                        label="影响因素"
                    >
                        <Select mode="multiple" placeholder="选择影响预测的因素（可选）">
                            <Option value="temperature">温度</Option>
                            <Option value="humidity">湿度</Option>
                            <Option value="workload">工作负载</Option>
                            <Option value="traffice">交通流量</Option>
                            <Option value="season">季节</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Card>

            {loadingPrediction ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                    <Spin size="large" tip="预测分析中..." />
                </div>
            ) : predictionResult ? (
                <Card>
                    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                        <Space>
                            <Radio.Group value={chartType} onChange={e => setChartType(e.target.value)}>
                                <Radio.Button value="line"><LineChartOutlined /> 折线图</Radio.Button>
                                <Radio.Button value="bar"><BarChartOutlined /> 柱状图</Radio.Button>
                            </Radio.Group>
                            <Radio.Group value={showHistorical} onChange={e => setShowHistorical(e.target.value)}>
                                <Radio.Button value={true}>显示历史数据</Radio.Button>
                                <Radio.Button value={false}>隐藏历史数据</Radio.Button>
                            </Radio.Group>
                        </Space>
                        <Button icon={<ReloadOutlined />} onClick={() => handleSubmit(form.getFieldsValue())}>
                            刷新预测
                        </Button>
                    </div>

                    <Tabs defaultActiveKey="chart">
                        <TabPane tab="预测图表" key="chart">
                            <ReactECharts option={getPredictionChartOption()} style={{ height: 400 }} />
                            <div style={{ textAlign: 'center', marginTop: 16 }}>
                                <Alert
                                    message={`预测准确度: ${predictionResult.accuracy.toFixed(2)}%`}
                                    type={predictionResult.accuracy >= 80 ? 'success' : predictionResult.accuracy >= 60 ? 'warning' : 'error'}
                                    showIcon
                                />
                            </div>
                        </TabPane>
                        <TabPane tab="准确度分析" key="accuracy">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <ReactECharts option={getAccuracyChartOption()} style={{ height: 300 }} />
                                <Table
                                    columns={accuracyColumns}
                                    dataSource={accuracyData}
                                    rowKey="metric"
                                    pagination={false}
                                />
                            </div>
                        </TabPane>
                    </Tabs>
                </Card>
            ) : null}
        </div>
    );
};

export default PredictionAnalysis; 