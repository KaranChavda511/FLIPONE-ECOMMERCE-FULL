import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "@/lib/toast";
import apiClient, { apiErrorMessage } from "../../config/apiClient";
import { FieldShell, Stamp } from "@/components/flipone";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/* Backend limits (categorySchemas): name 2–60 characters, at most 50 subcategories. */
const NAME_MIN = 2;
const NAME_MAX = 60;
const SUB_MAX = 50;

const sameList = (a, b) => a.length === b.length && a.every((value, i) => value === b[i]);
const lower = (value) => value.trim().toLowerCase();

/**
 * Add or edit a category in a right-hand Sheet: name + subcategories (chip input).
 * category: null to add (POST /api/admin/add-categories), or { _id, name, subcategories } to edit
 * (PATCH /api/admin/categories/:id with only the changed fields).
 * takenNames: the other categories' names, for the duplicate check before the request.
 * onSaved(category, { created }): the page updates its list; the toast is shown here.
 * Mount with a fresh `key` each time it opens so the fields start from `category`.
 */
export default function CategorySheet({ open, onOpenChange, category, takenNames = [], onSaved, onCloseAutoFocus }) {
  const editing = Boolean(category);
  const initialSubs = category?.subcategories ?? [];
  const [name, setName] = useState(category?.name ?? "");
  const [subs, setSubs] = useState(initialSubs);
  const [draft, setDraft] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [subError, setSubError] = useState("");
  const [serverError, setServerError] = useState("");
  const [pending, setPending] = useState(false);

  const trimmed = name.trim();
  const taken = takenNames.some((other) => lower(other) === lower(trimmed));
  let nameError = "";
  if (trimmed.length < NAME_MIN) nameError = trimmed ? `Use at least ${NAME_MIN} characters.` : "Enter a category name.";
  else if (trimmed.length > NAME_MAX) nameError = `Use at most ${NAME_MAX} characters.`;
  else if (taken) nameError = `A category called “${trimmed}” already exists.`;

  /* Adds the comma-separated text in `text` to the list; returns the new list (or the old one if nothing new). */
  const addDraft = (text = draft) => {
    const parts = text
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length === 0) return subs;
    const next = [...subs];
    const duplicates = [];
    for (const part of parts) {
      if (next.some((existing) => lower(existing) === lower(part))) duplicates.push(part);
      else next.push(part);
    }
    if (next.length > SUB_MAX) {
      setSubError(`A category can have at most ${SUB_MAX} subcategories.`);
      return subs;
    }
    setSubs(next);
    setDraft("");
    setSubError(duplicates.length ? `Already in the list: ${duplicates.join(", ")}.` : "");
    return next;
  };

  const removeSub = (value) => {
    setSubs((current) => current.filter((item) => item !== value));
    setSubError("");
  };

  const nextSubs = () => (draft.trim() ? addDraft() : subs);
  const changed = !editing || trimmed !== category.name || !sameList(subs, initialSubs) || Boolean(draft.trim());

  const submit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setServerError("");
    if (nameError) return;
    const subcategories = nextSubs();

    let body;
    if (editing) {
      body = {};
      if (trimmed !== category.name) body.name = trimmed;
      if (!sameList(subcategories, initialSubs)) body.subcategories = subcategories;
      if (Object.keys(body).length === 0) {
        onOpenChange(false);
        return;
      }
    } else {
      body = { name: trimmed, subcategories };
    }

    setPending(true);
    try {
      const { data } = editing
        ? await apiClient.patch(`/api/admin/categories/${category._id}`, body)
        : await apiClient.post("/api/admin/add-categories", body);
      const saved = data?.category ?? { ...category, ...body };
      onSaved?.(saved, { created: !editing });
      toast.success(editing ? "Category saved" : "Category added", { description: saved.name });
      onOpenChange(false);
    } catch (err) {
      setServerError(apiErrorMessage(err, editing ? "Could not save the category" : "Could not add the category"));
    } finally {
      setPending(false);
    }
  };

  const onDraftKeyDown = (event) => {
    if (event.key === "Enter") {
      // Enter adds the subcategory instead of submitting the form.
      event.preventDefault();
      addDraft();
    } else if (event.key === "Backspace" && !draft && subs.length > 0) {
      removeSub(subs[subs.length - 1]);
    }
  };

  const onDraftChange = (event) => {
    const value = event.target.value;
    // A typed or pasted comma commits what comes before it.
    if (value.includes(",")) {
      const lastComma = value.lastIndexOf(",");
      addDraft(value.slice(0, lastComma));
      setDraft(value.slice(lastComma + 1).trimStart());
    } else {
      setDraft(value);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <SheetContent className="w-full gap-0 sm:max-w-[460px]" onCloseAutoFocus={onCloseAutoFocus}>
        <SheetHeader className="gap-1 border-b border-line-soft px-6 pt-5 pb-4">
          <SheetTitle className="pr-10 text-[19px] leading-tight tracking-[-0.01em]">
            {editing ? `Edit ${category.name}` : "Add category"}
          </SheetTitle>
          <SheetDescription className="text-[14px]">
            {editing
              ? "Renaming updates every product filed under this category."
              : "Shoppers browse by it, and sellers file products under it."}
          </SheetDescription>
        </SheetHeader>

        <form noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
            <FieldShell label="Name" required error={submitted ? nameError : undefined}>
              {(control) => (
                <Input
                  {...control}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={NAME_MAX}
                  autoComplete="off"
                  placeholder="e.g. Footwear"
                  disabled={pending}
                />
              )}
            </FieldShell>

            <FieldShell
              label="Subcategories"
              error={subError || undefined}
              hint={
                editing
                  ? "Press Enter or type a comma to add one. Removing one does not change products already listed with it."
                  : "Press Enter or type a comma to add one. Sellers pick from these."
              }
            >
              {(control) => (
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <Input
                      {...control}
                      value={draft}
                      onChange={onDraftChange}
                      onKeyDown={onDraftKeyDown}
                      autoComplete="off"
                      placeholder="e.g. Sneakers"
                      disabled={pending}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 shrink-0"
                      onClick={() => addDraft()}
                      disabled={pending || !draft.trim()}
                    >
                      <Plus aria-hidden="true" />
                      Add
                    </Button>
                  </div>
                  {subs.length > 0 ? (
                    <ul aria-label={`Subcategories (${subs.length})`} className="flex flex-wrap gap-x-1.5 gap-y-2">
                      {subs.map((sub) => (
                        <li key={sub} className="flex items-center gap-0.5">
                          <Stamp variant="category">{sub}</Stamp>
                          <button
                            type="button"
                            onClick={() => removeSub(sub)}
                            disabled={pending}
                            aria-label={`Remove ${sub}`}
                            className="grid size-6 place-items-center rounded-sm text-muted-foreground transition-colors duration-150 ease-(--ease-out-quint) hover:bg-danger-tint hover:text-danger disabled:pointer-events-none"
                          >
                            <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[13px] text-muted-foreground">No subcategories yet.</p>
                  )}
                </div>
              )}
            </FieldShell>

            {serverError && (
              <p
                role="alert"
                className="rounded-md border border-danger/35 bg-danger-tint px-3.5 py-2.5 text-[14px] text-ink-2"
              >
                <span className="font-semibold text-danger">{editing ? "Not saved." : "Not added."}</span> {serverError}
              </p>
            )}
          </div>

          <SheetFooter className="mt-0 flex-row justify-end gap-2 border-t border-line-soft px-6 py-4">
            <SheetClose asChild>
              <Button variant="outline" disabled={pending}>
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" disabled={pending || !changed}>
              {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
              {pending ? "Saving…" : editing ? "Save changes" : "Add category"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
