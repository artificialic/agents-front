'use client';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-full overflow-y-auto p-4 lg:p-6">{children}</main>
  );
}
