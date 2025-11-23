'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Pencil, MoreHorizontal, RotateCcw, Copy } from 'lucide-react';
import { apiService } from '@/services';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { copyToClipboard } from '@/utils';

interface AgentHeaderProps {
  agent: Agent;
  agentId: string;
  llmId: string;
  onAgentUpdate: () => Promise<void>;
  onPublish: () => Promise<void>;
  onVersionChange?: (version: number) => Promise<void>;
}

export function AgentHeader({ agent, agentId, llmId, onAgentUpdate, onPublish, onVersionChange }: AgentHeaderProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(agent.agent_name || '');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [inboundPhone, setInboundPhone] = useState(false);
  const [outboundPhone, setOutboundPhone] = useState(false);
  const [versions, setVersions] = useState<Agent[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number>(agent.version);
  const [loadingVersions, setLoadingVersions] = useState(false);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoadingVersions(true);
        const versionsData = await apiService.getAgentVersions(agentId);
        setVersions(versionsData.sort((a, b) => b.version - a.version));
      } catch (error) {
        console.error('Error fetching agent versions:', error);
      } finally {
        setLoadingVersions(false);
      }
    };

    fetchVersions();
  }, [agentId]);

  useEffect(() => {
    setSelectedVersion(agent.version);
  }, [agent.version]);

  const handleNameClick = () => {
    setIsEditing(true);
    setEditedName(agent.agent_name || '');
  };

  const handleNameBlur = async () => {
    if (editedName !== agent.agent_name && editedName.trim() !== '') {
      try {
        await apiService.updateAgent(agent.agent_id, { agent_name: editedName });
        await onAgentUpdate();
      } catch (error) {
        console.error('Error updating agent name:', error);
        setEditedName(agent.agent_name || '');
      }
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleBackClick = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard/agents/');
    }
  };

  const handlePublishClick = () => {
    setIsPublishModalOpen(true);
  };

  const handlePublishConfirm = async () => {
    try {
      await onPublish();
      setIsPublishModalOpen(false);
      setVersionName('');
      setInboundPhone(false);
      setOutboundPhone(false);
    } catch (error) {
      console.error('Error publishing agent:', error);
    }
  };

  const handlePublishCancel = () => {
    setIsPublishModalOpen(false);
    setVersionName('');
    setInboundPhone(false);
    setOutboundPhone(false);
  };

  const handleVersionChange = async (value: string) => {
    const version = parseInt(value);
    setSelectedVersion(version);
    if (onVersionChange) {
      await onVersionChange(version);
    }
  };

  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBackClick}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onBlur={handleNameBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="h-8 text-xl font-semibold"
                  />
                ) : (
                  <h1
                    className="cursor-pointer text-xl font-semibold transition-colors hover:text-muted-foreground"
                    onClick={handleNameClick}
                  >
                    {agent.agent_name}
                  </h1>
                )}
                <button className="text-muted-foreground hover:text-foreground" onClick={handleNameClick}>
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  ID de Agente: {agentId}
                  <button onClick={() => copyToClipboard(agentId)} className="hover:text-foreground" title="Copiar ID">
                    <Copy className="h-3 w-3" />
                  </button>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  ID de LLM: {llmId}
                  <button onClick={() => copyToClipboard(llmId)} className="hover:text-foreground" title="Copiar ID">
                    <Copy className="h-3 w-3" />
                  </button>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <RotateCcw className="h-4 w-4" />
            </Button>
            {versions.length > 0 && (
              <Select value={selectedVersion.toString()} onValueChange={handleVersionChange} disabled={loadingVersions}>
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version.version} value={version.version.toString()}>
                      {`Versión ${version.version}${version.is_published ? ' (Publicada)' : ''}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button size="sm" className="bg-black text-white hover:bg-black/90" onClick={handlePublishClick}>
              Publicar
            </Button>
          </div>
        </div>
      </header>

      <Dialog open={isPublishModalOpen} onOpenChange={setIsPublishModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Publicar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="version-name" className="text-sm font-medium">
                Nombre de la versión
              </label>
              <Input
                id="version-name"
                placeholder="V0 - agrega un nombre descriptivo (opcional)"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Seleccionar Número de Teléfono</label>
              <p className="text-sm text-muted-foreground">
                El número de teléfono es opcional. Puedes continuar sin él.
              </p>
              <div className="mt-3 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inbound"
                    checked={inboundPhone}
                    onCheckedChange={(checked) => setInboundPhone(checked as boolean)}
                  />
                  <label
                    htmlFor="inbound"
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Número de teléfono entrante
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="outbound"
                    checked={outboundPhone}
                    onCheckedChange={(checked) => setOutboundPhone(checked as boolean)}
                  />
                  <label
                    htmlFor="outbound"
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Número de teléfono saliente
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handlePublishCancel}>
              Cancelar
            </Button>
            <Button onClick={handlePublishConfirm} className="bg-black text-white hover:bg-black/90">
              Publicar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
