'use client';

import { useState } from 'react';
import { useMetrics } from './hooks/use-metrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, TrendingUp, Phone, PhoneCall, PhoneOff, DollarSign, Clock, Users, BarChart3 } from 'lucide-react';
import type { CallLog } from './modules/call-history/call-history-columns';

interface MetricsDashboardProps {
  callLogs?: CallLog[];
}

export function MetricsDashboard({ callLogs }: MetricsDashboardProps) {
  const { campaigns, summary, recordStats, loading, error, refetch } = useMetrics(callLogs);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString()?.padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'answered':
        return <Badge className="bg-green-100 text-green-800">Contestado</Badge>;
      case 'not_answered':
        return <Badge className="bg-red-100 text-red-800">No Contestado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredRecords =
    selectedCampaign === 'all' ? recordStats : recordStats.filter((record) => record.campaign_id === selectedCampaign);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando métricas...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-red-500">Error: {error}</p>
            <Button onClick={refetch}>Intentar de nuevo</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {summary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_records.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">En {summary.total_campaigns} campañas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Llamados</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_calls.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {((summary.total_calls / summary.total_records) * 100).toFixed(1)}% de registros
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contestados</CardTitle>
              <PhoneCall className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.total_answered.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{summary.overall_success_rate.toFixed(1)}% tasa de éxito</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">No Contestados</CardTitle>
              <PhoneOff className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.total_not_answered.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {((summary.total_not_answered / summary.total_calls) * 100).toFixed(1)}% sin respuesta
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Panel de Campañas Salientes
            </span>
            <Button onClick={refetch} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaña</TableHead>
                  <TableHead>Total Registros</TableHead>
                  <TableHead>Total Llamados</TableHead>
                  <TableHead>Contestados</TableHead>
                  <TableHead>No Contestados</TableHead>
                  <TableHead>Tasa de Éxito</TableHead>
                  <TableHead>Duración Promedio</TableHead>
                  <TableHead>Costo Total</TableHead>
                  <TableHead>Última Actualización</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.campaign_id}>
                    <TableCell className="font-medium">{campaign.campaign_name}</TableCell>
                    <TableCell>{campaign.total_records.toLocaleString()}</TableCell>
                    <TableCell>{campaign.total_called.toLocaleString()}</TableCell>
                    <TableCell className="font-medium text-green-600">{campaign.answered.toLocaleString()}</TableCell>
                    <TableCell className="font-medium text-red-600">{campaign.not_answered.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={campaign.success_rate >= 75 ? 'default' : 'secondary'}>
                        {campaign.success_rate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDuration(campaign.average_duration)}</TableCell>
                    <TableCell>${campaign.total_cost.toFixed(2)}</TableCell>
                    <TableCell>{formatDate(campaign.updated_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Estadísticas por Registro</span>
            <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por campaña" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las campañas</SelectItem>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.campaign_id} value={campaign.campaign_id}>
                    {campaign.campaign_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead>Intentos</TableHead>
                  <TableHead>Último Intento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      No se encontraron registros
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.record_id}>
                      <TableCell className="font-mono">{record.phone_number}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{record.call_duration > 0 ? formatDuration(record.call_duration) : '-'}</TableCell>
                      <TableCell>${record.call_cost.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.attempts}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(record.last_attempt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {summary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.total_cost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                ${(summary.total_cost / summary.total_calls).toFixed(3)} por llamada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duración Promedio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(summary.average_call_duration)}</div>
              <p className="text-xs text-muted-foreground">Por llamada contestada</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((summary.total_calls / summary.total_records) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Registros procesados</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
