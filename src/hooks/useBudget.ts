import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface Budget {
  month: string; // Format: "YYYY-MM"
  amount: number;
  categories: {
    name: string;
    budget: number;
  }[];
}

// Clés de query pour le budget
export const budgetKeys = {
  all: ["budget"] as const,
  byMonth: (month: string) => [...budgetKeys.all, month] as const,
};

// Hook pour récupérer le budget d'un mois
export function useBudget(month: string) {
  return useQuery({
    queryKey: budgetKeys.byMonth(month),
    queryFn: async (): Promise<Budget> => {
      // Pour l'instant, retourne des données statiques
      // Plus tard, ce sera un appel API
      return {
        month,
        amount: 2000,
        categories: [
          { name: "Alimentation", budget: 400 },
          { name: "Transport", budget: 200 },
          { name: "Loisirs", budget: 300 },
          { name: "Abonnements", budget: 150 },
          { name: "Autre", budget: 950 },
        ],
      };
    },
  });
}

// Hook pour modifier le budget manuellement
export function useSetBudget() {
  const queryClient = useQueryClient();

  const setBudget = (month: string, budget: Budget) => {
    queryClient.setQueryData(budgetKeys.byMonth(month), budget);
  };

  const updateBudgetAmount = (month: string, amount: number) => {
    queryClient.setQueryData(
      budgetKeys.byMonth(month),
      (old: Budget | undefined) => {
        if (!old) return old;
        return { ...old, amount };
      }
    );
  };

  const updateCategoryBudget = (
    month: string,
    categoryName: string,
    budget: number
  ) => {
    queryClient.setQueryData(
      budgetKeys.byMonth(month),
      (old: Budget | undefined) => {
        if (!old) return old;
        return {
          ...old,
          categories: old.categories.map((cat) =>
            cat.name === categoryName ? { ...cat, budget } : cat
          ),
        };
      }
    );
  };

  return {
    setBudget,
    updateBudgetAmount,
    updateCategoryBudget,
  };
}
