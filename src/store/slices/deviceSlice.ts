import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as deviceService from '../../services/device.service';
import { Device, DeviceFormData } from '../../types/device';
import { RootState } from '../index';
import api from '../../services/api';

// 设备过滤选项类型
export interface DeviceFilterOptions {
    type?: string;
    status?: string;
    location?: string;
    isActive?: boolean;
}

interface DevicesState {
    items: Device[];
    filteredItems: Device[]; // 添加筛选后的设备列表
    total: number;
    selectedDevice: Device | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    filters: DeviceFilterOptions; // 添加过滤条件
    searchTerm: string; // 添加搜索词
}

const initialState: DevicesState = {
    items: [],
    filteredItems: [],
    total: 0,
    selectedDevice: null,
    status: 'idle',
    error: null,
    filters: {},
    searchTerm: ''
};

export const fetchDevices = createAsyncThunk(
    'devices/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await deviceService.getAll();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch devices');
        }
    }
);

export const fetchDeviceById = createAsyncThunk(
    'devices/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/devices/${id}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch device');
        }
    }
);

export const createDevice = createAsyncThunk(
    'devices/create',
    async (data: DeviceFormData, { rejectWithValue }) => {
        try {
            const response = await deviceService.create(data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to create device');
        }
    }
);

export const updateDevice = createAsyncThunk(
    'devices/update',
    async ({ id, data }: { id: string; data: Partial<DeviceFormData> }, { rejectWithValue }) => {
        try {
            const response = await deviceService.update(id, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to update device');
        }
    }
);

export const deleteDevice = createAsyncThunk(
    'devices/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/devices/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete device');
        }
    }
);

const deviceSlice = createSlice({
    name: 'devices',
    initialState,
    reducers: {
        clearSelectedDevice: (state) => {
            state.selectedDevice = null;
        },
        setStatus: (state, action: PayloadAction<'idle' | 'loading' | 'succeeded' | 'failed'>) => {
            state.status = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },

        // 新增reducers，用于处理过滤和搜索
        setSearchTerm: (state, action: PayloadAction<string>) => {
            state.searchTerm = action.payload;
            applyFilters(state);
        },
        setFilters: (state, action: PayloadAction<DeviceFilterOptions>) => {
            state.filters = action.payload;
            applyFilters(state);
        },
        resetFilters: (state) => {
            state.filters = {};
            state.searchTerm = '';
            state.filteredItems = state.items;
        }
    },
    extraReducers: (builder) => {
        builder
            // 处理获取设备列表
            .addCase(fetchDevices.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchDevices.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload.data || action.payload;

                // 修复：正确处理总数量的计算
                if (action.payload.total !== undefined) {
                    // 如果API直接返回了total字段，使用它
                    state.total = action.payload.total;
                } else if (action.payload.data && Array.isArray(action.payload.data)) {
                    // 如果API返回了data数组但没有total字段，使用数组长度
                    state.total = action.payload.data.length;
                } else if (Array.isArray(action.payload)) {
                    // 如果API直接返回了数组，使用数组长度
                    state.total = action.payload.length;
                } else {
                    // 默认值
                    state.total = 0;
                }

                state.filteredItems = state.items; // 初始时筛选结果与原始数据相同
                // 应用当前的过滤条件
                applyFilters(state);
            })
            .addCase(fetchDevices.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // 处理获取单个设备
            .addCase(fetchDeviceById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchDeviceById.fulfilled, (state, action: PayloadAction<Device>) => {
                state.status = 'succeeded';
                state.selectedDevice = action.payload;
            })
            .addCase(fetchDeviceById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string || 'Failed to fetch device';
            })

            // 处理创建设备
            .addCase(createDevice.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createDevice.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items.push(action.payload);
                state.total += 1;
            })
            .addCase(createDevice.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // 处理更新设备
            .addCase(updateDevice.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateDevice.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.items.findIndex((device: Device) => device.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.selectedDevice?.id === action.payload.id) {
                    state.selectedDevice = action.payload;
                }
            })
            .addCase(updateDevice.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // 处理删除设备
            .addCase(deleteDevice.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteDevice.fulfilled, (state, action: PayloadAction<string>) => {
                state.status = 'succeeded';
                state.items = state.items.filter(device => device.id !== action.payload);
                state.total -= 1;
                if (state.selectedDevice && state.selectedDevice.id === action.payload) {
                    state.selectedDevice = null;
                }
            })
            .addCase(deleteDevice.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    }
});

// 辅助函数：应用过滤条件
function applyFilters(state: DevicesState) {
    let result = [...state.items];

    // 应用过滤器
    if (state.filters.type) {
        result = result.filter(device => device.type === state.filters.type);
    }

    if (state.filters.status) {
        result = result.filter(device => device.status === state.filters.status);
    }

    if (state.filters.location) {
        result = result.filter(device =>
            device.location && device.location.includes(state.filters.location || '')
        );
    }

    if (state.filters.isActive !== undefined) {
        result = result.filter(device => device.isActive === state.filters.isActive);
    }

    // 应用搜索
    if (state.searchTerm) {
        result = result.filter(device =>
            device.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
            device.deviceId.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
            (device.description && device.description.toLowerCase().includes(state.searchTerm.toLowerCase()))
        );
    }

    state.filteredItems = result;
}

export const {
    clearSelectedDevice,
    setStatus,
    clearError,
    setSearchTerm,
    setFilters,
    resetFilters
} = deviceSlice.actions;

// 选择器
export const selectAllDevices = (state: RootState) => state.devices.items;
export const selectFilteredDevices = (state: RootState) => state.devices.filteredItems;
export const selectDeviceById = (state: RootState, deviceId: string) =>
    state.devices.items.find(device => device.id === deviceId);
export const selectDeviceTotal = (state: RootState) => state.devices.total;
export const selectSelectedDevice = (state: RootState) => state.devices.selectedDevice;
export const selectDevicesStatus = (state: RootState) => state.devices.status;
export const selectDevicesError = (state: RootState) => state.devices.error;
export const selectDeviceFilters = (state: RootState) => state.devices.filters;
export const selectDeviceSearchTerm = (state: RootState) => state.devices.searchTerm;

export default deviceSlice.reducer; 