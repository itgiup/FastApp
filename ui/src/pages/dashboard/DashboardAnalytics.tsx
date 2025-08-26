import { Row, Col, Card, Typography, Statistic } from 'antd';
import {
    UserOutlined,
    LineChartOutlined,
    RiseOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

const { Title, Text, } = Typography;

// Dữ liệu mock cho các số liệu thống kê
const analyticsKpis = [
    {
        title: 'Người dùng hoạt động',
        value: 856,
        icon: <UserOutlined />,
        description: 'trong 30 ngày qua',
    },
    {
        title: 'Tăng trưởng người dùng',
        value: '15.4%',
        icon: <RiseOutlined />,
        description: 'so với tháng trước',
    },
    {
        title: 'Số phiên trung bình',
        value: 3.5,
        icon: <LineChartOutlined />,
        description: 'mỗi người dùng',
    },
];

// Dữ liệu mock cho biểu đồ đường (Lượt truy cập theo tuần)
const visitsData = [
    { name: 'Tuần 1', visits: 1200 },
    { name: 'Tuần 2', visits: 1800 },
    { name: 'Tuần 3', visits: 1500 },
    { name: 'Tuần 4', visits: 2200 },
];

const getLineChartOptions = () => ({
    tooltip: {
        trigger: 'axis',
    },
    xAxis: {
        type: 'category',
        data: visitsData.map((d) => d.name),
    },
    yAxis: {
        type: 'value',
    },
    series: [
        {
            name: 'Lượt truy cập',
            type: 'line',
            data: visitsData.map((d) => d.visits),
            smooth: true,
            lineStyle: {
                color: '#52c41a',
            },
        },
    ],
});

// Dữ liệu mock cho biểu đồ tròn (Phân phối thiết bị)
const deviceDistributionData = [
    { value: 65, name: 'Desktop' },
    { value: 25, name: 'Mobile' },
    { value: 10, name: 'Tablet' },
];

const getPieChartOptions = () => ({
    tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
        orient: 'vertical',
        left: 'left',
        data: deviceDistributionData.map((d) => d.name),
    },
    series: [
        {
            name: 'Phân phối thiết bị',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: deviceDistributionData,
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
            },
        },
    ],
});

const DashboardAnalytics = () => {
    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>Phân tích</Title>

            {/* 1. Phần KPIs */}
            <Row gutter={[16, 16]}>
                {analyticsKpis.map((kpi, index) => (
                    <Col xs={24} sm={12} lg={8} key={index}>
                        <Card>
                            <Statistic
                                title={kpi.title}
                                value={kpi.value}
                                prefix={kpi.icon}
                                valueStyle={{ color: '#096dd9' }}
                            />
                            <Text type="secondary" style={{ marginTop: 8 }}>
                                {kpi.description}
                            </Text>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                {/* 2. Biểu đồ đường */}
                <Col xs={24} lg={12}>
                    <Card title="Lượt truy cập trang web theo tuần">
                        <ReactECharts
                            option={getLineChartOptions()}
                            style={{ height: 300 }}
                            notMerge={true}
                            lazyUpdate={true}
                        />
                    </Card>
                </Col>

                {/* 3. Biểu đồ tròn */}
                <Col xs={24} lg={12}>
                    <Card title="Phân phối thiết bị">
                        <ReactECharts
                            option={getPieChartOptions()}
                            style={{ height: 300 }}
                            notMerge={true}
                            lazyUpdate={true}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardAnalytics;