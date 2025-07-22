'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiService } from '@/services';

interface CreditPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseSuccess: () => void; // Nueva prop
}

const PRESET_AMOUNTS = [30, 60, 100, 250, 500];
const USD_TO_COP_RATE = 4000;

export default function CreditPurchaseModal({ open, onOpenChange, onPurchaseSuccess }: CreditPurchaseModalProps) {
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
    setError(null);
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    setCustomAmount(selectedAmount.toString());
    setError(null);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = Number.parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedAmount(numValue);
    }
    setError(null);
  };

  const handleContinueToPayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const amountInCOP = Math.round(displayAmount * USD_TO_COP_RATE);

      await apiService.createTransaction({
        amount: amountInCOP
      });

      onPurchaseSuccess(); // Llamar a la función de éxito
      onOpenChange(false);
    } catch (err) {
      setError('Error al procesar la transacción. Inténtalo de nuevo.');
      console.error('Error creating transaction:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const displayAmount = isCustom && customAmount ? Number.parseFloat(customAmount) || 0 : selectedAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">Comprar Más Créditos</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center text-sm text-gray-600">
            Comprar créditos te permite pagar por el uso de la plataforma más allá de tu límite incluido.{' '}
          </div>

          <div className="text-center">
            <div className="text-5xl font-light text-gray-400">${displayAmount.toFixed(2)}</div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount && !isCustom ? 'default' : 'outline'}
                  onClick={() => handlePresetClick(amount)}
                  className="h-10"
                  disabled={isLoading}
                >
                  ${amount}
                </Button>
              ))}
              <Button
                variant={isCustom ? 'default' : 'outline'}
                onClick={handleCustomClick}
                className="h-10"
                disabled={isLoading}
              >
                Personalizado
              </Button>
            </div>

            {isCustom && (
              <div className="mt-3">
                <Input
                  type="number"
                  placeholder="Ingresa monto personalizado"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  min="1"
                  step="0.01"
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          {error && <div className="text-center text-sm text-red-600">{error}</div>}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleContinueToPayment}
              className="flex-1 bg-black text-white hover:bg-gray-800"
              disabled={isLoading || displayAmount <= 0}
            >
              {isLoading ? 'Procesando...' : 'Continuar al Pago'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
