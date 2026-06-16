import TextEditor from '../components/TextEditor.jsx';
import { useGeneratedIdl } from '../hooks/useGeneratedIdl.js';

export default function IdlView() {
  const { idlText } = useGeneratedIdl();

  return (
    <div className="workbench-view workbench-view--muted">
      <TextEditor value={idlText} onChange={() => {}} />
    </div>
  );
}
