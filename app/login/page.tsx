import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import LoginForm from './login-form';

export default async function LoginPage() {
  if (await currentUser()) redirect('/');
  return <LoginForm />;
}
