import { useState } from 'react';
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
  llms: Llm[];
  voices: Voice[];
  loading: boolean;
  defaultVoiceId: string;
}

export function CreateAgentModal({
  open,
  onOpenChange,
  onSuccess,
  llms,
  voices,
  loading: loadingData,
  defaultVoiceId
}: CreateAgentModalProps) {
  const [agentName, setAgentName] = useState('');
  const [selectedLlm, setSelectedLlm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agentName || !selectedLlm) {
      return;
    }

    try {
      setLoading(true);

      const selectedLlmData = llms.find((llm) => llm.llm_id === selectedLlm);

      await apiService.createAgent({
        agent_name: agentName,
        voice_id: defaultVoiceId,
        response_engine: {
          type: 'retell-llm',
          llm_id: selectedLlm,
          version: 0
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || loadingData || !agentName || !selectedLlm}>
              {loading ? 'Creando...' : 'Crear Agente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
