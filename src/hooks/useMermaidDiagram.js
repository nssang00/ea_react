import { useEffect, useMemo, useState } from 'react';
import mermaid from 'mermaid';
import { useWorkbenchModel } from './useWorkbenchModel.js';
import { generateMermaid } from '../utils/mermaidGenerator.js';

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'base',
  themeVariables: {
    primaryColor: '#eef6ff',
    primaryBorderColor: '#1677ff',
    primaryTextColor: '#1f2937',
    lineColor: '#667085',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
});

export function useMermaidDiagram() {
  const { model } = useWorkbenchModel();
  const mermaidSource = useMemo(() => model ? generateMermaid(model) : 'classDiagram', [model]);
  const [diagramSvg, setDiagramSvg] = useState('');
  const [renderError, setRenderError] = useState('');

  useEffect(() => {
    let disposed = false;
    const diagramId = `mermaid-${Date.now()}`;

    async function renderDiagram() {
      try {
        const { svg } = await mermaid.render(diagramId, mermaidSource);
        if (!disposed) {
          setDiagramSvg(svg);
          setRenderError('');
        }
      } catch (error) {
        if (!disposed) {
          setDiagramSvg('');
          setRenderError(error.message);
        }
      }
    }

    renderDiagram();

    return () => {
      disposed = true;
    };
  }, [mermaidSource]);

  return {
    diagramSvg,
    renderError,
  };
}
