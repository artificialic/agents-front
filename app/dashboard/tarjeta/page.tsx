'use client';
import { useEffect, useState } from 'react';
import { PaymentCard, CreditCardForm, type CreditCardFormValues } from '@/components/modules/payments';
import { apiService } from '@/services';

export default function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentResult, setPaymentResult] = useState<string | null>(null);
  const [client, setClient] = useState<any>();

  useEffect(() => {
    apiService.getProfile().then((client) => {
      setClient(client);
    });
  }, []);

  const handleSubmit = async (data: CreditCardFormValues) => {
    setIsSubmitting(true);
    setPaymentResult(null);
    const response = await apiService.createPaymentSource(data);
    if (response.success) {
      setPaymentResult('Tarjeta de pago registrada correctamente');
    }
    setIsSubmitting(false);
  };

  return (
    <main className="p-4">
      {!client?.paymentSource?.id && <CreditCardForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />}
      {client?.paymentSource?.id && (
        <div className="mx-auto flex flex-col items-center justify-center">
          <div className="mb-4 rounded-md bg-green-100 p-4 text-green-800">
            Ya tienes una tarjeta de pago registrada.
          </div>

          <PaymentCard publicData={client.paymentSource.public_data} />
        </div>
      )}

      {paymentResult && <div className="mt-6 rounded-md bg-green-100 p-4 text-green-800">{paymentResult}</div>}
    </main>
  );
}
