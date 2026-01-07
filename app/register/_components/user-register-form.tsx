'use client';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { apiService } from '@/services';

const formSchema = z
  .object({
    firstName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
    email: z.string().email({ message: 'Ingresa un correo electrónico válido' }),
    password: z
      .string()
      .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
      .regex(/[A-Z]/, { message: 'Debe contener al menos una letra mayúscula' })
      .regex(/[a-z]/, { message: 'Debe contener al menos una letra minúscula' })
      .regex(/[0-9]/, { message: 'Debe contener al menos un número' }),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
  });

type UserFormValue = z.infer<typeof formSchema>;

export default function UserRegisterForm() {
  const router = useRouter();
  const [loading, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const defaultValues = {
    firstName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    startTransition(async () => {
      try {
        setErrorMessage(null);
        const { confirmPassword, ...registerData } = data;
        await apiService.register(registerData);
        toast.success('¡Cuenta creada exitosamente! Por favor inicia sesión.');
        router.push('/login');
      } catch (error: any) {
        let errorMsg = 'Error al crear la cuenta. Por favor intenta de nuevo.';

        if (error?.data?.message) {
          errorMsg = error.data.message;
        } else if (error?.message) {
          errorMsg = error.message;
        }

        if (errorMsg.toLowerCase().includes('email ya está registrado') ||
            errorMsg.toLowerCase().includes('email already exists') ||
            errorMsg.toLowerCase().includes('conflict')) {
          errorMsg = 'Este correo electrónico ya está registrado.';
          toast.error(errorMsg, {
            action: {
              label: 'Iniciar sesión',
              onClick: () => router.push('/login')
            }
          });
          setErrorMessage(errorMsg);
          return;
        } else if (errorMsg.toLowerCase().includes('contraseña')) {
          errorMsg = 'La contraseña no cumple con los requisitos de seguridad.';
        } else if (errorMsg.toLowerCase().includes('nombre')) {
          errorMsg = 'El nombre ingresado no es válido.';
        } else if (errorMsg.toLowerCase().includes('email')) {
          errorMsg = 'El correo electrónico no es válido.';
        }

        setErrorMessage(errorMsg);
        toast.error(errorMsg);
      }
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Ingresa tu nombre..." disabled={loading} {...field} />
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
                <FormLabel>Correo</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Ingresa tu correo..." disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Ingresa tu contraseña..." disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirma tu contraseña..." disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {errorMessage && <div className="mb-2 text-sm text-red-500">{errorMessage}</div>}
          <Button disabled={loading} className="ml-auto w-full" type="submit">
            Crear Cuenta
          </Button>
        </form>
      </Form>
    </>
  );
}
