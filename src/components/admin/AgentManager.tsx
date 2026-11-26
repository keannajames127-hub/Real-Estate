"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Plus, Save, Trash } from "lucide-react";

import { deleteAgent, saveAgent } from "@/actions/settings";
import { PortraitUploader } from "@/components/admin/PortraitUploader";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, FormBanner, Input } from "@/components/ui/Form";
import { Spinner } from "@/components/ui/Layout";
import { initialCrudState } from "@/lib/form-state";
import type { Agent } from "@/types/database";

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="sm" disabled={pending}>
      {pending ? <Spinner className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" strokeWidth={1.6} />}
      {pending ? "Saving…" : label}
    </Button>
  );
}

function AgentForm({ agent, isNew = false }: { agent?: Agent; isNew?: boolean }) {
  const [state, formAction] = useActionState(saveAgent, initialCrudState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {agent ? <input type="hidden" name="id" value={agent.id} /> : null}

      {state.status === "error" && state.message ? (
        <FormBanner tone="error">{state.message}</FormBanner>
      ) : null}
      {state.status === "success" ? (
        <FormBanner tone="success">{state.message}</FormBanner>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor={`name-${agent?.id ?? "new"}`} required error={errors.name}>
          <Input
            id={`name-${agent?.id ?? "new"}`}
            name="name"
            required
            defaultValue={agent?.name}
            placeholder="Sarah Danish"
            invalid={Boolean(errors.name)}
          />
        </Field>

        <Field label="Title" htmlFor={`title-${agent?.id ?? "new"}`} error={errors.title}>
          <Input
            id={`title-${agent?.id ?? "new"}`}
            name="title"
            defaultValue={agent?.title ?? ""}
            placeholder="Founding Principal"
          />
        </Field>

        <Field label="Email" htmlFor={`email-${agent?.id ?? "new"}`} error={errors.email}>
          <Input
            id={`email-${agent?.id ?? "new"}`}
            name="email"
            type="email"
            defaultValue={agent?.email ?? ""}
            invalid={Boolean(errors.email)}
          />
        </Field>

        <Field label="Phone" htmlFor={`phone-${agent?.id ?? "new"}`} error={errors.phone}>
          <Input
            id={`phone-${agent?.id ?? "new"}`}
            name="phone"
            defaultValue={agent?.phone ?? ""}
            invalid={Boolean(errors.phone)}
          />
        </Field>

        <Field
          label="Portrait"
          htmlFor={`photo-${agent?.id ?? "new"}`}
          error={errors.photo_url}
          hint="Upload a headshot of the founder, co-founder or advisor. A roughly square photograph works best."
          className="sm:col-span-2"
        >
          <PortraitUploader
            initialUrl={agent?.photo_url}
            inputId={`photo-${agent?.id ?? "new"}`}
            alt={agent?.name ? `${agent.name} portrait` : "Advisor portrait"}
          />
        </Field>

        <Field
          label="Licence number"
          htmlFor={`licence-${agent?.id ?? "new"}`}
          error={errors.license_number}
        >
          <Input
            id={`licence-${agent?.id ?? "new"}`}
            name="license_number"
            defaultValue={agent?.license_number ?? ""}
          />
        </Field>

        <Field
          label="Specialties"
          htmlFor={`specialties-${agent?.id ?? "new"}`}
          error={errors.specialties}
          hint="Comma separated, e.g. Waterfront, New development"
          className="sm:col-span-2"
        >
          <Input
            id={`specialties-${agent?.id ?? "new"}`}
            name="specialties"
            defaultValue={(agent?.specialties ?? []).join(", ")}
          />
        </Field>

        <Field label="Biography" htmlFor={`bio-${agent?.id ?? "new"}`} error={errors.bio} className="sm:col-span-2">
          <textarea
            id={`bio-${agent?.id ?? "new"}`}
            name="bio"
            rows={4}
            defaultValue={agent?.bio ?? ""}
            className="w-full border border-hairline bg-white px-4 py-3 font-sans text-[0.9rem] leading-relaxed text-charcoal placeholder:text-mist focus:border-gold focus:outline-none"
          />
        </Field>

        <Field label="Display order" htmlFor={`sort-${agent?.id ?? "new"}`} error={errors.sort_order}>
          <Input
            id={`sort-${agent?.id ?? "new"}`}
            name="sort_order"
            type="number"
            min={0}
            max={999}
            defaultValue={agent?.sort_order ?? 0}
          />
        </Field>

        <div className="flex items-end pb-1">
          <Checkbox
            name="is_active"
            label="Show on the public site"
            defaultChecked={agent ? agent.is_active : true}
          />
        </div>
      </div>

      <SaveButton label={isNew ? "Add advisor" : "Save advisor"} />
    </form>
  );
}

function DeleteAgentButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Remove ${name} from the team?`)) return;
        startTransition(async () => {
          await deleteAgent(id);
          router.refresh();
        });
      }}
      className="inline-flex items-center gap-2 border border-hairline px-4 py-2 font-sans text-[0.66rem] uppercase tracking-[0.16em] text-stone transition-colors hover:border-red-600 hover:text-red-700 disabled:opacity-40"
    >
      <Trash className="h-3.5 w-3.5" strokeWidth={1.6} />
      {pending ? "Removing…" : "Remove"}
    </button>
  );
}

export function AgentManager({ agents }: { agents: Agent[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-6">
      {agents.length === 0 ? (
        <p className="font-sans text-[0.86rem] text-mist">
          No advisors yet. Add the first one and it will appear on the public advisors page.
        </p>
      ) : (
        <ul className="space-y-3">
          {agents.map((agent) => (
            <li key={agent.id} className="border border-hairline bg-shell">
              <details className="group">
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="font-sans text-[0.94rem] text-charcoal">
                      {agent.name}
                      {agent.title ? (
                        <span className="ml-2 font-sans text-[0.8rem] text-mist">{agent.title}</span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 font-sans text-[0.76rem] text-mist">
                      {agent.email ?? "No email"} · {agent.specialties.length} specialt
                      {agent.specialties.length === 1 ? "y" : "ies"}
                      {agent.is_active ? "" : " · hidden from the public site"}
                    </p>
                  </div>
                  <span className="font-sans text-[0.68rem] uppercase tracking-[0.16em] text-stone group-open:text-charcoal">
                    Edit
                  </span>
                </summary>

                <div className="border-t border-hairline bg-paper px-5 py-5">
                  <AgentForm agent={agent} />
                  <div className="mt-5 border-t border-hairline pt-5">
                    <DeleteAgentButton id={agent.id} name={agent.name} />
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}

      <div className="border border-hairline bg-paper">
        <button
          type="button"
          onClick={() => setAdding((current) => !current)}
          className="flex w-full items-center gap-2 px-5 py-4 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-charcoal"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
          {adding ? "Close" : "Add an advisor"}
        </button>

        {adding ? (
          <div className="border-t border-hairline px-5 py-5">
            <AgentForm isNew />
          </div>
        ) : null}
      </div>
    </div>
  );
}
