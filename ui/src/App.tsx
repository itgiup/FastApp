import { type FC, useState, useEffect, useRef } from 'react'
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useStoreDispatch, useStore } from "./store/hooks";
import {
  Button, Col, ConfigProvider, Drawer, Dropdown, Flex,
  Layout, Menu, message, notification, Popover, Row, Space, Switch, theme,
} from 'antd';
import type { MenuProps } from 'antd';
import { DownOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons';
import * as appStore from './store/app';
import i18n from './services/i18n';
import './App.scss'

import { useTranslation } from 'react-i18next';
import Logo from './assets/logo.svg?react';


import 'flag-icon-css/css/flag-icons.min.css';
import { appContext, services, startServices } from './services';
import { Loading } from './components/Loading';
import { createGQLClient } from './services/graphQLClient';
import { BtnCopy } from './components';
import { User } from './components/users';

type MenuItem = Required<MenuProps>['items'][number];
const { Header, Content, Footer } = Layout;
const { defaultAlgorithm, darkAlgorithm } = theme;


const languages = appStore.getLanguages();

const languagesMenu: MenuProps['items'] = languages.map(({ lang, name: label, country }) => ({
  key: lang,
  label: <>
    <span className={`flag-icon flag-icon-${country}`} style={{ marginRight: 8 }}></span>
    {label}
  </>,
}));


const donations: {
  chainName: string,
  address: string
}[] = [
    {
      chainName: 'Bitcoin',
      address: 'bc1qe6fetuymcz0xruduhnxkz5tmael8lgg7tmgp0p'
    },
    {
      chainName: 'USDT (TRC20)',
      address: 'TXPYCeV8EHB8r7kG5PECPGc8NUou3AkUAR'
    },
    {
      chainName: 'TON (The Open Network)',
      address: 'EQAxEGqQYehBYv3Yz9WgBF25NfbSv6Mpo8rYHoAe01fCwc_2'
    },
    {
      chainName: 'BNB Chain',
      address: '0xC1c6f942838D5865918795E7Fa63C6897a3d5757'
    },
    {
      chainName: 'Solana',
      address: 'BMiSYg295gkJ3c2SXLng9qyaXb3nbmrqbtGU8spKGpTD'
    },
    {
      chainName: 'Ethereum',
      address: '0xC1c6f942838D5865918795E7Fa63C6897a3d5757'
    },
    {
      chainName: 'Cosmos',
      address: 'cosmos1cgqs7t0xm7jl46hucau2hqp4smmsppg2qw7wd5'
    },

  ];


const App: FC = () => {
  const dispatch = useStoreDispatch();
  const appSettings = useStore((state) => state.app);
  const location = useLocation();
  const mounted = useRef(false);
  const [_, setRenderCount] = useState(0);
  const reRender = () => setRenderCount(pre => pre + 1);
  const [loading, setLoading] = useState(true);
  const [states] = useState<{ appSettings: appStore.InitialType }>({ appSettings });
  // states.appSettings = appSettings;

  const { t } = useTranslation();

  const [messageApi, messageApiHolder] = message.useMessage();
  const [notificationApi, notificationApiHolder] = notification.useNotification();


  useEffect(() => {
    appContext.message = messageApi;
    appContext.notification = notificationApi;
  }, [messageApi, notificationApi])

  const navigate = useNavigate();

  const [current, setCurrent] = useState<string>(location.pathname);

  const [drawerVisible, setDrawerVisible] = useState(false);

  // Responsive breakpoint, Update isMobile on window resize
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
      notificationApi.error({
        message: t('Failed to change theme'),
        description: error.message ?? error,
      });
    });
  };

  /** load store  */
  async function loadStore() {
    await dispatch(appStore.load());
  }



  // didmount effect to load initial settings
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;

      loadStore()
        .then(() => {
          setLoading(false);
          const GQLClient = createGQLClient(states.appSettings.apiUrl, states.appSettings.apiWsUrl);
          appContext.graphQLClient = GQLClient;

          /** chạy service  */
          startServices();
        })
        .catch((err: any) => {
          console.error(err)
        });
      return () => { }
    }
    mounted.current = true;
  }, []);

  useEffect(() => {
    i18n.changeLanguage(appSettings.language)
      .then(() => {
      })
      .catch((err) => {
        console.error("Failed to change language:", err);
        messageApi.error("Failed to change language");
      });
  }, [appSettings.language]);

  useEffect(() => {
    document.title = appSettings.title;
  }, [appSettings.title]);


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


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
    // eslint-disable-next-line
  }, [location.pathname]);


  const onClickMenu: MenuProps['onClick'] = (e) => {

    // Skip handling for language and theme switch
    if (['language', 'theme'].includes(e.key)) {
      return;
    }
    // No need to change if the same menu item is clicked
    else if (e.key === current) {
      return;
    }
    // If the key is not a valid path, skip the history update
    else if (!e.key.startsWith('/')) {
      console.warn(`Menu item with key "${e.key}" is not a valid path.`);
      return;
    } else {
      // Update current state and push new path to history
      setCurrent(e.key);
    }
  }

  const menuIems: MenuItem[] = [
    // Logo
    {
      key: '/',
      label: <Logo
        style={{
          width: 40,
          height: 40,
          marginBottom: isMobile ? -14 : -19,
          color: 'red',
        }}
      />,
    },
    // generate-wallets
    {
      key: '/generate-wallets',
      label: t('menu.Generate wallets'),
      children: [
        {
          key: '/generate-wallets/tron',
          label: <Link to="/generate-wallets/tron">Tron (TRX)</Link>,
        },
        {
          key: '/generate-wallets/icp',
          label: <Link to="/generate-wallets/icp">Internet Computer (ICP)</Link>,
        },
      ]
    },
    // about
    {
      key: '/about',
      label: t('menu.about'),
    },
    // settings
    {
      key: '/settings',
      label: t('menu.settings'),
    },
  ];

  const menuSettings: MenuItem[] = [
    // theme
    {
      key: 'theme',
      label: <Switch
        checked={appSettings.theme === 'dark'}
        onChange={changeTheme}
        checkedChildren="🌙"
        unCheckedChildren="☀️"
        size='small'
      />,
    },
    // language
    {
      key: 'language',
      icon: <img src="/images/language.png" alt="Language" />,
      label:
        <Dropdown menu={{
          items: languagesMenu, onClick: (e) => {
            changeLanguage(e.key);
          }
        }}>
          <a>
            <Space>
              {languages.find(l => l.lang === appSettings.language)?.name || t('Select Language')}
              <DownOutlined />
            </Space>
          </a>
        </Dropdown>
      ,
    },
    // user
    {
      key: 'user',
      label: <Popover content={<>
        <User />
      </>}
      ><UserOutlined /></Popover>,
      onClick: () => navigate('/user')
    }
  ];

  if (loading) return <Loading />;

  return (
    <ConfigProvider
      theme={{
        algorithm: [
          appSettings.theme === 'dark' ? darkAlgorithm : defaultAlgorithm
        ],
      }}>
      <Layout style={{ minHeight: window.innerHeight * 0.98 }}>
        <Header>

          {isMobile ? (
            <>
              <Button
                icon={<MenuOutlined />}
                type="text"
                onClick={() => setDrawerVisible(true)}
                style={{ fontSize: 24, color: '#fff' }}
              />
              <Drawer
                title={appSettings.title}
                placement="left"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                styles={{ body: { padding: 0 } }}
                width='auto'
              >
                <Menu
                  onClick={e => {
                    onClickMenu(e);
                    setDrawerVisible(false);
                  }}
                  selectedKeys={[current]}
                  mode="inline"
                  items={menuIems}
                />
                <Flex justify="start" gap={16} style={{ padding: 10 }}>
                  <Space>
                    {/* user */}
                    <Popover content={<>
                      <User />
                    </>}
                    ><UserOutlined /></Popover>

                    {/* theme */}
                    <Switch
                      checked={appSettings.theme === 'dark'}
                      onChange={changeTheme}
                      checkedChildren="🌙"
                      unCheckedChildren="☀️"
                    />

                    {/* language */}
                    <Dropdown.Button
                      icon={<DownOutlined />}
                      menu={{
                        items: languagesMenu, onClick: (e) => {
                          changeLanguage(e.key);
                        }
                      }}>
                      <img src="/images/language.png" alt="Language" style={{ width: '1em', height: '1em' }} />
                      {languages.find(l => l.lang === appSettings.language)?.name || 'Select Language'}
                    </Dropdown.Button>
                  </Space>
                </Flex>

              </Drawer>
            </>
          ) : (
            <Menu
              onClick={onClickMenu}
              selectedKeys={[current]}
              mode="horizontal"
              items={[...menuIems, ...menuSettings]}
            />
          )}

        </Header>

        <Content style={{ padding: '10px' }}>
          <Outlet />
        </Content>

        <Footer style={{ textAlign: 'center' }}>
          {/* Donations */}
          <h3>{t("Donations")}:</h3>
          <Row justify="center" className="footer-donations" gutter={24}>

            {donations.map((w, idx) => (
              <Col key={w.chainName + idx} className='footer-donations-address' xs={24} sm={12} md={8} lg={6} xl={4} style={{ marginBottom: 16 }}>
                <h4>{w.chainName}: <BtnCopy value={w.address} /></h4>

                <span style={{
                  userSelect: 'all',
                  display: 'inline-block',
                  maxWidth: '100%',
                  wordBreak: 'break-all',
                  overflowWrap: 'break-word'
                }}>
                  {w.address}
                </span>

              </Col>
            ))}

          </Row>

          {/* copy right */}
          <Row justify="center" className='footer-row' gutter={24}>
            <Col>{appSettings.title} ©{appSettings.copyYear} v{appSettings.version} </Col>
            <Col>
              <a className="menu__link" target="_blank" href="/about">@{appSettings.author}</a>
              <a className="menu__link" target="_blank" href="/">_</a>
            </Col>
            <Col>All Rights Reserved</Col>
          </Row>
        </Footer>

        {messageApiHolder}
        {notificationApiHolder}
      </Layout>
    </ConfigProvider>
  )
}

export default App
