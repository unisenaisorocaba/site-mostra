import { useQuery } from "@tanstack/react-query";
import { CategoryService } from "@/services";

const FALLBACK_IMAGES = {
  mecatronica: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=1200&q=80",
  software: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
  gestao: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
  logistica: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80",
  energia: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80",
  quimica: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&q=80",
  automacao: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80",
  outros: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80",
};

export function useCategories() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: CategoryService.listAll,
  });

  const getCategoryLabel = (code) => {
    const cat = categories.find((c) => c.code === code);
    return cat ? cat.name : code;
  };

  const getCategoryImage = (code, size = 1200) => {
    const cat = categories.find((c) => c.code === code);
    const url = cat?.image_url || FALLBACK_IMAGES[code] || FALLBACK_IMAGES.outros;
    return url.replace("w=1200", `w=${size}`);
  };

  return {
    categories,
    isLoading,
    getCategoryLabel,
    getCategoryImage,
  };
}
