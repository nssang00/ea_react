import { Empty, Typography } from 'antd';
import TextEditor from '../components/TextEditor.jsx';
import { useSelectedQosXml } from '../hooks/useSelectedQosXml.js';

const { Text } = Typography;

export default function QosView() {
  const { element, qosXml, hasElement, hasQosXml, updateQosXml } = useSelectedQosXml();

  if (!hasElement) {
    return <div className="empty-state">Select an element.</div>;
  }

  if (!hasQosXml) {
    return (
      <div className="workbench-view">
        <Empty description="Selected element has no QoS JSON." />
      </div>
    );
  }

  return (
    <div className="workbench-view">
      <Text type="secondary">QoS JSON for {element.name}</Text>
      <div style={{ marginTop: 12 }}>
        <TextEditor value={qosXml} onChange={updateQosXml} />
      </div>
    </div>
  );
}
