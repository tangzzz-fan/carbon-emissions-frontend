import api from './api';

interface LoginResponse {
    access_token: string;
    user: {
        id: number;
        username: string;
        role: string;
    };
}

// 存储认证信息的键名
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const login = async (username: string, password: string) => {
    if (!username || !password) {
        return Promise.reject(new Error('用户名和密码不能为空'));
    }

    try {
        const response = await api.post<LoginResponse>('auth/login', {
            username,
            password
        });

        // 保存 token 和用户信息到本地存储
        localStorage.setItem(TOKEN_KEY, response.data.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));

        return response;
    } catch (error) {
        return Promise.reject(error);
    }
};

export const register = (username: string, password: string, email: string) => {
    return api.post('auth/register', { username, password, email });
};

export const getCurrentUser = () => {
    return api.get('auth/me');
};

export const logout = async () => {
    try {
        // 先调用后端接口
        const response = await api.post('auth/logout');

        // 成功后再清除本地存储
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        return response;
    } catch (error) {
        // 即使请求失败，也清除本地存储，确保前端状态一致
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return Promise.reject(error);
    }
};

// 获取当前存储的 token
export const getToken = (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('从本地存储获取的token:', token);
    return token;
};

// 获取当前存储的用户信息
export const getStoredUser = () => {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
};

// 检查用户是否已登录
export const isAuthenticated = (): boolean => {
    return !!getToken();
};

// 检查用户是否是管理员
export const isAdmin = (): boolean => {
    const user = getStoredUser();
    return user && user.role === 'admin';
};

export const isManager = (): boolean => {
    const user = getStoredUser();
    return user && user.role === 'manager';
};

export const canEdit = (): boolean => {
    return isAdmin() || isManager();
}; 