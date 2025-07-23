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

  getBilling(): Promise<Billing> {
    return this.getFullResponse<Billing>('/billing');
  }

  getProfile(): Promise<ApiResponse<Client>> {
    return this.getFullResponse<Client>('/auth/profile');
  }

  async createPaymentSource(data: PaymentSourcePayload): Promise<any> {
    return this.post('/payments/payment-source', data);
  }

  async getBatchCalls(): Promise<ApiResponse<BatchCall[]>> {
    return this.getFullResponse<BatchCall[]>('/batch-calls');
  }

  async createBatchCall(data: CreateBatchCallPayload): Promise<any> {
    return this.post('/batch-calls', data);
  }

  async getAgents(): Promise<ApiResponse<Agent[]>> {
    return this.getFullResponse<Agent[]>('/agents');
  }

  async getCalls(data: any): Promise<ApiResponse<Call[]>> {
    return this.post('/calls', data);
  }

  async getConcurrency(): Promise<ApiResponse<Concurrency>> {
    return this.getFullResponse<Concurrency>('/calls/concurrency');
  }

  async getCampaignsByUser(): Promise<ApiResponse<Campaign[]>> {
    return this.getFullResponse<Campaign[]>('/campaigns/by-user');
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

  async getPhoneNumbers(): Promise<ApiResponse<PhoneNumber[]>> {
    return this.getFullResponse<PhoneNumber[]>('/retell/phone-numbers');
  }

  async getCallById(callId: string): Promise<ApiResponse<CallDetail>> {
    return this.getFullResponse<CallDetail>(`/retell/call/${callId}`);
  }
}

export const apiService = new ApiServiceLocal();
