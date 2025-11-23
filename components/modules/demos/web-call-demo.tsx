'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';
import { apiService } from '@/services';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, PhoneOff } from 'lucide-react';
import { AudioVisualizer } from './audio-visualizer';
import { TranscriptDisplay } from './transcript-display';
import { CallHistory } from './call-history';

interface WebCallDemoProps {
  agents: Agent[];
}

interface TranscriptEntry {
  role: 'agent' | 'user';
  content: string;
  timestamp: number;
  id: string;
}

export function WebCallDemo({ agents }: WebCallDemoProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [callHistory, setCallHistory] = useState<TranscriptEntry[][]>([]);
  const [error, setError] = useState<string>('');

  const retellWebClient = useRef<RetellWebClient | null>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    const client = new RetellWebClient();
    retellWebClient.current = client;

    client.on('call_started', () => {
      console.log('call started');
      setIsCallActive(true);
      setIsConnecting(false);
      setError('');
    });

    client.on('call_ended', () => {
      console.log('call ended');
      setIsCallActive(false);
      setIsAgentSpeaking(false);
      setCallHistory((prev) => {
        if (transcriptRef.current.length > 0) {
          return [...prev, transcriptRef.current];
        }
        return prev;
      });
      setTranscript([]);
    });

    client.on('agent_start_talking', () => {
      setIsAgentSpeaking(true);
    });

    client.on('agent_stop_talking', () => {
      setIsAgentSpeaking(false);
    });

    client.on('update', (update) => {
      if (update.transcript && update.transcript.length > 0) {
        const newEntries: TranscriptEntry[] = update.transcript.map((item: any, index: number) => ({
          role: item.role,
          content: item.content,
          timestamp: Date.now(),
          id: `${item.role}-${Date.now()}-${index}`
        }));
        setTranscript(newEntries);
      }
    });

    client.on('metadata', (metadata) => {
      console.log('metadata:', metadata);
    });

    client.on('error', (err) => {
      console.error('An error occurred:', err);
      setError('Error en la llamada: ' + (err.message || 'Error desconocido'));
      setIsCallActive(false);
      setIsConnecting(false);
      client.stopCall();
    });

    return () => {
      client.stopCall();
    };
  }, []);

  const startCall = async () => {
    if (!selectedAgentId) {
      setError('Por favor selecciona un agente');
      return;
    }

    try {
      setIsConnecting(true);
      setError('');

      const response = await apiService.createWebCall({
        agent_id: selectedAgentId
      });

      if (response?.access_token && retellWebClient.current) {
        await retellWebClient.current.startCall({
          accessToken: response.access_token,
          sampleRate: 24000,
          emitRawAudioSamples: false
        });
      }
    } catch (err: any) {
      console.error('Error starting call:', err);
      setError('Error al iniciar la llamada: ' + (err.message || 'Error desconocido'));
      setIsConnecting(false);
    }
  };

  const stopCall = () => {
    if (retellWebClient.current) {
      retellWebClient.current.stopCall();
    }
  };

  const selectedAgent = agents.find((agent) => agent.agent_id === selectedAgentId);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Seleccionar Agente</label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId} disabled={isCallActive}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecciona un agente para probar" />
                </SelectTrigger>
                <SelectContent className="max-h-80 overflow-y-auto">
                  {agents.map((agent) => (
                    <SelectItem key={agent.agent_id} value={agent.agent_id}>
                      {agent.agent_name || agent.agent_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAgent && (
              <div className="rounded-md bg-muted p-3 text-sm">
                <p className="font-medium">{selectedAgent.agent_name}</p>
                <p className="text-muted-foreground">ID: {selectedAgent.agent_id}</p>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              {!isCallActive && !isConnecting && (
                <Button onClick={startCall} disabled={!selectedAgentId} className="flex-1">
                  <Phone className="mr-2 h-4 w-4" />
                  Iniciar Llamada
                </Button>
              )}

              {isConnecting && (
                <Button disabled className="flex-1">
                  Conectando...
                </Button>
              )}

              {isCallActive && (
                <Button onClick={stopCall} variant="destructive" className="flex-1">
                  <PhoneOff className="mr-2 h-4 w-4" />
                  Finalizar Llamada
                </Button>
              )}
            </div>
          </div>
        </div>

        <AudioVisualizer isActive={isCallActive} isSpeaking={isAgentSpeaking} />

        <TranscriptDisplay transcript={transcript} />
      </div>

      <div className="lg:col-span-1">
        <CallHistory history={callHistory} />
      </div>
    </div>
  );
}
