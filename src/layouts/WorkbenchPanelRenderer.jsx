import { Tabs } from 'antd';

export default function WorkbenchPanelRenderer({ panel }) {
  return (
    <Tabs
      className={`workbench-panel workbench-panel--${panel.id}`}
      defaultActiveKey={panel.defaultActiveView ?? panel.views[0]?.id}
      items={panel.views.map(({ component: View, id, label }) => ({
        key: id,
        label,
        children: <View />,
      }))}
    />
  );
}
