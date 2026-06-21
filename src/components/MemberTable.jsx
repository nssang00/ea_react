import { Button, Input, InputNumber, Popconfirm, Select, Space, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const TYPE_KIND_OPTIONS = [
  'int8',
  'int16',
  'int32',
  'int64',
  'uint8',
  'uint16',
  'uint32',
  'uint64',
  'float32',
  'float64',
  'float128',
  'byte',
  'boolean',
  'char8',
  'char16',
  'string',
  'wstring',
  'struct',
  'array',
  'sequence',
].map((value) => ({ label: value, value }));

export default function MemberTable({ members, onAddMember, onPatchMember, onRemoveMember }) {
  const renderTextInput = (record, index, field) => (
    <Input
      value={record[field]}
      onChange={(event) => onPatchMember(index, { [field]: event.target.value })}
    />
  );

  const columns = [
    {
      title: 'name',
      dataIndex: 'name',
      render: (_, record, index) => renderTextInput(record, index, 'name'),
    },
    {
      title: 'kind',
      dataIndex: 'kind',
      render: (_, record, index) => (
        <Select
          options={TYPE_KIND_OPTIONS}
          value={record.kind}
          onChange={(kind) => onPatchMember(index, normalizeMemberKind(record, kind))}
        />
      ),
    },
    {
      title: 'type',
      dataIndex: 'type',
      render: (_, record, index) => (
        needsElementType(record.kind)
          ? renderTextInput(record, index, 'type')
          : null
      ),
    },
    {
      title: 'bound',
      dataIndex: 'bound',
      render: (_, record, index) => renderBoundInput(record, index, onPatchMember),
    },
    {
      title: '',
      width: 80,
      render: (_, record, index) => (
        <Popconfirm title="Remove member?" onConfirm={() => onRemoveMember(index)}>
          <Button size="small" danger>Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Button icon={<PlusOutlined />} onClick={onAddMember} block>Add member</Button>
      <Table size="small" rowKey="name" columns={columns} dataSource={members} pagination={false} />
    </Space>
  );
}

function needsElementType(kind) {
  return ['array', 'sequence', 'struct'].includes(kind);
}

function normalizeMemberKind(member, kind) {
  const nextMember = { name: member.name, kind };

  if (kind === 'string' || kind === 'wstring') {
    nextMember.string_max_length = member.string_max_length ?? 255;
  }

  if (kind === 'array') {
    nextMember.type = member.type || 'float32';
    nextMember.array_dimensions = member.array_dimensions || [4];
  }

  if (kind === 'sequence') {
    nextMember.type = member.type || 'float32';
    nextMember.sequence_max_length = member.sequence_max_length ?? 32;
  }

  if (kind === 'struct') {
    nextMember.type = member.type || '';
  }

  return nextMember;
}

function renderBoundInput(record, index, onPatchMember) {
  if (record.kind === 'string' || record.kind === 'wstring') {
    return (
      <InputNumber
        min={1}
        value={record.string_max_length}
        onChange={(value) => onPatchMember(index, { string_max_length: value })}
      />
    );
  }

  if (record.kind === 'sequence') {
    return (
      <InputNumber
        min={1}
        value={record.sequence_max_length}
        onChange={(value) => onPatchMember(index, { sequence_max_length: value })}
      />
    );
  }

  if (record.kind === 'array') {
    return (
      <Input
        value={(record.array_dimensions || []).join(',')}
        onChange={(event) => onPatchMember(index, {
          array_dimensions: event.target.value
            .split(',')
            .map((item) => Number(item.trim()))
            .filter(Boolean),
        })}
      />
    );
  }

  return null;
}
