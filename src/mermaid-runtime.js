import mermaid from 'mermaid';

// This is intentionally a separate IIFE entry point. It is loaded on demand
// by useMermaidDiagram so the main application bundle does not include Mermaid.
window.MermaidRuntime = mermaid;
