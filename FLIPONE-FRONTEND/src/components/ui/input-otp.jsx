import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { cn } from "@/lib/utils";

/*
 * shadcn/ui input-otp, restyled for FlipOne: separate boxes with large Barlow numerals, an ink ring on the
 * active box, red when aria-invalid. Paste, autofill (autocomplete="one-time-code") and arrow keys come from
 * the input-otp library.
 */
function InputOTP({ className, containerClassName, ...props }) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn("flex w-full items-center has-disabled:opacity-50", containerClassName)}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }) {
  // Equal columns across the full width: the first and last boxes sit on the same edges as the fields and buttons.
  return <div data-slot="input-otp-group" className={cn("grid w-full grid-cols-6 gap-2.5", className)} {...props} />;
}

function InputOTPSlot({ index, className, ...props }) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "relative flex h-14 w-full items-center justify-center rounded-md border border-line bg-surface font-display text-[30px] leading-none font-semibold text-ink tabular",
        "transition-[border-color,box-shadow] duration-150",
        "data-[active=true]:z-10 data-[active=true]:border-ink data-[active=true]:shadow-[0_0_0_3px_rgb(23_21_15/0.12)]",
        "aria-invalid:border-danger aria-invalid:bg-danger-tint/40 data-[active=true]:aria-invalid:shadow-[0_0_0_3px_rgb(158_27_50/0.15)]",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-7 w-px animate-[fo-caret-blink_1s_ease-out_infinite] bg-ink" />
        </div>
      )}
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot };
