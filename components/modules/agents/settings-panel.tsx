// @ts-nocheck
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { apiService } from '@/services';
import { SpeechSettings } from '@/components/modules/agents/speech-settings';
import { FunctionsSettings } from '@/components/modules/agents/functions-settings';
import { KnowledgeSettings } from '@/components/modules/agents/knowledge-settings';
import { WebhookSettings } from '@/components/modules/agents/webhook-settings';
import { PostCallAnalysis } from '@/components/modules/agents/postcall-analysis';
import { TranscriptionSettings } from '@/components/modules/agents/transcription-settings';
import { SecuritySettings } from '@/components/modules/agents/security-settings';
import { McpSettings } from '@/components/modules/agents/mcp-settings';
import { settingsSections } from '@/components/modules/agents/settings-sections-config';

const SLIDER_CONFIGS = {
  endCallSilence: {
    min: 10000,
    max: 1800000,
    step: 1000
  },
  maxCallDuration: {
    min: 60000,
    max: 7200000,
    step: 60000
  },
  ringDuration: {
    min: 5000,
    max: 90000,
    step: 1000
  },
  dtmfTimeout: {
    min: 1000,
    max: 15000,
    step: 100
  }
};

interface SettingsPanelProps {
  agent: Agent;
  llm: Llm;
  llms: Llm[];
  loadingLlms: boolean;
  onLlmUpdate: () => Promise<void>;
  onAgentUpdate: () => Promise<void>;
  knowledgeBases: KnowledgeBase[];
  loadingKnowledgeBases: boolean;
  onKnowledgeBasesUpdate: () => Promise<void>;
}

export function SettingsPanel({
  agent,
  llm,
  llms,
  onLlmUpdate,
  onAgentUpdate,
  knowledgeBases,
  loadingKnowledgeBases,
  loadingLlms,
  onKnowledgeBasesUpdate
}: SettingsPanelProps) {
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [voicemailMessage, setVoicemailMessage] = useState('');
  const [originalVoicemailMessage, setOriginalVoicemailMessage] = useState('');
  const [endCallSilence, setEndCallSilence] = useState([agent.end_call_after_silence_ms || 30000]);
  const [maxCallDuration, setMaxCallDuration] = useState([agent.max_call_duration_ms || 3600000]);
  const [ringDuration, setRingDuration] = useState([agent.ring_duration_ms || 30000]);
  const [dtmfTimeout, setDtmfTimeout] = useState([agent.user_dtmf_options?.timeout_ms || 2500]);
  const [dtmfDigitLimit, setDtmfDigitLimit] = useState(agent.user_dtmf_options?.digit_limit || 8);
  const [dtmfTerminationKey, setDtmfTerminationKey] = useState(agent.user_dtmf_options?.termination_key || '#');
  const [dtmfTerminationKeyEnabled, setDtmfTerminationKeyEnabled] = useState(
    agent.user_dtmf_options?.termination_key !== null && agent.user_dtmf_options?.termination_key !== undefined
  );
  const [dtmfDigitLimitEnabled, setDtmfDigitLimitEnabled] = useState(
    agent.user_dtmf_options?.digit_limit !== null && agent.user_dtmf_options?.digit_limit !== undefined
  );

  const toggleSection = (id: string) => {
    setOpenSections((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const handleEndCallSilenceCommit = async (value: number[]) => {
    try {
      await apiService.updateAgent(agent.agent_id, { end_call_after_silence_ms: value[0] });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating end call silence:', error);
    }
  };

  const handleMaxCallDurationCommit = async (value: number[]) => {
    try {
      await apiService.updateAgent(agent.agent_id, { max_call_duration_ms: value[0] });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating max call duration:', error);
    }
  };

  const handleRingDurationCommit = async (value: number[]) => {
    try {
      await apiService.updateAgent(agent.agent_id, { ring_duration_ms: value[0] });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating ring duration:', error);
    }
  };

  const handleVoicemailDetectionChange = async (checked: boolean) => {
    try {
      const voicemailOption = checked ? { action: { type: 'hangup' as const } } : null;
      await apiService.updateAgent(agent.agent_id, { voicemail_option: voicemailOption });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating voicemail detection:', error);
    }
  };

  const handleVoicemailActionChange = async (value: string) => {
    try {
      if (value === 'hangup') {
        await apiService.updateAgent(agent.agent_id, { voicemail_option: { action: { type: 'hangup' } } });
      } else {
        const text =
          voicemailMessage ||
          'Hey {{user_name}}, sorry we could not reach you directly. Please give us a callback if you can.';
        await apiService.updateAgent(agent.agent_id, { voicemail_option: { action: { type: 'prompt', text } } });
        setVoicemailMessage(text);
        setOriginalVoicemailMessage(text);
      }
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating voicemail action:', error);
    }
  };

  const handleVoicemailTabChange = async (value: string) => {
    try {
      const type = value === 'prompt' ? 'prompt' : 'static_text';
      const text =
        voicemailMessage ||
        'Hey {{user_name}}, sorry we could not reach you directly. Please give us a callback if you can.';
      await apiService.updateAgent(agent.agent_id, {
        voicemail_option: { action: { type, text } }
      });
    } catch (error) {
      console.error('Error updating voicemail tab:', error);
    }
  };

  const handleVoicemailMessageBlur = async () => {
    if (voicemailMessage !== originalVoicemailMessage && voicemailMessage.trim() !== '') {
      try {
        const currentType = agent.voicemail_option?.action?.type === 'static_text' ? 'static_text' : 'prompt';
        await apiService.updateAgent(agent.agent_id, {
          voicemail_option: { action: { type: currentType, text: voicemailMessage } }
        });
        setOriginalVoicemailMessage(voicemailMessage);
        await onAgentUpdate();
      } catch (error) {
        console.error('Error updating voicemail message:', error);
      }
    }
  };

  const handleUserDtmfChange = async (checked: boolean) => {
    try {
      if (checked) {
        await apiService.updateAgent(agent.agent_id, {
          allow_user_dtmf: true,
          user_dtmf_options: {
            timeout_ms: dtmfTimeout[0],
            termination_key: dtmfTerminationKeyEnabled ? dtmfTerminationKey : null,
            digit_limit: dtmfDigitLimitEnabled ? dtmfDigitLimit : null
          }
        });
      } else {
        await apiService.updateAgent(agent.agent_id, { allow_user_dtmf: false });
      }
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating user DTMF setting:', error);
    }
  };

  const handleDtmfTimeoutCommit = async (value: number[]) => {
    try {
      await apiService.updateAgent(agent.agent_id, {
        user_dtmf_options: {
          timeout_ms: value[0],
          termination_key: dtmfTerminationKeyEnabled ? dtmfTerminationKey : null,
          digit_limit: dtmfDigitLimitEnabled ? dtmfDigitLimit : null
        }
      });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating DTMF timeout:', error);
    }
  };

  const handleDtmfTerminationKeyEnabledChange = async (checked: boolean) => {
    try {
      setDtmfTerminationKeyEnabled(checked);
      await apiService.updateAgent(agent.agent_id, {
        user_dtmf_options: {
          timeout_ms: dtmfTimeout[0],
          termination_key: checked ? dtmfTerminationKey : null,
          digit_limit: dtmfDigitLimitEnabled ? dtmfDigitLimit : null
        }
      });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating DTMF termination key enabled:', error);
    }
  };

  const handleDtmfTerminationKeyChange = async (value: string) => {
    try {
      setDtmfTerminationKey(value);
      await apiService.updateAgent(agent.agent_id, {
        user_dtmf_options: {
          timeout_ms: dtmfTimeout[0],
          termination_key: value,
          digit_limit: dtmfDigitLimitEnabled ? dtmfDigitLimit : null
        }
      });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating DTMF termination key:', error);
    }
  };

  const handleDtmfDigitLimitEnabledChange = async (checked: boolean) => {
    try {
      setDtmfDigitLimitEnabled(checked);
      await apiService.updateAgent(agent.agent_id, {
        user_dtmf_options: {
          timeout_ms: dtmfTimeout[0],
          termination_key: dtmfTerminationKeyEnabled ? dtmfTerminationKey : null,
          digit_limit: checked ? dtmfDigitLimit : null
        }
      });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating DTMF digit limit enabled:', error);
    }
  };

  const handleDtmfDigitLimitChange = async (newValue: number) => {
    try {
      setDtmfDigitLimit(newValue);
      await apiService.updateAgent(agent.agent_id, {
        user_dtmf_options: {
          timeout_ms: dtmfTimeout[0],
          termination_key: dtmfTerminationKeyEnabled ? dtmfTerminationKey : null,
          digit_limit: newValue
        }
      });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating DTMF digit limit:', error);
    }
  };

  const isVoicemailEnabled = agent.voicemail_option !== null && agent.voicemail_option !== undefined;
  const voicemailAction =
    agent.voicemail_option?.action?.type === 'static_text' || agent.voicemail_option?.action?.type === 'prompt'
      ? 'leave_message'
      : 'hangup';
  const voicemailTab = agent.voicemail_option?.action?.type === 'static_text' ? 'static' : 'prompt';

  useState(() => {
    if (agent.voicemail_option?.action?.type === 'static_text' || agent.voicemail_option?.action?.type === 'prompt') {
      const message = agent.voicemail_option.action.text || '';
      setVoicemailMessage(message);
      setOriginalVoicemailMessage(message);
    }
  });

  return (
    <div className="flex h-[calc(100vh-80px)] w-full flex-col overflow-y-auto rounded-lg bg-white px-4">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {settingsSections.map((section) => {
            const isOpen = openSections.includes(section.id);

            return (
              <Collapsible key={section.id} open={isOpen} onOpenChange={() => toggleSection(section.id)}>
                <CollapsibleTrigger className="group flex w-full items-center justify-between border-b border-border p-3 transition-colors hover:bg-accent">
                  <div className="flex items-center gap-3">
                    {section.icon}
                    <span className="text-sm font-medium">{section.label}</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 py-2">
                  {section.id === 'functions' ? (
                    <FunctionsSettings llm={llm} onLlmUpdate={onLlmUpdate} />
                  ) : section.id === 'knowledge' ? (
                    <KnowledgeSettings
                      llm={llm}
                      llmId={llm.llm_id}
                      onLlmUpdate={onLlmUpdate}
                      knowledgeBases={knowledgeBases}
                      loadingKnowledgeBases={loadingKnowledgeBases}
                      onKnowledgeBasesUpdate={onKnowledgeBasesUpdate}
                    />
                  ) : section.id === 'speech' ? (
                    <SpeechSettings agent={agent} onAgentUpdate={onAgentUpdate} />
                  ) : section.id === 'webhook' ? (
                    <WebhookSettings agent={agent} onAgentUpdate={onAgentUpdate} />
                  ) : section.id === 'analysis' ? (
                    <PostCallAnalysis
                      agent={agent}
                      llms={llms}
                      loadingLlms={loadingLlms}
                      onAgentUpdate={onAgentUpdate}
                    />
                  ) : section.id === 'transcription' ? (
                    <TranscriptionSettings agent={agent} onAgentUpdate={onAgentUpdate} />
                  ) : section.id === 'security' ? (
                    <SecuritySettings agent={agent} onAgentUpdate={onAgentUpdate} />
                  ) : section.id === 'mcps' ? (
                    <McpSettings agent={agent} onAgentUpdate={onAgentUpdate} />
                  ) : section.id === 'call' ? (
                    <div className="space-y-6 py-2 pl-7 pr-3">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Detección de Buzón de Voz</div>
                            <p className="text-xs text-muted-foreground">
                              Colgar o dejar un mensaje si se detecta un buzón de voz.
                            </p>
                          </div>
                          <Switch checked={isVoicemailEnabled} onCheckedChange={handleVoicemailDetectionChange} />
                        </div>

                        {isVoicemailEnabled && (
                          <div className="space-y-3 pt-2">
                            <RadioGroup value={voicemailAction} onValueChange={handleVoicemailActionChange}>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="hangup" id="hangup" />
                                <Label htmlFor="hangup" className="cursor-pointer text-sm font-normal">
                                  Colgar al alcanzar buzón de voz
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="leave_message" id="leave_message" />
                                <Label htmlFor="leave_message" className="cursor-pointer text-sm font-normal">
                                  Dejar un mensaje al alcanzar buzón de voz
                                </Label>
                              </div>
                            </RadioGroup>

                            {voicemailAction === 'leave_message' && (
                              <Tabs value={voicemailTab} onValueChange={handleVoicemailTabChange} className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                  <TabsTrigger value="prompt">Prompt</TabsTrigger>
                                  <TabsTrigger value="static">Oración Estática</TabsTrigger>
                                </TabsList>
                                <TabsContent value="prompt" className="mt-3">
                                  <Textarea
                                    value={voicemailMessage}
                                    onChange={(e) => setVoicemailMessage(e.target.value)}
                                    onBlur={handleVoicemailMessageBlur}
                                    placeholder="Ingresa mensaje de buzón de voz..."
                                    className="min-h-[100px] resize-none text-sm"
                                  />
                                </TabsContent>
                                <TabsContent value="static" className="mt-3">
                                  <Textarea
                                    value={voicemailMessage}
                                    onChange={(e) => setVoicemailMessage(e.target.value)}
                                    onBlur={handleVoicemailMessageBlur}
                                    placeholder="Ingresa oración estática..."
                                    className="min-h-[100px] resize-none text-sm"
                                  />
                                </TabsContent>
                              </Tabs>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Detección de Entrada de Teclado del Usuario</div>
                            <p className="text-xs text-muted-foreground">
                              Permitir que la IA escuche la entrada del teclado durante una llamada.
                            </p>
                          </div>
                          <Switch checked={agent.allow_user_dtmf || false} onCheckedChange={handleUserDtmfChange} />
                        </div>

                        {agent.allow_user_dtmf && (
                          <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                            <p className="text-xs text-muted-foreground">
                              La IA responderá cuando se cumpla cualquiera de las siguientes condiciones:
                            </p>

                            <div className="space-y-2">
                              <div className="text-sm font-medium">Tiempo de Espera</div>
                              <p className="text-xs text-muted-foreground">
                                La IA responderá si no se detecta entrada del teclado dentro del tiempo establecido.
                              </p>
                              <div className="flex items-center justify-between">
                                <Slider
                                  value={dtmfTimeout}
                                  onValueChange={setDtmfTimeout}
                                  onValueCommit={handleDtmfTimeoutCommit}
                                  min={SLIDER_CONFIGS.dtmfTimeout.min}
                                  max={SLIDER_CONFIGS.dtmfTimeout.max}
                                  step={SLIDER_CONFIGS.dtmfTimeout.step}
                                  className="mr-4 flex-1"
                                />
                                <div className="w-12 text-right text-sm text-muted-foreground">
                                  {(dtmfTimeout[0] / 1000).toFixed(1)} s
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="text-sm font-medium">Tecla de Terminación</div>
                                  <p className="text-xs text-muted-foreground">
                                    La IA responderá cuando el usuario presione la tecla de terminación configurada
                                    (0-9, #, *).
                                  </p>
                                </div>
                                <Switch
                                  checked={dtmfTerminationKeyEnabled}
                                  onCheckedChange={handleDtmfTerminationKeyEnabledChange}
                                />
                              </div>
                              {dtmfTerminationKeyEnabled && (
                                <Select value={dtmfTerminationKey} onValueChange={handleDtmfTerminationKeyChange}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="#">#</SelectItem>
                                    <SelectItem value="*">*</SelectItem>
                                    <SelectItem value="0">0</SelectItem>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                    <SelectItem value="4">4</SelectItem>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="6">6</SelectItem>
                                    <SelectItem value="7">7</SelectItem>
                                    <SelectItem value="8">8</SelectItem>
                                    <SelectItem value="9">9</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="text-sm font-medium">Límite de Dígitos</div>
                                  <p className="text-xs text-muted-foreground">
                                    La IA responderá inmediatamente después de que el llamante ingrese el número
                                    configurado de dígitos.
                                  </p>
                                </div>
                                <Switch
                                  checked={dtmfDigitLimitEnabled}
                                  onCheckedChange={handleDtmfDigitLimitEnabledChange}
                                />
                              </div>
                              {dtmfDigitLimitEnabled && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDtmfDigitLimitChange(Math.max(1, dtmfDigitLimit - 1))}
                                    disabled={dtmfDigitLimit <= 1}
                                  >
                                    −
                                  </Button>
                                  <div className="flex-1 text-center text-lg font-medium">{dtmfDigitLimit}</div>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDtmfDigitLimitChange(Math.min(20, dtmfDigitLimit + 1))}
                                    disabled={dtmfDigitLimit >= 20}
                                  >
                                    +
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Finalizar Llamada en Silencio</div>
                          <div className="text-sm text-muted-foreground">
                            {endCallSilence[0] < 60000
                              ? `${(endCallSilence[0] / 1000).toFixed(0)} s`
                              : `${(endCallSilence[0] / 60000).toFixed(1)} m`}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Finalizar la llamada si el usuario permanece en silencio durante un período prolongado.
                        </p>
                        <Slider
                          value={endCallSilence}
                          onValueChange={setEndCallSilence}
                          onValueCommit={handleEndCallSilenceCommit}
                          min={SLIDER_CONFIGS.endCallSilence.min}
                          max={SLIDER_CONFIGS.endCallSilence.max}
                          step={SLIDER_CONFIGS.endCallSilence.step}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Duración Máxima de Llamada</div>
                          <div className="text-sm text-muted-foreground">
                            {maxCallDuration[0] < 3600000
                              ? `${(maxCallDuration[0] / 60000).toFixed(1)} m`
                              : `${(maxCallDuration[0] / 3600000).toFixed(2)} h`}
                          </div>
                        </div>
                        <Slider
                          value={maxCallDuration}
                          onValueChange={setMaxCallDuration}
                          onValueCommit={handleMaxCallDurationCommit}
                          min={SLIDER_CONFIGS.maxCallDuration.min}
                          max={SLIDER_CONFIGS.maxCallDuration.max}
                          step={SLIDER_CONFIGS.maxCallDuration.step}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Duración de Timbre</div>
                          <div className="text-sm text-muted-foreground">
                            {ringDuration[0] < 60000
                              ? `${(ringDuration[0] / 1000).toFixed(0)} s`
                              : `${(ringDuration[0] / 60000).toFixed(1)} m`}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          La duración máxima de timbre antes de que la llamada saliente / transferencia se considere sin
                          respuesta.
                        </p>
                        <Slider
                          value={ringDuration}
                          onValueChange={setRingDuration}
                          onValueCommit={handleRingDurationCommit}
                          min={SLIDER_CONFIGS.ringDuration.min}
                          max={SLIDER_CONFIGS.ringDuration.max}
                          step={SLIDER_CONFIGS.ringDuration.step}
                          className="w-full"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="pl-7 text-xs text-muted-foreground">
                      Configura las opciones de {section.label.toLowerCase()} aquí
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>
    </div>
  );
}
