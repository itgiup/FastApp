import { type FC, useState, useRef, } from 'react';
import * as appStore from '../store/app';
import { useStoreDispatch, useStore } from '../store/hooks';
import { Layout, Button, Popconfirm, Flex, Switch, Dropdown, Space } from 'antd';
import type { MenuProps } from 'antd';
import { DownOutlined, } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { appContext } from '../services';

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
    const mounted = useRef(false);
    const { t } = useTranslation();


    function reRender() {
        setRenderCount(pre => pre + 1);
    }

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
        <h1>{t("Settings")}</h1>


        <Flex justify="start" gap={16}>
            <Space>
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
    </Content>);
};

export default Settings;