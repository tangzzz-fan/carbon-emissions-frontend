import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';

// 布局组件
import MainLayout from './components/layout/MainLayout';

// 认证组件
import LoginForm from './features/auth/components/LoginForm';
import PrivateRoute from './features/auth/components/PrivateRoute';

// 页面组件
import Dashboard from './features/dashboard/pages/Dashboard';
import DeviceList from './features/devices/pages/DeviceList';
import DeviceDetail from './features/devices/pages/DeviceDetail';
import EmissionList from './features/emissions/pages/EmissionList';
import EmissionReport from './features/emissions/pages/EmissionReport';
import PredictionAnalysis from './features/predictions/pages/PredictionAnalysis';
import UserList from './features/users/pages/UserList';

const App: React.FC = () => {
    return (
        <ConfigProvider locale={zhCN}>
            <BrowserRouter>
                <Routes>
                    {/* 公共路由 */}
                    <Route path="/login" element={<LoginForm />} />

                    {/* 受保护的普通路由 */}
                    <Route element={<PrivateRoute />}>
                        <Route element={<MainLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/devices" element={<DeviceList />} />
                            <Route path="/devices/:id" element={<DeviceDetail />} />
                            <Route path="/emissions" element={<EmissionList />} />
                            <Route path="/emissions/report" element={<EmissionReport />} />
                            <Route path="/predictions" element={<PredictionAnalysis />} />
                        </Route>
                    </Route>

                    {/* 需要管理员权限的路由 */}
                    <Route element={<PrivateRoute requiresAdmin={true} />}>
                        <Route element={<MainLayout />}>
                            <Route path="/users" element={<UserList />} />
                        </Route>
                    </Route>

                    {/* 默认路由重定向 */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </ConfigProvider>
    );
};

export default App; 