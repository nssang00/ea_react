import { Empty } from 'antd';
import TextEditor from '../components/TextEditor.jsx';
import { useQosXmlProfiles } from '../hooks/useQosXmlProfiles.js';

export default function QosXmlView() {
  const { hasProfiles, qosXmlText } = useQosXmlProfiles();

  if (!hasProfiles) {
    return (
      <div className="workbench-view workbench-view--muted">
        <Empty description="No QoS XML profiles in this model." />
      </div>
    );
  }

  return (
    <div className="workbench-view workbench-view--muted">
      <TextEditor
        value={qosXmlText}
        onChange={() => {}}
      />
    </div>
  );
}
