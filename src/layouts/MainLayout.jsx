import { Layout } from 'antd';
import TopBar from './TopBar.jsx';
import WorkbenchLayout from './WorkbenchLayout.jsx';

export default function MainLayout() {
  return (
    <Layout className="app-shell">
      <TopBar />
      <WorkbenchLayout />
    </Layout>
  );
}
