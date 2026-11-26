"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Save, Trash, UserPlus } from "lucide-react";

import {
  deactivateAdministrator,
  inviteAdministrator,
  updateOwnEmail,
  updateOwnProfile,
  updatePassword,
} from "@/actions/auth";
import { saveSettings } from "@/actions/settings";
import { Button } from "@/components/ui/Button";
import { Field, FormBanner, Input, Select, Textarea } from "@/components/ui/Form";
import { Spinner } from "@/components/ui/Layout";
import { initialAuthState, initialCrudState } from "@/lib/form-state";
import type { AdminUser, SiteSettings } from "@/types/database";
import { formatDateTime } from "@/lib/utils";

function Panel({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border border-hairline bg-paper scroll-mt-28">
      <div className="border-b border-hairline px-6 py-5">
        <h2 className="font-display text-[1.2rem] text-charcoal">{title}</h2>
        {description ? (
          <p className="mt-1.5 font-sans text-[0.82rem] text-stone">{description}</p>
        ) : null}
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending}>
      {pending ? <Spinner className="h-4 w-4" /> : <Save className="h-3.5 w-3.5" strokeWidth={1.6} />}
      {pending ? pendingLabel : label}
    </Button>
  );
}

/** Username and display name for the signed-in administrator. */
export function ProfileForm({
  defaultUsername,
  defaultFullName,
  email,
}: {
  defaultUsername: string;
  defaultFullName: string;
  email: string;
}) {
  const [state, formAction] = useActionState(updateOwnProfile, initialAuthState);
  const errors = state.fieldErrors ?? {};

  return (
    <Panel
      id="profile"
      title="Your profile"
      description="Your username and the name shown in the dashboard."
    >
      <form action={formAction} className="space-y-5" noValidate>
        {state.status === "error" && state.message ? (
          <FormBanner tone="error">{state.message}</FormBanner>
        ) : null}
        {state.status === "success" ? (
          <FormBanner tone="success">{state.message}</FormBanner>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Username" htmlFor="username" required error={errors.username}>
            <Input
              id="username"
              name="username"
              required
              defaultValue={defaultUsername}
              autoComplete="username"
              invalid={Boolean(errors.username)}
            />
          </Field>

          <Field label="Full name" htmlFor="full_name" error={errors.full_name}>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={defaultFullName}
              autoComplete="name"
              invalid={Boolean(errors.full_name)}
            />
          </Field>
        </div>

        <p className="font-sans text-[0.8rem] text-mist">
          Signing in with an email address also works: {email}
        </p>

        <Submit label="Save profile" pendingLabel="Saving…" />
      </form>
    </Panel>
  );
}

/** The address used to sign in and to receive password resets. */
export function EmailForm({ defaultEmail }: { defaultEmail: string }) {
  const [state, formAction] = useActionState(updateOwnEmail, initialAuthState);
  const errors = state.fieldErrors ?? {};

  return (
    <Panel
      title="Login email"
      description="Changing this updates the address that identifies your account."
    >
      <form action={formAction} className="space-y-5" noValidate>
        {state.status === "error" && state.message ? (
          <FormBanner tone="error">{state.message}</FormBanner>
        ) : null}
        {state.status === "success" ? (
          <FormBanner tone="success">{state.message}</FormBanner>
        ) : null}

        <Field label="Email address" htmlFor="email" required error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={defaultEmail}
            autoComplete="email"
            invalid={Boolean(errors.email)}
          />
        </Field>

        <Submit label="Update email" pendingLabel="Updating…" />
      </form>
    </Panel>
  );
}

export function PasswordForm() {
  const [state, formAction] = useActionState(updatePassword, initialAuthState);
  const errors = state.fieldErrors ?? {};

  return (
    <Panel
      id="password"
      title="Password"
      description="At least 10 characters, including a letter and a number."
    >
      <form action={formAction} className="space-y-5" noValidate>
        {state.status === "error" && state.message ? (
          <FormBanner tone="error">{state.message}</FormBanner>
        ) : null}
        {state.status === "success" ? (
          <FormBanner tone="success">{state.message}</FormBanner>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="New password" htmlFor="password" required error={errors.password}>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              invalid={Boolean(errors.password)}
            />
          </Field>

          <Field
            label="Confirm password"
            htmlFor="confirm_password"
            required
            error={errors.confirm_password}
          >
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              autoComplete="new-password"
              invalid={Boolean(errors.confirm_password)}
            />
          </Field>
        </div>

        <Submit label="Change password" pendingLabel="Updating…" />
      </form>
    </Panel>
  );
}

/** Business details, contact information, homepage copy and social links. */
export function BusinessSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction] = useActionState(saveSettings, initialCrudState);
  const errors = state.fieldErrors ?? {};
  const social = settings.social_links ?? {};

  return (
    <Panel
      id="business"
      title="Business information"
      description="Shown in the header, footer and contact pages across the public site."
    >
      <form action={formAction} className="space-y-8" noValidate>
        {state.status === "error" && state.message ? (
          <FormBanner tone="error">{state.message}</FormBanner>
        ) : null}
        {state.status === "success" ? (
          <FormBanner tone="success">{state.message}</FormBanner>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Business name" htmlFor="business_name" required error={errors.business_name}>
            <Input
              id="business_name"
              name="business_name"
              required
              defaultValue={settings.business_name}
              invalid={Boolean(errors.business_name)}
            />
          </Field>

          <Field label="Tagline" htmlFor="tagline" error={errors.tagline}>
            <Input id="tagline" name="tagline" defaultValue={settings.tagline ?? ""} />
          </Field>

          <Field label="Public email" htmlFor="contact_email" error={errors.contact_email}>
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              defaultValue={settings.contact_email ?? ""}
              placeholder="hello@example.com"
              invalid={Boolean(errors.contact_email)}
            />
          </Field>

          <Field
            label="Public phone (WhatsApp)"
            htmlFor="contact_phone"
            error={errors.contact_phone}
            hint="Shown across the site as a WhatsApp chat link, so visitors message you instead of calling. Include the country code."
          >
            <Input
              id="contact_phone"
              name="contact_phone"
              defaultValue={settings.contact_phone ?? ""}
              placeholder="+1 (404) 555-0182"
              invalid={Boolean(errors.contact_phone)}
            />
          </Field>

          <Field
            label="Office address"
            htmlFor="office_address"
            error={errors.office_address}
            className="sm:col-span-2"
          >
            <Input
              id="office_address"
              name="office_address"
              defaultValue={settings.office_address ?? ""}
            />
          </Field>

          <Field
            label="Enquiry notification email"
            htmlFor="notification_email"
            error={errors.notification_email}
            hint="Where new-enquiry emails are delivered. Falls back to the public email when blank."
            className="sm:col-span-2"
          >
            <Input
              id="notification_email"
              name="notification_email"
              type="email"
              defaultValue={settings.notification_email ?? ""}
              invalid={Boolean(errors.notification_email)}
            />
          </Field>
        </div>

        <div className="rule-fade" />

        <div className="grid gap-6">
          <Field label="Homepage headline" htmlFor="hero_headline" error={errors.hero_headline}>
            <Input
              id="hero_headline"
              name="hero_headline"
              defaultValue={settings.hero_headline ?? ""}
              placeholder="Discover Exceptional Properties"
            />
          </Field>

          <Field
            label="Homepage sub-headline"
            htmlFor="hero_subheadline"
            error={errors.hero_subheadline}
          >
            <Textarea
              id="hero_subheadline"
              name="hero_subheadline"
              rows={2}
              defaultValue={settings.hero_subheadline ?? ""}
            />
          </Field>

          <Field
            label="Hero image URL"
            htmlFor="hero_image_url"
            error={errors.hero_image_url}
            hint="Leave blank to use the newest featured listing's photography."
          >
            <Input id="hero_image_url" name="hero_image_url" defaultValue={settings.hero_image_url ?? ""} />
          </Field>

          <Field
            label="About text"
            htmlFor="about_text"
            error={errors.about_text}
            hint="Used on the homepage and about page. Separate paragraphs with a blank line."
          >
            <Textarea id="about_text" name="about_text" rows={6} defaultValue={settings.about_text ?? ""} />
          </Field>

          <Field label="Footer note" htmlFor="footer_note" error={errors.footer_note}>
            <Input
              id="footer_note"
              name="footer_note"
              defaultValue={settings.footer_note ?? ""}
              placeholder="Equal Housing Opportunity."
            />
          </Field>
        </div>

        <div className="rule-fade" />

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Instagram URL" htmlFor="instagram" error={errors.instagram}>
            <Input id="instagram" name="instagram" defaultValue={social.instagram ?? ""} />
          </Field>
          <Field label="Facebook URL" htmlFor="facebook" error={errors.facebook}>
            <Input id="facebook" name="facebook" defaultValue={social.facebook ?? ""} />
          </Field>
          <Field label="LinkedIn URL" htmlFor="linkedin" error={errors.linkedin}>
            <Input id="linkedin" name="linkedin" defaultValue={social.linkedin ?? ""} />
          </Field>
          <Field label="YouTube URL" htmlFor="youtube" error={errors.youtube}>
            <Input id="youtube" name="youtube" defaultValue={social.youtube ?? ""} />
          </Field>
        </div>

        <Submit label="Save website settings" pendingLabel="Saving…" />
      </form>
    </Panel>
  );
}

/** Owners and admins only: invite or deactivate other administrators. */
export function AdminUsersPanel({ admins }: { admins: AdminUser[] }) {
  const router = useRouter();
  const [state, formAction] = useActionState(inviteAdministrator, initialAuthState);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const errors = state.fieldErrors ?? {};

  return (
    <Panel
      id="administrators"
      title="Administrators"
      description="Who can sign in to this dashboard."
    >
      <div className="space-y-8">
        <ul className="divide-y divide-hairline border border-hairline">
          {admins.map((admin) => (
            <li key={admin.id} className="flex flex-wrap items-center justify-between gap-4 px-4 py-4">
              <div className="min-w-0">
                <p className="font-sans text-[0.9rem] text-charcoal">
                  {admin.full_name ?? admin.username}
                  <span className="ml-2 font-sans text-[0.72rem] uppercase tracking-[0.14em] text-mist">
                    {admin.role}
                  </span>
                </p>
                <p className="mt-0.5 font-sans text-[0.78rem] text-mist">
                  {admin.username} · {admin.email}
                </p>
                <p className="mt-0.5 font-sans text-[0.72rem] text-mist">
                  Last signed in {formatDateTime(admin.last_login_at)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={
                    admin.is_active
                      ? "font-sans text-[0.68rem] uppercase tracking-[0.14em] text-emerald-700"
                      : "font-sans text-[0.68rem] uppercase tracking-[0.14em] text-mist"
                  }
                >
                  {admin.is_active ? "Active" : "Inactive"}
                </span>
                {admin.is_active ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      if (!window.confirm(`Deactivate ${admin.email}?`)) return;
                      setError(null);
                      startTransition(async () => {
                        const result = await deactivateAdministrator(admin.id);
                        if (!result.ok) setError(result.error ?? "Could not deactivate.");
                        else router.refresh();
                      });
                    }}
                    aria-label="Deactivate administrator"
                    className="flex h-8 w-8 items-center justify-center border border-hairline text-stone transition-colors hover:border-red-600 hover:text-red-700 disabled:opacity-40"
                  >
                    <Trash className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        {error ? <FormBanner tone="error">{error}</FormBanner> : null}

        <form action={formAction} className="space-y-5" noValidate>
          <p className="eyebrow flex items-center gap-2 text-charcoal">
            <UserPlus className="h-3.5 w-3.5" strokeWidth={1.6} />
            Add an administrator
          </p>

          {state.status === "error" && state.message ? (
            <FormBanner tone="error">{state.message}</FormBanner>
          ) : null}
          {state.status === "success" ? (
            <FormBanner tone="success">{state.message}</FormBanner>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Email address" htmlFor="invite_email" required error={errors.email}>
              <Input
                id="invite_email"
                name="email"
                type="email"
                required
                invalid={Boolean(errors.email)}
              />
            </Field>

            <Field label="Username" htmlFor="invite_username" required error={errors.username}>
              <Input
                id="invite_username"
                name="username"
                required
                invalid={Boolean(errors.username)}
              />
            </Field>

            <Field label="Full name" htmlFor="invite_full_name">
              <Input id="invite_full_name" name="full_name" />
            </Field>

            <Field label="Role" htmlFor="invite_role">
              <Select id="invite_role" name="role" defaultValue="admin">
                <option value="admin">Admin — manage everything</option>
                <option value="editor">Editor — listings only</option>
                <option value="owner">Owner</option>
              </Select>
            </Field>
          </div>

          <Submit label="Create administrator" pendingLabel="Creating…" />
        </form>
      </div>
    </Panel>
  );
}
