"use client";

import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InputNumber } from "primereact/inputnumber";
import { DollarSign, Loader2 } from "lucide-react";

const incomeSchema = z.object({
  income: z.coerce.number().min(0, "Income must be a positive number."),
});

type IncomeFormValues = z.infer<typeof incomeSchema>;

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (income: number) => void;
  currentIncome: number;
  isLoading?: boolean;
}

export function IncomeModal({
  isOpen,
  onClose,
  onSave,
  currentIncome,
  isLoading,
}: IncomeModalProps) {
  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      income: currentIncome,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ income: currentIncome });
    }
  }, [currentIncome, form, isOpen]);

  const onSubmit = (data: IncomeFormValues) => {
    onSave(data.income);
    // Don't close immediately here, checking if parent handles it or if I should wait.
    // Parent logic closes strictly in finally, which is fine, but checking if closes too early
  };

  return (
    <Dialog open={isOpen} onOpenChange={isLoading ? undefined : onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ingresos mensuales</DialogTitle>
          <DialogDescription>
            Ingresa el valor que recibiste al inicio del mes,
            si necesitas despues lo podars editar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="income"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingreso Mensual</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <InputNumber
                        placeholder="0.00"
                        className="w-full"
                        inputClassName="pl-8 w-full h-12"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                        value={field.value}
                        onValueChange={(e) => field.onChange(e.value)}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
