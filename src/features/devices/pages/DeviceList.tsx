import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Input, Select, Tag, Space, Row, Col, Typography, Spin, Alert, Divider, Modal, message } from 'antd';
import { SearchOutlined, ReloadOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../hooks/reduxHooks';
import {
    fetchDevices,
    fetchDeviceById,
    setSearchTerm,
    setFilters,
    resetFilters,
    selectFilteredDevices,
    selectDevicesStatus,
    selectDevicesError,
    selectDeviceFilters,
    selectDeviceSearchTerm,
    selectSelectedDevice,
    DeviceFilterOptions
} from '../../../store/slices/deviceSlice';
import { Device } from '../../../types/device';
import { ColumnsType } from 'antd/es/table';
import DeviceForm from '../components/DeviceForm';

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

// 设备类型选项
const deviceTypeOptions = [
    { value: 'truck', label: '卡车' },
    { value: 'forklift', label: '叉车' },
    { value: 'packaging', label: '包装设备' },
    { value: 'lighting', label: '照明设备' },
    { value: 'GATE', label: '闸机' },
    { value: 'CAMERA', label: '摄像头' },
    { value: 'WEIGHT_SCALE', label: '称重设备' },
    { value: 'SECURITY', label: '安防设备' },
    { value: 'CHARGING_STATION', label: '充电站' },
    { value: 'other', label: '其他' }
];

// 设备状态选项
const deviceStatusOptions = [
    { value: 'active', label: '运行中' },
    { value: 'inactive', label: '已停用' },
    { value: 'maintenance', label: '维护中' }
];

// 能源类型选项
const energyTypeOptions = [
    { value: 'electricity', label: '电力' },
    { value: 'diesel', label: '柴油' },
    { value: 'gas', label: '天然气' },
    { value: 'solar', label: '太阳能' }
];

const DeviceList: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // 从Redux获取数据
    const devices = useSelector(selectFilteredDevices);
    const status = useSelector(selectDevicesStatus);
    const error = useSelector(selectDevicesError);
    const filters = useSelector(selectDeviceFilters);
    const searchTerm = useSelector(selectDeviceSearchTerm);
    const selectedDevice = useSelector(selectSelectedDevice);

    // 添加编辑模态框状态
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);

    const loading = status === 'loading';

    // 初始化加载设备列表
    useEffect(() => {
        dispatch(fetchDevices());
    }, [dispatch]);

    // 当编辑设备ID变化时，获取设备详情
    useEffect(() => {
        if (editingDeviceId) {
            dispatch(fetchDeviceById(editingDeviceId));
        }
    }, [editingDeviceId, dispatch]);

    // 处理编辑按钮点击
    const handleEdit = (deviceId: string) => {
        setEditingDeviceId(deviceId);
        dispatch(fetchDeviceById(deviceId)).then(() => {
            setIsEditModalVisible(true);
        });
    };

    // 编辑成功后的处理
    const handleEditSuccess = () => {
        setIsEditModalVisible(false);
        setEditingDeviceId(null);
        // 刷新设备列表
        dispatch(fetchDevices());
        message.success('设备更新成功');
    };

    // 关闭编辑模态框
    const handleEditCancel = () => {
        setIsEditModalVisible(false);
        setEditingDeviceId(null);
    };

    // 获取设备类型对应的标签颜色
    const getTypeColor = (type: string) => {
        const typeColors: Record<string, string> = {
            truck: 'blue',
            forklift: 'cyan',
            packaging: 'orange',
            lighting: 'yellow',
            GATE: 'purple',
            CAMERA: 'magenta',
            WEIGHT_SCALE: 'volcano',
            SECURITY: 'green',
            CHARGING_STATION: 'red',
            other: 'default'
        };
        return typeColors[type] || 'default';
    };

    // 获取设备状态对应的标签颜色
    const getStatusColor = (status: string) => {
        const statusColors: Record<string, string> = {
            active: 'green',
            inactive: 'red',
            maintenance: 'gold'
        };
        return statusColors[status] || 'default';
    };

    // 表格列定义 - 使用正确的类型注解
    const columns: ColumnsType<Device> = [
        {
            title: '设备名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Device) => (
                <a onClick={() => navigate(`/devices/${record.id}`)}>{text}</a>
            ),
            sorter: (a: Device, b: Device) => a.name.localeCompare(b.name)
        },
        {
            title: '设备ID',
            dataIndex: 'deviceId',
            key: 'deviceId',
        },
        {
            title: '设备类型',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => (
                <Tag color={getTypeColor(type)}>
                    {deviceTypeOptions.find(option => option.value === type)?.label || type.toUpperCase()}
                </Tag>
            ),
            filters: deviceTypeOptions.map(option => ({ text: option.label, value: option.value })),
            onFilter: (value, record) => record.type === value.toString()
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {deviceStatusOptions.find(option => option.value === status)?.label || status.toUpperCase()}
                </Tag>
            ),
            filters: deviceStatusOptions.map(option => ({ text: option.label, value: option.value })),
            onFilter: (value, record) => record.status === value.toString()
        },
        {
            title: '位置',
            dataIndex: 'location',
            key: 'location',
            render: (text: string) => text || '-'
        },
        {
            title: '能源类型',
            dataIndex: 'energyType',
            key: 'energyType',
            render: (text: string) => text || '-',
            filters: energyTypeOptions.map(option => ({ text: option.label, value: option.value })),
            onFilter: (value, record) => record.energyType === value.toString()
        },
        {
            title: '功率(W)',
            dataIndex: 'powerRating',
            key: 'powerRating',
            render: (value: number) => value ? value.toFixed(2) : '-',
            sorter: (a: Device, b: Device) => (a.powerRating || 0) - (b.powerRating || 0)
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: Device) => (
                <Space size="middle">
                    <a onClick={() => navigate(`/devices/${record.id}`)}>详情</a>
                    <a onClick={() => handleEdit(record.id)}>编辑</a>
                </Space>
            ),
        },
    ];

    // 过滤和搜索处理函数
    const handleTypeChange = (value: string | undefined) => {
        dispatch(setFilters({ ...filters, type: value }));
    };

    const handleStatusChange = (value: string | undefined) => {
        dispatch(setFilters({ ...filters, status: value }));
    };

    const handleLocationChange = (value: string | undefined) => {
        dispatch(setFilters({ ...filters, location: value }));
    };

    const handleSearchChange = (value: string) => {
        dispatch(setSearchTerm(value));
    };

    const handleResetFilters = () => {
        dispatch(resetFilters());
    };

    const handleRefresh = () => {
        dispatch(fetchDevices());
    };

    return (
        <Card
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={4} style={{ margin: 0 }}>设备管理</Title>
                    <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        loading={loading}
                    >
                        刷新
                    </Button>
                </div>
            }
        >
            {/* 错误提示 */}
            {error && (
                <Alert
                    message="错误"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

            {/* 筛选区域 */}
            <div style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Search
                            placeholder="搜索设备名称或ID"
                            allowClear
                            enterButton={<SearchOutlined />}
                            onSearch={handleSearchChange}
                            value={searchTerm}
                        />
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="设备类型"
                            style={{ width: '100%' }}
                            allowClear
                            onChange={handleTypeChange}
                            value={filters.type}
                        >
                            {deviceTypeOptions.map(option => (
                                <Option key={option.value} value={option.value}>{option.label}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="设备状态"
                            style={{ width: '100%' }}
                            allowClear
                            onChange={handleStatusChange}
                            value={filters.status}
                        >
                            {deviceStatusOptions.map(option => (
                                <Option key={option.value} value={option.value}>{option.label}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Button
                            icon={<ClearOutlined />}
                            onClick={handleResetFilters}
                            disabled={Object.keys(filters).length === 0 && !searchTerm}
                        >
                            重置筛选
                        </Button>
                    </Col>
                    <Col span={4}>
                        <Button
                            type="primary"
                            onClick={() => navigate('/devices/add')}
                        >
                            添加设备
                        </Button>
                    </Col>
                </Row>
            </div>

            {/* 设备统计 */}
            <div style={{ marginBottom: 16 }}>
                <Space size="large">
                    <span>设备总数: <strong>{devices.length}</strong></span>
                    <span>激活设备: <strong>{devices.filter(d => d.isActive).length}</strong></span>
                    <span>维护中: <strong>{devices.filter(d => d.status === 'maintenance').length}</strong></span>
                </Space>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* 设备列表表格 */}
            <Spin spinning={loading} tip="加载中...">
                <Table
                    columns={columns}
                    dataSource={devices}
                    rowKey="id"
                    pagination={{
                        defaultPageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条记录`,
                    }}
                    scroll={{ x: 1200 }}
                    locale={{ emptyText: '暂无设备数据' }}
                />
            </Spin>

            {/* 添加编辑模态框 */}
            <Modal
                title="编辑设备"
                visible={isEditModalVisible}
                onCancel={handleEditCancel}
                footer={null}
                destroyOnClose
                width={700}
            >
                {selectedDevice && (
                    <DeviceForm
                        initialValues={selectedDevice}
                        onSuccess={handleEditSuccess}
                        onCancel={handleEditCancel}
                    />
                )}
            </Modal>
        </Card>
    );
};

export default DeviceList; 