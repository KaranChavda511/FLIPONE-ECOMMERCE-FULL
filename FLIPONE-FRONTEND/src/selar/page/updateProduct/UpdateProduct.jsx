import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Formik, Form } from "formik";
import { ArrowLeft, Loader2, Save, Upload } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, PortalShell, TagCard } from "@/components/flipone";
import apiClient, { apiErrorMessage } from "../../../config/apiClient";
import { useApiGet } from "../../../hooks/useApiGet";
import ImagePicker from "../../components/ImagePicker";
import { Panel, PanelError } from "../../components/Panel";
import ProductFields from "../../components/ProductFields";
import { categoryList, LOW_STOCK_AT, MAX_IMAGES, productFormData, productSchema } from "../../lib/seller";

const FORM_ID = "update-product-form";

const imagesFormData = (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  return formData;
};

const BackButton = () => (
  <Button asChild variant="ghost" size="sm">
    <Link to="/selar_Products">
      <ArrowLeft aria-hidden="true" />
      Back to products
    </Link>
  </Button>
);

const UpdateProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const sellerName = useSelector((state) => state.seller?.sellerInfo?.name);
  const productPath = `/api/seller/products/${encodeURIComponent(productId)}`;
  const { data, loading, error, reload, setData } = useApiGet(productPath);
  const categoriesReq = useApiGet("/api/product/categories");
  const categories = categoryList(categoriesReq.data);
  const product = data?.product;

  const [newImages, setNewImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const currentImages = useMemo(() => product?.images ?? [], [product]);

  const initialValues = useMemo(
    () => ({
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? "",
      stock: product?.stock ?? "",
      category: product?.category ?? "",
      subcategories: (product?.subcategories ?? []).map((s) => String(s).toLowerCase()),
    }),
    [product]
  );

  /** PATCH /api/seller/products/:id/images appends the files to the product's photos. */
  const uploadImages = async () => {
    const { data: res } = await apiClient.patch(`${productPath}/images`, imagesFormData(newImages));
    setData((prev) => (prev?.product ? { ...prev, product: { ...prev.product, images: res.images ?? prev.product.images } } : prev));
    setNewImages([]);
  };

  const handleUploadOnly = async () => {
    setUploading(true);
    try {
      await uploadImages();
      toast.success("Photos added");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to upload photos"));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await apiClient.patch(productPath, productFormData(values));
      if (newImages.length) await uploadImages();
      toast.success("Product updated successfully!");
      navigate("/selar_Products");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to update product"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || error || !product) {
    return (
      <PortalShell variant="seller" title="Edit product" actions={<BackButton />}>
        {loading ? (
          <div className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_minmax(340px,400px)]" aria-busy="true">
            <div className="grid gap-4 rounded-md border border-line-soft bg-surface p-5">
              <Skeleton className="h-11 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-11" />
                <Skeleton className="h-11" />
              </div>
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-9 w-2/3" />
              <Skeleton className="h-28 w-full" />
            </div>
            <div className="grid grid-cols-3 gap-2.5 rounded-md border border-line-soft bg-surface p-5">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="aspect-3/4" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="rounded-md border border-line-soft bg-surface">
            <PanelError title="Could not load this product" message={error} onRetry={reload} />
          </div>
        ) : (
          <EmptyState
            illustration="results"
            title="Product not found"
            body="It may have been removed, or it belongs to another seller."
            action={<BackButton />}
          />
        )}
      </PortalShell>
    );
  }

  return (
    <Formik initialValues={initialValues} enableReinitialize validationSchema={productSchema} onSubmit={handleSubmit}>
      {({ values, isSubmitting, dirty }) => {
        const busy = isSubmitting || uploading;
        const preview = {
          _id: product.productId,
          name: values.name || product.name,
          price: Number(values.price) || 0,
          stock: values.stock === "" ? undefined : Number(values.stock),
          images: currentImages,
          category: values.category,
          subcategories: values.subcategories,
          seller: sellerName ? { name: sellerName } : undefined,
        };

        return (
          <PortalShell
            variant="seller"
            title="Edit product"
            subtitle={product.name}
            actions={
              <>
                <BackButton />
                <Button type="submit" form={FORM_ID} disabled={busy}>
                  {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
                  {isSubmitting ? "Saving…" : "Save changes"}
                </Button>
              </>
            }
          >
            <div className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_minmax(340px,400px)]">
              <Panel
                title="Details"
                titleId="edit-details"
                action={dirty ? <span className="text-[13px] text-warning">Unsaved changes</span> : null}
              >
                <Form id={FORM_ID} noValidate className="p-5">
                  <ProductFields
                    categories={categories}
                    categoriesLoading={categoriesReq.loading}
                    categoriesError={categoriesReq.error}
                  />
                </Form>
              </Panel>

              <div className="grid min-w-0 gap-[18px]">
                <Panel title="Photos" titleId="edit-photos" count={`${currentImages.length} of ${MAX_IMAGES}`}>
                  <div className="grid gap-4 p-5">
                    <ImagePicker
                      label="Saved and new photos"
                      files={newImages}
                      onChange={setNewImages}
                      existing={currentImages}
                      max={MAX_IMAGES}
                      disabled={busy}
                    />
                    {newImages.length > 0 && (
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-line-mid pt-3.5">
                        <p className="text-[13px] text-muted-foreground">
                          New photos are added after the saved ones. Saved photos can&rsquo;t be removed here.
                        </p>
                        <Button variant="ink" size="sm" onClick={handleUploadOnly} disabled={busy}>
                          {uploading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Upload aria-hidden="true" />}
                          {uploading ? "Uploading…" : `Upload ${newImages.length} photo${newImages.length === 1 ? "" : "s"}`}
                        </Button>
                      </div>
                    )}
                  </div>
                </Panel>

                <Panel title="On the tag" titleId="edit-preview">
                  <div className="grid grid-cols-[200px_minmax(0,1fr)] items-start gap-4 p-5">
                    <TagCard product={preview} lowStockAt={LOW_STOCK_AT} style={{ "--tag-ground": "var(--fo-surface)" }} />
                    <p className="text-[13px] leading-relaxed text-muted-foreground">
                      How shoppers see this product in the grid. It follows your edits here; the shop shows them once you
                      save.
                    </p>
                  </div>
                </Panel>
              </div>
            </div>
          </PortalShell>
        );
      }}
    </Formik>
  );
};

export default UpdateProduct;
