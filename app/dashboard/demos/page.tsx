'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/services';
import { WebCallDemo } from '@/components/modules/demos/web-call-demo';
import { getLatestVersionByAgent } from '@/lib/utils';

export default function DemosPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await apiService.getAgents();
        const latestVersionAgents = getLatestVersionByAgent(response || []);
        setAgents(latestVersionAgents);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Cargando agentes...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full w-full flex-col gap-4 overflow-y-auto p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Demo de Llamadas Web</h1>
        <p className="text-muted-foreground">
          Prueba tus agentes con llamadas web en tiempo real
        </p>
      </div>

      <WebCallDemo agents={agents} />
    </div>
  );
}
