import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { RootState } from '../index';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    lastLogin: string;
}

interface UserFormData {
    username: string;
    email: string;
    password?: string;
    role: string;
    status: string;
}

interface UsersState {
    items: User[];
    total: number;
    selectedUser: User | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: UsersState = {
    items: [],
    total: 0,
    selectedUser: null,
    status: 'idle',
    error: null
};

export const fetchUsers = createAsyncThunk(
    'users/fetchAll',
    async (params: {
        page?: number;
        limit?: number;
        search?: string;
    }, { rejectWithValue }) => {
        try {
            const response = await api.get('/users', { params });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '获取用户列表失败');
        }
    }
);

export const fetchUserById = createAsyncThunk(
    'users/fetchById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '获取用户详情失败');
        }
    }
);

export const createUser = createAsyncThunk(
    'users/create',
    async (data: UserFormData, { rejectWithValue }) => {
        try {
            const response = await api.post('/users', data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '创建用户失败');
        }
    }
);

export const updateUser = createAsyncThunk(
    'users/update',
    async ({ id, data }: { id: number; data: Partial<UserFormData> }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/users/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '更新用户失败');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.delete(`/users/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '删除用户失败');
        }
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearSelectedUser: (state) => {
            state.selectedUser = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // 处理获取用户列表
            .addCase(fetchUsers.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload.data;
                state.total = action.payload.total;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // 处理获取单个用户
            .addCase(fetchUserById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selectedUser = action.payload;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // 处理创建用户
            .addCase(createUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items.push(action.payload);
                state.total += 1;
            })
            .addCase(createUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // 处理更新用户
            .addCase(updateUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.items.findIndex(user => user.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.selectedUser?.id === action.payload.id) {
                    state.selectedUser = action.payload;
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // 处理删除用户
            .addCase(deleteUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = state.items.filter(user => user.id !== action.payload);
                state.total -= 1;
                if (state.selectedUser?.id === action.payload) {
                    state.selectedUser = null;
                }
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    }
});

export const { clearSelectedUser, clearError } = userSlice.actions;

// 选择器
export const selectAllUsers = (state: RootState) => state.users.items;
export const selectUserById = (state: RootState, userId: number) =>
    state.users.items.find(user => user.id === userId);
export const selectUserTotal = (state: RootState) => state.users.total;
export const selectSelectedUser = (state: RootState) => state.users.selectedUser;
export const selectUsersStatus = (state: RootState) => state.users.status;
export const selectUsersError = (state: RootState) => state.users.error;

export default userSlice.reducer; 