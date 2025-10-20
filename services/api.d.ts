interface Campaign {
  _id: string;
  name: string;
  owner: string;
  agentId: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  agentName?: string;
  createdAt: string;
  updatedAt: string;
}

interface Client {
  _id: string;
  firstName: string;
  email: string;
  workspaceId: string;
  role: string;
  apiKey: string;
  billingConfig: {
    multiplier: number;
  };
  createdAt: string;
  updatedAt: string;
  balance: number;
  paymentSource: {
    id: number;
    public_data: {
      last_four: string;
      exp_month: string;
      exp_year: string;
      card_holder: string;
      _id: string;
    };
    _id: string;
  };
}

// TODO: Define the Billing interface
interface Billing {}

type PaymentSourcePayload = {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  cardHolder: string;
};

type Agent = {
  agent_id: string;
  channel: string;
  last_modification_timestamp: number;
  agent_name: string;
  response_engine: {
    type: string;
    llm_id: string;
    version: number;
  };
  language: string;
  opt_out_sensitive_data_storage: boolean;
  opt_in_signed_url: boolean;
  end_call_after_silence_ms: number;
  version: number;
  is_published: boolean;
  post_call_analysis_model: string;
  voice_id: string;
  enable_backchannel: boolean;
  reminder_trigger_ms: number;
  reminder_max_count: number;
  max_call_duration_ms: number;
  interruption_sensitivity: number;
  responsiveness: number;
  normalize_for_speech: boolean;
  begin_message_delay_ms: number;
  enable_voicemail_detection: boolean;
  voicemail_message: string;
  voicemail_option: {
    action: {
      type: string;
    };
  };
  allow_user_dtmf: boolean;
  user_dtmf_options: Record<string, unknown>;
  denoising_mode: string;
};

type CreateAgentPayload = {
  agent_name: string;
  voice_id: string;
  response_engine: {
    type: string;
    llm_id: string;
    version: number;
  };
};

type Call = {
  call_id: string;
  call_type: string;
  agent_id: string;
  agent_version: number;
  agent_name: string;
  retell_llm_dynamic_variables: Record<string, string>;
  collected_dynamic_variables: Record<string, string>;
  call_status: string;
  start_timestamp: number;
  end_timestamp: number;
  duration_ms: number;
  public_log_url: string;
  disconnection_reason: string;
  latency: Record<string, unknown>;
  call_cost: {
    total_duration_unit_price: number;
    product_costs: any[];
    combined_cost: number;
    total_duration_seconds: number;
  };
  call_analysis: {
    in_voicemail: boolean;
    call_summary: string;
    user_sentiment: string;
    custom_analysis_data: Record<string, unknown>;
    call_successful: boolean;
  };
  opt_out_sensitive_data_storage: boolean;
  opt_in_signed_url: boolean;
  batch_call_id: string;
  from_number: string;
  to_number: string;
  direction: string;
};

type CreateCallPayload = {
  agent_id: string;
  from_number: string;
  to_number: string;
  retell_llm_dynamic_variables?: Record<string, string>;
  [key: string]: any;
};

type Concurrency = {
  current_concurrency: number;
  concurrency_limit: number;
  base_concurrency: number;
  purchased_concurrency: number;
  concurrency_purchase_limit: number;
  remaining_purchase_limit: number;
};

type CreateCampaignPayload = {
  agentId: string;
  name: string;
  fromNumber: string;
};

type CreateContactsPayload = {
  contacts: {
    toNumber: string;
    dynamicVariables: Record<string, string>;
  }[];
};

interface ContactByCampaign {
  _id: string;
  campaignId: string;
  toNumber: string;
  status: string;
  callStatus?: string;
  cost?: number;
  createdAt: string;
  updatedAt: string;
  callId: string;
  processedAt: string;
  callAnalysis?: {
    custom_analysis_data?: Record<string, any>;
    [key: string]: any;
  };
}

type CreateTransactionPayload = {
  amount: number;
};

interface TransactionHistory {
  _id: string;
  userId: string;
  wompiTransactionId: string;
  reference: string;
  amountCOP: number;
  amountUSD: number;
  exchangeRate: number;
  status: string;
  type: string;
  paymentMethod: string;
  wompiResponse: any;
  createdAt: string;
  updatedAt: string;
}

interface PhoneNumber {
  phone_number: string;
  phone_number_type: string;
  phone_number_pretty: string;
  nickname: string;
  inbound_agent_id: string;
  outbound_agent_id: string;
  last_modification_timestamp: number;
  inbound_agent_version: number;
  outbound_agent_version: number;
}

interface CallDetail {
  call_id: string;
  call_type: string;
  agent_id: string;
  agent_version: number;
  agent_name: string;
  retell_llm_dynamic_variables: Record<string, string>;
  collected_dynamic_variables: Record<string, string>;
  call_status: string;
  start_timestamp: number;
  end_timestamp: number;
  duration_ms: number;
  public_log_url: string;
  disconnection_reason: string;
  latency: Record<string, any>;
  call_cost: {
    total_duration_unit_price: number;
    product_costs: any[];
    combined_cost: number;
    total_duration_seconds: number;
  };
  call_analysis: {
    in_voicemail: boolean;
    call_summary: string;
    user_sentiment: string;
    custom_analysis_data: Record<string, any>;
    call_successful: boolean;
  };
  opt_out_sensitive_data_storage: boolean;
  opt_in_signed_url: boolean;
  batch_call_id: string;
  from_number: string;
  to_number: string;
  direction: string;
}

interface Template {
  _id: string;
  name: string;
  agentId: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateTemplatePayload {
  name: string;
  agentId: string;
  filePath: string;
}

interface DashboardStats {
  campaignsCount: number;
  callsCount: number;
  transactionsSum: number;
  retellCalls: number;
  totalCallDuration: string;
  userSentimentStats: {
    Negative: number;
    Unknown: number;
    Neutral: number;
    Positive: number;
  };
  callDirectionStats: {
    outbound: number;
    Unknown: number;
    inbound: number;
  };
}

interface Voice {
  standard_voice_type?: 'preset' | 'retell';
  accent?: string;
  age?: string;
  gender: 'male' | 'female';
  preview_audio_url?: string;
  provider: 'elevenlabs' | 'openai' | 'cartesia' | 'playht';
}

/* RETELL */
interface Voice {
  voice_id: string;
  voice_name: string;
  provider: 'elevenlabs' | 'openai' | 'deepgram';
  accent: string;
  gender: string;
  age: string;
  preview_audio_url: string;
}

interface Agent {
  agent_id: string;
  agent_name?: string;
  language?: string;

  // Response Engine
  response_engine: {
    llm_id: string;
    denoising_mode?: 'noise-cancellation' | 'noise-and-background-speech-cancellation';
    stt_mode?: 'fast' | 'accurate';
    boosted_keywords?: string[];
  };

  // Call Settings
  end_call_after_silence_ms?: number;
  max_call_duration_ms?: number;
  ring_duration_ms?: number;

  // Voicemail Options
  voicemail_option?: {
    action: {
      type: 'hangup' | 'prompt' | 'static_text';
      text?: string;
    };
  } | null;

  // DTMF Settings
  allow_user_dtmf?: boolean;
  user_dtmf_options?: {
    timeout_ms: number;
    termination_key?: string | null;
    digit_limit?: number | null;
  };

  // Webhook
  webhook_url?: string;
  webhook_timeout_ms?: number;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

interface Llm {
  llm_id: string;
  version: number;
  is_published: boolean;
  model: string;
  s2s_model: string;
  model_temperature: number;
  model_high_priority: boolean;
  tool_call_strict_mode: boolean;
  general_prompt?: string;
  general_tools?: Array<{
    type: string;
    name: string;
    description: string;
  }>;
  states?: Array<{
    name: string;
    state_prompt: string;
    edges?: Array<{
      destination_state_name: string;
      description: string;
    }>;
    tools?: Array<
      | {
          type: 'transfer_call';
          name: string;
          description: string;
          transfer_destination: {
            type: string;
            number: string;
          };
          transfer_option: {
            type: string;
            show_transferee_as_caller: boolean;
          };
        }
      | {
          type: 'book_appointment_cal';
          name: string;
          description: string;
          cal_api_key: string;
          event_type_id: number;
          timezone: string;
        }
    >;
  }>;
  starting_state?: string;
  start_speaker?: 'user' | 'agent';
  begin_message?: string | null;
  default_dynamic_variables?: Record<string, string>;
  knowledge_base_ids?: string[];
  kb_config?: {
    top_k: number;
    filter_score: number;
  };
  last_modification_timestamp?: number;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}
