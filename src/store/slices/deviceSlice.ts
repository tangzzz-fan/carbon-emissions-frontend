import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as deviceService from '../../services/device.service';
import { Device, DeviceFormData, DeviceDataResponse, DeviceDataParams } from '../../types/device';
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
    deviceData: DeviceDataResponse | null;
    operatorDevices: Device[];
    typeDevices: Device[];
    sensitiveData: any | null;
    dataStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    dataError: string | null;
}

const initialState: DevicesState = {
    items: [],
    filteredItems: [],
    total: 0,
    selectedDevice: null,
    status: 'idle',
    error: null,
    filters: {},
    searchTerm: '',
    deviceData: null,
    operatorDevices: [],
    typeDevices: [],
    sensitiveData: null,
    dataStatus: 'idle',
    dataError: null
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

// 1. 获取设备历史数据
export const fetchDeviceData = createAsyncThunk(
    'devices/fetchDeviceData',
    async ({ deviceId, params }: { deviceId: string, params: DeviceDataParams }, { rejectWithValue }) => {
        try {
            const response = await deviceService.getDeviceData(deviceId, params);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '获取设备历史数据失败');
        }
    }
);

// 2. 更新设备状态
export const updateDeviceStatus = createAsyncThunk(
    'devices/updateDeviceStatus',
    async ({ deviceId, status }: { deviceId: string, status: string }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/devices/${deviceId}/status`, { status });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '更新设备状态失败');
        }
    }
);

// 3. 批量更新设备状态
export const batchUpdateDeviceStatus = createAsyncThunk(
    'devices/batchUpdateDeviceStatus',
    async ({ deviceIds, status }: { deviceIds: string[], status: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/devices/batch/status', { deviceIds, status });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '批量更新设备状态失败');
        }
    }
);

// 4. 获取特定操作员的设备
export const fetchDevicesByOperator = createAsyncThunk(
    'devices/fetchDevicesByOperator',
    async (operatorId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/devices/operator/${operatorId}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '获取操作员设备失败');
        }
    }
);

// 5. 获取特定类型的设备
export const fetchDevicesByType = createAsyncThunk(
    'devices/fetchDevicesByType',
    async (type: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/devices/type/${type}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '获取指定类型设备失败');
        }
    }
);

// 6. 配置设备数据采集
export const configureDevice = createAsyncThunk(
    'devices/configureDevice',
    async ({ deviceId, config }: { deviceId: string, config: any }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/devices/${deviceId}/config`, config);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '配置设备数据采集失败');
        }
    }
);

// 7. 获取设备敏感数据
export const fetchDeviceSensitiveData = createAsyncThunk(
    'devices/fetchDeviceSensitiveData',
    async (deviceId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/devices/${deviceId}/sensitive-data`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '获取设备敏感数据失败');
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
            })

            // 添加处理设备历史数据的 reducers
            .addCase(fetchDeviceData.pending, (state) => {
                state.dataStatus = 'loading';
                state.dataError = null;
            })
            .addCase(fetchDeviceData.fulfilled, (state, action) => {
                state.dataStatus = 'succeeded';
                state.deviceData = action.payload;
            })
            .addCase(fetchDeviceData.rejected, (state, action) => {
                state.dataStatus = 'failed';
                state.dataError = action.payload as string;
            })

            // 更新设备状态
            .addCase(updateDeviceStatus.fulfilled, (state, action) => {
                // 更新单个设备的状态
                const updatedDevice = action.payload;
                const index = state.items.findIndex(device => device.id === updatedDevice.id);
                if (index !== -1) {
                    state.items[index] = updatedDevice;
                    // 如果是当前选中的设备，也更新选中设备
                    if (state.selectedDevice && state.selectedDevice.id === updatedDevice.id) {
                        state.selectedDevice = updatedDevice;
                    }
                }
                // 重新应用过滤器
                applyFilters(state);
            })

            // 批量更新设备状态
            .addCase(batchUpdateDeviceStatus.fulfilled, (state, action) => {
                // 更新多个设备的状态
                const updatedDevices = action.payload.devices;
                updatedDevices.forEach((updatedDevice: Device) => {
                    const index = state.items.findIndex(device => device.id === updatedDevice.id);
                    if (index !== -1) {
                        state.items[index] = updatedDevice;
                    }
                });
                // 如果当前选中的设备在更新列表中，也更新选中设备
                if (state.selectedDevice && updatedDevices.some((d: Device) => d.id === state.selectedDevice?.id)) {
                    const updatedSelectedDevice = updatedDevices.find((d: Device) => d.id === state.selectedDevice?.id);
                    if (updatedSelectedDevice) {
                        state.selectedDevice = updatedSelectedDevice;
                    }
                }
                // 重新应用过滤器
                applyFilters(state);
            })

            // 获取特定操作员的设备
            .addCase(fetchDevicesByOperator.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchDevicesByOperator.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.operatorDevices = action.payload.data || action.payload;
            })
            .addCase(fetchDevicesByOperator.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // 获取特定类型的设备
            .addCase(fetchDevicesByType.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchDevicesByType.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.typeDevices = action.payload.data || action.payload;
            })
            .addCase(fetchDevicesByType.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // 设备配置
            .addCase(configureDevice.fulfilled, (state, action) => {
                // 配置成功后可能需要更新设备数据
                if (state.selectedDevice && state.selectedDevice.id === action.payload.deviceId) {
                    // 更新设备配置相关信息
                }
            })

            // 获取敏感数据
            .addCase(fetchDeviceSensitiveData.pending, (state) => {
                state.dataStatus = 'loading';
                state.dataError = null;
            })
            .addCase(fetchDeviceSensitiveData.fulfilled, (state, action) => {
                state.dataStatus = 'succeeded';
                state.sensitiveData = action.payload;
            })
            .addCase(fetchDeviceSensitiveData.rejected, (state, action) => {
                state.dataStatus = 'failed';
                state.dataError = action.payload as string;
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
export const selectDeviceData = (state: RootState) => state.devices.deviceData;
export const selectOperatorDevices = (state: RootState) => state.devices.operatorDevices;
export const selectTypeDevices = (state: RootState) => state.devices.typeDevices;
export const selectSensitiveData = (state: RootState) => state.devices.sensitiveData;
export const selectDataStatus = (state: RootState) => state.devices.dataStatus;
export const selectDataError = (state: RootState) => state.devices.dataError;

export default deviceSlice.reducer; 