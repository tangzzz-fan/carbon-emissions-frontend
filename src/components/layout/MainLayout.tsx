import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Button } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    ExperimentOutlined,
    AppstoreOutlined,
    LineChartOutlined,
    UserOutlined,
    LogoutOutlined,
    ApiOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useAppDispatch } from '../../hooks/reduxHooks';

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
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // 根据当前路径确定选中的菜单项
    const [selectedKey, setSelectedKey] = useState(location.pathname);

    // 当路径变化时更新选中项
    useEffect(() => {
        setSelectedKey(location.pathname);
    }, [location.pathname]);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleMenuClick = (key: string) => {
        navigate(key);
    };

    const handleLogout = async () => {
        try {
            await dispatch(logout());
            navigate('/login');
        } catch (error) {
            console.error('退出登录失败:', error);
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <Logo>碳排放管理</Logo>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[selectedKey]}
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
                        {
                            key: '/iot-mock',
                            icon: <ApiOutlined />,
                            label: 'IoT数据管理',
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