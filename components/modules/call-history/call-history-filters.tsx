// @ts-nocheck
'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Plus,
  FileType,
  ChevronLeft,
  Users,
  Loader2,
  CheckCircle,
  Smile,
  Hash,
  Clock,
  Phone,
  PhoneOutgoing,
  Layers,
  PhoneOff,
  CheckCircle2,
  Gauge,
  DollarSign,
  Tag,
  Voicemail
} from 'lucide-react';
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
    id: 'agent',
    label: 'Agente',
    icon: Users
  },
  {
    id: 'call_id',
    label: 'ID de Llamada',
    icon: Hash
  },
  {
    id: 'batch_call_id',
    label: 'ID de Llamada en Lote',
    icon: Layers
  },
  {
    id: 'type',
    label: 'Tipo',
    icon: FileType
  },
  {
    id: 'duration',
    label: 'Duración',
    icon: Clock
  },
  {
    id: 'from',
    label: 'De',
    icon: Phone
  },
  {
    id: 'to',
    label: 'Para',
    icon: PhoneOutgoing
  },
  {
    id: 'sentiment',
    label: 'Sentimiento del Usuario',
    icon: Smile
  },
  {
    id: 'disconnection_reason',
    label: 'Razón de Desconexión',
    icon: PhoneOff
  },
  {
    id: 'status',
    label: 'Estado de Llamada',
    icon: CheckCircle
  },
  {
    id: 'call_successful',
    label: 'Llamada Exitosa',
    icon: CheckCircle2
  },
  {
    id: 'e2e_latency',
    label: 'Latencia E2E',
    icon: Gauge
  },
  {
    id: 'cost',
    label: 'Costo',
    icon: DollarSign
  }
];

interface CallHistoryFiltersProps {
  onFilterSelect?: (filterCriteria: any) => void;
  hideTypeFilter?: boolean;
  availableAgents: Agent[];
  loadingAgents: boolean;
  agentsError: string | null;
  onRetryAgents: () => void;
}

export default function CallHistoryFilters({
  onFilterSelect,
  hideTypeFilter = false,
  availableAgents,
  loadingAgents,
  agentsError,
  onRetryAgents
}: CallHistoryFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [selectedType, setSelectedType] = useState('phone');
  const [outboundChecked, setOutboundChecked] = useState(false);
  const [inboundChecked, setInboundChecked] = useState(false);
  const [showAgentFilter, setShowAgentFilter] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showSentimentFilter, setShowSentimentFilter] = useState(false);
  const [selectedSentiments, setSelectedSentiments] = useState<string[]>([]);

  const [showCallIdFilter, setShowCallIdFilter] = useState(false);
  const [callIdValue, setCallIdValue] = useState('');

  const [showBatchCallIdFilter, setShowBatchCallIdFilter] = useState(false);
  const [batchCallIdValue, setBatchCallIdValue] = useState('');

  const [showDurationFilter, setShowDurationFilter] = useState(false);
  const [durationOperator, setDurationOperator] = useState('is greater than');
  const [durationValue, setDurationValue] = useState('');
  const [durationValueMin, setDurationValueMin] = useState('');
  const [durationValueMax, setDurationValueMax] = useState('');

  const [showFromFilter, setShowFromFilter] = useState(false);
  const [fromNumberValue, setFromNumberValue] = useState('');

  const [showToFilter, setShowToFilter] = useState(false);
  const [toNumberValue, setToNumberValue] = useState('');

  const [showDisconnectionReasonFilter, setShowDisconnectionReasonFilter] = useState(false);
  const [selectedDisconnectionReasons, setSelectedDisconnectionReasons] = useState<string[]>([]);

  const [showCallSuccessfulFilter, setShowCallSuccessfulFilter] = useState(false);
  const [selectedCallSuccessful, setSelectedCallSuccessful] = useState<boolean[]>([]);

  const [showE2ELatencyFilter, setShowE2ELatencyFilter] = useState(false);
  const [e2eLatencyOperator, setE2ELatencyOperator] = useState('is greater than');
  const [e2eLatencyValue, setE2ELatencyValue] = useState('');
  const [e2eLatencyValueMin, setE2ELatencyValueMin] = useState('');
  const [e2eLatencyValueMax, setE2ELatencyValueMax] = useState('');

  const [showCostFilter, setShowCostFilter] = useState(false);
  const [costOperator, setCostOperator] = useState('is greater than');
  const [costValue, setCostValue] = useState('');
  const [costValueMin, setCostValueMin] = useState('');
  const [costValueMax, setCostValueMax] = useState('');

  const [showVersionFilter, setShowVersionFilter] = useState(false);
  const [versionValue, setVersionValue] = useState('');

  const [showInVoicemailFilter, setShowInVoicemailFilter] = useState(false);
  const [selectedInVoicemail, setSelectedInVoicemail] = useState<boolean[]>([]);

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
    } else if (filterId === 'status') {
      setShowStatusFilter(true);
    } else if (filterId === 'sentiment') {
      setShowSentimentFilter(true);
    } else if (filterId === 'call_id') {
      setShowCallIdFilter(true);
    } else if (filterId === 'batch_call_id') {
      setShowBatchCallIdFilter(true);
    } else if (filterId === 'duration') {
      setShowDurationFilter(true);
    } else if (filterId === 'from') {
      setShowFromFilter(true);
    } else if (filterId === 'to') {
      setShowToFilter(true);
    } else if (filterId === 'disconnection_reason') {
      setShowDisconnectionReasonFilter(true);
    } else if (filterId === 'call_successful') {
      setShowCallSuccessfulFilter(true);
    } else if (filterId === 'e2e_latency') {
      setShowE2ELatencyFilter(true);
    } else if (filterId === 'cost') {
      setShowCostFilter(true);
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
    setShowCallIdFilter(false);
    setShowBatchCallIdFilter(false);
    setShowDurationFilter(false);
    setShowFromFilter(false);
    setShowToFilter(false);
    setShowDisconnectionReasonFilter(false);
    setShowCallSuccessfulFilter(false);
    setShowE2ELatencyFilter(false);
    setShowCostFilter(false);
  };

  const handleCancel = () => {
    setShowTypeFilter(false);
    setShowAgentFilter(false);
    setShowStatusFilter(false);
    setShowSentimentFilter(false);
    setShowCallIdFilter(false);
    setShowBatchCallIdFilter(false);
    setShowDurationFilter(false);
    setShowFromFilter(false);
    setShowToFilter(false);
    setShowDisconnectionReasonFilter(false);
    setShowCallSuccessfulFilter(false);
    setShowE2ELatencyFilter(false);
    setShowCostFilter(false);
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

  // New filter handlers
  const handleCallIdSave = () => {
    const filterCriteria: any = {};

    if (callIdValue.trim()) {
      filterCriteria.call_id = [callIdValue.trim()];
    }

    const finalCriteria = { filter_criteria: filterCriteria };

    onFilterSelect?.(finalCriteria);
    setShowCallIdFilter(false);
    setIsOpen(false);
  };

  const handleCallIdClear = () => {
    setCallIdValue('');

    const finalCriteria = { filter_criteria: {} };
    onFilterSelect?.(finalCriteria);
    setShowCallIdFilter(false);
    setIsOpen(false);
  };

  const handleDurationSave = () => {
    const filterCriteria: any = {};

    if (durationOperator === 'is between') {
      if (durationValueMin && durationValueMax) {
        filterCriteria.duration_ms = {
          lower_threshold: parseInt(durationValueMin) * 60 * 1000,
          upper_threshold: parseInt(durationValueMax) * 60 * 1000
        };
      }
    } else if (durationValue) {
      const milliseconds = parseInt(durationValue) * 60 * 1000;

      if (durationOperator === 'is greater than') {
        filterCriteria.duration_ms = {
          lower_threshold: milliseconds
        };
      } else if (durationOperator === 'is less than') {
        filterCriteria.duration_ms = {
          upper_threshold: milliseconds
        };
      }
    }

    const finalCriteria = { filter_criteria: filterCriteria };

    onFilterSelect?.(finalCriteria);
    setShowDurationFilter(false);
    setIsOpen(false);
  };

  const handleDurationClear = () => {
    setDurationOperator('is greater than');
    setDurationValue('');
    setDurationValueMin('');
    setDurationValueMax('');

    const finalCriteria = { filter_criteria: {} };
    onFilterSelect?.(finalCriteria);
    setShowDurationFilter(false);
    setIsOpen(false);
  };

  const handleFromSave = () => {
    const filterCriteria: any = {};

    if (fromNumberValue.trim()) {
      filterCriteria.from_number = [fromNumberValue.trim()];
    }

    const finalCriteria = { filter_criteria: filterCriteria };

    onFilterSelect?.(finalCriteria);
    setShowFromFilter(false);
    setIsOpen(false);
  };

  const handleFromClear = () => {
    setFromNumberValue('');

    const finalCriteria = { filter_criteria: {} };
    onFilterSelect?.(finalCriteria);
    setShowFromFilter(false);
    setIsOpen(false);
  };

  const handleToSave = () => {
    const filterCriteria: any = {};

    if (toNumberValue.trim()) {
      filterCriteria.to_number = [toNumberValue.trim()];
    }

    const finalCriteria = { filter_criteria: filterCriteria };

    onFilterSelect?.(finalCriteria);
    setShowToFilter(false);
    setIsOpen(false);
  };

  const handleToClear = () => {
    setToNumberValue('');

    const finalCriteria = { filter_criteria: {} };
    onFilterSelect?.(finalCriteria);
    setShowToFilter(false);
    setIsOpen(false);
  };

  const handleBatchCallIdSave = () => {
    const filterCriteria: any = {};

    if (batchCallIdValue.trim()) {
      filterCriteria.batch_call_id = [batchCallIdValue.trim()];
    }

    const finalCriteria = { filter_criteria: filterCriteria };

    onFilterSelect?.(finalCriteria);
    setShowBatchCallIdFilter(false);
    setIsOpen(false);
  };

  const handleBatchCallIdClear = () => {
    setBatchCallIdValue('');

    const finalCriteria = { filter_criteria: {} };
    onFilterSelect?.(finalCriteria);
    setShowBatchCallIdFilter(false);
    setIsOpen(false);
  };

  const handleDisconnectionReasonToggle = (reason: string) => {
    setSelectedDisconnectionReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const handleDisconnectionReasonSave = () => {
    const filterCriteria: any = {};

    if (selectedDisconnectionReasons.length > 0) {
      filterCriteria.disconnection_reason = selectedDisconnectionReasons;
    }

    const finalCriteria = { filter_criteria: filterCriteria };

    onFilterSelect?.(finalCriteria);
    setShowDisconnectionReasonFilter(false);
    setIsOpen(false);
  };

  const handleDisconnectionReasonClear = () => {
    setSelectedDisconnectionReasons([]);

    const finalCriteria = { filter_criteria: {} };
    onFilterSelect?.(finalCriteria);
    setShowDisconnectionReasonFilter(false);
    setIsOpen(false);
  };

  const handleCallSuccessfulToggle = (value: boolean) => {
    setSelectedCallSuccessful((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const handleCallSuccessfulSave = () => {
    const filterCriteria: any = {};

    if (selectedCallSuccessful.length > 0) {
      filterCriteria.call_successful = selectedCallSuccessful;
    }

    const finalCriteria = { filter_criteria: filterCriteria };

    onFilterSelect?.(finalCriteria);
    setShowCallSuccessfulFilter(false);
    setIsOpen(false);
  };

  const handleCallSuccessfulClear = () => {
    setSelectedCallSuccessful([]);

    const finalCriteria = { filter_criteria: {} };
    onFilterSelect?.(finalCriteria);
    setShowCallSuccessfulFilter(false);
    setIsOpen(false);
  };

  const handleE2ELatencySave = () => {
    const filterCriteria: any = {};

    if (e2eLatencyOperator === 'is between') {
      if (e2eLatencyValueMin && e2eLatencyValueMax) {
        filterCriteria.e2e_latency_p50 = {
          lower_threshold: parseInt(e2eLatencyValueMin),
          upper_threshold: parseInt(e2eLatencyValueMax)
        };
      }
    } else if (e2eLatencyValue) {
      const latency = parseInt(e2eLatencyValue);

      if (e2eLatencyOperator === 'is greater than') {
        filterCriteria.e2e_latency_p50 = {
          lower_threshold: latency
        };
      } else if (e2eLatencyOperator === 'is less than') {
        filterCriteria.e2e_latency_p50 = {
          upper_threshold: latency
        };
      }
    }

    const finalCriteria = { filter_criteria: filterCriteria };

    onFilterSelect?.(finalCriteria);
    setShowE2ELatencyFilter(false);
    setIsOpen(false);
  };

  const handleE2ELatencyClear = () => {
    setE2ELatencyOperator('is greater than');
    setE2ELatencyValue('');
    setE2ELatencyValueMin('');
    setE2ELatencyValueMax('');

    const finalCriteria = { filter_criteria: {} };
    onFilterSelect?.(finalCriteria);
    setShowE2ELatencyFilter(false);
    setIsOpen(false);
  };

  const handleCostSave = () => {
    const filterCriteria: any = {};

    if (costOperator === 'is between') {
      if (costValueMin && costValueMax) {
        filterCriteria.cost = {
          lower_threshold: parseFloat(costValueMin) * 100,
          upper_threshold: parseFloat(costValueMax) * 100
        };
      }
    } else if (costValue) {
      const cost = parseFloat(costValue) * 100;

      if (costOperator === 'is greater than') {
        filterCriteria.cost = {
          lower_threshold: cost
        };
      } else if (costOperator === 'is less than') {
        filterCriteria.cost = {
          upper_threshold: cost
        };
      }
    }

    const finalCriteria = { filter_criteria: filterCriteria };

    onFilterSelect?.(finalCriteria);
    setShowCostFilter(false);
    setIsOpen(false);
  };

  const handleCostClear = () => {
    setCostOperator('is greater than');
    setCostValue('');
    setCostValueMin('');
    setCostValueMax('');

    const finalCriteria = { filter_criteria: {} };
    onFilterSelect?.(finalCriteria);
    setShowCostFilter(false);
    setIsOpen(false);
  };

  const handleVersionSave = () => {
    const filterCriteria: any = {};

    if (versionValue.trim()) {
      filterCriteria.version = [parseInt(versionValue.trim())];
    }

    const finalCriteria = { filter_criteria: filterCriteria };

    onFilterSelect?.(finalCriteria);
    setShowVersionFilter(false);
    setIsOpen(false);
  };

  const handleVersionClear = () => {
    setVersionValue('');

    const finalCriteria = { filter_criteria: {} };
    onFilterSelect?.(finalCriteria);
    setShowVersionFilter(false);
    setIsOpen(false);
  };

  const handleInVoicemailToggle = (value: boolean) => {
    setSelectedInVoicemail((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const handleInVoicemailSave = () => {
    const filterCriteria: any = {};

    if (selectedInVoicemail.length > 0) {
      filterCriteria.in_voicemail = selectedInVoicemail;
    }

    const finalCriteria = { filter_criteria: filterCriteria };

    onFilterSelect?.(finalCriteria);
    setShowInVoicemailFilter(false);
    setIsOpen(false);
  };

  const handleInVoicemailClear = () => {
    setSelectedInVoicemail([]);

    const finalCriteria = { filter_criteria: {} };
    onFilterSelect?.(finalCriteria);
    setShowInVoicemailFilter(false);
    setIsOpen(false);
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

  const durationOperators = [
    { value: 'is greater than', label: 'es mayor que' },
    { value: 'is less than', label: 'es menor que' },
    { value: 'is between', label: 'está entre' }
  ];

  const disconnectionReasons = [
    { value: 'user_hangup', label: 'Usuario Colgó' },
    { value: 'agent_hangup', label: 'Agente Colgó' },
    { value: 'call_transfer', label: 'Transferencia de Llamada' },
    { value: 'voicemail_reached', label: 'Buzón de Voz Alcanzado' },
    { value: 'inactivity', label: 'Inactividad' },
    { value: 'max_duration_reached', label: 'Duración Máxima Alcanzada' },
    { value: 'dial_busy', label: 'Línea Ocupada' },
    { value: 'dial_failed', label: 'Marcado Fallido' },
    { value: 'dial_no_answer', label: 'Sin Respuesta' },
    { value: 'error_unknown', label: 'Error Desconocido' }
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50">
          <Plus className="mr-2 h-4 w-4" />
          Filtrar
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        {!showTypeFilter &&
        !showAgentFilter &&
        !showStatusFilter &&
        !showSentimentFilter &&
        !showCallIdFilter &&
        !showBatchCallIdFilter &&
        !showDurationFilter &&
        !showFromFilter &&
        !showToFilter &&
        !showDisconnectionReasonFilter &&
        !showCallSuccessfulFilter &&
        !showE2ELatencyFilter &&
        !showCostFilter &&
        !showVersionFilter &&
        !showInVoicemailFilter ? (
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
                <Button onClick={onRetryAgents} variant="outline" size="sm">
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
        ) : showCallIdFilter ? (
          <div className="p-4">
            <div className="mb-4 flex items-center">
              <Button variant="ghost" size="icon" className="mr-2 h-6 w-6" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-sm font-medium text-gray-900">Filtrar por ID de Llamada</h3>
            </div>

            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Ingresar ID de Llamada"
                value={callIdValue}
                onChange={(e) => setCallIdValue(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCallIdClear}
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
                  onClick={handleCallIdSave}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                  disabled={!callIdValue.trim()}
                >
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        ) : showDurationFilter ? (
          <div className="p-4">
            <div className="mb-4 flex items-center">
              <Button variant="ghost" size="icon" className="mr-2 h-6 w-6" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-sm font-medium text-gray-900">Filtrar por Duración</h3>
            </div>

            <div className="space-y-4">
              <select
                value={durationOperator}
                onChange={(e) => setDurationOperator(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              >
                {durationOperators.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>

              {durationOperator === 'is between' ? (
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="0"
                    value={durationValueMin}
                    onChange={(e) => setDurationValueMin(e.target.value)}
                    className="w-full"
                    min="0"
                  />
                  <span className="text-sm text-gray-500">-</span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={durationValueMax}
                    onChange={(e) => setDurationValueMax(e.target.value)}
                    className="w-full"
                    min="0"
                  />
                  <span className="text-sm text-gray-500">mins</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="0"
                    value={durationValue}
                    onChange={(e) => setDurationValue(e.target.value)}
                    className="flex-1"
                    min="0"
                  />
                  <span className="text-sm text-gray-500">mins</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDurationClear}
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
                  onClick={handleDurationSave}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                  disabled={durationOperator === 'is between' ? !durationValueMin || !durationValueMax : !durationValue}
                >
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        ) : showFromFilter ? (
          <div className="p-4">
            <div className="mb-4 flex items-center">
              <Button variant="ghost" size="icon" className="mr-2 h-6 w-6" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-sm font-medium text-gray-900">Filtrar por De</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <span className="mt-2 text-sm text-gray-700">es</span>
                <Input
                  type="text"
                  placeholder="Ingresar número de teléfono"
                  value={fromNumberValue}
                  onChange={(e) => setFromNumberValue(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFromClear}
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
                  onClick={handleFromSave}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                  disabled={!fromNumberValue.trim()}
                >
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        ) : showToFilter ? (
          <div className="p-4">
            <div className="mb-4 flex items-center">
              <Button variant="ghost" size="icon" className="mr-2 h-6 w-6" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-sm font-medium text-gray-900">Filtrar por Para</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <span className="mt-2 text-sm text-gray-700">es</span>
                <Input
                  type="text"
                  placeholder="Ingresar número de teléfono"
                  value={toNumberValue}
                  onChange={(e) => setToNumberValue(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToClear}
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
                  onClick={handleToSave}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                  disabled={!toNumberValue.trim()}
                >
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        ) : showBatchCallIdFilter ? (
          <div className="p-4">
            <div className="mb-4 flex items-center">
              <Button variant="ghost" size="icon" className="mr-2 h-6 w-6" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-sm font-medium text-gray-900">Filtrar por ID de Llamada en Lote</h3>
            </div>

            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Ingresar ID de Llamada en Lote"
                value={batchCallIdValue}
                onChange={(e) => setBatchCallIdValue(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchCallIdClear}
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
                  onClick={handleBatchCallIdSave}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                  disabled={!batchCallIdValue.trim()}
                >
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        ) : showDisconnectionReasonFilter ? (
          <div className="p-4">
            <div className="mb-4 flex items-center">
              <Button variant="ghost" size="icon" className="mr-2 h-6 w-6" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-sm font-medium text-gray-900">Filtrar por Razón de Desconexión</h3>
            </div>

            <div className="max-h-64 space-y-3 overflow-y-auto">
              {disconnectionReasons.map((reason) => (
                <div key={reason.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={reason.value}
                    checked={selectedDisconnectionReasons.includes(reason.value)}
                    onCheckedChange={() => handleDisconnectionReasonToggle(reason.value)}
                  />
                  <Label htmlFor={reason.value} className="text-sm text-gray-900">
                    {reason.label}
                  </Label>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnectionReasonClear}
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
                  onClick={handleDisconnectionReasonSave}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                  disabled={selectedDisconnectionReasons.length === 0}
                >
                  Guardar ({selectedDisconnectionReasons.length})
                </Button>
              </div>
            </div>
          </div>
        ) : showCallSuccessfulFilter ? (
          <div className="p-4">
            <div className="mb-4 flex items-center">
              <Button variant="ghost" size="icon" className="mr-2 h-6 w-6" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-sm font-medium text-gray-900">Filtrar por Llamada Exitosa</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="successful_true"
                  checked={selectedCallSuccessful.includes(true)}
                  onCheckedChange={() => handleCallSuccessfulToggle(true)}
                />
                <Label htmlFor="successful_true" className="text-sm text-gray-900">
                  Sí
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="successful_false"
                  checked={selectedCallSuccessful.includes(false)}
                  onCheckedChange={() => handleCallSuccessfulToggle(false)}
                />
                <Label htmlFor="successful_false" className="text-sm text-gray-900">
                  No
                </Label>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCallSuccessfulClear}
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
                  onClick={handleCallSuccessfulSave}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                  disabled={selectedCallSuccessful.length === 0}
                >
                  Guardar ({selectedCallSuccessful.length})
                </Button>
              </div>
            </div>
          </div>
        ) : showE2ELatencyFilter ? (
          <div className="p-4">
            <div className="mb-4 flex items-center">
              <Button variant="ghost" size="icon" className="mr-2 h-6 w-6" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-sm font-medium text-gray-900">Filtrar por Latencia E2E</h3>
            </div>

            <div className="space-y-4">
              <select
                value={e2eLatencyOperator}
                onChange={(e) => setE2ELatencyOperator(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              >
                {durationOperators.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>

              {e2eLatencyOperator === 'is between' ? (
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="0"
                    value={e2eLatencyValueMin}
                    onChange={(e) => setE2ELatencyValueMin(e.target.value)}
                    className="w-full"
                    min="0"
                  />
                  <span className="text-sm text-gray-500">-</span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={e2eLatencyValueMax}
                    onChange={(e) => setE2ELatencyValueMax(e.target.value)}
                    className="w-full"
                    min="0"
                  />
                  <span className="text-sm text-gray-500">ms</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="0"
                    value={e2eLatencyValue}
                    onChange={(e) => setE2ELatencyValue(e.target.value)}
                    className="flex-1"
                    min="0"
                  />
                  <span className="text-sm text-gray-500">ms</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleE2ELatencyClear}
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
                  onClick={handleE2ELatencySave}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                  disabled={
                    e2eLatencyOperator === 'is between' ? !e2eLatencyValueMin || !e2eLatencyValueMax : !e2eLatencyValue
                  }
                >
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        ) : showCostFilter ? (
          <div className="p-4">
            <div className="mb-4 flex items-center">
              <Button variant="ghost" size="icon" className="mr-2 h-6 w-6" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-sm font-medium text-gray-900">Filtrar por Costo</h3>
            </div>

            <div className="space-y-4">
              <select
                value={costOperator}
                onChange={(e) => setCostOperator(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              >
                {durationOperators.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>

              {costOperator === 'is between' ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={costValueMin}
                    onChange={(e) => setCostValueMin(e.target.value)}
                    className="w-full"
                    min="0"
                    step="0.01"
                  />
                  <span className="text-sm text-gray-500">-</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={costValueMax}
                    onChange={(e) => setCostValueMax(e.target.value)}
                    className="w-full"
                    min="0"
                    step="0.01"
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={costValue}
                    onChange={(e) => setCostValue(e.target.value)}
                    className="flex-1"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCostClear}
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
                  onClick={handleCostSave}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                  disabled={costOperator === 'is between' ? !costValueMin || !costValueMax : !costValue}
                >
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
