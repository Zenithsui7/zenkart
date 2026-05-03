import { useListCategories } from "@workspace/api-client-react";
import { Link } from "wouter";

export default function Categories() {
  const { data, isLoading } = useListCategories();

  if (isLoading) return <div className="p-4">Loading categories...</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="font-heading font-bold text-2xl">All Categories</h1>
      <div className="grid grid-cols-2 gap-4">
        {data?.map(cat => (
          <Link key={cat.id} href={`/products?categoryId=${cat.id}`}>
            <div className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-xl hover-elevate cursor-pointer">
              {cat.imageUrl ? (
                <img src={cat.imageUrl} alt={cat.name} className="w-16 h-16 object-cover rounded-full" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl">
                  {cat.icon}
                </div>
              )}
              <span className="font-medium text-center">{cat.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
