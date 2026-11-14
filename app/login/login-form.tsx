'use client';

import { useActionState } from 'react';
import { login } from './actions';

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <main className="screen">
      <form className="login" action={action}>
        <div className="logo" aria-hidden="true">A</div>
        <h1 className="brand">ANSA</h1>
        <p className="small">Catat pengeluaran secepat ngomong.</p>
        <div className="field">
          <label htmlFor="email">Email</label>
          {/* key: React mengosongkan form sesudah aksi; email dikembalikan supaya tidak perlu diketik ulang */}
          <input key={state?.email} id="email" name="email" type="email" autoComplete="username" defaultValue={state?.email} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        {state && <p className="error" role="alert">{state.error}</p>}
        <button className="btn" disabled={pending}>{pending ? 'Masuk…' : 'Masuk'}</button>
      </form>
    </main>
  );
}
