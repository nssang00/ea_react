import { useStructMembers } from './useStructMembers.js';

export function useMemberTable(elementId, members) {
  const { updateMembers } = useStructMembers(elementId);

  const patchMember = (memberId, patch) => {
    updateMembers(
      elementId,
      members.map((member) => (member.id === memberId ? { ...member, ...patch } : member))
    );
  };

  const addMember = () => {
    const nextIndex = members.length + 1;
    updateMembers(elementId, [
      ...members,
      { id: `m-${Date.now()}`, name: `member${nextIndex}`, type: 'string', defaultValue: '' },
    ]);
  };

  const removeMember = (memberId) => {
    updateMembers(
      elementId,
      members.filter((member) => member.id !== memberId)
    );
  };

  return {
    patchMember,
    addMember,
    removeMember,
  };
}
