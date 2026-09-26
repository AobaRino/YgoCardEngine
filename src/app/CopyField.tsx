import { useState } from 'react';
import { copyText } from '../lib/util';

interface Props {
  label: string;
  value: string;
  rows?: number;
  hint?: string;
}

export default function CopyField({ label, value, rows = 1, hint }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    setCopied(await copyText(value));
    setTimeout(() => setCopied(false), 1500);
  }

  const select = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => e.currentTarget.select();

  return (
    <div className="copy-field">
      <div className="copy-field-head">
        <strong>{label}</strong>
        <button className="btn small" onClick={copy}>
          {copied ? '已复制 ✓' : '复制'}
        </button>
      </div>
      {rows > 1 ? (
        <textarea className="input mono" readOnly rows={rows} value={value} onFocus={select} />
      ) : (
        <input className="input mono" readOnly value={value} onFocus={select} />
      )}
      {hint && <small className="muted">{hint}</small>}
    </div>
  );
}
