import { useMemo } from 'react';
import { useWorkbenchModel } from './useWorkbenchModel.js';
import { generateIdl } from '../utils/idlGenerator.js';

export function useGeneratedIdl() {
  const { model } = useWorkbenchModel();

  return {
    idlText: useMemo(() => model ? generateIdl(model) : '', [model]),
  };
}
