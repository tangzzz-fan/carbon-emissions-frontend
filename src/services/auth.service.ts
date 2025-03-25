import api from './api';

interface LoginResponse {
    token: string;
    user: {
        id: number;
        username: string;
        role: string;
    };
}

export const login = (username: string, password: string) => {
    if (!username || !password) {
        return Promise.reject(new Error('用户名和密码不能为空'));
    }

    return api.post<LoginResponse>('auth/login', {
        username,
        password
    });
};

export const register = (username: string, password: string, email: string) => {
    return api.post('auth/register', { username, password, email });
};

export const getCurrentUser = () => {
    return api.get('auth/me');
};

export const logout = () => {
    return api.post('auth/logout');
}; 