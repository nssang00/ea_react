import { create } from 'zustand';

export const useDesignerStore = create((set, get) => ({
  model: null,
  modelProjectId: null,
  modelByProjectId: {},
  modelStatusByProjectId: {},
  modelErrorByProjectId: {},
  selectedElementId: null,
  activeExplorerViewId: 'model',
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
  setActiveExplorerView: (id) => set({ activeExplorerViewId: id }),

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

  updateQosProperty: (id, entityKey, path, value) => {
    const model = get().model;
    const current = model?.elementsById[id];
    if (!current) return;

    set((state) => {
      const model = state.model;
      const nextProperties = updateNestedProperty(current.properties, [entityKey, ...path.split('.')], value);
      const nextElement = {
        ...current,
        properties: {
          ...nextProperties,
          qosJson: JSON.stringify(stripGeneratedProperties(nextProperties), null, 2),
        },
      };
      const nextModel = {
        ...model,
        ddsJson: updateDdsQosProfile(model.ddsJson, current.name, entityKey, path, value),
        elementsById: {
          ...model.elementsById,
          [id]: nextElement,
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

  updateQosPath: (profileId, path, value) => {
    const model = get().model;
    const profile = model?.elementsById[profileId];
    if (!profile || profile.type !== 'QosProfile') return;

    set((state) => {
      const currentProfile = state.model.elementsById[profileId];
      const nextProperties = updateNestedProperty(currentProfile.properties, path.split('.'), value);
      const nextProfile = {
        ...currentProfile,
        properties: {
          ...nextProperties,
          qosJson: JSON.stringify(stripGeneratedProperties(nextProperties), null, 2),
        },
      };
      const nextElementsById = Object.fromEntries(Object.entries(state.model.elementsById).map(([id, element]) => {
        if (id === profileId) return [id, nextProfile];
        if (element.type === 'QosPolicy' && element.properties?.policyPath) {
          const policyValue = readNestedProperty(nextProfile.properties, element.properties.policyPath.split('.'));
          return [id, {
            ...element,
            properties: {
              ...element.properties,
              qosJson: JSON.stringify(policyValue ?? {}, null, 2),
              ...primitiveProperties(policyValue),
            },
          }];
        }
        if (element.type === 'QosValue' && element.properties?.policyPath) {
          return [id, {
            ...element,
            properties: { ...element.properties, value: readNestedProperty(nextProfile.properties, element.properties.policyPath.split('.')) },
          }];
        }
        return [id, element];
      }));
      const nextModel = { ...state.model, elementsById: nextElementsById };
      return {
        model: nextModel,
        modelByProjectId: { ...state.modelByProjectId, [state.modelProjectId]: nextModel },
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

function updateNestedProperty(source, path, value) {
  const [key, ...rest] = path;

  if (!key) return value;

  return {
    ...source,
    [key]: rest.length > 0
      ? updateNestedProperty(source?.[key] ?? {}, rest, value)
      : value,
  };
}

function stripGeneratedProperties(properties) {
  const { qosJson, ...rest } = properties;
  return rest;
}

function readNestedProperty(source, path) {
  return path.reduce((value, key) => value?.[key], source);
}

function primitiveProperties(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item === null || typeof item !== 'object' || Array.isArray(item)));
}

function updateDdsQosProfile(ddsJson, profileName, entityKey, path, value) {
  const profiles = ddsJson?.qos?.qos_library?.qos_profiles;
  if (!Array.isArray(profiles)) return ddsJson;

  return {
    ...ddsJson,
    qos: {
      ...ddsJson.qos,
      qos_library: {
        ...ddsJson.qos.qos_library,
        qos_profiles: profiles.map((profile) => (
          profile.name === profileName
            ? updateNestedProperty(profile, [entityKey, ...path.split('.')], value)
            : profile
        )),
      },
    },
  };
}
