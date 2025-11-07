// @ts-nocheck
import ApiService from './api-service';
import { ApiResponse } from '@/services/types';

class ApiServiceLocal extends ApiService {
  constructor() {
    super();
  }

  async getAllClients(): Promise<ApiResponse<Client[]>> {
    return this.getFullResponse<Client[]>('/users/clients');
  }

  async createClient(data: Client): Promise<Client> {
    return this.post<Client>('/users/clients', data);
  }

  async updateClient(id: string, data: Partial<Client>): Promise<Client> {
    return this.put<Client>(`/users/clients/${id}`, data);
  }

  getProfile(): Promise<ApiResponse<Client>> {
    return this.getFullResponse<Client>('/auth/profile');
  }

  async createPaymentSource(data: PaymentSourcePayload): Promise<any> {
    return this.post('/payments/payment-source', data);
  }

  /* Module: Campaigns */
  async getCampaignsByUser(): Promise<ApiResponse<Campaign[]>> {
    return this.getFullResponse<Campaign[]>('/campaigns/by-user');
  }

  async updateCampaign(campaignId: string, data: Partial<Campaign>): Promise<any> {
    return this.put(`/campaigns/${campaignId}`, data);
  }

  async createCampaign(data: CreateCampaignPayload): Promise<any> {
    return this.post('/campaigns', data);
  }

  async createContactsToCampaign(campaignId: string, data: CreateContactsPayload): Promise<any> {
    return this.post(`/campaigns/${campaignId}/contacts`, data);
  }

  async getCampaignByUserAndId(id: string): Promise<Campaign> {
    return this.getFullResponse<Campaign>(`/campaigns/by-user/${id}`);
  }

  async getContactsByCampaign(campaignId: string, callStatus?: string): Promise<ApiResponse<ContactByCampaign[]>> {
    const params = callStatus && callStatus !== 'all' ? `?callStatus=${callStatus}` : '';
    return this.getFullResponse<ContactByCampaign[]>(`/campaigns/${campaignId}/contacts${params}`);
  }

  async exportCampaignContacts(campaignId: string) {
    return this.getBlob(`/campaigns/${campaignId}/contacts/export`);
  }

  async createTransaction(data: CreateTransactionPayload): Promise<any> {
    return this.post('/payments/transaction', data);
  }

  /* Module: Transaction History */
  async getTransactionsByUser(): Promise<ApiResponse<TransactionHistory[]>> {
    return this.getFullResponse<TransactionHistory[]>('/transaction-history/by-user');
  }

  async getTransactionsByUserId(userId: string): Promise<ApiResponse<TransactionHistory[]>> {
    return this.getFullResponse<TransactionHistory[]>(`/transaction-history/by-user/${userId}`);
  }

  /* Retell */
  async getPhoneNumbers(): Promise<PhoneNumber[]> {
    return this.getFullResponse<PhoneNumber[]>('/retell/phone-numbers');
  }

  async importPhoneNumber(importData: PhoneNumber): Promise<any> {
    return this.post('/retell/phone-numbers/import', importData);
  }

  async updatePhoneNumber(phoneNumber: string, updateData: Partial<PhoneNumber>): Promise<any> {
    return this.patch(`/retell/phone-numbers/${phoneNumber}`, updateData);
  }

  async setupSmsWebhook(setupData: SetupSmsWebhookRequest): Promise<any> {
    return this.post('/retell/sms-webhook/setup', setupData);
  }

  async createPhoneCall(callData: CreatePhoneCallRequest): Promise<any> {
    return this.post('/retell/calls/create', callData);
  }

  async createWebCall(callData: CreateWebCallRequest): Promise<any> {
    return this.post('/retell/web-calls/create', callData);
  }

  async deletePhoneNumber(phoneNumber: string): Promise<any> {
    return this.delete(`/retell/phone-numbers/${phoneNumber}`);
  }

  async getCallById(callId: string): Promise<ApiResponse<CallDetail>> {
    return this.getFullResponse<CallDetail>(`/retell/call/${callId}`);
  }

  async createAgent(agentData: CreateAgentRequest): Promise<Agent> {
    return this.post<Agent>('/retell/agents', agentData);
  }

  async getAgents(): Promise<Agent[]> {
    return this.getFullResponse<Agent[]>('/retell/agents');
  }

  async getAgent(agentId: string): Promise<Agent> {
    return this.getFullResponse<Agent>(`/retell/agents/${agentId}`);
  }

  async updateAgent(agentId: string, data: Partial<Agent>): Promise<Agent> {
    return this.patch<Agent>(`/retell/agents/${agentId}`, data);
  }

  async deleteAgent(agentId: string): Promise<any> {
    return this.delete(`/retell/agents/${agentId}`);
  }

  async publishAgent(agentId: string): Promise<any> {
    return this.post(`/retell/agents/${agentId}/publish`, {});
  }

  async getCalls(data: any): Promise<ApiResponse<Call[]>> {
    return this.post('/retell/calls', data);
  }

  async getConcurrency(): Promise<ApiResponse<Concurrency>> {
    return this.getFullResponse<Concurrency>('/retell/concurrency');
  }

  async getLlm(llmId: string): Promise<Llm> {
    return this.getFullResponse<Llm>(`/retell/llm/${llmId}`);
  }

  async getLlms(): Promise<Llm[]> {
    return this.getFullResponse<Llm[]>(`/retell/llms`);
  }

  async createLlm(llmData: CreateRetellLLMRequest): Promise<Llm> {
    return this.post<Llm>('/retell/llm', llmData);
  }

  async updateLlm(llmId: string, data: Partial<Llm>): Promise<Agent> {
    return this.patch<Llm>(`/retell/llm/${llmId}`, data);
  }

  async getVoices(): Promise<Voice[]> {
    return this.getFullResponse<any>('/retell/voices');
  }

  async getKnowledgeBases(): Promise<KnowledgeBase[]> {
    return this.getFullResponse<KnowledgeBase[]>('/retell/knowledge-bases');
  }

  async createKnowledgeBase(data: CreateKnowledgeBasePayload): Promise<any> {
    return this.post('/retell/knowledge-bases', data);
  }

  async deleteKnowledgeBase(knowledgeBaseId: string): Promise<void> {
    return this.delete(`/retell/knowledge-bases/${knowledgeBaseId}`);
  }

  async addKnowledgeBaseSources(knowledgeBaseId: string, data: FormData): Promise<any> {
    return this.post(`/retell/knowledge-bases/${knowledgeBaseId}/sources`, data);
  }

  async deleteKnowledgeBaseSource(knowledgeBaseId: string, sourceId: string): Promise<any> {
    return this.delete(`/retell/knowledge-bases/${knowledgeBaseId}/sources/${sourceId}`);
  }

  async searchCommunityVoice(searchData: { search_query: string }): Promise<any> {
    return this.post('/retell/search-community-voice', searchData);
  }

  async addCommunityVoice(voiceData: {
    provider_voice_id: string;
    public_user_id: string;
    voice_name: string;
  }): Promise<any> {
    return this.post('/retell/add-community-voice', voiceData);
  }

  /* Templates */
  async getTemplates(): Promise<ApiResponse<Template[]>> {
    return this.getFullResponse<Template[]>('/templates');
  }
  async createTemplate(data: CreateTemplatePayload): Promise<Template> {
    return this.post<Template>('/templates', data);
  }
  async updateTemplate(id: string, data: Partial<Template>): Promise<Template> {
    return this.put<Template>(`/templates/${id}`, data);
  }

  /* Dashboard */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.getFullResponse<DashboardStats>('/dashboard/stats');
  }
}

export const apiService = new ApiServiceLocal();
