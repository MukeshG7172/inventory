import { Link, useLocation } from 'react-router-dom';
import { ApiError } from '../api/client';
import Alert from '../components/Alert';
import AuthShell from '../components/AuthShell';
import FormField from '../components/FormField';
import PasswordField from '../components/PasswordField';
import SubmitButton from '../components/SubmitButton';
import { useAuth } from '../context/useAuth';
import { useForm } from '../hooks/useForm';
import { validateLogin } from '../utils/validation';

export default function Login() {
  const { login } = useAuth();
  const { state } = useLocation();

  /* AuthShell redirects as soon as login() sets the session. */
  const form = useForm(
    { username: '', password: '' },
    async (values) => {
      try {
        await login(values);
      } catch (error) {
        /* The backend currently reports a wrong password as 500 "Bad credentials". */
        if (error.status === 401 || error.message === 'Bad credentials') {
          throw new ApiError(401, 'Incorrect username or password.');
        }
        throw error;
      }
    },
    validateLogin,
  );

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back. Enter your credentials to continue."
      footer={
        <>
          No account yet?{' '}
          <Link to="/register" state={state}>
            Create one
          </Link>
        </>
      }
    >
      <form className="form" onSubmit={form.handleSubmit} noValidate>
        {state?.registered && !form.attempted && (
          <Alert variant="success">Account created. You can sign in now.</Alert>
        )}
        {form.error && <Alert onDismiss={form.dismissError}>{form.error.message}</Alert>}

        <FormField
          label="Username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          {...form.field('username')}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          required
          {...form.field('password')}
        />
        <SubmitButton busy={form.submitting} busyLabel="Signing in…" className="btn-block">
          Sign in
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
