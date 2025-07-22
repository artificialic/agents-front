'use client';

import { useState, useEffect } from 'react';
import { Info, ArrowUpCircle } from 'lucide-react';
import { apiService } from '@/services';

export function SidebarInfoCard() {
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
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">Próxima Factura:</div>
            <div className="flex items-center">
              <div className="text-xs font-medium text-gray-950">$10.53</div>
              <Info className="ml-1 h-3 w-3 text-gray-600" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">Concurrencia Usada:</div>
            <div className="flex items-center">
              <div className="text-xs font-medium text-gray-950">
                {loading
                  ? '...'
                  : error
                  ? 'Error'
                  : `${concurrency?.current_concurrency || 0}/${concurrency?.concurrency_limit || 0}`}
              </div>
              <ArrowUpCircle className="ml-1 h-3 w-3 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
