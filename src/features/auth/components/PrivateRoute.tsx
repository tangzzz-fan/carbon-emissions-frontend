import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, canEdit } from '../../../services/auth.service';

interface PrivateRouteProps {
    requiresAdmin?: boolean;
    redirectPath?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
    requiresAdmin = false,
    redirectPath = '/login'
}) => {
    // 使用auth.service中的方法检查身份
    if (requiresAdmin) {
        // 需要管理员权限
        return canEdit() ? <Outlet /> : <Navigate to={redirectPath} replace />;
    }

    // 仅需要普通登录权限
    return isAuthenticated() ? <Outlet /> : <Navigate to={redirectPath} replace />;
};

export default PrivateRoute; 