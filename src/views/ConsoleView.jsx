import { List, Tag, Typography } from 'antd';
import { useConsoleMessages } from '../hooks/useConsoleMessages.js';

const { Text } = Typography;

export default function ConsoleView() {
  const messages = useConsoleMessages();

  return (
    <div className="workbench-view workbench-view--muted console-view">
      <List
        size="small"
        dataSource={messages}
        renderItem={(item) => (
          <List.Item className="console-view__item">
            <Tag className="console-view__level" color={getLevelColor(item.level)}>
              {item.level}
            </Tag>
            <Text>{item.message}</Text>
          </List.Item>
        )}
      />
    </div>
  );
}

function getLevelColor(level) {
  if (level === 'success') return 'green';
  if (level === 'warning') return 'orange';
  return 'blue';
}
