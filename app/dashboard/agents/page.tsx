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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [agentsResponse, voicesResponse, phoneNumbersResponse] = await Promise.all([
        apiService.getAgents(),
        apiService.getVoices(),
        apiService.getPhoneNumbers().catch(() => [])
      ]);

      const agentMap = new Map<string, Agent>();
      agentsResponse.forEach((agent: Agent) => {
        const existing = agentMap.get(agent.agent_id);
        if (!existing || agent.version > existing.version) {
          agentMap.set(agent.agent_id, agent);
        }
      });

      const mappedAgents: AgentLocal[] = Array.from(agentMap.values()).map((agent: Agent) => {
        const voice = voicesResponse.find((v: Voice) => v.voice_id === agent.voice_id);
        const phoneNumber = phoneNumbersResponse.find((p: any) => p.outbound_agent_id === agent.agent_id);

        return {
          id: agent.agent_id,
          name: agent.agent_name,
          type: agent.response_engine.type === 'retell-llm' ? 'Prompt Único' : 'Multi Prompt',
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

  const handleCreateSuccess = () => {
    fetchData();
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
        <AgentsTable agents={filteredAgents} loading={loading} onAgentClick={handleAgentClick} />
      </div>

      <CreateAgentModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} onSuccess={handleCreateSuccess} />
    </div>
  );
}
