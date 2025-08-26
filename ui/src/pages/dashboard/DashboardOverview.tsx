import { Row, Col, Card, Statistic, Typography, Space, List } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, UserOutlined, ShoppingCartOutlined, DollarOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

// Import component Echarts
import ReactECharts from 'echarts-for-react';

const { Title, Text } = Typography;

// Dữ liệu mock cho các số liệu thống kê
const kpiData = [
    {
        title: 'Tổng số người dùng',
        value: 1256,
        icon: <UserOutlined />,
        trend: 'up',
        trendValue: '11.2%',
        description: 'so với tháng trước',
    },
    {
        title: 'Tổng doanh thu',
        value: '52,800,000',
        prefix: <DollarOutlined />,
        icon: <ShoppingCartOutlined />,
        trend: 'up',
        trendValue: '5.6%',
        description: 'so với tháng trước',
    },
    {
        title: 'Lượt truy cập',
        value: 7890,
        icon: <UserOutlined />,
        trend: 'down',
        trendValue: '3.1%',
        description: 'so với tuần trước',
    },
];

// Dữ liệu mock cho biểu đồ
const chartData = [
    { name: 'Tháng 1', users: 4000, revenue: 2400 },
    { name: 'Tháng 2', users: 3000, revenue: 1398 },
    { name: 'Tháng 3', users: 2000, revenue: 9800 },
    { name: 'Tháng 4', users: 2780, revenue: 3908 },
    { name: 'Tháng 5', users: 1890, revenue: 4800 },
    { name: 'Tháng 6', users: 2390, revenue: 3800 },
];

// Dữ liệu mock cho hoạt động gần đây
const recentActivities = [
    { id: 1, user: 'Nguyễn Văn A', activity: 'đã đăng ký tài khoản mới.' },
    { id: 2, user: 'Trần Thị B', activity: 'đã cập nhật hồ sơ.' },
    { id: 3, user: 'Lê C', activity: 'đã đăng nhập thành công.' },
    { id: 4, user: 'Phạm D', activity: 'đã thực hiện giao dịch.' },
    { id: 5, user: 'Hoàng E', activity: 'đã thay đổi mật khẩu.' },
];

// Cấu hình Echarts
const getChartOptions = () => {
    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        legend: {
            data: ['Người dùng mới', 'Doanh thu']
        },
        xAxis: {
            type: 'category',
            data: chartData.map(item => item.name)
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: 'Người dùng mới',
                type: 'bar',
                data: chartData.map(item => item.users),
                itemStyle: { color: '#8884d8' }
            },
            {
                name: 'Doanh thu',
                type: 'bar',
                data: chartData.map(item => item.revenue),
                itemStyle: { color: '#82ca9d' }
            }
        ]
    };
};

const DashboardOverview = () => {
    const chartOptions = getChartOptions();

    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>Tổng quan Dashboard</Title>

            {/* 1. Phần KPIs */}
            <Row gutter={[16, 16]}>
                {kpiData.map((kpi, index) => (
                    <Col xs={24} sm={12} lg={8} key={index}>
                        <Card>
                            <Statistic
                                title={kpi.title}
                                value={kpi.value}
                                prefix={kpi.prefix}
                                valueStyle={{ color: kpi.trend === 'up' ? '#3f8600' : '#cf1322' }}
                            />
                            <Space style={{ marginTop: 8 }}>
                                {kpi.trend === 'up' ?
                                    <ArrowUpOutlined style={{ color: '#3f8600' }} /> :
                                    <ArrowDownOutlined style={{ color: '#cf1322' }} />
                                }
                                <Text style={{ color: kpi.trend === 'up' ? '#3f8600' : '#cf1322' }}>
                                    {kpi.trendValue}
                                </Text>
                                <Text type="secondary">{kpi.description}</Text>
                            </Space>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                {/* 2. Biểu đồ */}
                <Col xs={24} lg={16}>
                    <Card title="Thống kê người dùng và doanh thu">
                        {/* Sử dụng ReactECharts */}
                        <ReactECharts
                            option={chartOptions}
                            style={{ height: 300 }}
                            notMerge={true}
                            lazyUpdate={true}
                        />
                    </Card>
                </Col>

                {/* 3. Hoạt động gần đây */}
                <Col xs={24} lg={8}>
                    <Card title="Hoạt động gần đây">
                        <List
                            dataSource={recentActivities}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<UserOutlined />}
                                        title={<Link to={`/user/profile/${item.id}`}>{item.user}</Link>}
                                        description={item.activity}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardOverview;