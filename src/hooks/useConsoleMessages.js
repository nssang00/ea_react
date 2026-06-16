import { useMemo } from 'react';
import { useProjects } from './useProjects.js';
import { useWorkbenchModel } from './useWorkbenchModel.js';
import { generateModelSummary } from '../utils/documentGenerator.js';

export function useConsoleMessages() {
  const { model, dirty } = useWorkbenchModel();
  const { currentProject } = useProjects();

  return useMemo(() => {
    const summary = model
      ? generateModelSummary(model)
      : { topics: 0, structs: 0, qosProfiles: 0 };

    return [
      {
        level: 'info',
        message: currentProject
          ? `Project loaded: ${currentProject.name}`
          : 'Default model loaded',
      },
      {
        level: dirty ? 'warning' : 'success',
        message: dirty ? 'Model has unsaved changes' : 'Model state is clean',
      },
      {
        level: 'info',
        message: `Model summary: ${summary.topics} topics, ${summary.structs} struct types, ${summary.qosProfiles} QoS profiles`,
      },
    ];
  }, [currentProject, dirty, model]);
}
