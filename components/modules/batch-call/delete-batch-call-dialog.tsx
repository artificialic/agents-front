'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface BatchCall {
  id: string;
  name: string;
  status: 'Enviado' | 'Pendiente' | 'Fallido' | 'Programado';
  recipients: number;
  sent: number;
  pickedUp: number;
  successful: number;
  lastSentBy: string;
}

interface DeleteBatchCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchCall: BatchCall | null;
  onConfirm: () => void;
}

export default function DeleteBatchCallDialog({ open, onOpenChange, onConfirm }: DeleteBatchCallDialogProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex items-start space-x-4 p-6">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <DialogHeader className="p-0 text-left">
              <DialogTitle className="mb-2 text-lg font-semibold text-gray-900">Eliminar llamada en lote</DialogTitle>
            </DialogHeader>
            <p className="mb-6 text-sm text-gray-600">¿Estás seguro de que quieres eliminar esta llamada en lote?</p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button onClick={handleConfirm} className="bg-gray-900 text-white hover:bg-gray-800">
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
