"use client";

import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { DollarSign } from "lucide-react";
import { format } from "date-fns";
import type { Expense } from "@/lib/types";

const expenseSchema = z.object({
  description: z.string().min(1, "Debes ingresar el gasto."),
  amount: z
    .number({ required_error: "El valor es requerido.", invalid_type_error: "Debes ingresar un número válido." })
    .positive("El valor no puede ser 0."),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato YYYY-MM-DD"),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  onSave: (expense: ExpenseFormValues) => void;
  onClose: () => void;
  expenseToEdit?: Expense | null;
}

export function ExpenseForm({
  onSave,
  onClose,
  expenseToEdit,
}: ExpenseFormProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      // @ts-ignore - We initialize as null to show empty input, but validate as number
      amount: null,
      date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  useEffect(() => {
    if (expenseToEdit) {
      form.reset({
        description: expenseToEdit.description,
        amount: expenseToEdit.amount,
        date: expenseToEdit.date
          ? format(new Date(expenseToEdit.date), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
      });
    } else {
      form.reset({
        description: "",
        // @ts-ignore
        amount: null,
        date: format(new Date(), "yyyy-MM-dd"),
      });
    }
  }, [expenseToEdit, form]);

  const onSubmit = (data: ExpenseFormValues) => {
    onSave(data);
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <InputText
                  placeholder="ej., Café, Frutas"
                  className="w-full"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                  <InputNumber
                    placeholder="0.00"
                    className="w-full"
                    inputClassName="pl-8 w-full"
                    minFractionDigits={2}
                    maxFractionDigits={2}
                    value={field.value}
                    onValueChange={(e) => field.onChange(e.value)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    useGrouping={false}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha</FormLabel>
              <FormControl>
                <Calendar
                  value={field.value ? new Date(field.value + 'T12:00:00') : null}
                  onChange={(e) => {
                    if (e.value) {
                      field.onChange(format(e.value, "yyyy-MM-dd"));
                    }
                  }}
                  dateFormat="yy-mm-dd"
                  className="w-full"
                  showIcon
                  appendTo="self"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {expenseToEdit ? "Guardar" : "Añadir"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
