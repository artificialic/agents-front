'use client';

import { AgentHeader } from '@/components/modules/agents/agent-header';
import { AgentConfiguration } from '@/components/modules/agents/agent-configuration';
import { SettingsPanel } from '@/components/modules/agents/settings-panel';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiService } from '@/services';
import { Mic, Trash2, Plus } from 'lucide-react';
import { DynamicVariable, dynamicVariablesStorage } from '@/services/dynamicVariables.helper';

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 20" fill="none">
    <path
      d="M8.5245 9.0115C9.22825 10.2479 10.2521 11.2717 11.4885 11.9755L12.1515 11.047C12.2581 10.8977 12.4158 10.7927 12.5946 10.7517C12.7734 10.7108 12.9611 10.7369 13.122 10.825C14.1827 11.4047 15.3542 11.7533 16.5592 11.848C16.7473 11.8629 16.9229 11.9482 17.0509 12.0867C17.1789 12.2253 17.25 12.4071 17.25 12.5958V15.9423C17.25 16.1279 17.1812 16.3071 17.0568 16.4449C16.9324 16.5828 16.7612 16.6696 16.5765 16.6885C16.179 16.7297 15.7785 16.75 15.375 16.75C8.955 16.75 3.75 11.545 3.75 5.125C3.75 4.7215 3.77025 4.321 3.8115 3.9235C3.83044 3.73877 3.91724 3.56764 4.05509 3.44323C4.19295 3.31881 4.37205 3.24996 4.55775 3.25H7.90425C8.09292 3.24998 8.27467 3.32106 8.41326 3.44909C8.55185 3.57711 8.63709 3.75267 8.652 3.94075C8.74667 5.14584 9.09531 6.31726 9.675 7.378C9.7631 7.53892 9.78916 7.72656 9.74825 7.9054C9.70734 8.08424 9.6023 8.24188 9.453 8.3485L8.5245 9.0115ZM6.633 8.51875L8.058 7.501C7.65359 6.62807 7.37651 5.70163 7.23525 4.75H5.2575C5.253 4.8745 5.25075 4.99975 5.25075 5.125C5.25 10.717 9.783 15.25 15.375 15.25C15.5002 15.25 15.6255 15.2478 15.75 15.2425V13.2648C14.7984 13.1235 13.8719 12.8464 12.999 12.442L11.9813 13.867C11.5715 13.7078 11.1735 13.5198 10.7902 13.3045L10.7468 13.2797C9.27568 12.4425 8.05746 11.2243 7.22025 9.75325L7.1955 9.70975C6.98018 9.3265 6.79221 8.9285 6.633 8.51875Z"
      fill="currentColor"
    />
  </svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 20" fill="none">
    <path
      d="M9 3.25H12C13.5913 3.25 15.1174 3.88214 16.2426 5.00736C17.3679 6.13258 18 7.6587 18 9.25C18 10.8413 17.3679 12.3674 16.2426 13.4926C15.1174 14.6179 13.5913 15.25 12 15.25V17.875C8.25 16.375 3 14.125 3 9.25C3 7.6587 3.63214 6.13258 4.75736 5.00736C5.88258 3.88214 7.4087 3.25 9 3.25ZM10.5 13.75H12C12.5909 13.75 13.1761 13.6336 13.7221 13.4075C14.268 13.1813 14.7641 12.8498 15.182 12.432C15.5998 12.0141 15.9313 11.518 16.1575 10.9721C16.3836 10.4261 16.5 9.84095 16.5 9.25C16.5 8.65905 16.3836 8.07389 16.1575 7.52792C15.9313 6.98196 15.5998 6.48588 15.182 6.06802C14.7641 5.65016 14.268 5.31869 13.7221 5.09254C13.1761 4.8664 12.5909 4.75 12 4.75H9C7.80653 4.75 6.66193 5.22411 5.81802 6.06802C4.97411 6.91193 4.5 8.05653 4.5 9.25C4.5 11.9575 6.3465 13.7245 10.5 15.61V13.75Z"
      fill="currentColor"
    />
  </svg>
);

const BracketsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M4 14.5V11.725C4 11.4266 3.88147 11.1405 3.6705 10.9295C3.45952 10.7185 3.17337 10.6 2.875 10.6H2.5V9.4H2.875C3.02274 9.4 3.16903 9.3709 3.30552 9.31436C3.44201 9.25783 3.56603 9.17496 3.6705 9.0705C3.77496 8.96603 3.85783 8.84201 3.91436 8.70552C3.9709 8.56903 4 8.42274 4 8.275V5.5C4 4.90326 4.23705 4.33097 4.65901 3.90901C5.08097 3.48705 5.65326 3.25 6.25 3.25H7V4.75H6.25C6.05109 4.75 5.86032 4.82902 5.71967 4.96967C5.57902 5.11032 5.5 5.30109 5.5 5.5V8.575C5.50008 8.89076 5.40051 9.19849 5.21548 9.45435C5.03045 9.71022 4.76939 9.90117 4.4695 10C4.76939 10.0988 5.03045 10.2898 5.21548 10.5456C5.40051 10.8015 5.50008 11.1092 5.5 11.425V14.5C5.5 14.6989 5.57902 14.8897 5.71967 15.0303C5.86032 15.171 6.05109 15.25 6.25 15.25H7V16.75H6.25C5.65326 16.75 5.08097 16.5129 4.65901 16.091C4.23705 15.669 4 15.0967 4 14.5ZM16 11.725V14.5C16 15.0967 15.7629 15.669 15.341 16.091C14.919 16.5129 14.3467 16.75 13.75 16.75H13V15.25H13.75C13.9489 15.25 14.1397 15.171 14.2803 15.0303C14.421 14.8897 14.5 14.6989 14.5 14.5V11.425C14.4999 11.1092 14.5995 10.8015 14.7845 10.5456C14.9696 10.2898 15.2306 10.0988 15.5305 10C15.2306 9.90117 14.9696 9.71022 14.7845 9.45435C14.5995 9.19849 14.4999 8.89076 14.5 8.575V5.5C14.5 5.30109 14.421 5.11032 14.2803 4.96967C14.1397 4.82902 13.9489 4.75 13.75 4.75H13V3.25H13.75C14.3467 3.25 14.919 3.48705 15.341 3.90901C15.7629 4.33097 16 4.90326 16 5.5V8.275C16 8.57337 16.1185 8.85952 16.3295 9.0705C16.5405 9.28147 16.8266 9.4 17.125 9.4H17.5V10.6H17.125C16.8266 10.6 16.5405 10.7185 16.3295 10.9295C16.1185 11.1405 16 11.4266 16 11.725Z"
      fill="currentColor"
    />
  </svg>
);

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
