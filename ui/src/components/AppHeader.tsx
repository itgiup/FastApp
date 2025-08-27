import { useEffect, useState } from "react";
import { Typography, Layout, Menu, Button, Drawer, Switch, Dropdown, type MenuProps, Flex, Grid, Space, Popover } from "antd";
import { MenuOutlined, DownOutlined, UserOutlined, } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStore } from "../store/hooks";
import Logo from "./Logo";
import { useAppDispatch } from "../store";
import * as appStore from "../store/app";
import { appContext } from "../services";
import { User } from "./users";
import { useAuth } from "./users/AuthContext";


type MenuItem = Required<MenuProps>['items'][number];
const { Title } = Typography
const { Header } = Layout;
const { useBreakpoint } = Grid;

const languages = appStore.getLanguages();

const languagesMenu: MenuProps['items'] = languages.map(({ lang, name: label, country }) => ({
    key: lang,
    label: <>
        <span className={`flag-icon flag-icon-${country}`} style={{ marginRight: 8 }}></span>
        {label}
    </>,
}));

export const AppHeader = () => {
    const appSettings = useStore((state) => state.app);
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const screens = useBreakpoint();
    // const [_, setRenderCount] = useState(0);
    // const reRender = () => setRenderCount(pre => pre + 1);

    const navigate = useNavigate();
    const location = useLocation();
    const [current, setCurrent] = useState<string>(location.pathname);
    const selectedKeys = [location.pathname.substring(1) || 'home'];
    const { isLoggedIn } = useAuth()

    // khi current thay đổi thì route tới đó 
    useEffect(() => {
        if (current !== location.pathname) {
            window.history.pushState({}, '', current);
            navigate(current);
        }
    }, [current]);

    // Update current state when location changes
    useEffect(() => {
        if (location.pathname !== current) {
            setCurrent(location.pathname);
        }
    }, [location.pathname]);

    const changeLanguage = (value: string) => {
        dispatch(appStore.change({
            language: value
        }));
    };

    const changeTheme = (checked: boolean) => {
        // Dispatch the change to the store
        dispatch(appStore.change({
            theme: checked ? 'dark' : 'light'
        })).catch((error) => {
            console.error("Failed to change theme:", error);
            appContext.notification?.error({
                message: t('Failed to change theme'),
                description: error.message ?? error,
            });
        });
    };

    const menuItems: MenuItem[] = [
        // generate-wallets
        {
            key: 'generate-wallets',
            label: t('menu.Generate wallets'),
            children: [
                {
                    key: 'generate-wallets/tron',
                    label: <Link to="/generate-wallets/tron">Tron (TRX)</Link>,
                },
                {
                    key: 'generate-wallets/icp',
                    label: <Link to="/generate-wallets/icp">Internet Computer (ICP)</Link>,
                },
            ]
        },
        // about
        {
            key: 'about',
            label: <Link to='/about' >{t('menu.about')}</Link>,
        },
        // settings
        {
            key: 'settings',
            label: <Link to='/settings' >{t('menu.settings')}</Link>,
        },
    ];

    return (

        <Header style={{ padding: "0 16px", background: appSettings.theme === 'dark' ? '#141414' : '#ffffff' }}>
            <Flex align="center" justify="space-between">
                {/* Bên trái */}
                <Flex align="center" gap={'small'}>
                    <Link to="/">
                        <Flex gap={'small'}>
                            <Logo />
                            {screens.md && (
                                <Title level={4} style={{ margin: 0 }}>
                                    {appSettings.title}
                                </Title>
                            )}
                        </Flex>
                    </Link>

                    {/* Desktop menu */}
                    {screens.md && (
                        <div className="desktop-menu">
                            <Menu mode="horizontal" items={menuItems} selectedKeys={selectedKeys} />
                        </div>
                    )}

                    {/* Mobile menu toggle */}
                    {!screens.md && (<Button
                        className="mobile-menu-button"
                        icon={<MenuOutlined />}
                        onClick={() => setDrawerVisible(true)}
                    />)}
                </Flex>

                {/* Bên phải (Actions) */}
                <Flex align="center" gap={'small'}>

                    <Popover
                        content={<>
                            <User />
                        </>}
                    >
                        <Link to={'/user'}><UserOutlined style={{ color: isLoggedIn ? 'green' : 'auto' }} /></Link>
                    </Popover>

                    <Switch
                        checked={appSettings.theme === 'dark'}
                        onChange={changeTheme}
                        checkedChildren="🌙"
                        unCheckedChildren="☀️"
                        size='small'
                    />

                    <Dropdown menu={{
                        items: languagesMenu, onClick: (e) => {
                            changeLanguage(e.key);
                        }
                    }}>
                        <a>
                            <Space>
                                <img src="/images/language.png" alt="Language" style={{ width: '1em', height: '1em' }} />
                                {languages.find(l => l.lang === appSettings.language)?.name || t('Select Language')}
                                <DownOutlined />
                            </Space>
                        </a>
                    </Dropdown>
                </Flex>
            </Flex>

            {/* Mobile Drawer */}
            <Drawer
                title="Menu"
                placement="left"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
            >
                <Menu
                    style={{ width: '100%' }}
                    mode="inline"
                    items={menuItems}
                    selectedKeys={selectedKeys}
                />
                <br />
                <Flex gap={'small'}>
                    <Switch
                        checked={appSettings.theme === 'dark'}
                        onChange={changeTheme}
                        checkedChildren="🌙"
                        unCheckedChildren="☀️"
                        size='small'
                    />

                    <Dropdown menu={{
                        items: languagesMenu, onClick: (e) => {
                            changeLanguage(e.key);
                        }
                    }}>
                        <a>
                            <Space>
                                <img src="/images/language.png" alt="Language" style={{ width: '1em', height: '1em' }} />
                                {languages.find(l => l.lang === appSettings.language)?.name || t('Select Language')}
                                <DownOutlined />
                            </Space>
                        </a>
                    </Dropdown>

                    <Popover
                        content={<>
                            <User />
                        </>}
                    ><a><UserOutlined style={{ color: isLoggedIn ? 'green' : 'auto' }} /></a></Popover>
                </Flex>
            </Drawer>
        </Header>
    );
};

export default AppHeader;