export interface Device {
    id: number;
    name: string;
    type: string;
    status: 'active' | 'inactive' | 'maintenance';
    location: string;
    installationDate: string;
    lastMaintenanceDate: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface DeviceFormData {
    name: string;
    type: string;
    status: 'active' | 'inactive' | 'maintenance';
    location: string;
    installationDate: string;
    lastMaintenanceDate?: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    description?: string;
}

export interface DeviceData {
    id: number;
    deviceId: number;
    timestamp: string;
    energyConsumption: number;
    co2Emission: number;
    operationalHours: number;
    additionalData?: Record<string, any>;
} 