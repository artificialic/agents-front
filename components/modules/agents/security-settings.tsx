import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Settings, Info } from 'lucide-react';
import { apiService } from '@/services';

interface SecuritySettingsProps {
  llm: Llm;
  agent: Agent;
  onAgentUpdate: () => Promise<void>;
  onLlmUpdate: () => Promise<void>;
}

export function SecuritySettings({ llm, agent, onAgentUpdate, onLlmUpdate }: SecuritySettingsProps) {
  const [dataStorage, setDataStorage] = useState(agent.data_storage_setting || 'everything');
  const [optInSecureUrls, setOptInSecureUrls] = useState(agent.opt_in_signed_url || false);
  const [isPiiDialogOpen, setIsPiiDialogOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isDynamicVarsDialogOpen, setIsDynamicVarsDialogOpen] = useState(false);
  const [dynamicVariables, setDynamicVariables] = useState<Array<{ key: string; value: string }>>([]);

  useEffect(() => {
    if (agent.pii_config?.categories) {
      setSelectedCategories(agent.pii_config.categories);
    }
  }, [agent.pii_config]);

  useEffect(() => {
    if (llm.default_dynamic_variables) {
      const vars = Object.entries(llm.default_dynamic_variables).map(([key, value]) => ({
        key,
        value: String(value)
      }));
      setDynamicVariables(vars);
    }
  }, [llm.default_dynamic_variables]);

  const handleDataStorageChange = async (value: string) => {
    try {
      setDataStorage(value);
      await apiService.updateAgent(agent.agent_id, { data_storage_setting: value });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating data storage setting:', error);
    }
  };

  const handleOptInSecureUrlsChange = async (checked: boolean) => {
    try {
      setOptInSecureUrls(checked);
      await apiService.updateAgent(agent.agent_id, { opt_in_signed_url: checked });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating opt in secure URLs:', error);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleSavePiiConfig = async () => {
    try {
      await apiService.updateAgent(agent.agent_id, {
        pii_config: {
          mode: 'post_call',
          categories: selectedCategories
        }
      });
      await onAgentUpdate();
      setIsPiiDialogOpen(false);
    } catch (error) {
      console.error('Error updating PII config:', error);
    }
  };

  const handleAddDynamicVariable = () => {
    setDynamicVariables([...dynamicVariables, { key: '', value: '' }]);
  };

  const handleRemoveDynamicVariable = (index: number) => {
    setDynamicVariables(dynamicVariables.filter((_, i) => i !== index));
  };

  const handleDynamicVariableChange = (index: number, field: 'key' | 'value', value: string) => {
    const newVars = [...dynamicVariables];
    newVars[index][field] = value;
    setDynamicVariables(newVars);
  };

  const handleSaveDynamicVariables = async () => {
    try {
      const varsObject = dynamicVariables.reduce(
        (acc, { key, value }) => {
          if (key.trim()) {
            acc[key.trim()] = value;
          }
          return acc;
        },
        {} as Record<string, string>
      );

      await apiService.updateLlm(llm.llm_id, {
        default_dynamic_variables: Object.keys(varsObject).length > 0 ? varsObject : undefined
      });
      await onLlmUpdate();
      setIsDynamicVarsDialogOpen(false);
    } catch (error) {
      console.error('Error updating dynamic variables:', error);
    }
  };

  const piiCategories = {
    'Información de Identidad': [
      { id: 'person_name', label: 'Nombre de Persona' },
      { id: 'date_of_birth', label: 'Fecha de Nacimiento' },
      { id: 'customer_account_number', label: 'Número de Cuenta del Cliente' }
    ],
    'Información de Contacto': [
      { id: 'address', label: 'Dirección' },
      { id: 'email', label: 'Correo Electrónico' },
      { id: 'phone_number', label: 'Número de Teléfono' }
    ],
    'Identificadores Gubernamentales': [
      { id: 'ssn', label: 'NSS' },
      { id: 'passport', label: 'Pasaporte' },
      { id: 'driver_license', label: 'Licencia de Conducir' }
    ],
    'Información Financiera': [
      { id: 'credit_card', label: 'Tarjeta de Crédito' },
      { id: 'bank_account', label: 'Cuenta Bancaria' }
    ],
    'Credenciales de Seguridad': [
      { id: 'password', label: 'Contraseña' },
      { id: 'pin', label: 'PIN' }
    ],
    'Información de Salud': [{ id: 'medical_id', label: 'ID Médico' }]
  };

  return (
    <div className="space-y-6 py-2 pl-7 pr-3">
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="text-sm font-medium">Configuración de Almacenamiento de Datos</div>
          <p className="text-xs text-muted-foreground">Elige cómo almacenar datos sensibles (Más información)</p>
        </div>

        <RadioGroup value={dataStorage} onValueChange={handleDataStorageChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="everything" id="everything" />
            <Label htmlFor="everything" className="cursor-pointer text-sm font-normal">
              Todo
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="everything_except_pii" id="everything_except_pii" />
            <Label htmlFor="everything_except_pii" className="cursor-pointer text-sm font-normal">
              Todo excepto PII
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="basic_attributes_only" id="basic_attributes_only" />
            <Label htmlFor="basic_attributes_only" className="cursor-pointer text-sm font-normal">
              Solo Atributos Básicos
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="inline-flex">
                    <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Almacena solo metadatos, toda transcripción, grabación y datos PII serán eliminados
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="text-sm font-medium">Redacción de Información Personal (PII)</div>
          <p className="text-xs text-muted-foreground">
            Solo redacta las categorías específicas de datos sensibles que elijas, mientras preservas otras grabaciones
            de llamadas, transcripciones y análisis.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsPiiDialogOpen(true)}>
          <Settings className="h-4 w-4" />
          {selectedCategories.length > 0 ? `Configurar (${selectedCategories.length})` : 'Configurar'}
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm font-medium">URLs Seguras</div>
            <p className="text-xs text-muted-foreground">
              Agrega firmas de seguridad a las URLs. Las URLs expiran después de 24 horas. (Más información)
            </p>
          </div>
          <Switch checked={optInSecureUrls} onCheckedChange={handleOptInSecureUrlsChange} />
        </div>
      </div>

{/*      <div className="space-y-3">
        <div className="space-y-1">
          <div className="text-sm font-medium">ID de Voz de Respaldo</div>
          <p className="text-xs text-muted-foreground">
            Si el proveedor de voz actual falla, asigna una voz de respaldo para continuar la llamada.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          + Agregar
        </Button>
      </div>*/}

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="text-sm font-medium">Variables Dinámicas Predeterminadas</div>
          <p className="text-xs text-muted-foreground">
            Establece valores de respaldo para variables dinámicas en todos los puntos finales si no se proporcionan.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsDynamicVarsDialogOpen(true)}>
          <Settings className="h-4 w-4" />
          {dynamicVariables.length > 0 ? `Configurar (${dynamicVariables.length})` : 'Configurar'}
        </Button>
      </div>

      <Dialog open={isPiiDialogOpen} onOpenChange={setIsPiiDialogOpen}>
        <DialogContent className="max-h-[80vh] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Redacción de Información Personal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {Object.entries(piiCategories).map(([section, categories]) => (
              <div key={section} className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">{section}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label htmlFor={category.id} className="cursor-pointer text-sm font-normal">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPiiDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePiiConfig}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDynamicVarsDialogOpen} onOpenChange={setIsDynamicVarsDialogOpen}>
        <DialogContent className="max-h-[80vh] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Variables Dinámicas Predeterminadas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Establece valores de respaldo para variables dinámicas en todos los puntos finales si no se proporcionan.
            </p>

            {dynamicVariables.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-4 border-b border-gray-200 bg-gray-50 p-3">
                  <div className="text-sm font-medium text-gray-700">Nombre de Variable</div>
                  <div className="text-sm font-medium text-gray-700">Valor Predeterminado</div>
                </div>
                <div className="space-y-3 p-3">
                  {dynamicVariables.map((variable, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                      <Input
                        value={variable.key}
                        onChange={(e) => handleDynamicVariableChange(index, 'key', e.target.value)}
                        placeholder="nombre"
                      />
                      <Input
                        value={variable.value}
                        onChange={(e) => handleDynamicVariableChange(index, 'value', e.target.value)}
                        placeholder="valor"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDynamicVariable(index)}
                        className="h-9 w-9"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button variant="outline" size="sm" onClick={handleAddDynamicVariable} className="w-full">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mr-2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Agregar
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDynamicVarsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveDynamicVariables}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
