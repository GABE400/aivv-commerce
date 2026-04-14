"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { submitSupplierApplicationAction } from "@/lib/actions/applications";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Store, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const applicationSchema = z.object({
  storeName: z.string().min(2, "Store name must be at least 2 characters"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  description: z.string().min(10, "Please provide a more detailed description of your business"),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export default function SupplierApplicationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      storeName: "",
      website: "",
      description: "",
    },
  });

  const onSubmit = async (data: ApplicationFormValues) => {
    setIsLoading(true);
    try {
      const result = await submitSupplierApplicationAction(data);
      if (result.success) {
        toast.success("Application submitted successfully!");
        setIsSubmitted(true);
      } else {
        toast.error(result.error || "Failed to submit application");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <div className="size-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
          <CheckCircle2 className="size-10 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold">Application Received</h1>
        <p className="text-muted-foreground leading-relaxed">
          Your application to join the Aivv Commerce supply chain is now under review. 
          Our team will evaluate your store details and you'll receive a notification 
          once your status is updated.
        </p>
        <div className="pt-8">
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-xl px-8">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col gap-4">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-accent transition-colors"
        >
          <ChevronLeft className="size-4 mr-1" />
          Back to Dashboard
        </Link>
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Partner with us</h2>
          <h1 className="text-3xl font-bold">Become a Supplier</h1>
        </div>
      </div>

      <Card className="glass border-glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="size-5 text-accent" />
            Business Details
          </CardTitle>
          <CardDescription>
            Tell us about your fulfillment capabilities and the products you wish to list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store / Company Name</Label>
              <Input 
                id="storeName" 
                {...form.register("storeName")} 
                placeholder="e.g. Acme Fulfillment Solutions" 
                className="glass border-glass-border"
              />
              {form.formState.errors.storeName && (
                <p className="text-xs text-red-500">{form.formState.errors.storeName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Business Website (Optional)</Label>
              <Input 
                id="website" 
                {...form.register("website")} 
                placeholder="https://yourstore.com" 
                className="glass border-glass-border"
              />
              {form.formState.errors.website && (
                <p className="text-xs text-red-500">{form.formState.errors.website.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Business Overview</Label>
              <textarea 
                id="description" 
                {...form.register("description")}
                className="w-full min-h-[150px] rounded-xl glass border border-glass-border bg-transparent p-4 text-sm focus:border-accent outline-none"
                placeholder="Describe your inventory, shipping speed, and product categories..."
              />
              {form.formState.errors.description && (
                <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 rounded-2xl accent-gradient text-white font-bold shadow-xl shadow-accent/20"
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin mr-2" />
              ) : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
