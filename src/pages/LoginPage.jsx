import { Button, Card, Form, Input, Typography } from 'antd';
import { useAuth } from '../hooks/useAuth.js';

const { Title, Text } = Typography;

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="login-page">
      <Card className="login-card">
        <Title level={3}>RTI System Designer MVP</Title>
        <Text type="secondary">MVP용 임의 사용자로 로그인합니다.</Text>
        <Form
          layout="vertical"
          initialValues={{ email: 'admin@example.com', password: 'demo' }}
          onFinish={(values) => login(values)}
          style={{ marginTop: 24 }}
        >
          <Form.Item label="Email" name="email">
            <Input />
          </Form.Item>
          <Form.Item label="Password" name="password">
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
}
