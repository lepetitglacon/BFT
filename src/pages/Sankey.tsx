import { useMemo, useState } from "react"
import { useExpenses } from "../hooks/useExpenses"
import { SimpleSankeyChart } from "../components/SimpleSankeyChart"
import { PageLayout } from "../components/PageLayout"

export function Sankey() {
  const { data: expenses = [], isLoading } = useExpenses()

  // État pour le mois/année sélectionné (par défaut: mois actuel)
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())

  // Filtrer les transactions par mois sélectionné
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      const expenseMonth = expenseDate.getMonth()
      const expenseYear = expenseDate.getFullYear()

      // Inclure les transactions du mois sélectionné (ponctuelles ET récurrentes)
      return expenseMonth === selectedMonth && expenseYear === selectedYear
    })
  }, [expenses, selectedMonth, selectedYear])

  // Créer les liens pour le diagramme Sankey
  const sankeyLinks = useMemo(() => {
    const links: any[] = []

    // Séparer revenus et dépenses, triés par montant décroissant (TOUS les types, pas seulement récurrents)
    const incomes = filteredExpenses
      .filter((e) => e.type === "income")
      .sort((a, b) => b.amount - a.amount)
    const expensesOnly = filteredExpenses
      .filter((e) => e.type === "expense")
      .sort((a, b) => b.amount - a.amount)

    // Calculer le total des revenus
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)

    // Calculer les totaux par catégorie pour les dépenses
    const expenseCategoryTotals = new Map<string, number>()
    expensesOnly.forEach((expense) => {
      const current = expenseCategoryTotals.get(expense.category) || 0
      expenseCategoryTotals.set(expense.category, current + expense.amount)
    })

    // Trier les catégories par montant décroissant
    const sortedCategories = Array.from(expenseCategoryTotals.entries()).sort(
      (a, b) => b[1] - a[1]
    )

    // Liens : Revenus individuels -> Catégories de dépenses (distribué proportionnellement)
    incomes.forEach((income) => {
      sortedCategories.forEach(([category, categoryAmount]) => {
        if (totalIncome > 0) {
          // Chaque revenu contribue proportionnellement à chaque catégorie
          const proportion = categoryAmount / totalIncome
          links.push({
            source: `💰 ${income.description}`,
            target: category,
            value: income.amount * proportion,
          })
        }
      })
    })

    // Liens : Catégories -> Dépenses individuelles
    expensesOnly.forEach((expense) => {
      links.push({
        source: expense.category,
        target: `💸 ${expense.description}`,
        value: expense.amount,
      })
    })

    return links
  }, [filteredExpenses])

  if (isLoading) {
    return (
      <PageLayout
        title="Flux financier récurrent"
        description="Visualisez le flux de vos revenus et dépenses récurrents par catégorie"
      >
        <div className="text-muted-foreground">Chargement...</div>
      </PageLayout>
    )
  }

  // Calculer la hauteur dynamique basée sur le nombre de nœuds
  const nodeCount = useMemo(() => {
    const nodes = new Set<string>()
    sankeyLinks.forEach((link) => {
      nodes.add(link.source)
      nodes.add(link.target)
    })
    return nodes.size
  }, [sankeyLinks])

  // Hauteur minimale 600px, puis 50px par nœud au-delà de 10 nœuds
  const dynamicHeight = Math.max(600, 400 + nodeCount * 40)

  // Calculer les totaux mensuels
  const monthlyTotals = useMemo(() => {
    const totalIncome = filteredExpenses
      .filter((e) => e.type === "income")
      .reduce((sum, e) => sum + e.amount, 0)
    const totalExpenses = filteredExpenses
      .filter((e) => e.type === "expense")
      .reduce((sum, e) => sum + e.amount, 0)
    return {
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses,
    }
  }, [filteredExpenses])

  // Générer la liste des mois pour le sélecteur
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

  // Générer la liste des années disponibles (année actuelle +/- 2 ans)
  const years = Array.from(
    { length: 5 },
    (_, i) => currentDate.getFullYear() - 2 + i
  )

  return (
    <PageLayout
      title="Flux financier mensuel"
      description="Visualisez le flux de vos revenus et dépenses par mois"
    >
      <div className="space-y-6">
        {/* Sélecteur de mois/année */}
        <div className="flex gap-4 items-center">
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium">Mois :</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium">Année :</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Résumé mensuel */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Revenus</div>
            <div className="text-2xl font-bold text-green-600">
              {monthlyTotals.income.toFixed(2)} €
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Dépenses</div>
            <div className="text-2xl font-bold text-red-600">
              {monthlyTotals.expenses.toFixed(2)} €
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Solde</div>
            <div
              className={`text-2xl font-bold ${
                monthlyTotals.balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {monthlyTotals.balance >= 0 ? "+" : ""}
              {monthlyTotals.balance.toFixed(2)} €
            </div>
          </div>
        </div>

        {/* Diagramme Sankey */}
        {sankeyLinks.length > 0 ? (
          <div className="rounded-lg border border-border bg-card overflow-auto max-h-[800px]">
            <SimpleSankeyChart
              height={dynamicHeight}
              series={{
                data: {
                  links: sankeyLinks,
                },
              }}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
            Aucune transaction pour {months[selectedMonth]} {selectedYear}.
          </div>
        )}
      </div>
    </PageLayout>
  )
}
