// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiService } from '@/services';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PhoneNumber {
  phone_number: string;
  phone_number_type: string;
  phone_number_pretty: string;
  nickname: string;
  inbound_agent_id: string;
  outbound_agent_id: string;
  last_modification_timestamp: number;
  inbound_agent_version: number;
  outbound_agent_version: number;
  inbound_webhook_url?: string;
}

interface ApiAgent {
  agent_id: string;
  agent_name: string;
  version: number;
  response_engine: {
    type: string;
    llm_id?: string;
  };
  voice_id: string;
  last_modification_timestamp: number;
}

interface Agent {
  id: string;
  name: string;
  version: number;
}

interface Llm {
  general_prompt?: string;
}

interface CustomAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionLabel?: string;
  cancelLabel?: string;
  onAction?: () => void;
  isLoading?: boolean;
  variant?: 'error' | 'warning';
}

function CustomAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  actionLabel,
  cancelLabel = 'Cancelar',
  onAction,
  isLoading = false,
  variant = 'error'
}: CustomAlertDialogProps) {
  const showActions = actionLabel && onAction;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
              <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription className="mt-2">{description}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {showActions ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                {cancelLabel}
              </Button>
              <Button onClick={onAction} disabled={isLoading} className="bg-gray-900 hover:bg-gray-800">
                {isLoading ? `${actionLabel}...` : actionLabel}
              </Button>
            </>
          ) : (
            <AlertDialogAction className="bg-gray-900 hover:bg-gray-800">Cerrar</AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function PhoneNumbersManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [loadingPhoneNumbers, setLoadingPhoneNumbers] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<PhoneNumber | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [inboundAgent, setInboundAgent] = useState('');
  const [outboundAgent, setOutboundAgent] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showOutboundCallModal, setShowOutboundCallModal] = useState(false);
  const [showSmsSetupModal, setShowSmsSetupModal] = useState(false);
  const [smsSetupData, setSmsSetupData] = useState({
    provider: 'twilio',
    accountSid: '',
    authToken: ''
  });
  const [smsSetupError, setSmsSetupError] = useState('');
  const [isSavingSms, setIsSavingSms] = useState(false);
  const [errorAlert, setErrorAlert] = useState<{ title: string; message: string } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [editedNickname, setEditedNickname] = useState('');
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [outboundCallData, setOutboundCallData] = useState({
    phoneNumber: '',
    customHeaders: [] as { key: string; value: string }[],
    dynamicVariables: {} as Record<string, string>
  });
  const [availableDynamicVariables, setAvailableDynamicVariables] = useState<string[]>([]);
  const [newPhoneData, setNewPhoneData] = useState({
    phoneNumber: '',
    terminationUri: '',
    sipUsername: '',
    sipPassword: '',
    nickname: ''
  });

  const fetchPhoneNumbers = async () => {
    try {
      setLoadingPhoneNumbers(true);
      const data = await apiService.getPhoneNumbers();
      setPhoneNumbers(data);

      const phoneFromUrl = searchParams.get('phone');

      if (phoneFromUrl && data.length > 0) {
        const phoneToSelect = data.find((p: PhoneNumber) => p.phone_number === phoneFromUrl);
        if (phoneToSelect) {
          setSelectedPhone(phoneToSelect);
          setInboundAgent(phoneToSelect.inbound_agent_id || '');
          setOutboundAgent(phoneToSelect.outbound_agent_id || '');
          return;
        }
      }

      if (data.length > 0) {
        const firstPhone = data[0];
        setSelectedPhone(firstPhone);
        setInboundAgent(firstPhone.inbound_agent_id || '');
        setOutboundAgent(firstPhone.outbound_agent_id || '');
        router.replace(`?phone=${encodeURIComponent(firstPhone.phone_number)}`);
      }
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

      const agentMap = new Map<string, ApiAgent>();
      response.forEach((agent: ApiAgent) => {
        const existing = agentMap.get(agent.agent_id);
        if (!existing || agent.version > existing.version) {
          agentMap.set(agent.agent_id, agent);
        }
      });

      const mappedAgents: Agent[] = Array.from(agentMap.values()).map((agent: ApiAgent) => ({
        id: agent.agent_id,
        name: agent.agent_name,
        version: agent.version
      }));

      setAgents(mappedAgents);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoadingAgents(false);
    }
  };

  useEffect(() => {
    fetchPhoneNumbers();
    fetchAgents();
  }, []);

  useEffect(() => {
    if (selectedPhone) {
      setInboundAgent(selectedPhone.inbound_agent_id || '');
      setOutboundAgent(selectedPhone.outbound_agent_id || '');
      setEditedNickname(selectedPhone.nickname || '');
      setWebhookEnabled(!!selectedPhone.inbound_webhook_url);
      setWebhookUrl(selectedPhone.inbound_webhook_url || '');

      router.replace(`?phone=${encodeURIComponent(selectedPhone.phone_number)}`);
    }
  }, [selectedPhone, router]);

  const handleAddNumber = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewPhoneData({
      phoneNumber: '',
      terminationUri: '',
      sipUsername: '',
      sipPassword: '',
      nickname: ''
    });
  };

  const handleSavePhone = async () => {
    try {
      const phoneData = {
        phone_number: newPhoneData.phoneNumber,
        termination_uri: newPhoneData.terminationUri,
        sip_trunk_auth_username: newPhoneData.sipUsername || undefined,
        sip_trunk_auth_password: newPhoneData.sipPassword || undefined,
        nickname: newPhoneData.nickname || undefined
      };

      await apiService.importPhoneNumber(phoneData);

      handleCloseModal();
      await fetchPhoneNumbers();
    } catch (error) {
      console.error('Error importing phone number:', error);
    }
  };

  const handleOpenOutboundCallModal = async () => {
    if (!selectedPhone || !selectedPhone.outbound_agent_id) {
      setShowOutboundCallModal(true);
      return;
    }

    try {
      const agentsResponse = await apiService.getAgents();
      const agent = agentsResponse.find((a: ApiAgent) => a.agent_id === selectedPhone.outbound_agent_id);

      if (agent && agent.response_engine?.llm_id) {
        const llmId = agent.response_engine.llm_id;
        const llmResponse = await apiService.getLlm(llmId);

        const generalPrompt = llmResponse?.data?.general_prompt || llmResponse?.general_prompt;

        if (generalPrompt) {
          const regex = /\{\{([^}]+)\}\}/g;
          const variables: string[] = [];
          let match;

          while ((match = regex.exec(generalPrompt)) !== null) {
            const variableName = match[1].trim();
            if (!variables.includes(variableName)) {
              variables.push(variableName);
            }
          }

          setAvailableDynamicVariables(variables);

          const initialVariables: Record<string, string> = {};
          variables.forEach((variable) => {
            initialVariables[variable] = '';
          });

          setOutboundCallData({
            phoneNumber: '',
            customHeaders: [],
            dynamicVariables: initialVariables
          });
        }
      }
    } catch (error) {
      console.error('Error fetching LLM data:', error);
    }

    setShowOutboundCallModal(true);
  };

  const handleCloseOutboundCallModal = () => {
    setShowOutboundCallModal(false);
    setOutboundCallData({
      phoneNumber: '',
      customHeaders: [],
      dynamicVariables: {}
    });
    setAvailableDynamicVariables([]);
  };

  const handleAddCustomHeader = () => {
    setOutboundCallData({
      ...outboundCallData,
      customHeaders: [...outboundCallData.customHeaders, { key: '', value: '' }]
    });
  };

  const handleRemoveCustomHeader = (index: number) => {
    const newHeaders = outboundCallData.customHeaders.filter((_, i) => i !== index);
    setOutboundCallData({
      ...outboundCallData,
      customHeaders: newHeaders
    });
  };

  const handleCustomHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...outboundCallData.customHeaders];
    newHeaders[index][field] = value;
    setOutboundCallData({
      ...outboundCallData,
      customHeaders: newHeaders
    });
  };

  const handleDynamicVariableChange = (variableName: string, value: string) => {
    setOutboundCallData({
      ...outboundCallData,
      dynamicVariables: {
        ...outboundCallData.dynamicVariables,
        [variableName]: value
      }
    });
  };

  const handleMakeOutboundCall = async () => {
    if (!selectedPhone) return;

    if (!outboundCallData.phoneNumber.trim()) {
      setErrorAlert({
        title: 'Falta el número de teléfono',
        message: 'Por favor ingresa un número de teléfono para realizar la llamada.'
      });
      return;
    }

    if (!selectedPhone.outbound_agent_id) {
      setErrorAlert({
        title: 'Error al realizar la llamada',
        message: 'No hay un agente de salida configurado para este número de teléfono.'
      });
      return;
    }

    try {
      const callData = {
        from_number: selectedPhone.phone_number,
        to_number: outboundCallData.phoneNumber,
        retell_llm_dynamic_variables: outboundCallData.dynamicVariables,
        custom_sip_headers: outboundCallData.customHeaders.reduce(
          (acc, header) => {
            if (header.key && header.value) {
              acc[header.key] = header.value;
            }
            return acc;
          },
          {} as Record<string, string>
        )
      };

      await apiService.createPhoneCall(callData);

      handleCloseOutboundCallModal();
    } catch (error: any) {
      console.error('Error making outbound call:', error);
      setErrorAlert({
        title: 'Error al realizar la llamada',
        message:
          error?.response?.data?.message ||
          'Ocurrió un error al intentar realizar la llamada. Por favor intenta nuevamente.'
      });
    }
  };

  const handleOpenSmsSetupModal = () => {
    setShowSmsSetupModal(true);
  };

  const handleCloseSmsSetupModal = () => {
    setShowSmsSetupModal(false);
    setSmsSetupData({
      provider: 'twilio',
      accountSid: '',
      authToken: ''
    });
    setSmsSetupError('');
    setIsSavingSms(false);
  };

  const handleSaveSmsSetup = async () => {
    if (!selectedPhone) return;

    if (!smsSetupData.accountSid.trim() || !smsSetupData.authToken.trim()) {
      setSmsSetupError('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      setIsSavingSms(true);
      setSmsSetupError('');

      const setupData = {
        phone_number: selectedPhone.phone_number,
        sms_provider: smsSetupData.provider,
        account_sid: smsSetupData.accountSid,
        auth_token: smsSetupData.authToken
      };

      await apiService.setupSmsWebhook(setupData);

      handleCloseSmsSetupModal();
      await fetchPhoneNumbers();
    } catch (error: any) {
      console.error('Error setting up SMS:', error);
      setSmsSetupError(
        error?.response?.data?.message ||
          'Error: No se pudo configurar el webhook de SMS. Por favor verifica tus credenciales e intenta nuevamente.'
      );
    } finally {
      setIsSavingSms(false);
    }
  };

  const handleDeletePhone = async () => {
    if (!selectedPhone) return;

    try {
      setIsDeleting(true);
      await apiService.deletePhoneNumber(selectedPhone.phone_number);

      setShowDeleteDialog(false);

      await fetchPhoneNumbers();

      if (phoneNumbers.length <= 1) {
        setSelectedPhone(null);
        router.replace(window.location.pathname);
      }
    } catch (error: any) {
      console.error('Error deleting phone:', error);
      setShowDeleteDialog(false);
      setErrorAlert({
        title: 'Error al eliminar teléfono',
        message:
          error?.response?.data?.message ||
          'Ocurrió un error al intentar eliminar el número de teléfono. Por favor intenta nuevamente.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateInboundAgent = async (agentId: string) => {
    if (!selectedPhone) return;

    try {
      setInboundAgent(agentId);

      await apiService.updatePhoneNumber(selectedPhone.phone_number, {
        inbound_agent_id: agentId || undefined
      });

      const updatedPhones = phoneNumbers.map((phone) =>
        phone.phone_number === selectedPhone.phone_number ? { ...phone, inbound_agent_id: agentId } : phone
      );
      setPhoneNumbers(updatedPhones);
      setSelectedPhone({ ...selectedPhone, inbound_agent_id: agentId });
    } catch (error) {
      console.error('Error updating inbound agent:', error);
      setInboundAgent(selectedPhone.inbound_agent_id || '');
    }
  };

  const handleUpdateOutboundAgent = async (agentId: string) => {
    if (!selectedPhone) return;

    try {
      setOutboundAgent(agentId);

      await apiService.updatePhoneNumber(selectedPhone.phone_number, {
        outbound_agent_id: agentId || undefined
      });

      const updatedPhones = phoneNumbers.map((phone) =>
        phone.phone_number === selectedPhone.phone_number ? { ...phone, outbound_agent_id: agentId } : phone
      );
      setPhoneNumbers(updatedPhones);
      setSelectedPhone({ ...selectedPhone, outbound_agent_id: agentId });
    } catch (error) {
      console.error('Error updating outbound agent:', error);
      setOutboundAgent(selectedPhone.outbound_agent_id || '');
    }
  };

  const handleNicknameClick = () => {
    setIsEditingNickname(true);
    setEditedNickname(selectedPhone?.nickname || '');
  };

  const handleNicknameBlur = async () => {
    if (!selectedPhone) return;

    if (editedNickname !== selectedPhone.nickname) {
      try {
        await apiService.updatePhoneNumber(selectedPhone.phone_number, {
          nickname: editedNickname.trim() || undefined
        });

        const updatedPhones = phoneNumbers.map((phone) =>
          phone.phone_number === selectedPhone.phone_number ? { ...phone, nickname: editedNickname.trim() } : phone
        );
        setPhoneNumbers(updatedPhones);
        setSelectedPhone({ ...selectedPhone, nickname: editedNickname.trim() });
      } catch (error) {
        console.error('Error updating nickname:', error);
        setEditedNickname(selectedPhone.nickname || '');
      }
    }
    setIsEditingNickname(false);
  };

  const handleNicknameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleWebhookToggle = async (checked: boolean) => {
    if (!selectedPhone) return;

    try {
      setWebhookEnabled(checked);

      if (!checked) {
        await apiService.updatePhoneNumber(selectedPhone.phone_number, {
          inbound_webhook_url: null
        });
        setWebhookUrl('');

        const updatedPhones = phoneNumbers.map((phone) =>
          phone.phone_number === selectedPhone.phone_number ? { ...phone, inbound_webhook_url: undefined } : phone
        );
        setPhoneNumbers(updatedPhones);
        setSelectedPhone({ ...selectedPhone, inbound_webhook_url: undefined });
      }
    } catch (error) {
      console.error('Error updating webhook:', error);
      setWebhookEnabled(!checked);
    }
  };

  const handleWebhookUrlBlur = async () => {
    if (!selectedPhone || !webhookEnabled) return;

    if (webhookUrl !== (selectedPhone.inbound_webhook_url || '')) {
      try {
        await apiService.updatePhoneNumber(selectedPhone.phone_number, {
          inbound_webhook_url: webhookUrl.trim() || null
        });

        const updatedPhones = phoneNumbers.map((phone) =>
          phone.phone_number === selectedPhone.phone_number
            ? { ...phone, inbound_webhook_url: webhookUrl.trim() || undefined }
            : phone
        );
        setPhoneNumbers(updatedPhones);
        setSelectedPhone({ ...selectedPhone, inbound_webhook_url: webhookUrl.trim() || undefined });
      } catch (error) {
        console.error('Error updating webhook URL:', error);
        setWebhookUrl(selectedPhone.inbound_webhook_url || '');
      }
    }
  };

  if (loadingPhoneNumbers || loadingAgents) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen gap-0 bg-white">
      <div className="w-[280px] bg-white p-6">
        <div className="mb-4 flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path
                d="M6.25 2.5H14.5C14.6989 2.5 14.8897 2.57902 15.0303 2.71967C15.171 2.86032 15.25 3.05109 15.25 3.25V16.75C15.25 16.9489 15.171 17.1397 15.0303 17.2803C14.8897 17.421 14.6989 17.5 14.5 17.5H5.5C5.30109 17.5 5.11032 17.421 4.96967 17.2803C4.82902 17.1397 4.75 16.9489 4.75 16.75V1H6.25V2.5ZM6.25 7.75H13.75V4H6.25V7.75ZM6.25 9.25V16H13.75V9.25H6.25Z"
                fill="#6B7280"
              />
            </svg>
            <div className="text-sm font-semibold text-gray-900">Números de Teléfono</div>
          </div>
          <button
            onClick={handleAddNumber}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900 transition-colors hover:bg-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M9.25 9.25V4.75H10.75V9.25H15.25V10.75H10.75V15.25H9.25V10.75H4.75V9.25H9.25Z" fill="white" />
            </svg>
          </button>
        </div>

        <ul className="list-none space-y-1 p-0">
          {phoneNumbers.map((phone) => (
            <li
              key={phone.phone_number}
              onClick={() => setSelectedPhone(phone)}
              className={`cursor-pointer rounded-lg p-2 text-sm transition-colors ${
                selectedPhone?.phone_number === phone.phone_number
                  ? 'bg-gray-100 font-medium text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {phone.nickname || phone.phone_number_pretty || phone.phone_number}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 border-l border-gray-200 p-6">
        {selectedPhone ? (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isEditingNickname ? (
                  <Input
                    value={editedNickname}
                    onChange={(e) => setEditedNickname(e.target.value)}
                    onBlur={handleNicknameBlur}
                    onKeyDown={handleNicknameKeyDown}
                    autoFocus
                    className="h-10 max-w-md text-2xl font-semibold"
                    placeholder="Ingresa un apodo"
                  />
                ) : (
                  <h1
                    className="cursor-pointer text-2xl font-semibold text-gray-900 transition-colors hover:text-gray-600"
                    onClick={handleNicknameClick}
                  >
                    {selectedPhone.nickname || selectedPhone.phone_number_pretty || selectedPhone.phone_number}
                  </h1>
                )}
                <button onClick={handleNicknameClick} className="rounded p-1 hover:bg-gray-100">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenOutboundCallModal}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="text-sm font-medium">Hacer una llamada saliente</span>
                </button>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-8 text-sm text-gray-500">
              ID: {selectedPhone.phone_number} · Proveedor: {selectedPhone.phone_number_type}
            </div>

            <div className="mb-8">
              <Label className="mb-3 block text-sm font-semibold text-gray-900">Agente de llamadas entrantes</Label>
              <Select value={inboundAgent || undefined} onValueChange={handleUpdateInboundAgent}>
                <SelectTrigger className="w-full font-normal text-gray-900">
                  <SelectValue placeholder="Ninguno (deshabilitar entrantes)" className="text-gray-900" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-3 flex items-start gap-2">
                <input
                  type="checkbox"
                  id="webhook"
                  checked={webhookEnabled}
                  onChange={(e) => handleWebhookToggle(e.target.checked)}
                  className="mt-0.5"
                />
                <Label htmlFor="webhook" className="text-sm text-gray-600">
                  Agregar un webhook de entrada.{' '}
                </Label>
              </div>
              {webhookEnabled && (
                <div className="mt-3">
                  <Input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    onBlur={handleWebhookUrlBlur}
                    placeholder="Ingresa la URL"
                    className="w-full"
                  />
                </div>
              )}
            </div>

            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <Label className="block text-sm font-semibold text-gray-900">Agente de llamadas salientes</Label>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </button>
              </div>
              <Select value={outboundAgent || undefined} onValueChange={handleUpdateOutboundAgent}>
                <SelectTrigger className="w-full font-normal text-gray-900">
                  <SelectValue placeholder="Selecciona un agente" className="text-gray-900" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Complementos Avanzados</h3>
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="mb-1 text-sm font-medium text-gray-900">SMS</div>
                    <div className="text-sm text-gray-500">La capacidad de enviar SMS</div>
                  </div>
                  <button
                    onClick={handleOpenSmsSetupModal}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Configurar Función SMS
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            Selecciona un número de teléfono para ver los detalles
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conecta tu número vía SIP trunking</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Número de Teléfono</Label>
              <Input
                id="phoneNumber"
                value={newPhoneData.phoneNumber}
                onChange={(e) => setNewPhoneData({ ...newPhoneData, phoneNumber: e.target.value })}
                placeholder="Ingresa el número de teléfono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="terminationUri">URI de Terminación</Label>
              <Input
                id="terminationUri"
                value={newPhoneData.terminationUri}
                onChange={(e) => setNewPhoneData({ ...newPhoneData, terminationUri: e.target.value })}
                placeholder="Ingresa la URI de terminación (NO la URL del servidor SIP de Retell)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sipUsername">Nombre de Usuario SIP Trunk (Opcional)</Label>
              <Input
                id="sipUsername"
                value={newPhoneData.sipUsername}
                onChange={(e) => setNewPhoneData({ ...newPhoneData, sipUsername: e.target.value })}
                placeholder="Ingresa el Nombre de Usuario SIP Trunk"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sipPassword">Contraseña SIP Trunk (Opcional)</Label>
              <Input
                id="sipPassword"
                type="password"
                value={newPhoneData.sipPassword}
                onChange={(e) => setNewPhoneData({ ...newPhoneData, sipPassword: e.target.value })}
                placeholder="Ingresa la Contraseña SIP Trunk"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">Apodo (Opcional)</Label>
              <Input
                id="nickname"
                value={newPhoneData.nickname}
                onChange={(e) => setNewPhoneData({ ...newPhoneData, nickname: e.target.value })}
                placeholder="Ingresa el Apodo"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button onClick={handleSavePhone}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showOutboundCallModal} onOpenChange={setShowOutboundCallModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Realizar Llamada Saliente</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="outboundPhoneNumber">Número de Teléfono</Label>
              <Input
                id="outboundPhoneNumber"
                value={outboundCallData.phoneNumber}
                onChange={(e) => setOutboundCallData({ ...outboundCallData, phoneNumber: e.target.value })}
                placeholder="ej. +11234567890"
              />
            </div>

            {availableDynamicVariables.length > 0 && (
              <div className="space-y-2">
                <Label>Variables Dinámicas</Label>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 gap-4 border-b border-gray-200 bg-gray-50 p-3">
                    <div className="text-sm font-medium text-gray-700">Variable Name</div>
                    <div className="text-sm font-medium text-gray-700">Test Value</div>
                  </div>
                  <div className="space-y-3 p-3">
                    {availableDynamicVariables.map((variable) => (
                      <div key={variable} className="grid grid-cols-2 items-center gap-4">
                        <Input value={variable} readOnly className="border-gray-200 bg-gray-50" />
                        <Input
                          value={outboundCallData.dynamicVariables[variable] || ''}
                          onChange={(e) => handleDynamicVariableChange(variable, e.target.value)}
                          placeholder="Enter value"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Encabezados SIP Personalizados</Label>
              <p className="text-sm text-gray-500">
                Agrega pares clave/valor para enrutamiento de llamadas, metadatos o integración con operador.
              </p>

              {outboundCallData.customHeaders.map((header, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Input
                    value={header.key}
                    onChange={(e) => handleCustomHeaderChange(index, 'key', e.target.value)}
                    placeholder="Clave"
                    className="flex-1"
                  />
                  <Input
                    value={header.value}
                    onChange={(e) => handleCustomHeaderChange(index, 'value', e.target.value)}
                    placeholder="Valor"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCustomHeader(index)}
                    className="shrink-0"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </Button>
                </div>
              ))}

              <Button variant="outline" size="sm" onClick={handleAddCustomHeader} className="w-full">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Agregar
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseOutboundCallModal}>
              Cancelar
            </Button>
            <Button onClick={handleMakeOutboundCall}>Llamar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSmsSetupModal} onOpenChange={setShowSmsSetupModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar Función SMS</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {smsSetupError && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-800">{smsSetupError}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="smsProvider">Proveedor de SMS</Label>
              <Select
                value={smsSetupData.provider}
                onValueChange={(value) => setSmsSetupData({ ...smsSetupData, provider: value })}
                disabled={isSavingSms}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twilio">Twilio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountSid">Account SID</Label>
              <Input
                id="accountSid"
                value={smsSetupData.accountSid}
                onChange={(e) => setSmsSetupData({ ...smsSetupData, accountSid: e.target.value })}
                placeholder="Ingresa el Account SID"
                disabled={isSavingSms}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authToken">Token de Autenticación Twilio</Label>
              <Input
                id="authToken"
                type="password"
                value={smsSetupData.authToken}
                onChange={(e) => setSmsSetupData({ ...smsSetupData, authToken: e.target.value })}
                placeholder="Ingresa el Token de Autenticación Twilio"
                disabled={isSavingSms}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseSmsSetupModal} disabled={isSavingSms}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSmsSetup} disabled={isSavingSms}>
              {isSavingSms ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CustomAlertDialog
        open={!!errorAlert}
        onOpenChange={() => setErrorAlert(null)}
        title={errorAlert?.title || ''}
        description={errorAlert?.message || ''}
      />

      <CustomAlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Eliminar teléfono"
        description="¿Estás seguro de que deseas eliminar este teléfono?"
        actionLabel="Eliminar"
        cancelLabel="Cancelar"
        onAction={handleDeletePhone}
        isLoading={isDeleting}
      />
    </div>
  );
}
