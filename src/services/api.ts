import axios from 'axios';
import { message } from 'antd';
import { getToken } from './auth.service';

// 创建API基础配置
const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, ''),
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        // 简化的请求日志
        console.log(`发送请求: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

        // 只在非GET请求时记录请求数据
        if (config.method !== 'get' && config.data) {
            console.log('请求数据:', JSON.stringify(config.data));
        }

        const token = getToken();

        // 添加认证头部，但不打印日志
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        console.error('请求错误:', error);
        message.error('请求发送失败');
        return Promise.reject(error);
    }
);

// 响应拦截器
api.interceptors.response.use(
    (response) => {
        // 简化的响应日志
        console.log(`收到响应: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('响应错误:', error);

        if (error.response) {
            const { status, data, config } = error.response;
            console.error(`请求失败: ${config.method?.toUpperCase()} ${config.url}`);
            console.error(`状态码: ${status}`);

            if (status === 401) {
                // 未授权，重定向到登录页
                message.error('登录已过期，请重新登录');
                // 使用auth.service中的logout函数
                import('./auth.service').then(authService => {
                    authService.logout().then(() => {
                        window.location.href = '/login';
                    });
                });
            } else if (status === 403) {
                message.error('没有权限进行此操作');
                // 对于403错误（权限不足），重定向到首页而非登录页
                window.location.href = '/dashboard';
            } else if (status === 404) {
                message.error('请求的资源不存在');
            } else if (status >= 500) {
                message.error('服务器异常，请稍后再试');
            } else {
                message.error(data?.message || '请求失败');
            }
        } else if (error.request) {
            console.error('请求未收到响应:', error.request);
            message.error('网络异常，请检查网络连接');
        } else {
            console.error('请求配置错误:', error.message);
            message.error('请求配置错误');
        }

        return Promise.reject(error);
    }
);

export default api; 