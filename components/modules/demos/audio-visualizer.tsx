'use client';

import { Mic, MicOff } from 'lucide-react';

interface AudioVisualizerProps {
  isActive: boolean;
  isSpeaking: boolean;
}

export function AudioVisualizer({ isActive, isSpeaking }: AudioVisualizerProps) {
  if (!isActive) {
    return (
      <div className="rounded-lg border bg-card p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <MicOff className="h-12 w-12 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No hay llamada activa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-8">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div
            className={`flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300 ${
              isSpeaking ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <Mic className={`h-12 w-12 ${isSpeaking ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
          </div>

          {isSpeaking && (
            <>
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div
                className="absolute inset-0 animate-pulse rounded-full bg-primary/10"
                style={{ animationDuration: '1.5s' }}
              />
            </>
          )}
        </div>

        <div className="flex flex-col items-center space-y-1">
          <p className="text-sm font-medium">
            {isSpeaking ? 'Agente hablando...' : 'Llamada activa'}
          </p>
          <div className="flex items-center gap-1">
            <div
              className={`h-2 w-2 rounded-full ${isSpeaking ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}
            />
            <span className="text-xs text-muted-foreground">
              {isSpeaking ? 'Escuchando' : 'Tu turno'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
