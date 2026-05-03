import { useState } from "react";
import { useCreateListing, CreateListingBodyCondition } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function NewListing() {
  const [, setLocation] = useLocation();
  const createMut = useCreateListing();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<CreateListingBodyCondition>(CreateListingBodyCondition.good);
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMut.mutate({
      data: {
        title,
        description,
        price: Number(price),
        condition,
        categoryId: 1, // Mock category ID
        city,
        state: stateName,
        isNegotiable,
        images: ["https://placehold.co/600x400?text=Mock+Image"]
      }
    }, {
      onSuccess: (listing) => {
        toast.success("Listing created!");
        setLocation(`/listings/${listing.id}`);
      },
      onError: () => toast.error("Failed to create listing")
    });
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <h1 className="font-heading font-bold text-2xl">Sell an Item</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo Upload Mock */}
        <div className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
          <Camera className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Add Photos</span>
        </div>

        <div className="space-y-2">
          <Label>Ad Title</Label>
          <Input placeholder="What are you selling?" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label>Price (₹)</Label>
          <Input type="number" placeholder="Enter price" value={price} onChange={e => setPrice(e.target.value)} required />
        </div>

        <div className="flex items-center justify-between p-3 border border-border rounded-xl">
          <div className="space-y-0.5">
            <Label>Negotiable</Label>
            <div className="text-xs text-muted-foreground">Are you willing to negotiate?</div>
          </div>
          <Switch checked={isNegotiable} onCheckedChange={setIsNegotiable} />
        </div>

        <div className="space-y-2">
          <Label>Condition</Label>
          <Select value={condition} onValueChange={(v: CreateListingBodyCondition) => setCondition(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="like_new">Like New</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea 
            placeholder="Describe what you are selling..." 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            rows={4}
            required 
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>City</Label>
            <Input placeholder="City" value={city} onChange={e => setCity(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Input placeholder="State" value={stateName} onChange={e => setStateName(e.target.value)} required />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-lg mt-4" disabled={createMut.isPending}>
          {createMut.isPending ? "Posting..." : "Post Ad"}
        </Button>
      </form>
    </div>
  );
}
