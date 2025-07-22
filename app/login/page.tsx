import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import SignInViewPage from './_components/sigin-view';

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
  description: 'Inicio de sesión'
};

export default async function Page() {
  const session = await auth();

  if (session?.user) {
    return redirect('/dashboard/overview');
  }

  return <SignInViewPage />;
}
