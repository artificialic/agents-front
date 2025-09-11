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

  async getContactsByCampaign(campaignId: string): Promise<ApiResponse<ContactByCampaign[]>> {
    return this.getFullResponse<ContactByCampaign[]>(`/campaigns/${campaignId}/contacts`);
  }

  async createTransaction(data: CreateTransactionPayload): Promise<any> {
    return this.post('/payments/transaction', data);
  }

  async getTransactionsByUser(): Promise<ApiResponse<TransactionHistory[]>> {
    return this.getFullResponse<TransactionHistory[]>('/transaction-history/by-user');
  }

  /* Retell */
  async getPhoneNumbers(): Promise<ApiResponse<PhoneNumber[]>> {
    return this.getFullResponse<PhoneNumber[]>('/retell/phone-numbers');
  }

  async getCallById(callId: string): Promise<ApiResponse<CallDetail>> {
    return this.getFullResponse<CallDetail>(`/retell/call/${callId}`);
  }

  async getAgents(): Promise<ApiResponse<Agent[]>> {
    return this.getFullResponse<Agent[]>('/retell/agents');
  }

  async getCalls(data: any): Promise<ApiResponse<Call[]>> {
    return this.post('/retell/calls', data);
  }

  async getConcurrency(): Promise<ApiResponse<Concurrency>> {
    return this.getFullResponse<Concurrency>('/retell/concurrency');
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
