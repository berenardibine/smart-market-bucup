import { useState } from "react";
import { 
  Building2, Wheat, Wrench, ShoppingBag, Smartphone, 
  Blocks, UtensilsCrossed, Heart, BookOpen, Briefcase, Car, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const mainCategories = [
  { slug: 'all', name: 'All', icon: Filter },
  { slug: 'asset', name: 'Asset', icon: Building2 },
  { slug: 'agriculture', name: 'Agriculture', icon: Wheat },
  { slug: 'rent', name: 'Rent', icon: Wrench },
  { slug: 'general', name: 'General', icon: ShoppingBag },
  { slug: 'electronics-gadgets', name: 'Electronics', icon: Smartphone },
  { slug: 'building', name: 'Building', icon: Blocks },
  { slug: 'food', name: 'Food', icon: UtensilsCrossed },
  { slug: 'health', name: 'Health', icon: Heart },
  { slug: 'education', name: 'Education', icon: BookOpen },
  { slug: 'services', name: 'Services', icon: Briefcase },
  { slug: 'transport', name: 'Transport', icon: Car },
];

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
      {mainCategories.map((category) => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.slug;
        
        return (
          <button
            key={category.slug}
            onClick={() => onCategoryChange(category.slug)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full shrink-0 transition-all duration-200",
              "border text-sm font-medium",
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-orange"
                : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{category.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
