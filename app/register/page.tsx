import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import SignUpViewPage from './_components/signup-view';

export const metadata: Metadata = {
  title: 'Registrarse',
  description: 'Crea tu cuenta'
};

export default async function Page() {
  const session = await auth();
  const isAdmin = session?.user?.role === 'admin';

  if (session?.user && isAdmin) {
    return redirect('/dashboard/clients');
  }

  if (session?.user) {
    return redirect('/dashboard/overview');
  }

  return <SignUpViewPage />;
}
