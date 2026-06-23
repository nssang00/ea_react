import { Checkbox, Collapse, Divider, Input, InputNumber, Select } from 'antd';

const RELIABILITY_OPTIONS = [{ label: 'RELIABLE', value: 'RELIABLE' }, { label: 'BEST_EFFORT', value: 'BEST_EFFORT' }];
const DURABILITY_OPTIONS = [{ label: 'VOLATILE', value: 'VOLATILE' }, { label: 'TRANSIENT_LOCAL', value: 'TRANSIENT_LOCAL' }, { label: 'TRANSIENT', value: 'TRANSIENT' }, { label: 'PERSISTENT', value: 'PERSISTENT' }];

export default function QosPropertyFields({ fields, onUpdate }) {
  if (!fields.length) return null;
  const groups = groupFields(fields);
  return (
    <>
      <Divider orientation="left">QoS Properties</Divider>
      <Collapse
        className="qos-property-groups"
        defaultActiveKey={groups.length === 1 ? [groups[0].key] : []}
        items={groups.map((group) => ({
          key: group.key,
          label: `${group.label} (${group.fields.length})`,
          children: <div className="qos-property-fields">
            {group.fields.map((field) => (
              <label className="qos-property-field" key={field.path} title={field.path}>
                <span>{relativePath(field.path, group.key)}</span>
                <FieldInput field={field} onUpdate={onUpdate} />
              </label>
            ))}
          </div>,
        }))}
      />
    </>
  );
}

function groupFields(fields) {
  return Object.values(fields.reduce((groups, field) => {
    const key = field.path.split('.')[0];
    groups[key] ??= { key, label: key.replace(/_qos$/, '').replace(/_/g, ' '), fields: [] };
    groups[key].fields.push(field);
    return groups;
  }, {}));
}

function relativePath(path, group) {
  const relative = path.slice(group.length).replace(/^\./, '');
  return relative || group;
}

function FieldInput({ field, onUpdate }) {
  if (typeof field.value === 'boolean') return <Checkbox checked={field.value} onChange={(event) => onUpdate(field.path, event.target.checked)} />;
  if (typeof field.value === 'number') return <InputNumber value={field.value} onChange={(value) => onUpdate(field.path, value)} />;
  if (field.path.endsWith('reliability.kind')) return <Select value={field.value} options={RELIABILITY_OPTIONS} onChange={(value) => onUpdate(field.path, value)} />;
  if (field.path.endsWith('durability.kind')) return <Select value={field.value} options={DURABILITY_OPTIONS} onChange={(value) => onUpdate(field.path, value)} />;
  return <Input value={Array.isArray(field.value) ? field.value.join(', ') : String(field.value ?? '')} onChange={(event) => onUpdate(field.path, event.target.value)} />;
}
