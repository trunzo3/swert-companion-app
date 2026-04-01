import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@workspace/api-client-react";
import { getSession, setSession } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    confirmEmail: z.string().email("Please confirm your email address"),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: "Emails do not match",
    path: ["confirmEmail"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session) {
      // Auto-login
      loginMutation.mutate(
        { data: { email: session.email } },
        {
          onSuccess: (data) => {
            setSession({
              email: data.participant.email,
              participantId: data.participant.id,
            });
            setLocation("/workshop");
          },
          onError: () => {
            setIsInitializing(false);
          },
        }
      );
    } else {
      setIsInitializing(false);
    }
  }, [setLocation]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      confirmEmail: "",
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(
      { data: { email: values.email } },
      {
        onSuccess: (data) => {
          setSession({
            email: data.participant.email,
            participantId: data.participant.id,
          });
          setLocation("/workshop");
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: error.error || "An unexpected error occurred",
          });
        },
      }
    );
  };

  if (isInitializing) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Logo className="animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <Logo className="scale-125 mb-4" />
          <h1 className="text-3xl font-serif font-bold text-primary">
            Workshop Companion
          </h1>
          <p className="text-muted-foreground max-w-sm">
            Enter your email to access your interactive workbook and saved notes.
          </p>
        </div>

        <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@county.ca.gov"
                        type="email"
                        autoComplete="email"
                        data-testid="input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@county.ca.gov"
                        type="email"
                        autoComplete="email"
                        data-testid="input-confirm-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 text-lg"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? "Entering..." : "Enter Workshop"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
      
      {/* Hidden Admin Entry */}
      <div className="fixed bottom-4 right-4">
        <button 
          onClick={() => setLocation('/admin/login')}
          className="w-8 h-8 rounded-full opacity-0 hover:opacity-20 focus:opacity-20 transition-opacity bg-primary"
          aria-label="Admin Login"
          data-testid="button-hidden-admin"
        />
      </div>
    </div>
  );
}
