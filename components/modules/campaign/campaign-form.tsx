// @ts-nocheck
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { apiService } from '@/services';
import { getLatestVersionByAgent } from '@/lib/utils';

interface CampaignFormProps {
  onBack?: () => void;
  onSubmit?: (data: any) => Promise<void>;
}

interface Agent {
  agent_id: string;
  agent_name: string;
  version: number;
  is_published: boolean;
  language: string;
  voice_id: string;
}

export default function CampaignForm({ onBack, onSubmit }: CampaignFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    agentId: '',
    fromNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingPhoneNumbers, setLoadingPhoneNumbers] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPhoneNumbers();
    fetchAgents();
  }, []);

  const fetchPhoneNumbers = async () => {
    try {
      setLoadingPhoneNumbers(true);
      const data = await apiService.getPhoneNumbers();
      setPhoneNumbers(data);
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
    } finally {
      setLoadingPhoneNumbers(false);
    }
  };

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      const response = await apiService.getAgents();
      const agentsData = Array.isArray(response) ? response : response?.data ?? [];
      const latestVersionAgents = getLatestVersionByAgent(agentsData);
      setAgents(latestVersionAgents);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (!formData.name.trim()) {
      setError('Por favor, ingresa el nombre de la campaña');
      return;
    }

    if (!formData.agentId) {
      setError('Por favor, selecciona un agente');
      return;
    }

    if (!formData.fromNumber) {
      setError('Por favor, selecciona un número de teléfono');
      return;
    }

    if (!onSubmit) return;

    setIsSubmitting(true);

    try {
      let formattedFromNumber = formData.fromNumber;
      if (!formattedFromNumber.startsWith('+')) {
        // TODO: improve this validation
        // formattedFromNumber = '+' + formattedFromNumber;
      }

      const submitData = {
        name: formData.name.trim(),
        agentId: formData.agentId,
        fromNumber: formattedFromNumber
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Error al crear la campaña. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full bg-gray-50 p-6">
      <div className="rounded-lg bg-white p-6 shadow-md sm:p-8">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" size="icon" className="mr-2 hover:bg-gray-100" onClick={onBack}>
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Volver</span>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Crear una campaña</h1>
            <p className="mt-1 text-sm text-gray-500">Configura una nueva campaña de llamadas</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="campaignName" className="mb-1 block text-sm font-medium text-gray-700">
              Nombre de la campaña *
            </Label>
            <Input
              id="campaignName"
              placeholder="Ingresa el nombre de la campaña"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="focus:border-primary-500 focus:ring-primary-500 border-gray-300"
              required
            />
          </div>

          <div>
            <Label htmlFor="agentId" className="mb-1 block text-sm font-medium text-gray-700">
              Agente *
            </Label>
            <Select
              value={formData.agentId}
              onValueChange={(value) => setFormData({ ...formData, agentId: value })}
              disabled={loadingAgents}
              required
            >
              <SelectTrigger
                id="agentId"
                className={`focus:border-primary-500 focus:ring-primary-500 border-gray-300 ${
                  error && !formData.agentId ? 'border-red-500' : ''
                }`}
              >
                <SelectValue placeholder={loadingAgents ? 'Cargando agentes...' : 'Seleccionar un agente'} />
              </SelectTrigger>
              <SelectContent className="max-h-80 overflow-y-auto">
                {agents.map((agent) => (
                  <SelectItem key={agent.agent_id} value={agent.agent_id}>
                    {agent.agent_name} ({agent.agent_id.slice(-8)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fromNumber" className="mb-1 block text-sm font-medium text-gray-700">
              Número de origen *
            </Label>
            <Select
              value={formData.fromNumber}
              onValueChange={(value) => setFormData({ ...formData, fromNumber: value })}
              disabled={loadingPhoneNumbers}
              required
            >
              <SelectTrigger
                id="fromNumber"
                className={`focus:border-primary-500 focus:ring-primary-500 border-gray-300 ${
                  error && !formData.fromNumber ? 'border-red-500' : ''
                }`}
              >
                <SelectValue placeholder={loadingPhoneNumbers ? 'Cargando números...' : 'Seleccionar un número'} />
              </SelectTrigger>
              <SelectContent>
                {phoneNumbers.map((phoneNumber) => (
                  <SelectItem key={phoneNumber.phone_number} value={phoneNumber.phone_number}>
                    {phoneNumber.phone_number_pretty} ({phoneNumber.nickname})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
              onClick={onBack}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-gray-900 text-white hover:bg-gray-800" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Campaña'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
