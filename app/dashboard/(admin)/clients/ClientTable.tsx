import { Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Client = {
  _id: string;
  firstName?: string;
  email: string;
  workspaceId?: string;
  billingConfig?: {
    multiplier: number;
  };
};

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
            <TableHead>Workspace ID</TableHead>
            <TableHead>Multiplicador</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No hay clientes registrados.
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow key={client._id}>
                <TableCell className="font-medium">{client.firstName}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.workspaceId || 'No especificado'}</TableCell>
                <TableCell>
                  <span className="font-mono">
                    {client.billingConfig?.multiplier?.toFixed(1) || 'No especificado'}x
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" title="Ver Transacciones" onClick={() => onViewTransactions(client)}>
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