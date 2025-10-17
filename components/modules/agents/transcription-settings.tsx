'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Info } from 'lucide-react';
import { apiService } from '@/services';

interface TranscriptionSettingsProps {
  agent: Agent;
  onAgentUpdate: () => void;
}

export function TranscriptionSettings({ agent, onAgentUpdate }: TranscriptionSettingsProps) {
  const [denoisingMode, setDenoisingMode] = useState(agent.response_engine?.denoising_mode || 'noise-cancellation');
  const [transcriptionMode, setTranscriptionMode] = useState(agent.response_engine?.stt_mode || 'fast');
  const [boostedKeywords, setBoostedKeywords] = useState(agent.boosted_keywords?.join(',') || '');
  const [originalBoostedKeywords, setOriginalBoostedKeywords] = useState(agent?.boosted_keywords?.join(',') || '');

  const handleDenoisingModeChange = async (value: string) => {
    try {
      setDenoisingMode(value);
      await apiService.updateAgent(agent.agent_id, {
        ...agent.response_engine,
        denoising_mode: value
      });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating denoising mode:', error);
    }
  };

  const handleTranscriptionModeChange = async (value: string) => {
    try {
      setTranscriptionMode(value);
      await apiService.updateAgent(agent.agent_id, {
        ...agent.response_engine,
        stt_mode: value
      });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating transcription mode:', error);
    }
  };

  const handleBoostedKeywordsBlur = async () => {
    if (boostedKeywords !== originalBoostedKeywords) {
      try {
        const keywordsArray = boostedKeywords
          .split(',')
          .map((k) => k.trim())
          .filter((k) => k.length > 0);

        await apiService.updateAgent(agent.agent_id, {
          boosted_keywords: keywordsArray.length > 0 ? keywordsArray : []
        });
        setOriginalBoostedKeywords(boostedKeywords);
        await onAgentUpdate();
      } catch (error) {
        console.error('Error updating boosted keywords:', error);
      }
    }
  };

  return (
    <div className="flex flex-col items-start space-y-4 px-7 pb-4 pt-0">
      <div className="flex w-full flex-col rounded-lg pb-4 pl-4 pr-4 pt-4">
        <div className="flex flex-row gap-1">
          <div className="text-xs font-medium leading-normal">Modo de Reducción de Ruido</div>
        </div>
        <div className="text-xs text-muted-foreground">
          Filtra ruidos de fondo o conversaciones no deseadas.{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
            href="https://docs.retellai.com/build/handle-background-noise#set-denoising-mode"
          >
            (Más información)
          </a>
        </div>
        <div className="mt-2">
          <RadioGroup value={denoisingMode} onValueChange={handleDenoisingModeChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="noise-cancellation" id="noise-cancellation" />
              <Label htmlFor="noise-cancellation" className="cursor-pointer text-xs font-normal">
                Eliminar ruido
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="noise-and-background-speech-cancellation"
                id="noise-and-background-speech-cancellation"
              />
              <div className="flex flex-1 flex-row items-center gap-2">
                <Label
                  htmlFor="noise-and-background-speech-cancellation"
                  className="flex-1 cursor-pointer text-xs font-normal"
                >
                  Eliminar ruido + conversaciones de fondo
                </Label>
                <div className="relative flex items-center">
                  <div className="flex cursor-pointer items-center">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="flex w-full flex-col rounded-lg pb-4 pl-4 pr-4 pt-4">
        <div className="flex flex-row gap-1">
          <div className="text-xs font-medium leading-normal">Modo de Transcripción</div>
        </div>
        <div className="text-xs text-muted-foreground">
          Balance entre velocidad y precisión.{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
            href="https://docs.retellai.com/build/transcription-mode"
          >
            (Más información)
          </a>
        </div>
        <div className="mt-2">
          <RadioGroup value={transcriptionMode} onValueChange={handleTranscriptionModeChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fast" id="fast" />
              <Label htmlFor="fast" className="cursor-pointer text-xs font-normal">
                Optimizar para velocidad
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="accurate" id="accurate" />
              <div className="flex flex-1 flex-row items-center gap-2">
                <Label htmlFor="accurate" className="flex-1 cursor-pointer text-xs font-normal">
                  Optimizar para precisión
                </Label>
                <div className="relative flex items-center space-x-1">
                  <div className="flex cursor-pointer items-center">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-muted-foreground"
                    >
                      <path
                        d="M7.33141 3.99866C8.18172 3.99865 9.01092 4.26344 9.70385 4.75626C10.3968 5.24907 10.919 5.94545 11.1981 6.74866L11.2481 6.90399L11.2774 7.00066H12.8307C13.2974 7.00063 13.7465 7.17865 14.0865 7.49839C14.4264 7.81813 14.6316 8.25552 14.6601 8.72132L14.6634 8.83332V9.49999C14.6631 9.79255 14.5528 10.0743 14.3545 10.2894C14.1562 10.5045 13.8843 10.6372 13.5927 10.6613L13.4974 10.6653H12.4134L12.5741 11.0547C12.6852 11.3244 12.6911 11.6261 12.5908 11.9C12.4905 12.174 12.2911 12.4004 12.0321 12.5347L11.9407 12.5773C11.8351 12.6207 11.7237 12.6483 11.6101 12.6593L11.4961 12.6653H10.3047C10.1011 12.6652 9.90103 12.6118 9.72442 12.5104C9.54782 12.409 9.40083 12.2631 9.29808 12.0873L9.25008 11.9953L8.89075 11.234L8.92674 11.2293C7.99341 11.3533 7.04875 11.368 6.11275 11.2733L5.78141 11.2353L5.42475 11.9927C5.33052 12.1929 5.18125 12.3623 4.99439 12.4809C4.80752 12.5996 4.59076 12.6626 4.36941 12.6627H3.16675C2.97515 12.6627 2.78649 12.6156 2.61745 12.5254C2.44841 12.4353 2.30419 12.3048 2.19755 12.1457C2.09091 11.9865 2.02513 11.8035 2.00604 11.6129C1.98695 11.4222 2.01512 11.2298 2.08808 11.0527L2.37675 10.3527C2.0572 10.1603 1.79287 9.88853 1.60946 9.56376C1.42605 9.239 1.3298 8.8723 1.33008 8.49932C1.33008 8.3785 1.37384 8.26176 1.45326 8.1707C1.53267 8.07964 1.64238 8.02042 1.76208 8.00399L1.83008 7.99999H3.08341L3.41475 6.90532C3.66908 6.06458 4.18724 5.32801 4.8926 4.80455C5.59795 4.28109 6.45304 3.99853 7.33141 3.99866Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div className="flex cursor-pointer items-center">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="flex w-full flex-col rounded-lg p-4">
        <div className="flex flex-row gap-1">
          <div className="text-xs font-medium leading-normal">
            <div className="flex items-center gap-1">Palabras Clave Potenciadas</div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Proporciona una lista personalizada de palabras clave para ampliar el vocabulario de nuestros modelos.
        </div>
        <div className="mt-2 w-full">
          <Input
            value={boostedKeywords}
            onChange={(e) => setBoostedKeywords(e.target.value)}
            onBlur={handleBoostedKeywordsBlur}
            placeholder="Separar por comas. Ejemplo: Retell,Walmart"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
