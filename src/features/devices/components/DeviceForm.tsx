import React from 'react';
import { Form, Input, Button, Select, DatePicker, message } from 'antd';
import { useDispatch } from 'react-redux';
import { createDevice, updateDevice } from '../../../store/slices/deviceSlice';
import { Device, DeviceFormData } from '../../../types/device';
import moment from 'moment';
import { useAppDispatch } from '../../../hooks/reduxHooks';

const { Option } = Select;
const { TextArea } = Input;

interface DeviceFormProps {
    initialValues?: Device;
    onSuccess: () => void;
    onCancel: () => void;
}

const DeviceForm: React.FC<DeviceFormProps> = ({ initialValues, onSuccess, onCancel }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const isEditing = !!initialValues;

    // 表单提交处理
    const onFinish = async (values: any) => {
        try {
            const deviceData: DeviceFormData = {
                name: values.name,
                type: values.type,
                status: values.status,
                location: values.location,
                installationDate: values.installationDate.format('YYYY-MM-DD'),
                lastCalibrationDate: values.lastCalibrationDate ? values.lastCalibrationDate.format('YYYY-MM-DD') : undefined,
                manufacturer: values.manufacturer,
                model: values.model,
                serialNumber: values.serialNumber,
                description: values.description
            };

            if (isEditing && initialValues) {
                await dispatch(updateDevice({ id: initialValues.id, data: deviceData }));
                message.success('设备更新成功');
            } else {
                await dispatch(createDevice(deviceData));
                message.success('设备添加成功');
            }

            onSuccess();
        } catch (error) {
            message.error(isEditing ? '设备更新失败' : '设备添加失败');
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={
                initialValues
                    ? {
                        ...initialValues,
                        installationDate: initialValues.installationDate ? moment(initialValues.installationDate) : null,
                        lastCalibrationDate: initialValues.lastCalibrationDate ? moment(initialValues.lastCalibrationDate) : null
                    }
                    : {
                        status: 'active'
                    }
            }
            onFinish={onFinish}
        >
            <Form.Item
                name="name"
                label="设备名称"
                rules={[{ required: true, message: '请输入设备名称' }]}
            >
                <Input placeholder="请输入设备名称" />
            </Form.Item>

            <Form.Item
                name="type"
                label="设备类型"
                rules={[{ required: true, message: '请选择设备类型' }]}
            >
                <Select placeholder="请选择设备类型">
                    <Option value="electric">电力设备</Option>
                    <Option value="heating">加热设备</Option>
                    <Option value="cooling">制冷设备</Option>
                    <Option value="transport">运输设备</Option>
                    <Option value="GATE">闸机</Option>
                    <Option value="CAMERA">摄像头</Option>
                    <Option value="WEIGHT_SCALE">称重设备</Option>
                    <Option value="SECURITY">安防设备</Option>
                    <Option value="CHARGING_STATION">充电站</Option>
                    <Option value="other">其他设备</Option>
                </Select>
            </Form.Item>

            <Form.Item
                name="status"
                label="设备状态"
                rules={[{ required: true, message: '请选择设备状态' }]}
            >
                <Select placeholder="请选择设备状态">
                    <Option value="active">运行中</Option>
                    <Option value="inactive">已停用</Option>
                    <Option value="maintenance">维护中</Option>
                </Select>
            </Form.Item>

            <Form.Item
                name="location"
                label="位置"
                rules={[{ required: true, message: '请输入设备位置' }]}
            >
                <Input placeholder="请输入设备位置" />
            </Form.Item>

            <Form.Item
                name="installationDate"
                label="安装日期"
                rules={[{ required: true, message: '请选择安装日期' }]}
            >
                <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="lastCalibrationDate" label="最后校准日期">
                <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
                name="manufacturer"
                label="制造商"
                rules={[{ required: true, message: '请输入制造商' }]}
            >
                <Input placeholder="请输入制造商" />
            </Form.Item>

            <Form.Item
                name="model"
                label="型号"
                rules={[{ required: true, message: '请输入型号' }]}
            >
                <Input placeholder="请输入型号" />
            </Form.Item>

            <Form.Item
                name="serialNumber"
                label="序列号"
                rules={[{ required: true, message: '请输入序列号' }]}
            >
                <Input placeholder="请输入序列号" />
            </Form.Item>

            <Form.Item name="description" label="描述">
                <TextArea rows={4} placeholder="请输入设备描述" />
            </Form.Item>

            <Form.Item>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button style={{ marginRight: 8 }} onClick={onCancel}>
                        取消
                    </Button>
                    <Button type="primary" htmlType="submit">
                        {isEditing ? '更新' : '添加'}
                    </Button>
                </div>
            </Form.Item>
        </Form>
    );
};

export default DeviceForm; 