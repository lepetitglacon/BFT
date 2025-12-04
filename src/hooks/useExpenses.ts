import { useQuery, useQueryClient } from "@tanstack/react-query"

export interface Expense {
  id: number
  category: string
  description: string
  amount: number
  date: string
  recurring: boolean
  type: "expense" | "income"
}

// Clé de query pour les dépenses
export const expensesKeys = {
  all: ["expenses"] as const,
  list: () => [...expensesKeys.all, "list"] as const,
  detail: (id: number) => [...expensesKeys.all, "detail", id] as const,
}

// Hook pour récupérer toutes les dépenses
export function useExpenses() {
  return useQuery({
    queryKey: expensesKeys.list(),
    queryFn: async (): Promise<Expense[]> => {
      // Pour l'instant, retourne des données statiques
      // Plus tard, ce sera un appel API
      return (
        getFromLocalStorage() ?? [
          {
            id: 1,
            category: "Alimentation",
            description: "Courses Carrefour",
            amount: 45.5,
            date: "2025-11-30",
            recurring: false,
            type: "expense" as const,
          },
          {
            id: 2,
            category: "Loisirs",
            description: "Cinéma",
            amount: 24.0,
            date: "2025-11-29",
            recurring: false,
            type: "expense" as const,
          },
          {
            id: 3,
            category: "Transport",
            description: "Essence",
            amount: 65.0,
            date: "2025-11-28",
            recurring: false,
            type: "expense" as const,
          },
          {
            id: 4,
            category: "Abonnements",
            description: "Netflix",
            amount: 13.99,
            date: "2025-11-27",
            recurring: true,
            type: "expense" as const,
          },
        ]
      )
    },
  })
}

// Hook pour initialiser/modifier les données manuellement
export function useSetExpenses() {
  const queryClient = useQueryClient()

  const setExpenses = (expenses: Expense[]) => {
    queryClient.setQueryData(expensesKeys.list(), expenses)
    saveToLocalStorage(expenses)
  }

  const addExpense = (expense: Expense) => {
    queryClient.setQueryData(expensesKeys.list(), (old: Expense[] = []) => {
      const e = [...old, expense]
      saveToLocalStorage(e)
      return e
    })
  }

  const updateExpense = (id: number, updates: Partial<Expense>) => {
    queryClient.setQueryData(expensesKeys.list(), (old: Expense[] = []) => {
      const e = old.map((expense) =>
        expense.id === id ? { ...expense, ...updates } : expense
      )
      saveToLocalStorage(e)
      return e
    })
  }

  const deleteExpense = (id: number) => {
    queryClient.setQueryData(expensesKeys.list(), (old: Expense[] = []) => {
      const e = old.filter((expense) => expense.id !== id)
      saveToLocalStorage(e)
      return e
    })
  }

  return {
    setExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  }
}

export const saveToLocalStorage = (expenses: Expense[]) => {
  localStorage.setItem("expenses", JSON.stringify(expenses))
}

export const getFromLocalStorage = (): Expense[] | null => {
  const data = localStorage.getItem("expenses")
  return data ? JSON.parse(data) : null
}
