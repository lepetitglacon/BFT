import { useQuery } from "@tanstack/react-query"

// Clés de query pour les catégories
export const categoriesKeys = {
  all: ["categories"] as const,
}

// Liste des catégories disponibles
const defaultCategories = [
  "Alimentation",
  "Transport",
  "Loisirs",
  "Abonnements",
  "Autre",
]

// Hook pour récupérer les catégories
export function useCategories() {
  return useQuery({
    queryKey: categoriesKeys.all,
    queryFn: async (): Promise<string[]> => {
      // Pour l'instant, retourne une liste statique
      // Plus tard, ce sera un appel API
      return defaultCategories
    },
  })
}
