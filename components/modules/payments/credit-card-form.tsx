'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComponentPlaceholderIcon, CalendarIcon, PersonIcon } from '@radix-ui/react-icons';

const formSchema = z.object({
  cardNumber: z.string().min(16, 'El número de tarjeta debe tener 16 dígitos').max(19),
  cardHolder: z.string().min(5, 'El nombre del titular debe tener al menos 5 caracteres'),
  expiryMonth: z.string().min(1, 'Seleccione el mes'),
  expiryYear: z.string().min(1, 'Seleccione el año'),
  cvc: z.string().min(3, 'El CVC debe tener 3 o 4 dígitos').max(4)
});

export type CreditCardFormValues = z.infer<typeof formSchema>;

interface CreditCardFormProps {
  onSubmit: (data: CreditCardFormValues) => void;
  isSubmitting?: boolean;
  className?: string;
}

export default function CreditCardForm({ onSubmit, isSubmitting = false, className = '' }: CreditCardFormProps) {
  const form = useForm<CreditCardFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardNumber: '',
      cardHolder: '',
      expiryMonth: '',
      expiryYear: '',
      cvc: ''
    }
  });

  function formatCardNumber(value: string) {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const formatted = v.substring(0, 16);
    return formatted.replace(/\B(?=(\d{4})+(?!\d))/g, ' ');
  }

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit({
      ...data,
      cardNumber: data.cardNumber.replace(/\s+/g, '')
    });
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => {
    const fullYear = currentYear + i;
    return {
      value: String(fullYear % 100)?.padStart(2, '0'),
      label: String(fullYear % 100)?.padStart(2, '0')
    };
  });

  return (
    <Card className={`mx-auto w-full max-w-md ${className}`}>
      <CardHeader>
        <CardTitle className="text-2xl">Información de pago</CardTitle>
        <CardDescription>Ingresa los datos de tu tarjeta para completar el pago</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de tarjeta</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <ComponentPlaceholderIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="1234 5678 9012 3456"
                        className="pl-10"
                        {...field}
                        onChange={(e) => {
                          field.onChange(formatCardNumber(e.target.value));
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cardHolder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titular de la tarjeta</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <PersonIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Nombre completo" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expiryMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mes</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger
                                className={`pl-10 ${form.formState.errors.expiryMonth ? 'border-destructive' : ''}`}
                              >
                                <SelectValue placeholder="Mes" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => {
                                const month = i + 1;
                                return (
                                  <SelectItem key={month} value={month.toString()?.padStart(2, '0')}>
                                    {month.toString()?.padStart(2, '0')}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiryYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Año</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className={form.formState.errors.expiryYear ? 'border-destructive' : ''}>
                              <SelectValue placeholder="Año" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year.value} value={year.value}>
                                {year.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="cvc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVC</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="123"
                          className="pl-10"
                          maxLength={4}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Procesando...' : 'Agregar tarjeta'}
        </Button>
      </CardFooter>
    </Card>
  );
}
