import { Button, Layout, Select, Space, Tag, Typography } from 'antd';
import { ProjectOutlined, TeamOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth.js';
import { useProjects } from '../hooks/useProjects.js';
import { useWorkbenchModel } from '../hooks/useWorkbenchModel.js';

const { Header } = Layout;
const { Text } = Typography;

export default function TopBar() {
  const { user, setPage, logout } = useAuth();

  const { projects, currentProject, selectProject } = useProjects();

  const { dirty } = useWorkbenchModel();

  const openProject = (projectId) => {
    selectProject(projectId);
    setPage('designer');
  };

  return (
    <Header className="app-header">
      <div className="app-title">System Designer</div>

      <Tag color={dirty ? 'orange' : 'green'}>
        {dirty ? 'modified' : 'clean'}
      </Tag>

      <Select
        className="project-switcher"
        placeholder="Select project"
        value={currentProject?.id}
        options={projects.map((project) => ({
          label: project.name,
          value: project.id,
        }))}
        onChange={openProject}
      />

      <Space className="header-actions">
        <Button
          size="small"
          icon={<ProjectOutlined />}
          onClick={() => setPage('projects')}
        >
          Manage
        </Button>

        <Button
          size="small"
          icon={<TeamOutlined />}
          onClick={() => setPage('users')}
        >
          Users
        </Button>

        <Text className="header-user">{user?.name}</Text>

        <Button size="small" onClick={logout}>
          Logout
        </Button>
      </Space>
    </Header>
  );
}
