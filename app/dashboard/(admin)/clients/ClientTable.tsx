import { Eye, Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Client } from '@/types/client';

interface ClientTableProps {
  clients: Client[];
  onEditClient: (client: Client) => void;
  onViewTransactions: (client: Client) => void;
}

export function ClientTable({ clients, onEditClient, onViewTransactions }: ClientTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Workspace ID</TableHead>
            <TableHead className="text-center">API Key</TableHead>
            <TableHead>Saldo</TableHead>
            <TableHead>Multiplicador</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No hay clientes registrados.
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow key={client._id}>
                <TableCell className="font-medium">{client.firstName}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone || 'No especificado'}</TableCell>
                <TableCell>{client.workspaceId || 'No especificado'}</TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    {client.apiKey ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono">${client.balance?.toFixed(2) || '0.00'}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono">
                    {client.billingConfig?.multiplier?.toFixed(1) || 'No especificado'}x
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Ver Transacciones"
                      onClick={() => onViewTransactions(client)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Editar" onClick={() => onEditClient(client)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
