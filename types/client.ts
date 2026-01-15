export type Client = {
  _id: string;
  firstName?: string;
  name?: string;
  email: string;
  phone?: string;
  workspaceId?: string;
  apiKey?: string;
  balance?: number;
  billingConfig?: {
    multiplier: number;
  };
  role?: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string;
};
