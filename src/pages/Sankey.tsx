import { useExpenses, useSetExpenses } from "../hooks/useExpenses"
import { SimpleSankeyChart } from "../components/SimpleSankeyChart"
import { PageLayout } from "../components/PageLayout"

export function Sankey() {
  const { data: expenses = [], isLoading } = useExpenses()
  const { addExpense, updateExpense, deleteExpense, setExpenses } =
    useSetExpenses()

  return (
    <PageLayout
      title="Mes dépenses"
      description="Gérez et suivez toutes vos dépenses"
    >
      <SimpleSankeyChart
        height={250}
        series={{
          data: {
            links: [
              { source: "A", target: "B", value: 10 },
              { source: "A", target: "C", value: 5 },
              { source: "B", target: "D", value: 8 },
              { source: "C", target: "D", value: 3 },
            ],
          },
        }}
      />
    </PageLayout>
  )
}
