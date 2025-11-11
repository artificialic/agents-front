// @ts-nocheck
'use client';

import { AgentsTable } from '@/components/modules/agents/agents-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services';
import { CreateAgentModal } from '@/components/modules/agents/create-agent-modal';
import { CustomAlertDialog } from '@/components/custom-alert-dialog';

interface AgentLocal {
  id: string;
  name: string;
  type: 'Prompt Único' | 'Multi Prompt';
  voice: {
    name: string;
    avatar?: string;
  };
  phone?: string;
  editedBy: string;
}

interface Voice {
  voice_id: string;
  voice_name: string;
  avatar_url?: string;
  provider: string;
}

export default function AgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<AgentLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [agentsResponse, voicesResponse, phoneNumbersResponse, llmsResponse] = await Promise.all([
        apiService.getAgents(),
        apiService.getVoices(),
        apiService.getPhoneNumbers().catch(() => []),
        apiService.getLlms()
      ]);

      const agentMap = new Map<string, Agent>();
      agentsResponse.forEach((agent: Agent) => {
        const existing = agentMap.get(agent.agent_id);
        if (!existing || agent.version > existing.version) {
          agentMap.set(agent.agent_id, agent);
        }
      });

      const llmMap = new Map<string, Llm>();
      llmsResponse.forEach((llm: Llm) => {
        const existing = llmMap.get(llm.model);
        if (!existing || llm.version > existing.version) {
          llmMap.set(llm.model, llm);
        }
      });

      const mappedAgents: AgentLocal[] = Array.from(agentMap.values()).map((agent: Agent) => {
        const voice = voicesResponse.find((v: Voice) => v.voice_id === agent.voice_id);
        const phoneNumber = phoneNumbersResponse.find((p: any) => p.outbound_agent_id === agent.agent_id);
        const agentLlm = llmsResponse.find((llm: Llm) => llm.llm_id === agent.response_engine.llm_id);

        return {
          id: agent.agent_id,
          name: agent.agent_name,
          type: agentLlm?.states !== undefined ? 'Multi Prompt' : 'Prompt Único',
          voice: {
            name: voice ? voice.voice_name : agent.voice_id.replace('11labs-', ''),
            avatar: voice?.avatar_url || '/placeholder-user.jpg'
          },
          phone: phoneNumber?.phone_number || undefined,
          editedBy: new Date(agent.last_modification_timestamp).toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })
        };
      });

      setAgents(mappedAgents);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentClick = (agentId: string) => {
    router.push(`/dashboard/agents/${agentId}`);
  };

  const handleCreateAgent = async (data: { agentType: string; agentName: string }) => {
    try {
      const llmPayload: any = {
        begin_message: '',
        general_tools: [
          {
            type: 'end_call',
            name: 'end_call',
            description:
              'Finaliza la llamada cuando el usuario tenga que irse (como dice adiós) o se te indique que lo hagas.'
          }
        ],
        model: 'gpt-4.1'
      };

      if (data.agentType === 'multi-prompt') {
        llmPayload.states = [];
      }

      const llm = await apiService.createLlm(llmPayload);

      await apiService.createAgent({
        agent_name: data.agentName,
        voice_id: '11labs-Cimo',
        interruption_sensitivity: 0.9,
        response_engine: {
          type: 'retell-llm',
          llm_id: llm.llm_id
        },
        normalize_for_speech: true,
        denoising_mode: 'noise-and-background-speech-cancellation',
        stt_mode: 'accurate'
      });

      setIsCreateModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating agent:', error);
    }
  };

  const handleDeleteClick = (agentId: string, agentName: string) => {
    setAgentToDelete({ id: agentId, name: agentName });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!agentToDelete) return;

    try {
      setDeleting(true);
      await apiService.deleteAgent(agentToDelete.id);
      setIsDeleteModalOpen(false);
      setAgentToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting agent:', error);
    } finally {
      setDeleting(false);
    }
  };

  const filteredAgents = agents.filter((agent) => agent.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-6">
          <h1 className="text-2xl font-semibold">Todos los Agentes</h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="w-[300px] pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>Crear un Agente</Button>
          </div>
        </div>
      </div>
      <div className="p-6">
        <AgentsTable
          agents={filteredAgents}
          loading={loading}
          onAgentClick={handleAgentClick}
          onDeleteClick={handleDeleteClick}
        />
      </div>

      <CreateAgentModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreate={handleCreateAgent}
        loading={loading}
      />

      <CustomAlertDialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Eliminar agente"
        description={`¿Estás seguro de que quieres eliminar todas las versiones de "${agentToDelete?.name}"?`}
        actionLabel="Eliminar"
        cancelLabel="Cancelar"
        onAction={handleDeleteConfirm}
        isLoading={deleting}
        variant="error"
      />
    </div>
  );
}
