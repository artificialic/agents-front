// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreditCardForm, { type CreditCardFormValues } from '../payments/credit-card-form';
import { PaymentCard } from '../payments/payment-card';
import CreditPurchaseModal from '../payments/credit-purchase-modal';
import { apiService } from '@/services';

interface TransactionHistory {
  _id: string;
  amountUSD: number;
  amountCOP: number;
  exchangeRate: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<'history' | 'payment-methods'>('payment-methods');
  const [isSubmittingCard, setIsSubmittingCard] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showCreditCardForm, setShowCreditCardForm] = useState(false);
  const [showCreditPurchaseModal, setShowCreditPurchaseModal] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{ success: boolean; message: string } | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await apiService.getProfile();
      const profileData = response?.data || response;
      setUserProfile(profileData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      setLoadingTransactions(true);
      const transactions = await apiService.getTransactionsByUser();

      setTransactionHistory(Array.isArray(transactions) ? transactions : []);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      setTransactionHistory([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchTransactionHistory();
  }, []);

  useEffect(() => {
    if (!loadingProfile && userProfile?.paymentSource) {
      setActiveTab('history');
    }
  }, [userProfile?.paymentSource, loadingProfile]);

  const handleRechargeClick = () => {
    if (!userProfile?.paymentSource) {
      alert('Debe agregar una tarjeta de pago antes de poder recargar saldo');
      return;
    }
    setShowCreditPurchaseModal(true);
  };

  const handleCreditCardSubmit = async (data: CreditCardFormValues) => {
    try {
      setIsSubmittingCard(true);
      setPaymentResult(null);

      const payload = {
        cardNumber: data.cardNumber,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        cvc: data.cvc,
        cardHolder: data.cardHolder
      };

      const response = await apiService.createPaymentSource(payload);

      if (response.success) {
        setPaymentResult({ success: true, message: 'Tarjeta de pago registrada correctamente' });
        setShowCreditCardForm(false);
      } else {
        setPaymentResult({ success: false, message: 'Error al registrar la tarjeta de pago' });
      }

      await fetchUserProfile();
    } catch (error) {
      console.error('Error adding payment method:', error);
      setPaymentResult({ success: false, message: 'Error al registrar la tarjeta de pago' });
    } finally {
      setIsSubmittingCard(false);
    }
  };

  const hasPaymentSource = !loadingProfile && userProfile?.paymentSource;

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Facturación</h1>
            <p className="text-gray-600">Gestiona tus métodos de pago y saldo</p>
            {loadingProfile ? (
              <p className="mt-2 text-gray-600">Cargando saldo...</p>
            ) : (
              userProfile?.balance !== undefined && (
                <p className="mt-2 text-gray-600">
                  Saldo Disponible:{' '}
                  <span className="font-semibold text-gray-900">${userProfile.balance.toFixed(2)} USD</span>
                </p>
              )
            )}
            {!loadingProfile && !userProfile?.paymentSource && (
              <div className="mt-3 rounded-md border border-yellow-200 bg-yellow-50 p-3">
                <p className="text-sm text-yellow-800">
                  Aquí, necesitas agregar un métodos de pago para poder recargar saldo
                </p>
              </div>
            )}
          </div>
          <Button
            onClick={handleRechargeClick}
            disabled={!userProfile?.paymentSource}
            className="bg-green-600 hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Recargar Saldo
          </Button>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'history' | 'payment-methods')}>
          <TabsList className={`grid w-full ${hasPaymentSource ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {hasPaymentSource && <TabsTrigger value="history">Historial de Recargas</TabsTrigger>}
            <TabsTrigger value="payment-methods">Métodos de Pago</TabsTrigger>
          </TabsList>

          {hasPaymentSource && (
            <TabsContent value="history" className="mt-6">
              <div className="mt-8">
                <div className="mb-4">
                  <h2 className="inline-block border-b-2 border-green-500 pb-2 text-base font-medium text-gray-900">
                    Historial de Recargas
                  </h2>
                </div>

                {loadingTransactions && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-600">Cargando transacciones...</span>
                  </div>
                )}

                {!loadingTransactions && (
                  <div className="bg-white">
                    <div className="grid grid-cols-12 gap-4 border-b border-gray-200 px-4 py-3 text-sm font-medium text-gray-500">
                      <div className="col-span-2">Fecha</div>
                      <div className="col-span-2">Monto USD</div>
                      <div className="col-span-2">Monto COP</div>
                      <div className="col-span-2">Tasa de Cambio</div>
                      <div className="col-span-2">Estado</div>
                      <div className="col-span-2">MÃ©todo de Pago</div>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {!transactionHistory || transactionHistory.length === 0 ? (
                        <div className="py-8 text-center text-gray-500">
                          No hay transacciones de recarga disponibles
                        </div>
                      ) : (
                        transactionHistory.map((transaction) => (
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
                              <span className="text-sm font-medium text-gray-900">
                                ${transaction.amountUSD.toFixed(2)}
                              </span>
                            </div>
                            <div className="col-span-2 flex items-center">
                              <span className="text-sm text-gray-900">${transaction.amountCOP.toLocaleString()}</span>
                            </div>
                            <div className="col-span-2 flex items-center">
                              <span className="text-sm text-gray-900">{transaction.exchangeRate.toFixed(0)}</span>
                            </div>
                            <div className="col-span-2 flex items-center">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                  transaction.status === 'APPROVED'
                                    ? 'bg-green-100 text-green-800'
                                    : transaction.status === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {transaction.status === 'APPROVED'
                                  ? 'Aprobado'
                                  : transaction.status === 'PENDING'
                                  ? 'Pendiente'
                                  : transaction.status}
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
                )}
              </div>
            </TabsContent>
          )}

          <TabsContent value="payment-methods" className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tarjetas</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreditCardForm(true)}
                disabled={isSubmittingCard}
                className="flex items-center gap-2"
              >
                {isSubmittingCard ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Agregar Tarjeta
                  </>
                )}
              </Button>
            </div>

            <div className="grid gap-4">
              {userProfile?.paymentSource && <PaymentCard publicData={userProfile.paymentSource.public_data} />}
            </div>

            {showCreditCardForm && (
              <div className="rounded-lg border bg-gray-50 p-6">
                <h3 className="mb-4 text-lg font-semibold">Agregar Nueva Tarjeta</h3>
                <CreditCardForm
                  onSubmit={handleCreditCardSubmit}
                  onCancel={() => {
                    setShowCreditCardForm(false);
                    setPaymentResult(null);
                  }}
                  isSubmitting={isSubmittingCard}
                />
                {paymentResult && (
                  <div
                    className={`mt-4 rounded-md p-3 ${
                      paymentResult.success
                        ? 'border border-green-200 bg-green-50 text-green-700'
                        : 'border border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {paymentResult.message}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreditPurchaseModal
        open={showCreditPurchaseModal}
        onOpenChange={setShowCreditPurchaseModal}
        onPurchaseSuccess={() => {
          fetchUserProfile();
          fetchTransactionHistory();
        }}
      />
    </div>
  );
}
