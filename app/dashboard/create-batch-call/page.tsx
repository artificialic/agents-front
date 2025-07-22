'use client';

import BatchCallForm from '@/components/modules/batch-call/batch-call-form';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services';

export default function CreateBatchCallPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard/batch-call');
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      await apiService.createBatchCall(formData);
      router.push('/dashboard/batch-call');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error creating batch call:', err);
    }
  };

  return (
    <div className="flex justify-center p-6">
      <BatchCallForm onBack={handleBack} onSubmit={handleFormSubmit} />
    </div>
  );
}
