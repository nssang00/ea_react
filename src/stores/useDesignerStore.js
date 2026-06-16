import { create } from 'zustand';

export const useDesignerStore = create((set, get) => ({
  model: null,
  modelProjectId: null,
  modelByProjectId: {},
  modelStatusByProjectId: {},
  modelErrorByProjectId: {},
  selectedElementId: null,
  dirty: false,

  setProjectModelStatus: (projectId, status, error = null) => {
    set((state) => ({
      modelStatusByProjectId: {
        ...state.modelStatusByProjectId,
        [projectId]: status,
      },
      modelErrorByProjectId: {
        ...state.modelErrorByProjectId,
        [projectId]: error,
      },
    }));
  },

  setProjectModel: (projectId, model) => {
    const firstElementId = Object.keys(model.elementsById)[0];
    set((state) => ({
      model,
      modelProjectId: projectId,
      modelByProjectId: {
        ...state.modelByProjectId,
        [projectId]: model,
      },
      modelStatusByProjectId: {
        ...state.modelStatusByProjectId,
        [projectId]: 'loaded',
      },
      modelErrorByProjectId: {
        ...state.modelErrorByProjectId,
        [projectId]: null,
      },
      selectedElementId: firstElementId,
      dirty: false,
    }));
  },

  activateProjectModel: (projectId) => {
    const model = get().modelByProjectId[projectId];
    if (!model) return false;

    const selectedElementId = get().selectedElementId;
    const hasSelectedElement = selectedElementId && model.elementsById[selectedElementId];
    const firstElementId = Object.keys(model.elementsById)[0];

    set({
      model,
      modelProjectId: projectId,
      selectedElementId: hasSelectedElement ? selectedElementId : firstElementId,
      dirty: false,
    });

    return true;
  },

  selectElement: (id) => set({ selectedElementId: id }),

  updateElement: (id, patch) => {
    const model = get().model;
    const current = model?.elementsById[id];
    if (!current) return;

    set((state) => {
      const model = state.model;
      const nextModel = {
        ...model,
        elementsById: {
          ...model.elementsById,
          [id]: { ...current, ...patch },
        },
      };

      return {
        model: nextModel,
        modelByProjectId: model
          ? { ...state.modelByProjectId, [state.modelProjectId]: nextModel }
          : state.modelByProjectId,
        dirty: true,
      };
    });
  },

  updateProperty: (id, key, value) => {
    const model = get().model;
    const current = model?.elementsById[id];
    if (!current) return;

    set((state) => {
      const model = state.model;
      const nextModel = {
        ...model,
        elementsById: {
          ...model.elementsById,
          [id]: {
            ...current,
            properties: {
              ...current.properties,
              [key]: value,
            },
          },
        },
      };

      return {
        model: nextModel,
        modelByProjectId: model
          ? { ...state.modelByProjectId, [state.modelProjectId]: nextModel }
          : state.modelByProjectId,
        dirty: true,
      };
    });
  },

  updateMembers: (id, members) => {
    const model = get().model;
    const current = model?.elementsById[id];
    if (!current) return;

    set((state) => {
      const model = state.model;
      const nextModel = {
        ...model,
        elementsById: {
          ...model.elementsById,
          [id]: {
            ...current,
            properties: {
              ...current.properties,
              members,
            },
          },
        },
      };

      return {
        model: nextModel,
        modelByProjectId: model
          ? { ...state.modelByProjectId, [state.modelProjectId]: nextModel }
          : state.modelByProjectId,
        dirty: true,
      };
    });
  },
}));
