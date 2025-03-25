import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin, Alert } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import ReactECharts from 'echarts-for-react';
import api from '../../../services/api';

const StyledCard = styled(Card)`
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const ChartCard = styled(StyledCard)`
  height: 400px;
`;

interface DashboardData {
    totalCo2Emission: number;
    co2EmissionChange: number;
    activeDevices: number;
    alertsCount: number;
    emissionTrend: Array<{ date: string; value: number }>;
    deviceEmissionDistribution: Array<{ name: string; value: number }>;
    hourlyEmissionToday: Array<{ hour: string; value: number }>;
}

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/dashboard');
                setDashboardData(response.data);
                setError(null);
            } catch (err) {
                setError('获取仪表盘数据失败，请稍后再试');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

        // 每5分钟刷新一次数据
        const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                <Spin size="large" tip="加载中..." />
            </div>
        );
    }

    if (error) {
        return <Alert message="错误" description={error} type="error" showIcon />;
    }

    if (!dashboardData) {
        return <Alert message="无数据" description="当前无可显示的数据" type="info" showIcon />;
    }

    // 构建排放趋势图表配置
    const emissionTrendOption = {
        title: {
            text: '碳排放趋势 (近30天)',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: dashboardData.emissionTrend.map(item => item.date)
        },
        yAxis: {
            type: 'value',
            name: '碳排放量 (kg)'
        },
        series: [
            {
                name: '碳排放量',
                type: 'line',
                data: dashboardData.emissionTrend.map(item => item.value),
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
        ],
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        }
    };

    // 构建设备排放分布图表配置
    const deviceDistributionOption = {
        title: {
            text: '设备碳排放分布',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} kg ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: dashboardData.deviceEmissionDistribution.map(item => item.name)
        },
        series: [
            {
                name: '碳排放来源',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '16',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: dashboardData.deviceEmissionDistribution.map(item => ({
                    value: item.value,
                    name: item.name
                }))
            }
        ]
    };

    // 构建今日小时排放图表配置
    const hourlyEmissionOption = {
        title: {
            text: '今日小时碳排放量',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        xAxis: {
            type: 'category',
            data: dashboardData.hourlyEmissionToday.map(item => `${item.hour}:00`)
        },
        yAxis: {
            type: 'value',
            name: '碳排放量 (kg)'
        },
        series: [
            {
                name: '碳排放量',
                type: 'bar',
                data: dashboardData.hourlyEmissionToday.map(item => item.value),
                barWidth: '60%',
                itemStyle: {
                    color: '#5470c6'
                }
            }
        ],
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        }
    };

    return (
        <>
            <h2>仪表盘</h2>
            <Row gutter={16}>
                <Col xs={24} sm={12} md={6}>
                    <StyledCard>
                        <Statistic
                            title="总碳排放量 (kg)"
                            value={dashboardData.totalCo2Emission}
                            precision={2}
                            valueStyle={{ color: dashboardData.co2EmissionChange >= 0 ? '#cf1322' : '#3f8600' }}
                            prefix={dashboardData.co2EmissionChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            suffix={`${Math.abs(dashboardData.co2EmissionChange)}%`}
                        />
                    </StyledCard>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StyledCard>
                        <Statistic
                            title="在线设备数"
                            value={dashboardData.activeDevices}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </StyledCard>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StyledCard>
                        <Statistic
                            title="预警数量"
                            value={dashboardData.alertsCount}
                            valueStyle={{ color: dashboardData.alertsCount > 5 ? '#cf1322' : '#3f8600' }}
                        />
                    </StyledCard>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StyledCard>
                        <Statistic
                            title="平均减排率"
                            value={3.2}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<ArrowDownOutlined />}
                            suffix="%"
                        />
                    </StyledCard>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24} lg={12}>
                    <ChartCard title="碳排放趋势">
                        <ReactECharts option={emissionTrendOption} style={{ height: '320px' }} />
                    </ChartCard>
                </Col>
                <Col xs={24} lg={12}>
                    <ChartCard title="设备碳排放分布">
                        <ReactECharts option={deviceDistributionOption} style={{ height: '320px' }} />
                    </ChartCard>
                </Col>
            </Row>

            <Row>
                <Col span={24}>
                    <ChartCard title="今日小时碳排放量">
                        <ReactECharts option={hourlyEmissionOption} style={{ height: '320px' }} />
                    </ChartCard>
                </Col>
            </Row>
        </>
    );
};

export default Dashboard; 