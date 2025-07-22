import { apiClient } from './api-client';

// Company interfaces
export interface Company {
  _id: string;
  name: string;
  logoUrl: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CompaniesResponse {
  items: Company[];
  total: number;
  page: number;
  totalPages: number;
}

// Plan interfaces
export interface CompanyReference {
  _id: string;
  name: string;
  status: 'active' | 'inactive';
  logoUrl?: string;
}

export interface Plan {
  _id: string;
  company: CompanyReference;
  name: string;
  price: number;
  gb: number;
  minutes: string;
  sms: string;
  benefits: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface PlansResponse {
  items: Plan[];
  total: number;
  page: number;
  totalPages: number;
}

// Comparison interface
export interface ComparisonData {
  clientName: string;
  phone: string;
  currentCompany: string;
  currentPlan: string;
  wantsRetention: boolean;
  selectedPlan: string;
  date: string;
}

/**
 * Fetches all companies from the API
 * @returns Promise with the companies response
 */
export const getCompanies = async (): Promise<CompaniesResponse> => {
  try {
    const response = await apiClient.get<CompaniesResponse>('/admin/companies');
    return response.data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};

/**
 * Fetches plans for a specific company
 * @param companyId The ID of the company
 * @returns Promise with the plans response
 */
export const getCompanyPlans = async (companyId: string): Promise<PlansResponse> => {
  try {
    const response = await apiClient.get<PlansResponse>(`/admin/companies/${companyId}/plans`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching plans for company ${companyId}:`, error);
    throw error;
  }
};

/**
 * Fetches all available plans
 * @param page Optional page number for pagination
 * @returns Promise with the plans response
 */
export const getAllPlans = async (page = 1): Promise<PlansResponse> => {
  try {
    const response = await apiClient.get<PlansResponse>('/admin/plans', {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all plans:', error);
    throw error;
  }
};

/**
 * Saves a comparison to the API
 * @param data The comparison data to save
 * @returns Promise with the API response
 */
export const saveComparison = async (data: ComparisonData): Promise<any> => {
  try {
    const response = await apiClient.post('/comparisons', data);
    return response.data;
  } catch (error) {
    console.error('Error saving comparison:', error);
    throw error;
  }
};
