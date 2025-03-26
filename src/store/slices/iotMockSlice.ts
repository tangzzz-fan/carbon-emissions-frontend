import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as iotMockService from '../../services/iotMock.service';
import { GenerateDevicesParams, IoTMockDevice, IoTMockStatus, IoTMockTask } from '../../types/iotMock';
import { RootState } from '../index';

interface IoTMockState {
    devices: IoTMockDevice[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    mockStatus: IoTMockStatus | null;
    tasks: IoTMockTask[];
    currentTask: IoTMockTask | null;
}

const initialState: IoTMockState = {
    devices: [],
    status: 'idle',
    error: null,
    mockStatus: null,
    tasks: [],
    currentTask: null
};

// 获取模拟数据状态
export const fetchMockStatus = createAsyncThunk(
    'iotMock/fetchMockStatus',
    async (_, { rejectWithValue }) => {
        try {
            const response = await iotMockService.getMockSystemStatus();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '获取模拟状态失败');
        }
    }
);

// 启动模拟数据生成
export const startMockGeneration = createAsyncThunk(
    'iotMock/startMockGeneration',
    async (_, { rejectWithValue }) => {
        try {
            const response = await iotMockService.startMockDataGeneration();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '启动模拟数据生成失败');
        }
    }
);

// 停止模拟数据生成
export const stopMockGeneration = createAsyncThunk(
    'iotMock/stopMockGeneration',
    async (_, { rejectWithValue }) => {
        try {
            const response = await iotMockService.stopMockDataGeneration();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '停止模拟数据生成失败');
        }
    }
);

// 生成随机设备
export const generateRandomDevices = createAsyncThunk(
    'iotMock/generateRandomDevices',
    async (params: GenerateDevicesParams, { rejectWithValue }) => {
        try {
            const response = await iotMockService.generateRandomDevices(params);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '生成随机设备失败');
        }
    }
);

// 生成物流设备
export const generateLogisticsDevices = createAsyncThunk(
    'iotMock/generateLogisticsDevices',
    async (params: GenerateDevicesParams, { rejectWithValue }) => {
        try {
            const response = await iotMockService.generateLogisticsDevices(params);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '生成物流设备失败');
        }
    }
);

// 生成基础设备
export const generateBasicDevices = createAsyncThunk(
    'iotMock/generateBasicDevices',
    async (params: GenerateDevicesParams, { rejectWithValue }) => {
        try {
            const response = await iotMockService.generateBasicDevices(params);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '生成基础设备失败');
        }
    }
);

// 模拟场景
export const simulateScenario = createAsyncThunk(
    'iotMock/simulateScenario',
    async ({ scenarioType, params }: { scenarioType: string, params?: any }, { rejectWithValue }) => {
        try {
            let response;
            switch (scenarioType) {
                case 'vehicle-entry':
                    response = await iotMockService.simulateVehicleEntry(params);
                    break;
                case 'loading':
                    response = await iotMockService.simulateLoading(params);
                    break;
                case 'carbon-peak':
                    response = await iotMockService.simulateCarbonPeak(params);
                    break;
                case 'carbon-reduction':
                    response = await iotMockService.simulateCarbonReduction(params);
                    break;
                case 'workday-peak':
                    response = await iotMockService.simulateWorkdayPeak(params);
                    break;
                case 'night':
                    response = await iotMockService.simulateNightPattern(params);
                    break;
                default:
                    throw new Error('未知场景类型');
            }
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '模拟场景失败');
        }
    }
);

// 获取任务状态
export const fetchTaskStatus = createAsyncThunk(
    'iotMock/fetchTaskStatus',
    async (taskId: string, { rejectWithValue }) => {
        try {
            const response = await iotMockService.getTaskStatus(taskId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '获取任务状态失败');
        }
    }
);

const iotMockSlice = createSlice({
    name: 'iotMock',
    initialState,
    reducers: {
        clearCurrentTask: (state) => {
            state.currentTask = null;
        },
        // 添加一个reducer来手动设置设备数据，替代fetchMockDevices
        setMockDevices: (state, action: PayloadAction<IoTMockDevice[]>) => {
            state.devices = action.payload;
            state.status = 'succeeded';
        }
    },
    extraReducers: (builder) => {
        builder
            // 处理获取模拟状态
            .addCase(fetchMockStatus.fulfilled, (state, action: PayloadAction<IoTMockStatus>) => {
                state.mockStatus = {
                    ...action.payload,
                    // 添加兼容性字段
                    isRunning: action.payload.status === 'running',
                    deviceCount: action.payload.activeDevices,
                    dataPointsGenerated: action.payload.recentDataUploads || 0,
                    activeScenarios: [],
                    lastUpdated: action.payload.lastUpdate || action.payload.timestamp
                };
            })

            // 处理启动模拟数据生成
            .addCase(startMockGeneration.fulfilled, (state, action) => {
                if (state.mockStatus) {
                    state.mockStatus.status = 'running';
                    state.mockStatus.isRunning = true;
                    state.mockStatus.timestamp = new Date().toISOString();
                    state.mockStatus.lastUpdate = new Date().toISOString();
                    state.mockStatus.lastUpdated = new Date().toISOString();
                } else {
                    state.mockStatus = {
                        status: 'running',
                        isRunning: true,
                        activeDevices: 0,
                        recentDataUploads: 0,
                        uptime: 0,
                        errors: [],
                        lastUpdate: new Date().toISOString(),
                        timestamp: new Date().toISOString(),
                        deviceCount: 0,
                        dataPointsGenerated: 0,
                        activeScenarios: []
                    };
                }
            })

            // 处理停止模拟数据生成
            .addCase(stopMockGeneration.fulfilled, (state, action) => {
                if (state.mockStatus) {
                    state.mockStatus.status = 'stopped';
                    state.mockStatus.isRunning = false;
                    state.mockStatus.timestamp = new Date().toISOString();
                    state.mockStatus.lastUpdate = new Date().toISOString();
                    state.mockStatus.lastUpdated = new Date().toISOString();
                } else {
                    state.mockStatus = {
                        status: 'stopped',
                        isRunning: false,
                        activeDevices: 0,
                        recentDataUploads: 0,
                        uptime: 0,
                        errors: [],
                        lastUpdate: new Date().toISOString(),
                        timestamp: new Date().toISOString(),
                        deviceCount: 0,
                        dataPointsGenerated: 0,
                        activeScenarios: []
                    };
                }
            })

            // 处理任务状态
            .addCase(fetchTaskStatus.fulfilled, (state, action: PayloadAction<IoTMockTask>) => {
                state.currentTask = action.payload;
                // 更新任务列表
                const index = state.tasks.findIndex(task => task.id === action.payload.id);
                if (index !== -1) {
                    state.tasks[index] = action.payload;
                } else {
                    state.tasks.push(action.payload);
                }
            })

            // 处理其他生成任务响应
            .addCase(generateRandomDevices.fulfilled, (state, action) => {
                if (action.payload.taskId) {
                    state.currentTask = {
                        id: action.payload.taskId,
                        type: 'generate-random',
                        status: 'running',
                        progress: 0,
                        createdAt: new Date().toISOString()
                    };
                    state.tasks.push(state.currentTask);
                }
            })
            .addCase(generateLogisticsDevices.fulfilled, (state, action) => {
                if (action.payload.taskId) {
                    state.currentTask = {
                        id: action.payload.taskId,
                        type: 'generate-logistics',
                        status: 'running',
                        progress: 0,
                        createdAt: new Date().toISOString()
                    };
                    state.tasks.push(state.currentTask);
                }
            })
            .addCase(simulateScenario.fulfilled, (state, action) => {
                if (action.payload.taskId) {
                    state.currentTask = {
                        id: action.payload.taskId,
                        type: action.meta.arg.scenarioType,
                        status: 'running',
                        progress: 0,
                        createdAt: new Date().toISOString()
                    };
                    state.tasks.push(state.currentTask);
                }
            })
            .addCase(generateBasicDevices.fulfilled, (state, action) => {
                if (action.payload.taskId) {
                    state.currentTask = {
                        id: action.payload.taskId,
                        type: 'generate-basic',
                        status: 'running',
                        progress: 0,
                        createdAt: new Date().toISOString()
                    };
                    state.tasks.push(state.currentTask);
                }
            });
    }
});

export const { clearCurrentTask, setMockDevices } = iotMockSlice.actions;

export const selectIoTMockDevices = (state: RootState) => state.iotMock.devices;
export const selectIoTMockStatus = (state: RootState) => state.iotMock.status;
export const selectIoTMockError = (state: RootState) => state.iotMock.error;
export const selectMockSystemStatus = (state: RootState) => state.iotMock.mockStatus;
export const selectIoTMockTasks = (state: RootState) => state.iotMock.tasks;
export const selectCurrentTask = (state: RootState) => state.iotMock.currentTask;

export const selectRunningTasks = (state: RootState) =>
    state.iotMock.tasks.filter(task =>
        task.status === 'running' || task.status === 'pending'
    );

export const selectCompletedTasks = (state: RootState) =>
    state.iotMock.tasks.filter(task =>
        task.status === 'completed'
    );

export const selectFailedTasks = (state: RootState) =>
    state.iotMock.tasks.filter(task =>
        task.status === 'failed'
    );

export const selectTasksByType = (state: RootState, type: string) =>
    state.iotMock.tasks.filter(task => task.type === type);

export default iotMockSlice.reducer; 