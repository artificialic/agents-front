import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Client } from '@/types/client';

const ClientSchema = z.object({
  firstName: z
    .string()
    .min(2, {
      message: 'El nombre debe tener al menos 2 caracteres.'
    })
    .max(50, {
      message: 'El nombre no puede tener más de 50 caracteres.'
    }),
  email: z.string().min(1, { message: 'El email es requerido.' }).email({ message: 'Ingresa un email válido.' }),
  workspaceId: z
    .string()
    .min(1, {
      message: 'El Workspace ID es requerido.'
    })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: 'El Workspace ID solo puede contener letras, números, guiones y guiones bajos.'
    }),
  password: z.string().optional(),
  apiKey: z.string().min(1, { message: 'La API Key es requerida.' }),
  balance: z.number().min(0, {
    message: 'El saldo debe ser mayor o igual a 0.'
  }),
  billingConfig: z.object({
    multiplier: z.number().min(1.0, {
      message: 'El multiplicador debe ser mayor o igual a 1.0 (sin markup).'
    })
  })
});

type ClientFormData = z.infer<typeof ClientSchema>;

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData, isEditing: boolean) => Promise<void>;
  editingClient?: Client | null;
  isLoading?: boolean;
}

export function ClientModal({ isOpen, onClose, onSubmit, editingClient, isLoading = false }: ClientModalProps) {
  const isEditing = !!editingClient;

  const form = useForm<ClientFormData>({
    resolver: zodResolver(ClientSchema),
    defaultValues: {
      firstName: '',
      email: '',
      workspaceId: '',
      password: '',
      apiKey: '',
      balance: 0,
      billingConfig: {
        multiplier: 1.5
      }
    }
  });

  useEffect(() => {
    if (editingClient) {
      form.reset({
        firstName: editingClient.firstName || editingClient.name || '',
        email: editingClient.email,
        workspaceId: editingClient.workspaceId || '',
        password: '',
        apiKey: editingClient.apiKey || '',
        balance: editingClient.balance || 0,
        billingConfig: {
          multiplier: editingClient.billingConfig?.multiplier || 1.5
        }
      });
    } else {
      form.reset({
        firstName: '',
        email: '',
        workspaceId: '',
        password: '',
        apiKey: '',
        balance: 0,
        billingConfig: {
          multiplier: 1.5
        }
      });
    }
  }, [editingClient, form]);

  const handleSubmit = async (formData: ClientFormData) => {
    if (!isEditing && (!formData.password || formData.password.length < 6)) {
      form.setError('password', {
        type: 'manual',
        message: 'La contraseña es requerida y debe tener al menos 6 caracteres'
      });
      return;
    }

    try {
      await onSubmit(formData, isEditing);
    } catch (error) {
      console.error('Error en modal:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Cliente' : 'Agregar Cliente'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Modifica los datos del cliente.' : 'Completa los datos para crear un nuevo cliente.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingresa el nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="cliente@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isEditing && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Ingresa la contraseña" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="workspaceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace ID</FormLabel>
                    <FormControl>
                      <Input placeholder="workspace_123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingresa la API Key" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saldo (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">Saldo disponible en dólares para realizar llamadas</p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billingConfig.multiplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Multiplicador de Billing</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="1.0"
                        placeholder="1.5"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 1.5)}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">Ejemplo: 1.5 = 50% markup (uso de $10 → $15)</p>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Cliente'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
