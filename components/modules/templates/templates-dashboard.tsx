// @ts-nocheck
'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Loader2, Plus, MoreHorizontal, Edit } from 'lucide-react';
import { apiService } from '@/services';
import { getLatestVersionByAgent, downloadFile, formatDate } from '@/lib/utils';

interface Agent {
  agent_id: string;
  agent_name: string;
  version: number;
  is_published: boolean;
  language: string;
  voice_id: string;
}

interface TemplatesDashboardProps {
  onCreateTemplate?: () => void;
}

export default function TemplatesDashboard({ onCreateTemplate }: TemplatesDashboardProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    agentId: '',
    filePath: ''
  });

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  const isEditMode = !!editingTemplate;

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getTemplates();
      const templatesData = Array.isArray(response) ? response : response?.data ?? [];

      setTemplates(templatesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      const response = await apiService.getAgents();
      const agentsData = Array.isArray(response) ? response : response?.data ?? [];
      const latestVersionAgents = getLatestVersionByAgent(agentsData);
      setAgents(latestVersionAgents);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoadingAgents(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDownload = (template: Template) => {
    downloadFile(template.filePath, `${template.name}.csv`);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      agentId: '',
      filePath: ''
    });
    setFormError(null);
    setIsModalOpen(true);
    fetchAgents();
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      agentId: template.agentId,
      filePath: template.filePath
    });
    setFormError(null);
    setIsModalOpen(true);
    fetchAgents();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    setFormData({
      name: '',
      agentId: '',
      filePath: ''
    });
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Por favor, ingresa el nombre de la plantilla');
      return;
    }

    if (!formData.agentId) {
      setFormError('Por favor, selecciona un agente');
      return;
    }

    if (!formData.filePath.trim()) {
      setFormError('Por favor, ingresa la ruta del archivo');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        name: formData.name.trim(),
        agentId: formData.agentId,
        filePath: formData.filePath.trim()
      };

      if (isEditMode && editingTemplate) {
        await apiService.updateTemplate(editingTemplate._id, submitData);
      } else {
        await apiService.createTemplate(submitData);
      }

      handleCloseModal();
      fetchTemplates();
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormError(`Error al ${isEditMode ? 'actualizar' : 'crear'} la plantilla. Por favor, inténtalo de nuevo.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-full p-6">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <div className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-gray-600" />
              <h1 className="text-lg font-medium text-gray-900">Plantillas CSV</h1>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={handleCreate}
                className="bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
                disabled={loading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear Plantilla
              </Button>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Cargando plantillas...</span>
            </div>
          )}

          {error && !loading && (
            <div className="py-12 text-center">
              <div className="mb-4 text-red-600">{error}</div>
              <Button onClick={fetchTemplates} variant="outline">
                Reintentar
              </Button>
            </div>
          )}

          {!loading && !error && templates.length === 0 && (
            <div className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">No hay plantillas disponibles</h3>
              <p className="mb-6 text-gray-500">Empieza creando tu primera plantilla CSV</p>
              <Button onClick={handleCreate} className="bg-gray-900 text-white hover:bg-gray-800">
                <Plus className="mr-2 h-4 w-4" />
                Crear tu primera plantilla
              </Button>
            </div>
          )}

          {!loading && !error && templates.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Nombre
                    </TableHead>
                    <TableHead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                      ID del Agente
                    </TableHead>
                    <TableHead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Ruta del Archivo
                    </TableHead>
                    <TableHead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Fecha de Creación
                    </TableHead>
                    <TableHead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Última Actualización
                    </TableHead>
                    <TableHead className="bg-gray-50 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template._id} className="hover:bg-gray-50">
                      <TableCell className="py-4">
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{template.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-mono text-sm text-xs text-gray-900">{template.agentId}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="break-all font-mono text-sm text-xs text-gray-600">{template.filePath}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-sm text-gray-900">{formatDate(template.createdAt)}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-sm text-gray-900">{formatDate(template.updatedAt)}</span>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => handleEdit(template)}
                              className="text-blue-600 focus:text-blue-600"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownload(template)}
                              className="text-green-600 focus:text-green-600"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Descargar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Editar Plantilla CSV' : 'Crear Plantilla CSV'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <div className="text-sm text-red-700">{formError}</div>
              </div>
            )}

            <div>
              <Label htmlFor="templateName" className="mb-1 block text-sm font-medium text-gray-700">
                Nombre de la plantilla *
              </Label>
              <Input
                id="templateName"
                placeholder="Ingresa el nombre de la plantilla"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="focus:border-primary-500 focus:ring-primary-500 border-gray-300"
                required
              />
            </div>

            <div>
              <Label htmlFor="agentId" className="mb-1 block text-sm font-medium text-gray-700">
                Agente *
              </Label>
              <Select
                value={formData.agentId}
                onValueChange={(value) => setFormData({ ...formData, agentId: value })}
                disabled={loadingAgents}
                required
              >
                <SelectTrigger id="agentId" className="focus:border-primary-500 focus:ring-primary-500 border-gray-300">
                  <SelectValue placeholder={loadingAgents ? 'Cargando agentes...' : 'Seleccionar un agente'} />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.agent_id} value={agent.agent_id}>
                      {agent.agent_name} ({agent.agent_id.slice(-8)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="filePath" className="mb-1 block text-sm font-medium text-gray-700">
                Ruta del archivo *
              </Label>
              <Input
                id="filePath"
                placeholder="public/templates/template-contacts-calls.csv"
                value={formData.filePath}
                onChange={(e) => setFormData({ ...formData, filePath: e.target.value })}
                className="focus:border-primary-500 focus:ring-primary-500 border-gray-300"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Ingresa la ruta completa del archivo CSV</p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
                onClick={handleCloseModal}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-gray-900 text-white hover:bg-gray-800" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : isEditMode ? (
                  'Actualizar Plantilla'
                ) : (
                  'Crear Plantilla'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
