import { useListProducts, ListProductsSortBy } from "@workspace/api-client-react";
import { useSearch } from "wouter";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";

export default function Products() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const categoryId = searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined;
  const isFlashSale = searchParams.get("isFlashSale") === "true";
  const isFeatured = searchParams.get("isFeatured") === "true";
  const initialSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(initialSearch);

  const { data, isLoading } = useListProducts({
    categoryId,
    search: search || undefined,
  });

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Search products..." 
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <h1 className="font-heading font-bold text-xl">
        Products {categoryId && `in Category ${categoryId}`}
      </h1>

      <div className="grid grid-cols-2 gap-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
        ) : data?.products.length ? (
          data.products.map(p => <ProductCard key={p.id} product={p} />)
        ) : (
          <div className="col-span-2 text-center py-10 text-muted-foreground">
            No products found.
          </div>
        )}
      </div>
    </div>
  );
}
