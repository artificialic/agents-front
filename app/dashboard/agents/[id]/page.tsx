'use client';

import { AgentHeader } from '@/components/modules/agents/agent-header';
import { AgentConfiguration } from '@/components/modules/agents/agent-configuration';
import { SettingsPanel } from '@/components/modules/agents/settings-panel';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiService } from '@/services';
import { Mic } from 'lucide-react';

export default function AgentConfigPage() {
  const params = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [llm, setLlm] = useState<Llm | null>(null);
  const [loading, setLoading] = useState(true);
  const [llms, setLlms] = useState<Llm[]>([]);
  const [loadingLlms, setLoadingLlms] = useState(true);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loadingKnowledgeBases, setLoadingKnowledgeBases] = useState(true);

  useEffect(() => {
    const fetchLlms = async () => {
      try {
        setLoadingLlms(true);
        const llmsResponse = await apiService.getLlms();

        const llmMap = new Map<string, Llm>();
        llmsResponse.forEach((llm: Llm) => {
          const existing = llmMap.get(llm.model);
          if (!existing) {
            llmMap.set(llm.model, llm);
          }
        });

        setLlms(Array.from(llmMap.values()));
      } catch (error) {
        console.error('Error fetching LLMs:', error);
      } finally {
        setLoadingLlms(false);
      }
    };

    fetchLlms();
  }, []);

  useEffect(() => {
    const fetchKnowledgeBases = async () => {
      try {
        setLoadingKnowledgeBases(true);
        const response = await apiService.getKnowledgeBases();
        setKnowledgeBases(response || []);
      } catch (error) {
        console.error('Error fetching knowledge bases:', error);
        setKnowledgeBases([]);
      } finally {
        setLoadingKnowledgeBases(false);
      }
    };

    fetchKnowledgeBases();
  }, []);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const id = params.id as string;
        const agentResponse = await apiService.getAgent(id);
        setAgent(agentResponse);

        const llmResponse = await apiService.getLlm(agentResponse.response_engine.llm_id);
        setLlm(llmResponse);
      } catch (error) {
        console.error('Error fetching agent:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAgent();
    }
  }, [params.id]);

  const refreshAgent = async () => {
    try {
      const id = params.id as string;
      const response = await apiService.getAgent(id);
      setAgent(response);
    } catch (error) {
      console.error('Error refreshing agent:', error);
    }
  };

  const refreshLlm = async () => {
    try {
      if (agent) {
        const response = await apiService.getLlm(agent.response_engine.llm_id);
        setLlm(response);
      }
    } catch (error) {
      console.error('Error refreshing LLM:', error);
    }
  };

  const refreshKnowledgeBases = async () => {
    try {
      const response = await apiService.getKnowledgeBases();
      setKnowledgeBases(response || []);
    } catch (error) {
      console.error('Error refreshing knowledge bases:', error);
      setKnowledgeBases([]);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando agente...</p>
      </div>
    );
  }

  if (!agent || !llm) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Agente no encontrado</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <AgentHeader
        agent={agent}
        agentId={agent.agent_id}
        llmId={agent.response_engine.llm_id}
        onAgentUpdate={refreshAgent}
      />
      <div className="flex h-full w-full flex-row gap-2">
        <div className="h-full w-1/2 overflow-y-auto">
          <AgentConfiguration
            agent={agent}
            llmId={agent.response_engine.llm_id}
            llms={llms}
            loadingLlms={loadingLlms}
          />
        </div>
        <div className="w-1/4">
          <SettingsPanel
            agent={agent}
            llm={llm}
            onLlmUpdate={refreshLlm}
            onAgentUpdate={refreshAgent}
            knowledgeBases={knowledgeBases}
            loadingKnowledgeBases={loadingKnowledgeBases}
            onKnowledgeBasesUpdate={refreshKnowledgeBases}
            llms={llms}
            loadingLlms={loadingLlms}
          />
        </div>
        <div className="w-1/4">
          <div className="flex h-full w-full flex-col items-center justify-center space-y-4 rounded-lg bg-white p-6">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                <Mic className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="absolute inset-0 animate-ping rounded-full border-2 border-primary/20" />
            </div>
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium">Prueba tu agente</p>
              <p className="text-xs text-muted-foreground">Haz clic para comenzar a probar</p>
            </div>
            <button className="h-11 w-full rounded-md bg-primary px-8 text-base font-medium text-primary-foreground hover:bg-primary/90">
              Probar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
