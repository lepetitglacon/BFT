import type { Expense } from "../hooks/useExpenses"

/**
 * Génère des dépenses récurrentes sur une période donnée
 * @param baseExpense La dépense de base à répéter
 * @param startDate Date de début de la génération
 * @param endDate Date de fin de la génération
 * @param frequency Fréquence de récurrence (monthly, weekly, yearly)
 * @returns Un tableau de dépenses générées
 */
export function generateRecurringExpenses(
  baseExpense: Expense,
  startDate: Date,
  endDate: Date,
  frequency: "monthly" | "weekly" | "yearly"
): Expense[] {
  const generatedExpenses: Expense[] = []
  let currentDate = new Date(startDate)
  let idCounter = baseExpense.id + 1

  while (currentDate <= endDate) {
    // Créer une copie de la dépense pour cette date
    const newExpense: Expense = {
      ...baseExpense,
      id: idCounter++,
      date: formatDate(currentDate),
      isGenerated: true,
      parentId: baseExpense.id,
    }

    generatedExpenses.push(newExpense)

    // Calculer la prochaine date selon la fréquence
    currentDate = getNextDate(currentDate, frequency)
  }

  return generatedExpenses
}

/**
 * Calcule la prochaine date selon la fréquence
 */
function getNextDate(
  currentDate: Date,
  frequency: "monthly" | "weekly" | "yearly"
): Date {
  const nextDate = new Date(currentDate)

  switch (frequency) {
    case "weekly":
      nextDate.setDate(nextDate.getDate() + 7)
      break
    case "monthly":
      nextDate.setMonth(nextDate.getMonth() + 1)
      break
    case "yearly":
      nextDate.setFullYear(nextDate.getFullYear() + 1)
      break
  }

  return nextDate
}

/**
 * Formate une date en string YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Calcule le prochain ID disponible pour une nouvelle dépense
 */
export function getNextExpenseId(expenses: Expense[]): number {
  if (expenses.length === 0) return 1
  return Math.max(...expenses.map((e) => e.id)) + 1
}
