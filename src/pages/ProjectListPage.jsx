import { Button, Card, List, Space, Typography } from 'antd';
import { useAuth } from '../hooks/useAuth.js';
import { useProjects } from '../hooks/useProjects.js';

const { Title, Text } = Typography;

export default function ProjectListPage() {
  const { setPage } = useAuth();
  const { projects, selectProject } = useProjects();

  const openProject = (project) => {
    selectProject(project.id);
    setPage('designer');
  };

  return (
    <div className="page-wrap">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3}>Projects</Title>
          <Text type="secondary">Sparx EA에서 변환된 JSON 모델을 프로젝트 단위로 관리하는 MVP 화면입니다.</Text>
        </div>

        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={projects}
          renderItem={(project) => (
            <List.Item>
              <Card title={project.name} extra={<Button onClick={() => openProject(project)}>Open</Button>}>
                <p>{project.description}</p>
                <Text type="secondary">Topics {project.topicCount} · Types {project.typeCount} · QoS {project.qosCount}</Text>
              </Card>
            </List.Item>
          )}
        />
      </Space>
    </div>
  );
}
