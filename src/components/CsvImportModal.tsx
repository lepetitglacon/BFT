import { useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Button } from "./ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { CheckCircle, FileText, Upload } from "lucide-react"
import type { Expense } from "../hooks/useExpenses"

interface CsvImportModalProps {
  open: boolean
  onClose: () => void
  onImport: (expenses: Expense[]) => void
}

type ColumnMapping = {
  description: string
  category: string
  amount: string
  date: string
}

export function CsvImportModal({
  open,
  onClose,
  onImport,
}: CsvImportModalProps) {
  const [step, setStep] = useState<"upload" | "mapping" | "preview">("upload")
  const [csvData, setCsvData] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<ColumnMapping>({
    description: "",
    category: "",
    amount: "",
    date: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length === 0) {
        alert("Le fichier CSV est vide")
        return
      }

      // Parse CSV (simple parser, supporte les virgules et points-virgules)
      const parsedData = lines.map((line) => {
        // Essayer de détecter le séparateur
        const separator = line.includes(";") ? ";" : ","
        return line
          .split(separator)
          .map((cell) => cell.trim().replace(/^"|"$/g, ""))
      })

      const csvHeaders = parsedData[0]
      const data = parsedData.slice(1)

      setHeaders(csvHeaders)
      setCsvData(data)
      setStep("mapping")

      // Auto-mapping basé sur les noms courants
      const autoMapping: ColumnMapping = {
        description: "",
        category: "",
        amount: "",
        date: "",
      }

      csvHeaders.forEach((header, index) => {
        const lowerHeader = header.toLowerCase()
        if (
          lowerHeader.includes("description") ||
          lowerHeader.includes("libelle") ||
          lowerHeader.includes("label")
        ) {
          autoMapping.description = index.toString()
        } else if (
          lowerHeader.includes("categorie") ||
          lowerHeader.includes("category") ||
          lowerHeader.includes("type")
        ) {
          autoMapping.category = index.toString()
        } else if (
          lowerHeader.includes("montant") ||
          lowerHeader.includes("amount") ||
          lowerHeader.includes("prix") ||
          lowerHeader.includes("price")
        ) {
          autoMapping.amount = index.toString()
        } else if (lowerHeader.includes("date")) {
          autoMapping.date = index.toString()
        }
      })

      setMapping(autoMapping)
    }

    reader.readAsText(file, "UTF-8")
  }

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    setMapping((prev) => {
      // Nettoyer l'ancienne valeur si elle existait ailleurs
      const newMapping = { ...prev }
      Object.keys(newMapping).forEach((key) => {
        if (newMapping[key as keyof ColumnMapping] === value && key !== field) {
          newMapping[key as keyof ColumnMapping] = ""
        }
      })
      newMapping[field] = value
      return newMapping
    })
  }

  const handleColumnSelect = (columnIndex: number, fieldValue: string) => {
    if (fieldValue === "none" || !fieldValue) {
      // Supprimer ce mapping s'il existe
      setMapping((prev) => {
        const newMapping = { ...prev }
        Object.keys(newMapping).forEach((key) => {
          if (
            newMapping[key as keyof ColumnMapping] === columnIndex.toString()
          ) {
            newMapping[key as keyof ColumnMapping] = ""
          }
        })
        return newMapping
      })
    } else {
      handleMappingChange(
        fieldValue as keyof ColumnMapping,
        columnIndex.toString()
      )
    }
  }

  const handlePreview = () => {
    if (!mapping.description || !mapping.amount || !mapping.date) {
      alert("Veuillez mapper au minimum: Description, Montant et Date")
      return
    }
    setStep("preview")
  }

  const parseFrenchDate = (dateStr: string): string => {
    if (!dateStr) return new Date().toISOString().split("T")[0]

    // Déjà au format ISO (yyyy-mm-dd)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr
    }

    // Format français dd/mm/yyyy ou d/m/yyyy
    const frenchDateMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (frenchDateMatch) {
      const [, day, month, year] = frenchDateMatch
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    }

    // Format anglais mm/dd/yyyy
    const usDateMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (usDateMatch) {
      // On privilégie le format français, donc on suppose dd/mm/yyyy
      const [, day, month, year] = usDateMatch
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    }

    // Si on ne peut pas parser, date actuelle
    return new Date().toISOString().split("T")[0]
  }

  const handleImport = () => {
    const expenses: Expense[] = csvData
      .map((row, index) => {
        const amount = parseFloat(
          row[parseInt(mapping.amount)]?.replace(",", ".") || "0"
        )

        const dateStr = row[parseInt(mapping.date)] || ""

        return {
          id: Date.now() + index,
          description: row[parseInt(mapping.description)] || "Sans description",
          category: mapping.category
            ? row[parseInt(mapping.category)] || "Autre"
            : "Autre",
          amount: Math.abs(amount),
          date: parseFrenchDate(dateStr),
          recurring: false,
          isExpense: amount < 0, // Pour filtrer après
        }
      })
      .filter((expense) => expense.isExpense) // Ne garder que les dépenses (montants négatifs)
      .map(({ isExpense, ...expense }) => expense) // Retirer le flag temporaire

    onImport(expenses)
    handleClose()
  }

  const handleClose = () => {
    setStep("upload")
    setCsvData([])
    setHeaders([])
    setMapping({ description: "", category: "", amount: "", date: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onClose()
  }

  const previewData = csvData.slice(0, 5)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={
          step === "mapping"
            ? "sm:max-w-[400vw] sm:max-h-[400vh]"
            : "sm:max-w-[400px]"
        }
      >
        <DialogHeader>
          <DialogTitle>Importer des dépenses depuis un CSV</DialogTitle>
          <DialogDescription>
            {step === "upload" &&
              "Sélectionnez un fichier CSV contenant vos dépenses"}
            {step === "mapping" &&
              "Associez les colonnes de votre CSV aux champs de dépense"}
            {step === "preview" &&
              `Prévisualisation de ${csvData.length} dépense(s) à importer`}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4 py-4">
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                Cliquez pour sélectionner un fichier CSV
              </p>
              <p className="text-xs text-muted-foreground">
                Format supporté: CSV (virgule ou point-virgule)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}

        {step === "mapping" && (
          <div className="space-y-4 py-4 max-h-[calc(90vh-200px)] overflow-y-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <FileText className="h-4 w-4" />
              <span>{csvData.length} lignes détectées</span>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Associez chaque colonne de votre CSV aux champs correspondants
            </p>

            <div className="border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-w-full">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      {headers.map((header, index) => (
                        <th
                          key={index}
                          className="p-2 text-left font-medium text-sm min-w-[150px]"
                        >
                          <div className="space-y-2">
                            <div className="text-xs text-muted-foreground font-normal">
                              {header}
                            </div>
                            <Select
                              value={
                                mapping.description === index.toString()
                                  ? "description"
                                  : mapping.category === index.toString()
                                    ? "category"
                                    : mapping.amount === index.toString()
                                      ? "amount"
                                      : mapping.date === index.toString()
                                        ? "date"
                                        : "none"
                              }
                              onValueChange={(value) =>
                                handleColumnSelect(index, value)
                              }
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Ignorer" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  Ignorer cette colonne
                                </SelectItem>
                                <SelectItem value="description">
                                  Description *
                                </SelectItem>
                                <SelectItem value="category">
                                  Catégorie
                                </SelectItem>
                                <SelectItem value="amount">
                                  Montant *
                                </SelectItem>
                                <SelectItem value="date">Date *</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.length > 0 && (
                      <tr className="border-b border-border">
                        {csvData[0].map((cell, index) => (
                          <td
                            key={index}
                            className="p-2 text-sm text-muted-foreground"
                          >
                            {cell || (
                              <span className="italic text-muted-foreground/50">
                                vide
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Les champs marqués d'un{" "}
              <span className="text-destructive">*</span> sont obligatoires
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
              <CheckCircle className="h-4 w-4" />
              <span>
                Prêt à importer{" "}
                {
                  csvData.filter((row) => {
                    const amount = parseFloat(
                      row[parseInt(mapping.amount)]?.replace(",", ".") || "0"
                    )
                    return amount < 0
                  }).length
                }{" "}
                dépense(s) (les revenus sont ignorés)
              </span>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">
                      Description
                    </th>
                    <th className="px-3 py-2 text-left font-medium">
                      Catégorie
                    </th>
                    <th className="px-3 py-2 text-right font-medium">
                      Montant
                    </th>
                    <th className="px-3 py-2 text-left font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData
                    .filter((row) => {
                      const amount = parseFloat(
                        row[parseInt(mapping.amount)]?.replace(",", ".") || "0"
                      )
                      return amount < 0 // Ne montrer que les dépenses
                    })
                    .slice(0, 5)
                    .map((row, index) => {
                      const amount = parseFloat(
                        row[parseInt(mapping.amount)]?.replace(",", ".") || "0"
                      )
                      const dateStr = row[parseInt(mapping.date)] || ""
                      const parsedDate = parseFrenchDate(dateStr)

                      return (
                        <tr key={index} className="border-t border-border">
                          <td className="px-3 py-2">
                            {row[parseInt(mapping.description)] || "-"}
                          </td>
                          <td className="px-3 py-2">
                            {mapping.category
                              ? row[parseInt(mapping.category)] || "Autre"
                              : "Autre"}
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            {Math.abs(amount).toFixed(2)}€
                          </td>
                          <td className="px-3 py-2">{parsedDate}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
            {(() => {
              const expenseCount = csvData.filter((row) => {
                const amount = parseFloat(
                  row[parseInt(mapping.amount)]?.replace(",", ".") || "0"
                )
                return amount < 0
              }).length
              return (
                expenseCount > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    ... et {expenseCount - 5} autre(s) dépense(s)
                  </p>
                )
              )
            })()}
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={handleClose}>
              Annuler
            </Button>
          )}

          {step === "mapping" && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("upload")
                  setCsvData([])
                  setHeaders([])
                }}
              >
                Retour
              </Button>
              <Button onClick={handlePreview}>Prévisualiser</Button>
            </>
          )}

          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => setStep("mapping")}>
                Retour
              </Button>
              <Button onClick={handleImport}>
                Importer{" "}
                {
                  csvData.filter((row) => {
                    const amount = parseFloat(
                      row[parseInt(mapping.amount)]?.replace(",", ".") || "0"
                    )
                    return amount < 0
                  }).length
                }{" "}
                dépense(s)
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
