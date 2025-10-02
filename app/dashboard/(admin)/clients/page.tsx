// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { ClientTable } from './ClientTable';
import { ClientModal } from './ClientModal';
import TransactionHistoryTable from '@/components/modules/billing/transaction-history-table';
import { apiService } from '@/services';

type Client = {
  _id: string;
  firstName?: string;
  name?: string;
  email: string;
  workspaceId?: string;
};

type ClientFormData = {
  firstName: string;
  email: string;
  workspaceId: string;
  password?: string;
};

type TransactionHistory = {
  _id: string;
  amountUSD: number;
  amountCOP: number;
  exchangeRate: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
};

export default function Clients() {
  const [data, setData] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientTransactions, setClientTransactions] = useState<TransactionHistory[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    apiService
      .getAllClients()
      .then((clients) => {
        setData(clients);
        console.log('Clientes cargados:', clients);
      })
      .catch((error) => {
        console.error('Error fetching clients:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los clientes',
          variant: 'destructive'
        });
      });
  }, []);

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
    } else {
      setEditingClient(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleViewTransactions = async (client: Client) => {
    setSelectedClient(client);
    setIsTransactionsModalOpen(true);
    setLoadingTransactions(true);

    try {
      const response = await apiService.getTransactionsByUserId(client._id);
      const transactions = response?.data || response;
      setClientTransactions(Array.isArray(transactions) ? transactions : []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las transacciones del cliente',
        variant: 'destructive'
      });
      setClientTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleCloseTransactionsModal = () => {
    setIsTransactionsModalOpen(false);
    setSelectedClient(null);
    setClientTransactions([]);
  };

  const handleSubmitClient = async (formData: ClientFormData, isEditing: boolean) => {
    setIsLoading(true);

    try {
      if (isEditing && editingClient) {
        const updateData = {
          firstName: formData.firstName,
          email: formData.email,
          workspaceId: formData.workspaceId
        };
        const updatedClient = await apiService.updateClient(editingClient._id, updateData);

        toast({
          title: 'Éxito',
          description: 'Cliente actualizado exitosamente'
        });

        const updatedClients = await apiService.getAllClients();
        setData(updatedClients);
      } else {
        const newClient = await apiService.createClient(formData);

        setData((prev) => [...prev, newClient]);

        toast({
          title: 'Éxito',
          description: 'Cliente creado exitosamente'
        });
      }

      handleCloseModal();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al guardar cliente',
        variant: 'destructive'
      });
      console.error('Error al guardar cliente:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Clientes</h1>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Cliente
          </Button>
        </div>

        <ClientTable clients={data ?? []} onEditClient={handleOpenModal} onViewTransactions={handleViewTransactions} />

        <ClientModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitClient}
          editingClient={editingClient}
          isLoading={isLoading}
        />

        <Dialog open={isTransactionsModalOpen} onOpenChange={handleCloseTransactionsModal}>
          <DialogContent className="max-w-6xl">
            <DialogHeader>
              <DialogTitle>
                Transacciones de {selectedClient?.firstName || selectedClient?.name || 'Cliente'}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <TransactionHistoryTable
                transactions={clientTransactions}
                isLoading={loadingTransactions}
                emptyMessage="Este cliente no tiene transacciones registradas"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
