/**
 * Shared `useActionState` shapes.
 *
 * These live outside the server-action modules on purpose: a file marked
 * `"use server"` may only export async functions at runtime, so an object
 * constant declared there would fail at build time. Keeping the state types
 * and their initial values here lets both the action and the form share them.
 */

export interface AuthFormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const initialAuthState: AuthFormState = { status: "idle" };

export interface EnquiryFormState {
  status: "idle" | "success" | "error";
  message?: string;
  reference?: string;
  fieldErrors?: Record<string, string>;
}

export const initialEnquiryState: EnquiryFormState = { status: "idle" };

export interface PropertyFormState {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const initialPropertyState: PropertyFormState = { status: "idle" };

export interface CrudFormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const initialCrudState: CrudFormState = { status: "idle" };
