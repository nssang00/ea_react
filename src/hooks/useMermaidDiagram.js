import { useEffect, useMemo, useState } from 'react';
import { useWorkbenchModel } from './useWorkbenchModel.js';
import { generateMermaid } from '../utils/mermaidGenerator.js';

let mermaidRuntimePromise;

function loadMermaidRuntime() {
  if (window.MermaidRuntime) {
    return Promise.resolve(window.MermaidRuntime);
  }

  if (mermaidRuntimePromise) {
    return mermaidRuntimePromise;
  }

  mermaidRuntimePromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = './dist/mermaid-runtime.js';
    script.async = true;
    script.onload = () => {
      if (window.MermaidRuntime) {
        resolve(window.MermaidRuntime);
      } else {
        reject(new Error('Mermaid runtime did not initialize.'));
      }
    };
    script.onerror = () => reject(new Error('Mermaid runtime could not be loaded.'));
    document.head.appendChild(script);
  }).catch((error) => {
    mermaidRuntimePromise = undefined;
    throw error;
  });

  return mermaidRuntimePromise;
}

function initializeMermaid(mermaid) {
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

  return mermaid;
}

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
        const mermaid = initializeMermaid(await loadMermaidRuntime());
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
