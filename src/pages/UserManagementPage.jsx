import { Button, Card, Table, Typography } from 'antd';
import { useAuth } from '../hooks/useAuth.js';
import { mockUsers } from '../api/mockData.js';

const { Title, Text } = Typography;

export default function UserManagementPage() {
  const { setPage } = useAuth();

  return (
    <div className="page-wrap">
      <Button onClick={() => setPage('projects')}>← Back to Projects</Button>
      <Card style={{ marginTop: 16 }}>
        <Title level={3}>Users</Title>
        <Text type="secondary">MVP용 임의 사용자 목록입니다.</Text>
        <Table
          rowKey="id"
          style={{ marginTop: 16 }}
          dataSource={mockUsers}
          pagination={false}
          columns={[
            { title: 'Name', dataIndex: 'name' },
            { title: 'Email', dataIndex: 'email' },
            { title: 'Role', dataIndex: 'role' },
          ]}
        />
      </Card>
    </div>
  );
}
