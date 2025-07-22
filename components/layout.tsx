'use client';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-white">
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
