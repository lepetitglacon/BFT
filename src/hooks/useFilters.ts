import { useQuery, useQueryClient } from "@tanstack/react-query"

export interface Filters {
  searchQuery: string
  categories: string[]
  recurring: boolean | null
  dateFrom: string
  dateTo: string
  amountMin: string
  amountMax: string
}

// Clés de query pour les filtres
export const filtersKeys = {
  all: ["filters"] as const,
}

const defaultFilters: Filters = {
  searchQuery: "",
  categories: [],
  recurring: null,
  dateFrom: "",
  dateTo: "",
  amountMin: "",
  amountMax: "",
}

// Hook pour récupérer les filtres
export function useFilters() {
  return useQuery({
    queryKey: filtersKeys.all,
    queryFn: async (): Promise<Filters> => {
      // Les filtres sont en mémoire, pas persistés
      return defaultFilters
    },
  })
}

// Hook pour modifier les filtres
export function useSetFilters() {
  const queryClient = useQueryClient()

  const setSearchQuery = (query: string) => {
    queryClient.setQueryData(filtersKeys.all, (old: Filters = defaultFilters) => ({
      ...old,
      searchQuery: query,
    }))
  }

  const toggleCategory = (category: string) => {
    queryClient.setQueryData(filtersKeys.all, (old: Filters = defaultFilters) => ({
      ...old,
      categories: old.categories.includes(category)
        ? old.categories.filter((c) => c !== category)
        : [...old.categories, category],
    }))
  }

  const setRecurring = (recurring: boolean | null) => {
    queryClient.setQueryData(filtersKeys.all, (old: Filters = defaultFilters) => ({
      ...old,
      recurring,
    }))
  }

  const setDateFrom = (date: string) => {
    queryClient.setQueryData(filtersKeys.all, (old: Filters = defaultFilters) => ({
      ...old,
      dateFrom: date,
    }))
  }

  const setDateTo = (date: string) => {
    queryClient.setQueryData(filtersKeys.all, (old: Filters = defaultFilters) => ({
      ...old,
      dateTo: date,
    }))
  }

  const setAmountMin = (amount: string) => {
    queryClient.setQueryData(filtersKeys.all, (old: Filters = defaultFilters) => ({
      ...old,
      amountMin: amount,
    }))
  }

  const setAmountMax = (amount: string) => {
    queryClient.setQueryData(filtersKeys.all, (old: Filters = defaultFilters) => ({
      ...old,
      amountMax: amount,
    }))
  }

  const clearFilters = () => {
    queryClient.setQueryData(filtersKeys.all, defaultFilters)
  }

  return {
    setSearchQuery,
    toggleCategory,
    setRecurring,
    setDateFrom,
    setDateTo,
    setAmountMin,
    setAmountMax,
    clearFilters,
  }
}

// Helper pour compter les filtres actifs
export function useActiveFiltersCount() {
  const { data: filters } = useFilters()

  if (!filters) return 0

  let count = 0
  if (filters.categories.length > 0) count++
  if (filters.recurring !== null) count++
  if (filters.dateFrom) count++
  if (filters.dateTo) count++
  if (filters.amountMin) count++
  if (filters.amountMax) count++
  return count
}
