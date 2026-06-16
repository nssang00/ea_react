import { useMemo } from 'react';
import { useWorkbenchModel } from './useWorkbenchModel.js';

export function useQosXmlProfiles() {
  const { model } = useWorkbenchModel();

  const profiles = useMemo(() => {
    if (!model) return [];

    return Object.values(model.elementsById).filter((element) => (
      typeof element.properties?.qosXml === 'string'
    ));
  }, [model]);

  return {
    profiles,
    hasProfiles: profiles.length > 0,
    qosXmlText: profiles
      .map((profile) => `<!-- ${profile.name} -->\n${profile.properties.qosXml}`)
      .join('\n\n'),
  };
}
