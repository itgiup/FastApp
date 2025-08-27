
import React, { useState, useEffect } from 'react';
import {
    Form, Input, Button, Card, Typography, Divider,
    message, Checkbox, Row, Col, Alert
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    WalletOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { registerSchema, registerSchemaWeb3, type RegisterMode } from '../../schemas/user';
import type { Web3Account } from '../../schemas/web3';


// Type inference from Zod schema
type RegisterFormData = z.infer<typeof registerSchema>;
const { Title, Text } = Typography;

// Utility function to validate field with Zod
const validateField = (fieldName: keyof RegisterFormData, value: any, isWeb3Mode: boolean = false): string | undefined => {
    try {
        const schema = isWeb3Mode ? registerSchemaWeb3 : registerSchema;

        // Create partial object for single field validation
        const partialData = { [fieldName]: value } as Partial<RegisterFormData>;

        // Validate only the specific field
        schema.pick({ [fieldName]: true } as any).parse(partialData);
        return undefined;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return error.errors[0]?.message;
        }
        return 'Validation error';
    }
};


const Signup: React.FC = () => {
    const [form] = Form.useForm<RegisterFormData>();
    const [loading, setLoading] = useState<boolean>(false);
    const [web3Loading, setWeb3Loading] = useState<boolean>(false);
    const [web3Account, setWeb3Account] = useState<Web3Account | null>(null);
    const [isWeb3Available, setIsWeb3Available] = useState<boolean>(false);
    const [registerMode, setRegisterMode] = useState<RegisterMode>('normal');

    useEffect(() => {
        setIsWeb3Available(typeof window.ethereum !== 'undefined');
    }, []);

    const connectWallet = async (): Promise<void> => {
        if (!window.ethereum) {
            message.error('Vui lòng cài đặt MetaMask hoặc ví Web3 khác!');
            return;
        }

        setWeb3Loading(true);
        try {
            const accounts: string[] = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });

            if (accounts.length > 0) {
                const address: string = accounts[0];

                const balance: string = await window.ethereum.request({
                    method: 'eth_getBalance',
                    params: [address, 'latest'],
                });

                const ethBalance: string = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);

                setWeb3Account({
                    address,
                    balance: ethBalance,
                });

                setRegisterMode('web3');
                message.success('Kết nối ví thành công!');
            }
        } catch (error: any) {
            message.error('Không thể kết nối ví: ' + error.message);
        } finally {
            setWeb3Loading(false);
        }
    };

    const disconnectWallet = (): void => {
        setWeb3Account(null);
        setRegisterMode('normal');
        message.info('Đã ngắt kết nối ví');
    };

    const onFinish = async (values: RegisterFormData): Promise<void> => {
        setLoading(true);
        try {
            // Validate with Zod before submission
            const schema = registerMode === 'web3' ? registerSchemaWeb3 : registerSchema;
            const validatedData = schema.parse(values);

            // Simulate API call
            await new Promise<void>(resolve => setTimeout(resolve, 2000));

            if (registerMode === 'web3' && web3Account) {
                message.success(`Đăng ký thành công với ví ${web3Account.address.slice(0, 6)}...${web3Account.address.slice(-4)}!`);
                console.log('Web3 Registration:', {
                    walletAddress: web3Account.address,
                    ...validatedData
                });
            } else {
                message.success('Đăng ký tài khoản thành công!');
                console.log('Normal Registration:', validatedData);
            }

            form.resetFields();
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                console.log(error);

                // Handle Zod validation errors
                const firstError = error.message.errors[0];
                message.error(`Validation error: ${firstError.message}`);
            } else {
                message.error('Đăng ký thất bại. Vui lòng thử lại!');
            }
        } finally {
            setLoading(false);
        }
    };

    const validateConfirmPassword = (_: any, value: string): Promise<void> => {
        if (!value || form.getFieldValue('password') === value) {
            return Promise.resolve();
        }
        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
    };

    // Password strength indicator
    const getPasswordStrength = (password: string): { strength: number; color: string; text: string } => {
        if (!password) return { strength: 0, color: '#d9d9d9', text: '' };

        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[@$!%*?&]/.test(password)) score++;

        if (score <= 2) return { strength: score * 20, color: '#ff4d4f', text: 'Yếu' };
        if (score <= 3) return { strength: score * 20, color: '#faad14', text: 'Trung bình' };
        if (score <= 4) return { strength: score * 20, color: '#52c41a', text: 'Mạnh' };
        return { strength: 100, color: '#52c41a', text: 'Rất mạnh' };
    };

    return (
        <div className="register-container">
            <Card className="register-card">
                <div className="title-section">
                    <Title level={2}>Đăng Ký Tài Khoản</Title>
                    <Text type="secondary">
                        Tạo tài khoản mới hoặc đăng ký bằng ví Web3
                    </Text>
                </div>

                {isWeb3Available && (
                    <div style={{ marginBottom: 24 }}>
                        {!web3Account ? (
                            <Button
                                type="dashed"
                                icon={<WalletOutlined />}
                                onClick={connectWallet}
                                loading={web3Loading}
                                block
                                size="large"
                                className="web3-button"
                            >
                                Kết nối ví Web3
                            </Button>
                        ) : (
                            <Alert
                                message="Ví đã kết nối"
                                description={
                                    <div className="wallet-info">
                                        <div>
                                            <strong>Địa chỉ:</strong>{' '}
                                            {`${web3Account.address.slice(0, 10)}...${web3Account.address.slice(-8)}`}
                                        </div>
                                        <div>
                                            <strong>Số dư:</strong> {web3Account.balance} ETH
                                        </div>
                                        <Button
                                            type="link"
                                            size="small"
                                            onClick={disconnectWallet}
                                            style={{ padding: 0, marginTop: 4 }}
                                        >
                                            Ngắt kết nối
                                        </Button>
                                    </div>
                                }
                                type="success"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />
                        )}

                        {web3Account && <Divider>hoặc điền thêm thông tin</Divider>}
                    </div>
                )}

                <Form
                    form={form}
                    name="register"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                    requiredMark={false}
                >
                    <Form.Item
                        name="username"
                        label="Tên đăng nhập"
                        rules={[
                            {
                                validator: (_, value) => {
                                    const error = validateField('username', value);
                                    return error ? Promise.reject(new Error(error)) : Promise.resolve();
                                }
                            }
                        ]}
                        validateTrigger={['onBlur', 'onChange']}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Nhập tên đăng nhập (3-20 ký tự, chỉ chữ cái, số và _)"
                            maxLength={20}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            {
                                validator: (_, value) => {
                                    // Skip validation if Web3 mode and email is empty
                                    if (registerMode === 'web3' && !value) {
                                        return Promise.resolve();
                                    }
                                    const error = validateField('email', value, registerMode === 'web3');
                                    return error ? Promise.reject(new Error(error)) : Promise.resolve();
                                }
                            }
                        ]}
                        validateTrigger={['onBlur', 'onChange']}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder={registerMode === 'web3' ? 'Nhập email (tùy chọn)' : 'Nhập địa chỉ email'}
                            maxLength={100}
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="password"
                                label="Mật khẩu"
                                rules={[
                                    {
                                        validator: (_, value) => {
                                            const error = validateField('password', value);
                                            return error ? Promise.reject(new Error(error)) : Promise.resolve();
                                        }
                                    }
                                ]}
                                validateTrigger={['onBlur', 'onChange']}
                                hasFeedback
                            >
                                <Input.Password
                                    placeholder="Nhập mật khẩu (8+ ký tự, chữ hoa, thường, số, ký tự đặc biệt)"
                                    maxLength={50}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="confirmPassword"
                                label="Xác nhận mật khẩu"
                                dependencies={['password']}
                                rules={[
                                    {
                                        validator: (_, value) => {
                                            const password = form.getFieldValue('password');
                                            if (!value) {
                                                return Promise.reject(new Error('Vui lòng xác nhận mật khẩu'));
                                            }
                                            if (password !== value) {
                                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                                validateTrigger={['onBlur', 'onChange']}
                                hasFeedback
                            >
                                <Input.Password
                                    placeholder="Nhập lại mật khẩu"
                                    maxLength={50}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="agreeTerms"
                        valuePropName="checked"
                        rules={[
                            {
                                validator: (_, value: boolean) => {
                                    const error = validateField('agreeTerms', value);
                                    return error ? Promise.reject(new Error(error)) : Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Checkbox>
                            Tôi đồng ý với{' '}
                            <a href="#" target="_blank" rel="noopener noreferrer">
                                Điều khoản sử dụng
                            </a>
                            {' '}và{' '}
                            <a href="#" target="_blank" rel="noopener noreferrer">
                                Chính sách bảo mật
                            </a>
                        </Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                            className={registerMode === 'web3' ? 'web3-success-btn' : ''}
                        >
                            {registerMode === 'web3' ? 'Đăng ký với Web3' : 'Đăng ký tài khoản'}
                        </Button>
                    </Form.Item>
                </Form>

                <div className="login-link">
                    <Text type="secondary">
                        Đã có tài khoản?{' '}
                        <Link to="/user/login" style={{ fontWeight: 500 }}>
                            Đăng nhập ngay
                        </Link>
                    </Text>
                </div>

                {registerMode === 'web3' && (
                    <div className="web3-note">
                        <span>
                            💡 Bạn đang đăng ký với ví Web3. Tài khoản sẽ được liên kết với địa chỉ ví của bạn.
                        </span>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Signup;