import { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { message } from 'antd';

// 设备类型定义 - 扩展以匹配API返回的所有字段
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
    energyType?: string;
    emissionFactor?: number;
    powerRating?: number;
    operatingVoltage?: number | null;
    operatingCurrent?: number | null;
    fuelType?: string | null;
    capacity?: number | null;
    unit?: string | null;
    connectionType?: string;
    operatorId?: string | null;
    isActive: boolean;
    visibility?: string;
    createdAt?: string;
    updatedAt?: string;
    installationDate?: string | null;
    lastCalibrationDate?: string | null;
}

// 分页信息接口
export interface PaginationInfo {
    total: number;
    current?: number;
    pageSize?: number;
}

// API响应接口
interface DeviceApiResponse {
    data: Device[];
    pagination?: PaginationInfo;
}

// 过滤选项类型
export interface DeviceFilterOptions {
    type?: string;
    status?: string;
    location?: string;
    isActive?: boolean;
}

/**
 * 设备管理Hook
 * 提供设备列表数据及相关操作
 */
export default function useDevices() {
    // 状态管理
    const [devices, setDevices] = useState<Device[]>([]);
    const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<DeviceFilterOptions>({});
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [searchTerm, setSearchTerm] = useState('');

    // 获取设备列表
    const fetchDevices = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('正在获取设备列表...');
            const response = await api.get('/devices');
            console.log('API响应数据:', response.data);

            // 检查响应数据
            if (response.data) {
                let deviceData: Device[];

                // 处理可能的不同响应格式
                if (Array.isArray(response.data)) {
                    deviceData = response.data;
                    console.log(`获取到 ${deviceData.length} 个设备`);
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    deviceData = response.data.data;
                    console.log(`获取到 ${deviceData.length} 个设备（从data字段）`);
                } else {
                    console.error('无法识别的设备数据格式');
                    setError('无法识别的设备数据格式');
                    setDevices([]);
                    setFilteredDevices([]);
                    return;
                }

                setDevices(deviceData);

                // 先设置过滤后的设备为全部设备，然后应用过滤条件
                setFilteredDevices(deviceData);
                if (Object.keys(filters).length > 0 || searchTerm) {
                    applyFilters(deviceData, filters);
                }

                // 如果返回的数据为空，记录日志
                if (deviceData.length === 0) {
                    console.warn('设备列表返回空数据');
                    message.info('未找到任何设备数据');
                }
            } else {
                console.error('设备数据格式不正确:', response.data);
                setError('返回的设备数据格式不正确');
                setDevices([]);
                setFilteredDevices([]);
                message.error('设备数据格式不正确');
            }
        } catch (error: any) {
            console.error('获取设备列表失败:', error.response?.data?.message || error.message);
            setError(error.response?.data?.message || '获取设备列表失败');
            setDevices([]);
            setFilteredDevices([]);
            message.error(error.response?.data?.message || '获取设备列表失败');
        } finally {
            setLoading(false);
        }
    }, [filters, searchTerm]);

    // 应用过滤器
    const applyFilters = useCallback((deviceList: Device[], filterOptions: DeviceFilterOptions) => {
        console.log('应用过滤器:', filterOptions, '搜索词:', searchTerm);
        console.log('过滤前设备数量:', deviceList.length);

        let result = [...deviceList];

        if (filterOptions.type) {
            result = result.filter(device => device.type === filterOptions.type);
            console.log(`按类型过滤后剩余:`, result.length);
        }

        if (filterOptions.status) {
            result = result.filter(device => device.status === filterOptions.status);
            console.log(`按状态过滤后剩余:`, result.length);
        }

        if (filterOptions.location) {
            result = result.filter(device =>
                device.location && device.location.includes(filterOptions.location || '')
            );
            console.log(`按位置过滤后剩余:`, result.length);
        }

        if (filterOptions.isActive !== undefined) {
            result = result.filter(device => device.isActive === filterOptions.isActive);
            console.log(`按激活状态过滤后剩余:`, result.length);
        }

        if (searchTerm) {
            result = result.filter(device =>
                device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (device.description && device.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            console.log(`按搜索词过滤后剩余:`, result.length);
        }

        console.log('过滤后设备数量:', result.length);
        setFilteredDevices(result);
    }, [searchTerm]);

    // 更新过滤条件
    const updateFilters = useCallback((newFilters: Partial<DeviceFilterOptions>) => {
        console.log('更新过滤条件:', newFilters);
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        applyFilters(devices, updatedFilters);
    }, [devices, filters, applyFilters]);

    // 重置过滤条件
    const resetFilters = useCallback(() => {
        console.log('重置过滤条件');
        setFilters({});
        setSearchTerm('');
        setFilteredDevices(devices);
    }, [devices]);

    // 刷新设备列表
    const refreshDevices = useCallback(() => {
        console.log('手动刷新设备列表');
        fetchDevices();
    }, [fetchDevices]);

    // 首次加载时获取设备列表
    useEffect(() => {
        console.log('初始化加载设备列表');
        fetchDevices();
    }, [fetchDevices]);

    // 添加搜索方法
    const setSearch = useCallback((term: string) => {
        console.log('设置搜索词:', term);
        setSearchTerm(term);
        applyFilters(devices, filters);
    }, [devices, filters, applyFilters]);

    // 返回Hook数据和方法
    return {
        devices: filteredDevices,
        allDevices: devices,
        loading,
        error,
        filters,
        fetchDevices,
        refreshDevices,
        updateFilters,
        resetFilters,
        pagination,
        setPagination,
        searchTerm,
        setSearch
    };
} 