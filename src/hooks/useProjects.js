import { useCallback, useEffect } from 'react';
import { fetchProjects } from '../api/projectApi.js';
import { useProjectStore } from '../stores/useProjectStore.js';

export function useProjects() {
  const projects = useProjectStore((state) => state.projects);
  const status = useProjectStore((state) => state.projectsStatus);
  const selectProject = useProjectStore((state) => state.selectProject);
  const currentProject = useProjectStore((state) => state.currentProject);

  const load = useCallback(async ({ force = false } = {}) => {
    const state = useProjectStore.getState();

    if (!force && state.projects.length > 0) {
      return state.projects;
    }

    if (!force && state.projectsStatus === 'loading') {
      return [];
    }

    state.setProjectsStatus('loading');

    try {
      const nextProjects = await fetchProjects();
      state.setProjects(nextProjects);
      return nextProjects;
    } catch (loadError) {
      state.setProjectsStatus('error', loadError);
      return [];
    }
  }, []);

  useEffect(() => {
    if (projects.length === 0 && status !== 'loading') {
      load();
    }
  }, [load, projects.length, status]);

  return {
    projects,
    currentProject,
    selectProject,
  };
}
