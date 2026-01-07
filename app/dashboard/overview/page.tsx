'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Clock } from 'lucide-react';
import { Layout } from '@/components/layout';
import { useEffect, useState } from 'react';
import { apiService } from '@/services';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | undefined>(undefined);
  const sentimentData = dashboardStats
    ? [
        { name: 'Positivo', value: dashboardStats.userSentimentStats.Positive, color: '#FF8A65' },
        { name: 'Negativo', value: dashboardStats.userSentimentStats.Negative, color: '#64B5F6' },
        { name: 'Neutral', value: dashboardStats.userSentimentStats.Neutral, color: '#7986CB' },
        { name: 'Desconocido', value: dashboardStats.userSentimentStats.Unknown, color: '#BA68C8' }
      ]
    : [];
  const phoneData = dashboardStats
    ? [
        { name: 'Desconocido', value: dashboardStats.callDirectionStats.Unknown, color: '#64B5F6' },
        { name: 'Entrante', value: dashboardStats.callDirectionStats.inbound, color: '#FF8A65' },
        { name: 'Saliente', value: dashboardStats.callDirectionStats.outbound, color: '#42A5F5' }
      ]
    : [];

  useEffect(() => {
    apiService
      .getDashboardStats()
      .then((response) => {
        // @ts-ignore
        setDashboardStats(response);
      })
      .catch(() => {
        setDashboardStats({
          campaignsCount: 0,
          callsCount: 0,
          transactionsSum: 0,
          totalCallDuration: '0:00',
          retellCalls: 0,
          userSentimentStats: { Positive: 0, Negative: 0, Neutral: 0, Unknown: 0 },
          callDirectionStats: { Unknown: 0, inbound: 0, outbound: 0 }
        });
      });
  }, []);

  return (
    <Layout>
      <div className="mb-4 space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-600">Resumen de métricas y estadísticas clave</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="relative h-48 border border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-gray-400" />
              <CardTitle className="text-sm font-medium text-gray-900">Número de Campañas Creadas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-center">
              {dashboardStats ? (
                <div className="text-4xl font-normal text-gray-900">{dashboardStats.campaignsCount}</div>
              ) : (
                <div className="mx-auto h-10 w-16 animate-pulse rounded bg-gray-200"></div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="relative h-48 border border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-gray-400" />
              <CardTitle className="text-sm font-medium text-gray-900">Conteo de Llamadas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-center">
              {dashboardStats ? (
                <div className="text-4xl font-normal text-gray-900">{dashboardStats.callsCount}</div>
              ) : (
                <div className="mx-auto h-10 w-16 animate-pulse rounded bg-gray-200"></div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="relative h-48 border border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-gray-400" />
              <CardTitle className="text-sm font-medium text-gray-900">Total Transacciones</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-center">
              {dashboardStats ? (
                <div className="text-4xl font-normal text-gray-900">{dashboardStats.transactionsSum}</div>
              ) : (
                <div className="mx-auto h-10 w-16 animate-pulse rounded bg-gray-200"></div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="relative h-48 border border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <CardTitle className="text-sm font-medium text-gray-900">Duración de Llamadas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-center">
              {dashboardStats ? (
                <div className="text-4xl font-normal text-gray-900">{dashboardStats.totalCallDuration}</div>
              ) : (
                <div className="mx-auto h-10 w-16 animate-pulse rounded bg-gray-200"></div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="relative h-48 border border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <CardTitle className="text-sm font-medium text-gray-900">Llamadas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-center">
              {dashboardStats ? (
                <div className="text-4xl font-normal text-gray-900">{dashboardStats.retellCalls}</div>
              ) : (
                <div className="mx-auto h-10 w-16 animate-pulse rounded bg-gray-200"></div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="relative border border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <CardTitle className="text-sm font-medium text-gray-900">Sentimiento del Usuario</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {dashboardStats ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 flex flex-wrap justify-center gap-4">
                  {sentimentData.map((item, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="mx-auto mb-4 h-48 w-48 animate-pulse rounded-full bg-gray-200"></div>
                <div className="flex gap-4">
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative border border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <CardTitle className="text-sm font-medium text-gray-900">Teléfono entrante/saliente</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {dashboardStats ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={phoneData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {phoneData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 flex flex-wrap justify-center gap-4">
                  {phoneData.map((item, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="mx-auto mb-4 h-48 w-48 animate-pulse rounded-full bg-gray-200"></div>
                <div className="flex gap-4">
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
