"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Send } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Field, FormBanner, Input, Select, Textarea } from "@/components/ui/Form";
import { Spinner } from "@/components/ui/Layout";
import { submitEnquiry } from "@/actions/enquiries";
import {
  CONTACT_METHOD_OPTIONS,
  ENQUIRY_TYPE_OPTIONS,
  ENQUIRY_TYPE_LABELS,
} from "@/lib/constants";
import { initialEnquiryState } from "@/lib/form-state";
import { cn } from "@/lib/utils";
import type { EnquiryType } from "@/types/database";

interface EnquiryFormProps {
  propertyId?: string | null;
  propertyTitle?: string | null;
  defaultEnquiryType?: EnquiryType;
  sourcePage?: string;
  /** Locks the enquiry type to a single value (used by "schedule a viewing"). */
  lockType?: boolean;
  heading?: string;
  description?: string;
  defaultMessage?: string;
  submitLabel?: string;
  tone?: "light" | "dark";
  className?: string;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="lg" fullWidth disabled={pending}>
      {pending ? <Spinner className="h-4 w-4" /> : <Send className="h-3.5 w-3.5" strokeWidth={1.6} />}
      {pending ? "Sending…" : label}
    </Button>
  );
}

export function EnquiryForm({
  propertyId = null,
  propertyTitle = null,
  defaultEnquiryType = "general",
  sourcePage,
  lockType = false,
  heading,
  description,
  defaultMessage,
  submitLabel = "Send enquiry",
  tone = "light",
  className,
}: EnquiryFormProps) {
  const [state, formAction] = useActionState(submitEnquiry, initialEnquiryState);
  const isDark = tone === "dark";
  const errors = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div
        className={cn(
          "border p-8",
          isDark ? "border-white/15 bg-white/5 text-white" : "border-emerald-200 bg-emerald-50",
          className,
        )}
      >
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full",
            isDark ? "bg-gold text-white" : "bg-emerald-600 text-white",
          )}
        >
          <Check className="h-5 w-5" strokeWidth={2} />
        </span>
        <h3
          className={cn(
            "mt-6 font-display text-[1.5rem] leading-snug",
            isDark ? "text-white" : "text-emerald-950",
          )}
        >
          Thank you — your enquiry is with us.
        </h3>
        <p
          className={cn(
            "mt-3 font-sans text-[0.9rem] leading-relaxed",
            isDark ? "text-white/70" : "text-emerald-900/80",
          )}
        >
          {state.message}
        </p>
        {state.reference && state.reference !== "—" ? (
          <p
            className={cn(
              "mt-5 font-sans text-[0.78rem] tracking-[0.08em]",
              isDark ? "text-white/55" : "text-emerald-900/60",
            )}
          >
            Reference: <span className="font-medium">{state.reference}</span>
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={cn(
            "mt-7 font-sans text-[0.72rem] uppercase tracking-[0.18em] underline-offset-4 hover:underline",
            isDark ? "text-gold-soft" : "text-emerald-800",
          )}
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className={cn("space-y-5", className)} noValidate>
      {heading ? (
        <div className="mb-7">
          <h3 className={cn("font-display text-[1.6rem] leading-snug", isDark ? "text-white" : "text-ink")}>
            {heading}
          </h3>
          {description ? (
            <p
              className={cn(
                "mt-3 font-sans text-[0.88rem] leading-relaxed",
                isDark ? "text-white/60" : "text-stone",
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      {state.status === "error" && state.message ? (
        <FormBanner tone="error" title="We could not send that">
          {state.message}
        </FormBanner>
      ) : null}

      <input type="hidden" name="enquiry_type_locked" value={lockType ? "1" : "0"} />
      {propertyId ? <input type="hidden" name="property_id" value={propertyId} /> : null}
      {propertyTitle ? (
        <input type="hidden" name="property_title_snapshot" value={propertyTitle} />
      ) : null}
      {sourcePage ? <input type="hidden" name="source_page" value={sourcePage} /> : null}

      {/* Honeypot — visually and programmatically hidden from people. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="company_website">Company website</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="full_name" required error={errors.full_name}>
          <Input
            id="full_name"
            name="full_name"
            autoComplete="name"
            required
            invalid={Boolean(errors.full_name)}
            placeholder="Alexandra Whitfield"
          />
        </Field>

        <Field label="Email address" htmlFor="email" required error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            invalid={Boolean(errors.email)}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Phone number" htmlFor="phone" error={errors.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            invalid={Boolean(errors.phone)}
            placeholder="(404) 555 0134"
          />
        </Field>

        {lockType ? (
          <>
            <input type="hidden" name="enquiry_type" value={defaultEnquiryType} />
            <Field label="Enquiry type" htmlFor="enquiry_type_readonly">
              <Input
                id="enquiry_type_readonly"
                value={ENQUIRY_TYPE_LABELS[defaultEnquiryType]}
                readOnly
                disabled
              />
            </Field>
          </>
        ) : (
          <Field label="Enquiry type" htmlFor="enquiry_type" required error={errors.enquiry_type}>
            <Select id="enquiry_type" name="enquiry_type" defaultValue={defaultEnquiryType}>
              {ENQUIRY_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <Field
          label="Preferred contact method"
          htmlFor="preferred_contact_method"
          required
          error={errors.preferred_contact_method}
        >
          <Select id="preferred_contact_method" name="preferred_contact_method" defaultValue="either">
            {CONTACT_METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        {propertyTitle ? (
          <Field label="Property of interest" htmlFor="property_of_interest">
            <Input id="property_of_interest" value={propertyTitle} readOnly disabled />
          </Field>
        ) : null}
      </div>

      <Field
        label="Message"
        htmlFor="message"
        required
        error={errors.message}
        hint="Tell us what you are looking for, and the best time to reach you."
      >
        <Textarea
          id="message"
          name="message"
          required
          invalid={Boolean(errors.message)}
          defaultValue={
            defaultMessage ??
            (propertyTitle
              ? `I would like more information about ${propertyTitle}.`
              : undefined)
          }
          placeholder="We are looking for a home in Buckhead with four bedrooms…"
        />
      </Field>

      <div className="pt-2">
        <SubmitButton label={submitLabel} />
      </div>

      <p className={cn("font-sans text-[0.72rem] leading-relaxed", isDark ? "text-white/40" : "text-mist")}>
        Your details are held in confidence and are never shared with third parties.
      </p>
    </form>
  );
}
