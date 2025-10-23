'use client';

import React from 'react';
import { Info, ArrowUpCircle } from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';

interface InfoRowProps {
  label: string;
  value: string | React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
}

function InfoRow({ label, value, loading = false, icon }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="flex items-center">
        {loading ? (
          <div className="animate-pulse text-xs font-medium text-gray-400">...</div>
        ) : (
          <>
            <div className="text-xs font-medium text-gray-950">{value}</div>
            {icon && <div className="ml-1">{icon}</div>}
          </>
        )}
      </div>
    </div>
  );
}

interface SidebarInfoCardProps {
  concurrency: any | null;
  loading: boolean;
  error: string | null;
}

export function SidebarInfoCard({ concurrency, loading, error }: SidebarInfoCardProps) {
  const { user, loading: loadingProfile } = useUserStore();

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm delay-150 duration-300 animate-in fade-in zoom-in-95">
      <div className="p-3">
        <div className="mb-3 inline-flex h-6 items-center justify-center gap-1 rounded-md bg-blue-100 py-1 pl-1 pr-2">
          <Info className="h-4 w-4 text-blue-600" />
          <div className="text-xs font-medium text-blue-600">Pago por minuto</div>
        </div>

        <div className="space-y-2">
          <InfoRow
            label="Saldo disponible:"
            value={`$${user?.balance?.toFixed(2) ?? '0.00'}`}
            loading={loadingProfile}
            icon={<Info className="h-3 w-3 text-gray-600" />}
          />

          <InfoRow
            label="Concurrencia Usada:"
            value={error ? 'Error' : `${concurrency?.current_concurrency || 0}/${concurrency?.concurrency_limit || 0}`}
            loading={loading}
            icon={<ArrowUpCircle className="h-3 w-3 text-gray-400" />}
          />
        </div>
      </div>
    </div>
  );
}
