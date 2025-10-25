'use client';

import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { SpeechSettings } from '@/components/modules/agents/speech-settings';
import { FunctionsSettings } from '@/components/modules/agents/functions-settings';
import { KnowledgeSettings } from '@/components/modules/agents/knowledge-settings';
import { WebhookSettings } from '@/components/modules/agents/webhook-settings';
import { PostCallAnalysis } from '@/components/modules/agents/postcall-analysis';
import { TranscriptionSettings } from '@/components/modules/agents/transcription-settings';
import { SecuritySettings } from '@/components/modules/agents/security-settings';
import { McpSettings } from '@/components/modules/agents/mcp-settings';
import { CallSettings } from '@/components/modules/agents/call-settings';
import { settingsSections } from '@/components/modules/agents/settings-sections-config';

interface SettingsPanelProps {
  agent: Agent;
  llm: Llm;
  llms: Llm[];
  loadingLlms: boolean;
  onLlmUpdate: () => Promise<void>;
  onAgentUpdate: () => Promise<void>;
  knowledgeBases: KnowledgeBase[];
  loadingKnowledgeBases: boolean;
  onKnowledgeBasesUpdate: () => Promise<void>;
}

export function SettingsPanel({
  agent,
  llm,
  llms,
  onLlmUpdate,
  onAgentUpdate,
  knowledgeBases,
  loadingKnowledgeBases,
  loadingLlms,
  onKnowledgeBasesUpdate
}: SettingsPanelProps) {
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  return (
    <div className="flex h-[calc(100vh-80px)] w-full flex-col overflow-y-auto rounded-lg bg-white px-4">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {settingsSections.map((section) => {
            const isOpen = openSections.includes(section.id);

            return (
              <Collapsible key={section.id} open={isOpen} onOpenChange={() => toggleSection(section.id)}>
                <CollapsibleTrigger className="group flex w-full items-center justify-between border-b border-border p-3 transition-colors hover:bg-accent">
                  <div className="flex items-center gap-3">
                    {section.icon}
                    <span className="text-sm font-medium">{section.label}</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 py-2">
                  {section.id === 'functions' ? (
                    <FunctionsSettings llm={llm} onLlmUpdate={onLlmUpdate} />
                  ) : section.id === 'knowledge' ? (
                    <KnowledgeSettings
                      llm={llm}
                      llmId={llm.llm_id}
                      onLlmUpdate={onLlmUpdate}
                      knowledgeBases={knowledgeBases}
                      loadingKnowledgeBases={loadingKnowledgeBases}
                      onKnowledgeBasesUpdate={onKnowledgeBasesUpdate}
                    />
                  ) : section.id === 'speech' ? (
                    <SpeechSettings agent={agent} onAgentUpdate={onAgentUpdate} />
                  ) : section.id === 'webhook' ? (
                    <WebhookSettings agent={agent} onAgentUpdate={onAgentUpdate} />
                  ) : section.id === 'analysis' ? (
                    <PostCallAnalysis
                      agent={agent}
                      llms={llms}
                      loadingLlms={loadingLlms}
                      onAgentUpdate={onAgentUpdate}
                    />
                  ) : section.id === 'transcription' ? (
                    <TranscriptionSettings agent={agent} onAgentUpdate={onAgentUpdate} />
                  ) : section.id === 'security' ? (
                    <SecuritySettings llm={llm} agent={agent} onAgentUpdate={onAgentUpdate} onLlmUpdate={onLlmUpdate} />
                  ) : section.id === 'mcps' ? (
                    <McpSettings agent={agent} onAgentUpdate={onAgentUpdate} />
                  ) : section.id === 'call' ? (
                    <CallSettings agent={agent} onAgentUpdate={onAgentUpdate} />
                  ) : (
                    <div className="pl-7 text-xs text-muted-foreground">
                      Configura las opciones de {section.label.toLowerCase()} aquí
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>
    </div>
  );
}
