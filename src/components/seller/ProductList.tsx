import { Package, Edit, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductListProps {
  products: any[];
  loading: boolean;
  onEdit: (product: any) => void;
  onRefresh: () => void;
}

const ProductList = ({ products, loading, onEdit, onRefresh }: ProductListProps) => {
  const { toast } = useToast();

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      toast({ title: "Product deleted" });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Failed to delete", description: err.message, variant: "destructive" });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold mb-2">No Products Yet</h3>
        <p className="text-muted-foreground text-sm">
          Add your first product to start selling
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map(product => (
        <div key={product.id} className="bg-card rounded-xl p-3 border flex items-center gap-3">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
            <img 
              src={product.images?.[0] || '/placeholder.svg'} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm line-clamp-1">{product.title}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(product)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <p className="text-primary font-bold text-sm mt-1">
              {product.is_negotiable || product.price <= 0 ? 'Price Negotiable' : formatPrice(product.price)}
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                Qty: {product.quantity}
              </Badge>
              {product.is_negotiable && (
                <Badge className="text-xs bg-primary/10 text-primary">
                  Negotiable
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
