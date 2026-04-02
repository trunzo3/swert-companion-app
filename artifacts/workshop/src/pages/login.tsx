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

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const [isInitializing, setIsInitializing] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) {
      loginMutation.mutate(
        { data: { email: session.email } },
        {
          onSuccess: (data) => {
            setSession({
              email: data.participant.email,
              participantId: data.participant.id,
            });
            setLocation("/home");
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
    defaultValues: { email: "", confirmEmail: "" },
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
          setLocation("/home");
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: (error as any).error || "An unexpected error occurred",
          });
        },
      }
    );
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    setAdminLoading(true);
    try {
      const res = await fetch(`${BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminError(data.error || "Invalid credentials.");
      } else {
        localStorage.setItem("admin-authenticated", "true");
        setLocation("/admin");
      }
    } catch {
      setAdminError("Connection error. Please try again.");
    } finally {
      setAdminLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Logo className="animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 bg-background relative">
      <div className="w-full max-w-md space-y-8">
        {!showAdmin ? (
          <>
            <div className="flex flex-col items-center text-center space-y-4">
              <Logo className="scale-125 mb-4" />
              <h1 className="text-3xl font-serif font-bold text-primary">Workshop Companion</h1>
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
          </>
        ) : (
          <>
            <div className="flex flex-col items-center text-center space-y-2 mb-4">
              <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">⚙ Admin Access</span>
            </div>
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Email</label>
                  <Input
                    type="email"
                    placeholder="Admin email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                {adminError && (
                  <p className="text-sm text-destructive font-medium">{adminError}</p>
                )}
                <Button type="submit" className="w-full h-12 text-lg" disabled={adminLoading}>
                  {adminLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              <button
                onClick={() => { setShowAdmin(false); setAdminError(""); }}
                className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors block w-full text-center"
              >
                ← Back to participant login
              </button>
            </div>
          </>
        )}
      </div>

      <button
        onClick={() => setShowAdmin(true)}
        className="fixed bottom-4 left-4 text-muted-foreground opacity-40 hover:opacity-70 transition-opacity text-xl p-1"
        aria-label=""
        title=""
        data-testid="gear-admin-icon"
      >
        ⚙
      </button>
    </div>
  );
}
