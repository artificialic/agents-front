// @ts-nocheck
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import type { Llm } from '@/services/types';
import { apiService } from '@/services';

interface FunctionsSettingsProps {
  llm: Llm;
  onLlmUpdate: () => void;
}

interface FunctionTool {
  name: string;
  type: string;
  description?: string;
}

export function FunctionsSettings({ llm, onLlmUpdate }: FunctionsSettingsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFunction, setEditingFunction] = useState<FunctionTool | null>(null);
  const [functionName, setFunctionName] = useState('');
  const [functionDescription, setFunctionDescription] = useState('');
  const [deletingFunction, setDeletingFunction] = useState<string | null>(null);

  const handleAddFunction = () => {
    setEditingFunction(null);
    setFunctionName('');
    setFunctionDescription('');
    setIsDialogOpen(true);
  };

  const handleEditFunction = (func: FunctionTool) => {
    setEditingFunction(func);
    setFunctionName(func.name);
    setFunctionDescription(func.description || '');
    setIsDialogOpen(true);
  };

  const handleDeleteFunction = async (funcName: string) => {
    setDeletingFunction(funcName);
    try {
      const updatedTools = llm.general_tools?.filter((tool) => tool.name !== funcName) || [];
      await apiService.updateLlm(llm.llm_id, { general_tools: updatedTools });
      await onLlmUpdate();
    } catch (error) {
      console.error('Error deleting function:', error);
    } finally {
      setDeletingFunction(null);
    }
  };

  const handleSaveFunction = async () => {
    try {
      const currentTools = llm.general_tools || [];
      let updatedTools;

      if (editingFunction) {
        updatedTools = currentTools.map((tool) =>
          tool.name === editingFunction.name ? { ...tool, name: functionName, description: functionDescription } : tool
        );
      } else {
        updatedTools = [
          ...currentTools,
          {
            name: functionName,
            type: 'end_call',
            description: functionDescription
          }
        ];
      }

      await apiService.updateLlm(llm.llm_id, { general_tools: updatedTools });
      await onLlmUpdate();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving function:', error);
    }
  };

  return (
    <div className="flex flex-col items-start px-7 pb-4 pt-0">
      <div className="text-xs font-normal leading-none text-muted-foreground">
        Habilita tu agente con capacidades como reservas de calendario, finalización de llamadas, etc.
      </div>
      <div className="mt-2 flex w-full flex-col gap-1">
        {llm.general_tools?.map((tool) => (
          <div
            key={tool.name}
            className="inline-flex h-8 w-full items-center justify-start gap-1 rounded-lg border-none bg-muted/50 p-1.5"
          >
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M14.6466 12.2197C14.6466 12.4597 14.5933 12.7063 14.4799 12.9463C14.3666 13.1863 14.2199 13.413 14.0266 13.6263C13.6999 13.9863 13.3399 14.2463 12.9333 14.413C12.5333 14.5797 12.0999 14.6663 11.6333 14.6663C10.9533 14.6663 10.2266 14.5063 9.45992 14.1797C8.69325 13.853 7.92659 13.413 7.16659 12.8597C6.39992 12.2997 5.67325 11.6797 4.97992 10.993C4.29325 10.2997 3.67325 9.57301 3.11992 8.81301C2.57325 8.05301 2.13325 7.29301 1.81325 6.53967C1.49325 5.77967 1.33325 5.05301 1.33325 4.35967C1.33325 3.90634 1.41325 3.47301 1.57325 3.07301C1.73325 2.66634 1.98659 2.29301 2.33992 1.95967C2.76659 1.53967 3.23325 1.33301 3.72659 1.33301C3.91325 1.33301 4.09992 1.37301 4.26659 1.45301C4.43992 1.53301 4.59325 1.65301 4.71325 1.82634L6.25992 4.00634C6.37992 4.17301 6.46659 4.32634 6.52659 4.47301C6.58659 4.61301 6.61992 4.75301 6.61992 4.87967C6.61992 5.03967 6.57325 5.19967 6.47992 5.35301C6.39325 5.50634 6.26659 5.66634 6.10659 5.82634L5.59992 6.35301C5.52659 6.42634 5.49325 6.51301 5.49325 6.61967C5.49325 6.67301 5.49992 6.71967 5.51325 6.77301C5.53325 6.82634 5.55325 6.86634 5.56659 6.90634C5.68659 7.12634 5.89325 7.41301 6.18659 7.75967C6.48659 8.10634 6.80659 8.45967 7.15325 8.81301C7.51325 9.16634 7.85992 9.49301 8.21325 9.79301C8.55992 10.0863 8.84659 10.2863 9.07325 10.4063C9.10659 10.4197 9.14659 10.4397 9.19325 10.4597C9.24659 10.4797 9.29992 10.4863 9.35992 10.4863C9.47325 10.4863 9.55992 10.4463 9.63325 10.373L10.1399 9.87301C10.3066 9.70634 10.4666 9.57967 10.6199 9.49967C10.7733 9.40634 10.9266 9.35967 11.0933 9.35967C11.2199 9.35967 11.3533 9.38634 11.4999 9.44634C11.6466 9.50634 11.7999 9.59301 11.9666 9.70634L14.1733 11.273C14.3466 11.393 14.4666 11.533 14.5399 11.6997C14.6066 11.8663 14.6466 12.033 14.6466 12.2197Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  className="text-muted-foreground"
                />
                <path
                  d="M10.8198 5.17934L13.1798 2.81934"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                />
                <path
                  d="M13.1798 5.17934L10.8198 2.81934"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                />
              </svg>
            </div>
            <div className="truncate text-sm font-normal leading-tight text-muted-foreground">{tool.name}</div>
            <div className="ml-auto flex items-center justify-center gap-0.5 p-px">
              <button
                className="cursor-pointer rounded-sm p-px"
                onClick={() => handleEditFunction(tool)}
                disabled={deletingFunction === tool.name}
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
                onClick={() => handleDeleteFunction(tool.name)}
                disabled={deletingFunction === tool.name}
              >
                <div className="flex h-[18px] w-[18px] cursor-pointer items-center justify-center p-0">
                  {deletingFunction === tool.name ? (
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
        ))}
      </div>
      <div className="mb-2"></div>
      <Button
        variant="outline"
        className="h-8 gap-0.5 rounded-lg border-input p-1.5 text-muted-foreground"
        onClick={handleAddFunction}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M9.25 9.25V4.75H10.75V9.25H15.25V10.75H10.75V15.25H9.25V10.75H4.75V9.25H9.25Z"
            fill="currentColor"
            className="text-muted-foreground"
          />
        </svg>
        <div className="px-1 text-sm font-medium leading-normal">Agregar</div>
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" fill="none">
                <path
                  d="M14.6466 12.2197C14.6466 12.4597 14.5933 12.7063 14.4799 12.9463C14.3666 13.1863 14.2199 13.413 14.0266 13.6263C13.6999 13.9863 13.3399 14.2463 12.9333 14.413C12.5333 14.5797 12.0999 14.6663 11.6333 14.6663C10.9533 14.6663 10.2266 14.5063 9.45992 14.1797C8.69325 13.853 7.92659 13.413 7.16659 12.8597C6.39992 12.2997 5.67325 11.6797 4.97992 10.993C4.29325 10.2997 3.67325 9.57301 3.11992 8.81301C2.57325 8.05301 2.13325 7.29301 1.81325 6.53967C1.49325 5.77967 1.33325 5.05301 1.33325 4.35967C1.33325 3.90634 1.41325 3.47301 1.57325 3.07301C1.73325 2.66634 1.98659 2.29301 2.33992 1.95967C2.76659 1.53967 3.23325 1.33301 3.72659 1.33301C3.91325 1.33301 4.09992 1.37301 4.26659 1.45301C4.43992 1.53301 4.59325 1.65301 4.71325 1.82634L6.25992 4.00634C6.37992 4.17301 6.46659 4.32634 6.52659 4.47301C6.58659 4.61301 6.61992 4.75301 6.61992 4.87967C6.61992 5.03967 6.57325 5.19967 6.47992 5.35301C6.39325 5.50634 6.26659 5.66634 6.10659 5.82634L5.59992 6.35301C5.52659 6.42634 5.49325 6.51301 5.49325 6.61967C5.49325 6.67301 5.49992 6.71967 5.51325 6.77301C5.53325 6.82634 5.55325 6.86634 5.56659 6.90634C5.68659 7.12634 5.89325 7.41301 6.18659 7.75967C6.48659 8.10634 6.80659 8.45967 7.15325 8.81301C7.51325 9.16634 7.85992 9.49301 8.21325 9.79301C8.55992 10.0863 8.84659 10.2863 9.07325 10.4063C9.10659 10.4197 9.14659 10.4397 9.19325 10.4597C9.24659 10.4797 9.29992 10.4863 9.35992 10.4863C9.47325 10.4863 9.55992 10.4463 9.63325 10.373L10.1399 9.87301C10.3066 9.70634 10.4666 9.57967 10.6199 9.49967C10.7733 9.40634 10.9266 9.35967 11.0933 9.35967C11.2199 9.35967 11.3533 9.38634 11.4999 9.44634C11.6466 9.50634 11.7999 9.59301 11.9666 9.70634L14.1733 11.273C14.3466 11.393 14.4666 11.533 14.5399 11.6997C14.6066 11.8663 14.6466 12.033 14.6466 12.2197Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                />
                <path
                  d="M10.8198 5.17934L13.1798 2.81934"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.1798 5.17934L10.8198 2.81934"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {editingFunction ? 'Editar Función' : 'Finalizar Llamada'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={functionName} onChange={(e) => setFunctionName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Input
                id="description"
                value={functionDescription}
                onChange={(e) => setFunctionDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveFunction}>{editingFunction ? 'Actualizar' : 'Crear'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
