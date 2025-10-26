/**
 * Helper to manage dynamic variables using the generic storage service
 */

import { storageService } from './storage.service';

export interface DynamicVariable {
  name: string;
  value: string;
}

const STORAGE_PREFIX = 'dynamicVariables_agent_';

/**
 * Generates the storage key for a specific agent
 */
const getStorageKey = (agentId: string): string => {
  return `${STORAGE_PREFIX}${agentId}`;
};

/**
 * Service to manage agent dynamic variables
 */
export const dynamicVariablesStorage = {
  /**
   * Saves the dynamic variables for an agent
   */
  save: async (agentId: string, variables: DynamicVariable[]): Promise<void> => {
    const key = getStorageKey(agentId);
    await storageService.setItem(key, variables);
  },

  /**
   * Loads the dynamic variables for an agent
   */
  load: async (agentId: string): Promise<DynamicVariable[]> => {
    const key = getStorageKey(agentId);
    const variables = await storageService.getItem<DynamicVariable[]>(key);
    return variables || [];
  },

  /**
   * Removes the dynamic variables for an agent
   */
  remove: async (agentId: string): Promise<void> => {
    const key = getStorageKey(agentId);
    await storageService.removeItem(key);
  },

  /**
   * Checks if there are saved variables for an agent
   */
  has: async (agentId: string): Promise<boolean> => {
    const key = getStorageKey(agentId);
    return await storageService.hasItem(key);
  }
};
