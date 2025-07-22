// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import type { CampaignMetrics, MetricsSummary, RecordStats } from '@/types/metrics';
import type { CallLog } from '../modules/call-history/call-history-columns';

export function useMetrics(callLogs?: CallLog[]) {
  const [campaigns, setCampaigns] = useState<CampaignMetrics[]>([]);
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [recordStats, setRecordStats] = useState<RecordStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      if (callLogs && callLogs.length > 0) {
        const totalCalls = callLogs.length;
        const answeredCalls = callLogs.filter((call) => call.call_analysis?.call_successful === true);
        const notAnsweredCalls = callLogs.filter((call) => call.call_analysis?.call_successful === false);

        const totalCost = callLogs.reduce((sum, call) => {
          const cost = typeof call.call_cost === 'number' ? call.call_cost : call.call_cost?.combined_cost || 0;
          return sum + cost;
        }, 0);

        const totalDuration = answeredCalls.reduce((sum, call) => sum + call.duration_ms, 0);
        const averageDuration = answeredCalls.length > 0 ? totalDuration / answeredCalls.length / 1000 : 0;

        const calculatedSummary: MetricsSummary = {
          total_campaigns: 1,
          total_records: totalCalls,
          total_calls: totalCalls,
          total_answered: answeredCalls.length,
          total_not_answered: notAnsweredCalls.length,
          overall_success_rate: totalCalls > 0 ? (answeredCalls.length / totalCalls) * 100 : 0,
          total_cost: totalCost / 100,
          average_call_duration: averageDuration
        };

        const mockCampaigns: CampaignMetrics[] = [
          {
            campaign_id: callLogs[0]?.batch_call_id || 'batch_001',
            campaign_name: `Batch Call ${callLogs[0]?.batch_call_id?.slice(-8) || 'Campaign'}`,
            total_records: totalCalls,
            total_called: totalCalls,
            answered: answeredCalls.length,
            not_answered: notAnsweredCalls.length,
            success_rate: totalCalls > 0 ? (answeredCalls.length / totalCalls) * 100 : 0,
            average_duration: averageDuration,
            total_cost: totalCost / 100,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];

        const mockRecordStats: RecordStats[] = callLogs.map((call) => ({
          record_id: call.call_id,
          phone_number: call.to_number || 'Unknown',
          status: call.call_analysis?.call_successful ? 'answered' : 'not_answered',
          call_duration: Math.floor(call.duration_ms / 1000),
          call_cost: (typeof call.call_cost === 'number' ? call.call_cost : call.call_cost?.combined_cost || 0) / 100,
          attempts: 1,
          last_attempt: new Date(call.start_timestamp).toISOString(),
          campaign_id: call.batch_call_id || 'batch_001'
        }));

        setCampaigns(mockCampaigns);
        setSummary(calculatedSummary);
        setRecordStats(mockRecordStats);
      } else {
        const mockCampaigns: CampaignMetrics[] = [
          {
            campaign_id: 'camp_001',
            campaign_name: 'Campaña de Ventas Q1',
            total_records: 1500,
            total_called: 1200,
            answered: 850,
            not_answered: 350,
            success_rate: 70.8,
            average_duration: 180,
            total_cost: 240.5,
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-20T15:30:00Z'
          },
          {
            campaign_id: 'camp_002',
            campaign_name: 'Seguimiento Clientes',
            total_records: 800,
            total_called: 650,
            answered: 520,
            not_answered: 130,
            success_rate: 80.0,
            average_duration: 220,
            total_cost: 156.75,
            created_at: '2024-01-10T09:00:00Z',
            updated_at: '2024-01-18T14:20:00Z'
          },
          {
            campaign_id: 'camp_003',
            campaign_name: 'Encuesta Satisfacción',
            total_records: 2000,
            total_called: 1800,
            answered: 1260,
            not_answered: 540,
            success_rate: 70.0,
            average_duration: 150,
            total_cost: 315.2,
            created_at: '2024-01-05T08:00:00Z',
            updated_at: '2024-01-22T16:45:00Z'
          }
        ];

        const mockRecordStats: RecordStats[] = [
          {
            record_id: 'rec_001',
            phone_number: '+1234567890',
            status: 'answered',
            call_duration: 185,
            call_cost: 0.25,
            attempts: 1,
            last_attempt: '2024-01-20T10:30:00Z',
            campaign_id: 'camp_001'
          },
          {
            record_id: 'rec_002',
            phone_number: '+1234567891',
            status: 'not_answered',
            call_duration: 0,
            call_cost: 0.05,
            attempts: 3,
            last_attempt: '2024-01-20T11:15:00Z',
            campaign_id: 'camp_001'
          },
          {
            record_id: 'rec_003',
            phone_number: '+1234567892',
            status: 'answered',
            call_duration: 220,
            call_cost: 0.3,
            attempts: 1,
            last_attempt: '2024-01-20T12:00:00Z',
            campaign_id: 'camp_002'
          }
        ];

        const calculatedSummary: MetricsSummary = {
          total_campaigns: mockCampaigns.length,
          total_records: mockCampaigns.reduce((sum, campaign) => sum + campaign.total_records, 0),
          total_calls: mockCampaigns.reduce((sum, campaign) => sum + campaign.total_called, 0),
          total_answered: mockCampaigns.reduce((sum, campaign) => sum + campaign.answered, 0),
          total_not_answered: mockCampaigns.reduce((sum, campaign) => sum + campaign.not_answered, 0),
          overall_success_rate:
            mockCampaigns.length > 0
              ? (mockCampaigns.reduce((sum, campaign) => sum + campaign.answered, 0) /
                  mockCampaigns.reduce((sum, campaign) => sum + campaign.total_called, 0)) *
                100
              : 0,
          total_cost: mockCampaigns.reduce((sum, campaign) => sum + campaign.total_cost, 0),
          average_call_duration:
            mockCampaigns.length > 0
              ? mockCampaigns.reduce((sum, campaign) => sum + campaign.average_duration * campaign.answered, 0) /
                mockCampaigns.reduce((sum, campaign) => sum + campaign.answered, 0)
              : 0
        };

        setCampaigns(mockCampaigns);
        setSummary(calculatedSummary);
        setRecordStats(mockRecordStats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return { campaigns, summary, recordStats, loading, error, refetch: fetchMetrics };
}
