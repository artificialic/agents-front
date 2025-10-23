'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Clock, Zap, Pencil, MoreHorizontal, RotateCcw, Copy } from 'lucide-react';
import { apiService } from '@/services';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { copyToClipboard } from '@/utils';

interface AgentHeaderProps {
  agent: Agent;
  agentId: string;
  llmId: string;
  onAgentUpdate: () => Promise<void>;
}

export function AgentHeader({ agent, agentId, llmId, onAgentUpdate }: AgentHeaderProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(agent.agent_name || '');

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

  return (
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
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                $0.115/min
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                2470-2805ms latencia
              </span>
              <span>•</span>
              <span>47-287 tokens</span>
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
          <Button size="sm" className="bg-black text-white hover:bg-black/90">
            Publicar
          </Button>
        </div>
      </div>
    </header>
  );
}
