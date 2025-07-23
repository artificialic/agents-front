// TYPE DEFINITIONS FOR USERS
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

type BatchCall = {
  batch_call_id: string;
  name: string;
  from_number: string;
  status: string;
  timezone: string;
  send_now: boolean;
  scheduled_timestamp: number;
  total: number;
  total_task_count: number;
  sent: number;
  picked_up: number;
  completed: number;
  last_sent_timestamp: number;
  tasks_url: string;
};

type BatchCallTask = {
  to_number: string;
  retell_llm_dynamic_variables: Record<string, string>;
};

type CreateBatchCallPayload = {
  name: string;
  trigger_timestamp: number;
  from_number: string;
  tasks: BatchCallTask[];
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

type Campaign = {
  _id: string;
  name: string;
  owner: string;
  agentId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type CreateCampaignPayload = {
  agentId: string;
  name: string;
  fromNumber: string;
};

type CreateContactsPayload = {
  contacts: {
    toNumber: string;
    fullName: string;
  }[];
};

type ContactByCampaign = {
  _id: string;
  campaignId: string;
  toNumber: string;
  fullName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  callId: string;
  processedAt: string;
};

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
