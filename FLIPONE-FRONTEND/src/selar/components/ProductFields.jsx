import { useFormikContext } from "formik";
import { FormField, FormSelectField } from "@/components/flipone";
import { categoryOptions, subcategoriesOf } from "../lib/seller";
import SubcategoryField from "./SubcategoryField";

/**
 * The product fields shared by "Add product" and "Edit product" (must sit inside <Formik>):
 * name, category, subcategories (from the chosen category), MRP, stock, description.
 * Changing the category clears the subcategories, since they belong to the old one.
 */
export default function ProductFields({ categories, categoriesLoading = false, categoriesError }) {
  const { values, setFieldValue } = useFormikContext();
  const options = categoryOptions(categories);
  // Keep a category the product already has selectable even if the list failed to load.
  if (values.category && !options.some((o) => o.value === values.category)) {
    options.unshift({ value: values.category, label: values.category });
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
      <FormField name="name" label="Product name" required autoComplete="off" className="col-span-full" />
      <FormField name="price" label="MRP (₹)" required type="number" inputMode="decimal" min="0" step="0.01" />
      <FormField name="stock" label="Stock" required type="number" inputMode="numeric" min="0" step="1" hint="Units you can ship now" />
      <FormSelectField
        name="category"
        label="Category"
        required
        options={options}
        placeholder={categoriesLoading ? "Loading categories…" : "Select a category"}
        disabled={categoriesLoading && options.length === 0}
        hint={categoriesError ? "Could not load categories. Reload the page to try again." : undefined}
        onValueChange={() => setFieldValue("subcategories", [])}
        className="col-span-full"
      />
      <SubcategoryField options={subcategoriesOf(categories, values.category)} category={values.category} className="col-span-full" />
      <FormField
        name="description"
        label="Description"
        required
        as="textarea"
        rows={4}
        hint="Fabric, fit, size and care: what a shopper needs before buying."
        className="col-span-full"
      />
    </div>
  );
}
