import { useStructMembers } from './useStructMembers.js';

export function useMemberTable(elementId, members) {
  const { updateMembers } = useStructMembers(elementId);

  const patchMember = (memberIndex, patch) => {
    updateMembers(
      elementId,
      members.map((member, index) => (index === memberIndex ? { ...member, ...patch } : member))
    );
  };

  const addMember = () => {
    const nextIndex = members.length + 1;
    updateMembers(elementId, [
      ...members,
      { name: `member${nextIndex}`, kind: 'string', string_max_length: 255 },
    ]);
  };

  const removeMember = (memberIndex) => {
    updateMembers(
      elementId,
      members.filter((_, index) => index !== memberIndex)
    );
  };

  return {
    patchMember,
    addMember,
    removeMember,
  };
}
