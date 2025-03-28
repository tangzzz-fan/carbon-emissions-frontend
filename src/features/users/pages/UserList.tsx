import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Button, Input, Modal, Form, Select, message, Tag, Space } from 'antd';
import { PlusOutlined, SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import api from '../../../services/api';
import { canEdit } from '../../../services/auth.service';

const { Option } = Select;

interface User {
    isActive: boolean;
    id: number;
    username: string;
    email: string;
    role: string;
    createdAt: string;
    lastLogin: string;
}

interface UserFormValues {
    username: string;
    email: string;
    password?: string;
    role: string;
    isActive: boolean;
}

const UserList: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const [form] = Form.useForm();

    // 组件挂载时检查管理员权限
    useEffect(() => {
        if (!canEdit()) {
            message.error('您没有权限访问此页面');
            navigate('/dashboard');
        }
    }, [navigate]);

    // 获取用户列表
    useEffect(() => {
        fetchUsers();
    }, [pagination.current, pagination.pageSize]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: pagination.current,
                limit: pagination.pageSize
            };

            if (searchText) {
                params.search = searchText;
            }

            const response = await api.get('/users', { params });
            setUsers(response.data.data);
            setPagination({
                ...pagination,
                total: response.data.total
            });
        } catch (error) {
            message.error('获取用户列表失败');
        } finally {
            setLoading(false);
        }
    };

    // 搜索用户
    const handleSearch = () => {
        setPagination({ ...pagination, current: 1 });
        fetchUsers();
    };

    // 处理表格分页变化
    const handleTableChange = (newPagination: any) => {
        setPagination({
            current: newPagination.current,
            pageSize: newPagination.pageSize,
            total: pagination.total
        });
    };

    // 添加/编辑用户
    const showModal = (user?: User) => {
        if (user) {
            setIsEditing(true);
            setCurrentUser(user);
            form.setFieldsValue({
                username: user.username,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            });
        } else {
            setIsEditing(false);
            setCurrentUser(null);
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    // 提交表单
    const handleSubmit = async (values: UserFormValues) => {
        try {
            let submitData = { ...values };

            if (isEditing) {
                // 如果是编辑模式且没有输入密码，删除密码字段
                if (!values.password || values.password.trim() === '') {
                    delete submitData.password;
                }

                await api.put(`/users/${currentUser!.id}`, submitData);
                message.success('用户更新成功');
            } else {
                await api.post('/users', submitData);
                message.success('用户添加成功');
            }
            setIsModalVisible(false);
            fetchUsers();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || (isEditing ? '用户更新失败' : '用户添加失败');
            message.error(errorMsg);
            console.error('提交失败:', errorMsg, error);
        }
    };

    // 删除用户 - 使用Modal.confirm直接调用
    const handleDelete = (id: number) => {
        console.log('删除按钮被点击, 用户ID:', id);

        // 直接使用Modal.confirm而非解构的confirm
        Modal.confirm({
            title: '确认删除此用户?',
            icon: <ExclamationCircleOutlined />,
            content: '删除后将无法恢复，是否继续？',
            okText: '确认',
            okType: 'danger',
            cancelText: '取消',
            onOk: async () => {
                try {
                    console.log(`开始删除用户，ID: ${id}`);
                    const response = await api.delete(`/users/${id}`);
                    console.log('删除用户响应:', response.data);
                    message.success('用户删除成功');
                    fetchUsers();
                } catch (error: any) {
                    console.error('删除用户失败:', error);
                    const errorMsg = error.response?.data?.message || '用户删除失败';
                    message.error(errorMsg);
                    console.error('错误详情:', error.response?.data);
                }
            },
            // 添加onCancel回调以确保正常工作
            onCancel() {
                console.log('取消删除用户');
            },
        });
    };

    // 表格列定义
    const columns = [
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username'
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => {
                let color = 'blue';
                let text = role;

                if (role === 'admin') {
                    color = 'red';
                    text = '管理员';
                } else if (role === 'manager') {
                    color = 'orange';
                    text = '经理';
                } else if (role === 'operator') {
                    color = 'green';
                    text = '操作员';
                } else if (role === 'viewer') {
                    color = 'default';
                    text = '查看者';
                }

                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: '状态',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => {
                return isActive ?
                    <Tag color="green">活跃</Tag> :
                    <Tag color="volcano">禁用</Tag>;
            }
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt'
        },
        {
            title: '最后登录',
            dataIndex: 'lastLogin',
            key: 'lastLogin',
            render: (lastLogin: string) => lastLogin || '-'
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: User) => (
                <Space>
                    <Button type="link" onClick={() => showModal(record)}>
                        编辑
                    </Button>
                    <Button
                        type="link"
                        danger
                        onClick={(e) => {
                            e.stopPropagation(); // 防止事件冒泡
                            console.log('删除按钮点击，记录:', record.id);
                            handleDelete(record.id);
                        }}
                    >
                        删除
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div>
            <h2>用户管理</h2>

            <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <Input
                            placeholder="搜索用户名或邮箱"
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            style={{ width: 250, marginRight: 8 }}
                            onPressEnter={handleSearch}
                        />
                        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                            搜索
                        </Button>
                    </div>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                        添加用户
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条记录`
                    }}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </Card>

            <Modal
                title={isEditing ? '编辑用户' : '添加用户'}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="username"
                        label="用户名"
                        rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <Input placeholder="请输入用户名" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[
                            { required: true, message: '请输入邮箱' },
                            { type: 'email', message: '请输入有效的邮箱地址' }
                        ]}
                    >
                        <Input placeholder="请输入邮箱" />
                    </Form.Item>

                    {!isEditing && (
                        <Form.Item
                            name="password"
                            label="密码"
                            rules={[{ required: true, message: '请输入密码' }]}
                        >
                            <Input.Password placeholder="请输入密码" />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="role"
                        label="角色"
                        rules={[{ required: true, message: '请选择角色' }]}
                    >
                        <Select placeholder="请选择角色">
                            <Option value="admin">管理员</Option>
                            <Option value="manager">经理</Option>
                            <Option value="operator">操作员</Option>
                            <Option value="viewer">查看者</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label="状态"
                        initialValue={true}
                    >
                        <Select>
                            <Option value={true}>活跃</Option>
                            <Option value={false}>禁用</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button style={{ marginRight: 8 }} onClick={() => setIsModalVisible(false)}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {isEditing ? '更新' : '添加'}
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserList; 