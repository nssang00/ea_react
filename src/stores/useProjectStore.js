import { create } from 'zustand';

export const useProjectStore = create((set, get) => ({
  projects: [],
  projectsStatus: 'idle',
  projectsError: null,
  currentProject: null,

  setProjectsStatus: (status, error = null) => {
    set({ projectsStatus: status, projectsError: error });
  },

  setProjects: (projects) => {
    set({ projects, projectsStatus: 'loaded', projectsError: null });
  },

  selectProject: (projectId) => {
    const project = get().projects.find((item) => item.id === projectId) || null;
    set({ currentProject: project });
  },
}));
