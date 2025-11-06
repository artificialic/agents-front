import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { apiService } from '@/services';

const iconBook = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 20 20"
    fill="none"
    className="text-muted-foreground"
  >
    <path
      d="M3.25 14.875V4.75C3.25 4.15326 3.48705 3.58097 3.90901 3.15901C4.33097 2.73705 4.90326 2.5 5.5 2.5H16C16.1989 2.5 16.3897 2.57902 16.5303 2.71967C16.671 2.86032 16.75 3.05109 16.75 3.25V16.75C16.75 16.9489 16.671 17.1397 16.5303 17.2803C16.3897 17.421 16.1989 17.5 16 17.5H5.875C5.17881 17.5 4.51113 17.2234 4.01884 16.7312C3.52656 16.2389 3.25 15.5712 3.25 14.875ZM15.25 16V13.75H5.875C5.57663 13.75 5.29048 13.8685 5.0795 14.0795C4.86853 14.2905 4.75 14.5766 4.75 14.875C4.75 15.1734 4.86853 15.4595 5.0795 15.6705C5.29048 15.8815 5.57663 16 5.875 16H15.25ZM4.75 12.5028C5.10152 12.3358 5.48586 12.2495 5.875 12.25H15.25V4H5.5C5.30109 4 5.11032 4.07902 4.96967 4.21967C4.82902 4.36032 4.75 4.55109 4.75 4.75V12.5028Z"
      fill="currentColor"
    />
  </svg>
);

const iconDelete = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M12.375 4.95H15.75V6.3H14.4V15.075C14.4 15.254 14.3289 15.4257 14.2023 15.5523C14.0757 15.6789 13.904 15.75 13.725 15.75H4.275C4.09598 15.75 3.92429 15.6789 3.7977 15.5523C3.67112 15.4257 3.6 15.254 3.6 15.075V6.3H2.25V4.95H5.625V2.925C5.625 2.74598 5.69612 2.57429 5.8227 2.4477C5.94929 2.32112 6.12098 2.25 6.3 2.25H11.7C11.879 2.25 12.0507 2.32112 12.1773 2.4477C12.3039 2.57429 12.375 2.74598 12.375 2.925V4.95ZM13.05 6.3H4.95V14.4H13.05V6.3ZM6.975 8.325H8.325V12.375H6.975V8.325ZM9.675 8.325H11.025V12.375H9.675V8.325ZM6.975 3.6V4.95H11.025V3.6H6.975Z"
      fill="currentColor"
      className="text-muted-foreground"
    />
  </svg>
);

const iconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M9.25 9.25V4.75H10.75V9.25H15.25V10.75H10.75V15.25H9.25V10.75H4.75V9.25H9.25Z"
      fill="currentColor"
      className="text-muted-foreground"
    />
  </svg>
);

const iconSettings = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 1.75L17.125 5.875V14.125L10 18.25L2.875 14.125V5.875L10 1.75ZM10 3.48325L4.375 6.73975V13.2603L10 16.5167L15.625 13.2603V6.73975L10 3.48325ZM10 13C9.20435 13 8.44129 12.6839 7.87868 12.1213C7.31607 11.5587 7 10.7956 7 10C7 9.20435 7.31607 8.44129 7.87868 7.87868C8.44129 7.31607 9.20435 7 10 7C10.7956 7 11.5587 7.31607 12.1213 7.87868C12.6839 8.44129 13 9.20435 13 10C13 10.7956 12.6839 11.5587 12.1213 12.1213C11.5587 12.6839 10.7956 13 10 13ZM10 11.5C10.3978 11.5 10.7794 11.342 11.0607 11.0607C11.342 10.7794 11.5 10.3978 11.5 10C11.5 9.60218 11.342 9.22064 11.0607 8.93934C10.7794 8.65804 10.3978 8.5 10 8.5C9.60218 8.5 9.22064 8.65804 8.93934 8.93934C8.65804 9.22064 8.5 9.60218 8.5 10C8.5 10.3978 8.65804 10.7794 8.93934 11.0607C9.22064 11.342 9.60218 11.5 10 11.5Z"
      fill="currentColor"
      className="text-muted-foreground"
    />
  </svg>
);

interface KnowledgeSettingsProps {
  llm: Llm;
  llmId: string;
  onLlmUpdate: () => Promise<void>;
  knowledgeBases: KnowledgeBase[];
  loadingKnowledgeBases: boolean;
  onKnowledgeBasesUpdate: () => Promise<void>;
}

export function KnowledgeSettings({
  llm,
  llmId,
  onLlmUpdate,
  knowledgeBases,
  loadingKnowledgeBases,
  onKnowledgeBasesUpdate
}: KnowledgeSettingsProps) {
  const [deletingKnowledgeBase, setDeletingKnowledgeBase] = useState<string | null>(null);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string>('');
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const [topK, setTopK] = useState<number>(llm.kb_config?.top_k || 4);
  const [filterScore, setFilterScore] = useState<string>((llm.kb_config?.filter_score || 0.95).toFixed(2));
  const [isSaving, setIsSaving] = useState(false);

  const handleAddKnowledgeBaseToAgent = async (knowledgeBaseId: string) => {
    try {
      const currentKnowledgeBases = llm.knowledge_base_ids || [];

      if (currentKnowledgeBases.includes(knowledgeBaseId)) {
        return;
      }

      const updatedKnowledgeBases = [...currentKnowledgeBases, knowledgeBaseId];

      await apiService.updateLlm(llmId, {
        knowledge_base_ids: updatedKnowledgeBases
      });

      await onLlmUpdate();
      setSelectedKnowledgeBase('');
    } catch (error) {}
  };

  const handleDeleteKnowledgeBase = async (kbId: string) => {
    setDeletingKnowledgeBase(kbId);
    try {
      const currentKnowledgeBases = llm.knowledge_base_ids || [];
      const updatedKnowledgeBases = currentKnowledgeBases.filter((id) => id !== kbId);

      await apiService.updateLlm(llmId, {
        knowledge_base_ids: updatedKnowledgeBases
      });

      await onLlmUpdate();
    } catch (error) {
    } finally {
      setDeletingKnowledgeBase(null);
    }
  };

  const handleSaveAdvancedSettings = async () => {
    setIsSaving(true);
    try {
      await apiService.updateLlm(llmId, {
        kb_config: {
          top_k: topK,
          filter_score: parseFloat(filterScore)
        }
      });

      await onLlmUpdate();
      setIsAdvancedSettingsOpen(false);
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelAdvancedSettings = () => {
    setTopK(llm.kb_config?.top_k || 4);
    setFilterScore((llm.kb_config?.filter_score || 0.95).toFixed(2));
    setIsAdvancedSettingsOpen(false);
  };

  const increaseFilterScore = () => {
    const current = parseFloat(filterScore);
    const newValue = Math.min(0.95, current + 0.05);
    setFilterScore(newValue.toFixed(2));
  };

  const decreaseFilterScore = () => {
    const current = parseFloat(filterScore);
    const newValue = Math.max(0, current - 0.05);
    setFilterScore(newValue.toFixed(2));
  };

  const handleFilterScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterScore(value);
  };

  const handleFilterScoreBlur = () => {
    const numValue = parseFloat(filterScore);
    if (isNaN(numValue)) {
      setFilterScore('0.95');
    } else {
      const clamped = Math.min(0.95, Math.max(0, numValue));
      setFilterScore(clamped.toFixed(2));
    }
  };

  const agentKnowledgeBases = llm.knowledge_base_ids || [];

  const agentKnowledgeBaseObjects = knowledgeBases.filter((kb) => agentKnowledgeBases.includes(kb.knowledge_base_id));

  const availableKnowledgeBases = knowledgeBases.filter((kb) => !agentKnowledgeBases.includes(kb.knowledge_base_id));

  if (loadingKnowledgeBases) {
    return (
      <div className="flex items-center justify-center px-7 py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Cargando bases de conocimiento...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start px-7 pb-4 pt-0">
      <div className="text-xs font-normal leading-none text-muted-foreground">
        Agrega bases de conocimiento para proporcionar contexto al agente.
      </div>
      <div className="mt-2 flex w-full flex-col gap-1">
        {agentKnowledgeBaseObjects.map((kb) => (
          <div
            key={kb.knowledge_base_id}
            className="inline-flex h-8 w-full items-center justify-start gap-1 rounded-lg border-none bg-muted/50 p-1.5"
          >
            <div className="flex items-center justify-center">{iconBook()}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-normal leading-tight text-foreground">{kb.knowledge_base_name}</div>
            </div>
            <div className="ml-auto flex items-center justify-center gap-0.5 p-px">
              <button
                className="cursor-pointer rounded-sm p-px"
                onClick={() => handleDeleteKnowledgeBase(kb.knowledge_base_id)}
                disabled={deletingKnowledgeBase === kb.knowledge_base_id}
              >
                <div className="flex h-[18px] w-[18px] cursor-pointer items-center justify-center p-0">
                  {deletingKnowledgeBase === kb.knowledge_base_id ? (
                    <Loader2 className="h-[18px] w-[18px] animate-spin text-muted-foreground" />
                  ) : (
                    iconDelete()
                  )}
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mb-2"></div>

      {availableKnowledgeBases.length > 0 ? (
        <Select value={selectedKnowledgeBase} onValueChange={handleAddKnowledgeBaseToAgent}>
          <SelectTrigger className="h-8 gap-0.5 rounded-lg border-input p-1.5 text-muted-foreground">
            <div className="flex items-center gap-1">
              {iconPlus()}
              <SelectValue placeholder="Agregar Base de Conocimiento" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {availableKnowledgeBases.map((kb) => (
              <SelectItem key={kb.knowledge_base_id} value={kb.knowledge_base_id}>
                <div className="flex items-center gap-2">
                  {iconBook()}
                  <div>
                    <div className="font-medium">{kb.knowledge_base_name}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="text-xs text-muted-foreground">No hay bases de conocimiento disponibles para agregar</div>
      )}

      <div className="mt-4 w-full">
        <div className="mb-2 text-sm font-medium text-foreground">Configuración Avanzada</div>
        <Popover open={isAdvancedSettingsOpen} onOpenChange={setIsAdvancedSettingsOpen}>
          <PopoverTrigger asChild>
            <button className="mt-2 inline-flex h-7 items-center justify-center whitespace-nowrap rounded-lg border border-input bg-background px-1.5 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
              {iconSettings()}
              <div className="ml-1 text-xs font-medium leading-normal text-muted-foreground">
                Ajustar Recuperación de Chunks y Similitud
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="ml-[55px] w-[332px]">
            <div className="flex w-[300px] flex-col gap-1">
              <div>
                <div className="text-sm font-medium leading-normal text-foreground">Chunks a recuperar</div>
                <div className="text-xs font-normal leading-none text-muted-foreground">
                  El número máximo de chunks a recuperar de la KB, rango 1-10.
                </div>
              </div>
              <div className="mt-2">
                <div className="group relative flex items-center">
                  <Slider
                    value={[topK]}
                    onValueChange={(value) => setTopK(value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full cursor-pointer"
                  />
                  <div className="ml-6 flex flex-col text-sm font-medium leading-normal text-foreground">{topK}</div>
                  <div className="absolute bottom-[-20px] left-0 text-xs text-gray-500 opacity-0 transition-opacity group-hover:opacity-100">
                    1
                  </div>
                  <div className="absolute bottom-[-20px] right-4 text-xs text-gray-500 opacity-0 transition-opacity group-hover:opacity-100">
                    10
                  </div>
                </div>
              </div>

              <div className="mt-6 flex w-[300px] flex-col gap-1">
                <div className="text-sm font-medium leading-normal text-foreground">Umbral de Similitud</div>
                <div className="text-xs font-normal leading-none text-muted-foreground">
                  Ajusta qué tan estricto es el sistema al hacer coincidir chunks con el contexto. Una configuración más
                  alta te da menos, pero más similares, coincidencias
                </div>
                <div className="mt-2">
                  <div className="flex h-10 items-center justify-between rounded-lg border border-input p-2 shadow-sm">
                    <button
                      onClick={decreaseFilterScore}
                      className="rounded px-3 py-1 text-lg hover:bg-accent"
                      disabled={parseFloat(filterScore) <= 0}
                    >
                      -
                    </button>
                    <input
                      type="text"
                      className="w-full bg-transparent text-center text-sm font-normal text-foreground outline-none"
                      value={filterScore}
                      onChange={handleFilterScoreChange}
                      onBlur={handleFilterScoreBlur}
                    />
                    <button
                      onClick={increaseFilterScore}
                      className="rounded px-3 py-1 text-lg hover:bg-accent"
                      disabled={parseFloat(filterScore) >= 0.95}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancelAdvancedSettings}
                  disabled={isSaving}
                  className="h-8 rounded-md px-1.5"
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveAdvancedSettings} disabled={isSaving} className="h-8 rounded-md px-2.5">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar'
                  )}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
