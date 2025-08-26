import { useState, useEffect } from 'react';
import { Menu, Layout } from 'antd';
import {
    DashboardOutlined,
    UsergroupAddOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from "../../../store/hooks";

const { Sider } = Layout;

const rootUri = '/dashboard/'

// Dữ liệu mock cho các mục menu
const menuItems = [
    {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        children: [
            { key: rootUri + 'overview', label: 'overview' },
            { key: rootUri + 'analytics', label: 'Phân tích' },
        ],
    },
    { key: rootUri + 'users', icon: <UsergroupAddOutlined />, label: 'Users' },
];

const SideMenu = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [openKeys, setOpenKeys] = useState([]);
    const appSettings = useStore((state) => state.app);

    // Cập nhật trạng thái menu khi URL thay đổi
    useEffect(() => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
            // Xác định mục được chọn (selectedKey)
            const selectedKey = `/${pathSegments.join('/')}`;
            setSelectedKeys([selectedKey]);

            // Mở sub-menu nếu cần
            if (pathSegments.length > 1) {
                const parentKey = `/${pathSegments[0]}`;
                setOpenKeys([parentKey]);
            }
        } else {
            setSelectedKeys(['/']);
        }
    }, [location.pathname]);

    const handleMenuClick = (e) => {
        navigate(e.key);
    };

    const handleOpenChange = (keys) => {
        setOpenKeys(keys);
    };

    return (
        <Sider collapsible width={200} style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }} theme={appSettings.theme}>
            <Menu
                theme={appSettings.theme}
                mode="inline"
                selectedKeys={selectedKeys}
                openKeys={openKeys}
                onOpenChange={handleOpenChange}
                onClick={handleMenuClick}
                items={menuItems}
            />
        </Sider>
    );
};

export default SideMenu;