export interface Device {
    id: string;
    name: string;
    description?: string;
    deviceId: string;
    type: string;
    status: string;
    location?: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    purchaseDate?: string | null;
    lifespan?: number | null;

    // 能源和排放信息
    energyType?: string;
    emissionFactor?: number;
    powerRating?: number;
    operatingVoltage?: number | null;
    operatingCurrent?: number | null;
    fuelType?: string | null;
    capacity?: number | null;
    unit?: string | null;

    // 连接和状态信息
    connectionType?: string;
    operatorId?: string | null;
    isActive: boolean;
    visibility?: string;

    // 时间相关信息
    createdAt?: string;
    updatedAt?: string;
    installationDate?: string | null;
    lastCalibrationDate?: string | null;
}

export interface DeviceFormData {
    name: string;
    description?: string;
    deviceId?: string;
    type: string;
    status: string;
    location?: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    installationDate?: string;
    lastCalibrationDate?: string;
    purchaseDate?: string;
    lifespan?: number;

    // 能源和排放信息
    energyType?: string;
    emissionFactor?: number;
    powerRating?: number;
    operatingVoltage?: number;
    operatingCurrent?: number;
    fuelType?: string;
    capacity?: number;
    unit?: string;

    // 连接和状态信息
    connectionType?: string;
    operatorId?: string;
    isActive?: boolean;
    visibility?: string;
}

export interface DeviceDataParams {
    startDate: string;
    endDate: string;
    interval: 'hourly' | 'daily' | 'monthly';
}

export interface DeviceDataPoint {
    date: string;
    energyConsumption: number;
    co2Emission: number;
    operationalHours: number;
}

export interface DeviceDataResponse {
    data: DeviceDataPoint[];
} 