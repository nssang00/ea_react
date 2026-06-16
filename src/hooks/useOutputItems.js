import { useMemo } from 'react';
import { useWorkbenchModel } from './useWorkbenchModel.js';
import { generateModelSummary } from '../utils/documentGenerator.js';
import { generateIdl } from '../utils/idlGenerator.js';
import { generateMermaid } from '../utils/mermaidGenerator.js';

export function useOutputItems() {
  const { model } = useWorkbenchModel();

  return useMemo(() => {
    const summary = model
      ? generateModelSummary(model)
      : { topics: 0, structs: 0, qosProfiles: 0 };

    return [
      {
        id: 'idl',
        name: 'OMG IDL',
        status: summary.structs > 0 ? 'ready' : 'empty',
        detail: `${model ? generateIdl(model).length : 0} characters generated from ${summary.structs} structs`,
      },
      {
        id: 'mermaid',
        name: 'Mermaid Diagram',
        status: summary.structs + summary.topics > 0 ? 'ready' : 'empty',
        detail: `${model ? generateMermaid(model).split('\n').length : 0} diagram lines generated`,
      },
      {
        id: 'document',
        name: 'Model Document',
        status: 'pending',
        detail: 'Document export pipeline is not connected yet',
      },
    ];
  }, [model]);
}
