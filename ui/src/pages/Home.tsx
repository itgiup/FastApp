import { type FC, useRef, useEffect, useState } from 'react';
import { Flex, Layout } from 'antd';
import { Helmet } from "react-helmet";

import { useStoreDispatch, useStore } from "../store/hooks";
import * as appStore from '../store/app';
import Wallets from '../components/Wallets';
import { useTranslation } from 'react-i18next';

const { Content } = Layout;

const Home: FC = () => {

    const dispatch = useStoreDispatch();
    const appSettings = useStore((state) => state.app);
    const [renderCount, setRenderCount] = useState(0);
    const mounted = useRef(false);
    const { t } = useTranslation();



    function reRender() {
        setRenderCount(pre => pre + 1);
    }

    // didmount effect to load initial settings
    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
        }
        mounted.current = true;
    }, []);

    return (<Content>
        <Helmet>
            <title>{t('about.title')} | Brand</title>
            <meta name="description" content={t('about.desc')} />
            <meta property="og:title" content={t('about.title')} />
            <meta property="og:description" content={t('about.desc')} />
            <meta property="twitter:title" content={t('about.title')} />
            <meta name="twitter:card" content="summary_large_image" />
        </Helmet>

        <h1>{t(appSettings.title)}</h1>
        <p>{t("Generate wallets")}</p>
        <p>
            {t("Enjoy fast, secure, and reliable")}
        </p>

        <Wallets />
    </Content>);
};

export default Home;