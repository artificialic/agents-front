// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, Clock, Info, Settings } from 'lucide-react';
import { apiService } from '@/services';
import { SelectVoiceModal } from '@/components/modules/agents/select-voice-modal';
import { LANGUAGES } from '@/components/modules/agents/constants';
import { PromptTreePreview } from './prompt-tree-preview';
import { FlowEditorModal } from './flow-editor-modal';

interface AgentConfigurationProps {
  agent: Agent;
  llmId: string;
  llms: Llm[];
  loadingLlms: boolean;
  llm: Llm | null;
  onLlmUpdate: () => Promise<void>;
}

const VOICE_MODELS = [
  {
    value: 'auto-gpt-4o-mini',
    label: 'Auto (GPT-4o mini TTS)',
    description: 'Rápido, alta calidad'
  },
  {
    value: 'gpt-4o-mini',
    label: 'GPT-4o mini TTS',
    description: 'Rápido, alta calidad'
  },
  {
    value: 'tts-1',
    label: 'TTS-1',
    description: 'Más lento, alta calidad'
  }
];

export function AgentConfiguration({ agent, llmId, llms, loadingLlms, llm, onLlmUpdate }: AgentConfigurationProps) {
  const [formData, setFormData] = useState({
    prompt: '',
    customMessage: '',
    staticMessage: '',
    silenceTime: [10000],
    pauseBeforeSpeak: [0]
  });
  const [originalData, setOriginalData] = useState({
    prompt: '',
    customMessage: '',
    staticMessage: ''
  });

  const [voiceConfig, setVoiceConfig] = useState({
    model: 'auto-gpt-4o-mini',
    speed: [1.0],
    temperature: [1.0],
    volume: [1.0]
  });
  const [originalVoiceConfig, setOriginalVoiceConfig] = useState({
    model: 'auto-gpt-4o-mini',
    speed: [1.0],
    temperature: [1.0],
    volume: [1.0]
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingVoice, setSavingVoice] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [voicePopoverOpen, setVoicePopoverOpen] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('Seleccionar Voz');
  const [flowEditorOpen, setFlowEditorOpen] = useState(false);

  const handleEditPromptTree = () => {
    setFlowEditorOpen(true);
  };

  useEffect(() => {
    const initializeFormData = async () => {
      try {
        if (!llm) {
          setLoading(false);
          return;
        }

        const llmPrompt = llm.general_prompt || '';
        const beginMessage = llm.begin_message || '';
        const silenceMs = llm.begin_after_user_silence_ms || 10000;
        const pauseMs = agent.begin_message_delay_ms || 0;

        setFormData({
          prompt: llmPrompt,
          customMessage: beginMessage,
          staticMessage: beginMessage,
          silenceTime: [silenceMs],
          pauseBeforeSpeak: [pauseMs]
        });
        setOriginalData({
          prompt: llmPrompt,
          customMessage: beginMessage,
          staticMessage: beginMessage
        });

        const voiceSettings = {
          model: llm.voice_model || 'auto-gpt-4o-mini',
          speed: [llm.voice_speed || 1.0],
          temperature: [llm.voice_temperature || 1.0],
          volume: [llm.voice_volume || 1.0]
        };
        setVoiceConfig(voiceSettings);
        setOriginalVoiceConfig(voiceSettings);

        if (agent.language) {
          setSelectedLanguage(agent.language);
        }

        if (agent.voice_id) {
          setSelectedVoiceId(agent.voice_id);

          try {
            const voices = await apiService.getVoices();
            const voice = voices.find((v: any) => v.voice_id === agent.voice_id);
            if (voice) {
              setSelectedVoiceName(voice.voice_name);
            }
          } catch (error) {
            console.error('Error fetching voice name:', error);
          }
        }
      } catch (error) {
        console.error('Error initializing form data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeFormData();
  }, [llm, agent.language, agent.voice_id]);

  const hasChanges = formData.prompt !== originalData.prompt;
  const hasVoiceChanges = JSON.stringify(voiceConfig) !== JSON.stringify(originalVoiceConfig);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiService.updateLlm(llmId, { general_prompt: formData.prompt });
      setOriginalData((prev) => ({ ...prev, prompt: formData.prompt }));
    } catch (error) {
      console.error('Error updating LLM:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = () => {
    setFormData((prev) => ({ ...prev, prompt: originalData.prompt }));
  };

  const handleVoiceSave = async () => {
    setSavingVoice(true);
    try {
      await apiService.updateLlm(llmId, {
        voice_model: voiceConfig.model,
        voice_speed: voiceConfig.speed[0],
        voice_temperature: voiceConfig.temperature[0],
        voice_volume: voiceConfig.volume[0]
      });
      setOriginalVoiceConfig({ ...voiceConfig });
    } catch (error) {
      console.error('Error updating voice settings:', error);
    } finally {
      setSavingVoice(false);
    }
  };

  const handleVoiceRevert = () => {
    setVoiceConfig({ ...originalVoiceConfig });
  };

  const handleLanguageChange = async (value: string) => {
    try {
      setSelectedLanguage(value);
      await apiService.updateAgent(agent.agent_id, { language: value });
    } catch (error) {
      console.error('Error updating language:', error);
    }
  };

  const handleVoiceSelect = async (voiceId: string) => {
    try {
      setSelectedVoiceId(voiceId);
      await apiService.updateAgent(agent.agent_id, {
        voice_id: voiceId,
        voice_model: null
      });

      const voices = await apiService.getVoices();
      const voice = voices.find((v: any) => v.voice_id === voiceId);
      if (voice) {
        setSelectedVoiceName(voice.voice_name);
      }
    } catch (error) {
      console.error('Error updating voice:', error);
    }
  };

  const handleWelcomeMessageChange = async (updates: Partial<Llm>) => {
    try {
      await apiService.updateLlm(llmId, updates);
      const response = await apiService.getLlm(llmId);
      const beginMessage = response.begin_message || '';

      await onLlmUpdate();
      setFormData((prev) => ({
        ...prev,
        customMessage: beginMessage,
        staticMessage: beginMessage
      }));
      setOriginalData((prev) => ({
        ...prev,
        customMessage: beginMessage,
        staticMessage: beginMessage
      }));
    } catch (error) {
      console.error('Error updating welcome message:', error);
    }
  };

  const handleCustomMessageBlur = async () => {
    if (formData.customMessage !== originalData.customMessage) {
      await handleWelcomeMessageChange({ begin_message: formData.customMessage });
    }
  };

  const handleStaticMessageBlur = async () => {
    if (formData.staticMessage !== originalData.staticMessage) {
      await handleWelcomeMessageChange({ begin_message: formData.staticMessage });
    }
  };

  const handleSilenceSwitchChange = async (checked: boolean) => {
    try {
      const newSilenceTime = checked ? 10000 : null;
      const updates = {
        begin_after_user_silence_ms: newSilenceTime
      };
      await apiService.updateLlm(llmId, updates);
      await onLlmUpdate();
      setFormData((prev) => ({
        ...prev,
        silenceTime: [newSilenceTime || 10000]
      }));
    } catch (error) {
      console.error('Error updating silence setting:', error);
    }
  };

  const handleSilenceTimeCommit = async (value: number[]) => {
    try {
      await apiService.updateLlm(llmId, { begin_after_user_silence_ms: value[0] });
      await onLlmUpdate();
    } catch (error) {
      console.error('Error updating silence time:', error);
    }
  };

  const handlePauseBeforeSpeakCommit = async (value: number[]) => {
    try {
      await apiService.updateAgent(agent.agent_id, { begin_message_delay_ms: value[0] });
    } catch (error) {
      console.error('Error updating pause before speaking:', error);
    }
  };

  const handleSilenceMessageTypeChange = (value: string) => {
    if (value === 'dynamic') {
      handleWelcomeMessageChange({ begin_message: null });
    } else {
      handleWelcomeMessageChange({ begin_message: formData.staticMessage || 'Hi, how can I help you?' });
    }
  };

  const handleAiMessageTypeChange = (value: string) => {
    if (value === 'dynamic') {
      handleWelcomeMessageChange({ begin_message: null });
    } else {
      handleWelcomeMessageChange({ begin_message: formData.customMessage || 'Hello, how can I help you today?' });
    }
  };

  const getActiveWelcomeOption = () => {
    if (!llm) return 'user-first';

    if (llm.start_speaker === 'user') {
      return 'user-first';
    }

    return 'ai-first';
  };

  const handleWelcomeOptionChange = (value: string) => {
    if (value === 'user-first') {
      handleWelcomeMessageChange({ start_speaker: 'user', begin_message: null });
    } else {
      handleWelcomeMessageChange({ start_speaker: 'agent', begin_message: null });
    }
  };

  const handleSaveFlowStates = async (updatedLlm: Llm) => {
    try {
      await apiService.updateLlm(llmId, {
        states: updatedLlm.states,
        starting_state: updatedLlm.starting_state,
        last_modification_timestamp: updatedLlm.last_modification_timestamp
      });
      await onLlmUpdate();
    } catch (error) {
      console.error('Error updating LLM states:', error);
    }
  };

  const activeOption = getActiveWelcomeOption();
  const isSilenceSwitchOn = llm?.begin_after_user_silence_ms !== null && llm?.begin_after_user_silence_ms !== undefined;
  const silenceMessageType = llm?.begin_message === null || llm?.begin_message === undefined ? 'dynamic' : 'static';
  const aiMessageType = llm?.begin_message === null || llm?.begin_message === undefined ? 'dynamic' : 'custom';

  const selectedLang = LANGUAGES.find((lang) => lang.value === selectedLanguage) || LANGUAGES[0];
  const selectedVoiceModel = VOICE_MODELS.find((model) => model.value === voiceConfig.model) || VOICE_MODELS[0];

  return (
    <ScrollArea className="h-[calc(100dvh-180px)] w-full">
      <div className="bg-white-0 flex min-h-full w-full flex-col rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Select value={llmId}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-foreground">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="8" cy="8" r="2" fill="currentColor" />
                  </svg>
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {loadingLlms ? (
                  <SelectItem value="loading" disabled>
                    Cargando...
                  </SelectItem>
                ) : (
                  llms.map((llm) => (
                    <SelectItem key={llm.llm_id} value={llm.llm_id}>
                      {llm.model}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-1 items-center gap-2">
            <button onClick={() => setShowVoiceModal(true)} className="flex-1">
              <div className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground">
                <div className="h-4 w-4 rounded-full bg-gradient-to-br from-orange-400 to-pink-500" />
                <span className="text-sm">{selectedVoiceName}</span>
              </div>
            </button>

            <Popover open={voicePopoverOpen} onOpenChange={setVoicePopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Modelo de Voz</h4>
                    <div className="space-y-2">
                      {VOICE_MODELS.map((model) => (
                        <label key={model.value} className="flex cursor-pointer items-start gap-3">
                          <div className="mt-0.5 flex items-center gap-2">
                            <div
                              className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                                voiceConfig.model === model.value ? 'border-primary bg-primary' : 'border-border'
                              }`}
                            >
                              {voiceConfig.model === model.value && (
                                <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                              )}
                            </div>
                          </div>
                          <div
                            className="flex-1"
                            onClick={() => setVoiceConfig((prev) => ({ ...prev, model: model.value }))}
                          >
                            <div className="text-sm font-medium">{model.label}</div>
                            <div className="text-xs text-muted-foreground">{model.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Velocidad de Voz</Label>
                      <span className="text-sm text-muted-foreground">{voiceConfig.speed[0].toFixed(2)}</span>
                    </div>
                    <Slider
                      value={voiceConfig.speed}
                      onValueChange={(value) => setVoiceConfig((prev) => ({ ...prev, speed: value }))}
                      min={0.25}
                      max={4.0}
                      step={0.25}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Temperatura de Voz</Label>
                      <span className="text-sm text-muted-foreground">{voiceConfig.temperature[0].toFixed(2)}</span>
                    </div>
                    <Slider
                      value={voiceConfig.temperature}
                      onValueChange={(value) => setVoiceConfig((prev) => ({ ...prev, temperature: value }))}
                      min={0.0}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Volumen de Voz</Label>
                      <span className="text-sm text-muted-foreground">{voiceConfig.volume[0].toFixed(2)}</span>
                    </div>
                    <Slider
                      value={voiceConfig.volume}
                      onValueChange={(value) => setVoiceConfig((prev) => ({ ...prev, volume: value }))}
                      min={0.0}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleVoiceRevert();
                        setVoicePopoverOpen(false);
                      }}
                      disabled={savingVoice}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={async () => {
                        await handleVoiceSave();
                        setVoicePopoverOpen(false);
                      }}
                      disabled={savingVoice}
                    >
                      {savingVoice ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex-1">
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  {selectedLang.flag}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    <div className="flex w-full items-center gap-2">
                      <div className="text-sm font-normal">{lang.label}</div>
                      {lang.region && <div className="text-xs text-muted-foreground">{lang.region}</div>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative space-y-2">
          <Label htmlFor="prompt" className="text-sm font-normal text-muted-foreground">
            Escribe un prompt universal para tu agente, como su rol, estilo conversacional, objetivo, etc.
          </Label>
          <Textarea
            id="prompt"
            placeholder="Ingresa el prompt de tu agente..."
            value={loading ? 'Cargando...' : formData.prompt}
            onChange={(e) => setFormData((prev) => ({ ...prev, prompt: e.target.value }))}
            disabled={loading}
            className="mt-2 h-[40vh] min-h-[300px] resize-y pb-[40px] font-mono text-sm"
          />
          {hasChanges && (
            <div className="absolute bottom-4 left-4 flex gap-2">
              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button onClick={handleRevert} variant="outline" size="sm" disabled={saving}>
                Revertir
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Mensaje de Bienvenida</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground">
                  <Info className="mr-1 h-3 w-3" />
                  Pausa Antes de Hablar: {(formData.pauseBeforeSpeak[0] / 1000).toFixed(1)}s
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96">
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Pausa Antes de Hablar</h4>
                    <p className="text-xs text-muted-foreground">
                      La duración antes de que el asistente comience a hablar al inicio de la llamada.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={formData.pauseBeforeSpeak}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, pauseBeforeSpeak: value }))}
                      onValueCommit={handlePauseBeforeSpeakCommit}
                      min={0}
                      max={5000}
                      step={100}
                      className="flex-1"
                    />
                    <div className="w-12 text-right text-sm text-muted-foreground">
                      {(formData.pauseBeforeSpeak[0] / 1000).toFixed(1)} s
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3">
            <Select value={activeOption} onValueChange={handleWelcomeOptionChange}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {activeOption === 'user-first' ? 'Usuario habla primero' : 'IA habla primero'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user-first">Usuario habla primero</SelectItem>
                <SelectItem value="ai-first">IA habla primero</SelectItem>
              </SelectContent>
            </Select>

            {activeOption === 'user-first' && (
              <>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">IA comienza a hablar después del silencio</span>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    {isSilenceSwitchOn && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            Tiempo de Silencio: {(formData.silenceTime[0] / 1000).toFixed(0)}s
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-96">
                          <div className="space-y-4">
                            <div>
                              <h4 className="mb-1 text-sm font-medium">Tiempo de Espera de Entrada de IA</h4>
                              <p className="text-xs text-muted-foreground">
                                Tiempo de espera antes de que el asistente comience a hablar si el usuario permanece en
                                silencio.
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <Slider
                                value={formData.silenceTime}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, silenceTime: value }))}
                                onValueCommit={handleSilenceTimeCommit}
                                min={1000}
                                max={30000}
                                step={100}
                                className="flex-1"
                              />
                              <div className="w-12 text-right text-sm text-muted-foreground">
                                {(formData.silenceTime[0] / 1000).toFixed(1)} s
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                    <Switch checked={isSilenceSwitchOn} onCheckedChange={handleSilenceSwitchChange} />
                  </div>
                </div>

                {isSilenceSwitchOn && (
                  <>
                    <Select value={silenceMessageType} onValueChange={handleSilenceMessageTypeChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {silenceMessageType === 'dynamic'
                            ? 'Mensaje dinámico basado en el prompt'
                            : 'Mensaje estático'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="static">Mensaje estático</SelectItem>
                        <SelectItem value="dynamic">Mensaje dinámico basado en el prompt</SelectItem>
                      </SelectContent>
                    </Select>

                    {silenceMessageType === 'static' && (
                      <div className="pt-2">
                        <Textarea
                          value={formData.staticMessage}
                          onChange={(e) => setFormData((prev) => ({ ...prev, staticMessage: e.target.value }))}
                          onBlur={handleStaticMessageBlur}
                          placeholder="Ingresa mensaje estático..."
                          className="min-h-[60px] resize-none text-sm"
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {activeOption === 'ai-first' && (
              <>
                <Select value={aiMessageType} onValueChange={handleAiMessageTypeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {aiMessageType === 'dynamic' ? 'Mensaje dinámico' : 'Mensaje personalizado'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dynamic">Mensaje dinámico</SelectItem>
                    <SelectItem value="custom">Mensaje personalizado</SelectItem>
                  </SelectContent>
                </Select>

                {aiMessageType === 'custom' && (
                  <div className="pt-2">
                    <Textarea
                      value={formData.customMessage}
                      onChange={(e) => setFormData((prev) => ({ ...prev, customMessage: e.target.value }))}
                      onBlur={handleCustomMessageBlur}
                      placeholder="Ingresa mensaje de bienvenida personalizado..."
                      className="min-h-[60px] resize-none text-sm"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {llm?.states && Array.isArray(llm.states) > 0 && (
          <div className="space-y-2">
            <Label className="mt-4 text-sm font-medium">Árbol de Prompts Multi-Estado</Label>
            <PromptTreePreview onEdit={handleEditPromptTree} llm={llm} />
          </div>
        )}
        <SelectVoiceModal
          open={showVoiceModal}
          onOpenChange={setShowVoiceModal}
          currentVoiceId={selectedVoiceId}
          onSelectVoice={handleVoiceSelect}
        />

        <FlowEditorModal
          open={flowEditorOpen}
          onOpenChange={setFlowEditorOpen}
          llm={llm}
          onSave={handleSaveFlowStates}
        />
      </div>
    </ScrollArea>
  );
}
