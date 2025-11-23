'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Clock, MessageSquare } from 'lucide-react';

interface TranscriptEntry {
  role: 'agent' | 'user';
  content: string;
  timestamp: number;
  id: string;
}

interface CallHistoryProps {
  history: TranscriptEntry[][];
}

export function CallHistory({ history }: CallHistoryProps) {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  if (history.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 font-medium">Historial de Llamadas</h3>
        <div className="flex flex-col items-center justify-center py-8">
          <Clock className="mb-2 h-12 w-12 text-muted-foreground" />
          <p className="text-center text-sm text-muted-foreground">
            No hay llamadas en el historial
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b p-4">
        <h3 className="font-medium">Historial de Llamadas</h3>
        <p className="text-sm text-muted-foreground">{history.length} llamada(s)</p>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-2 p-4">
          {history.map((call, callIndex) => {
            const isOpen = openItems.includes(callIndex);
            const callNumber = history.length - callIndex;

            return (
              <Collapsible
                key={callIndex}
                open={isOpen}
                onOpenChange={() => toggleItem(callIndex)}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border p-3 hover:bg-accent">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Llamada #{callNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {call.length} mensajes
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2 space-y-2 rounded-md border bg-muted/50 p-3">
                  {call.map((entry) => (
                    <div
                      key={entry.id}
                      className={`rounded-md p-2 text-sm ${
                        entry.role === 'agent' ? 'bg-background' : 'bg-primary/10'
                      }`}
                    >
                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        {entry.role === 'agent' ? 'Agente' : 'Usuario'}
                      </p>
                      <p className="text-sm">{entry.content}</p>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
