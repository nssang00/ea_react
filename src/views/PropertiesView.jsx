import PropertyForm from '../components/PropertyForm.jsx';
import { useElementProperties } from '../hooks/useElementProperties.js';
import { useMemberTable } from '../hooks/useMemberTable.js';

export default function PropertiesView() {
  const {
    element,
    formProperties,
    editorProperties,
    hasMembers,
    members,
    updateElement,
    updateProperty,
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
    />
  );
}
