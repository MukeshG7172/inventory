import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import FormField from './FormField';

export default function PasswordField(props) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <FormField
      {...props}
      type={visible ? 'text' : 'password'}
      spellCheck={false}
      autoCapitalize="none"
      adornment={
        <button
          type="button"
          className="btn btn-icon"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-controls={props.name}
        >
          <Icon size={18} aria-hidden="true" />
        </button>
      }
    />
  );
}
