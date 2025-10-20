// @ts-nocheck
'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, FileType, ChevronLeft, Users, Loader2, CheckCircle, Smile } from 'lucide-react';
import { apiService } from '@/services';

interface FilterOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Agent {
  agent_id: string;
  agent_name: string;
  version: number;
  is_published: boolean;
  language: string;
  voice_id: string;
}

const filterOptions: FilterOption[] = [
  {
    id: 'type',
    label: 'Tipo',
    icon: FileType
  },
  {
    id: 'agent',
    label: 'Agente',
    icon: Users
  },
  {
    id: 'status',
    label: 'Estado de Llamada',
    icon: CheckCircle
  },
  {
    id: 'sentiment',
    label: 'Sentimiento del Usuario',
    icon: Smile
  }
];

interface CallHistoryFiltersProps {
  onFilterSelect?: (filterCriteria: any) => void;
  hideTypeFilter?: boolean;
}

export default function CallHistoryFilters({ onFilterSelect, hideTypeFilter = false }: CallHistoryFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [selectedType, setSelectedType] = useState('phone');
  const [outboundChecked, setOutboundChecked] = useState(false);
  const [inboundChecked, setInboundChecked] = useState(false);
  const [showAgentFilter, setShowAgentFilter] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [agentsError, setAgentsError] = useState<string | null>(null);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showSentimentFilter, setShowSentimentFilter] = useState(false);
  const [selectedSentiments, setSelectedSentiments] = useState<string[]>([]);

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      setAgentsError(null);

      const response = await apiService.getAgents();
      const agents = Array.isArray(response) ? response : response?.data ?? [];
      setAvailableAgents(agents);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgentsError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoadingAgents(false);
    }
  };

  const availableFilterOptions = filterOptions.filter((option) => {
    if (hideTypeFilter && option.id === 'type') {
      return false;
    }
    return true;
  });

  const handleFilterSelect = (filterId: string) => {
    if (filterId === 'type') {
      setShowTypeFilter(true);
    } else if (filterId === 'agent') {
      setShowAgentFilter(true);
      if (availableAgents.length === 0) {
        fetchAgents();
      }
    } else if (filterId === 'status') {
      setShowStatusFilter(true);
    } else if (filterId === 'sentiment') {
      setShowSentimentFilter(true);
    } else {
      onFilterSelect?.(filterId);
      setIsOpen(false);
    }
  };

  const handleBack = () => {
    setShowTypeFilter(false);
    setShowAgentFilter(false);
    setShowStatusFilter(false);
    setShowSentimentFilter(false);
  };

  const handleCancel = () => {
    setShowTypeFilter(false);
    setShowAgentFilter(false);
    setShowStatusFilter(false);
    setShowSentimentFilter(false);
    setIsOpen(false);
  };

  const handleSave = () => {
    const filterCriteria: any = {};

    if (selectedType === 'phone') {
      filterCriteria.call_type = ['phone_call'];

      const directions = [];
      if (outboundChecked) directions.push('outbound');
      if (inboundChecked) directions.push('inbound');

      if (directions.length > 0) {
        filterCriteria.direction = directions;
      }
    } else if (selectedType === 'web') {
      filterCriteria.call_type = ['web_call'];
    }

    const finalCriteria = { filter_criteria: filterCriteria };

    onFilterSelect?.(finalCriteria);
    setShowTypeFilter(false);
    setIsOpen(false);
  };

  const handleTypeClear = () => {
    setSelectedType('phone');
    setOutboundChecked(false);
    setInboundChecked(false);

    const finalCriteria = { filter_criteria: {} };
    onFilterSelect?.(finalCriteria);
    setShowTypeFilter(false);
    setIsOpen(false);
  };

  const handleAgentSave = () => {
    const filterCriteria: any = {};

    if (selectedAgents.length > 0) {
      filterCriteria.agent_id = selectedAgents;
    }

    const finalCriteria = { filter_criteria: filterCriteria };

    onFilterSelect?.(finalCriteria);
    setShowAgentFilter(false);
    setIsOpen(false);
  };

  const handleAgentClear = () => {
    setSelectedAgents([]);

    const finalCriteria = { filter_criteria: {} };
    onFilterSelect?.(finalCriteria);
    setShowAgentFilter(false);
    setIsOpen(false);
  };

  const handleStatusSave = () => {
    const filterCriteria: any = {};

    if (selectedStatuses.length > 0) {
      filterCriteria.call_status = selectedStatuses;
    }

    const finalCriteria = { filter_criteria: filterCriteria };

    onFilterSelect?.(finalCriteria);
    setShowStatusFilter(false);
    setIsOpen(false);
  };

  const handleStatusClear = () => {
    setSelectedStatuses([]);

    const finalCriteria = { filter_criteria: {} };
    onFilterSelect?.(finalCriteria);
    setShowStatusFilter(false);
    setIsOpen(false);
  };

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgents((prev) => (prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]));
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]));
  };

  const handleSentimentToggle = (sentiment: string) => {
    setSelectedSentiments((prev) =>
      prev.includes(sentiment) ? prev.filter((s) => s !== sentiment) : [...prev, sentiment]
    );
  };

  const callStatuses = [
    { value: 'ended', label: 'Finalizado' },
    { value: 'error', label: 'Error' },
    { value: 'not_connected', label: 'No Conectado' },
    { value: 'ongoing', label: 'En Curso' }
  ];

  const userSentiments = [
    { value: 'Negative', label: 'Negativo' },
    { value: 'Positive', label: 'Positivo' },
    { value: 'Neutral', label: 'Neutral' },
    { value: 'Unknown', label: 'Desconocido' }
  ];

  const handleSentimentSave = () => {
    const filterCriteria: any = {};

    if (selectedSentiments.length > 0) {
      filterCriteria.user_sentiment = selectedSentiments;
    }

    const finalCriteria = { filter_criteria: filterCriteria };

    onFilterSelect?.(finalCriteria);
    setShowSentimentFilter(false);
    setIsOpen(false);
  };

  const handleSentimentClear = () => {
    setSelectedSentiments([]);

    const finalCriteria = { filter_criteria: {} };
    onFilterSelect?.(finalCriteria);
    setShowSentimentFilter(false);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50">
          <Plus className="mr-2 h-4 w-4" />
          Filtrar
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        {!showTypeFilter && !showAgentFilter && !showStatusFilter && !showSentimentFilter ? (
          <div className="p-2">
            <div className="space-y-1">
              {availableFilterOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleFilterSelect(option.id)}
                    className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <IconComponent className="mr-3 h-4 w-4 text-gray-500" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : showTypeFilter ? (
          <div className="p-4">
            <div className="mb-4 flex items-center">
              <Button variant="ghost" size="icon" className="mr-2 h-6 w-6" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-sm font-medium text-gray-900">Filtrar por Tipo</h3>
            </div>

            <div className="space-y-4">
              <RadioGroup value={selectedType} onValueChange={setSelectedType}>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="phone" id="phone" />
                      <Label htmlFor="phone" className="text-sm text-gray-900">
                        Teléfono
                      </Label>
                    </div>
                    {selectedType === 'phone' && (
                      <div className="ml-6 mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="outbound"
                            checked={outboundChecked}
                            onCheckedChange={(checkedState) => {
                              if (typeof checkedState === 'boolean') {
                                setOutboundChecked(checkedState);
                              }
                            }}
                          />
                          <Label htmlFor="outbound" className="text-sm text-gray-700">
                            Saliente
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="inbound"
                            checked={inboundChecked}
                            onCheckedChange={(checkedState) => {
                              if (typeof checkedState === 'boolean') {
                                setInboundChecked(checkedState);
                              }
                            }}
                          />
                          <Label htmlFor="inbound" className="text-sm text-gray-700">
                            Entrante
                          </Label>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="web" id="web" />
                    <Label htmlFor="web" className="text-sm text-gray-900">
                      Web
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTypeClear}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Limpiar
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSave} className="bg-gray-900 text-white hover:bg-gray-800">
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        ) : showAgentFilter ? (
          <div className="p-4">
            <div className="mb-4 flex items-center">
              <Button variant="ghost" size="icon" className="mr-2 h-6 w-6" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-sm font-medium text-gray-900">Filtrar por Agente</h3>
            </div>

            {loadingAgents && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-600">Cargando agentes...</span>
              </div>
            )}

            {agentsError && !loadingAgents && (
              <div className="py-8 text-center">
                <div className="mb-4 text-sm text-red-600">{agentsError}</div>
                <Button onClick={fetchAgents} variant="outline" size="sm">
                  Reintentar
                </Button>
              </div>
            )}

            {!loadingAgents && !agentsError && (
              <>
                <div className="max-h-64 space-y-4 overflow-y-auto">
                  {availableAgents.length === 0 ? (
                    <div className="py-4 text-center text-sm text-gray-500">No hay agentes disponibles</div>
                  ) : (
                    availableAgents.map((agent) => (
                      <div key={agent.agent_id} className="flex items-start space-x-3">
                        <Checkbox
                          id={agent.agent_id}
                          checked={selectedAgents.includes(agent.agent_id)}
                          onCheckedChange={() => handleAgentToggle(agent.agent_id)}
                          className="mt-1"
                        />
                        <div className="min-w-0 flex-1">
                          <Label htmlFor={agent.agent_id} className="block cursor-pointer">
                            <div className="mb-1 text-sm font-medium text-gray-900">{agent.agent_name}</div>
                            <div className="font-mono text-xs text-gray-500">{agent.agent_id}</div>
                          </Label>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAgentClear}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    Limpiar
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAgentSave}
                      className="bg-gray-900 text-white hover:bg-gray-800"
                      disabled={selectedAgents.length === 0}
                    >
                      Guardar ({selectedAgents.length})
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : showStatusFilter ? (
          <div className="p-4">
            <div className="mb-4 flex items-center">
              <Button variant="ghost" size="icon" className="mr-2 h-6 w-6" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-sm font-medium text-gray-900">Filtrar por Estado de Llamada</h3>
            </div>

            <div className="space-y-3">
              {callStatuses.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={status.value}
                    checked={selectedStatuses.includes(status.value)}
                    onCheckedChange={() => handleStatusToggle(status.value)}
                  />
                  <Label htmlFor={status.value} className="text-sm text-gray-900">
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleStatusClear}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Limpiar
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleStatusSave}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                  disabled={selectedStatuses.length === 0}
                >
                  Guardar ({selectedStatuses.length})
                </Button>
              </div>
            </div>
          </div>
        ) : showSentimentFilter ? (
          <div className="p-4">
            <div className="mb-4 flex items-center">
              <Button variant="ghost" size="icon" className="mr-2 h-6 w-6" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-sm font-medium text-gray-900">Filtrar por Sentimiento del Usuario</h3>
            </div>

            <div className="space-y-3">
              {userSentiments.map((sentiment) => (
                <div key={sentiment.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={sentiment.value}
                    checked={selectedSentiments.includes(sentiment.value)}
                    onCheckedChange={() => handleSentimentToggle(sentiment.value)}
                  />
                  <Label htmlFor={sentiment.value} className="text-sm text-gray-900">
                    {sentiment.label}
                  </Label>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSentimentClear}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Limpiar
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSentimentSave}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                  disabled={selectedSentiments.length === 0}
                >
                  Guardar ({selectedSentiments.length})
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
