'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Copy, Download } from 'lucide-react';
import type { CallLog } from './call-history-columns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { disconnectionReasonColorMap, sentimentColorMap, translatedStatus } from '@/utils';
import React from 'react';
import { formatDuration, formatDurationMs, formatTime, formatTimestamp } from '@/utils/date-utils';

interface CallDetailSheetProps {
  call: CallLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AnalysisRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  type?: 'user_sentiment' | 'call_status' | 'disconnection_reason';
}

const icons = {
  call: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M16.75 3.244V16.756C16.7484 16.953 16.6694 17.1414 16.5301 17.2806C16.3907 17.4198 16.2022 17.4986 16.0052 17.5H3.99475C3.79736 17.5 3.60804 17.4216 3.4684 17.2821C3.32875 17.1426 3.2502 16.9534 3.25 16.756V3.244C3.25157 3.04704 3.33056 2.85859 3.46991 2.71938C3.60926 2.58018 3.79778 2.50137 3.99475 2.5H16.0052C16.4163 2.5 16.75 2.833 16.75 3.244ZM15.25 4H4.75V16H15.25V4ZM9.46975 10.8407L12.652 7.65925L13.7125 8.71975L9.46975 12.9625L6.55225 10.045L7.6135 8.9845L9.46975 10.8407Z"
        fill="currentColor"
      ></path>
    </svg>
  ),
  userSentiment: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M6.54212 13.4044C5.50072 12.67 4.72019 11.6231 4.3136 10.4154C3.90701 9.20765 3.8955 7.90186 4.28072 6.68718C4.66595 5.47249 5.4279 4.412 6.45619 3.65934C7.48448 2.90669 8.72569 2.50098 10 2.50098C11.2743 2.50098 12.5155 2.90669 13.5438 3.65934C14.5721 4.412 15.3341 5.47249 15.7193 6.68718C16.1045 7.90186 16.093 9.20765 15.6864 10.4154C15.2798 11.6231 14.4993 12.67 13.4579 13.4044L15.0201 16.9744C15.0452 17.0315 15.0556 17.094 15.0505 17.1562C15.0453 17.2184 15.0247 17.2783 14.9905 17.3305C14.9563 17.3827 14.9096 17.4256 14.8547 17.4552C14.7997 17.4848 14.7383 17.5003 14.6759 17.5001H5.32337C5.26106 17.5002 5.19971 17.4848 5.14486 17.4552C5.09001 17.4256 5.04339 17.3828 5.00922 17.3307C4.97505 17.2786 4.95441 17.2188 4.94915 17.1567C4.9439 17.0946 4.9542 17.0322 4.97913 16.9751L6.54137 13.4044H6.54212ZM11.5934 12.8846L12.5924 12.1789C13.3737 11.6282 13.9593 10.8431 14.2645 9.93728C14.5697 9.03146 14.5785 8.052 14.2896 7.14085C14.0008 6.22969 13.4294 5.43416 12.6581 4.86956C11.8868 4.30495 10.9558 4.00059 10 4.00059C9.04416 4.00059 8.11315 4.30495 7.34189 4.86956C6.57062 5.43416 5.99917 6.22969 5.71035 7.14085C5.42153 8.052 5.43034 9.03146 5.7355 9.93728C6.04067 10.8431 6.62633 11.6282 7.40762 12.1789L8.40587 12.8846L7.04312 16.0001H12.9561L11.5934 12.8846ZM7.08888 9.2276L8.54387 8.86385C8.62462 9.18888 8.81181 9.47753 9.07563 9.68383C9.33945 9.89013 9.66472 10.0022 9.99962 10.0022C10.3345 10.0022 10.6598 9.89013 10.9236 9.68383C11.1874 9.47753 11.3746 9.18888 11.4554 8.86385L12.9104 9.2276C12.7472 9.87597 12.3722 10.4513 11.8449 10.8623C11.3177 11.2734 10.6682 11.4966 9.99962 11.4966C9.33104 11.4966 8.6816 11.2734 8.1543 10.8623C7.627 10.4513 7.25204 9.87597 7.08888 9.2276Z"
        fill="currentColor"
      />
    </svg>
  ),
  callStatus: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M17.5 13.7515C17.4997 14.7772 17.1491 15.772 16.5063 16.5712C15.8635 17.3705 14.967 17.9262 13.9653 18.1465L13.4867 16.711C13.9249 16.6388 14.3416 16.4704 14.7068 16.2177C15.0721 15.9651 15.3767 15.6346 15.5988 15.25H13.75C13.3522 15.25 12.9706 15.092 12.6893 14.8107C12.408 14.5294 12.25 14.1478 12.25 13.75V10.75C12.25 10.3522 12.408 9.97064 12.6893 9.68934C12.9706 9.40804 13.3522 9.25 13.75 9.25H15.9535C15.7705 7.80017 15.0647 6.46695 13.9686 5.50051C12.8724 4.53406 11.4613 4.00081 10 4.00081C8.53866 4.00081 7.12755 4.53406 6.03143 5.50051C4.93531 6.46695 4.22952 7.80017 4.0465 9.25H6.25C6.64782 9.25 7.02936 9.40804 7.31066 9.68934C7.59196 9.97064 7.75 10.3522 7.75 10.75V13.75C7.75 14.1478 7.59196 14.5294 7.31066 14.8107C7.02936 15.092 6.64782 15.25 6.25 15.25H4C3.60218 15.25 3.22064 15.092 2.93934 14.8107C2.65804 14.5294 2.5 14.1478 2.5 13.75V10C2.5 5.85775 5.85775 2.5 10 2.5C14.1423 2.5 17.5 5.85775 17.5 10V13.7515ZM16 13.75V10.75H13.75V13.75H16ZM4 10.75V13.75H6.25V10.75H4Z"
        fill="currentColor"
      />
    </svg>
  ),
  disconnectionReason: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M8.0245 9.0115C8.72825 10.2479 9.75214 11.2717 10.9885 11.9755L11.6515 11.047C11.7581 10.8977 11.9158 10.7927 12.0946 10.7517C12.2734 10.7108 12.4611 10.7369 12.622 10.825C13.6827 11.4047 14.8542 11.7533 16.0592 11.848C16.2473 11.8629 16.4229 11.9482 16.5509 12.0867C16.6789 12.2253 16.75 12.4071 16.75 12.5958V15.9423C16.75 16.1279 16.6812 16.3071 16.5568 16.4449C16.4324 16.5828 16.2612 16.6696 16.0765 16.6885C15.679 16.7297 15.2785 16.75 14.875 16.75C8.455 16.75 3.25 11.545 3.25 5.125C3.25 4.7215 3.27025 4.321 3.3115 3.9235C3.33044 3.73877 3.41724 3.56764 3.55509 3.44323C3.69295 3.31881 3.87205 3.24996 4.05775 3.25H7.40425C7.59292 3.24998 7.77467 3.32106 7.91326 3.44909C8.05185 3.57711 8.13709 3.75267 8.152 3.94075C8.24667 5.14584 8.59531 6.31726 9.175 7.378C9.2631 7.53892 9.28916 7.72656 9.24825 7.9054C9.20734 8.08424 9.1023 8.24188 8.953 8.3485L8.0245 9.0115ZM6.133 8.51875L7.558 7.501C7.15359 6.62807 6.87651 5.70163 6.73525 4.75H4.7575C4.753 4.8745 4.75075 4.99975 4.75075 5.125C4.75 10.717 9.283 15.25 14.875 15.25C15.0002 15.25 15.1255 15.2478 15.25 15.2425V13.2648C14.2984 13.1235 13.3719 12.8464 12.499 12.442L11.4813 13.867C11.0715 13.7078 10.6735 13.5198 10.2902 13.3045L10.2468 13.2797C8.77568 12.4425 7.55746 11.2243 6.72025 9.75325L6.6955 9.70975C6.48018 9.3265 6.29221 8.9285 6.133 8.51875Z"
        fill="currentColor"
      />
    </svg>
  )
};

function AnalysisRow({ icon, label, value, type }: AnalysisRowProps) {
  const text = translatedStatus(value);
  let textColor = '';
  if (type === 'user_sentiment') {
    textColor = sentimentColorMap[value];
  }
  if (type === 'disconnection_reason') {
    textColor = disconnectionReasonColorMap[value];
  }

  return (
    <div className="inline-flex items-start justify-start gap-2">
      <div className="mt-2 inline-flex w-[280px] flex-col items-start justify-start gap-2">
        <div className="flex items-center justify-start gap-2">
          <div className="relative h-5 w-5 text-gray-500">{icon}</div>
          <div className="text-sm font-normal leading-tight text-gray-950">{label}</div>
        </div>
      </div>
      <div className="mt-2 inline-flex w-[280px] flex-col items-start justify-start gap-2">
        <div className="flex items-center justify-start gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 8 8" fill="none">
            <g clip-path="url(#clip0)">
              <path
                d="M0.799805 3.9998C0.799805 2.23249 2.23249 0.799805 3.9998 0.799805C5.76712 0.799805 7.1998 2.23249 7.1998 3.9998C7.1998 5.76712 5.76712 7.1998 3.9998 7.1998C2.23249 7.1998 0.799805 5.76712 0.799805 3.9998Z"
                fill="#e5e7eb"
              ></path>
              <path
                d="M1.3999 4.00039C1.3999 2.56445 2.56396 1.40039 3.9999 1.40039C5.43584 1.40039 6.5999 2.56445 6.5999 4.00039C6.5999 5.43633 5.43584 6.60039 3.9999 6.60039C2.56396 6.60039 1.3999 5.43633 1.3999 4.00039Z"
                fill={textColor}
              ></path>
            </g>
            <defs>
              <clipPath id="clip0">
                <rect width="8" height="8" fill="white"></rect>
              </clipPath>
            </defs>
          </svg>
          <div className="text-sm font-normal leading-tight text-[#525866]">{text}</div>
        </div>
      </div>
    </div>
  );
}

export default function CallDetailSheet({ call, open, onOpenChange }: CallDetailSheetProps) {
  if (!call) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyTabContent = () => {
    const activeTab = document.querySelector('[data-state="active"]')?.getAttribute('data-value');
    let contentToCopy = '';

    switch (activeTab) {
      case 'transcription':
        contentToCopy = call.transcript || 'No hay transcripción disponible';
        break;
      case 'data':
        contentToCopy = JSON.stringify(
          {
            call_id: call.call_id,
            agent_id: call.agent_id,
            duration_ms: call.duration_ms,
            call_cost: call.call_cost,
            latency: call.latency,
            llm_token_usage: call.llm_token_usage
          },
          null,
          2
        );
        break;
      case 'detail-logs':
        contentToCopy = call.public_log_url || 'No hay registros detallados disponibles';
        break;
    }

    copyToClipboard(contentToCopy);
  };

  const formatTranscript = () => {
    if (!call.transcript_object || call.transcript_object.length === 0) {
      return <div className="text-sm text-gray-500">No hay transcripción disponible.</div>;
    }

    return call.transcript_object.map((turn, index) => {
      const isAgent = turn.role === 'agent';
      const role = isAgent ? 'Agente' : 'Usuario';

      const firstWord = turn.words?.[0];
      const timestamp = firstWord ? firstWord.start : 0;

      return (
        <div key={index} className="group mb-4 flex items-start justify-between">
          <div className="flex-1 pr-4">
            <div className="text-sm text-gray-900">
              <span className="font-medium">{role}:</span> {turn.content}
            </div>
          </div>
          <div className="whitespace-nowrap font-mono text-xs text-gray-500">{formatTimestamp(timestamp)}</div>
        </div>
      );
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-2 sm:max-w-lg">
        <div className="sticky top-8 mt-12 border-b bg-white pb-4 pt-2" style={{ zIndex: 10 }}>
          <div className="flex w-full flex-col items-start justify-center bg-white py-1">
            <div className="w-full text-lg font-medium leading-normal text-gray-950">
              <div className="flex w-full flex-row justify-between">
                <div>
                  {formatTime(call.start_timestamp)}{' '}
                  {call.call_type === 'phone_call' ? 'Llamada telefónica' : 'Llamada web'}
                </div>
              </div>
            </div>

            <div className="mt-2 flex flex-col items-start justify-start gap-1">
              <div className="flex w-full items-center justify-start gap-1">
                <div className="text-xs font-normal leading-none text-gray-600">
                  Agente:{' '}
                  <span className="inline-block max-w-[250px] cursor-pointer overflow-hidden truncate align-middle hover:text-blue-600 hover:underline">
                    {call.agent_name || 'Desconocido'}
                  </span>
                  (<span className="text-gray-400">age...{call.agent_id.slice(-3)}</span>)
                  <button className="ml-1 cursor-pointer" onClick={() => copyToClipboard(call.agent_id)}>
                    <Copy className="inline-block h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <div className="w-2 text-center text-xs font-normal leading-none text-gray-400">∙</div>
                <div className="text-xs font-normal leading-none text-gray-600">
                  Versión: <span className="text-gray-400">{call.agent_version}</span>
                </div>
                <div className="w-2 text-center text-xs font-normal leading-none text-gray-400">∙</div>
                <div className="text-xs font-normal leading-none text-gray-600">
                  ID de Llamada:{' '}
                  <span className="text-gray-400">
                    {call.call_id.substring(0, 3)}...{call.call_id.slice(-3)}
                  </span>
                  <button className="ml-1 cursor-pointer" onClick={() => copyToClipboard(call.call_id)}>
                    <Copy className="inline-block h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="w-full text-xs font-normal leading-none text-gray-600">
                {call.call_type === 'web_call'
                  ? 'Llamada Web'
                  : `Llamada Telefónica : ${call.from_number || 'Desconocido'} → ${call.to_number || 'Desconocido'}`}
              </div>

              <div className="w-full text-xs font-normal leading-none text-gray-600">
                Duración: {formatDurationMs(call.duration_ms)} (
                {formatDuration(call.start_timestamp, call.end_timestamp)})
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-300 p-4">
          <div className="mb-2">
            <div className="text-sm font-medium leading-normal text-gray-950">Análisis de Conversación</div>
          </div>
          <div className="text-xs font-normal leading-none text-gray-600">Preajuste</div>
          <AnalysisRow
            label="Llamada Exitosa"
            icon={icons.call}
            value={call.call_analysis?.call_successful ? 'successful' : 'unsuccessful'}
          />
          <AnalysisRow
            label="Estado de la Llamada"
            icon={icons.callStatus}
            value={call.call_status}
            type="call_status"
          />
          <AnalysisRow
            label="Sentimiento del Usuario"
            icon={icons.userSentiment}
            value={call.call_analysis?.user_sentiment}
            type="user_sentiment"
          />
          <AnalysisRow
            label="Razón de Desconexión"
            icon={icons.disconnectionReason}
            value={call.disconnection_reason}
            type="disconnection_reason"
          />
        </div>

        <div className="border-b border-gray-300 p-4">
          <div className="mb-3 text-sm font-medium leading-normal text-gray-950">Resumen</div>
          {call.call_analysis?.call_summary ? (
            <div className="text-sm leading-relaxed text-gray-700">{call.call_analysis.call_summary}</div>
          ) : (
            <div className="text-sm text-gray-500">No hay resumen disponible.</div>
          )}
        </div>

        {call.recording_url && (
          <div className="border-b border-gray-300 p-4">
            <div className="mb-3 text-sm font-medium leading-normal text-gray-950">Grabación de Llamada</div>
            <div className="space-y-3">
              <div className="rounded-lg bg-gray-50 p-4">
                <audio
                  controls
                  className="h-10 w-full"
                  preload="metadata"
                  onError={(e) => {
                    console.error('Error al cargar audio:', e);
                  }}
                >
                  <source src={call.recording_url} type="audio/wav" />
                  <source src={call.recording_url} type="audio/mpeg" />
                  Tu navegador no soporta el elemento de audio.
                </audio>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">Duración: {formatDurationMs(call.duration_ms)}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = call.recording_url!;
                    link.download = `grabacion-llamada-${call.call_id}.wav`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Grabación
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="p-4">
          <Tabs defaultValue="transcription" className="w-full">
            <div className="flex items-center justify-between border-b border-gray-200">
              <TabsList className="h-auto bg-transparent p-0">
                <TabsTrigger
                  value="transcription"
                  className="rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600"
                >
                  Transcripción
                </TabsTrigger>
                <TabsTrigger
                  value="data"
                  className="rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600"
                >
                  Datos
                </TabsTrigger>
                <TabsTrigger
                  value="detail-logs"
                  className="rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600"
                >
                  Registros Detallados
                </TabsTrigger>
              </TabsList>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyTabContent}>
                <Copy className="h-4 w-4 text-gray-400" />
              </Button>
            </div>

            <TabsContent value="transcription" className="mt-4">
              <div className="space-y-0">{formatTranscript()}</div>
            </TabsContent>

            <TabsContent value="data" className="mt-4">
              <div className="flex flex-grow-0 flex-col">
                <div className="inline-flex flex-col items-start justify-center gap-3 bg-white px-4 py-3">
                  <div className="inline-flex items-start justify-start gap-2 pt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M4 14.5V11.725C4 11.4266 3.88147 11.1405 3.6705 10.9295C3.45952 10.7185 3.17337 10.6 2.875 10.6H2.5V9.4H2.875C3.02274 9.4 3.16903 9.3709 3.30552 9.31436C3.44201 9.25783 3.56603 9.17496 3.6705 9.0705C3.77496 8.96603 3.85783 8.84201 3.91436 8.70552C3.9709 8.56903 4 8.42274 4 8.275V5.5C4 4.90326 4.23705 4.33097 4.65901 3.90901C5.08097 3.48705 5.65326 3.25 6.25 3.25H7V4.75H6.25C6.05109 4.75 5.86032 4.82902 5.71967 4.96967C5.57902 5.11032 5.5 5.30109 5.5 5.5V8.575C5.50008 8.89076 5.40051 9.19849 5.21548 9.45435C5.03045 9.71022 4.76939 9.90117 4.4695 10C4.76939 10.0988 5.03045 10.2898 5.21548 10.5456C5.40051 10.8015 5.50008 11.1092 5.5 11.425V14.5C5.5 14.6989 5.57902 14.8897 5.71967 15.0303C5.86032 15.171 6.05109 15.25 6.25 15.25H7V16.75H6.25C5.65326 16.75 5.08097 16.5129 4.65901 16.091C4.23705 15.669 4 15.0967 4 14.5ZM16 11.725V14.5C16 15.0967 15.7629 15.669 15.341 16.091C14.919 16.5129 14.3467 16.75 13.75 16.75H13V15.25H13.75C13.9489 15.25 14.1397 15.171 14.2803 15.0303C14.421 14.8897 14.5 14.6989 14.5 14.5V11.425C14.4999 11.1092 14.5995 10.8015 14.7845 10.5456C14.9696 10.2898 15.2306 10.0988 15.5305 10C15.2306 9.90117 14.9696 9.71022 14.7845 9.45435C14.5995 9.19849 14.4999 8.89076 14.5 8.575V5.5C14.5 5.30109 14.421 5.11032 14.2803 4.96967C14.1397 4.82902 13.9489 4.75 13.75 4.75H13V3.25H13.75C14.3467 3.25 14.919 3.48705 15.341 3.90901C15.7629 4.33097 16 4.90326 16 5.5V8.275C16 8.57337 16.1185 8.85952 16.3295 9.0705C16.5405 9.28147 16.8266 9.4 17.125 9.4H17.5V10.6H17.125C16.8266 10.6 16.5405 10.7185 16.3295 10.9295C16.1185 11.1405 16 11.4266 16 11.725Z"
                        fill="currentColor"
                        className="text-gray-950"
                      />
                    </svg>
                    <div className="text-sm font-medium leading-tight text-gray-950">Variables Dinámicas</div>
                  </div>

                  <div className="flex h-auto w-full flex-col gap-2.5 rounded-lg bg-gray-50 p-3">
                    <div className="flex flex-col gap-4">
                      {call.retell_llm_dynamic_variables && Object.keys(call.retell_llm_dynamic_variables).length > 0
                        ? Object.entries(call.retell_llm_dynamic_variables).map(([key, value]) => (
                            <div key={key}>
                              <div className="text-sm font-normal leading-tight text-gray-950">{key}</div>
                              <div className="text-sm font-normal leading-tight text-gray-400">{String(value)}</div>
                            </div>
                          ))
                        : null}

                      {call.collected_dynamic_variables &&
                        Object.keys(call.collected_dynamic_variables).length > 0 &&
                        Object.entries(call.collected_dynamic_variables).map(([key, value]) => (
                          <div key={key}>
                            <div className="text-sm font-normal leading-tight text-gray-950">{key}</div>
                            <div className="text-sm font-normal leading-tight text-gray-400">{String(value)}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="inline-flex flex-col items-start justify-center gap-3 bg-white px-4 py-3">
                  <div className="inline-flex items-start justify-start gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g id="price-tag-3-line">
                        <path
                          id="Vector"
                          d="M9.17684 2.57422L16.6011 3.63547L17.6616 11.0605L10.7676 17.9545C10.6269 18.0951 10.4362 18.1741 10.2373 18.1741C10.0385 18.1741 9.84774 18.0951 9.70709 17.9545L2.28209 10.5295C2.14149 10.3888 2.0625 10.1981 2.0625 9.99922C2.0625 9.80035 2.14149 9.60962 2.28209 9.46897L9.17684 2.57422ZM9.70709 4.16572L3.87284 9.99922L10.2373 16.363L16.0708 10.5295L15.2758 4.96072L9.70709 4.16572ZM11.2971 8.93872C11.0157 8.65726 10.8577 8.27555 10.8578 7.87758C10.8578 7.68052 10.8967 7.4854 10.9721 7.30336C11.0475 7.12131 11.1581 6.95591 11.2975 6.81659C11.4368 6.67728 11.6023 6.56678 11.7843 6.4914C11.9664 6.41602 12.1615 6.37724 12.3586 6.37727C12.7566 6.37735 13.1382 6.53551 13.4196 6.81697C13.701 7.09843 13.859 7.48013 13.8589 7.87811C13.8588 8.27608 13.7007 8.65773 13.4192 8.93909C13.1378 9.22046 12.7561 9.37848 12.3581 9.37841C11.9601 9.37834 11.5785 9.22018 11.2971 8.93872Z"
                          fill="currentColor"
                          className="text-gray-950"
                        />
                      </g>
                    </svg>
                    <div className="text-sm font-medium leading-tight text-gray-950">Metadatos</div>
                  </div>

                  <div className="flex h-auto w-full flex-col gap-2.5 rounded-lg bg-gray-50 p-3">
                    {call.metadata && Object.keys(call.metadata).length > 0 ? (
                      <div className="flex flex-col gap-4">
                        {Object.entries(call.metadata).map(([key, value]) => (
                          <div key={key}>
                            <div className="text-sm font-normal leading-tight text-gray-950">{key}</div>
                            <div className="text-sm font-normal leading-tight text-gray-400">{String(value)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm font-normal leading-tight text-gray-400">No hay metadatos</div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="detail-logs" className="mt-4">
              {call.public_log_url ? (
                <div className="text-sm leading-relaxed text-gray-700">
                  <a href={call.public_log_url} target="_blank" rel="noopener noreferrer">
                    {call.public_log_url}
                  </a>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No hay registros detallados disponibles.</div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
