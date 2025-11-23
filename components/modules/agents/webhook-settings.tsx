import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { apiService } from '@/services';

const SLIDER_CONFIGS = {
  webhookTimeout: {
    min: 1000,
    max: 30000,
    step: 100
  }
};

interface WebhookSettingsProps {
  agent: Agent;
  onAgentUpdate: () => void;
  webhookUrl: string;
  loadingWebhook: boolean;
  onWebhookUpdate: (url: string | null) => Promise<void>;
}

export function WebhookSettings({
  agent,
  onAgentUpdate,
  webhookUrl,
  loadingWebhook,
  onWebhookUpdate
}: WebhookSettingsProps) {
  const [localWebhookUrl, setLocalWebhookUrl] = useState(webhookUrl);
  const [webhookTimeout, setWebhookTimeout] = useState([agent.webhook_timeout_ms || 5000]);

  if (webhookUrl !== localWebhookUrl && !loadingWebhook) {
    setLocalWebhookUrl(webhookUrl);
  }

  const handleWebhookUrlBlur = async () => {
    if (localWebhookUrl !== webhookUrl) {
      try {
        const trimmedUrl = localWebhookUrl.trim();
        await onWebhookUpdate(trimmedUrl || null);
      } catch (error) {
        console.error('Error updating webhook URL:', error);
        setLocalWebhookUrl(webhookUrl);
      }
    }
  };

  const handleWebhookTimeoutCommit = async (value: number[]) => {
    try {
      await apiService.updateAgent(agent.agent_id, { webhook_timeout_ms: value[0] });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating webhook timeout:', error);
    }
  };

  return (
    <div className="flex flex-col items-start space-y-4 px-7 pb-4 pt-0">
      <div className="w-full space-y-2">
        <div className="text-sm font-medium">URL de Webhook a Nivel de Agente</div>
        <div className="text-xs text-muted-foreground">URL de webhook para recibir eventos.</div>
        <Input
          value={localWebhookUrl}
          onChange={(e) => setLocalWebhookUrl(e.target.value)}
          onBlur={handleWebhookUrlBlur}
          placeholder={loadingWebhook ? 'Cargando...' : ''}
          disabled={loadingWebhook}
          className="w-full"
        />
      </div>

      <div className="w-full space-y-2">
        <div className="text-sm font-medium">Tiempo de Espera del Webhook</div>
        <div className="text-xs text-muted-foreground">
          Establece el tiempo máximo de espera para una respuesta del webhook antes de que expire.
        </div>
        <div className="flex items-center gap-4">
          <Slider
            value={webhookTimeout}
            onValueChange={setWebhookTimeout}
            onValueCommit={handleWebhookTimeoutCommit}
            min={SLIDER_CONFIGS.webhookTimeout.min}
            max={SLIDER_CONFIGS.webhookTimeout.max}
            step={SLIDER_CONFIGS.webhookTimeout.step}
            className="flex-1"
          />
          <div className="w-12 text-right text-sm text-muted-foreground">{(webhookTimeout[0] / 1000).toFixed(0)} s</div>
        </div>
      </div>
    </div>
  );
}
