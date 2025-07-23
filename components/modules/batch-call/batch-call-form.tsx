// @ts-nocheck
'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronLeft, Info, Download, UploadCloud, Loader2 } from 'lucide-react';
import { apiService } from '@/services';

interface BatchCallFormProps {
  onBack?: () => void;
  onSubmit?: (data: any) => Promise<void>;
}

interface CsvData {
  headers: string[];
  rows: string[][];
}

interface PhoneNumber {
  phone_number: string;
  phone_number_type: string;
  phone_number_pretty: string;
  inbound_agent_id: string;
  outbound_agent_id: string;
  inbound_agent_version: number;
  outbound_agent_version: number;
  area_code: number;
  nickname: string;
  inbound_webhook_url: string;
  last_modification_timestamp: number;
}

export default function BatchCallForm({ onBack, onSubmit }: BatchCallFormProps) {
  const [sendTime, setSendTime] = useState('now');
  const [formData, setFormData] = useState({
    name: '',
    fromNumber: '',
    recipients: null as File | null
  });
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [loadingPhoneNumbers, setLoadingPhoneNumbers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPhoneNumbers();
  }, []);

  const fetchPhoneNumbers = async () => {
    try {
      setLoadingPhoneNumbers(true);
      const data = await apiService.getPhoneNumbers();
      setPhoneNumbers(data);
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
    } finally {
      setLoadingPhoneNumbers(false);
    }
  };

  const parseCsv = (text: string): CsvData => {
    const lines = text.split('\n').filter((line) => line.trim() !== '');
    if (lines.length === 0) return { headers: [], rows: [] };

    const headers = lines[0].split(',').map((header) => header.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map((line) => line.split(',').map((cell) => cell.trim().replace(/"/g, '')));

    return { headers, rows };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setFormData({ ...formData, recipients: file });

        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const parsed = parseCsv(text);
          setCsvData(parsed);
        };
        reader.readAsText(file);
      } else {
        alert('Por favor, selecciona un archivo CSV');
        event.target.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    document.getElementById('csv-file-input')?.click();
  };

  const handleRemoveFile = () => {
    setFormData({ ...formData, recipients: null });
    setCsvData(null);
    const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (!formData.fromNumber) {
      setError('Por favor, selecciona un número de teléfono');
      return;
    }

    if (!formData.recipients || !csvData?.rows.length) {
      setError('Por favor, sube un archivo CSV con los destinatarios');
      return;
    }

    if (!onSubmit) return;

    setIsSubmitting(true);

    try {
      let formattedFromNumber = formData.fromNumber;
      if (!formattedFromNumber.startsWith('+')) {
        formattedFromNumber = '+' + formattedFromNumber;
      }

      const tasks =
        csvData?.rows.map((row) => {
          let toNumber = row[0];

          if (!toNumber.startsWith('+')) {
            toNumber = '+' + toNumber;
          }

          const task: any = {
            to_number: toNumber
          };

          if (csvData.headers.length > 1) {
            task.retell_llm_dynamic_variables = {};
            csvData.headers.slice(1).forEach((header, index) => {
              task.retell_llm_dynamic_variables[header] = row[index + 1];
            });
          }

          return task;
        }) || [];

      const submitData = {
        batch_call_name: formData.name,
        from_number: formattedFromNumber,
        schedule_type: sendTime,
        trigger_timestamp: sendTime === 'schedule' ? Date.now() + 3600000 : undefined,
        tasks: tasks
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Error al crear la llamada en lote. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto min-w-[600px] max-w-7xl p-6">
        <div className={`grid gap-8 ${csvData && csvData.headers.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <div className="rounded-lg bg-white p-6 shadow-md sm:p-8">
            <div className="mb-6 flex items-center">
              <Button variant="ghost" size="icon" className="mr-2 hover:bg-gray-100" onClick={onBack}>
                <ChevronLeft className="h-6 w-6" />
                <span className="sr-only">Volver</span>
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Crear una llamada en lote</h1>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <Info className="mr-1 h-4 w-4" />
                  <span>Costo de llamada en lote $0.005 por marcación</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="batchCallName" className="mb-1 block text-sm font-medium text-gray-700">
                  Nombre de la llamada en lote
                </Label>
                <Input
                  id="batchCallName"
                  placeholder="Ingresar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="focus:border-primary-500 focus:ring-primary-500 border-gray-300"
                  required
                />
              </div>

              <div>
                <Label htmlFor="fromNumber" className="mb-1 block text-sm font-medium text-gray-700">
                  Número de origen *
                </Label>
                <Select
                  value={formData.fromNumber}
                  onValueChange={(value) => setFormData({ ...formData, fromNumber: value })}
                  disabled={loadingPhoneNumbers}
                  required
                >
                  <SelectTrigger
                    id="fromNumber"
                    className={`focus:border-primary-500 focus:ring-primary-500 border-gray-300 ${
                      error && !formData.fromNumber ? 'border-red-500' : ''
                    }`}
                  >
                    <SelectValue placeholder={loadingPhoneNumbers ? 'Cargando números...' : 'Seleccionar un número'} />
                  </SelectTrigger>
                  <SelectContent>
                    {phoneNumbers.map((phoneNumber) => (
                      <SelectItem key={phoneNumber.phone_number} value={phoneNumber.phone_number}>
                        {phoneNumber.phone_number_pretty} ({phoneNumber.nickname})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {error && !formData.fromNumber && <p className="mt-1 text-sm text-red-600">{error}</p>}
              </div>

              <div>
                <Label className="mb-1 block text-sm font-medium text-gray-700">Subir destinatarios</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="mb-3 w-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50 sm:w-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar la plantilla
                </Button>

                <input id="csv-file-input" type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />

                {formData.recipients ? (
                  <div className="mt-1 flex h-12 items-center justify-center gap-4 rounded-lg border border-gray-200 bg-white px-3">
                    <div className="relative h-8 w-8">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M24.2 31.4H7.8C5.4804 31.4 3.6 29.5196 3.6 27.2V4.8C3.6 2.4804 5.4804 0.6 7.8 0.6H16.471C17.5737 0.6 18.6321 1.03361 19.4178 1.80722L27.1467 9.41728C27.9485 10.2067 28.4 11.2849 28.4 12.4101V27.2C28.4 29.5196 26.5196 31.4 24.2 31.4Z"
                          fill="white"
                          stroke="#CACFD8"
                          strokeWidth="1.2"
                        />
                        <path d="M18 1V7.8C18 9.56731 19.4327 11 21.2 11H28" stroke="#CACFD8" strokeWidth="1.2" />
                        <path
                          d="M0 17C0 15.3431 1.34315 14 3 14H22C23.6569 14 25 15.3431 25 17V25C25 26.6569 23.6569 28 22 28H3C1.34315 28 0 26.6569 0 25V17Z"
                          fill="#FB3748"
                        />
                        <path
                          d="M9.10938 19.7594H7.94063C7.90729 19.5677 7.84583 19.3979 7.75625 19.25C7.66667 19.1 7.55521 18.9729 7.42188 18.8687C7.28854 18.7646 7.13646 18.6865 6.96563 18.6344C6.79688 18.5802 6.61458 18.5531 6.41875 18.5531C6.07083 18.5531 5.7625 18.6406 5.49375 18.8156C5.225 18.9885 5.01458 19.2427 4.8625 19.5781C4.71042 19.9115 4.63438 20.3187 4.63438 20.8C4.63438 21.2896 4.71042 21.7021 4.8625 22.0375C5.01667 22.3708 5.22708 22.6229 5.49375 22.7937C5.7625 22.9625 6.06979 23.0469 6.41563 23.0469C6.60729 23.0469 6.78646 23.0219 6.95313 22.9719C7.12188 22.9198 7.27292 22.8437 7.40625 22.7437C7.54167 22.6437 7.65521 22.5208 7.74688 22.375C7.84063 22.2292 7.90521 22.0625 7.94063 21.875L9.10938 21.8812C9.06563 22.1854 8.97083 22.4708 8.825 22.7375C8.68125 23.0042 8.49271 23.2396 8.25938 23.4437C8.02604 23.6458 7.75313 23.8042 7.44063 23.9187C7.12813 24.0312 6.78125 24.0875 6.4 24.0875C5.8375 24.0875 5.33542 23.9573 4.89375 23.6969C4.45208 23.4365 4.10417 23.0604 3.85 22.5687C3.59583 22.0771 3.46875 21.4875 3.46875 20.8C3.46875 20.1104 3.59688 19.5208 3.85313 19.0312C4.10938 18.5396 4.45833 18.1635 4.9 17.9031C5.34167 17.6427 5.84167 17.5125 6.4 17.5125C6.75625 17.5125 7.0875 17.5625 7.39375 17.6625C7.7 17.7625 7.97292 17.9094 8.2125 18.1031C8.45208 18.2948 8.64896 18.5302 8.80313 18.8094C8.95938 19.0865 9.06146 19.4031 9.10938 19.7594ZM13.8252 19.3594C13.7961 19.0865 13.6731 18.874 13.4565 18.7219C13.2419 18.5698 12.9627 18.4937 12.619 18.4937C12.3773 18.4937 12.17 18.5302 11.9971 18.6031C11.8242 18.676 11.6919 18.775 11.6002 18.9C11.5086 19.025 11.4617 19.1677 11.4596 19.3281C11.4596 19.4615 11.4898 19.5771 11.5502 19.675C11.6127 19.7729 11.6971 19.8562 11.8033 19.925C11.9096 19.9917 12.0273 20.0479 12.1565 20.0937C12.2856 20.1396 12.4158 20.1781 12.5471 20.2094L13.1471 20.3594C13.3888 20.4156 13.6211 20.4917 13.844 20.5875C14.069 20.6833 14.27 20.8042 14.4471 20.95C14.6263 21.0958 14.7679 21.2719 14.8721 21.4781C14.9763 21.6844 15.0283 21.926 15.0283 22.2031C15.0283 22.5781 14.9325 22.9083 14.7408 23.1937C14.5492 23.4771 14.2721 23.699 13.9096 23.8594C13.5492 24.0177 13.1127 24.0969 12.6002 24.0969C12.1023 24.0969 11.67 24.0198 11.3033 23.8656C10.9388 23.7115 10.6533 23.4865 10.4471 23.1906C10.2429 22.8948 10.1325 22.5344 10.1158 22.1094H11.2565C11.2731 22.3323 11.3419 22.5177 11.4627 22.6656C11.5836 22.8135 11.7408 22.924 11.9346 22.9969C12.1304 23.0698 12.3492 23.1062 12.5908 23.1062C12.8429 23.1062 13.0638 23.0687 13.2533 22.9937C13.445 22.9167 13.595 22.8104 13.7033 22.675C13.8117 22.5375 13.8669 22.3771 13.869 22.1937C13.8669 22.0271 13.8179 21.8896 13.7221 21.7812C13.6263 21.6708 13.4919 21.5792 13.319 21.5062C13.1481 21.4312 12.9481 21.3646 12.719 21.3062L11.9908 21.1187C11.4638 20.9833 11.0471 20.7781 10.7408 20.5031C10.4367 20.226 10.2846 19.8583 10.2846 19.4C10.2846 19.0229 10.3867 18.6927 10.5908 18.4094C10.7971 18.126 11.0773 17.9062 11.4315 17.75C11.7856 17.5917 12.1867 17.5125 12.6346 17.5125C13.0888 17.5125 13.4867 17.5917 13.8283 17.75C14.1721 17.9062 14.4419 18.124 14.6377 18.4031C14.8336 18.6802 14.9346 18.999 14.9408 19.3594H13.8252ZM17.0942 17.6L18.7598 22.6375H18.8254L20.4879 17.6H21.7629L19.5067 24H18.0754L15.8223 17.6H17.0942Z"
                          fill="white"
                        />
                      </svg>
                    </div>
                    <div className="inline-flex grow flex-col">
                      <div className="text-sm font-normal leading-tight text-gray-950">{formData.recipients.name}</div>
                      <div className="text-xs font-normal leading-none text-gray-600">
                        {csvData?.rows.length || 0} Destinatarios
                      </div>
                    </div>
                    <div className="flex cursor-pointer items-center justify-center" onClick={handleRemoveFile}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="delete-bin-line">
                          <path
                            id="Vector"
                            d="M13.75 5.5H17.5V7H16V16.75C16 16.9489 15.921 17.1397 15.7803 17.2803C15.6397 17.421 15.4489 17.5 15.25 17.5H4.75C4.55109 17.5 4.36032 17.421 4.21967 17.2803C4.07902 17.1397 4 16.9489 4 16.75V7H2.5V5.5H6.25V3.25C6.25 3.05109 6.32902 2.86032 6.46967 2.71967C6.61032 2.57902 6.80109 2.5 7 2.5H13C13.1989 2.5 13.3897 2.57902 13.5303 2.71967C13.671 2.86032 13.75 3.05109 13.75 3.25V5.5ZM14.5 7H5.5V16H14.5V7ZM7.75 9.25H9.25V13.75H7.75V9.25ZM10.75 9.25H12.25V13.75H10.75V9.25ZM7.75 4V5.5H12.25V4H7.75Z"
                            fill="#525866"
                          />
                        </g>
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div
                    className="mt-1 flex cursor-pointer justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-12 pt-10 transition-colors hover:border-gray-400"
                    onClick={handleUploadClick}
                  >
                    <div className="space-y-1 text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="text-sm text-gray-600">Elige un CSV o arrástralo y suéltalo aquí.</p>
                      <p className="text-xs text-gray-500">Hasta 50 MB</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label className="mb-3 block text-sm font-medium text-gray-700">¿Cuándo enviar las llamadas?</Label>
                <RadioGroup value={sendTime} onValueChange={setSendTime} className="grid grid-cols-2 gap-4">
                  <div>
                    <RadioGroupItem value="now" id="sendNow" className="sr-only" />
                    <Label
                      htmlFor="sendNow"
                      className={`flex cursor-pointer items-center justify-between rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors
              ${
                sendTime === 'now'
                  ? 'border-blue-500 bg-blue-50 text-gray-900'
                  : 'border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
                    >
                      <span>Enviar ahora</span>
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2
              ${sendTime === 'now' ? 'border-blue-500 bg-blue-500' : 'border-gray-400 bg-white'}`}
                      >
                        {sendTime === 'now' && <div className="h-2 w-2 rounded-full bg-white"></div>}
                      </div>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="schedule" id="schedule" className="sr-only" />
                    <Label
                      htmlFor="schedule"
                      className={`flex cursor-pointer items-center justify-between rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors
              ${
                sendTime === 'schedule'
                  ? 'border-blue-500 bg-blue-50 text-gray-900'
                  : 'border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
                    >
                      <span>Programar</span>
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2
              ${sendTime === 'schedule' ? 'border-blue-500 bg-blue-500' : 'border-gray-400 bg-white'}`}
                      >
                        {sendTime === 'schedule' && <div className="h-2 w-2 rounded-full bg-white"></div>}
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="estimatedTime" className="mb-1 block text-sm font-medium text-gray-700">
                  Tiempo estimado para completar las llamadas
                </Label>
                <Input
                  id="estimatedTime"
                  value={
                    csvData?.rows.length
                      ? `Estimado 5min (Asumiendo duración de llamada de 5min)`
                      : 'Por favor, añade destinatarios primero'
                  }
                  disabled
                  className="cursor-not-allowed border-gray-300 bg-gray-100"
                />
                {csvData?.rows.length && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">¿Quieres acelerar el tiempo? </span>
                    <button type="button" className="text-sm text-blue-600 hover:underline">
                      + Comprar más concurrencia
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Guardar como borrador
                </Button>
                <Button type="submit" className="bg-gray-900 text-white hover:bg-gray-800" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar'
                  )}
                </Button>
              </div>
            </form>
          </div>

          {csvData && csvData.headers.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Destinatarios</h3>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="max-h-96 overflow-x-auto overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr>
                        {csvData.headers.map((header, index) => (
                          <th
                            key={index}
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {csvData.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
