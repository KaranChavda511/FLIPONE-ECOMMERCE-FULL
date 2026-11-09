import { Form, Formik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { ArrowRight, Package, Store } from "lucide-react";
import { toast } from "@/lib/toast";
import { Container, FormField, PageHeader } from "@/components/flipone";
import { Button } from "@/components/ui/button";
import { Panel } from "../../components/StoreBits";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number")
    .required("Mobile number is required"),
  message: Yup.string().required("Message is required"),
});

const SHORTCUTS = [
  {
    icon: Package,
    title: "About an order",
    text: "My orders shows each item's status from its seller, and you can cancel while an order is pending.",
    to: "/order-history",
    cta: "Open my orders",
  },
  {
    icon: Store,
    title: "Selling on FlipOne",
    text: "Open a seller account to list products with photos, keep your own stock and ship your orders.",
    to: "/selar_registrastion",
    cta: "Open a seller account",
  },
];

const Contact = () => {
  // There is no contact endpoint on the backend yet, so the form only confirms locally.
  const handleSubmit = (_values, { resetForm }) => {
    toast.success("Thanks! Your message has been received.");
    resetForm();
  };

  return (
    <Container className="pt-5 pb-10">
      <div className="mx-auto max-w-[1120px]">
        <PageHeader
          title="Contact FlipOne"
          subtitle="Questions about the shop, an order or selling here? Send us a message."
          className="mb-4"
        />
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(280px,360px)] items-start gap-7">
          <Panel title="Send a message">
            <Formik
              initialValues={{ name: "", email: "", mobile: "", message: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form noValidate className="grid grid-cols-2 gap-x-4 gap-y-3.5 px-[18px] pt-4 pb-[18px]">
                  <FormField name="name" label="Name" autoComplete="name" required className="col-span-full" />
                  <FormField name="email" label="Email" type="email" autoComplete="email" required />
                  <FormField
                    name="mobile"
                    label="Mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="tel-national"
                    required
                  />
                  <FormField
                    name="message"
                    label="Message"
                    as="textarea"
                    rows={6}
                    required
                    className="col-span-full"
                    placeholder="Tell us what you need help with"
                  />
                  <div className="col-span-full flex justify-end pt-1">
                    <Button type="submit" disabled={isSubmitting}>
                      Send message
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </Panel>

          <aside aria-label="Quicker answers" className="flex flex-col gap-3">
            <ul className="rounded-md border border-line-soft bg-surface">
              {SHORTCUTS.map(({ icon: Icon, title, text, to, cta }) => (
                <li key={title} className="flex gap-3 border-t border-line-soft px-4 py-3.5 first:border-t-0">
                  <Icon className="mt-0.5 size-5 shrink-0 text-ink-2" strokeWidth={1.75} aria-hidden="true" />
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-semibold">{title}</h2>
                    <p className="mt-0.5 text-[14px] leading-[1.45] text-muted-foreground">{text}</p>
                    <Link
                      to={to}
                      className="group/sc mt-2 inline-flex items-center gap-1 rounded-xs text-[14px] font-semibold text-ink hover:underline hover:decoration-[1.5px] hover:underline-offset-[3px]"
                    >
                      {cta}
                      <ArrowRight className="size-4 transition-transform duration-150 group-hover/sc:translate-x-0.5" aria-hidden="true" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </Container>
  );
};

export default Contact;
