import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface CustomFunctionFormProps {
  customUrl: string;
  customMethod: string;
  customTimeoutMs: number;
  customHeaders: Array<{ key: string; value: string }>;
  customQueryParams: Array<{ key: string; value: string }>;
  customResponseVariables: Array<{ key: string; value: string }>;
  speakDuringExecution: boolean;
  speakDuringExecutionDescription: string;
  speakAfterExecution: boolean;
  customParameters: string;
  argsAtRoot: boolean;
  parameterTab: string;
  formParameters: Array<{ name: string; description: string; type: string; required: boolean }>;
  setCustomUrl: (value: string) => void;
  setCustomMethod: (value: string) => void;
  setCustomTimeoutMs: (value: number) => void;
  setCustomHeaders: (value: Array<{ key: string; value: string }>) => void;
  setCustomQueryParams: (value: Array<{ key: string; value: string }>) => void;
  setCustomResponseVariables: (value: Array<{ key: string; value: string }>) => void;
  setSpeakDuringExecution: (value: boolean) => void;
  setSpeakDuringExecutionDescription: (value: string) => void;
  setSpeakAfterExecution: (value: boolean) => void;
  setCustomParameters: (value: string) => void;
  setArgsAtRoot: (value: boolean) => void;
  setParameterTab: (value: string) => void;
  setFormParameters: (value: Array<{ name: string; description: string; type: string; required: boolean }>) => void;
}

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="add-fill">
      <path
        id="Vector"
        d="M7.3998 7.39687V3.79688H8.5998V7.39687H12.1998V8.59687H8.5998V12.1969H7.3998V8.59687H3.7998V7.39687H7.3998Z"
        fill="var(--text-sub-600)"
      />
    </g>
  </svg>
);

const IconDeleteSmall = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M12.375 4.95H15.75V6.3H14.4V15.075C14.4 15.254 14.3289 15.4257 14.2023 15.5523C14.0757 15.6789 13.904 15.75 13.725 15.75H4.275C4.09598 15.75 3.92429 15.6789 3.7977 15.5523C3.67112 15.4257 3.6 15.254 3.6 15.075V6.3H2.25V4.95H5.625V2.925C5.625 2.74598 5.69612 2.57429 5.8227 2.4477C5.94929 2.32112 6.12098 2.25 6.3 2.25H11.7C11.879 2.25 12.0507 2.32112 12.1773 2.4477C12.3039 2.57429 12.375 2.74598 12.375 2.925V4.95ZM13.05 6.3H4.95V14.4H13.05V6.3ZM6.975 8.325H8.325V12.375H6.975V8.325ZM9.675 8.325H11.025V12.375H9.675V8.325ZM6.975 3.6V4.95H11.025V3.6H6.975Z"
      fill="var(--icon-sub-600)"
    />
  </svg>
);

export function CustomFunctionForm({
  customUrl,
  customMethod,
  customTimeoutMs,
  customHeaders,
  customQueryParams,
  customResponseVariables,
  speakDuringExecution,
  speakDuringExecutionDescription,
  speakAfterExecution,
  customParameters,
  argsAtRoot,
  parameterTab,
  formParameters,
  setCustomUrl,
  setCustomMethod,
  setCustomTimeoutMs,
  setCustomHeaders,
  setCustomQueryParams,
  setCustomResponseVariables,
  setSpeakDuringExecution,
  setSpeakDuringExecutionDescription,
  setSpeakAfterExecution,
  setCustomParameters,
  setArgsAtRoot,
  setParameterTab,
  setFormParameters
}: CustomFunctionFormProps) {
  return (
    <>
      <div className="space-y-2">
        <Label>API Endpoint</Label>
        <div className="text-xs text-muted-foreground">La dirección del servicio al que te estás conectando</div>
        <div className="mt-1 flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[140px] justify-between">
                <span className="text-sm">{customMethod}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M9.99956 10.879L13.7121 7.1665L14.7726 8.227L9.99956 13L5.22656 8.227L6.28706 7.1665L9.99956 10.879Z"
                    fill="currentColor"
                  />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setCustomMethod('GET')}>GET</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCustomMethod('POST')}>POST</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCustomMethod('PUT')}>PUT</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCustomMethod('PATCH')}>PATCH</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCustomMethod('DELETE')}>DELETE</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Input
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="Ingrese la URL de la función personalizada"
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tiempo de Espera (ms)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={customTimeoutMs}
            onChange={(e) => setCustomTimeoutMs(parseInt(e.target.value))}
            placeholder="Ingrese el tiempo de espera en milisegundos"
            className="flex-1 rounded-r-none"
          />
          <div className="flex h-10 w-[100px] items-center justify-center rounded-r-lg border">
            <span className="text-sm text-muted-foreground">milisegundos</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <Label>Encabezados</Label>
          <div className="text-xs text-muted-foreground">
            Especifica los encabezados HTTP requeridos para tu solicitud API.
          </div>
        </div>
        <div className="space-y-2">
          {customHeaders.map((header, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={header.key}
                onChange={(e) => {
                  const newHeaders = [...customHeaders];
                  newHeaders[index].key = e.target.value;
                  setCustomHeaders(newHeaders);
                }}
                placeholder="Clave"
                className="flex-1"
              />
              <Input
                value={header.value}
                onChange={(e) => {
                  const newHeaders = [...customHeaders];
                  newHeaders[index].value = e.target.value;
                  setCustomHeaders(newHeaders);
                }}
                placeholder="Valor"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newHeaders = customHeaders.filter((_, i) => i !== index);
                  setCustomHeaders(newHeaders);
                }}
              >
                <IconDeleteSmall />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCustomHeaders([...customHeaders, { key: '', value: '' }])}
            className="gap-2"
          >
            <IconPlus />
            Nuevo par clave-valor
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <Label>Parámetros de Consulta</Label>
          <div className="text-xs text-muted-foreground">Parámetros de cadena de consulta para agregar a la URL.</div>
        </div>
        <div className="space-y-2">
          {customQueryParams.map((param, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={param.key}
                onChange={(e) => {
                  const newParams = [...customQueryParams];
                  newParams[index].key = e.target.value;
                  setCustomQueryParams(newParams);
                }}
                placeholder="Clave"
                className="flex-1"
              />
              <Input
                value={param.value}
                onChange={(e) => {
                  const newParams = [...customQueryParams];
                  newParams[index].value = e.target.value;
                  setCustomQueryParams(newParams);
                }}
                placeholder="Valor"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newParams = customQueryParams.filter((_, i) => i !== index);
                  setCustomQueryParams(newParams);
                }}
              >
                <IconDeleteSmall />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCustomQueryParams([...customQueryParams, { key: '', value: '' }])}
            className="gap-2"
          >
            <IconPlus />
            Nuevo par clave-valor
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <Label>Variables de Respuesta</Label>
          <div className="text-xs text-muted-foreground">
            Valores extraídos de la respuesta de la API guardados como variables dinámicas.
          </div>
        </div>
        <div className="space-y-2">
          {customResponseVariables.map((variable, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={variable.key}
                onChange={(e) => {
                  const newVars = [...customResponseVariables];
                  newVars[index].key = e.target.value;
                  setCustomResponseVariables(newVars);
                }}
                placeholder="Clave"
                className="flex-1"
              />
              <Input
                value={variable.value}
                onChange={(e) => {
                  const newVars = [...customResponseVariables];
                  newVars[index].value = e.target.value;
                  setCustomResponseVariables(newVars);
                }}
                placeholder="Valor"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newVars = customResponseVariables.filter((_, i) => i !== index);
                  setCustomResponseVariables(newVars);
                }}
              >
                <IconDeleteSmall />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCustomResponseVariables([...customResponseVariables, { key: '', value: '' }])}
            className="gap-2"
          >
            <IconPlus />
            Nuevo par clave-valor
          </Button>
        </div>
      </div>

      {(customMethod === 'POST' || customMethod === 'PUT' || customMethod === 'PATCH') && (
        <div className="space-y-2">
          <div>
            <Label>Parámetros (Opcional)</Label>
            <div className="text-xs text-muted-foreground">
              Esquema JSON que define el formato en el cual la LLM retornará. Por favor consulta la{' '}
              <a href="#" className="underline">
                documentación
              </a>
              .
            </div>
          </div>
          <Tabs value={parameterTab} onValueChange={setParameterTab} className="w-full">
            <div className="flex items-center justify-between">
              <TabsList className="h-8">
                <TabsTrigger value="json" className="text-xs">
                  JSON
                </TabsTrigger>
                <TabsTrigger value="form" className="text-xs">
                  Formulario
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Payload: solo args</span>
                <Switch checked={argsAtRoot} onCheckedChange={setArgsAtRoot} />
              </div>
            </div>
            <TabsContent value="json" className="mt-2 space-y-2">
              <Textarea
                value={customParameters}
                onChange={(e) => setCustomParameters(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                placeholder="Ingrese el esquema JSON"
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCustomParameters(
                      '{\n  "type": "object",\n  "properties": {\n    "campo1": {\n      "type": "string",\n      "description": "Descripción del campo 1"\n    }\n  },\n  "required": ["campo1"]\n}'
                    );
                  }}
                >
                  ejemplo 1
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCustomParameters(
                      '{\n  "type": "object",\n  "properties": {\n    "nombre": {\n      "type": "string"\n    },\n    "edad": {\n      "type": "number"\n    }\n  }\n}'
                    );
                  }}
                >
                  ejemplo 2
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCustomParameters(
                      '{\n  "type": "object",\n  "properties": {\n    "items": {\n      "type": "array",\n      "items": {\n        "type": "string"\n      }\n    }\n  }\n}'
                    );
                  }}
                >
                  ejemplo 3
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  try {
                    const parsed = JSON.parse(customParameters);
                    setCustomParameters(JSON.stringify(parsed, null, 2));
                  } catch (e) {}
                }}
              >
                Formatear JSON
              </Button>
            </TabsContent>
            <TabsContent value="form" className="mt-2">
              <div className="space-y-2">
                <div className="grid grid-cols-[272px_272px_152px_72px] gap-2 border-b pb-2">
                  <div className="text-sm text-muted-foreground">Nombre del Parámetro</div>
                  <div className="text-sm text-muted-foreground">Descripción</div>
                  <div className="text-sm text-muted-foreground">Tipo</div>
                  <div className="text-sm text-muted-foreground">Requerido</div>
                </div>

                {formParameters.map((param, index) => (
                  <div key={index} className="grid grid-cols-[272px_272px_152px_72px] items-center gap-2">
                    <Input
                      value={param.name}
                      onChange={(e) => {
                        const newParams = [...formParameters];
                        newParams[index].name = e.target.value;
                        setFormParameters(newParams);
                      }}
                      placeholder="Nombre del Parámetro"
                      className="h-8"
                    />
                    <Input
                      value={param.description}
                      onChange={(e) => {
                        const newParams = [...formParameters];
                        newParams[index].description = e.target.value;
                        setFormParameters(newParams);
                      }}
                      placeholder="Descripción"
                      className="h-8"
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-8 w-full justify-between">
                          <span className="text-sm">{param.type}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M9.99956 10.879L13.7121 7.1665L14.7726 8.227L9.99956 13L5.22656 8.227L6.28706 7.1665L9.99956 10.879Z"
                              fill="currentColor"
                            />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => {
                            const newParams = [...formParameters];
                            newParams[index].type = 'string';
                            setFormParameters(newParams);
                          }}
                        >
                          string
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const newParams = [...formParameters];
                            newParams[index].type = 'number';
                            setFormParameters(newParams);
                          }}
                        >
                          number
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const newParams = [...formParameters];
                            newParams[index].type = 'boolean';
                            setFormParameters(newParams);
                          }}
                        >
                          boolean
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const newParams = [...formParameters];
                            newParams[index].type = 'array';
                            setFormParameters(newParams);
                          }}
                        >
                          array
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const newParams = [...formParameters];
                            newParams[index].type = 'object';
                            setFormParameters(newParams);
                          }}
                        >
                          object
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="flex items-center justify-center gap-2">
                      <Checkbox
                        checked={param.required}
                        onCheckedChange={(checked) => {
                          const newParams = [...formParameters];
                          newParams[index].required = checked as boolean;
                          setFormParameters(newParams);
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          const newParams = formParameters.filter((_, i) => i !== index);
                          setFormParameters(newParams);
                        }}
                      >
                        <IconDeleteSmall />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormParameters([
                      ...formParameters,
                      { name: '', description: '', type: 'string', required: false }
                    ])
                  }
                  className="gap-2"
                >
                  <IconPlus />
                  Agregar
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="speakDuringExecution"
            checked={speakDuringExecution}
            onCheckedChange={(checked) => setSpeakDuringExecution(checked as boolean)}
          />
          <Label htmlFor="speakDuringExecution" className="cursor-pointer">
            Hablar Durante la Ejecución
          </Label>
        </div>
        <div className="ml-6 text-xs text-muted-foreground">
          Si la función toma más de 2 segundos, el agente puede decir algo como: &quot;Déjame revisar eso por ti.&quot;
        </div>
        {speakDuringExecution && (
          <Input
            value={speakDuringExecutionDescription}
            onChange={(e) => setSpeakDuringExecutionDescription(e.target.value)}
            placeholder="Ingrese la descripción del mensaje de ejecución"
            className="mt-1"
          />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="speakAfterExecution"
            checked={speakAfterExecution}
            onCheckedChange={(checked) => setSpeakAfterExecution(checked as boolean)}
          />
          <Label htmlFor="speakAfterExecution" className="cursor-pointer">
            Hablar Después de la Ejecución
          </Label>
        </div>
        <div className="ml-6 text-xs text-muted-foreground">
          Desmarca si deseas ejecutar la función silenciosamente, como cargar el resultado de la llamada al servidor de
          forma silenciosa.
        </div>
      </div>
    </>
  );
}
