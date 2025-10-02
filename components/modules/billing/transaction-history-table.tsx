'use client';

import { Loader2 } from 'lucide-react';

interface TransactionHistory {
  _id: string;
  amountUSD: number;
  amountCOP: number;
  exchangeRate: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

interface TransactionHistoryTableProps {
  transactions: TransactionHistory[];
  isLoading?: boolean;
  emptyMessage?: string;
}

const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    APPROVED: 'Aprobado',
    PENDING: 'Pendiente',
    REJECTED: 'Rechazado',
    FAILED: 'Fallido'
  };
  return statusMap[status] || status;
};

const getStatusStyle = (status: string): string => {
  const styleMap: Record<string, string> = {
    APPROVED: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    REJECTED: 'bg-red-100 text-red-800',
    FAILED: 'bg-red-100 text-red-800'
  };
  return styleMap[status] || 'bg-gray-100 text-gray-800';
};

export default function TransactionHistoryTable({
  transactions,
  isLoading = false,
  emptyMessage = 'No hay transacciones de recarga disponibles'
}: TransactionHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Cargando transacciones...</span>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="grid grid-cols-12 gap-4 border-b border-gray-200 px-4 py-3 text-sm font-medium text-gray-500">
        <div className="col-span-2">Fecha</div>
        <div className="col-span-2">Monto USD</div>
        <div className="col-span-2">Monto COP</div>
        <div className="col-span-2">Tasa de Cambio</div>
        <div className="col-span-2">Estado</div>
        <div className="col-span-2">Método de Pago</div>
      </div>

      <div className="divide-y divide-gray-100">
        {!transactions || transactions.length === 0 ? (
          <div className="py-8 text-center text-gray-500">{emptyMessage}</div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction._id} className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50">
              <div className="col-span-2 flex items-center">
                <span className="text-sm text-gray-900">
                  {new Date(transaction.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className="col-span-2 flex items-center">
                <span className="text-sm font-medium text-gray-900">${transaction.amountUSD.toFixed(2)}</span>
              </div>

              <div className="col-span-2 flex items-center">
                <span className="text-sm text-gray-900">${transaction.amountCOP.toLocaleString()}</span>
              </div>

              <div className="col-span-2 flex items-center">
                <span className="text-sm text-gray-900">{transaction.exchangeRate.toFixed(0)}</span>
              </div>

              <div className="col-span-2 flex items-center">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusStyle(
                    transaction.status
                  )}`}
                >
                  {getStatusLabel(transaction.status)}
                </span>
              </div>

              <div className="col-span-2 flex items-center">
                <span className="text-sm text-gray-900">{transaction.paymentMethod}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
