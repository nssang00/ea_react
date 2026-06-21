import { Tabs } from 'antd';
import { useDesignerStore } from '../stores/useDesignerStore.js';

export default function WorkbenchPanelRenderer({ panel }) {
  const setActiveExplorerView = useDesignerStore((state) => state.setActiveExplorerView);

  return (
    <Tabs
      className={`workbench-panel workbench-panel--${panel.id}`}
      defaultActiveKey={panel.defaultActiveView ?? panel.views[0]?.id}
      onChange={panel.id === 'explorer' ? setActiveExplorerView : undefined}
      items={panel.views.map(({ component: View, id, label }) => ({
        key: id,
        label,
        children: <View />,
      }))}
    />
  );
}
