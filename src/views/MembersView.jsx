import { Empty } from 'antd';
import MemberTable from '../components/MemberTable.jsx';
import { useMemberTable } from '../hooks/useMemberTable.js';
import { useStructMembers } from '../hooks/useStructMembers.js';

export default function MembersView() {
  const { element, members } = useStructMembers();
  const { patchMember, addMember, removeMember } = useMemberTable(element?.id, members ?? []);

  if (!element) {
    return <div className="empty-state">Select an element.</div>;
  }

  if (!Array.isArray(members)) {
    return (
      <div className="workbench-view">
        <Empty description="Selected element has no members." />
      </div>
    );
  }

  return (
    <div className="workbench-view">
      <MemberTable
        members={members}
        onAddMember={addMember}
        onPatchMember={patchMember}
        onRemoveMember={removeMember}
      />
    </div>
  );
}
