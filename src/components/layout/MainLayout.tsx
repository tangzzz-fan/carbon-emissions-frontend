import React, { useState } from 'react';
import { Layout, Menu, theme, Button } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    ExperimentOutlined,
    AppstoreOutlined,
    LineChartOutlined,
    UserOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import styled from 'styled-components';

const { Header, Sider, Content } = Layout;

const Logo = styled.div`
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const MainLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleMenuClick = (key: string) => {
        navigate(key);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <Logo>碳排放管理</Logo>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['/dashboard']}
                    onClick={({ key }) => handleMenuClick(key)}
                    items={[
                        {
                            key: '/dashboard',
                            icon: <DashboardOutlined />,
                            label: '仪表盘',
                        },
                        {
                            key: '/devices',
                            icon: <AppstoreOutlined />,
                            label: '设备管理',
                        },
                        {
                            key: '/emissions',
                            icon: <LineChartOutlined />,
                            label: '碳排放管理',
                        },
                        {
                            key: '/predictions',
                            icon: <ExperimentOutlined />,
                            label: '预测分析',
                        },
                        {
                            key: '/users',
                            icon: <UserOutlined />,
                            label: '用户管理',
                        },
                    ]}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ fontSize: '16px', width: 64, height: 64 }}
                        />
                        <Button
                            type="text"
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                            style={{ marginRight: 16 }}
                        >
                            退出登录
                        </Button>
                    </div>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout; 