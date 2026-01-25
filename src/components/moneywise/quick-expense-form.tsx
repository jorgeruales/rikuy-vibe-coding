"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Card, CardContent } from "@/components/ui/card";
import { Check, DollarSign, Loader2 } from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";

const quickExpenseSchema = z.object({
    description: z.string().min(1, "Requerido"),
    amount: z
        .number({ required_error: "Requerido", invalid_type_error: "Requerido" })
        .positive("Debe ser > 0"),
});

export type QuickExpenseFormValues = z.infer<typeof quickExpenseSchema>;

interface QuickExpenseFormProps {
    onSave: (values: QuickExpenseFormValues) => void;
    isLoading?: boolean;
}

export function QuickExpenseForm({ onSave, isLoading }: QuickExpenseFormProps) {
    const form = useForm<QuickExpenseFormValues>({
        resolver: zodResolver(quickExpenseSchema),
        defaultValues: {
            description: "",
            // @ts-ignore - Initialize as null for empty input
            amount: null,
        },
    });

    const onSubmit = (data: QuickExpenseFormValues) => {
        onSave(data);
        form.reset({
            description: "",
            // @ts-ignore
            amount: null,
        });
    };

    return (
        <Card className="mb-4">
            <CardContent className="p-4">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex items-start gap-2"
                    >
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <InputText
                                            placeholder="Descripción"
                                            className="w-full h-12 p-2"
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
                                <FormItem className="w-32 sm:w-40">
                                    <FormControl>
                                        <div className="relative">
                                            <DollarSign className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                                            <InputNumber
                                                placeholder="0.00"
                                                className="w-full"
                                                inputClassName="pl-7 w-full h-12"
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
                        <Button
                            type="submit"
                            size="icon"
                            className="shrink-0 bg-green-600 hover:bg-green-700 text-white h-12 w-12"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4" />
                            )}
                            <span className="sr-only">Guardar</span>
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
