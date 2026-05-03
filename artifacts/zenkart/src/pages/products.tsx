import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { useSearch, useLocation, Link } from "wouter";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, SlidersHorizontal, ChevronRight, X, Star, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest First" },
];

const BRANDS = ["Samsung", "Apple", "OnePlus", "Xiaomi", "Nike", "Adidas", "Puma", "Lakme", "Nykaa", "Titan"];
const DISCOUNT_RANGES = [
  { label: "10% and above", min: 10 },
  { label: "25% and above", min: 25 },
  { label: "50% and above", min: 50 },
  { label: "70% and above", min: 70 },
];

export default function Products() {
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(searchString);

  const categoryId = searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined;
  const initialSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState("relevance");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [minDiscount, setMinDiscount] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  const { data, isLoading } = useListProducts({
    categoryId,
    search: search || undefined,
    sortBy: sortBy !== "relevance" ? sortBy as any : undefined,
  });

  const { data: categories } = useListCategories();
  const activeCategory = categories?.find(c => c.id === categoryId);

  // Frontend filtering (brand, price, rating, discount)
  const filteredProducts = data?.products.filter(p => {
    if (selectedBrands.length > 0 && !selectedBrands.some(b => p.brand?.toLowerCase().includes(b.toLowerCase()))) return false;
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
    if (p.rating < minRating) return false;
    if (minDiscount > 0 && p.discountPercent < minDiscount) return false;
    return true;
  });

  const activeFilterCount = selectedBrands.length + (minRating > 0 ? 1 : 0) + (minDiscount > 0 ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 100000 ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setMinRating(0);
    setMinDiscount(0);
    setPriceRange([0, 100000]);
    setSortBy("relevance");
    setSearch("");
    setLocation("/products");
  };

  const FilterSidebar = () => (
    <div className="space-y-6 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-base">Filters</h3>
        {activeFilterCount > 0 && (
          <button onClick={clearAllFilters} className="text-xs font-semibold text-primary hover:underline">
            Clear All ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-semibold text-xs mb-3 text-muted-foreground uppercase tracking-wide">Category</h4>
        <div className="space-y-0.5">
          <button onClick={() => setLocation("/products")}
            className={cn("w-full text-left text-sm px-3 py-2 rounded-lg transition-colors",
              !categoryId ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted")}>
            All Categories
          </button>
          {categories?.map(cat => (
            <button key={cat.id} onClick={() => setLocation(`/products?categoryId=${cat.id}`)}
              className={cn("w-full text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center justify-between group",
                categoryId === cat.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted")}>
              <span className="flex items-center gap-2"><span>{cat.icon}</span>{cat.name}</span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-xs mb-3 text-muted-foreground uppercase tracking-wide">Price Range</h4>
        <div className="px-2 space-y-3">
          <Slider
            min={0} max={100000} step={500}
            value={priceRange}
            onValueChange={(v) => setPriceRange(v as [number, number])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₹{priceRange[0].toLocaleString("en-IN")}</span>
            <span>₹{priceRange[1].toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Brand */}
      <div>
        <h4 className="font-semibold text-xs mb-3 text-muted-foreground uppercase tracking-wide">Brand</h4>
        <div className="space-y-1.5">
          {(showAllBrands ? BRANDS : BRANDS.slice(0, 5)).map(brand => (
            <label key={brand} className="flex items-center gap-2.5 cursor-pointer hover:text-foreground">
              <input type="checkbox" checked={selectedBrands.includes(brand)}
                onChange={e => setSelectedBrands(prev => e.target.checked ? [...prev, brand] : prev.filter(b => b !== brand))}
                className="w-4 h-4 rounded accent-primary" />
              <span className="text-sm">{brand}</span>
            </label>
          ))}
          <button onClick={() => setShowAllBrands(v => !v)} className="text-xs text-primary font-medium hover:underline flex items-center gap-1 mt-1">
            {showAllBrands ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> +{BRANDS.length - 5} more brands</>}
          </button>
        </div>
      </div>

      {/* Customer Rating */}
      <div>
        <h4 className="font-semibold text-xs mb-3 text-muted-foreground uppercase tracking-wide">Customer Rating</h4>
        <div className="space-y-1.5">
          {[4, 3, 2, 1].map(r => (
            <button key={r} onClick={() => setMinRating(minRating === r ? 0 : r)}
              className={cn("w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                minRating === r ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted")}>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("w-3.5 h-3.5", i < r ? "fill-yellow-400 text-yellow-400" : "text-muted fill-muted")} />
                ))}
              </div>
              <span>& above</span>
            </button>
          ))}
        </div>
      </div>

      {/* Discount */}
      <div>
        <h4 className="font-semibold text-xs mb-3 text-muted-foreground uppercase tracking-wide">Discount</h4>
        <div className="space-y-1.5">
          {DISCOUNT_RANGES.map(({ label, min }) => (
            <button key={min} onClick={() => setMinDiscount(minDiscount === min ? 0 : min)}
              className={cn("w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors",
                minDiscount === min ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted")}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort — in sidebar on desktop */}
      <div>
        <h4 className="font-semibold text-xs mb-3 text-muted-foreground uppercase tracking-wide">Sort By</h4>
        <div className="space-y-0.5">
          {SORT_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setSortBy(opt.value)}
              className={cn("w-full text-left text-sm px-3 py-2 rounded-lg transition-colors",
                sortBy === opt.value ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted")}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop */}
      <aside className="w-64 shrink-0 border-r border-border bg-card hidden md:block sticky top-[88px] h-[calc(100vh-88px)] overflow-y-auto">
        <FilterSidebar />
      </aside>

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-background overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background z-10">
              <span className="font-bold">Filters</span>
              <button onClick={() => setShowMobileFilters(false)}><X className="w-5 h-5" /></button>
            </div>
            <FilterSidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="p-4 md:p-5 space-y-4">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Link href="/" className="hover:text-foreground">Home</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-medium">{activeCategory ? activeCategory.name : "All Products"}</span>
              </div>
              <h1 className="font-heading font-bold text-xl md:text-2xl">
                {activeCategory ? activeCategory.name : "All Products"}
                {filteredProducts && <span className="text-muted-foreground text-base font-normal ml-2">({filteredProducts.length} results)</span>}
              </h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowMobileFilters(true)} className="md:hidden self-start">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search within results..." className="pl-9"
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile sort pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
            {SORT_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setSortBy(opt.value)}
                className={cn("text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors shrink-0",
                  sortBy === opt.value ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted")}>
                {opt.label}
              </button>
            ))}
          </div>

          {/* Active filter badges */}
          {(categoryId || search || selectedBrands.length > 0 || minRating > 0 || minDiscount > 0) && (
            <div className="flex flex-wrap gap-2">
              {activeCategory && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {activeCategory.name}
                  <button onClick={() => setLocation("/products")} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
                </Badge>
              )}
              {search && <Badge variant="secondary" className="flex items-center gap-1">"{search}" <button onClick={() => setSearch("")}><X className="w-3 h-3" /></button></Badge>}
              {selectedBrands.map(b => (
                <Badge key={b} variant="secondary" className="flex items-center gap-1">{b} <button onClick={() => setSelectedBrands(p => p.filter(x => x !== b))}><X className="w-3 h-3" /></button></Badge>
              ))}
              {minRating > 0 && <Badge variant="secondary" className="flex items-center gap-1">{minRating}+ Stars <button onClick={() => setMinRating(0)}><X className="w-3 h-3" /></button></Badge>}
              {minDiscount > 0 && <Badge variant="secondary" className="flex items-center gap-1">{minDiscount}%+ Off <button onClick={() => setMinDiscount(0)}><X className="w-3 h-3" /></button></Badge>}
            </div>
          )}

          {/* Product grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : filteredProducts?.length ? (
              filteredProducts.map(p => <ProductCard key={p.id} product={p} />)
            ) : (
              <div className="col-span-full text-center py-16 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm mt-1">Try adjusting your filters or search term</p>
                <Button variant="outline" className="mt-4" onClick={clearAllFilters}>Clear all filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
