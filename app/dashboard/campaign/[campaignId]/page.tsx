'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CampaignContactsDashboard from '@/components/modules/campaign/campaign-contacts-dashboard';
import { apiService } from '@/services';
import { downloadFile } from '@/lib/utils';

export default function CampaignDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.campaignId as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [contacts, setContacts] = useState<ContactByCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingCSV, setExportingCSV] = useState(false);

  const fetchData = async () => {
    if (!campaignId) return;
    try {
      setLoading(true);
      setError(null);

      const campaignData = await apiService.getCampaignByUserAndId(campaignId);
      const contactsResponse = await apiService.getContactsByCampaign(campaignId);

      setCampaign(campaignData);
      setContacts(Array.isArray(contactsResponse) ? contactsResponse : contactsResponse?.data ?? []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching campaign data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [campaignId]);

  const handleBack = () => {
    router.push('/dashboard/campaign');
  };

  const handleUpdateCampaign = async (updateData: { name: string; status: Campaign['status'] }) => {
    if (!campaignId) return;
    await apiService.updateCampaign(campaignId, updateData);
    await fetchData();
  };

  const handleExportCSV = async () => {
    try {
      setExportingCSV(true);
      const response = await apiService.exportCampaignContacts(campaignId);

      if (response.success && response.data) {
        const url = window.URL.createObjectURL(response.data);
        downloadFile(url, `campaign-${campaignId}-contacts.csv`);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error exporting contacts:', err);
      setError(err instanceof Error ? err.message : 'Error al exportar contactos');
    } finally {
      setExportingCSV(false);
    }
  };

  if (loading && !campaign) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="mb-4 text-red-600">Error: {error}</p>
        <button onClick={fetchData} className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <CampaignContactsDashboard
      campaign={campaign}
      contacts={contacts}
      loading={loading}
      error={error}
      onBack={handleBack}
      onRefresh={fetchData}
      onUpdateCampaign={handleUpdateCampaign}
      onExportCSV={handleExportCSV}
      exportingCSV={exportingCSV}
    />
  );
}
