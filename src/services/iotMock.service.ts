import api from './api';
import { GenerateDevicesParams, IoTMockStatus, ScenarioParams } from '../types/iotMock';

// IoT Mock数据服务
export const getMockDeviceById = async (id: string) => {
    return api.get(`/mock-iot/${id}`);
};

export const createMockDevice = async (data: any) => {
    return api.post('/mock-iot', data);
};

export const updateMockDevice = async (id: string, data: any) => {
    return api.put(`/mock-iot/${id}`, data);
};

export const deleteMockDevice = async (id: string) => {
    return api.delete(`/mock-iot/${id}`);
};

export const getMockSystemStatus = async () => {
    return api.get('/mock-iot/mockSystemStatus');
};

export const reloadMockData = async () => {
    return api.post('/mock-iot/reload');
};

export const startMockDataGeneration = async () => {
    return api.post('/mock-iot/start');
};

export const stopMockDataGeneration = async () => {
    return api.post('/mock-iot/stop');
};

export const publishMockData = async () => {
    return api.post('/mock-iot/publish');
};

export const syncDevices = async () => {
    return api.post('/mock-iot/sync-devices');
};

export const generateRandomDevices = async (params?: GenerateDevicesParams) => {
    return api.post('/mock-iot/generate-random', params);
};

export const generateCarbonDevices = async (params?: GenerateDevicesParams) => {
    return api.post('/mock-iot/generate/carbon-devices', params);
};

export const generateBasicDevices = async (params?: GenerateDevicesParams) => {
    return api.post('/mock-iot/generate/basic-devices', params);
};

export const generateLogisticsDevices = async (params?: GenerateDevicesParams) => {
    return api.post('/mock-iot/generate/logistics-devices', params);
};

// 场景模拟相关
export const simulateVehicleEntry = async (params?: ScenarioParams) => {
    return api.post('/mock-iot/scenario/vehicle-entry', params);
};

export const simulateLoading = async (params?: ScenarioParams) => {
    return api.post('/mock-iot/scenario/loading', params);
};

export const simulateLoadingAsync = async (params?: ScenarioParams) => {
    return api.post('/mock-iot/scenario/loading/async', params);
};

export const simulateCarbonPeak = async (params?: ScenarioParams) => {
    return api.post('/mock-iot/scenario/carbon-peak', params);
};

export const simulateCarbonReduction = async (params?: ScenarioParams) => {
    return api.post('/mock-iot/scenario/carbon-reduction', params);
};

// 时间模式相关
export const simulateWorkdayPeak = async (params?: any) => {
    return api.post('/mock-iot/time-pattern/workday-peak', params);
};

export const simulateNightPattern = async (params?: any) => {
    return api.post('/mock-iot/time-pattern/night', params);
};

// 任务相关
export const getTaskStatus = async (taskId: string) => {
    return api.get(`/mock-iot/tasks/${taskId}`);
}; 