// @ts-nocheck
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bot, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface Agent {
  id: string;
  name: string;
  type: 'Prompt Único' | 'Multi Prompt' | 'Flujo de Conversación';
  voice: {
    name: string;
    avatar?: string;
  };
  phone?: string;
  editedBy: string;
}

interface AgentsTableProps {
  agents: Agent[];
  loading: boolean;
  onAgentClick: (agentId: string) => void;
}

export function AgentsTable({ agents, loading, onAgentClick }: AgentsTableProps) {
  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <p className="text-gray-500">Cargando agentes...</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-gray-50">
          <TableRow className="border-b hover:bg-gray-50">
            <TableHead className="p-4 font-medium text-gray-600">Nombre del Agente</TableHead>
            <TableHead className="p-4 font-medium text-gray-600">Tipo de Agente</TableHead>
            <TableHead className="p-4 font-medium text-gray-600">Voz</TableHead>
            <TableHead className="p-4 font-medium text-gray-600">Teléfono</TableHead>
            <TableHead className="p-4 font-medium text-gray-600">Editado por</TableHead>
            <TableHead className="w-12 p-4 font-medium text-gray-600"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow
              key={agent.id}
              className="cursor-pointer border-b transition-colors hover:bg-gray-50"
              onClick={() => onAgentClick(agent.id)}
            >
              <TableCell className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-gray-100">
                    <Bot className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="line-clamp-1 font-medium text-gray-900">{agent.name}</span>
                </div>
              </TableCell>
              <TableCell className="p-4">
                <div className="inline-flex items-center">
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                  >
                    {agent.type}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="p-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={agent.voice.avatar || '/placeholder.svg'} alt={agent.voice.name} />
                    <AvatarFallback className="bg-gray-200 text-xs text-gray-600">
                      {agent.voice.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-900">{agent.voice.name}</span>
                </div>
              </TableCell>
              <TableCell className="p-4">
                {agent.phone ? (
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 hover:bg-blue-50"
                  >
                    {agent.phone}
                  </Badge>
                ) : (
                  <span className="ml-2 text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell className="p-4">
                <span className="text-sm text-gray-600">{agent.editedBy}</span>
              </TableCell>
              <TableCell className="p-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg hover:bg-gray-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="text-sm">Editar</DropdownMenuItem>
                    <DropdownMenuItem className="text-sm">Duplicar</DropdownMenuItem>
                    <DropdownMenuItem className="text-sm">Ver Análisis</DropdownMenuItem>
                    <DropdownMenuItem className="text-sm text-destructive">Eliminar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
