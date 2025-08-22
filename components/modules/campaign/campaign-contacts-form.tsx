
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ChevronLeft, UploadCloud, Loader2 } from 'lucide-react';
import { apiService } from '@/services';
import { downloadFile } from '@/lib/utils';

interface CampaignContactsFormProps {
  campaignId: string;
  campaignName: string;
  onBack?: () => void;
  onSubmit?: () => void;
}

interface CsvData {
  headers: string[];
  rows: string[][];
}

export default function CampaignContactsForm({
  campaignId,
  campaignName,
  onBack,
  onSubmit
}: CampaignContactsFormProps) {
  const [contactsFile, setContactsFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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
        setContactsFile(file);

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
    document.getElementById('contacts-csv-file-input')?.click();
  };

  const handleRemoveFile = () => {
    setContactsFile(null);
    setCsvData(null);
    const fileInput = document.getElementById('contacts-csv-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setContactsFile(file);

        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const parsed = parseCsv(text);
          setCsvData(parsed);
        };
        reader.readAsText(file);
      } else {
        alert('Por favor, selecciona un archivo CSV');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (!contactsFile || !csvData?.rows.length) {
      setError('Por favor, sube un archivo CSV con los contactos');
      return;
    }

    setIsSubmitting(true);

    try {
      const contacts = csvData.rows.map((row) => {
        let toNumber = row[0];

        if (!toNumber.startsWith('+')) {
          toNumber = '+' + toNumber;
        }

        const dynamicVariables: Record<string, string> = {};
        for (let i = 1; i < row.length && i < csvData.headers.length; i++) {
          if (row[i]) {
            dynamicVariables[csvData.headers[i]] = row[i];
          }
        }

        return {
          toNumber,
          dynamicVariables
        };
      });

      const payload = { contacts };

      await apiService.createContactsToCampaign(campaignId, payload);

      onSubmit?.();
    } catch (error) {
      console.error('Error submitting contacts:', error);
      setError('Error al agregar contactos. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadTemplate = () => {
    downloadFile('/templates/template-contacts-calls.csv', 'plantilla-contactos-llamadas.csv');
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
                <h1 className="text-2xl font-semibold text-gray-800">Agregar Contactos</h1>
                <p className="mt-1 text-sm text-gray-500">Campaña: {campaignName}</p>
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
                <Label className="mb-1 block text-sm font-medium text-gray-700">Subir contactos</Label>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    El CSV debe contener: telefono_destino (primera columna) y variables dinámicas adicionales
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTemplate}
                    className="border-blue-300 bg-transparent text-blue-600 hover:bg-blue-50"
                  >
                    Descargar plantilla
                  </Button>
                </div>

                <input
                  id="contacts-csv-file-input"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {contactsFile ? (
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
                          d="M9.10938 19.7594H7.94063C7.90729 19.5677 7.84583 19.3979 7.75625 19.25C7.66667 19.1 7.55521 18.9729 7.42188 18.8687C7.28854 18.7646 7.13646 18.6865 6.96563 18.6344C6.79688 18.5802 6.61458 18.5531 6.41875 18.5531C6.07083 18.5531 5.7625 18.6406 5.49375 18.8156C5.225 18.9885 5.01458 20.226 4.75 22.6375H2.5V5.5H6.25V3.25C6.25 3.05109 6.32902 2.86032 6.46967 2.71967C6.61032 2.57902 6.80109 2.5 7 2.5H13C13.1989 2.5 13.3897 2.57902 13.5303 2.71967C13.671 2.86032 13.75 3.05109 13.75 3.25V5.5ZM14.5 7H5.5V16H14.5V7ZM7.75 9.25H9.25V13.75H7.75V9.25ZM10.75 9.25H12.25V13.75H10.75V9.25ZM7.75 4V5.5H12.25V4H7.75Z"
                          fill="#525866"
                        />
                      </svg>
                    </div>
                    <div className="inline-flex grow flex-col">
                      <div className="text-sm font-normal leading-tight text-gray-950">{contactsFile.name}</div>
                      <div className="text-xs font-normal leading-none text-gray-600">
                        {csvData?.rows.length || 0} Contactos
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
                    className={`mt-1 flex cursor-pointer justify-center rounded-md border-2 border-dashed px-6 pb-12 pt-10 transition-colors ${
                      isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={handleUploadClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-1 text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="text-sm text-gray-600">Elige un CSV o arrástralo y suéltalo aquí.</p>
                      <p className="text-xs text-gray-500">Hasta 50 MB</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                  onClick={onBack}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gray-900 text-white hover:bg-gray-800" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Agregando...
                    </>
                  ) : (
                    'Agregar Contactos'
                  )}
                </Button>
              </div>
            </form>
          </div>

          {csvData && csvData.headers.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Vista Previa de Contactos</h3>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="max-h-96 overflow-x-auto overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          telefono_destino
                        </th>
                        {csvData.headers.slice(1).map((header, index) => (
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
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{row[0] || '-'}</td>
                          {row.slice(1).map((cell, cellIndex) => (
                            <td key={cellIndex} className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {cell || '-'}
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
