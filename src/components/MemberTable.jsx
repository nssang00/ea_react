import { Button, Input, Popconfirm, Space, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMemberTable } from '../hooks/useMemberTable.js';

export default function MemberTable({ elementId, members }) {
  const { patchMember, addMember, removeMember } = useMemberTable(elementId, members);
  const renderMemberInput = (record, field) => (
    <Input
      value={record[field]}
      onChange={(event) => patchMember(record.id, { [field]: event.target.value })}
    />
  );

  const columns = [
    {
      title: 'name',
      dataIndex: 'name',
      render: (_, record) => renderMemberInput(record, 'name'),
    },
    {
      title: 'type',
      dataIndex: 'type',
      render: (_, record) => renderMemberInput(record, 'type'),
    },
    {
      title: 'default',
      dataIndex: 'defaultValue',
      render: (_, record) => renderMemberInput(record, 'defaultValue'),
    },
    {
      title: '',
      width: 80,
      render: (_, record) => (
        <Popconfirm title="Remove member?" onConfirm={() => removeMember(record.id)}>
          <Button size="small" danger>Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Button icon={<PlusOutlined />} onClick={addMember} block>Add member</Button>
      <Table size="small" rowKey="id" columns={columns} dataSource={members} pagination={false} />
    </Space>
  );
}
