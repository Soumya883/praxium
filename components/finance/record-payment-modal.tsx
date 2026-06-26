"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { processPayment, type PaymentFormData } from "@/app/actions/finance";
import { paymentFormSchema } from "@/app/actions/schemas";
import { formatINR } from "@/lib/utils";

interface RecordPaymentModalProps {
  paymentId: string;
  studentName: string;
  amountOutstanding: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (receiptNumber: string) => void;
}

export function RecordPaymentModal({
  paymentId,
  studentName,
  amountOutstanding,
  open,
  onOpenChange,
  onSuccess,
}: RecordPaymentModalProps) {
  const [isPending, startTransition] = React.useTransition();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema) as any,
    defaultValues: {
      amountReceived: amountOutstanding,
      paymentMethod: "Cash",
      note: "",
    },
  });

  // Keep form default values in sync when dialog opens for a new row selection
  React.useEffect(() => {
    if (open) {
      form.reset({
        amountReceived: amountOutstanding,
        paymentMethod: "Cash",
        note: "",
      });
      setServerError(null);
    }
  }, [open, amountOutstanding, form]);

  const onSubmit = async (values: PaymentFormData) => {
    // Client-side guard check: amount must not exceed remaining outstanding balance
    if (values.amountReceived > amountOutstanding) {
      form.setError("amountReceived", {
        type: "manual",
        message: `Amount received cannot exceed the outstanding balance of ${formatINR(amountOutstanding)}`,
      });
      return;
    }

    setServerError(null);
    startTransition(async () => {
      try {
        const response = await processPayment(paymentId, values);
        if (response.success && response.receiptNumber) {
          onSuccess(response.receiptNumber);
          onOpenChange(false);
        } else {
          setServerError(response.error || "Failed to process payment");
        }
      } catch (err) {
        setServerError("A network error occurred while recording payment.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isPending) {
        onOpenChange(val);
      }
    }}>
      <DialogContent className="max-w-[400px] bg-white/95 dark:bg-neutral-950/95 border border-neutral-200 dark:border-neutral-900 text-neutral-900 dark:text-neutral-100 backdrop-blur-md shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Record Payment</DialogTitle>
          <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
            Record a fee payment transaction for <span className="font-semibold text-neutral-800 dark:text-neutral-200">{studentName}</span>.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs font-medium">
            {serverError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Amount Input */}
            <FormField
              control={form.control}
              name="amountReceived"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Amount Received (INR)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="e.g. 5000" 
                      className="bg-neutral-50 border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700"
                      disabled={isPending}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-500 dark:text-rose-400" />
                </FormItem>
              )}
            />

            {/* Payment Method Selector */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Payment Method</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-neutral-50 border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-300 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 text-neutral-900 dark:text-neutral-200">
                      <SelectItem value="Cash" className="text-xs cursor-pointer">Cash</SelectItem>
                      <SelectItem value="Card" className="text-xs cursor-pointer">Card</SelectItem>
                      <SelectItem value="Bank Transfer" className="text-xs cursor-pointer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs text-rose-500 dark:text-rose-400" />
                </FormItem>
              )}
            />

            {/* Note Input */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Reference Note (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Month of June fee" 
                      className="bg-neutral-50 border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700"
                      disabled={isPending}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-500 dark:text-rose-400" />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-900">
              <Button 
                type="button" 
                variant="ghost" 
                disabled={isPending}
                onClick={() => onOpenChange(false)}
                className="hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-200 text-xs cursor-pointer bg-transparent"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="bg-neutral-900 hover:bg-neutral-800 text-neutral-50 dark:bg-neutral-50 dark:hover:bg-neutral-200 dark:text-neutral-950 text-xs font-semibold px-4 cursor-pointer flex items-center gap-1.5"
              >
                {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                <span>{isPending ? "Processing..." : "Confirm Payment"}</span>
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
