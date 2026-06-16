import { Alert } from 'antd';
import { useMermaidDiagram } from '../hooks/useMermaidDiagram.js';

export default function MermaidView() {
  const { diagramSvg, renderError } = useMermaidDiagram();

  return (
    <div className="workbench-view workbench-view--muted mermaid-view">
      {renderError ? (
        <Alert
          type="error"
          showIcon
          message="Mermaid render failed"
          description={renderError}
        />
      ) : (
        <div
          className="mermaid-view__canvas"
          dangerouslySetInnerHTML={{ __html: diagramSvg }}
        />
      )}
    </div>
  );
}
