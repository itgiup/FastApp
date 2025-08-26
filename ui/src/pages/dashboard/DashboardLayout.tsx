import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import { SideMenu } from './components';

const { Content } = Layout;

function DashboardLayout() {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <SideMenu />
            <Layout style={{ marginLeft: 200 }}>
                <Content style={{ margin: '24px 16px', overflow: 'initial' }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}

export default DashboardLayout;