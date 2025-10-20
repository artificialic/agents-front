// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiService } from '@/services';

interface CreateAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateAgentModal({ open, onOpenChange, onSuccess }: CreateAgentModalProps) {
  const [agentName, setAgentName] = useState('');
  const [selectedLlm, setSelectedLlm] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [llms, setLlms] = useState<Llm[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [llmsResponse, voicesResponse] = await Promise.all([apiService.getLlms(), apiService.getVoices()]);

      const llmMap = new Map<string, Llm>();
      llmsResponse.forEach((llm: Llm) => {
        const existing = llmMap.get(llm.model);
        if (!existing || llm.version > existing.version) {
          llmMap.set(llm.model, llm);
        }
      });

      setLlms(Array.from(llmMap.values()));
      setVoices(voicesResponse || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agentName || !selectedLlm || !selectedVoice) {
      return;
    }

    try {
      setLoading(true);

      const selectedLlmData = llms.find((llm) => llm.llm_id === selectedLlm);

      await apiService.createAgent({
        agent_name: agentName,
        voice_id: selectedVoice,
        response_engine: {
          type: 'retell-llm',
          llm_id: selectedLlm,
          version: selectedLlmData?.version || 0
        }
      });

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAgentName('');
    setSelectedLlm('');
    setSelectedVoice('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear un Agente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del Agente</Label>
              <Input
                id="name"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Ingrese el nombre del agente"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="llm">LLM</Label>
              <Select value={selectedLlm} onValueChange={setSelectedLlm} required>
                <SelectTrigger id="llm">
                  <SelectValue placeholder="Seleccione un LLM" />
                </SelectTrigger>
                <SelectContent>
                  {loadingData ? (
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

            <div className="grid gap-2">
              <Label htmlFor="voice">Voz</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice} required>
                <SelectTrigger id="voice">
                  <SelectValue placeholder="Seleccione una voz" />
                </SelectTrigger>
                <SelectContent>
                  {loadingData ? (
                    <SelectItem value="loading" disabled>
                      Cargando...
                    </SelectItem>
                  ) : (
                    voices.map((voice) => (
                      <SelectItem key={voice.voice_id} value={voice.voice_id}>
                        {voice.voice_name} ({voice.provider})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || loadingData || !agentName || !selectedLlm || !selectedVoice}>
              {loading ? 'Creando...' : 'Crear Agente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
