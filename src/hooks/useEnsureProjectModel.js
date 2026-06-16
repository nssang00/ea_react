import { useCallback, useEffect } from 'react';
import { fetchProjectModel } from '../api/modelApi.js';
import { useDesignerStore } from '../stores/useDesignerStore.js';

export function useEnsureProjectModel(projectId) {
  const cachedModel = useDesignerStore((state) => projectId ? state.modelByProjectId[projectId] : null);
  const modelProjectId = useDesignerStore((state) => state.modelProjectId);
  const status = useDesignerStore((state) => projectId ? state.modelStatusByProjectId[projectId] : 'idle');
  const activateProjectModel = useDesignerStore((state) => state.activateProjectModel);

  const load = useCallback(async () => {
    if (!projectId) return;

    const state = useDesignerStore.getState();
    const existingModel = state.modelByProjectId[projectId];
    const existingStatus = state.modelStatusByProjectId[projectId];

    if (existingModel) {
      state.activateProjectModel(projectId);
      return;
    }

    if (existingStatus === 'loading') {
      return;
    }

    state.setProjectModelStatus(projectId, 'loading');

    try {
      const nextModel = await fetchProjectModel(projectId);
      state.setProjectModel(projectId, nextModel);
    } catch (loadError) {
      state.setProjectModelStatus(projectId, 'error', loadError);
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;

    if (cachedModel && modelProjectId !== projectId) {
      activateProjectModel(projectId);
      return;
    }

    if (!cachedModel && status !== 'loading') {
      load();
    }
  }, [activateProjectModel, cachedModel, load, modelProjectId, projectId, status]);
}
