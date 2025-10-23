'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, RefreshCw } from 'lucide-react';
import { IconDelete, IconEdit } from '@/components/modules/agents/icons';
import { apiService } from '@/services';

const SLIDER_CONFIGS = {
  ambientSoundVolume: {
    min: 0,
    max: 2,
    step: 0.01
  },
  responsiveness: {
    min: 0,
    max: 1,
    step: 0.01
  },
  interruptionSensitivity: {
    min: 0,
    max: 1,
    step: 0.01
  },
  backchannelFrequency: {
    min: 0,
    max: 1,
    step: 0.1
  }
};

const iconPronunciation = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M0.500006 8C0.500006 3.85775 3.85776 0.5 8.00001 0.5C12.1423 0.5 15.5 3.85775 15.5 8C15.5 12.1423 12.1423 15.5 8.00001 15.5H0.500006L2.69676 13.3032C1.99928 12.6076 1.44616 11.7809 1.06917 10.8708C0.692176 9.96073 0.49875 8.9851 0.500006 8ZM4.12101 14H8.00001C9.18669 14 10.3467 13.6481 11.3334 12.9888C12.3201 12.3295 13.0892 11.3925 13.5433 10.2961C13.9974 9.19974 14.1162 7.99334 13.8847 6.82946C13.6532 5.66557 13.0818 4.59647 12.2426 3.75736C11.4035 2.91824 10.3344 2.3468 9.17055 2.11529C8.00666 1.88378 6.80026 2.0026 5.70391 2.45672C4.60755 2.91085 3.67048 3.67988 3.01119 4.66658C2.3519 5.65327 2.00001 6.81331 2.00001 8C2.00001 9.614 2.63826 11.1237 3.75726 12.2428L4.81776 13.3032L4.12101 14ZM7.25001 3.5H8.75001V12.5H7.25001V3.5ZM4.25001 5.75H5.75001V10.25H4.25001V5.75ZM10.25 5.75H11.75V10.25H10.25V5.75Z"
      fill="currentColor"
      className="text-muted-foreground"
    />
  </svg>
);

const iconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M9.25 9.25V4.75H10.75V9.25H15.25V10.75H10.75V15.25H9.25V10.75H4.75V9.25H9.25Z"
      fill="currentColor"
      className="text-muted-foreground"
    />
  </svg>
);

interface SpeechSettingsProps {
  agent: Agent;
  onAgentUpdate: () => void;
}

export function SpeechSettings({ agent, onAgentUpdate }: SpeechSettingsProps) {
  const [responsiveness, setResponsiveness] = useState([agent.responsiveness || 0.7]);
  const [interruptionSensitivity, setInterruptionSensitivity] = useState([agent.interruption_sensitivity || 0.9]);
  const [ambientSoundVolume, setAmbientSoundVolume] = useState([agent.ambient_sound_volume || 1]);
  const [backchannelFrequency, setBackchannelFrequency] = useState([agent.backchannel_frequency || 0.8]);
  const [backchannelWords, setBackchannelWords] = useState(
    agent.backchannel_words ? agent.backchannel_words.join(', ') : ''
  );
  const [originalBackchannelWords, setOriginalBackchannelWords] = useState(
    agent.backchannel_words ? agent.backchannel_words.join(', ') : ''
  );
  const [reminderTriggerSeconds, setReminderTriggerSeconds] = useState(
    Math.floor((agent.reminder_trigger_ms || 10000) / 1000)
  );
  const [reminderMaxCount, setReminderMaxCount] = useState(agent.reminder_max_count || 1);

  const [isPronunciationDialogOpen, setIsPronunciationDialogOpen] = useState(false);
  const [editingPronunciationIndex, setEditingPronunciationIndex] = useState<number | null>(null);
  const [pronunciationWord, setPronunciationWord] = useState('');
  const [pronunciationAlphabet, setPronunciationAlphabet] = useState<'ipa' | 'cmu'>('ipa');
  const [pronunciationPhoneme, setPronunciationPhoneme] = useState('');

  const pronunciationDictionary = agent.pronunciation_dictionary || [];

  const handleAmbientSoundChange = async (value: string) => {
    try {
      const ambientSound = value === 'none' ? null : value;
      await apiService.updateAgent(agent.agent_id, { ambient_sound: ambientSound });
      await onAgentUpdate();
    } catch (error) {}
  };

  const handleAmbientVolumeCommit = async (value: number[]) => {
    try {
      await apiService.updateAgent(agent.agent_id, { ambient_sound_volume: value[0] });
      await onAgentUpdate();
    } catch (error) {}
  };

  const handleResponsivenessCommit = async (value: number[]) => {
    try {
      await apiService.updateAgent(agent.agent_id, { responsiveness: value[0] });
      await onAgentUpdate();
    } catch (error) {}
  };

  const handleInterruptionSensitivityCommit = async (value: number[]) => {
    try {
      await apiService.updateAgent(agent.agent_id, { interruption_sensitivity: value[0] });
      await onAgentUpdate();
    } catch (error) {}
  };

  const handleBackchannelChange = async (checked: boolean) => {
    try {
      await apiService.updateAgent(agent.agent_id, { enable_backchannel: checked });
      await onAgentUpdate();
    } catch (error) {}
  };

  const handleBackchannelFrequencyCommit = async (value: number[]) => {
    try {
      await apiService.updateAgent(agent.agent_id, { backchannel_frequency: value[0] });
      await onAgentUpdate();
    } catch (error) {}
  };

  const handleBackchannelWordsBlur = async () => {
    if (backchannelWords !== originalBackchannelWords) {
      try {
        const wordsArray = backchannelWords
          .split(',')
          .map((word) => word.trim())
          .filter((word) => word.length > 0);

        await apiService.updateAgent(agent.agent_id, {
          backchannel_words: wordsArray.length > 0 ? wordsArray : undefined
        });
        setOriginalBackchannelWords(backchannelWords);
        await onAgentUpdate();
      } catch (error) {}
    }
  };

  const handleNormalizeSpeechChange = async (checked: boolean) => {
    try {
      await apiService.updateAgent(agent.agent_id, { normalize_for_speech: checked });
      await onAgentUpdate();
    } catch (error) {}
  };

  const handleReminderTriggerBlur = async () => {
    try {
      const ms = reminderTriggerSeconds * 1000;
      await apiService.updateAgent(agent.agent_id, {
        reminder_trigger_ms: ms,
        reminder_max_count: reminderMaxCount
      });
      await onAgentUpdate();
    } catch (error) {}
  };

  const handleReminderMaxCountBlur = async () => {
    try {
      await apiService.updateAgent(agent.agent_id, {
        reminder_trigger_ms: reminderTriggerSeconds * 1000,
        reminder_max_count: reminderMaxCount
      });
      await onAgentUpdate();
    } catch (error) {}
  };

  const handleOpenAddPronunciation = () => {
    setEditingPronunciationIndex(null);
    setPronunciationWord('');
    setPronunciationAlphabet('ipa');
    setPronunciationPhoneme('');
    setIsPronunciationDialogOpen(true);
  };

  const handleOpenEditPronunciation = (index: number) => {
    const pronunciation = pronunciationDictionary[index];
    setEditingPronunciationIndex(index);
    setPronunciationWord(pronunciation.word);
    setPronunciationAlphabet(pronunciation.alphabet);
    setPronunciationPhoneme(pronunciation.phoneme);
    setIsPronunciationDialogOpen(true);
  };

  const handleSavePronunciation = async () => {
    try {
      let updatedDictionary = [...pronunciationDictionary];

      const newEntry = {
        word: pronunciationWord,
        alphabet: pronunciationAlphabet,
        phoneme: pronunciationPhoneme
      };

      if (editingPronunciationIndex !== null) {
        updatedDictionary[editingPronunciationIndex] = newEntry;
      } else {
        updatedDictionary.push(newEntry);
      }

      await apiService.updateAgent(agent.agent_id, {
        pronunciation_dictionary: updatedDictionary
      });

      await onAgentUpdate();
      setIsPronunciationDialogOpen(false);
    } catch (error) {}
  };

  const handleDeletePronunciation = async (index: number) => {
    try {
      const updatedDictionary = pronunciationDictionary.filter((_, i) => i !== index);

      await apiService.updateAgent(agent.agent_id, {
        pronunciation_dictionary: updatedDictionary.length > 0 ? updatedDictionary : undefined
      });

      await onAgentUpdate();
    } catch (error) {}
  };

  const handleCancelPronunciation = () => {
    setIsPronunciationDialogOpen(false);
  };

  return (
    <div className="space-y-6 py-2 pl-7 pr-3">
      <div className="space-y-2">
        <div className="text-sm font-medium">Sonido de Fondo</div>
        <div className="flex items-center gap-2">
          <Select value={agent.ambient_sound || 'none'} onValueChange={handleAmbientSoundChange}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coffee-shop">Cafetería</SelectItem>
              <SelectItem value="convention-hall">Salón de Convenciones</SelectItem>
              <SelectItem value="summer-outdoor">Exterior de Verano</SelectItem>
              <SelectItem value="mountain-outdoor">Exterior de Montaña</SelectItem>
              <SelectItem value="static-noise">Ruido Estático</SelectItem>
              <SelectItem value="call-center">Centro de Llamadas</SelectItem>
              <SelectItem value="none">Ninguno</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="text-sm font-medium">Volumen de Sonido de Fondo</div>
                <div className="flex items-center gap-4">
                  <Slider
                    value={ambientSoundVolume}
                    onValueChange={setAmbientSoundVolume}
                    onValueCommit={handleAmbientVolumeCommit}
                    min={SLIDER_CONFIGS.ambientSoundVolume.min}
                    max={SLIDER_CONFIGS.ambientSoundVolume.max}
                    step={SLIDER_CONFIGS.ambientSoundVolume.step}
                    className="flex-1"
                  />
                  <div className="w-12 text-right text-sm text-muted-foreground">
                    {ambientSoundVolume[0].toFixed(2)}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">Capacidad de Respuesta</div>
            <RefreshCw className="h-3 w-3 text-muted-foreground" />
          </div>
          <div className="text-sm text-muted-foreground">{responsiveness[0].toFixed(2)}</div>
        </div>
        <p className="text-xs text-muted-foreground">
          Controla qué tan rápido responde el agente después de que los usuarios terminan de hablar.
        </p>
        <Slider
          value={responsiveness}
          onValueChange={setResponsiveness}
          onValueCommit={handleResponsivenessCommit}
          min={SLIDER_CONFIGS.responsiveness.min}
          max={SLIDER_CONFIGS.responsiveness.max}
          step={SLIDER_CONFIGS.responsiveness.step}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Sensibilidad de Interrupción</div>
          <div className="text-sm text-muted-foreground">{interruptionSensitivity[0].toFixed(2)}</div>
        </div>
        <p className="text-xs text-muted-foreground">
          Controla qué tan sensiblemente la IA puede ser interrumpida por el habla humana.
        </p>
        <Slider
          value={interruptionSensitivity}
          onValueChange={setInterruptionSensitivity}
          onValueCommit={handleInterruptionSensitivityCommit}
          min={SLIDER_CONFIGS.interruptionSensitivity.min}
          max={SLIDER_CONFIGS.interruptionSensitivity.max}
          step={SLIDER_CONFIGS.interruptionSensitivity.step}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-1">
            <div className="text-sm font-medium">Habilitar Retroalimentación</div>
            <p className="text-xs text-muted-foreground">
              Permite que el agente use afirmaciones como &#39;sí&#39; o &#39;ajá&#39; durante las conversaciones,
              indicando escucha activa y compromiso.
            </p>
          </div>
          <Switch checked={agent.enable_backchannel || false} onCheckedChange={handleBackchannelChange} />
        </div>

        {agent.enable_backchannel && (
          <div className="mt-2 rounded-md border border-border bg-muted/30">
            <div className="space-y-2 p-4">
              <div className="text-xs font-medium">Frecuencia de Retroalimentación</div>
              <div className="flex items-center gap-4">
                <Slider
                  value={backchannelFrequency}
                  onValueChange={setBackchannelFrequency}
                  onValueCommit={handleBackchannelFrequencyCommit}
                  min={SLIDER_CONFIGS.backchannelFrequency.min}
                  max={SLIDER_CONFIGS.backchannelFrequency.max}
                  step={SLIDER_CONFIGS.backchannelFrequency.step}
                  className="flex-1"
                />
                <div className="w-8 text-right text-sm text-muted-foreground">{backchannelFrequency[0].toFixed(1)}</div>
              </div>
            </div>

            <div className="space-y-2 border-t border-border p-4">
              <div className="text-xs font-medium">Palabras de Retroalimentación</div>
              <p className="text-xs text-muted-foreground">
                Una lista de palabras que el agente usaría para retroalimentación.
              </p>
              <Input
                value={backchannelWords}
                onChange={(e) => setBackchannelWords(e.target.value)}
                onBlur={handleBackchannelWordsBlur}
                placeholder="Separar por comas. Ejemplo: sí,ajá,ok"
                className="bg-background text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">Habilitar Normalización de Voz</div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </div>
            <p className="text-xs text-muted-foreground">
              Convierte elementos de texto como números, moneda y fechas en formas habladas similares a las humanas.
              (Más información)
            </p>
          </div>
          <Switch checked={agent.normalize_for_speech || false} onCheckedChange={handleNormalizeSpeechChange} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Frecuencia de Mensaje Recordatorio</div>
        <p className="text-xs text-muted-foreground">
          Controla con qué frecuencia la IA enviará un mensaje recordatorio.
        </p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={reminderTriggerSeconds}
            onChange={(e) => setReminderTriggerSeconds(Number(e.target.value))}
            onBlur={handleReminderTriggerBlur}
            className="w-20 text-sm"
            min="1"
          />
          <span className="text-sm text-muted-foreground">segundos</span>
          <Input
            type="number"
            value={reminderMaxCount}
            onChange={(e) => setReminderMaxCount(Number(e.target.value))}
            onBlur={handleReminderMaxCountBlur}
            className="w-20 text-sm"
            min="1"
          />
          <span className="text-sm text-muted-foreground">veces</span>
        </div>
      </div>

      <div className="flex flex-col rounded-lg p-4">
        <div className="text-sm font-medium">Pronunciación</div>
        <p className="mb-2 text-xs font-normal leading-none text-muted-foreground">
          Guía al modelo para pronunciar una palabra, nombre o frase de una manera específica.{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:underline"
            href="https://docs.retellai.com/build/add-pronounciation"
          >
            (Más información)
          </a>
        </p>

        {pronunciationDictionary.length > 0 && (
          <div className="flex flex-col gap-1">
            {pronunciationDictionary.map((pronunciation, index) => (
              <div
                key={index}
                className="inline-flex h-8 w-full items-center justify-start gap-1 rounded-lg border-none bg-muted/50 p-1.5"
              >
                <div className="flex items-center justify-center">{iconPronunciation()}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-normal leading-tight text-muted-foreground">
                    {pronunciation.word}
                  </div>
                </div>
                <div className="ml-auto flex items-center justify-center gap-0.5 p-px">
                  <div className="cursor-pointer rounded-sm p-px" onClick={() => handleOpenEditPronunciation(index)}>
                    <div className="flex h-[18px] w-[18px] items-center justify-center">
                      <IconEdit />
                    </div>
                  </div>
                  <div className="cursor-pointer rounded-sm p-px" onClick={() => handleDeletePronunciation(index)}>
                    <div className="flex h-[18px] w-[18px] cursor-pointer items-center justify-center p-0">
                      <IconDelete />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mb-2"></div>

        <Dialog open={isPronunciationDialogOpen} onOpenChange={setIsPronunciationDialogOpen}>
          <DialogTrigger asChild>
            <button
              className="mb-2 inline-flex h-8 w-[88px] items-center justify-center gap-0.5 whitespace-nowrap rounded-lg border border-input bg-background p-1.5 text-sm font-medium text-muted-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              onClick={handleOpenAddPronunciation}
            >
              {iconPlus()}
              <div className="px-1 text-sm font-medium leading-normal text-foreground">Agregar</div>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {iconPronunciation()}
                <span>Pronunciación</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium leading-normal">Palabra</label>
                <Input
                  value={pronunciationWord}
                  onChange={(e) => setPronunciationWord(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium leading-normal">Pronunciación</label>
                <Select
                  value={pronunciationAlphabet}
                  onValueChange={(value) => setPronunciationAlphabet(value as 'ipa' | 'cmu')}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ipa">IPA (11 labs and Cartesia)</SelectItem>
                    <SelectItem value="cmu">CMU (11 labs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium leading-normal">Fonema</label>
                <Input
                  value={pronunciationPhoneme}
                  onChange={(e) => setPronunciationPhoneme(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleCancelPronunciation}>
                Cancelar
              </Button>
              <Button onClick={handleSavePronunciation}>Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
