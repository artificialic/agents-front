'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { KPICard } from '@/components/dashboard/kpi-card';
import { PieChart } from '@/components/dashboard/pie-chart';
import { BarChart } from '@/components/dashboard/bar-chart';

interface CampaignReportDashboardProps {
  contacts: ContactByCampaign[];
  campaignName: string;
}

interface ContactByCampaign {
  _id: string;
  campaignId: string;
  toNumber: string;
  status: string;
  callStatus?: string;
  disposition?: string;
  cost?: number;
  createdAt: string;
  updatedAt: string;
  callId: string;
  processedAt: string;
  callAnalysis?: {
    custom_analysis_data?: Record<string, any>;
    call_successful?: boolean;
    [key: string]: any;
  };
}

export default function CampaignReportDashboard({ contacts, campaignName }: CampaignReportDashboardProps) {
  const [open, setOpen] = useState(false);

  const getStatusStats = () => {
    const stats = {
      total: contacts.length,
      ended: 0,
      not_connected: 0,
      failed: 0,
      others: 0,
    };

    contacts.forEach((contact) => {
      const status = contact.callStatus || contact.status;
      switch (status) {
        case 'ended':
          stats.ended++;
          break;
        case 'not_connected':
          stats.not_connected++;
          break;
        case 'error':
        case 'failed':
          stats.failed++;
          break;
        default:
          stats.others++;
      }
    });

    return stats;
  };

  const getSuccessStats = () => {
    const endedCalls = contacts.filter(
      (c) => (c.callStatus || c.status) === 'ended'
    );

    const successfulCalls = endedCalls.filter(
      (c) => c.callAnalysis?.call_successful === true
    );

    const callsWithTipificacion = endedCalls.filter(
      (c) => c.callAnalysis?.custom_analysis_data?.tipificacion
    );

    return {
      total: endedCalls.length,
      successful: successfulCalls.length,
      withTipificacion: callsWithTipificacion.length,
    };
  };

  const getTipificacionStats = () => {
    const tipificacionMap = new Map<string, number>();

    contacts.forEach((contact) => {
      const tipificacion = contact.callAnalysis?.custom_analysis_data?.tipificacion;
      if (tipificacion) {
        tipificacionMap.set(
          String(tipificacion),
          (tipificacionMap.get(String(tipificacion)) || 0) + 1
        );
      }
    });

    return Array.from(tipificacionMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const statusStats = getStatusStats();
  const successStats = getSuccessStats();
  const tipificacionStats = getTipificacionStats();

  const pieChartData = [
    { name: 'Finalizadas', value: statusStats.ended, color: '#10b981' },
    { name: 'No Contestadas', value: statusStats.not_connected, color: '#f59e0b' },
    { name: 'Fallidas', value: statusStats.failed, color: '#ef4444' },
    { name: 'Otras', value: statusStats.others, color: '#6b7280' },
  ].filter((item) => item.value > 0);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" size="sm">
        <FileText className="mr-2 h-4 w-4" />
        Ver Informe
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Informe de Campaña - {campaignName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-6 text-gray-900">
                  Estado de Llamadas
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <StatCard
                    label="Total"
                    value={statusStats.total}
                    bgColor="from-blue-50 to-blue-100"
                    textColor="blue"
                    borderColor="blue-200"
                  />
                  <StatCard
                    label="Finalizadas"
                    value={statusStats.ended}
                    bgColor="from-green-50 to-green-100"
                    textColor="green"
                    borderColor="green-200"
                  />
                  <StatCard
                    label="No Contestadas"
                    value={statusStats.not_connected}
                    bgColor="from-orange-50 to-orange-100"
                    textColor="orange"
                    borderColor="orange-200"
                  />
                  <StatCard
                    label="Fallidas"
                    value={statusStats.failed}
                    bgColor="from-red-50 to-red-100"
                    textColor="red"
                    borderColor="red-200"
                  />
                </div>

                <div className="flex justify-center">
                  <PieChart data={pieChartData} size={64} showLegend={true} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-lg border p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">
                    Análisis de Éxito
                  </h3>

                  <div className="space-y-4">
                    <KPICard
                      title="Llamadas 100% Exitosas"
                      value={successStats.successful}
                      total={successStats.total}
                      icon="✓"
                      gradient="from-emerald-500 to-teal-500"
                    />

                    <KPICard
                      title="Con Tipificación"
                      value={successStats.withTipificacion}
                      total={successStats.total}
                      icon="📋"
                      gradient="from-violet-500 to-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {tipificacionStats.length > 0 && (
              <div className="bg-white rounded-lg border p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-6 text-gray-900">
                  Distribución por Tipificación
                </h3>

                <BarChart
                  data={tipificacionStats}
                  gradient="from-blue-500 to-blue-600"
                  showPercentage={true}
                  totalForPercentage={statusStats.total}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
