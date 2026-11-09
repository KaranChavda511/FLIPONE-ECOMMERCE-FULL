import { Link } from "react-router-dom";
import { Container, EmptyState, PageHeader } from "@/components/flipone";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "../../../hooks/useAddToCart";
import { useLikes } from "../../../hooks/useLikes";
import { ProductGrid, ProductGridSkeleton } from "../../components/ProductGrid";
import { LoadError } from "../../components/StoreBits";

/** Saved (liked) products: GET /api/user/likes; the heart on each tag removes it. */
const SavedPage = () => {
  const addToCart = useAddToCart();
  const likes = useLikes();
  const { products, loading, error, reload } = likes;

  let body;
  if (loading) body = <ProductGridSkeleton count={6} />;
  else if (error) body = <LoadError title="Could not load saved products" message={error} onRetry={reload} />;
  else if (products.length === 0)
    body = (
      <EmptyState
        illustration="bag"
        title="Nothing saved yet"
        body="Tap the heart on any product to keep it here for later."
        action={
          <Button asChild>
            <Link to="/">Browse the shop</Link>
          </Button>
        }
      />
    );
  else body = <ProductGrid label="Saved products" products={products} onAdd={addToCart} likes={likes} />;

  return (
    <Container className="pt-5 pb-10">
      <PageHeader
        title="Saved"
        count={!loading && !error ? `${products.length} ${products.length === 1 ? "product" : "products"}` : undefined}
        className="mb-4"
      />
      {body}
    </Container>
  );
};

export default SavedPage;
