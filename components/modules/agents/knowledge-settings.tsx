'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Upload } from 'lucide-react';
import { apiService } from '@/services';

interface KnowledgeBaseSource {
  type: string;
  source_id: string;
  filename: string;
  file_url: string;
}

interface KnowledgeBase {
  knowledge_base_id: string;
  knowledge_base_name: string;
  status: string;
  knowledge_base_sources: KnowledgeBaseSource[];
  enable_auto_refresh: boolean;
  last_refreshed_timestamp: number;
}

interface KnowledgeSettingsProps {
  agent: Agent;
  onAgentUpdate: () => Promise<void>;
}

export function KnowledgeSettings({ agent, onAgentUpdate }: KnowledgeSettingsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKnowledgeBase, setEditingKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [knowledgeBaseName, setKnowledgeBaseName] = useState('');
  const [enableAutoRefresh, setEnableAutoRefresh] = useState(true);
  const [deletingKnowledgeBase, setDeletingKnowledgeBase] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string>('');

  useEffect(() => {
    fetchKnowledgeBases();
  }, []);

  const fetchKnowledgeBases = async () => {
    try {
      setLoading(true);
      const response = await apiService.getKnowledgeBases();
      setKnowledgeBases(response || []);
    } catch (error) {
      console.error('Error fetching knowledge bases:', error);
      setKnowledgeBases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKnowledgeBaseToAgent = async (knowledgeBaseId: string) => {
    try {
      const currentKnowledgeBases = agent.knowledge_base_ids || [];

      if (currentKnowledgeBases.includes(knowledgeBaseId)) {
        console.log('Knowledge base already added to agent');
        return;
      }

      const updatedKnowledgeBases = [...currentKnowledgeBases, knowledgeBaseId];

      await apiService.updateAgent(agent.agent_id, {
        knowledge_base_ids: updatedKnowledgeBases
      });

      await onAgentUpdate();
      setSelectedKnowledgeBase('');
    } catch (error) {
      console.error('Error adding knowledge base to agent:', error);
    }
  };

  const handleEditKnowledgeBase = (kb: KnowledgeBase) => {
    setEditingKnowledgeBase(kb);
    setKnowledgeBaseName(kb.knowledge_base_name);
    setEnableAutoRefresh(kb.enable_auto_refresh);
    setIsDialogOpen(true);
  };

  const handleDeleteKnowledgeBase = async (kbId: string) => {
    setDeletingKnowledgeBase(kbId);
    try {
      await apiService.deleteKnowledgeBase(kbId);
      await fetchKnowledgeBases();
    } catch (error) {
      console.error('Error deleting knowledge base:', error);
    } finally {
      setDeletingKnowledgeBase(null);
    }
  };

  const handleSaveKnowledgeBase = async () => {
    try {
      if (editingKnowledgeBase) {
        await apiService.updateKnowledgeBase(editingKnowledgeBase.knowledge_base_id, {
          knowledge_base_name: knowledgeBaseName,
          enable_auto_refresh: enableAutoRefresh
        });
      } else {
        await apiService.createKnowledgeBase({
          knowledge_base_name: knowledgeBaseName,
          enable_auto_refresh: enableAutoRefresh
        });
      }
      await fetchKnowledgeBases();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving knowledge base:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in_progress':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Lista';
      case 'in_progress':
        return 'Procesando';
      case 'failed':
        return 'Fallida';
      default:
        return status;
    }
  };

  const agentKnowledgeBases = agent.knowledge_base_ids || [];

  const agentKnowledgeBaseObjects = knowledgeBases.filter((kb) => agentKnowledgeBases.includes(kb.knowledge_base_id));

  const availableKnowledgeBases = knowledgeBases.filter((kb) => !agentKnowledgeBases.includes(kb.knowledge_base_id));

  if (loading) {
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
            <div className="flex items-center justify-center">
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
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-normal leading-tight text-foreground">{kb.knowledge_base_name}</div>
              <div className={`text-xs ${getStatusColor(kb.status)}`}>
                {getStatusText(kb.status)} • {kb.knowledge_base_sources?.length || 0} fuentes
              </div>
            </div>
            <div className="ml-auto flex items-center justify-center gap-0.5 p-px">
              <button
                className="cursor-pointer rounded-sm p-px"
                onClick={() => handleEditKnowledgeBase(kb)}
                disabled={deletingKnowledgeBase === kb.knowledge_base_id}
              >
                <div className="flex h-[18px] w-[18px] items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M5.23023 11.7L12.0761 4.85415L11.1216 3.8997L4.27578 10.7455V11.7H5.23023ZM5.78981 13.05H2.92578V10.186L10.6444 2.46735C10.771 2.3408 10.9426 2.26971 11.1216 2.26971C11.3006 2.26971 11.4723 2.3408 11.5989 2.46735L13.5084 4.37692C13.635 4.5035 13.7061 4.67516 13.7061 4.85415C13.7061 5.03313 13.635 5.20479 13.5084 5.33137L5.78981 13.05ZM2.92578 14.4H15.0758V15.75H2.92578V14.4Z"
                      fill="currentColor"
                      className="text-muted-foreground"
                    />
                  </svg>
                </div>
              </button>
              <button
                className="cursor-pointer rounded-sm p-px"
                onClick={() => handleDeleteKnowledgeBase(kb.knowledge_base_id)}
                disabled={deletingKnowledgeBase === kb.knowledge_base_id}
              >
                <div className="flex h-[18px] w-[18px] cursor-pointer items-center justify-center p-0">
                  {deletingKnowledgeBase === kb.knowledge_base_id ? (
                    <Loader2 className="h-[18px] w-[18px] animate-spin text-muted-foreground" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M12.375 4.95H15.75V6.3H14.4V15.075C14.4 15.254 14.3289 15.4257 14.2023 15.5523C14.0757 15.6789 13.904 15.75 13.725 15.75H4.275C4.09598 15.75 3.92429 15.6789 3.7977 15.5523C3.67112 15.4257 3.6 15.254 3.6 15.075V6.3H2.25V4.95H5.625V2.925C5.625 2.74598 5.69612 2.57429 5.8227 2.4477C5.94929 2.32112 6.12098 2.25 6.3 2.25H11.7C11.879 2.25 12.0507 2.32112 12.1773 2.4477C12.3039 2.57429 12.375 2.74598 12.375 2.925V4.95ZM13.05 6.3H4.95V14.4H13.05V6.3ZM6.975 8.325H8.325V12.375H6.975V8.325ZM9.675 8.325H11.025V12.375H9.675V8.325ZM6.975 3.6V4.95H11.025V3.6H6.975Z"
                        fill="currentColor"
                        className="text-muted-foreground"
                      />
                    </svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M9.25 9.25V4.75H10.75V9.25H15.25V10.75H10.75V15.25H9.25V10.75H4.75V9.25H9.25Z"
                  fill="currentColor"
                  className="text-muted-foreground"
                />
              </svg>
              <SelectValue placeholder="Agregar Base de Conocimiento" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {availableKnowledgeBases.map((kb) => (
              <SelectItem key={kb.knowledge_base_id} value={kb.knowledge_base_id}>
                <div className="flex items-center gap-2">
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
                  <div>
                    <div className="font-medium">{kb.knowledge_base_name}</div>
                    <div className={`text-xs ${getStatusColor(kb.status)}`}>
                      {getStatusText(kb.status)} • {kb.knowledge_base_sources?.length || 0} fuentes
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="text-xs text-muted-foreground">No hay bases de conocimiento disponibles para agregar</div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M3.25 14.875V4.75C3.25 4.15326 3.48705 3.58097 3.90901 3.15901C4.33097 2.73705 4.90326 2.5 5.5 2.5H16C16.1989 2.5 16.3897 2.57902 16.5303 2.71967C16.671 2.86032 16.75 3.05109 16.75 3.25V16.75C16.75 16.9489 16.671 17.1397 16.5303 17.2803C16.3897 17.421 16.1989 17.5 16 17.5H5.875C5.17881 17.5 4.51113 17.2234 4.01884 16.7312C3.52656 16.2389 3.25 15.5712 3.25 14.875ZM15.25 16V13.75H5.875C5.57663 13.75 5.29048 13.8685 5.0795 14.0795C4.86853 14.2905 4.75 14.5766 4.75 14.875C4.75 15.1734 4.86853 15.4595 5.0795 15.6705C5.29048 15.8815 5.57663 16 5.875 16H15.25ZM4.75 12.5028C5.10152 12.3358 5.48586 12.2495 5.875 12.25H15.25V4H5.5C5.30109 4 5.11032 4.07902 4.96967 4.21967C4.82902 4.36032 4.75 4.55109 4.75 4.75V12.5028Z"
                  fill="currentColor"
                />
              </svg>
              Editar Base de Conocimiento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Base de Conocimiento</Label>
              <Input
                id="name"
                value={knowledgeBaseName}
                onChange={(e) => setKnowledgeBaseName(e.target.value)}
                placeholder="Ingresa el nombre de la base de conocimiento..."
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="auto-refresh">Actualización Automática</Label>
                <p className="text-xs text-muted-foreground">
                  Actualizar automáticamente el contenido de las fuentes cuando cambien
                </p>
              </div>
              <Switch id="auto-refresh" checked={enableAutoRefresh} onCheckedChange={setEnableAutoRefresh} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveKnowledgeBase} disabled={!knowledgeBaseName.trim()}>
              Actualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
