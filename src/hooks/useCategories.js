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

const RANDOM_IMAGES = [
  "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=1200&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80",
  "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80",
  "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&q=80",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80",
  "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=1200&q=80",
  "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1200&q=80"
];

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

  const getRandomImage = (projectId, size = 1200) => {
    if (!projectId) {
      return RANDOM_IMAGES[0].replace("w=1200", `w=${size}`);
    }
    // Simple deterministic hash of projectId
    let hash = 0;
    for (let i = 0; i < projectId.length; i++) {
      hash = projectId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % RANDOM_IMAGES.length;
    return RANDOM_IMAGES[index].replace("w=1200", `w=${size}`);
  };

  return {
    categories,
    isLoading,
    getCategoryLabel,
    getCategoryImage,
    getRandomImage,
  };
}
