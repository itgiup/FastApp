import { type ChangeEvent, type FC, type FormEventHandler, useEffect, useState, } from 'react';
import * as appStore from '../store/app';
import { useStoreDispatch, useStore } from '../store/hooks';
import { Layout, Button, Popconfirm, Flex, Switch, Dropdown, Space, Input, Form } from 'antd';
import type { MenuProps } from 'antd';
import { DownOutlined, } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { appContext } from '../services';
import { BtnCopy, BtnPaste } from '../components';

const { Content } = Layout;

const languages = appStore.getLanguages();

const languagesMenu: MenuProps['items'] = languages.map(({ lang, name: label, country }) => ({
    key: lang,
    label: <>
        <span className={`flag-icon flag-icon-${country}`} style={{ marginRight: 8 }}></span>
        {label}
    </>,
}));


const Settings: FC = () => {
    const dispatch = useStoreDispatch();
    const appSettings = useStore((state) => state.app);
    const [_, setRenderCount] = useState(0);
    const reRender = () => setRenderCount(pre => pre + 1);
    const { t } = useTranslation();

    const [form] = Form.useForm();
    // const formValues = Form.useWatch([], form);

    const [funcs] = useState({
        onPaste: (text: string) => {
            's';
        },

        onChangeApiUrl: (e: ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target
            dispatch(appStore.change({ [name]: value }))
        },

        onChangeApiWsUrl: (e: ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target
            dispatch(appStore.change({ [name]: value }))
        }
    })

    useEffect(() => {
        console.log(appSettings);

        form.setFieldsValue({
            apiUrl: appSettings.apiUrl,
            apiWsUrl: appSettings.apiWsUrl,
        })
    }, [appSettings])

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

    // Set the document title
    if (typeof document !== 'undefined') {
        document.title = t('Settings');
    }

    return (<Content>
        <Flex align='start' vertical gap={'small'}>
            <h1>{t("Settings")}</h1>

            <Form form={form}>
                <Space>
                    <Form.Item label='api url'>
                        {/* theme */}
                        <Switch
                            checked={appSettings.theme === 'dark'}
                            onChange={changeTheme}
                            checkedChildren="🌙"
                            unCheckedChildren="☀️"
                        />
                    </Form.Item>

                    {/* language */}
                    <Form.Item>
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
                    </Form.Item>

                </Space>

                <Form.Item label='api url' name={'apiUrl'}>
                    <Input placeholder='api url' name={'apiUrl'}
                        suffix={<BtnCopy value={appSettings.apiUrl} />}
                        prefix={<BtnPaste onPaste={funcs.onPaste} />}
                        // value={appSettings.apiUrl}
                        onChange={funcs.onChangeApiUrl}
                    />
                </Form.Item>

                <Form.Item label='api url websocket' name={'apiWsUrl'}>
                    <Input placeholder='api url websocket' name={'apiWsUrl'}
                        suffix={<BtnCopy value={appSettings.apiWsUrl} />}
                        prefix={<BtnPaste onPaste={funcs.onPaste} />}
                        // value={appSettings.apiWsUrl}
                        onChange={funcs.onChangeApiWsUrl}
                    />
                </Form.Item>
            </Form>

            <Popconfirm
                title={t("Are you sure to reset settings?")}
                onConfirm={() => {
                    dispatch(appStore.reset());
                    appContext.message?.success(t("Settings have been reset to default."));

                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }}
                okText={t("Yes")}
                cancelText={t("No")}
            >
                <Button

                    style={{
                        padding: '8px 16px',
                        background: '#f5222d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        marginTop: 16,
                    }}
                >
                    {t("Reset Settings")}
                </Button>
            </Popconfirm>
        </Flex>
    </Content>);
};

export default Settings;