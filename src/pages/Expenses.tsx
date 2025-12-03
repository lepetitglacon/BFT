import { useMemo, useState } from "react"
import {
  Filter,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import type { Expense } from "../hooks/useExpenses"
import { useExpenses, useSetExpenses } from "../hooks/useExpenses"
import { useFilters, useSetFilters, useActiveFiltersCount } from "../hooks/useFilters"
import { ExpenseModal } from "../components/ExpenseModal"
import { CsvImportModal } from "../components/CsvImportModal"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover"
import { Label } from "../components/ui/label"
import { PageLayout } from "../components/PageLayout"

export function Expenses() {
  const { data: expenses = [], isLoading } = useExpenses()
  const { addExpense, updateExpense, deleteExpense, setExpenses } = useSetExpenses()
  const { data: filters } = useFilters()
  const {
    setSearchQuery,
    toggleCategory,
    setRecurring,
    setDateFrom,
    setDateTo,
    setAmountMin,
    setAmountMax,
    clearFilters,
  } = useSetFilters()
  const activeFiltersCount = useActiveFiltersCount()

  const searchQuery = filters?.searchQuery ?? ""
  const filterCategories = filters?.categories ?? []
  const filterRecurring = filters?.recurring ?? null
  const dateFrom = filters?.dateFrom ?? ""
  const dateTo = filters?.dateTo ?? ""
  const amountMin = filters?.amountMin ?? ""
  const amountMax = filters?.amountMax ?? ""

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkCategory, setBulkCategory] = useState("")

  const handleOpenModal = (expense?: Expense) => {
    setSelectedExpense(expense || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedExpense(null)
  }

  const handleSaveExpense = (expense: Expense) => {
    if (selectedExpense) {
      updateExpense(expense.id, expense)
    } else {
      addExpense(expense)
    }
  }

  const handleDeleteExpense = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) {
      deleteExpense(id)
    }
  }

  const handleImportCsv = (importedExpenses: Expense[]) => {
    const allExpenses = [...expenses, ...importedExpenses]
    setExpenses(allExpenses)
  }

  const toggleSelection = (id: number) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(expenses.map((e) => e.category)))
  }, [expenses])

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      // Recherche textuelle
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !expense.description.toLowerCase().includes(query) &&
          !expense.category.toLowerCase().includes(query)
        ) {
          return false
        }
      }

      // Filtre par catégories
      if (
        filterCategories.length > 0 &&
        !filterCategories.includes(expense.category)
      ) {
        return false
      }

      // Filtre récurrence
      if (filterRecurring !== null && expense.recurring !== filterRecurring) {
        return false
      }

      // Filtre date début
      if (dateFrom && expense.date < dateFrom) {
        return false
      }

      // Filtre date fin
      if (dateTo && expense.date > dateTo) {
        return false
      }

      // Filtre montant min
      if (amountMin && expense.amount < parseFloat(amountMin)) {
        return false
      }

      // Filtre montant max
      if (amountMax && expense.amount > parseFloat(amountMax)) {
        return false
      }

      return true
    })
  }, [
    expenses,
    searchQuery,
    filterCategories,
    filterRecurring,
    dateFrom,
    dateTo,
    amountMin,
    amountMax,
  ])

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredExpenses.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredExpenses.map((e) => e.id)))
    }
  }

  const handleBulkDelete = () => {
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer ${selectedIds.size} dépense(s) ?`
      )
    ) {
      const updatedExpenses = expenses.filter((e) => !selectedIds.has(e.id))
      setExpenses(updatedExpenses)
      setSelectedIds(new Set())
    }
  }

  const handleBulkCategoryAssign = () => {
    if (!bulkCategory.trim()) {
      alert("Veuillez entrer une catégorie")
      return
    }

    const updatedExpenses = expenses.map((expense) =>
      selectedIds.has(expense.id)
        ? { ...expense, category: bulkCategory }
        : expense
    )
    setExpenses(updatedExpenses)
    setSelectedIds(new Set())
    setBulkCategory("")
  }

  const handleBulkRecurringToggle = (recurring: boolean) => {
    const updatedExpenses = expenses.map((expense) =>
      selectedIds.has(expense.id) ? { ...expense, recurring } : expense
    )
    setExpenses(updatedExpenses)
    setSelectedIds(new Set())
  }

  if (isLoading) {
    return (
      <div className="text-muted-foreground">Chargement des dépenses...</div>
    )
  }

  return (
    <PageLayout
      title="Mes dépenses"
      description="Gérez et suivez toutes vos dépenses"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          >
            <Upload className="h-4 w-4" />
            Importer CSV
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
          >
            <Plus className="h-4 w-4" />
            Nouvelle dépense
          </button>
        </div>
      }
    >

      {/* Barre d'actions groupées */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedIds.size} dépense(s) sélectionnée(s)
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Catégorie..."
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              className="h-9 w-40"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkCategoryAssign}
            >
              <Tag className="h-4 w-4 mr-2" />
              Assigner catégorie
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkRecurringToggle(true)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Marquer récurrente
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkRecurringToggle(false)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retirer récurrence
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher une dépense..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-10"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filtres</h3>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-auto p-1 text-xs"
                  >
                    Réinitialiser
                  </Button>
                )}
              </div>

              {/* Catégories */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Catégories</Label>
                <div className="flex flex-wrap gap-2">
                  {uniqueCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        filterCategories.includes(category)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Récurrence */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Récurrence</Label>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setRecurring(filterRecurring === true ? null : true)
                    }
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      filterRecurring === true
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    Récurrentes
                  </button>
                  <button
                    onClick={() =>
                      setRecurring(filterRecurring === false ? null : false)
                    }
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      filterRecurring === false
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    Non récurrentes
                  </button>
                </div>
              </div>

              {/* Période */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Période</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label
                      htmlFor="dateFrom"
                      className="text-xs text-muted-foreground"
                    >
                      Du
                    </Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="dateTo"
                      className="text-xs text-muted-foreground"
                    >
                      Au
                    </Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              {/* Montant */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Montant</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label
                      htmlFor="amountMin"
                      className="text-xs text-muted-foreground"
                    >
                      Min
                    </Label>
                    <Input
                      id="amountMin"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amountMin}
                      onChange={(e) => setAmountMin(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="amountMax"
                      className="text-xs text-muted-foreground"
                    >
                      Max
                    </Label>
                    <Input
                      id="amountMax"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amountMax}
                      onChange={(e) => setAmountMax(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="h-12 px-4 w-12">
                  <input
                    type="checkbox"
                    checked={
                      filteredExpenses.length > 0 &&
                      selectedIds.size === filteredExpenses.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-border"
                  />
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Date
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Catégorie
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Description
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Montant
                </th>
                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                  Récurrente
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-muted-foreground"
                  >
                    {searchQuery || activeFiltersCount > 0
                      ? "Aucune dépense ne correspond aux critères de recherche"
                      : "Aucune dépense pour le moment"}
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className={`border-b border-border last:border-0 hover:bg-accent/50 transition-colors ${
                      selectedIds.has(expense.id) ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="p-4 align-middle">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(expense.id)}
                        onChange={() => toggleSelection(expense.id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="p-4 align-middle text-sm">
                      {new Date(expense.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-sm font-medium">
                      {expense.description}
                    </td>
                    <td className="p-4 align-middle text-right text-sm font-semibold text-red-500">
                      -{expense.amount.toFixed(2)}€
                    </td>
                    <td className="p-4 align-middle text-center">
                      {expense.recurring && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700">
                          <RefreshCw className="h-3 w-3" />
                          Récurrente
                        </span>
                      )}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(expense)}
                          className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-destructive/10 hover:text-destructive"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExpenseModal
        expense={selectedExpense}
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveExpense}
      />

      <CsvImportModal
        open={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImport={handleImportCsv}
      />
    </PageLayout>
  )
}
