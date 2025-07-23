import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Agent {
  agent_id: string;
  version: number;
  agent_name: string;
  is_published: boolean;
  last_modification_timestamp: number;
  language: string;
  channel: string;
}
/**
 * Groups data by agent_id and returns the latest version of each agent
 * @param {Array} agents - Array of objects with agent information
 * @returns {Array} Array with the latest version of each unique agent
 */
export function getLatestVersionByAgent(agents: Agent[]): Agent[] {
  if (!Array.isArray(agents)) {
    throw new Error('Input must be an array of agents');
  }

  const latestVersions = new Map<string, Agent>();

  agents.forEach((agent) => {
    if (!agent.agent_id || typeof agent.version !== 'number') {
      console.warn('Skipping invalid agent object:', agent);
      return;
    }

    const existingAgent = latestVersions.get(agent.agent_id);

    if (!existingAgent || agent.version > existingAgent.version) {
      latestVersions.set(agent.agent_id, agent);
    }
  });

  return Array.from(latestVersions.values());
}
