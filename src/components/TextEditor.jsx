import { Input } from 'antd';

export default function TextEditor({ value, onChange }) {
  return (
    <Input.TextArea
      autoSize={{ minRows: 8, maxRows: 20 }}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      spellCheck={false}
      style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
    />
  );
}
