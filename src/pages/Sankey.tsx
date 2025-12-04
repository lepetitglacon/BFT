import { useMemo } from "react"
import { useExpenses } from "../hooks/useExpenses"
import { useSalary } from "../hooks/useSalary"
import { SimpleSankeyChart } from "../components/SimpleSankeyChart"
import { PageLayout } from "../components/PageLayout"

export function Sankey() {
  const { data: expenses = [], isLoading } = useExpenses()
  const { data: salaryData } = useSalary()
  const monthlySalary = salaryData?.monthlySalary ?? 0

  // Créer les liens pour le diagramme Sankey
  const sankeyLinks = useMemo(() => {
    const links = []

    // Séparer revenus et dépenses récurrents, triés par montant décroissant
    const incomes = expenses
      .filter((e) => e.type === "income" && e.recurring)
      .sort((a, b) => b.amount - a.amount)
    const expensesOnly = expenses
      .filter((e) => e.type === "expense" && e.recurring)
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
  }, [expenses])

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

  return (
    <PageLayout
      title="Flux financier récurrent"
      description="Visualisez le flux de vos revenus et dépenses récurrents par catégorie"
    >
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
          Aucune transaction récurrente à afficher. Marquez des revenus ou des
          dépenses comme récurrents pour voir le flux financier.
        </div>
      )}
    </PageLayout>
  )
}
