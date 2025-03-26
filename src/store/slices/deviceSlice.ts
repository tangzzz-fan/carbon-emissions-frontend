import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as deviceService from '../../services/device.service';
import { Device, DeviceFormData } from '../../types/device';
import { RootState } from '../index';
import api from '../../services/api';

interface DevicesState {
    items: Device[];
    total: number;
    selectedDevice: Device | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: DevicesState = {
    items: [],
    total: 0,
    selectedDevice: null,
    status: 'idle',
    error: null
};

export const fetchDevices = createAsyncThunk(
    'devices/fetchAll',
    async (params: {
        page?: number;
        limit?: number;
        sort?: string;
        filter?: Record<string, any>;
    }, { rejectWithValue }) => {
        try {
            const response = await deviceService.getAll(params);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to fetch devices');
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
                state.items = action.payload.data;
                state.total = action.payload.total;
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

export const { clearSelectedDevice, setStatus, clearError } = deviceSlice.actions;

// 选择器
export const selectAllDevices = (state: RootState) => state.devices.items;
export const selectDeviceById = (state: RootState, deviceId: string) =>
    state.devices.items.find(device => device.id === deviceId);
export const selectDeviceTotal = (state: RootState) => state.devices.total;
export const selectSelectedDevice = (state: RootState) => state.devices.selectedDevice;
export const selectDevicesStatus = (state: RootState) => state.devices.status;
export const selectDevicesError = (state: RootState) => state.devices.error;

export default deviceSlice.reducer; 