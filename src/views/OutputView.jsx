import { List, Tag, Typography } from 'antd';
import { useOutputItems } from '../hooks/useOutputItems.js';

const { Text } = Typography;

export default function OutputView() {
  const outputs = useOutputItems();

  return (
    <div className="workbench-view workbench-view--muted output-view">
      <List
        size="small"
        dataSource={outputs}
        renderItem={(item) => (
          <List.Item className="output-view__item">
            <div className="output-view__meta">
              <Text strong>{item.name}</Text>
              <Text type="secondary">{item.detail}</Text>
            </div>
            <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
          </List.Item>
        )}
      />
    </div>
  );
}

function getStatusColor(status) {
  if (status === 'ready') return 'green';
  if (status === 'empty') return 'default';
  return 'blue';
}
