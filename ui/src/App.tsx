import { type FC, useState, useEffect, useRef } from 'react'
import { Outlet, } from "react-router-dom";
import { useStoreDispatch, useStore } from "./store/hooks";
import {
  Col, ConfigProvider,
  Layout, message, notification, Row, theme,
} from 'antd';
import * as appStore from './store/app';
import i18n from './services/i18n';
import './App.scss'

import 'flag-icon-css/css/flag-icons.min.css';
import { appContext, startServices } from './services';
import { Loading } from './components/Loading';
import { createGQLClient } from './services/graphQLClient';
import AppHeader from './components/AppHeader';
import Donations from './components/Donations';

const { Content, Footer } = Layout;
const { defaultAlgorithm, darkAlgorithm } = theme;



const App: FC = () => {
  const dispatch = useStoreDispatch();
  const appSettings = useStore((state) => state.app);
  const mounted = useRef(false);
  const [_, setRenderCount] = useState(0);
  // const reRender = () => setRenderCount(pre => pre + 1);
  const [loading, setLoading] = useState(true);
  const [states] = useState<{ appSettings: appStore.InitialType }>({ appSettings });
  // states.appSettings = appSettings;


  const [messageApi, messageApiHolder] = message.useMessage();
  const [notificationApi, notificationApiHolder] = notification.useNotification();


  useEffect(() => {
    appContext.message = messageApi;
    appContext.notification = notificationApi;
  }, [messageApi, notificationApi])


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



  if (loading) return <Loading />;

  return (
    <ConfigProvider
      theme={{
        algorithm: [
          appSettings.theme === 'dark' ? darkAlgorithm : defaultAlgorithm
        ],
      }}>
      <Layout style={{ minHeight: window.innerHeight * 0.98 }}>
        <AppHeader />


        <Content style={{ padding: '10px' }}>
          <Outlet />
        </Content>

        <Footer style={{ textAlign: 'center' }}>
          {/* Donations */}
          <Donations />

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
