import React from 'react';
import { Form, Input, Button, Checkbox, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxHooks';
import { login, selectAuthStatus, selectAuthError } from '../../../store/slices/authSlice';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
`;

const StyledCard = styled(Card)`
  width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 24px;
  color: #1890ff;
`;

interface LoginFormValues {
    username: string;
    password: string;
    remember: boolean;
}

const LoginForm: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const authStatus = useAppSelector(selectAuthStatus);
    const authError = useAppSelector(selectAuthError);

    const onFinish = async (values: LoginFormValues) => {
        try {
            // 使用Redux的异步action处理登录
            const resultAction = await dispatch(login({
                username: values.username,
                password: values.password
            }));

            // 检查登录结果
            if (login.fulfilled.match(resultAction)) {
                message.success('登录成功');
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('登录失败', error);
        }
    };

    return (
        <Container>
            <StyledCard>
                <Title>物流园区碳排放管理系统</Title>
                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="用户名"
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="密码"
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>记住我</Checkbox>
                        </Form.Item>
                        <a style={{ float: 'right' }} href="#">
                            忘记密码
                        </a>
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            loading={authStatus === 'loading'}
                        >
                            登录
                        </Button>
                    </Form.Item>

                    {authError && (
                        <div style={{ color: 'red', textAlign: 'center' }}>
                            {authError}
                        </div>
                    )}
                </Form>
            </StyledCard>
        </Container>
    );
};

export default LoginForm; 