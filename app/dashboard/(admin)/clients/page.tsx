'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ClientTable } from './ClientTable';
import { ClientModal } from './ClientModal';
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

export default function Clients() {
  const [data, setData] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

        <ClientTable clients={data ?? []} onEditClient={handleOpenModal} />

        <ClientModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitClient}
          editingClient={editingClient}
          isLoading={isLoading}
        />
      </div>
    </Layout>
  );
}
