import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CONSEQUENCE = {
  user: {
    deactivate: "They will not be able to log in or use their account until you activate it again.",
    activate: "They will be able to log in and place orders again.",
  },
  seller: {
    deactivate: "They will not be able to log in, and all of their products will be hidden from the store.",
    activate:
      "They will be able to log in again. Products hidden when the account was turned off are not switched back on automatically.",
  },
};

/**
 * Account on/off switch (shadcn Switch, on = success) that asks for confirmation in a Dialog before
 * calling `onConfirm` (async; the page updates its data and shows the toast).
 *
 * Props: active, name (account name, used in the labels), kind 'user' | 'seller', onConfirm, showLabel.
 */
export default function StatusSwitch({ active, name, kind = "user", onConfirm, showLabel = true, className }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const switchRef = useRef(null);
  const verb = active ? "deactivate" : "activate";
  const Verb = active ? "Deactivate" : "Activate";
  const who = name || (kind === "seller" ? "this seller" : "this user");

  const confirm = async () => {
    setPending(true);
    try {
      await onConfirm?.();
      setOpen(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <Switch
        ref={switchRef}
        checked={Boolean(active)}
        onCheckedChange={() => setOpen(true)}
        disabled={pending}
        aria-label={`Account active: ${who}`}
      />
      {showLabel && (
        <span
          aria-hidden="true"
          className={cn("text-[13.5px] font-medium", active ? "text-success" : "text-muted-foreground")}
        >
          {active ? "Active" : "Inactive"}
        </span>
      )}

      <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
        <DialogContent
          className="sm:max-w-[440px]"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            switchRef.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {Verb} {who}?
            </DialogTitle>
            <DialogDescription>{CONSEQUENCE[kind]?.[verb] ?? CONSEQUENCE.user[verb]}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant={active ? "destructive" : "ink"} size="sm" onClick={confirm} disabled={pending}>
              {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
              {pending ? `${Verb.replace(/e$/, "")}ing…` : `${Verb} ${kind === "seller" ? "seller" : "user"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
