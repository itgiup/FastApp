import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Switch,
    Space,
    Typography,
    message,
    Card,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    CheckCircleTwoTone,
    CloseCircleTwoTone,
} from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;

// Dữ liệu mock
const mockUsers = [
    {
        key: '1',
        id: 'user_1',
        username: 'john.doe',
        email: 'john.doe@example.com',
        isActive: true,
        isSuperuser: false,
        createdAt: '2023-01-15',
    },
    {
        key: '2',
        id: 'user_2',
        username: 'jane.smith',
        email: 'jane.smith@example.com',
        isActive: true,
        isSuperuser: true,
        createdAt: '2023-02-20',
    },
    {
        key: '3',
        id: 'user_3',
        username: 'peter.jones',
        email: 'peter.jones@example.com',
        isActive: false,
        isSuperuser: false,
        createdAt: '2023-03-10',
    },
];

const DashboardUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    // Load dữ liệu khi component được mount
    useEffect(() => {
        setLoading(true);
        // Giả lập API call
        setTimeout(() => {
            setUsers(mockUsers);
            setLoading(false);
        }, 1000);
    }, []);

    const handleAddUser = () => {
        setEditingUser(null);
        setIsModalVisible(true);
        form.resetFields();
    };

    const handleEditUser = (record) => {
        setEditingUser(record);
        setIsModalVisible(true);
        form.setFieldsValue(record);
    };

    const handleDeleteUser = (record) => {
        Modal.confirm({
            title: 'Xóa người dùng',
            content: `Bạn có chắc chắn muốn xóa người dùng "${record.username}"?`,
            okText: 'Xóa',
            cancelText: 'Hủy',
            onOk: () => {
                setUsers(users.filter((user) => user.key !== record.key));
                message.success('Đã xóa người dùng thành công!');
            },
        });
    };

    const handleSaveUser = () => {
        form.validateFields().then((values) => {
            if (editingUser) {
                // Cập nhật người dùng
                const updatedUsers = users.map((user) =>
                    user.key === editingUser.key ? { ...user, ...values } : user
                );
                setUsers(updatedUsers);
                message.success('Cập nhật người dùng thành công!');
            } else {
                // Thêm người dùng mới
                const newUser = {
                    key: Date.now().toString(),
                    id: `user_${Date.now()}`,
                    ...values,
                    createdAt: new Date().toISOString().split('T')[0],
                };
                setUsers([...users, newUser]);
                message.success('Thêm người dùng thành công!');
            }
            setIsModalVisible(false);
        });
    };

    const filteredUsers = users.filter((user) =>
        Object.values(user).some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const columns = [
        {
            title: 'Tên người dùng',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) =>
                isActive ? (
                    <CheckCircleTwoTone twoToneColor="#52c41a" />
                ) : (
                    <CloseCircleTwoTone twoToneColor="#ff4d4f" />
                ),
        },
        {
            title: 'Admin',
            dataIndex: 'isSuperuser',
            key: 'isSuperuser',
            render: (isSuperuser) =>
                isSuperuser ? (
                    <CheckCircleTwoTone twoToneColor="#52c41a" />
                ) : (
                    <CloseCircleTwoTone twoToneColor="#ff4d4f" />
                ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => handleEditUser(record)}>
                        Sửa
                    </Button>
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteUser(record)}>
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>Quản lý người dùng</Title>
                <Space>
                    <Search
                        placeholder="Tìm kiếm người dùng..."
                        onSearch={setSearchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                        enterButton={<SearchOutlined />}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
                        Thêm mới
                    </Button>
                </Space>
            </div>

            <Table
                dataSource={filteredUsers}
                columns={columns}
                loading={loading}
                pagination={{ pageSize: 10 }}
                rowKey="id"
            />

            <Modal
                title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
                visible={isModalVisible}
                onOk={handleSaveUser}
                onCancel={() => setIsModalVisible(false)}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="username"
                        label="Tên người dùng"
                        rules={[{ required: true, message: 'Vui lòng nhập tên người dùng!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="isActive" label="Hoạt động" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name="isSuperuser" label="Quản trị viên" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default DashboardUsers;