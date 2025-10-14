// @ts-nocheck
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { callStatusColorMap, disconnectionReasonColorMap, sentimentColorMap, translatedStatus } from '@/utils';

type user_sentiment = 'Negative' | 'Positive' | 'Neutral' | 'Unknown';
type call_status = 'registered' | 'not_connected' | 'ongoing' | 'ended' | 'error';
type disconnection_reason =
  | 'user_hangup'
  | 'agent_hangup'
  | 'call_transfer'
  | 'voicemail_reached'
  | 'inactivity'
  | 'max_duration_reached'
  | 'concurrency_limit_reached'
  | 'no_valid_payment'
  | 'scam_detected'
  | 'dial_busy'
  | 'dial_failed'
  | 'dial_no_answer'
  | 'invalid_destination'
  | 'telephony_provider_permission_denied'
  | 'telephony_provider_unavailable'
  | 'sip_routing_error'
  | 'marked_as_spam'
  | 'user_declined'
  | 'error_llm_websocket_open'
  | 'error_llm_websocket_lost_connection'
  | 'error_llm_websocket_runtime'
  | 'error_llm_websocket_corrupt_payload'
  | 'error_no_audio_received'
  | 'error_asr'
  | 'error_retell'
  | 'error_unknown'
  | 'error_user_not_joined'
  | 'registered_call_timeout';

export type CallLog = {
  call_id: string;
  call_type: string;
  agent_id: string;
  agent_name: string;
  agent_version?: number;
  call_status: string;
  start_timestamp: number;
  end_timestamp: number;
  duration_ms: number;
  disconnection_reason: string;
  call_cost: {
    combined_cost: number;
    total_duration_seconds: number;
    product_costs?: Array<{
      product: string;
      unitPrice: number;
      cost: number;
    }>;
    total_duration_unit_price?: number;
    total_one_time_price?: number;
  };
  call_analysis: {
    user_sentiment: string;
    call_successful: boolean;
    call_summary?: string;
    in_voicemail?: boolean;
    custom_analysis_data?: any;
  };
  from_number?: string;
  to_number?: string;
  direction?: string;
  batch_call_id?: string;
  latency?: {
    e2e?: {
      p50: number;
      p90: number;
      p95: number;
      p99: number;
      max: number;
      min: number;
      num: number;
      values: number[];
    };
    llm?: {
      p50: number;
      p90: number;
      p95: number;
      p99: number;
      max: number;
      min: number;
      num: number;
      values: number[];
    };
    llm_websocket_network_rtt?: {
      p50: number;
      p90: number;
      p95: number;
      p99: number;
      max: number;
      min: number;
      num: number;
      values: number[];
    };
    tts?: {
      p50: number;
      p90: number;
      p95: number;
      p99: number;
      max: number;
      min: number;
      num: number;
      values: number[];
    };
    knowledge_base?: {
      p50: number;
      p90: number;
      p95: number;
      p99: number;
      max: number;
      min: number;
      num: number;
      values: number[];
    };
    s2s?: {
      p50: number;
      p90: number;
      p95: number;
      p99: number;
      max: number;
      min: number;
      num: number;
      values: number[];
    };
  };
  transcript?: string;
  transcript_object?: Array<{
    role: string;
    content: string;
    words?: Array<{
      word: string;
      start: number;
      end: number;
    }>;
  }>;
  transcript_with_tool_calls?: Array<{
    role: string;
    content: string;
    words?: Array<{
      word: string;
      start: number;
      end: number;
    }>;
  }>;
  recording_url?: string;
  public_log_url?: string;
  knowledge_base_retrieved_contents_url?: string;
  metadata?: any;
  retell_llm_dynamic_variables?: any;
  collected_dynamic_variables?: any;
  opt_out_sensitive_data_storage?: boolean;
  opt_in_signed_url?: boolean;
  access_token?: string;
  llm_token_usage?: {
    values: number[];
    average: number;
    num_requests: number;
  };
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('es-ES', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const formatDuration = (durationMs: number | null) => {
  if (durationMs === null || durationMs === 0) return '0:00';
  const seconds = Math.floor(durationMs / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString()?.padStart(2, '0')}`;
};

const formatCost = (cost: number) => {
  return `$${(cost / 100).toFixed(3)}`;
};

const StatusIndicator = ({ status }: { status: string }) => {
  const colorClass = sentimentColorMap[status] || disconnectionReasonColorMap[status] || callStatusColorMap[status];
  const bgColorClass = colorClass ? `bg-[${colorClass}]` : 'bg-gray-400';

  return (
    <div className="flex items-center">
      <div className={`mr-2 h-2 w-2 rounded-full ${bgColorClass}`}></div>
      <span className="text-sm text-gray-900">{translatedStatus(status)}</span>
    </div>
  );
};

export const columns: ColumnDef<CallLog>[] = [
  {
    accessorKey: 'start_timestamp',
    header: 'Hora',
    size: 180,
    minSize: 180,
    enableResizing: false,
    cell: ({ row }) => {
      return (
        <div className="min-w-32 whitespace-nowrap text-sm text-gray-900">
          {formatTime(row.getValue('start_timestamp'))}
        </div>
      );
    }
  },
  {
    accessorKey: 'duration_ms',
    header: 'Duración',
    size: 100,
    minSize: 100,
    enableResizing: false,
    cell: ({ row }) => {
      return (
        <div className="min-w-32 whitespace-nowrap text-sm text-gray-900">
          {formatDuration(row.getValue('duration_ms'))}
        </div>
      );
    }
  },
  {
    accessorKey: 'call_type',
    header: 'Tipo de Canal',
    size: 150,
    minSize: 150,
    enableResizing: false,
    cell: ({ row }) => {
      const callType = row.getValue('call_type') as string;
      return (
        <div className="min-w-32 whitespace-nowrap text-sm text-gray-900">
          {callType === 'phone_call' ? 'Llamada telefónica' : 'Llamada web'}
        </div>
      );
    }
  },
  {
    accessorKey: 'call_cost',
    header: 'Costo',
    size: 100,
    minSize: 100,
    enableResizing: false,
    cell: ({ row }) => {
      const callData = row.original;
      let costValue = 0;

      if (callData.call_cost) {
        if (typeof callData.call_cost === 'number') {
          costValue = callData.call_cost;
        } else if (callData.call_cost.combined_cost !== undefined) {
          costValue = callData.call_cost.combined_cost;
        } else if (callData.call_cost.total_cost !== undefined) {
          costValue = callData.call_cost.total_cost;
        }
      }

      return <div className="min-w-32 whitespace-nowrap text-sm text-gray-900">{formatCost(costValue)}</div>;
    }
  },
  {
    accessorKey: 'call_id',
    header: 'ID de Sesión',
    size: 250,
    minSize: 250,
    enableResizing: false,
    cell: ({ row }) => {
      return (
        <div className="min-w-32 whitespace-nowrap font-mono text-sm text-xs text-gray-900">
          {row.getValue('call_id')}
        </div>
      );
    }
  },
  {
    accessorKey: 'disconnection_reason',
    header: 'Razón de Finalización',
    size: 180,
    minSize: 180,
    enableResizing: false,
    cell: ({ row }) => {
      const reason = row.getValue('disconnection_reason') as string;
      return (
        <div className="min-w-32 whitespace-nowrap">
          <StatusIndicator status={reason || 'dial_no_answer'} />
        </div>
      );
    }
  },
  {
    accessorKey: 'call_status',
    header: 'Estado de Sesión',
    size: 150,
    minSize: 150,
    enableResizing: false,
    cell: ({ row }) => {
      const status = row.getValue('call_status') as string;
      return (
        <div className="min-w-32 whitespace-nowrap">
          <StatusIndicator status={status || 'error'} />
        </div>
      );
    }
  },
  {
    accessorKey: 'call_analysis',
    header: 'Sentimiento del Usuario',
    size: 180,
    minSize: 180,
    enableResizing: false,
    cell: ({ row }) => {
      const analysis = row.getValue('call_analysis') as CallLog['call_analysis'];
      return (
        <div className="min-w-32 whitespace-nowrap">
          <StatusIndicator status={analysis?.user_sentiment || 'Unknown'} />
        </div>
      );
    }
  },
  {
    accessorKey: 'from_number',
    header: 'De',
    size: 130,
    minSize: 130,
    enableResizing: false,
    cell: ({ row }) => {
      return (
        <div className="min-w-32 whitespace-nowrap text-sm text-gray-900">
          {row.getValue('from_number') || 'Desconocido'}
        </div>
      );
    }
  },
  {
    accessorKey: 'to_number',
    header: 'Para',
    size: 130,
    minSize: 130,
    enableResizing: false,
    cell: ({ row }) => {
      return (
        <div className="min-w-32 whitespace-nowrap text-sm text-gray-900">
          {row.getValue('to_number') || 'Desconocido'}
        </div>
      );
    }
  },
  {
    id: 'session_outcome',
    header: 'Resultado de Sesión',
    size: 180,
    minSize: 180,
    enableResizing: false,
    cell: ({ row }) => {
      const analysis = row.original.call_analysis;
      return (
        <div className="min-w-32 whitespace-nowrap">
          <StatusIndicator status={analysis?.call_successful ? 'Successful' : 'Unsuccessful'} />
        </div>
      );
    }
  },
  {
    id: 'latency',
    header: 'Latencia de Extremo a Extremo',
    size: 200,
    minSize: 200,
    enableResizing: false,
    cell: ({ row }) => {
      const latency = row.original.latency;
      const latencyValue = latency?.e2e?.p50;
      return (
        <div className="min-w-32 whitespace-nowrap text-sm text-gray-900">
          {latencyValue ? `${latencyValue}ms` : '-'}
        </div>
      );
    }
  }
];
