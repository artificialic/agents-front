import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CreateAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: { agentType: AgentType; agentName: string }) => void;
  loading: boolean;
}

type AgentType = 'single-prompt' | 'multi-prompt';

export function CreateAgentModal({ open, onOpenChange, onCreate, loading: loadingData }: CreateAgentModalProps) {
  const [selectedAgentType, setSelectedAgentType] = useState<AgentType>('single-prompt');

  const agentTypes = [
    {
      id: 'single-prompt' as AgentType,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M7.75 3.25V4.75H5.5V15.25H7.75V16.75H4V3.25H7.75ZM12.25 3.25H16V16.75H12.25V15.25H14.5V4.75H12.25V3.25Z"
            fill="#525866"
          />
        </svg>
      ),
      title: 'Agente de Prompt Único',
      description: 'Para conversaciones simples y libres.'
    },
    {
      id: 'multi-prompt' as AgentType,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M12.25 3.25C12.664 3.25 13 3.586 13 4V7C13 7.414 12.664 7.75 12.25 7.75H10.75V9.25H13.75C14.164 9.25 14.5 9.586 14.5 10V12.25H16C16.414 12.25 16.75 12.586 16.75 13V16C16.75 16.414 16.414 16.75 16 16.75H11.5C11.086 16.75 10.75 16.414 10.75 16V13C10.75 12.586 11.086 12.25 11.5 12.25H13V10.75H7V12.25H8.5C8.914 12.25 9.25 12.586 9.25 13V16C9.25 16.414 8.914 16.75 8.5 16.75H4C3.586 16.75 3.25 16.414 3.25 16V13C3.25 12.586 3.586 12.25 4 12.25H5.5V10C5.5 9.586 5.836 9.25 6.25 9.25H9.25V7.75H7.75C7.336 7.75 7 7.414 7 7V4C7 3.586 7.336 3.25 7.75 3.25H12.25ZM7.75 13.75H4.75V15.25H7.75V13.75ZM15.25 13.75H12.25V15.25H15.25V13.75ZM11.5 4.75H8.5V6.25H11.5V4.75Z"
            fill="#525866"
          />
        </svg>
      ),
      title: 'Agente Multi-Prompt',
      description: 'Para conversaciones flexibles con flujos estructurados.'
    }
  ];

  const handleCreate = () => {
    const agentName = selectedAgentType === 'single-prompt' ? 'Agente de Prompt Único' : 'Agente Multi-Estado';
    onCreate({
      agentType: selectedAgentType,
      agentName
    });
    resetForm();
  };

  const resetForm = () => {
    setSelectedAgentType('single-prompt');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-[600px] p-0">
        <div className="flex h-full max-h-[80vh] flex-col">
          <DialogHeader className="border-b px-5 py-4">
            <DialogTitle className="text-lg font-medium leading-normal">Crear Agente</DialogTitle>
          </DialogHeader>

          <div
            className="flex flex-grow flex-col gap-6 overflow-y-auto px-5 py-4 pb-2"
            style={{ scrollbarWidth: 'none' }}
          >
            <div className="flex flex-col gap-3">
              <div className="text-sm font-medium leading-normal">Tipo de Agente</div>
              <div className="grid grid-cols-2 gap-2">
                {agentTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setSelectedAgentType(type.id)}
                    className={`flex flex-1 cursor-pointer flex-row items-center gap-3 rounded-lg px-4 py-2.5 outline outline-1 transition-colors ${
                      selectedAgentType === type.id ? 'bg-primary/5 outline-primary' : 'outline-border hover:bg-accent'
                    }`}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">{type.icon}</div>
                    <div className="flex flex-grow flex-col gap-1">
                      <div className="text-sm font-medium leading-normal">{type.title}</div>
                      <div className="text-xs font-normal leading-none text-muted-foreground">{type.description}</div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10" cy="10" r="7.5" fill="white" stroke="currentColor" />
                      {selectedAgentType === type.id && <circle cx="10" cy="10" r="4" fill="currentColor" />}
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-row justify-end gap-3 border-t px-5 py-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loadingData}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={loadingData}>
              {loadingData ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
