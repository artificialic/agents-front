import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'Inicio',
  description: 'Inicio'
};

export default async function Page() {
  const session = await auth();

  if (session?.user) {
    return redirect('/dashboard/overview');
  }

  return redirect('/login');
}
