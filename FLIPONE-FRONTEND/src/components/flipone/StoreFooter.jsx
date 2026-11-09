import { Link } from "react-router-dom";
import { Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import Container from "./Container";
import Logo from "./Logo";

const LINKS = [
  { to: "/", label: "Shop" },
  { to: "/categories?category=Women", label: "Women" },
  { to: "/categories?category=Men", label: "Men" },
  { to: "/selar_registrastion", label: "Sell on FlipOne" },
  { to: "/contact", label: "Contact" },
];

/**
 * Storefront footer. Only real destinations: no newsletter, no invented address/phone/policies.
 */
export default function StoreFooter({ className }) {
  const year = new Date().getFullYear();
  return (
    <footer className={cn("mt-auto border-t border-line-soft bg-surface", className)}>
      <Container className="flex flex-wrap items-center gap-x-10 gap-y-4 py-7">
        <Logo size="sm" />
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="rounded-xs text-[14px] font-medium text-ink decoration-[1.5px] underline-offset-[3px] hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="ml-auto inline-flex items-center gap-[7px] text-[13px] text-muted-foreground">
          <Banknote className="size-4" strokeWidth={1.75} aria-hidden="true" />
          Cash on delivery on every order
        </p>
      </Container>
      <div className="border-t border-line-soft">
        <Container className="py-3 text-[13px] text-muted-foreground">© {year} FlipOne</Container>
      </div>
    </footer>
  );
}
