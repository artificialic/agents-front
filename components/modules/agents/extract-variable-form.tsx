import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { IconPlus, IconDeleteSmall, IconCode } from '@/components/modules/agents/icons';

interface Variable {
  name: string;
  description: string;
  type: string;
}

interface ExtractVariableFormProps {
  variables: Variable[];
  setVariables: (value: Variable[]) => void;
}

export function ExtractVariableForm({ variables, setVariables }: ExtractVariableFormProps) {
  const [isVariableDialogOpen, setIsVariableDialogOpen] = useState(false);
  const [editingVariableIndex, setEditingVariableIndex] = useState<number | null>(null);
  const [variableName, setVariableName] = useState('');
  const [variableDescription, setVariableDescription] = useState('');
  const [variableType, setVariableType] = useState('string');

  const handleAddVariable = () => {
    setEditingVariableIndex(null);
    setVariableName('');
    setVariableDescription('');
    setVariableType('string');
    setIsVariableDialogOpen(true);
  };

  const handleEditVariable = (index: number) => {
    const variable = variables[index];
    setEditingVariableIndex(index);
    setVariableName(variable.name);
    setVariableDescription(variable.description);
    setVariableType(variable.type);
    setIsVariableDialogOpen(true);
  };

  const handleSaveVariable = () => {
    if (!variableName.trim()) {
      return;
    }

    const newVariable: Variable = {
      name: variableName.trim(),
      description: variableDescription.trim(),
      type: variableType
    };

    if (editingVariableIndex !== null) {
      const newVariables = [...variables];
      newVariables[editingVariableIndex] = newVariable;
      setVariables(newVariables);
    } else {
      setVariables([...variables, newVariable]);
    }

    setIsVariableDialogOpen(false);
  };

  const handleDeleteVariable = (index: number) => {
    const newVariables = variables.filter((_, i) => i !== index);
    setVariables(newVariables);
  };

  return (
    <>
      <div className="space-y-2">
        <Label className="text-text-strong-950 text-sm font-medium leading-normal">Variables</Label>
        <div className="text-xs text-muted-foreground">Define las variables que deseas extraer de la conversación</div>

        {variables.length > 0 && (
          <div className="space-y-2 rounded-lg border p-3">
            {variables.map((variable, index) => (
              <div key={index} className="flex items-center justify-between rounded-md border bg-muted/50 p-3">
                <div className="flex items-center gap-3">
                  <IconCode />
                  <div className="flex flex-col">
                    <div className="text-sm font-medium">{variable.name}</div>
                    <div className="text-xs text-muted-foreground">{variable.description}</div>
                    <div className="mt-1 text-xs text-muted-foreground">Tipo: {variable.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleEditVariable(index)}>
                    Editar
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteVariable(index)}>
                    <IconDeleteSmall />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button type="button" variant="outline" size="sm" onClick={handleAddVariable} className="mt-1 gap-2">
          <IconPlus />
          <span className="text-text-strong-950 px-1 text-sm font-medium leading-normal">Agregar</span>
        </Button>
      </div>

      <Dialog open={isVariableDialogOpen} onOpenChange={setIsVariableDialogOpen}>
        <DialogContent className="w-[640px]">
          <DialogHeader>
            <DialogTitle className="text-text-strong-950 text-lg font-medium leading-normal">Variables</DialogTitle>
          </DialogHeader>
          <div className="flex w-full flex-col items-start justify-start gap-4 px-1 py-3">
            <div className="flex w-full flex-col gap-1">
              <Label className="text-text-strong-950 text-sm font-medium leading-normal">Nombre de Variable</Label>
              <Input
                value={variableName}
                onChange={(e) => setVariableName(e.target.value)}
                placeholder="ej. email / edad"
                className="h-10 rounded-lg"
              />
            </div>
            <div className="flex w-full flex-col gap-1">
              <Label className="text-text-strong-950 text-sm font-medium leading-normal">Descripción de Variable</Label>
              <Textarea
                value={variableDescription}
                onChange={(e) => setVariableDescription(e.target.value)}
                placeholder="ej. Extraer la dirección de correo electrónico del usuario de la conversación"
                rows={3}
                className="h-auto resize-none rounded-lg"
              />
            </div>
            <div className="flex w-full flex-col gap-1">
              <div className="flex flex-row gap-1">
                <Label className="text-text-strong-950 text-sm font-medium leading-normal">Tipo de Variable</Label>
                <span className="text-text-sub-600 text-sm font-normal leading-tight">(Opcional)</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 w-full justify-between rounded-lg hover:shadow-[0px_0px_0px_3px_theme(colors.bg-weak-50)]"
                  >
                    <span>
                      {variableType === 'string'
                        ? 'Texto'
                        : variableType === 'number'
                        ? 'Número'
                        : variableType === 'boolean'
                        ? 'Booleano'
                        : variableType}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-2 h-4 w-4 opacity-50"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setVariableType('string')}>Texto</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setVariableType('number')}>Número</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setVariableType('boolean')}>Booleano</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setVariableType('array')}>Array</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setVariableType('object')}>Objeto</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <DialogFooter className="inline-flex w-full items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setIsVariableDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveVariable}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
