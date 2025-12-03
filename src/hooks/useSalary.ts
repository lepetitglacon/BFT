import { useQuery, useQueryClient } from "@tanstack/react-query"

export interface Salary {
  monthlySalary: number
}

// Clés de query pour le salaire
export const salaryKeys = {
  all: ["salary"] as const,
}

// Helper pour localStorage
const saveToLocalStorage = (salary: Salary) => {
  localStorage.setItem("salary-storage", JSON.stringify({ state: salary }))
}

const getFromLocalStorage = (): Salary => {
  const data = localStorage.getItem("salary-storage")
  if (data) {
    const parsed = JSON.parse(data)
    return parsed.state || { monthlySalary: 0 }
  }
  return { monthlySalary: 0 }
}

// Hook pour récupérer le salaire
export function useSalary() {
  return useQuery({
    queryKey: salaryKeys.all,
    queryFn: async (): Promise<Salary> => {
      // Pour l'instant, retourne les données du localStorage
      // Plus tard, ce sera un appel API
      return getFromLocalStorage()
    },
  })
}

// Hook pour modifier le salaire
export function useSetSalary() {
  const queryClient = useQueryClient()

  const setMonthlySalary = (salary: number) => {
    const newData = { monthlySalary: salary }
    queryClient.setQueryData(salaryKeys.all, newData)
    saveToLocalStorage(newData)
  }

  return {
    setMonthlySalary,
  }
}
