import { useMemo, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, RefreshCw, Wallet } from "lucide-react"
import { useExpenses } from "../hooks/useExpenses"
import { useSalary, useSetSalary } from "../hooks/useSalary"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"

export function Budget() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { data: expenses = [] } = useExpenses()
  const { data: salaryData } = useSalary()
  const { setMonthlySalary } = useSetSalary()
  const [salaryInput, setSalaryInput] = useState("")

  const monthlySalary = salaryData?.monthlySalary ?? 0

  useEffect(() => {
    setSalaryInput(monthlySalary.toString())
  }, [monthlySalary])

  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ]

  const goToPreviousMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1)
    )
  }

  const goToNextMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1)
    )
  }

  const currentMonth = months[selectedDate.getMonth()]
  const currentYear = selectedDate.getFullYear()

  // Filtrer les dépenses récurrentes
  const recurringExpenses = useMemo(() => {
    return expenses.filter((expense) => expense.recurring)
  }, [expenses])

  // Calculer le total des dépenses récurrentes
  const totalRecurring = useMemo(() => {
    return recurringExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  }, [recurringExpenses])

  // Calculer l'argent cumulé mensuel (salaire - récurrentes)
  const monthlyCumulative = useMemo(() => {
    return monthlySalary - totalRecurring
  }, [monthlySalary, totalRecurring])

  // Calculer le nombre de mois entre aujourd'hui et le mois sélectionné
  const monthsDifference = useMemo(() => {
    const today = new Date()
    const todayMonthIndex = today.getFullYear() * 12 + today.getMonth()
    const selectedMonthIndex =
      selectedDate.getFullYear() * 12 + selectedDate.getMonth()
    return selectedMonthIndex - todayMonthIndex
  }, [selectedDate])

  // Calculer le cumulatif total pour le mois sélectionné
  const cumulativeTotal = useMemo(() => {
    if (monthsDifference < 0) {
      // Mois passé : on ne calcule pas le prévisionnel
      return 0
    }
    // Mois actuel ou futur : cumul depuis aujourd'hui
    return monthlyCumulative * (monthsDifference + 1)
  }, [monthlyCumulative, monthsDifference])

  // Générer les 6 prochains mois pour l'affichage
  const futureMonths = useMemo(() => {
    const result = []
    const today = new Date()
    for (let i = 0; i <= 2; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1)
      result.push({
        month: months[date.getMonth()],
        year: date.getFullYear(),
        cumulative: monthlyCumulative * (i + 1),
      })
    }
    return result
  }, [monthlyCumulative, months])

  const handleSalaryChange = (value: string) => {
    setSalaryInput(value)
    const salary = parseFloat(value) || 0
    setMonthlySalary(salary)
  }

  return (
    <div className="space-y-8">
      {/* Header avec input salaire */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-4xl font-bold tracking-tight text-center">
            Prévisions budgétaires
          </h1>
        </div>
        <div className="w-64">
          <Label
            htmlFor="salary"
            className="text-sm font-medium mb-2 flex items-center gap-2"
          >
            <Wallet className="h-4 w-4" />
            Salaire mensuel
          </Label>
          <div className="relative">
            <Input
              id="salary"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={salaryInput}
              onChange={(e) => handleSalaryChange(e.target.value)}
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              €
            </span>
          </div>
        </div>
      </div>

      {/* Sélecteur de mois centré */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={goToPreviousMonth}
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="min-w-[200px] text-center">
          <p className="text-2xl font-bold">
            {currentMonth} {currentYear}
          </p>
        </div>
        <button
          onClick={goToNextMonth}
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Mois suivant"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Argent cumulé pour le mois sélectionné */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {monthsDifference < 0
              ? "Mois passé"
              : monthsDifference === 0
                ? "Argent cumulé ce mois"
                : `Argent cumulé prévisionnel (${monthsDifference + 1} mois)`}
          </p>
          <p
            className={`text-6xl font-bold ${
              cumulativeTotal >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {cumulativeTotal >= 0 ? "+" : ""}
            {cumulativeTotal.toFixed(2)}€
          </p>
          <p className="text-xs text-muted-foreground">
            ({monthlySalary.toFixed(2)}€ - {totalRecurring.toFixed(2)}€) ×{" "}
            {monthsDifference >= 0 ? monthsDifference + 1 : 0} mois
          </p>
        </div>
      </div>

      {/* Prévisions sur 6 mois */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-2xl font-semibold mb-6">Prévisions sur 3 mois</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {futureMonths.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
            >
              <p className="text-sm text-muted-foreground mb-1">
                {item.month} {item.year}
              </p>
              <p
                className={`text-2xl font-bold ${
                  item.cumulative >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {item.cumulative >= 0 ? "+" : ""}
                {item.cumulative.toFixed(2)}€
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {index + 1} mois
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Liste des dépenses récurrentes */}
      <div className="rounded-lg border border-border bg-card">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Dépenses récurrentes</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-5 w-5" />
              <span className="font-semibold text-lg">
                {totalRecurring.toFixed(2)}€/mois
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                  Description
                </th>
                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                  Catégorie
                </th>
                <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">
                  Montant
                </th>
              </tr>
            </thead>
            <tbody>
              {recurringExpenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="p-8 text-center text-muted-foreground"
                  >
                    Aucune dépense récurrente pour le moment
                  </td>
                </tr>
              ) : (
                recurringExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="p-6 align-middle">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">
                          {expense.description}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 align-middle">
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-6 align-middle text-right">
                      <span className="text-lg font-semibold text-red-500">
                        -{expense.amount.toFixed(2)}€
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {recurringExpenses.length > 0 && (
          <div className="p-6 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Total mensuel
              </span>
              <span className="text-xl font-bold text-red-500">
                -{totalRecurring.toFixed(2)}€
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
