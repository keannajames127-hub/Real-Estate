"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, KeyRound } from "lucide-react";

import {
  requestPasswordReset,
  signInWithCredentials,
  updatePassword,
} from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, FormBanner, Input } from "@/components/ui/Form";
import { Spinner } from "@/components/ui/Layout";
import { initialAuthState } from "@/lib/form-state";

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="lg" fullWidth disabled={pending}>
      {pending ? <Spinner className="h-4 w-4" /> : <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />}
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(signInWithCredentials, initialAuthState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {state.status === "error" && state.message ? (
        <FormBanner tone="error">{state.message}</FormBanner>
      ) : null}

      <Field
        label="Username or email"
        htmlFor="identifier"
        required
        error={errors.identifier}
      >
        <Input
          id="identifier"
          name="identifier"
          autoComplete="username"
          required
          autoFocus
          invalid={Boolean(errors.identifier)}
          placeholder="sarah"
        />
      </Field>

      <Field label="Password" htmlFor="password" required error={errors.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          invalid={Boolean(errors.password)}
          placeholder="••••••••••"
        />
      </Field>

      <div className="pt-1">
        <Submit label="Sign in" pendingLabel="Signing in…" />
      </div>

      <div className="flex items-center justify-between pt-1">
        <Link
          href="/admin/forgot-password"
          className="font-sans text-[0.78rem] text-stone underline-offset-4 transition-colors hover:text-charcoal hover:underline"
        >
          Forgot your password?
        </Link>
        <Link
          href="/"
          className="font-sans text-[0.78rem] text-stone transition-colors hover:text-charcoal"
        >
          Back to site
        </Link>
      </div>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordReset, initialAuthState);
  const errors = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div className="space-y-6">
        <FormBanner tone="success" title="Check your inbox">
          {state.message}
        </FormBanner>
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-2 font-sans text-[0.8rem] uppercase tracking-[0.16em] text-charcoal"
        >
          <ArrowRight className="h-3.5 w-3.5 rotate-180" strokeWidth={1.6} />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.status === "error" && state.message ? (
        <FormBanner tone="error">{state.message}</FormBanner>
      ) : null}

      <Field
        label="Administrator email"
        htmlFor="reset-email"
        required
        error={errors.email}
        hint="We will send a single-use link to set a new password."
      >
        <Input
          id="reset-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
          invalid={Boolean(errors.email)}
          placeholder="you@danishhomeproperties.com"
        />
      </Field>

      <Submit label="Send reset link" pendingLabel="Sending…" />

      <Link
        href="/admin/login"
        className="inline-flex items-center gap-2 font-sans text-[0.78rem] text-stone transition-colors hover:text-charcoal"
      >
        <ArrowRight className="h-3.5 w-3.5 rotate-180" strokeWidth={1.6} />
        Back to sign in
      </Link>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(updatePassword, initialAuthState);
  const errors = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div className="space-y-6">
        <FormBanner tone="success" title="Password updated">
          {state.message}
        </FormBanner>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 font-sans text-[0.8rem] uppercase tracking-[0.16em] text-charcoal"
        >
          <KeyRound className="h-3.5 w-3.5" strokeWidth={1.6} />
          Continue to the dashboard
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.status === "error" && state.message ? (
        <FormBanner tone="error">{state.message}</FormBanner>
      ) : null}

      <Field
        label="New password"
        htmlFor="new-password"
        required
        error={errors.password}
        hint="At least 10 characters, including a letter and a number."
      >
        <Input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          autoFocus
          invalid={Boolean(errors.password)}
        />
      </Field>

      <Field
        label="Confirm new password"
        htmlFor="confirm-password"
        required
        error={errors.confirm_password}
      >
        <Input
          id="confirm-password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          required
          invalid={Boolean(errors.confirm_password)}
        />
      </Field>

      <Submit label="Set new password" pendingLabel="Saving…" />
    </form>
  );
}
