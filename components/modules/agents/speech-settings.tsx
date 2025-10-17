// @ts-nocheck
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Settings, RefreshCw } from 'lucide-react';
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

  const handleAmbientSoundChange = async (value: string) => {
    try {
      const ambientSound = value === 'none' ? null : value;
      await apiService.updateAgent(agent.agent_id, { ambient_sound: ambientSound });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating ambient sound:', error);
    }
  };

  const handleAmbientVolumeCommit = async (value: number[]) => {
    try {
      await apiService.updateAgent(agent.agent_id, { ambient_sound_volume: value[0] });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating ambient sound volume:', error);
    }
  };

  const handleResponsivenessCommit = async (value: number[]) => {
    try {
      await apiService.updateAgent(agent.agent_id, { responsiveness: value[0] });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating responsiveness:', error);
    }
  };

  const handleInterruptionSensitivityCommit = async (value: number[]) => {
    try {
      await apiService.updateAgent(agent.agent_id, { interruption_sensitivity: value[0] });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating interruption sensitivity:', error);
    }
  };

  const handleBackchannelChange = async (checked: boolean) => {
    try {
      await apiService.updateAgent(agent.agent_id, { enable_backchannel: checked });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating backchannel:', error);
    }
  };

  const handleBackchannelFrequencyCommit = async (value: number[]) => {
    try {
      await apiService.updateAgent(agent.agent_id, { backchannel_frequency: value[0] });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating backchannel frequency:', error);
    }
  };

  const handleBackchannelWordsBlur = async () => {
    if (backchannelWords !== originalBackchannelWords) {
      try {
        const wordsArray = backchannelWords
          .split(',')
          .map((word) => word.trim())
          .filter((word) => word.length > 0);

        await apiService.updateAgent(agent.agent_id, {
          backchannel_words: wordsArray.length > 0 ? wordsArray : null
        });
        setOriginalBackchannelWords(backchannelWords);
        await onAgentUpdate();
      } catch (error) {
        console.error('Error updating backchannel words:', error);
      }
    }
  };

  const handleNormalizeSpeechChange = async (checked: boolean) => {
    try {
      await apiService.updateAgent(agent.agent_id, { normalize_for_speech: checked });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating normalize for speech:', error);
    }
  };

  const handleReminderTriggerBlur = async () => {
    try {
      const ms = reminderTriggerSeconds * 1000;
      await apiService.updateAgent(agent.agent_id, {
        reminder_trigger_ms: ms,
        reminder_max_count: reminderMaxCount
      });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating reminder trigger:', error);
    }
  };

  const handleReminderMaxCountBlur = async () => {
    try {
      await apiService.updateAgent(agent.agent_id, {
        reminder_trigger_ms: reminderTriggerSeconds * 1000,
        reminder_max_count: reminderMaxCount
      });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating reminder max count:', error);
    }
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
    </div>
  );
}
