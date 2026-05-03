import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { useSearch, useLocation, Link } from "wouter";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, SlidersHorizontal, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest First" },
];

export default function Products() {
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(searchString);

  const categoryId = searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined;
  const initialSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useListProducts({
    categoryId,
    search: search || undefined,
    sortBy: sortBy !== "relevance" ? sortBy as any : undefined,
  });

  const { data: categories } = useListCategories();

  const activeCategory = categories?.find(c => c.id === categoryId);

  return (
    <div className="flex min-h-screen">

      {/* Sidebar filters — desktop */}
      <aside className={cn(
        "w-64 shrink-0 border-r border-border bg-card hidden md:block sticky top-[88px] h-[calc(100vh-88px)] overflow-y-auto",
      )}>
        <div className="p-5 space-y-6">
          <h3 className="font-heading font-bold text-base">Filters</h3>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">Category</h4>
            <div className="space-y-1">
              <button
                onClick={() => setLocation("/products")}
                className={cn("w-full text-left text-sm px-3 py-2 rounded-lg transition-colors",
                  !categoryId ? "bg-secondary/20 text-secondary font-semibold" : "hover:bg-muted")}
              >
                All Categories
              </button>
              {categories?.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setLocation(`/products?categoryId=${cat.id}`)}
                  className={cn("w-full text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center justify-between group",
                    categoryId === cat.id ? "bg-secondary/20 text-secondary font-semibold" : "hover:bg-muted")}
                >
                  <span className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    {cat.name}
                  </span>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">Sort By</h4>
            <div className="space-y-1">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={cn("w-full text-left text-sm px-3 py-2 rounded-lg transition-colors",
                    sortBy === opt.value ? "bg-secondary/20 text-secondary font-semibold" : "hover:bg-muted")}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="p-4 md:p-6 space-y-5">

          {/* Breadcrumb + Title */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground font-medium">
                {activeCategory ? activeCategory.name : "All Products"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="font-heading font-bold text-2xl flex-1">
                {activeCategory ? activeCategory.name : "All Products"}
                {data && <span className="text-muted-foreground text-base font-normal ml-2">({data.total} results)</span>}
              </h1>

              {/* Mobile filter toggle */}
              <Button variant="outline" size="sm" onClick={() => setShowFilters(v => !v)} className="md:hidden">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>

              {/* Sort — mobile/tablet */}
              <div className="md:hidden flex gap-2 flex-wrap">
                {SORT_OPTIONS.slice(0, 4).map(opt => (
                  <button key={opt.value} onClick={() => setSortBy(opt.value)}
                    className={cn("text-xs px-3 py-1.5 rounded-full border transition-colors",
                      sortBy === opt.value ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted")}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search within results..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Active filters */}
          {(categoryId || search) && (
            <div className="flex flex-wrap gap-2">
              {activeCategory && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {activeCategory.name}
                  <button onClick={() => setLocation("/products")} className="ml-1 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  "{search}"
                  <button onClick={() => setSearch("")} className="ml-1 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Product grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : data?.products.length ? (
              data.products.map(p => <ProductCard key={p.id} product={p} />)
            ) : (
              <div className="col-span-full text-center py-16 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm mt-1">Try a different search or category</p>
                <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setLocation("/products"); }}>
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
