import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCustomerAuth } from "@/components/customer-auth-provider";

type CheckoutAuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkoutEmail: string;
  checkoutName: string;
  onSuccess: () => void;
};

export function CheckoutAuthDialog({
  open,
  onOpenChange,
  checkoutEmail,
  checkoutName,
  onSuccess,
}: CheckoutAuthDialogProps) {
  const { customer, signIn, register, signOut } = useCustomerAuth();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailMismatch =
    customer && customer.email.toLowerCase() !== checkoutEmail.trim().toLowerCase();

  async function handleContinue() {
    setError(null);
    setSubmitting(true);
    try {
      if (emailMismatch) {
        signOut();
      }
      if (mode === "register") {
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        await register(checkoutName.trim(), checkoutEmail.trim(), password);
      } else {
        await signIn(checkoutEmail.trim(), password);
      }
      onOpenChange(false);
      setPassword("");
      setConfirmPassword("");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign you in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Sign in to complete your order</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Your delivery details are saved. Create an account or sign in with the email below to continue to secure
            payment.
          </DialogDescription>
        </DialogHeader>

        {emailMismatch && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
            You&apos;re signed in as {customer.email}. Sign in with {checkoutEmail} to checkout with this address.
          </p>
        )}

        <div className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium tracking-wide text-muted-foreground">EMAIL</span>
            <input
              readOnly
              value={checkoutEmail}
              className="w-full border border-input bg-muted/40 p-3 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium tracking-wide text-muted-foreground">NAME</span>
            <input readOnly value={checkoutName} className="w-full border border-input bg-muted/40 p-3 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium tracking-wide text-muted-foreground">PASSWORD</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-input bg-background p-3 pr-11 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
              </button>
            </div>
          </label>
          {mode === "register" && (
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium tracking-wide text-muted-foreground">
                CONFIRM PASSWORD
              </span>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-input bg-background p-3 pr-11 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition hover:text-foreground"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" aria-hidden />
                  ) : (
                    <Eye className="size-4" aria-hidden />
                  )}
                </button>
              </div>
            </label>
          )}
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="button" className="w-full" disabled={submitting} onClick={handleContinue}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Please wait…
              </>
            ) : mode === "register" ? (
              "CREATE ACCOUNT & CONTINUE"
            ) : (
              "SIGN IN & CONTINUE"
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {mode === "register" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                New here?{" "}
                <button
                  type="button"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  onClick={() => {
                    setMode("register");
                    setError(null);
                  }}
                >
                  Create account
                </button>
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
