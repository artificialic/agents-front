/**
 * Applies a multiplier to a cost value with validation
 *
 * @param {number | undefined} cost - The original cost value to be multiplied
 * @param {number} multiplier - The multiplier to apply to the cost
 * @returns {number} The calculated cost after applying the multiplier. Returns 0 if cost is invalid.
 *
 * @example
 * applyCostMultiplier(10, 1.5) // returns 15
 * applyCostMultiplier(undefined, 1.5) // returns 0
 * applyCostMultiplier(10, NaN) // returns 10 (uses default multiplier of 1)
 */
export function applyCostMultiplier(cost: number | undefined, multiplier: number): number {
  const validCost: number = Number.isFinite(cost) ? cost! : 0;
  const validMultiplier: number = Number.isFinite(multiplier) ? multiplier : 1;
  return validCost * validMultiplier;
}

export const sentimentColorMap: Record<string, string> = {
  Negative: '#fb3748',
  Positive: '#1fc16b',
  Neutral: '#335cff',
  Unknown: '#e1e4ea'
};

export const disconnectionReasonColorMap: Record<string, string> = {
  user_hangup: '#1fc16b'
};

export const callStatusColorMap: Record<string, string> = {
  registered: 'bg-blue-400',
  not_connected: '#e1e4ea',
  ongoing: 'bg-yellow-400',
  ended: '#e1e4ea',
  error: '#fb3748'
};

export const translatedStatus = (status: string) => {
  switch (status.toLowerCase()) {
    // USER SENTIMENT : Negative, Positive, Neutral, Unknown
    case 'negative':
      return 'Negativo';
    case 'positive':
      return 'Positivo';
    case 'neutral':
      return 'Neutral';
    case 'unknown':
      return 'Desconocido';
    // CALL STATUS : registered, not_connected, ongoing, ended, error
    case 'registered':
      return 'Registrada';
    case 'not_connected':
      return 'No conectada';
    case 'ongoing':
      return 'En curso';
    case 'ended':
      return 'Finalizada';
    case 'error':
      return 'Error';
    // DISCONNECTION REASON: dial_no_answer, agent_hangup, user_hangup, call_failed
    case 'user_hangup':
      return 'Usuario colgó';
    case 'dial_no_answer':
      return 'No contestada';
    case 'agent_hangup':
      return 'Agente colgó';
    case 'call_failed':
      return 'Llamada fallida';
    case 'voicemail_reached':
      return 'Buzón de voz';
    //
    case 'successful':
      return 'Exitosa';
    case 'unsuccessful':
      return 'Fallida';
    case 'completed':
      return 'Completada';

    default:
      return status;
  }
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};
