import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await auth();
  const isAdmin = session?.user?.role === 'admin';

  if (session?.user && isAdmin) {
    return redirect('/dashboard/clients');
  }

  if (!session?.user) {
    return redirect('/');
  } else {
    return redirect('/dashboard/overview');
  }
}
