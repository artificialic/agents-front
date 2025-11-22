'use client';

import { AgentHeader } from '@/components/modules/agents/agent-header';
import { AgentConfiguration } from '@/components/modules/agents/agent-configuration';
import { SettingsPanel } from '@/components/modules/agents/settings-panel';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiService } from '@/services';
import { Mic, Trash2, Plus } from 'lucide-react';
import { DynamicVariable, dynamicVariablesStorage } from '@/services/dynamicVariables.helper';
import { PhoneIcon, ChatIcon, BracketsIcon } from '@/components/modules/agents/icons';

export default function AgentConfigPage() {
  const params = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [llm, setLlm] = useState<Llm | null>(null);
  const [loading, setLoading] = useState(true);
  const [llms, setLlms] = useState<Llm[]>([]);
  const [loadingLlms, setLoadingLlms] = useState(true);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loadingKnowledgeBases, setLoadingKnowledgeBases] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dynamicVariables, setDynamicVariables] = useState<DynamicVariable[]>([]);

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

        const savedVariables = await dynamicVariablesStorage.load(id);
        setDynamicVariables(savedVariables);
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

  const handlePublish = async () => {
    try {
      const id = params.id as string;
      await apiService.publishAgent(id);
      await refreshAgent();
    } catch (error) {
      console.error('Error publishing agent:', error);
      throw error;
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

  const addVariable = () => {
    setDynamicVariables([...dynamicVariables, { name: '', value: '' }]);
  };

  const removeVariable = (index: number) => {
    setDynamicVariables(dynamicVariables.filter((_, i) => i !== index));
  };

  const updateVariable = (index: number, field: 'name' | 'value', value: string) => {
    const updated = [...dynamicVariables];
    updated[index][field] = value;
    setDynamicVariables(updated);
  };

  const handleSaveDynamicVariables = async () => {
    if (agent) {
      await dynamicVariablesStorage.save(agent.agent_id, dynamicVariables);
    }
    setIsModalOpen(false);
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
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
        onPublish={handlePublish}
      />
      <div className="flex h-full w-full flex-row gap-2">
        <div className="h-full w-8/12 overflow-y-auto">
          <AgentConfiguration
            agent={agent}
            llmId={agent.response_engine.llm_id}
            llms={llms}
            loadingLlms={loadingLlms}
            llm={llm}
            onLlmUpdate={refreshLlm}
          />
        </div>
        <div className="w-4/12">
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
        <div className="hidden w-1/4">
          <div className="flex h-full w-full flex-col rounded-lg bg-white">
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex gap-2">
                <button className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-gray-200">
                  <PhoneIcon />
                  Probar Audio
                </button>
                <button className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-gray-400 hover:bg-gray-50">
                  <ChatIcon />
                  Probar Chat
                </button>
              </div>
              <button
                onClick={handleOpenModal}
                className="rounded-md border border-gray-200 bg-white p-2 hover:bg-gray-50"
              >
                <BracketsIcon />
              </button>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center space-y-4 p-6">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex max-h-[700px] w-[500px] flex-col rounded-lg border bg-white p-4 shadow-md">
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="w-full">
                <div className="inline-flex h-[34px] items-start justify-start gap-6 pb-1">
                  <div className="flex cursor-pointer items-center justify-center gap-1.5">
                    <div className="text-center text-sm font-medium leading-tight text-gray-900">
                      Variables Dinámicas
                    </div>
                  </div>
                  <div className="flex cursor-pointer items-center justify-center gap-1.5">
                    <div className="text-center text-sm font-medium leading-tight text-gray-400">
                      Mocks de Funciones Personalizadas
                    </div>
                  </div>
                </div>

                <div className="mb-2 mt-0 h-[1px] w-full shrink-0 bg-border" />

                <div className="flex flex-col pb-4">
                  <div className="overflow-y-auto">
                    <div className="mb-3 text-xs font-normal leading-none text-gray-500">
                      Establecer variables dinámicas para pruebas de audio y LLM del dashboard
                    </div>

                    <div className="space-y-2">
                      <div className="flex w-[calc(100%-16px)] items-center space-x-0 font-semibold">
                        <div className="inline-flex h-9 w-1/2 items-start justify-start gap-2.5 bg-gray-50 px-3 py-2">
                          <div className="flex h-5 shrink grow basis-0 items-center justify-start gap-0.5">
                            <div className="text-sm font-normal leading-tight text-gray-500">Nombre de Variable</div>
                          </div>
                        </div>
                        <div className="inline-flex h-9 w-1/2 items-start justify-start gap-2.5 bg-gray-50 px-3 py-2">
                          <div className="flex h-5 shrink grow basis-0 items-center justify-start gap-0.5">
                            <div className="text-sm font-normal leading-tight text-gray-500">Valor de Prueba</div>
                          </div>
                        </div>
                        <div className="w-8"></div>
                      </div>

                      {dynamicVariables.map((variable, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            className="flex h-10 w-full flex-1 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Ingrese el nombre de la variable"
                            value={variable.name}
                            onChange={(e) => updateVariable(index, 'name', e.target.value)}
                          />
                          <input
                            className="flex h-10 w-full flex-1 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Ingrese el valor"
                            value={variable.value}
                            onChange={(e) => updateVariable(index, 'value', e.target.value)}
                          />
                          <button
                            onClick={() => removeVariable(index)}
                            className="inline-flex h-9 w-10 items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={addVariable}
                        className="inline-flex h-8 items-center justify-center gap-0.5 whitespace-nowrap rounded-lg border border-input bg-background p-1.5 text-sm font-medium text-gray-500 ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                      >
                        <Plus className="h-5 w-5" />
                        <div className="px-1 text-sm font-medium leading-normal text-gray-900">Agregar</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2 border-t pt-4">
              <button
                onClick={handleCancelModal}
                className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveDynamicVariables}
                className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
