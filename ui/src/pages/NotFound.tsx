import { Button, Typography } from "antd";
import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div style={{ padding: 48, textAlign: 'center' }}>
            <Typography.Title>404 - Page Not Found</Typography.Title>
            <Typography.Paragraph>
                Sorry, the page you're looking for doesn't exist.
            </Typography.Paragraph>
            <Link to="/">
                <Button type="primary">Go back to Home</Button>
            </Link>
        </div>
    );
}
