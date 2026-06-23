import { useEffect } from 'react';
import { Divider, Form, Input, InputNumber, Select, Typography } from 'antd';
import MemberTable from './MemberTable.jsx';
import QosPropertyFields from './QosPropertyFields.jsx';
import TextEditor from './TextEditor.jsx';

const { Text } = Typography;

const RELIABILITY_OPTIONS = [
  { label: 'RELIABLE', value: 'RELIABLE' },
  { label: 'BEST_EFFORT', value: 'BEST_EFFORT' },
];

const DURABILITY_OPTIONS = [
  { label: 'VOLATILE', value: 'VOLATILE' },
  { label: 'TRANSIENT_LOCAL', value: 'TRANSIENT_LOCAL' },
  { label: 'TRANSIENT', value: 'TRANSIENT' },
  { label: 'PERSISTENT', value: 'PERSISTENT' },
];

function fieldInputFor(key, value) {
  if (key === 'reliability') {
    return <Select options={RELIABILITY_OPTIONS} />;
  }

  if (key === 'durability') {
    return <Select options={DURABILITY_OPTIONS} />;
  }

  if (typeof value === 'number') {
    return <InputNumber style={{ width: '100%' }} />;
  }

  return <Input />;
}

export default function PropertyForm({
  editorProperties,
  element,
  formProperties,
  hasMembers,
  members,
  onAddMember,
  onPatchMember,
  onRemoveMember,
  onUpdateElement,
  onUpdateProperty,
  onUpdateQosProperty,
  qosFields,
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!element) return;
    form.setFieldsValue({ name: element.name, type: element.type, ...element.properties });
  }, [element, form]);

  if (!element) {
    return <div className="empty-state">Select an element.</div>;
  }

  return (
    <div className="workbench-view">
      <Text type="secondary">Selected ID: {element.id}</Text>

      <Divider orientation="left">Basic</Divider>
      <Form
        form={form}
        layout="vertical"
        onValuesChange={(changed) => {
          const [key, value] = Object.entries(changed)[0];
          if (key === 'name') onUpdateElement(element.id, { name: value });
          else if (key !== 'type') onUpdateProperty(element.id, key, value);
        }}
      >
        <Form.Item label="name" name="name"><Input /></Form.Item>
        <Form.Item label="type" name="type"><Input disabled /></Form.Item>

        {formProperties.map(([key, value]) => (
          <Form.Item key={key} label={key} name={key}>{fieldInputFor(key, value)}</Form.Item>
        ))}
      </Form>

      {hasMembers && (
        <>
          <Divider orientation="left">Struct Members</Divider>
          <MemberTable
            members={members}
            onAddMember={onAddMember}
            onPatchMember={onPatchMember}
            onRemoveMember={onRemoveMember}
          />
        </>
      )}

      <QosPropertyFields fields={qosFields} onUpdate={onUpdateQosProperty} />

      {editorProperties.map(([key, value]) => (
        <div key={key}>
          <Divider orientation="left">{key}</Divider>
          <TextEditor value={value} onChange={(nextValue) => onUpdateProperty(element.id, key, nextValue)} />
        </div>
      ))}
    </div>
  );
}
