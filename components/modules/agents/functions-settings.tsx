// @ts-nocheck
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Loader2 } from 'lucide-react';
import type { Llm } from '@/services/types';
import { apiService } from '@/services';
import {
  CheckAvailabilityCal,
  BookAppointmentCal,
  SendSMS,
  PressDigit,
  TransferCall,
  IconDeleteSmall,
  IconPlus,
  IconCode
} from '@/components/modules/agents/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { CustomFunctionForm } from './custom-function-form';
import { ExtractVariableForm } from './extract-variable-form';
import { Slider } from '@/components/ui/slider';

interface FunctionsSettingsProps {
  llm: Llm;
  onLlmUpdate: () => void;
}

interface FunctionTool {
  name: string;
  type: string;
  description?: string;
}

export function FunctionsSettings({ llm, onLlmUpdate }: FunctionsSettingsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFunction, setEditingFunction] = useState<FunctionTool | null>(null);
  const [functionName, setFunctionName] = useState('');
  const [functionDescription, setFunctionDescription] = useState('');
  const [functionType, setFunctionType] = useState('');
  const [calApiKey, setCalApiKey] = useState('');
  const [eventTypeId, setEventTypeId] = useState('');
  const [timezone, setTimezone] = useState('');
  const [smsContentType, setSmsContentType] = useState('inferred');
  const [smsContent, setSmsContent] = useState('');
  const [delayMs, setDelayMs] = useState('');
  const [transferDestinationType, setTransferDestinationType] = useState('predefined');
  const [transferNumber, setTransferNumber] = useState('');
  const [transferType, setTransferType] = useState('cold_transfer');
  const [callerIdType, setCallerIdType] = useState('retell');
  const [customSipHeaders, setCustomSipHeaders] = useState<Array<{ key: string; value: string }>>([]);
  const [ignoreE164Validation, setIgnoreE164Validation] = useState(false);
  const [extensionNumber, setExtensionNumber] = useState(false);
  const [onHoldMusic, setOnHoldMusic] = useState('ringtone');
  const [navigateIvr, setNavigateIvr] = useState(false);
  const [ivrPrompt, setIvrPrompt] = useState('');
  const [optOutHumanDetection, setOptOutHumanDetection] = useState(false);
  const [detectionTimeoutMs, setDetectionTimeoutMs] = useState(30000);
  const [optOutInitialMessage, setOptOutInitialMessage] = useState(false);
  const [whisperMessage, setWhisperMessage] = useState(false);
  const [whisperHandoffType, setWhisperHandoffType] = useState('prompt');
  const [whisperHandoffContent, setWhisperHandoffContent] = useState('');
  const [threeWayMessage, setThreeWayMessage] = useState(false);
  const [threeWayHandoffType, setThreeWayHandoffType] = useState('prompt');
  const [threeWayHandoffContent, setThreeWayHandoffContent] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customMethod, setCustomMethod] = useState('GET');
  const [customTimeoutMs, setCustomTimeoutMs] = useState(120000);
  const [customHeaders, setCustomHeaders] = useState<Array<{ key: string; value: string }>>([]);
  const [customQueryParams, setCustomQueryParams] = useState<Array<{ key: string; value: string }>>([]);
  const [customResponseVariables, setCustomResponseVariables] = useState<Array<{ key: string; value: string }>>([]);
  const [speakDuringExecution, setSpeakDuringExecution] = useState(true);
  const [speakDuringExecutionDescription, setSpeakDuringExecutionDescription] = useState('');
  const [speakAfterExecution, setSpeakAfterExecution] = useState(true);
  const [customParameters, setCustomParameters] = useState('{\n  "type": "object",\n  "properties": {}\n}');
  const [argsAtRoot, setArgsAtRoot] = useState(false);
  const [parameterTab, setParameterTab] = useState('json');
  const [formParameters, setFormParameters] = useState<
    Array<{ name: string; description: string; type: string; required: boolean }>
  >([]);
  const [extractVariables, setExtractVariables] = useState<Array<{ name: string; description: string; type: string }>>(
    []
  );
  const [deletingFunction, setDeletingFunction] = useState<string | null>(null);

  const handleAddFunction = (type: string) => {
    setEditingFunction(null);
    setFunctionName('');
    setFunctionDescription('');
    setFunctionType(type);
    setCalApiKey('');
    setEventTypeId('');
    setTimezone('');
    setSmsContentType('inferred');
    setSmsContent('');
    setDelayMs('');
    setTransferDestinationType('predefined');
    setTransferNumber('');
    setTransferType('cold_transfer');
    setCallerIdType('retell');
    setCustomSipHeaders([]);
    setIgnoreE164Validation(false);
    setExtensionNumber(false);
    setOnHoldMusic('ringtone');
    setNavigateIvr(false);
    setIvrPrompt('');
    setOptOutHumanDetection(false);
    setDetectionTimeoutMs(30000);
    setOptOutInitialMessage(false);
    setWhisperMessage(false);
    setWhisperHandoffType('prompt');
    setWhisperHandoffContent('');
    setThreeWayMessage(false);
    setThreeWayHandoffType('prompt');
    setThreeWayHandoffContent('');
    setCustomUrl('');
    setCustomMethod('GET');
    setCustomTimeoutMs(120000);
    setCustomHeaders([]);
    setCustomQueryParams([]);
    setCustomResponseVariables([]);
    setSpeakDuringExecution(true);
    setSpeakDuringExecutionDescription('');
    setSpeakAfterExecution(true);
    setCustomParameters('{\n  "type": "object",\n  "properties": {}\n}');
    setArgsAtRoot(false);
    setParameterTab('json');
    setFormParameters([]);
    setExtractVariables([]);
    setIsDialogOpen(true);
  };

  const handleEditFunction = (func: FunctionTool) => {
    setEditingFunction(func);
    setFunctionName(func.name);
    setFunctionDescription(func.description || '');
    setFunctionType(func.type);

    if (func.type === 'send_sms' && func.sms_content) {
      setSmsContentType(func.sms_content.type || 'inferred');
      setSmsContent(func.sms_content.type === 'inferred' ? func.sms_content.prompt || '' : func.sms_content.text || '');
    } else {
      setSmsContentType('inferred');
      setSmsContent('');
    }

    if (func.type === 'check_availability_cal' || func.type === 'book_appointment_cal') {
      setCalApiKey(func.cal_api_key || '');
      setEventTypeId(func.event_type_id?.toString() || '');
      setTimezone(func.timezone || '');
    } else {
      setCalApiKey('');
      setEventTypeId('');
      setTimezone('');
    }

    if (func.type === 'press_digit') {
      setDelayMs(func.delay_ms?.toString() || '');
    } else {
      setDelayMs('');
    }

    if (func.type === 'transfer_call') {
      setTransferDestinationType(func.transfer_destination?.type || 'predefined');
      setTransferNumber(func.transfer_destination?.number || func.transfer_destination?.prompt || '');
      setTransferType(func.transfer_option?.type || 'cold_transfer');
      setCallerIdType(func.transfer_option?.show_transferee_as_caller ? 'transferee' : 'retell');
      const headers = func.custom_sip_headers || {};
      setCustomSipHeaders(Object.entries(headers).map(([key, value]) => ({ key, value: value as string })));
      setIgnoreE164Validation(func.ignore_e164_validation || false);
      setExtensionNumber(false);
      setOnHoldMusic(func.transfer_option?.on_hold_music || 'ringtone');
      setNavigateIvr(!!func.transfer_option?.ivr_option);
      setIvrPrompt(func.transfer_option?.ivr_option?.prompt || '');
      setOptOutHumanDetection(func.transfer_option?.opt_out_human_detection || false);
      setDetectionTimeoutMs(func.transfer_option?.agent_detection_timeout_ms || 30000);
      setOptOutInitialMessage(func.transfer_option?.opt_out_initial_message || false);
      setWhisperMessage(!!func.transfer_option?.whisper_message);
      setWhisperHandoffType(func.transfer_option?.whisper_message?.type || 'prompt');
      setWhisperHandoffContent(
        func.transfer_option?.whisper_message?.type === 'prompt'
          ? func.transfer_option?.whisper_message?.prompt || ''
          : func.transfer_option?.whisper_message?.static_message || ''
      );
      setThreeWayMessage(!!func.transfer_option?.three_way_message);
      setThreeWayHandoffType(func.transfer_option?.three_way_message?.type || 'prompt');
      setThreeWayHandoffContent(
        func.transfer_option?.three_way_message?.type === 'prompt'
          ? func.transfer_option?.three_way_message?.prompt || ''
          : func.transfer_option?.three_way_message?.static_message || ''
      );
    } else {
      setTransferDestinationType('predefined');
      setTransferNumber('');
      setTransferType('cold_transfer');
      setCallerIdType('retell');
      setCustomSipHeaders([]);
      setIgnoreE164Validation(false);
      setExtensionNumber(false);
      setOnHoldMusic('ringtone');
      setNavigateIvr(false);
      setIvrPrompt('');
      setOptOutHumanDetection(false);
      setDetectionTimeoutMs(30000);
      setOptOutInitialMessage(false);
      setWhisperMessage(false);
      setWhisperHandoffType('prompt');
      setWhisperHandoffContent('');
      setThreeWayMessage(false);
      setThreeWayHandoffType('prompt');
      setThreeWayHandoffContent('');
    }

    if (func.type === 'custom') {
      setCustomUrl(func.url || '');
      setCustomMethod(func.method || 'GET');
      setCustomTimeoutMs(func.timeout_ms || 120000);
      const headers = func.headers || {};
      setCustomHeaders(Object.entries(headers).map(([key, value]) => ({ key, value: value as string })));
      const queryParams = func.query_params || {};
      setCustomQueryParams(Object.entries(queryParams).map(([key, value]) => ({ key, value: value as string })));
      const responseVars = func.response_variables || {};
      setCustomResponseVariables(Object.entries(responseVars).map(([key, value]) => ({ key, value: value as string })));
      setSpeakDuringExecution(func.speak_during_execution !== false);
      setSpeakDuringExecutionDescription(func.execution_message_description || '');
      setSpeakAfterExecution(func.speak_after_execution !== false);
      setArgsAtRoot(func.args_at_root || false);

      if (func.parameters) {
        setCustomParameters(JSON.stringify(func.parameters, null, 2));

        if (func.parameters.properties) {
          const required = func.parameters.required || [];
          const formParams = Object.entries(func.parameters.properties).map(([key, value]: [string, any]) => ({
            name: key,
            description: value.description || '',
            type: value.type || 'string',
            required: required.includes(key)
          }));
          setFormParameters(formParams);
        }

        if (func.parameter_type === 'form') {
          setParameterTab('form');
        } else {
          setParameterTab('json');
        }
      } else {
        setCustomParameters('{\n  "type": "object",\n  "properties": {}\n}');
        setFormParameters([]);
        setParameterTab('json');
      }
    } else if (func.type === 'extract_dynamic_variable') {
      setExtractVariables(func.variables || []);
    } else {
      setCustomUrl('');
      setCustomMethod('GET');
      setCustomTimeoutMs(120000);
      setCustomHeaders([]);
      setCustomQueryParams([]);
      setCustomResponseVariables([]);
      setSpeakDuringExecution(true);
      setSpeakDuringExecutionDescription('');
      setSpeakAfterExecution(true);
      setCustomParameters('{\n  "type": "object",\n  "properties": {}\n}');
      setArgsAtRoot(false);
      setParameterTab('json');
      setFormParameters([]);
    }

    setIsDialogOpen(true);
  };

  const handleDeleteFunction = async (funcName: string) => {
    setDeletingFunction(funcName);
    try {
      const updatedTools = llm.general_tools?.filter((tool) => tool.name !== funcName) || [];
      await apiService.updateLlm(llm.llm_id, { general_tools: updatedTools });
      await onLlmUpdate();
    } catch (error) {
    } finally {
      setDeletingFunction(null);
    }
  };

  const handleSaveFunction = async () => {
    try {
      const currentTools = llm.general_tools || [];
      let updatedTools;

      if (editingFunction) {
        updatedTools = currentTools.map((tool) => {
          if (tool.name === editingFunction.name) {
            const updatedTool: any = {
              ...tool,
              name: functionName,
              description: functionDescription,
              type: functionType
            };

            if (functionType === 'check_availability_cal' || functionType === 'book_appointment_cal') {
              updatedTool.cal_api_key = calApiKey;
              updatedTool.event_type_id = parseInt(eventTypeId);
              if (timezone) {
                updatedTool.timezone = timezone;
              }
            }

            if (functionType === 'send_sms') {
              updatedTool.sms_content = {
                type: smsContentType
              };
              if (smsContentType === 'inferred') {
                updatedTool.sms_content.prompt = smsContent;
              } else {
                updatedTool.sms_content.text = smsContent;
              }
            }

            if (functionType === 'press_digit' && delayMs) {
              updatedTool.delay_ms = parseInt(delayMs);
            }

            if (functionType === 'transfer_call') {
              updatedTool.transfer_destination = {
                type: transferDestinationType,
                ...(transferDestinationType === 'predefined' ? { number: transferNumber } : { prompt: transferNumber })
              };
              updatedTool.transfer_option = {
                type: transferType,
                show_transferee_as_caller: callerIdType === 'transferee',
                on_hold_music: onHoldMusic,
                opt_out_human_detection: optOutHumanDetection,
                agent_detection_timeout_ms: detectionTimeoutMs,
                opt_out_initial_message: optOutInitialMessage
              };

              if (navigateIvr && ivrPrompt) {
                updatedTool.transfer_option.ivr_option = {
                  type: 'prompt',
                  prompt: ivrPrompt
                };
              }

              if (whisperMessage && whisperHandoffContent) {
                updatedTool.transfer_option.whisper_message = {
                  type: whisperHandoffType,
                  ...(whisperHandoffType === 'prompt'
                    ? { prompt: whisperHandoffContent }
                    : { static_message: whisperHandoffContent })
                };
              }

              if (threeWayMessage && threeWayHandoffContent) {
                updatedTool.transfer_option.three_way_message = {
                  type: threeWayHandoffType,
                  ...(threeWayHandoffType === 'prompt'
                    ? { prompt: threeWayHandoffContent }
                    : { static_message: threeWayHandoffContent })
                };
              }

              const headers: Record<string, string> = {};
              customSipHeaders.forEach((header) => {
                if (header.key && header.value) {
                  headers[header.key] = header.value;
                }
              });
              if (Object.keys(headers).length > 0) {
                updatedTool.custom_sip_headers = headers;
              }
              updatedTool.ignore_e164_validation = ignoreE164Validation;
            }

            if (functionType === 'custom') {
              updatedTool.url = customUrl;
              updatedTool.method = customMethod;
              updatedTool.timeout_ms = customTimeoutMs;
              updatedTool.speak_during_execution = speakDuringExecution;
              updatedTool.speak_after_execution = speakAfterExecution;
              updatedTool.parameter_type = parameterTab;
              updatedTool.args_at_root = argsAtRoot;

              if (speakDuringExecution && speakDuringExecutionDescription) {
                updatedTool.execution_message_description = speakDuringExecutionDescription;
              }

              const headers: Record<string, string> = {};
              customHeaders.forEach((header) => {
                if (header.key && header.value) {
                  headers[header.key] = header.value;
                }
              });
              if (Object.keys(headers).length > 0) {
                updatedTool.headers = headers;
              }

              const queryParams: Record<string, string> = {};
              customQueryParams.forEach((param) => {
                if (param.key && param.value) {
                  queryParams[param.key] = param.value;
                }
              });
              if (Object.keys(queryParams).length > 0) {
                updatedTool.query_params = queryParams;
              }

              const responseVars: Record<string, string> = {};
              customResponseVariables.forEach((variable) => {
                if (variable.key && variable.value) {
                  responseVars[variable.key] = variable.value;
                }
              });
              if (Object.keys(responseVars).length > 0) {
                updatedTool.response_variables = responseVars;
              }

              if (parameterTab === 'form') {
                const properties: Record<string, any> = {};
                const required: string[] = [];

                formParameters.forEach((param) => {
                  if (param.name) {
                    properties[param.name] = {
                      type: param.type,
                      description: param.description
                    };
                    if (param.required) {
                      required.push(param.name);
                    }
                  }
                });

                updatedTool.parameters = {
                  type: 'object',
                  properties: properties,
                  ...(required.length > 0 && { required: required })
                };
              } else {
                try {
                  updatedTool.parameters = JSON.parse(customParameters);
                } catch (e) {
                  updatedTool.parameters = {
                    type: 'object',
                    properties: {}
                  };
                }
              }
            }

            if (functionType === 'extract_dynamic_variable') {
              updatedTool.variables = extractVariables;
            }

            return updatedTool;
          }
          return tool;
        });
      } else {
        const newTool: any = {
          name: functionName,
          type: functionType || 'end_call',
          description: functionDescription
        };

        if (functionType === 'check_availability_cal' || functionType === 'book_appointment_cal') {
          newTool.cal_api_key = calApiKey;
          newTool.event_type_id = parseInt(eventTypeId);
          if (timezone) {
            newTool.timezone = timezone;
          }
        }

        if (functionType === 'send_sms') {
          newTool.sms_content = {
            type: smsContentType
          };
          if (smsContentType === 'inferred') {
            newTool.sms_content.prompt = smsContent;
          } else {
            newTool.sms_content.text = smsContent;
          }
        }

        if (functionType === 'press_digit' && delayMs) {
          newTool.delay_ms = parseInt(delayMs);
        }

        if (functionType === 'transfer_call') {
          newTool.transfer_destination = {
            type: transferDestinationType,
            ...(transferDestinationType === 'predefined' ? { number: transferNumber } : { prompt: transferNumber })
          };
          newTool.transfer_option = {
            type: transferType,
            show_transferee_as_caller: callerIdType === 'transferee',
            on_hold_music: onHoldMusic,
            opt_out_human_detection: optOutHumanDetection,
            agent_detection_timeout_ms: detectionTimeoutMs,
            opt_out_initial_message: optOutInitialMessage
          };

          if (navigateIvr && ivrPrompt) {
            newTool.transfer_option.ivr_option = {
              type: 'prompt',
              prompt: ivrPrompt
            };
          }

          if (whisperMessage && whisperHandoffContent) {
            newTool.transfer_option.whisper_message = {
              type: whisperHandoffType,
              ...(whisperHandoffType === 'prompt'
                ? { prompt: whisperHandoffContent }
                : { static_message: whisperHandoffContent })
            };
          }

          if (threeWayMessage && threeWayHandoffContent) {
            newTool.transfer_option.three_way_message = {
              type: threeWayHandoffType,
              ...(threeWayHandoffType === 'prompt'
                ? { prompt: threeWayHandoffContent }
                : { static_message: threeWayHandoffContent })
            };
          }

          const headers: Record<string, string> = {};
          customSipHeaders.forEach((header) => {
            if (header.key && header.value) {
              headers[header.key] = header.value;
            }
          });
          if (Object.keys(headers).length > 0) {
            newTool.custom_sip_headers = headers;
          }
          newTool.ignore_e164_validation = ignoreE164Validation;
        }

        if (functionType === 'custom') {
          newTool.url = customUrl;
          newTool.method = customMethod;
          newTool.timeout_ms = customTimeoutMs;
          newTool.speak_during_execution = speakDuringExecution;
          newTool.speak_after_execution = speakAfterExecution;
          newTool.parameter_type = parameterTab;
          newTool.args_at_root = argsAtRoot;

          if (speakDuringExecution && speakDuringExecutionDescription) {
            newTool.execution_message_description = speakDuringExecutionDescription;
          }

          const headers: Record<string, string> = {};
          customHeaders.forEach((header) => {
            if (header.key && header.value) {
              headers[header.key] = header.value;
            }
          });
          if (Object.keys(headers).length > 0) {
            newTool.headers = headers;
          }

          const queryParams: Record<string, string> = {};
          customQueryParams.forEach((param) => {
            if (param.key && param.value) {
              queryParams[param.key] = param.value;
            }
          });
          if (Object.keys(queryParams).length > 0) {
            newTool.query_params = queryParams;
          }

          const responseVars: Record<string, string> = {};
          customResponseVariables.forEach((variable) => {
            if (variable.key && variable.value) {
              responseVars[variable.key] = variable.value;
            }
          });
          if (Object.keys(responseVars).length > 0) {
            newTool.response_variables = responseVars;
          }

          if (parameterTab === 'form') {
            const properties: Record<string, any> = {};
            const required: string[] = [];

            formParameters.forEach((param) => {
              if (param.name) {
                properties[param.name] = {
                  type: param.type,
                  description: param.description
                };
                if (param.required) {
                  required.push(param.name);
                }
              }
            });

            newTool.parameters = {
              type: 'object',
              properties: properties,
              ...(required.length > 0 && { required: required })
            };
          } else {
            try {
              newTool.parameters = JSON.parse(customParameters);
            } catch (e) {
              newTool.parameters = {
                type: 'object',
                properties: {}
              };
            }
          }
        }

        if (functionType === 'extract_dynamic_variable') {
          newTool.variables = extractVariables;
        }

        updatedTools = [...currentTools, newTool];
      }

      await apiService.updateLlm(llm.llm_id, { general_tools: updatedTools });
      await onLlmUpdate();
      setIsDialogOpen(false);
    } catch (error) {}
  };

  return (
    <div className="flex flex-col items-start px-7 pb-4 pt-0">
      <div className="text-xs font-normal leading-none text-muted-foreground">
        Habilita tu agente con capacidades como reservas de calendario, finalización de llamadas, etc.
      </div>
      <div className="mt-2 flex w-full flex-col gap-1">
        {llm.general_tools?.map((tool) => (
          <div
            key={tool.name}
            className="inline-flex h-8 w-full items-center justify-start gap-1 rounded-lg border-none bg-muted/50 p-1.5"
          >
            <div className="flex items-center justify-center">
              {tool.type === 'check_availability_cal' ? (
                <CheckAvailabilityCal />
              ) : tool.type === 'book_appointment_cal' ? (
                <BookAppointmentCal />
              ) : tool.type === 'send_sms' ? (
                <SendSMS />
              ) : tool.type === 'press_digit' ? (
                <PressDigit />
              ) : tool.type === 'transfer_call' ? (
                <TransferCall />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M14.6466 12.2197C14.6466 12.4597 14.5933 12.7063 14.4799 12.9463C14.3666 13.1863 14.2199 13.413 14.0266 13.6263C13.6999 13.9863 13.3399 14.2463 12.9333 14.413C12.5333 14.5797 12.0999 14.6663 11.6333 14.6663C10.9533 14.6663 10.2266 14.5063 9.45992 14.1797C8.69325 13.853 7.92659 13.413 7.16659 12.8597C6.39992 12.2997 5.67325 11.6797 4.97992 10.993C4.29325 10.2997 3.67325 9.57301 3.11992 8.81301C2.57325 8.05301 2.13325 7.29301 1.81325 6.53967C1.49325 5.77967 1.33325 5.05301 1.33325 4.35967C1.33325 3.90634 1.41325 3.47301 1.57325 3.07301C1.73325 2.66634 1.98659 2.29301 2.33992 1.95967C2.76659 1.53967 3.23325 1.33301 3.72659 1.33301C3.91325 1.33301 4.09992 1.37301 4.26659 1.45301C4.43992 1.53301 4.59325 1.65301 4.71325 1.82634L6.25992 4.00634C6.37992 4.17301 6.46659 4.32634 6.52659 4.47301C6.58659 4.61301 6.61992 4.75301 6.61992 4.87967C6.61992 5.03967 6.57325 5.19967 6.47992 5.35301C6.39325 5.50634 6.26659 5.66634 6.10659 5.82634L5.59992 6.35301C5.52659 6.42634 5.49325 6.51301 5.49325 6.61967C5.49325 6.67301 5.49992 6.71967 5.51325 6.77301C5.53325 6.82634 5.55325 6.86634 5.56659 6.90634C5.68659 7.12634 5.89325 7.41301 6.18659 7.75967C6.48659 8.10634 6.80659 8.45967 7.15325 8.81301C7.51325 9.16634 7.85992 9.49301 8.21325 9.79301C8.55992 10.0863 8.84659 10.2863 9.07325 10.4063C9.10659 10.4197 9.14659 10.4397 9.19325 10.4597C9.24659 10.4797 9.29992 10.4863 9.35992 10.4863C9.47325 10.4863 9.55992 10.4463 9.63325 10.373L10.1399 9.87301C10.3066 9.70634 10.4666 9.57967 10.6199 9.49967C10.7733 9.40634 10.9266 9.35967 11.0933 9.35967C11.2199 9.35967 11.3533 9.38634 11.4999 9.44634C11.6466 9.50634 11.7999 9.59301 11.9666 9.70634L14.1733 11.273C14.3466 11.393 14.4666 11.533 14.5399 11.6997C14.6066 11.8663 14.6466 12.033 14.6466 12.2197Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                    className="text-muted-foreground"
                  />
                  <path
                    d="M10.8198 5.17934L13.1798 2.81934"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground"
                  />
                  <path
                    d="M13.1798 5.17934L10.8198 2.81934"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground"
                  />
                </svg>
              )}
            </div>
            <div className="truncate text-sm font-normal leading-tight text-muted-foreground">{tool.name}</div>
            <div className="ml-auto flex items-center justify-center gap-0.5 p-px">
              <button
                className="cursor-pointer rounded-sm p-px"
                onClick={() => handleEditFunction(tool)}
                disabled={deletingFunction === tool.name}
              >
                <div className="flex h-[18px] w-[18px] items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M5.23023 11.7L12.0761 4.85415L11.1216 3.8997L4.27578 10.7455V11.7H5.23023ZM5.78981 13.05H2.92578V10.186L10.6444 2.46735C10.771 2.3408 10.9426 2.26971 11.1216 2.26971C11.3006 2.26971 11.4723 2.3408 11.5989 2.46735L13.5084 4.37692C13.635 4.5035 13.7061 4.67516 13.7061 4.85415C13.7061 5.03313 13.635 5.20479 13.5084 5.33137L5.78981 13.05ZM2.92578 14.4H15.0758V15.75H2.92578V14.4Z"
                      fill="currentColor"
                      className="text-muted-foreground"
                    />
                  </svg>
                </div>
              </button>
              <button
                className="cursor-pointer rounded-sm p-px"
                onClick={() => handleDeleteFunction(tool.name)}
                disabled={deletingFunction === tool.name}
              >
                <div className="flex h-[18px] w-[18px] cursor-pointer items-center justify-center p-0">
                  {deletingFunction === tool.name ? (
                    <Loader2 className="h-[18px] w-[18px] animate-spin text-muted-foreground" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M12.375 4.95H15.75V6.3H14.4V15.075C14.4 15.254 14.3289 15.4257 14.2023 15.5523C14.0757 15.6789 13.904 15.75 13.725 15.75H4.275C4.09598 15.75 3.92429 15.6789 3.7977 15.5523C3.67112 15.4257 3.6 15.254 3.6 15.075V6.3H2.25V4.95H5.625V2.925C5.625 2.74598 5.69612 2.57429 5.8227 2.4477C5.94929 2.32112 6.12098 2.25 6.3 2.25H11.7C11.879 2.25 12.0507 2.32112 12.1773 2.4477C12.3039 2.57429 12.375 2.74598 12.375 2.925V4.95ZM13.05 6.3H4.95V14.4H13.05V6.3ZM6.975 8.325H8.325V12.375H6.975V8.325ZM9.675 8.325H11.025V12.375H9.675V8.325ZM6.975 3.6V4.95H11.025V3.6H6.975Z"
                        fill="currentColor"
                        className="text-muted-foreground"
                      />
                    </svg>
                  )}
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mb-2"></div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-8 gap-0.5 rounded-lg border-input p-1.5 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M9.25 9.25V4.75H10.75V9.25H15.25V10.75H10.75V15.25H9.25V10.75H4.75V9.25H9.25Z"
                fill="currentColor"
                className="text-muted-foreground"
              />
            </svg>
            <div className="px-1 text-sm font-medium leading-normal">Agregar</div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="flex flex-col items-start gap-1 rounded-lg bg-white p-2">
          <DropdownMenuItem
            className="flex w-full cursor-pointer items-center justify-between"
            onClick={() => handleAddFunction('end_call')}
          >
            <div className="flex flex-row items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M14.6466 12.2197C14.6466 12.4597 14.5933 12.7063 14.4799 12.9463C14.3666 13.1863 14.2199 13.413 14.0266 13.6263C13.6999 13.9863 13.3399 14.2463 12.9333 14.413C12.5333 14.5797 12.0999 14.6663 11.6333 14.6663C10.9533 14.6663 10.2266 14.5063 9.45992 14.1797C8.69325 13.853 7.92659 13.413 7.16659 12.8597C6.39992 12.2997 5.67325 11.6797 4.97992 10.993C4.29325 10.2997 3.67325 9.57301 3.11992 8.81301C2.57325 8.05301 2.13325 7.29301 1.81325 6.53967C1.49325 5.77967 1.33325 5.05301 1.33325 4.35967C1.33325 3.90634 1.41325 3.47301 1.57325 3.07301C1.73325 2.66634 1.98659 2.29301 2.33992 1.95967C2.76659 1.53967 3.23325 1.33301 3.72659 1.33301C3.91325 1.33301 4.09992 1.37301 4.26659 1.45301C4.43992 1.53301 4.59325 1.65301 4.71325 1.82634L6.25992 4.00634C6.37992 4.17301 6.46659 4.32634 6.52659 4.47301C6.58659 4.61301 6.61992 4.75301 6.61992 4.87967C6.61992 5.03967 6.57325 5.19967 6.47992 5.35301C6.39325 5.50634 6.26659 5.66634 6.10659 5.82634L5.59992 6.35301C5.52659 6.42634 5.49325 6.51301 5.49325 6.61967C5.49325 6.67301 5.49992 6.71967 5.51325 6.77301C5.53325 6.82634 5.55325 6.86634 5.56659 6.90634C5.68659 7.12634 5.89325 7.41301 6.18659 7.75967C6.48659 8.10634 6.80659 8.45967 7.15325 8.81301C7.51325 9.16634 7.85992 9.49301 8.21325 9.79301C8.55992 10.0863 8.84659 10.2863 9.07325 10.4063C9.10659 10.4197 9.14659 10.4397 9.19325 10.4597C9.24659 10.4797 9.29992 10.4863 9.35992 10.4863C9.47325 10.4863 9.55992 10.4463 9.63325 10.373L10.1399 9.87301C10.3066 9.70634 10.4666 9.57967 10.6199 9.49967C10.7733 9.40634 10.9266 9.35967 11.0933 9.35967C11.2199 9.35967 11.3533 9.38634 11.4999 9.44634C11.6466 9.50634 11.7999 9.59301 11.9666 9.70634L14.1733 11.273C14.3466 11.393 14.4666 11.533 14.5399 11.6997C14.6066 11.8663 14.6466 12.033 14.6466 12.2197Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                />
                <path
                  d="M10.8198 5.17934L13.1798 2.81934"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.1798 5.17934L10.8198 2.81934"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-sm font-normal leading-tight">Finalizar Llamada</div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex w-full cursor-pointer items-center justify-between"
            onClick={() => handleAddFunction('transfer_call')}
          >
            <div className="flex flex-row items-center gap-2">
              <TransferCall />
              <div className="text-sm font-normal leading-tight">Transferir Llamada</div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex w-full cursor-pointer items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M14.6466 12.2197C14.6466 12.4597 14.5933 12.7063 14.4799 12.9463C14.3666 13.1863 14.2199 13.413 14.0266 13.6263C13.6999 13.9863 13.3399 14.2463 12.9333 14.413C12.5333 14.5797 12.0999 14.6663 11.6333 14.6663C10.9533 14.6663 10.2266 14.5063 9.45992 14.1797C8.69325 13.853 7.92659 13.413 7.16659 12.8597C6.39992 12.2997 5.67325 11.6797 4.97992 10.993C4.29325 10.2997 3.67325 9.57301 3.11992 8.81301C2.57325 8.05301 2.13325 7.29301 1.81325 6.53967C1.49325 5.77967 1.33325 5.05301 1.33325 4.35967C1.33325 3.90634 1.41325 3.47301 1.57325 3.07301C1.73325 2.66634 1.98659 2.29301 2.33992 1.95967C2.76659 1.53967 3.23325 1.33301 3.72659 1.33301C3.91325 1.33301 4.09992 1.37301 4.26659 1.45301C4.43992 1.53301 4.59325 1.65301 4.71325 1.82634L6.25992 4.00634C6.37992 4.17301 6.46659 4.32634 6.52659 4.47301C6.58659 4.61301 6.61992 4.75301 6.61992 4.87967C6.61992 5.03967 6.57325 5.19967 6.47992 5.35301C6.39325 5.50634 6.26659 5.66634 6.10659 5.82634L5.59992 6.35301C5.52659 6.42634 5.49325 6.51301 5.49325 6.61967C5.49325 6.67301 5.49992 6.71967 5.51325 6.77301C5.53325 6.82634 5.55325 6.86634 5.56659 6.90634C5.68659 7.12634 5.89325 7.41301 6.18659 7.75967C6.48659 8.10634 6.80659 8.45967 7.15325 8.81301C7.51325 9.16634 7.85992 9.49301 8.21325 9.79301C8.55992 10.0863 8.84659 10.2863 9.07325 10.4063C9.10659 10.4197 9.14659 10.4397 9.19325 10.4597C9.24659 10.4797 9.29992 10.4863 9.35992 10.4863C9.47325 10.4863 9.55992 10.4463 9.63325 10.373L10.1399 9.87301C10.3066 9.70634 10.4666 9.57967 10.6199 9.49967C10.7733 9.40634 10.9266 9.35967 11.0933 9.35967C11.2199 9.35967 11.3533 9.38634 11.4999 9.44634C11.6466 9.50634 11.7999 9.59301 11.9666 9.70634L14.1733 11.273C14.3466 11.393 14.4666 11.533 14.5399 11.6997C14.6066 11.8663 14.6466 12.033 14.6466 12.2197Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                />
                <path
                  d="M13.3333 2.66602H10.1333M13.3333 2.66602V5.86602V2.66602Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-sm font-normal leading-tight">Transferencia de Llamada</div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex w-full cursor-pointer items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1912_9396)">
                  <path
                    d="M19.2155 16.123C19.6466 16.123 20.0009 16.4489 20 16.8316C19.9988 17.2144 19.6468 17.5412 19.2155 17.5412H16.4714V18.5341C16.4714 18.5996 16.4507 18.6638 16.4128 18.7196C16.3749 18.7754 16.3211 18.8213 16.2565 18.8509C16.1919 18.8805 16.1193 18.8931 16.0471 18.8878C15.975 18.8825 15.9058 18.8591 15.8474 18.8205L13.8574 17.5011C13.6829 17.4456 13.5357 17.336 13.4418 17.1918C13.3479 17.0475 13.313 16.8773 13.3442 16.7122C13.3754 16.5473 13.4707 16.398 13.6122 16.2901C13.7538 16.1822 13.9337 16.1229 14.1189 16.123H19.2155ZM10 0.416656C10.6903 0.416656 11.25 0.976298 11.25 1.66666C11.25 2.03686 11.0891 2.36985 10.8333 2.59873V4.16666H15C16.3807 4.16666 17.5 5.28595 17.5 6.66666V11.1111H15.8333V6.66666C15.8333 6.20642 15.4602 5.83332 15 5.83332H5C4.53977 5.83332 4.16667 6.20642 4.16667 6.66666V15C4.16667 15.4602 4.53977 15.8333 5 15.8333H12.2222V17.5H5C3.61929 17.5 2.5 16.3807 2.5 15V6.66666C2.5 5.28595 3.61929 4.16666 5 4.16666H9.16667V2.59873C8.91092 2.36985 8.75 2.03686 8.75 1.66666C8.75 0.976298 9.30967 0.416656 10 0.416656ZM17.2548 12.2222C17.3381 12.2222 17.4198 12.2461 17.487 12.2906L19.6072 13.6979L19.5931 13.7283C19.7456 13.804 19.8657 13.9236 19.9349 14.0679C20.004 14.2123 20.0182 14.3734 19.975 14.5258C19.9318 14.6783 19.8337 14.8134 19.6962 14.9099C19.5587 15.0064 19.3895 15.0586 19.2155 15.0586H14.1189C13.6485 15.0586 13.3345 14.7046 13.3344 14.35C13.3344 13.9206 13.7268 13.6404 14.1189 13.6404H16.8631V12.577C16.8631 12.5305 16.8738 12.4844 16.8934 12.4414C16.9131 12.3984 16.9417 12.3593 16.9781 12.3264C17.0144 12.2935 17.0575 12.2672 17.105 12.2493C17.1525 12.2316 17.2034 12.2223 17.2548 12.2222ZM1.66667 13.3333H0V8.33332H1.66667V13.3333ZM7.5 9.58332C8.19036 9.58332 8.75 10.143 8.75 10.8333C8.75 11.5237 8.19036 12.0833 7.5 12.0833C6.80964 12.0833 6.25 11.5237 6.25 10.8333C6.25 10.143 6.80964 9.58332 7.5 9.58332ZM12.5 9.58332C13.1903 9.58332 13.75 10.143 13.75 10.8333C13.75 11.5237 13.1903 12.0833 12.5 12.0833C11.8097 12.0833 11.25 11.5237 11.25 10.8333C11.25 10.143 11.8097 9.58332 12.5 9.58332ZM20 11.1111H18.3333V8.33332H20V11.1111Z"
                    fill="currentColor"
                  />
                </g>
              </svg>
              <div className="text-sm font-normal leading-tight">Transferencia de Agente</div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex w-full cursor-pointer items-center justify-between"
            onClick={() => handleAddFunction('check_availability_cal')}
          >
            <div className="flex flex-row items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M5.33337 1.33398V3.33398"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.6666 1.33398V3.33398"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.1333 14.2667C13.3115 14.2667 14.2667 13.3115 14.2667 12.1333C14.2667 10.9551 13.3115 10 12.1333 10C10.9551 10 10 10.9551 10 12.1333C10 13.3115 10.9551 14.2667 12.1333 14.2667Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14.6667 14.6667L14 14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.33337 6.06055H13.6667"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.91333 14.6673H5.33333C3 14.6673 2 13.334 2 11.334V5.66732C2 3.66732 3 2.33398 5.33333 2.33398H10.6667C13 2.33398 14 3.66732 14 5.66732V8.66732"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.99703 9.13411H8.00302"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.5295 9.13411H5.53549"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.5295 11.1341H5.53549"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-sm font-normal leading-tight">Verificar Disponibilidad del Calendario (Cal.com)</div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex w-full cursor-pointer items-center justify-between"
            onClick={() => handleAddFunction('book_appointment_cal')}
          >
            <div className="flex flex-row items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M5.33337 1.33398V3.33398"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.6666 1.33398V3.33398"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.6667 2.33398C12.8867 2.45398 14 3.30065 14 6.43398V10.554C14 13.3007 13.3333 14.674 10 14.674H6C2.66667 14.674 2 13.3007 2 10.554V6.43398C2 3.30065 3.11333 2.46065 5.33333 2.33398H10.6667Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.8333 11.7324H2.16663"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.00004 5.5C7.18004 5.5 6.48671 5.94667 6.48671 6.81333C6.48671 7.22667 6.68004 7.54 6.97337 7.74C6.56671 7.98 6.33337 8.36667 6.33337 8.82C6.33337 9.64667 6.96671 10.16 8.00004 10.16C9.02671 10.16 9.66671 9.64667 9.66671 8.82C9.66671 8.36667 9.43337 7.97333 9.02004 7.74C9.32004 7.53333 9.50671 7.22667 9.50671 6.81333C9.50671 5.94667 8.82004 5.5 8.00004 5.5ZM8.00004 7.39333C7.65337 7.39333 7.40004 7.18667 7.40004 6.86C7.40004 6.52667 7.65337 6.33333 8.00004 6.33333C8.34671 6.33333 8.60004 6.52667 8.60004 6.86C8.60004 7.18667 8.34671 7.39333 8.00004 7.39333ZM8.00004 9.33333C7.56004 9.33333 7.24004 9.11333 7.24004 8.71333C7.24004 8.31333 7.56004 8.1 8.00004 8.1C8.44004 8.1 8.76004 8.32 8.76004 8.71333C8.76004 9.11333 8.44004 9.33333 8.00004 9.33333Z"
                  fill="currentColor"
                />
              </svg>
              <div className="text-sm font-normal leading-tight">Reservar en el Calendario (Cal.com)</div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex w-full cursor-pointer items-center justify-between"
            onClick={() => handleAddFunction('press_digit')}
          >
            <div className="flex flex-row items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M9.5 3C9.5 3.82843 8.82843 4.5 8 4.5C7.17157 4.5 6.5 3.82843 6.5 3C6.5 2.17157 7.17157 1.5 8 1.5C8.82843 1.5 9.5 2.17157 9.5 3Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.5 8C9.5 8.82843 8.82843 9.5 8 9.5C7.17157 9.5 6.5 8.82843 6.5 8C6.5 7.17157 7.17157 6.5 8 6.5C8.82843 6.5 9.5 7.17157 9.5 8Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.5 13C9.5 13.8284 8.82843 14.5 8 14.5C7.17157 14.5 6.5 13.8284 6.5 13C6.5 12.1716 7.17157 11.5 8 11.5C8.82843 11.5 9.5 12.1716 9.5 13Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.5 3C4.5 3.82843 3.82843 4.5 3 4.5C2.17157 4.5 1.5 3.82843 1.5 3C1.5 2.17157 2.17157 1.5 3 1.5C3.82843 1.5 4.5 2.17157 4.5 3Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.5 8C4.5 8.82843 3.82843 9.5 3 9.5C2.17157 9.5 1.5 8.82843 1.5 8C1.5 7.17157 2.17157 6.5 3 6.5C3.82843 6.5 4.5 7.17157 4.5 8Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.5 13C4.5 13.8284 3.82843 14.5 3 14.5C2.17157 14.5 1.5 13.8284 1.5 13C1.5 12.1716 2.17157 11.5 3 11.5C3.82843 11.5 4.5 12.1716 4.5 13Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14.5 3C14.5 3.82843 13.8284 4.5 13 4.5C12.1716 4.5 11.5 3.82843 11.5 3C11.5 2.17157 12.1716 1.5 13 1.5C13.8284 1.5 14.5 2.17157 14.5 3Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14.5 8C14.5 8.82843 13.8284 9.5 13 9.5C12.1716 9.5 11.5 8.82843 11.5 8C11.5 7.17157 12.1716 6.5 13 6.5C13.8284 6.5 14.5 7.17157 14.5 8Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14.5 13C14.5 13.8284 13.8284 14.5 13 14.5C12.1716 14.5 11.5 13.8284 11.5 13C11.5 12.1716 12.1716 11.5 13 11.5C13.8284 11.5 14.5 12.1716 14.5 13Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-sm font-normal leading-tight">Presionar Dígito (Navegación IVR)</div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex w-full cursor-pointer items-center justify-between"
            onClick={() => handleAddFunction('send_sms')}
          >
            <div className="flex flex-row items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M2.16656 10.0022V10.0003C2.16656 7.9228 2.99185 5.93036 4.46089 4.46132C5.18828 3.73393 6.05182 3.15693 7.0022 2.76327C7.95259 2.36961 8.9712 2.16699 9.99989 2.16699C12.0774 2.16699 14.0699 2.99229 15.5389 4.46132C17.0079 5.93036 17.8332 7.9228 17.8332 10.0003C17.8332 12.0779 17.0079 14.0703 15.5389 15.5393C14.0699 17.0084 12.0774 17.8337 9.99989 17.8337H2.49989H2.48937L2.47886 17.8341C2.41286 17.8369 2.34752 17.82 2.29114 17.7856C2.23721 17.7526 2.1938 17.7051 2.1659 17.6485C2.14303 17.59 2.13717 17.5261 2.14909 17.4642C2.16146 17.4 2.19246 17.3408 2.2382 17.2941C2.23851 17.2938 2.23882 17.2935 2.23913 17.2932L3.90344 15.6289L4.22466 15.3077L3.93563 14.9572C2.78557 13.5627 2.15971 11.8098 2.16656 10.0022ZM9.99989 17.167H10.0003C11.6583 17.1657 13.2645 16.5896 14.5453 15.5368C15.8262 14.484 16.7024 13.0197 17.0246 11.3934C17.3469 9.767 17.0953 8.07922 16.3127 6.61756C15.5301 5.1559 14.265 4.0108 12.7328 3.37735C11.2006 2.7439 9.49614 2.66129 7.90987 3.14359C6.32359 3.6259 4.95361 4.64328 4.03334 6.0224C3.11306 7.40152 2.69943 9.05706 2.8629 10.707C3.02638 12.3568 3.75685 13.899 4.92986 15.0707L4.92985 15.0708L4.93327 15.0741C4.99498 15.1346 5.03076 15.2166 5.03317 15.3028C5.03241 15.3454 5.02351 15.3874 5.00694 15.4266C4.98978 15.4672 4.96472 15.504 4.93323 15.5349L4.93321 15.5349L4.92967 15.5384L4.15467 16.3134L3.30111 17.167H4.50822H9.99989ZM6.48137 9.72317C6.53618 9.68654 6.60063 9.66699 6.66655 9.66699C6.75496 9.66699 6.83975 9.70211 6.90226 9.76462C6.96477 9.82714 6.99989 9.91192 6.99989 10.0003C6.99989 10.0663 6.98034 10.1307 6.94371 10.1855C6.90708 10.2403 6.85503 10.2831 6.79412 10.3083C6.73321 10.3335 6.66618 10.3401 6.60153 10.3273C6.53687 10.3144 6.47747 10.2826 6.43085 10.236C6.38423 10.1894 6.35249 10.13 6.33963 10.0654C6.32676 10.0007 6.33337 9.93367 6.35859 9.87276C6.38382 9.81186 6.42655 9.7598 6.48137 9.72317ZM9.8147 9.72317C9.86951 9.68654 9.93396 9.66699 9.99989 9.66699C10.0883 9.66699 10.1731 9.70211 10.2356 9.76462C10.2981 9.82714 10.3332 9.91192 10.3332 10.0003C10.3332 10.0663 10.3137 10.1307 10.277 10.1855C10.2404 10.2403 10.1884 10.2831 10.1275 10.3083C10.0665 10.3335 9.99952 10.3401 9.93486 10.3273C9.8702 10.3144 9.8108 10.2826 9.76419 10.236C9.71757 10.1894 9.68582 10.13 9.67296 10.0654C9.6601 10.0007 9.6667 9.93367 9.69193 9.87276C9.71716 9.81186 9.75988 9.7598 9.8147 9.72317ZM13.148 9.72317C13.2028 9.68654 13.2673 9.66699 13.3332 9.66699C13.4216 9.66699 13.5064 9.70211 13.5689 9.76462C13.6314 9.82714 13.6666 9.91192 13.6666 10.0003C13.6666 10.0663 13.647 10.1307 13.6104 10.1855L14.0261 10.4633L13.6104 10.1855C13.5738 10.2403 13.5217 10.2831 13.4608 10.3083C13.3999 10.3335 13.3329 10.3401 13.2682 10.3273C13.2035 10.3144 13.1441 10.2826 13.0975 10.236C13.0509 10.1894 13.0192 10.13 13.0063 10.0654C12.9934 10.0007 13 9.93367 13.0253 9.87276C13.0505 9.81186 13.0932 9.7598 13.148 9.72317Z"
                  fill="white"
                  stroke="currentColor"
                />
              </svg>
              <div className="text-sm font-normal leading-tight">Enviar SMS</div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex w-full cursor-pointer items-center justify-between"
            onClick={() => handleAddFunction('extract_dynamic_variable')}
          >
            <div className="flex flex-row items-center gap-2">
              <IconCode />
              <div className="text-sm font-normal leading-tight">Extraer Variable Dinámica</div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-stroke-soft-200 -mx-1 my-0 h-px w-full" />

          <DropdownMenuItem
            className="flex w-full cursor-pointer items-center justify-between"
            onClick={() => handleAddFunction('custom')}
          >
            <div className="flex flex-row items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4.33337 14.6667V10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.33337 3.33398V1.33398"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.6666 14.666V12.666"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.6666 6.00065V1.33398"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.33337 4.66732V8.66732C6.33337 9.40065 6.00004 10.0007 5.00004 10.0007H3.66671C2.66671 10.0007 2.33337 9.40065 2.33337 8.66732V4.66732C2.33337 3.93398 2.66671 3.33398 3.66671 3.33398H5.00004C6.00004 3.33398 6.33337 3.93398 6.33337 4.66732Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.6666 7.33333V11.3333C13.6666 12.0667 13.3333 12.6667 12.3333 12.6667H11C9.99996 12.6667 9.66663 12.0667 9.66663 11.3333V7.33333C9.66663 6.6 9.99996 6 11 6H12.3333C13.3333 6 13.6666 6.6 13.6666 7.33333Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-sm font-normal leading-tight">Función Personalizada</div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-[840px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {functionType === 'check_availability_cal' ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M5.33337 1.33398V3.33398"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.6666 1.33398V3.33398"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12.1333 14.2667C13.3115 14.2667 14.2667 13.3115 14.2667 12.1333C14.2667 10.9551 13.3115 10 12.1333 10C10.9551 10 10 10.9551 10 12.1333C10 13.3115 10.9551 14.2667 12.1333 14.2667Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14.6667 14.6667L14 14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2.33337 6.06055H13.6667"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.91333 14.6673H5.33333C3 14.6673 2 13.334 2 11.334V5.66732C2 3.66732 3 2.33398 5.33333 2.33398H10.6667C13 2.33398 14 3.66732 14 5.66732V8.66732"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7.99703 9.13411H8.00302"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5.5295 9.13411H5.53549"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5.5295 11.1341H5.53549"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Verificar Disponibilidad del Calendario (Cal.com)
                </>
              ) : functionType === 'book_appointment_cal' ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M5.33337 1.33398V3.33398"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.6666 1.33398V3.33398"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.6667 2.33398C12.8867 2.45398 14 3.30065 14 6.43398V10.554C14 13.3007 13.3333 14.674 10 14.674H6C2.66667 14.674 2 13.3007 2 10.554V6.43398C2 3.30065 3.11333 2.46065 5.33333 2.33398H10.6667Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13.8333 11.7324H2.16663"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.00004 5.5C7.18004 5.5 6.48671 5.94667 6.48671 6.81333C6.48671 7.22667 6.68004 7.54 6.97337 7.74C6.56671 7.98 6.33337 8.36667 6.33337 8.82C6.33337 9.64667 6.96671 10.16 8.00004 10.16C9.02671 10.16 9.66671 9.64667 9.66671 8.82C9.66671 8.36667 9.43337 7.97333 9.02004 7.74C9.32004 7.53333 9.50671 7.22667 9.50671 6.81333C9.50671 5.94667 8.82004 5.5 8.00004 5.5ZM8.00004 7.39333C7.65337 7.39333 7.40004 7.18667 7.40004 6.86C7.40004 6.52667 7.65337 6.33333 8.00004 6.33333C8.34671 6.33333 8.60004 6.52667 8.60004 6.86C8.60004 7.18667 8.34671 7.39333 8.00004 7.39333ZM8.00004 9.33333C7.56004 9.33333 7.24004 9.11333 7.24004 8.71333C7.24004 8.31333 7.56004 8.1 8.00004 8.1C8.44004 8.1 8.76004 8.32 8.76004 8.71333C8.76004 9.11333 8.44004 9.33333 8.00004 9.33333Z"
                      fill="currentColor"
                    />
                  </svg>
                  Reservar en el Calendario (Cal.com)
                </>
              ) : functionType === 'send_sms' ? (
                <>
                  <SendSMS />
                  Enviar SMS
                </>
              ) : functionType === 'press_digit' ? (
                <>
                  <PressDigit />
                  Presionar Dígito (Navegación IVR)
                </>
              ) : functionType === 'transfer_call' ? (
                <>
                  <TransferCall />
                  Transferir Llamada
                </>
              ) : functionType === 'extract_dynamic_variable' ? (
                <>
                  <IconCode />
                  Extraer Variable Dinámica
                </>
              ) : functionType === 'custom' ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4.33337 14.6667V10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4.33337 3.33398V1.33398"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11.6666 14.666V12.666"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11.6666 6.00065V1.33398"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6.33337 4.66732V8.66732C6.33337 9.40065 6.00004 10.0007 5.00004 10.0007H3.66671C2.66671 10.0007 2.33337 9.40065 2.33337 8.66732V4.66732C2.33337 3.93398 2.66671 3.33398 3.66671 3.33398H5.00004C6.00004 3.33398 6.33337 3.93398 6.33337 4.66732Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13.6666 7.33333V11.3333C13.6666 12.0667 13.3333 12.6667 12.3333 12.6667H11C9.99996 12.6667 9.66663 12.0667 9.66663 11.3333V7.33333C9.66663 6.6 9.99996 6 11 6H12.3333C13.3333 6 13.6666 6.6 13.6666 7.33333Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Función Personalizada
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M14.6466 12.2197C14.6466 12.4597 14.5933 12.7063 14.4799 12.9463C14.3666 13.1863 14.2199 13.413 14.0266 13.6263C13.6999 13.9863 13.3399 14.2463 12.9333 14.413C12.5333 14.5797 12.0999 14.6663 11.6333 14.6663C10.9533 14.6663 10.2266 14.5063 9.45992 14.1797C8.69325 13.853 7.92659 13.413 7.16659 12.8597C6.39992 12.2997 5.67325 11.6797 4.97992 10.993C4.29325 10.2997 3.67325 9.57301 3.11992 8.81301C2.57325 8.05301 2.13325 7.29301 1.81325 6.53967C1.49325 5.77967 1.33325 5.05301 1.33325 4.35967C1.33325 3.90634 1.41325 3.47301 1.57325 3.07301C1.73325 2.66634 1.98659 2.29301 2.33992 1.95967C2.76659 1.53967 3.23325 1.33301 3.72659 1.33301C3.91325 1.33301 4.09992 1.37301 4.26659 1.45301C4.43992 1.53301 4.59325 1.65301 4.71325 1.82634L6.25992 4.00634C6.37992 4.17301 6.46659 4.32634 6.52659 4.47301C6.58659 4.61301 6.61992 4.75301 6.61992 4.87967C6.61992 5.03967 6.57325 5.19967 6.47992 5.35301C6.39325 5.50634 6.26659 5.66634 6.10659 5.82634L5.59992 6.35301C5.52659 6.42634 5.49325 6.51301 5.49325 6.61967C5.49325 6.67301 5.49992 6.71967 5.51325 6.77301C5.53325 6.82634 5.55325 6.86634 5.56659 6.90634C5.68659 7.12634 5.89325 7.41301 6.18659 7.75967C6.48659 8.10634 6.80659 8.45967 7.15325 8.81301C7.51325 9.16634 7.85992 9.49301 8.21325 9.79301C8.55992 10.0863 8.84659 10.2863 9.07325 10.4063C9.10659 10.4197 9.14659 10.4397 9.19325 10.4597C9.24659 10.4797 9.29992 10.4863 9.35992 10.4863C9.47325 10.4863 9.55992 10.4463 9.63325 10.373L10.1399 9.87301C10.3066 9.70634 10.4666 9.57967 10.6199 9.49967C10.7733 9.40634 10.9266 9.35967 11.0933 9.35967C11.2199 9.35967 11.3533 9.38634 11.4999 9.44634C11.6466 9.50634 11.7999 9.59301 11.9666 9.70634L14.1733 11.273C14.3466 11.393 14.4666 11.533 14.5399 11.6997C14.6066 11.8663 14.6466 12.033 14.6466 12.2197Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                    />
                    <path
                      d="M10.8198 5.17934L13.1798 2.81934"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13.1798 5.17934L10.8198 2.81934"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {editingFunction ? 'Editar Función' : 'Finalizar Llamada'}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
                placeholder="Ingresa el nombre de la función"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">
                Descripción <span className="text-muted-foreground">(Opcional)</span>
              </Label>
              <Input
                id="description"
                value={functionDescription}
                onChange={(e) => setFunctionDescription(e.target.value)}
                placeholder="Ingresa la descripción de la función"
              />
            </div>

            {(functionType === 'check_availability_cal' || functionType === 'book_appointment_cal') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="calApiKey">API Key (Cal.com)</Label>
                  <Input
                    id="calApiKey"
                    value={calApiKey}
                    onChange={(e) => setCalApiKey(e.target.value)}
                    placeholder="Ingresa la API key de Cal.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventTypeId">Event Type ID (Cal.com)</Label>
                  <div className="mb-2 text-xs text-muted-foreground">
                    Puedes encontrar el Event Type ID en tu URL de cal.com.
                  </div>
                  <Input
                    id="eventTypeId"
                    type="number"
                    value={eventTypeId}
                    onChange={(e) => setEventTypeId(e.target.value)}
                    placeholder="Ingresa el Event Type ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">
                    Timezone <span className="text-muted-foreground">(Opcional)</span>
                  </Label>
                  <Input
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="Ingresa la zona horaria"
                  />
                </div>
              </>
            )}

            {functionType === 'send_sms' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="smsContent">SMS content</Label>
                  <Tabs value={smsContentType} onValueChange={setSmsContentType} className="w-full">
                    <TabsList className="grid h-8 w-full grid-cols-2">
                      <TabsTrigger value="inferred" className="text-xs">
                        Prompt
                      </TabsTrigger>
                      <TabsTrigger value="predefined" className="text-xs">
                        Static Sentence
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="inferred" className="mt-2">
                      <Textarea
                        value={smsContent}
                        onChange={(e) => setSmsContent(e.target.value)}
                        placeholder="e.g. Inform the user that their appointment has been booked"
                        className="min-h-[80px]"
                      />
                    </TabsContent>
                    <TabsContent value="predefined" className="mt-2">
                      <Textarea
                        value={smsContent}
                        onChange={(e) => setSmsContent(e.target.value)}
                        placeholder="Enter static text message"
                        className="min-h-[80px]"
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}

            {functionType === 'press_digit' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="delayMs">
                    Retraso de Detección de Pausa <span className="text-muted-foreground">(Opcional)</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="delayMs"
                      type="number"
                      value={delayMs}
                      onChange={(e) => setDelayMs(e.target.value)}
                      placeholder=""
                      className="flex-1"
                    />
                    <div className="text-sm text-muted-foreground">milisegundos</div>
                  </div>
                </div>
              </>
            )}

            {functionType === 'transfer_call' && (
              <>
                <div className="space-y-2">
                  <Label>Transferir a</Label>
                  <Tabs value={transferDestinationType} onValueChange={setTransferDestinationType} className="w-full">
                    <TabsList className="grid h-8 w-full grid-cols-2">
                      <TabsTrigger value="predefined" className="text-xs">
                        Destino Estático
                      </TabsTrigger>
                      <TabsTrigger value="dynamic" className="text-xs">
                        Enrutamiento Dinámico
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="predefined" className="mt-2">
                      <Input
                        value={transferNumber}
                        onChange={(e) => setTransferNumber(e.target.value)}
                        placeholder="+14001231234"
                      />
                      <div className="mt-1 text-xs text-muted-foreground">
                        Ingresa un número de teléfono estático / SIP URI / variable dinámica.
                      </div>
                    </TabsContent>
                    <TabsContent value="dynamic" className="mt-2">
                      <Input
                        value={transferNumber}
                        onChange={(e) => setTransferNumber(e.target.value)}
                        placeholder="Variable dinámica"
                      />
                    </TabsContent>
                  </Tabs>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="ignoreE164"
                        checked={!ignoreE164Validation}
                        onCheckedChange={(checked) => setIgnoreE164Validation(!checked)}
                      />
                      <Label htmlFor="ignoreE164" className="cursor-pointer text-sm">
                        Formatear a E.164
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="extensionNumber"
                        checked={extensionNumber}
                        onCheckedChange={(checked) => setExtensionNumber(checked as boolean)}
                      />
                      <Label htmlFor="extensionNumber" className="cursor-pointer text-sm">
                        Número de Extensión
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <RadioGroup value={transferType} onValueChange={setTransferType}>
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <Label htmlFor="cold_transfer" className="cursor-pointer text-xs">
                        Transferencia en Frío
                      </Label>
                      <RadioGroupItem value="cold_transfer" id="cold_transfer" />
                    </div>
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <Label htmlFor="warm_transfer" className="cursor-pointer text-xs">
                        Transferencia en Caliente
                      </Label>
                      <RadioGroupItem value="warm_transfer" id="warm_transfer" />
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>ID de Llamada Mostrado</Label>
                  <RadioGroup value={callerIdType} onValueChange={setCallerIdType}>
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <Label htmlFor="retell" className="cursor-pointer text-xs">
                        Número del Agente Retell
                      </Label>
                      <RadioGroupItem value="retell" id="retell" />
                    </div>
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <Label htmlFor="transferee" className="cursor-pointer text-xs">
                        Número del Usuario
                      </Label>
                      <RadioGroupItem value="transferee" id="transferee" />
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <div>
                    <Label>Encabezados SIP Personalizados</Label>
                    <div className="text-xs text-muted-foreground">
                      Agregar pares clave/valor para enrutamiento de llamadas, metadatos o integración de operador.
                    </div>
                  </div>
                  <div className="space-y-2">
                    {customSipHeaders.map((header, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={header.key}
                          onChange={(e) => {
                            const newHeaders = [...customSipHeaders];
                            newHeaders[index].key = e.target.value;
                            setCustomSipHeaders(newHeaders);
                          }}
                          placeholder="X-Custom-Header-Name"
                          className="flex-1"
                        />
                        <Input
                          value={header.value}
                          onChange={(e) => {
                            const newHeaders = [...customSipHeaders];
                            newHeaders[index].value = e.target.value;
                            setCustomSipHeaders(newHeaders);
                          }}
                          placeholder="Valor"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newHeaders = customSipHeaders.filter((_, i) => i !== index);
                            setCustomSipHeaders(newHeaders);
                          }}
                        >
                          <IconDeleteSmall />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomSipHeaders([...customSipHeaders, { key: '', value: '' }])}
                      className="gap-2"
                    >
                      <IconPlus />
                      Agregar
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-normal">Configuración de comportamiento de transferencia</Label>
                  <div className="space-y-4 rounded-md border p-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Música en Espera</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            <span className="text-sm">{onHoldMusic === 'ringtone' ? 'Tono de Llamada' : 'Música'}</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                            >
                              <path
                                d="M9.99956 10.879L13.7121 7.1665L14.7726 8.227L9.99956 13L5.22656 8.227L6.28706 7.1665L9.99956 10.879Z"
                                fill="currentColor"
                              />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          <DropdownMenuItem onClick={() => setOnHoldMusic('ringtone')}>
                            Tono de Llamada
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setOnHoldMusic('music')}>Música</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Navegar IVR</Label>
                        <Switch checked={navigateIvr} onCheckedChange={setNavigateIvr} />
                      </div>
                      {navigateIvr && (
                        <Textarea
                          value={ivrPrompt}
                          onChange={(e) => setIvrPrompt(e.target.value)}
                          placeholder="Ingrese el prompt, ej. Navegar al agente humano del departamento de ventas"
                          className="min-h-[80px]"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-medium">Detección Humana</Label>
                        <div className="text-xs text-muted-foreground">
                          Cuando esté habilitado, la IA solo hará la transición si se detecta un humano real. No
                          transferirá si detecta un buzón de voz o respuesta no humana.
                        </div>
                      </div>
                      <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-xs">Tiempo de Espera de Detección</Label>
                          <span className="min-w-[30px] text-right text-xs text-muted-foreground">
                            {Math.round(detectionTimeoutMs / 1000)}s
                          </span>
                        </div>
                        <Slider
                          value={[detectionTimeoutMs]}
                          onValueChange={(value) => setDetectionTimeoutMs(value[0])}
                          min={10000}
                          max={300000}
                          step={1000}
                          className="w-full"
                        />
                        <div className="flex items-start gap-2">
                          <Checkbox
                            id="optOutInitialMessage"
                            checked={!optOutInitialMessage}
                            onCheckedChange={(checked) => setOptOutInitialMessage(!checked)}
                          />
                          <Label htmlFor="optOutInitialMessage" className="cursor-pointer text-xs font-normal">
                            La IA saludará automáticamente con &quot;Hola&quot; al inicio para alentar una respuesta.
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">Mensaje Susurrado</Label>
                          <Switch checked={whisperMessage} onCheckedChange={setWhisperMessage} />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Si está marcado: solo se habla al agente de transferencia
                        </div>
                      </div>
                      {whisperMessage && (
                        <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                          <Label className="text-xs font-medium">Mensaje de Traspaso</Label>
                          <Tabs value={whisperHandoffType} onValueChange={setWhisperHandoffType}>
                            <TabsList className="grid h-8 w-full grid-cols-2">
                              <TabsTrigger value="prompt" className="text-xs">
                                Prompt
                              </TabsTrigger>
                              <TabsTrigger value="static_message" className="text-xs">
                                Frase Estática
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="prompt" className="mt-2">
                              <Textarea
                                value={whisperHandoffContent}
                                onChange={(e) => setWhisperHandoffContent(e.target.value)}
                                placeholder="Saluda al agente y resúmele el problema del usuario"
                                className="min-h-[80px]"
                              />
                            </TabsContent>
                            <TabsContent value="static_message" className="mt-2">
                              <Textarea
                                value={whisperHandoffContent}
                                onChange={(e) => setWhisperHandoffContent(e.target.value)}
                                placeholder="Ingrese una frase estática"
                                className="min-h-[80px]"
                              />
                            </TabsContent>
                          </Tabs>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">Mensaje de Tres Vías</Label>
                          <Switch checked={threeWayMessage} onCheckedChange={setThreeWayMessage} />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Si está marcado: se habla después de una transferencia exitosa, ambas partes pueden escuchar
                        </div>
                      </div>
                      {threeWayMessage && (
                        <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                          <Label className="text-xs font-medium">Mensaje de Traspaso</Label>
                          <Tabs value={threeWayHandoffType} onValueChange={setThreeWayHandoffType}>
                            <TabsList className="grid h-8 w-full grid-cols-2">
                              <TabsTrigger value="prompt" className="text-xs">
                                Prompt
                              </TabsTrigger>
                              <TabsTrigger value="static_message" className="text-xs">
                                Frase Estática
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="prompt" className="mt-2">
                              <Textarea
                                value={threeWayHandoffContent}
                                onChange={(e) => setThreeWayHandoffContent(e.target.value)}
                                placeholder="Saluda al agente y resúmele el problema del usuario"
                                className="min-h-[80px]"
                              />
                            </TabsContent>
                            <TabsContent value="static_message" className="mt-2">
                              <Textarea
                                value={threeWayHandoffContent}
                                onChange={(e) => setThreeWayHandoffContent(e.target.value)}
                                placeholder="Ingrese una frase estática"
                                className="min-h-[80px]"
                              />
                            </TabsContent>
                          </Tabs>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {functionType === 'custom' && (
              <CustomFunctionForm
                customUrl={customUrl}
                customMethod={customMethod}
                customTimeoutMs={customTimeoutMs}
                customHeaders={customHeaders}
                customQueryParams={customQueryParams}
                customResponseVariables={customResponseVariables}
                speakDuringExecution={speakDuringExecution}
                speakDuringExecutionDescription={speakDuringExecutionDescription}
                speakAfterExecution={speakAfterExecution}
                customParameters={customParameters}
                argsAtRoot={argsAtRoot}
                parameterTab={parameterTab}
                formParameters={formParameters}
                setCustomUrl={setCustomUrl}
                setCustomMethod={setCustomMethod}
                setCustomTimeoutMs={setCustomTimeoutMs}
                setCustomHeaders={setCustomHeaders}
                setCustomQueryParams={setCustomQueryParams}
                setCustomResponseVariables={setCustomResponseVariables}
                setSpeakDuringExecution={setSpeakDuringExecution}
                setSpeakDuringExecutionDescription={setSpeakDuringExecutionDescription}
                setSpeakAfterExecution={setSpeakAfterExecution}
                setCustomParameters={setCustomParameters}
                setArgsAtRoot={setArgsAtRoot}
                setParameterTab={setParameterTab}
                setFormParameters={setFormParameters}
              />
            )}

            {functionType === 'extract_dynamic_variable' && (
              <ExtractVariableForm variables={extractVariables} setVariables={setExtractVariables} />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveFunction}>{editingFunction ? 'Actualizar' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
