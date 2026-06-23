import PropertyForm from '../components/PropertyForm.jsx';
import { useElementProperties } from '../hooks/useElementProperties.js';
import { useMemberTable } from '../hooks/useMemberTable.js';

export default function PropertiesView() {
  const {
    element,
    model,
    formProperties,
    editorProperties,
    hasMembers,
    members,
    updateElement,
    updateProperty,
    updateQosPath,
    qosFields,
  } = useElementProperties();
  const { patchMember, addMember, removeMember } = useMemberTable(element?.id, members ?? []);

  return (
    <PropertyForm
      editorProperties={editorProperties}
      element={element}
      formProperties={formProperties}
      hasMembers={hasMembers}
      members={members}
      onAddMember={addMember}
      onPatchMember={patchMember}
      onRemoveMember={removeMember}
      onUpdateElement={updateElement}
      onUpdateProperty={updateProperty}
      onUpdateQosProperty={(path, value) => {
        const profile = findProfile(element, model);
        if (profile) updateQosPath(profile.id, path, value);
      }}
      qosFields={qosFields}
    />
  );
}

function findProfile(element, model) {
  let current = element;
  while (current) {
    if (current.type === 'QosProfile') return current;
    current = model?.elementsById[current.parentId];
  }
  return null;
}
