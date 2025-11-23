'use client';

import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';

interface TranscriptEntry {
  role: 'agent' | 'user';
  content: string;
  timestamp: number;
  id: string;
}

interface TranscriptDisplayProps {
  transcript: TranscriptEntry[];
}

export function TranscriptDisplay({ transcript }: TranscriptDisplayProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  return (
    <div className="rounded-lg border bg-card flex flex-col">
      <div className="border-b p-4 shrink-0">
        <h3 className="font-medium">Transcripción en Vivo</h3>
        <p className="text-sm text-muted-foreground">Últimos 5 mensajes de la conversación</p>
      </div>

      <div
        ref={scrollContainerRef}
        className="overflow-y-auto h-[500px] p-4"
      >
        <div className="space-y-4">
          {transcript.length === 0 ? (
            <div className="flex h-full items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">
                La transcripción aparecerá aquí cuando comience la llamada
              </p>
            </div>
          ) : (
            <>
              {transcript.map((entry) => (
              <div
                key={entry.id}
                className={`flex gap-3 ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {entry.role === 'agent' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    entry.role === 'agent'
                      ? 'bg-muted'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  <p className="text-sm">{entry.content}</p>
                </div>

                {entry.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            <div ref={endOfMessagesRef} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
