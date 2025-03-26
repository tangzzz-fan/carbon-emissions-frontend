// IoT Mock数据类型定义
export interface IoTMockDevice {
    id: string;
    name: string;
    type: string;
    status: string;
    data: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface IoTMockTask {
    id: string;
    type: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    createdAt: string;
    completedAt?: string;
    result?: any;
    error?: string;
}

export interface IoTMockStatus {
    status: string;  // 'running' 或其他状态
    activeDevices: number;
    recentDataUploads: number;
    uptime: number;
    errors: string[];
    lastUpdate: string;
    timestamp: string;

    // 向后兼容的字段（可选）
    isRunning?: boolean;
    deviceCount?: number;
    dataPointsGenerated?: number;
    activeScenarios?: string[];
    lastUpdated?: string;
}

export interface GenerateDevicesParams {
    count?: number;
    type?: string;
    template?: string;
}

export interface ScenarioParams {
    duration?: number;
    intensity?: 'low' | 'medium' | 'high';
    deviceTypes?: string[];
    startTime?: string;
    endTime?: string;
} 