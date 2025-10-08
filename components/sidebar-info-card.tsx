'use client';

import React, { useState, useEffect } from 'react';
import { Info, ArrowUpCircle } from 'lucide-react';
import { apiService } from '@/services';
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

export function SidebarInfoCard() {
  const { user, loading: loadingProfile } = useUserStore();
  const [concurrency, setConcurrency] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConcurrency = async () => {
      try {
        setLoading(true);
        const response = await apiService.getConcurrency();

        if (response) {
          setConcurrency(response);
        } else {
          setError('No se pudieron cargar los datos de concurrencia.');
        }
      } catch (err) {
        console.error('Error al obtener la concurrencia:', err);
        setError('Error al cargar los datos de concurrencia.');
      } finally {
        setLoading(false);
      }
    };

    fetchConcurrency();
  }, []);

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="p-3">
        <div className="mb-3 inline-flex h-6 items-center justify-center gap-1 rounded-md bg-blue-100 py-1 pl-1 pr-2">
          <Info className="h-4 w-4 text-blue-600" />
          <div className="text-xs font-medium text-blue-600">Pago por Uso</div>
        </div>

        <div className="space-y-2">
          <InfoRow
            label="Próxima Factura:"
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
