'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { FIELD_TYPE_ICONS } from '@/components/modules/agents/constants';
import { apiService } from '@/services';

interface PostCallAnalysisProps {
  agent: Agent;
  onAgentUpdate: () => void;
  llms: Llm[];
  loadingLlms: boolean;
}

interface PostCallDataField {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  examples?: string[];
  choices?: string[];
}

export function PostCallAnalysis({ agent, onAgentUpdate, llms, loadingLlms }: PostCallAnalysisProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<PostCallDataField | null>(null);
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('string');
  const [description, setDescription] = useState('');
  const [isOptional, setIsOptional] = useState(false);
  const [formatExamples, setFormatExamples] = useState<string[]>([]);
  const [deletingField, setDeletingField] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(agent.post_call_analysis_model || '');

  const handleAddFieldWithType = (type: string) => {
    setEditingField(null);
    setFieldName('');
    setFieldType(type);
    setDescription('');
    setIsOptional(false);
    setFormatExamples([]);
    setIsDialogOpen(true);
  };

  const handleEditField = (field: PostCallDataField) => {
    const fullField = agent.post_call_analysis_data?.find((f) => f.name === field.name) as any;

    setEditingField(field);
    setFieldName(field.name);

    const uiType = field.type === 'enum' ? 'selector' : field.type;
    setFieldType(uiType);

    setDescription(fullField?.description || '');

    if (field.type === 'boolean' || field.type === 'number' || field.type === 'enum') {
      setIsOptional(fullField?.required === false);
    } else {
      setIsOptional(false);
    }

    if (fullField?.type === 'enum' && fullField?.choices) {
      setFormatExamples(fullField.choices);
    } else if (fullField?.examples) {
      setFormatExamples(fullField.examples);
    } else {
      setFormatExamples([]);
    }

    setIsDialogOpen(true);
  };

  const handleAddFormatExample = () => {
    setFormatExamples([...formatExamples, '']);
  };

  const handleUpdateFormatExample = (index: number, value: string) => {
    const updated = [...formatExamples];
    updated[index] = value;
    setFormatExamples(updated);
  };

  const handleRemoveFormatExample = (index: number) => {
    setFormatExamples(formatExamples.filter((_, i) => i !== index));
  };

  const handleDeleteField = async (fieldName: string) => {
    setDeletingField(fieldName);
    try {
      const updatedFields = agent.post_call_analysis_data?.filter((field) => field.name !== fieldName) || [];

      await apiService.updateAgent(agent.agent_id, {
        post_call_analysis_data: updatedFields
      });

      await onAgentUpdate();
    } catch (error) {
      console.error('Error deleting field:', error);
    } finally {
      setDeletingField(null);
    }
  };

  const handleSaveField = async () => {
    try {
      const currentFields = agent.post_call_analysis_data || [];

      const fieldData: any = {
        name: fieldName,
        description: description,
        type: fieldType === 'selector' ? 'enum' : fieldType
      };

      if (fieldType === 'boolean' || fieldType === 'number') {
        fieldData.required = !isOptional;
      } else {
        const nonEmptyExamples = formatExamples.filter((ex) => ex.trim() !== '');
        if (nonEmptyExamples.length > 0) {
          if (fieldType === 'selector') {
            fieldData.choices = nonEmptyExamples;
            fieldData.required = !isOptional;
          } else {
            fieldData.examples = nonEmptyExamples;
          }
        }
      }

      let updatedFields;
      if (editingField) {
        updatedFields = currentFields.map((field) => (field.name === editingField.name ? fieldData : field));
      } else {
        updatedFields = [...currentFields, fieldData];
      }

      await apiService.updateAgent(agent.agent_id, {
        post_call_analysis_data: updatedFields
      });

      await onAgentUpdate();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving field:', error);
    }
  };

  const handleModelChange = async (value: string) => {
    try {
      setSelectedModel(value);
      await apiService.updateAgent(agent.agent_id, {
        post_call_analysis_model: value
      });
      await onAgentUpdate();
    } catch (error) {}
  };

  const fields: PostCallDataField[] =
    agent.post_call_analysis_data?.map((field) => ({
      name: field.name,
      type: field.type
    })) || [];

  return (
    <div className="flex flex-col px-4 pb-4 pt-0">
      <div className="flex flex-col rounded-lg p-4">
        <div className="text-xs font-medium leading-normal">Recuperación de Datos Post-Llamada</div>
        <div className="text-xs font-normal leading-none text-muted-foreground">
          Define la información que necesitas extraer de la voz.
        </div>
        <div className="mt-2 flex flex-col gap-1">
          {fields.map((field) => {
            const iconType = field.type === 'enum' ? 'array' : field.type;
            return (
              <div
                key={field.name}
                className="inline-flex h-8 w-full items-center justify-start gap-1 rounded-lg border-none bg-muted/50 p-1.5"
              >
                <div className="flex items-center justify-center">
                  {FIELD_TYPE_ICONS[iconType] || FIELD_TYPE_ICONS['string']}
                </div>
                <div className="truncate text-sm font-normal leading-tight text-muted-foreground">{field.name}</div>
                <div className="ml-auto flex items-center justify-center gap-0.5 p-px">
                  <button
                    className="cursor-pointer rounded-sm p-px"
                    onClick={() => handleEditField(field)}
                    disabled={deletingField === field.name}
                  >
                    <div className="flex h-[18px] w-[18px] items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path
                          d="M5.23023 11.7L12.0761 4.85415L11.1216 3.8997L4.27578 10.7455V11.7H5.23023ZM5.78981 13.05H2.92578V10.186L10.6444 2.46735C10.771 2.3408 10.9426 2.26971 11.1216 2.26971C11.3006 2.26971 11.4723 2.3408 11.5989 2.46735L13.5084 4.37692C13.635 4.5035 13.7061 4.67516 13.7061 4.85415C13.7061 5.03313 13.635 5.20479 13.5084 5.33137L5.78981 13.05ZM2.92578 14.4H15.0758V15.75H2.92578V14.4Z"
                          fill="currentColor"
                          className="text-muted-foreground"
                        />
                      </svg>
                    </div>
                  </button>
                  <button
                    className="cursor-pointer rounded-sm p-px"
                    onClick={() => handleDeleteField(field.name)}
                    disabled={deletingField === field.name}
                  >
                    <div className="flex h-[18px] w-[18px] cursor-pointer items-center justify-center p-0">
                      {deletingField === field.name ? (
                        <Loader2 className="h-[18px] w-[18px] animate-spin text-muted-foreground" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <path
                            d="M12.375 4.95H15.75V6.3H14.4V15.075C14.4 15.254 14.3289 15.4257 14.2023 15.5523C14.0757 15.6789 13.904 15.75 13.725 15.75H4.275C4.09598 15.75 3.92429 15.6789 3.7977 15.5523C3.67112 15.4257 3.6 15.254 3.6 15.075V6.3H2.25V4.95H5.625V2.925C5.625 2.74598 5.69612 2.57429 5.8227 2.4477C5.94929 2.32112 6.12098 2.25 6.3 2.25H11.7C11.879 2.25 12.0507 2.32112 12.1773 2.4477C12.3039 2.57429 12.375 2.74598 12.375 2.925V4.95ZM13.05 6.3H4.95V14.4H13.05V6.3ZM6.975 8.325H8.325V12.375H6.975V8.325ZM9.675 8.325H11.025V12.375H9.675V8.325ZM6.975 3.6V4.95H11.025V3.6H6.975Z"
                            fill="currentColor"
                            className="text-muted-foreground"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex h-8 w-full items-center justify-between rounded-lg bg-white p-0">
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 gap-0.5 rounded-lg border-input p-1.5 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M9.25 9.25V4.75H10.75V9.25H15.25V10.75H10.75V15.25H9.25V10.75H4.75V9.25H9.25Z"
                      fill="currentColor"
                      className="text-muted-foreground"
                    />
                  </svg>
                  <div className="px-1 text-sm font-medium leading-normal">Agregar</div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="flex flex-col items-start gap-1 rounded-lg bg-white p-2">
                <DropdownMenuItem
                  className="flex w-full cursor-pointer items-center justify-between"
                  onClick={() => handleAddFieldWithType('string')}
                >
                  <div className="flex flex-row items-center gap-2">
                    {FIELD_TYPE_ICONS['string']}
                    <div className="text-sm font-normal leading-tight">Texto</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex w-full cursor-pointer items-center justify-between"
                  onClick={() => handleAddFieldWithType('array')}
                >
                  <div className="flex flex-row items-center gap-2">
                    {FIELD_TYPE_ICONS['array']}
                    <div className="text-sm font-normal leading-tight">Lista</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex w-full cursor-pointer items-center justify-between"
                  onClick={() => handleAddFieldWithType('boolean')}
                >
                  <div className="flex flex-row items-center gap-2">
                    {FIELD_TYPE_ICONS['boolean']}
                    <div className="text-sm font-normal leading-tight">Booleano</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex w-full cursor-pointer items-center justify-between"
                  onClick={() => handleAddFieldWithType('number')}
                >
                  <div className="flex flex-row items-center gap-2">
                    {FIELD_TYPE_ICONS['number']}
                    <div className="text-sm font-normal leading-tight">Número</div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <Select value={selectedModel} onValueChange={handleModelChange} disabled={loadingLlms}>
              <SelectTrigger className="inline-flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-border bg-white pl-3 pr-2.5">
                <div className="flex items-center gap-2">
                  <div>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M7.51453 3.99906L9.46979 2.04381C9.61043 1.90321 9.80116 1.82422 10 1.82422C10.1989 1.82422 10.3896 1.90321 10.5303 2.04381L12.4855 3.99906H15.25C15.4489 3.99906 15.6397 4.07808 15.7804 4.21873C15.921 4.35938 16 4.55015 16 4.74906V7.51356L17.9553 9.46881C18.0959 9.60945 18.1749 9.80018 18.1749 9.99906C18.1749 10.1979 18.0959 10.3887 17.9553 10.5293L16 12.4846V15.2491C16 15.448 15.921 15.6387 15.7804 15.7794C15.6397 15.92 15.4489 15.9991 15.25 15.9991H12.4855L10.5303 17.9543C10.3896 18.0949 10.1989 18.1739 10 18.1739C9.80116 18.1739 9.61043 18.0949 9.46979 17.9543L7.51453 15.9991H4.75003C4.55112 15.9991 4.36036 15.92 4.21971 15.7794C4.07905 15.6387 4.00003 15.448 4.00003 15.2491V12.4846L2.04479 10.5293C1.90418 10.3887 1.8252 10.1979 1.8252 9.99906C1.8252 9.80018 1.90418 9.60945 2.04479 9.46881L4.00003 7.51356V4.74906C4.00003 4.55015 4.07905 4.35938 4.21971 4.21873C4.36036 4.07808 4.55112 3.99906 4.75003 3.99906H7.51453ZM5.50003 5.49906V8.13531L3.63629 9.99906L5.50003 11.8628V14.4991H8.13629L10 16.3628L11.8638 14.4991H14.5V11.8628L16.3638 9.99906L14.5 8.13531V5.49906H11.8638L10 3.63531L8.13629 5.49906H5.50003ZM10 12.9991C9.20438 12.9991 8.44132 12.683 7.87871 12.1204C7.31611 11.5578 7.00003 10.7947 7.00003 9.99906C7.00003 9.20341 7.31611 8.44035 7.87871 7.87774C8.44132 7.31513 9.20438 6.99906 10 6.99906C10.7957 6.99906 11.5587 7.31513 12.1214 7.87774C12.684 8.44035 13 9.20341 13 9.99906C13 10.7947 12.684 11.5578 12.1214 12.1204C11.5587 12.683 10.7957 12.9991 10 12.9991ZM10 11.4991C10.3979 11.4991 10.7794 11.341 11.0607 11.0597C11.342 10.7784 11.5 10.3969 11.5 9.99906C11.5 9.60123 11.342 9.2197 11.0607 8.9384C10.7794 8.65709 10.3979 8.49906 10 8.49906C9.60221 8.49906 9.22068 8.65709 8.93937 8.9384C8.65807 9.2197 8.50003 9.60123 8.50003 9.99906C8.50003 10.3969 8.65807 10.7784 8.93937 11.0597C9.22068 11.341 9.60221 11.4991 10 11.4991Z"
                        fill="#525866"
                      />
                    </svg>
                  </div>
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-normal leading-tight">
                    {loadingLlms ? 'Cargando...' : selectedModel || 'Seleccionar modelo'}
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent>
                {llms.map((llm) => (
                  <SelectItem key={llm.llm_id} value={llm.model}>
                    {llm.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {FIELD_TYPE_ICONS[fieldType]}
              <span>
                {fieldType === 'string'
                  ? 'Texto'
                  : fieldType === 'selector'
                  ? 'Selector'
                  : fieldType === 'boolean'
                  ? 'Sí/No'
                  : fieldType === 'number'
                  ? 'Número'
                  : 'Lista'}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="fieldName">Nombre</Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor="optional" className="text-sm text-muted-foreground">
                    Opcional
                  </Label>
                  <Switch id="optional" checked={isOptional} onCheckedChange={setIsOptional} />
                </div>
              </div>
              <Input
                id="fieldName"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="nombre_del_campo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción del campo..."
                className="min-h-[80px] resize-none"
              />
            </div>

            {fieldType !== 'boolean' && fieldType !== 'number' && (
              <div className="space-y-2">
                <Label>{fieldType === 'selector' ? 'Opciones' : 'Ejemplo de Formato (Opcional)'}</Label>
                {formatExamples.map((example, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={example}
                      onChange={(e) => handleUpdateFormatExample(index, e.target.value)}
                      placeholder={fieldType === 'selector' ? 'Opción...' : 'Ejemplo de formato...'}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFormatExample(index)}
                      className="h-9 w-9 shrink-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path
                          d="M12.375 4.95H15.75V6.3H14.4V15.075C14.4 15.254 14.3289 15.4257 14.2023 15.5523C14.0757 15.6789 13.904 15.75 13.725 15.75H4.275C4.09598 15.75 3.92429 15.6789 3.7977 15.5523C3.67112 15.4257 3.6 15.254 3.6 15.075V6.3H2.25V4.95H5.625V2.925C5.625 2.74598 5.69612 2.57429 5.8227 2.4477C5.94929 2.32112 6.12098 2.25 6.3 2.25H11.7C11.879 2.25 12.0507 2.32112 12.1773 2.4477C12.3039 2.57429 12.375 2.74598 12.375 2.925V4.95ZM13.05 6.3H4.95V14.4H13.05V6.3ZM6.975 8.325H8.325V12.375H6.975V8.325ZM9.675 8.325H11.025V12.375H9.675V8.325ZM6.975 3.6V4.95H11.025V3.6H6.975Z"
                          fill="currentColor"
                          className="text-muted-foreground"
                        />
                      </svg>
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddFormatExample} className="w-full">
                  + Agregar
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveField}>{editingField ? 'Actualizar' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
