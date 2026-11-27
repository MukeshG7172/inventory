import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Warehouse } from 'lucide-react';
import Alert from '../components/Alert';
import AuthShell from '../components/AuthShell';
import FormField from '../components/FormField';
import PasswordField from '../components/PasswordField';
import SubmitButton from '../components/SubmitButton';
import { useAuth } from '../context/useAuth';
import { useForm } from '../hooks/useForm';
import { ROLES } from '../utils/roles';
import { validateRegister } from '../utils/validation';

const ROLE_ICONS = { BUYER: Warehouse, SELLER: ShoppingBag };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const form = useForm(
    { username: '', email: '', password: '', role: 'BUYER' },
    async (values) => {
      await register(values);
      navigate('/login', { replace: true, state: { registered: true } });
    },
    validateRegister,
  );

  return (
    <AuthShell
      title="Create an account"
      subtitle="Tell us who you are and how you will use the vault."
      footer={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <form className="form" onSubmit={form.handleSubmit} noValidate>
        {form.error && <Alert onDismiss={form.dismissError}>{form.error.message}</Alert>}

        <FormField
          label="Username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={50}
          required
          {...form.field('username')}
        />
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          maxLength={100}
          required
          {...form.field('email')}
        />
        <PasswordField
          label="Password"
          autoComplete="new-password"
          hint="At least 6 characters."
          maxLength={100}
          required
          {...form.field('password')}
        />

        <fieldset className="choice-group">
          <legend>Role</legend>
          {Object.entries(ROLES).map(([value, role]) => {
            const Icon = ROLE_ICONS[value];
            return (
              <label key={value} className="choice">
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={form.values.role === value}
                  onChange={form.handleChange}
                />
                <Icon size={20} className="choice-icon" aria-hidden="true" />
                <span className="choice-text">
                  <span className="choice-title">
                    {role.label} <code>{value}</code>
                  </span>
                  <small>{role.description}</small>
                </span>
              </label>
            );
          })}
          {form.fieldErrors.role && <p className="field-error">{form.fieldErrors.role}</p>}
        </fieldset>

        <SubmitButton busy={form.submitting} busyLabel="Creating account…" className="btn-block">
          Create account
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
