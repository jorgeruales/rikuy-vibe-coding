"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Bot } from "lucide-react";

interface InsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  insights: string;
  isLoading: boolean;
}

export function InsightsModal({
  isOpen,
  onClose,
  insights,
  isLoading,
}: InsightsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Financial Insights
          </DialogTitle>
          <DialogDescription>
            Here are some AI-powered suggestions based on your income and
            spending.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-4 text-sm">
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted"></div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{insights}</p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
