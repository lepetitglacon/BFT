import { useRef, useState } from "react"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { parseReceipt, type ReceiptData } from "../services/receiptParser"
import Tesseract from "tesseract.js"

interface ReceiptScannerProps {
  onScanComplete: (data: ReceiptData, imageBase64: string) => void
}

interface OcrLine {
  text: string
  confidence: number
}

type FieldType = "description" | "amount" | "date" | "category" | null

export function ReceiptScanner({ onScanComplete }: ReceiptScannerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [ocrLines, setOcrLines] = useState<OcrLine[]>([])
  const [selectedLines, setSelectedLines] = useState<{
    description: number | null
    amount: number | null
    date: number | null
    category: number | null
  }>({
    description: null,
    amount: null,
    date: null,
    category: null,
  })
  const [currentField, setCurrentField] = useState<FieldType>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier que c'est bien une image
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image")
      return
    }

    // Lire l'image en base64
    const reader = new FileReader()
    reader.onload = (event) => {
      const imageData = event.target?.result as string
      setSelectedImage(imageData)
      setError(null)
    }
    reader.onerror = () => {
      setError("Erreur lors de la lecture de l'image")
    }
    reader.readAsDataURL(file)
  }

  const handleScan = async () => {
    if (!selectedImage) return

    setIsScanning(true)
    setError(null)
    setScanProgress(0)

    try {
      // Utiliser Tesseract.js pour l'OCR
      const result = await Tesseract.recognize(
        selectedImage,
        "fra", // Langue française
        {
          logger: (info) => {
            // Mettre à jour la progression
            if (info.status === "recognizing text") {
              setScanProgress(Math.round(info.progress * 100))
            }
          },
        }
      )

      const ocrText = result.data.text
      console.log("OCR Text:", ocrText)

      // Extraire les lignes avec leur niveau de confiance
      const lines: OcrLine[] = ocrText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((text) => ({
          text,
          confidence: 0.9, // Tesseract ne fournit pas toujours la confiance par ligne
        }))

      setOcrLines(lines)

      // Parser automatiquement pour suggérer des sélections
      const parsedData = parseReceipt(ocrText)
      console.log("Parsed Receipt:", parsedData)

      // Pré-sélectionner les lignes qui correspondent aux données parsées
      const newSelectedLines = {
        description: lines.findIndex((l) =>
          l.text.includes(parsedData.merchant)
        ),
        amount: lines.findIndex((l) =>
          l.text.includes(parsedData.total.toString())
        ),
        date: lines.findIndex((l) =>
          l.text.includes(parsedData.date.split("-").reverse().join("/"))
        ),
        category: lines.findIndex((l) => l.text.includes(parsedData.category)),
      }

      // Remplacer -1 par null
      setSelectedLines({
        description:
          newSelectedLines.description >= 0
            ? newSelectedLines.description
            : null,
        amount: newSelectedLines.amount >= 0 ? newSelectedLines.amount : null,
        date: newSelectedLines.date >= 0 ? newSelectedLines.date : null,
        category:
          newSelectedLines.category >= 0 ? newSelectedLines.category : null,
      })
    } catch (err) {
      console.error("Erreur lors du scan:", err)
      setError("Erreur lors du scan du ticket. Veuillez réessayer.")
    } finally {
      setIsScanning(false)
    }
  }

  const handleCancel = () => {
    setSelectedImage(null)
    setError(null)
    setScanProgress(0)
    setOcrLines([])
    setSelectedLines({
      description: null,
      amount: null,
      date: null,
      category: null,
    })
    setCurrentField(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleLineClick = (lineIndex: number) => {
    if (!currentField) return

    setSelectedLines((prev) => ({
      ...prev,
      [currentField]: prev[currentField] === lineIndex ? null : lineIndex,
    }))
  }

  const handleValidateSelection = () => {
    // Construire les données à partir des lignes sélectionnées
    const receiptData: ReceiptData = {
      merchant:
        selectedLines.description !== null
          ? ocrLines[selectedLines.description].text
          : "Inconnu",
      date:
        selectedLines.date !== null
          ? extractDateFromLine(ocrLines[selectedLines.date].text)
          : new Date().toISOString().split("T")[0],
      total:
        selectedLines.amount !== null
          ? extractAmountFromLine(ocrLines[selectedLines.amount].text)
          : 0,
      items: [],
      category:
        selectedLines.category !== null
          ? ocrLines[selectedLines.category].text
          : "Divers",
    }

    // Appeler le callback avec les données
    if (selectedImage) {
      onScanComplete(receiptData, selectedImage)
    }

    // Reset
    handleCancel()
  }

  // Fonction pour extraire un montant d'une ligne
  const extractAmountFromLine = (line: string): number => {
    const amountPattern = /(\d{1,6})[,\.](\d{2})/
    const match = line.match(amountPattern)
    if (match) {
      return parseFloat(`${match[1]}.${match[2]}`)
    }
    return 0
  }

  // Fonction pour extraire une date d'une ligne
  const extractDateFromLine = (line: string): string => {
    const datePatterns = [
      /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/,
      /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,
    ]

    for (const pattern of datePatterns) {
      const match = line.match(pattern)
      if (match) {
        try {
          let year: number, month: number, day: number

          if (match[1].length === 4) {
            year = parseInt(match[1])
            month = parseInt(match[2])
            day = parseInt(match[3])
          } else {
            day = parseInt(match[1])
            month = parseInt(match[2])
            year = parseInt(match[3])
            if (year < 100) year += 2000
          }

          if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
          }
        } catch (e) {}
      }
    }

    return new Date().toISOString().split("T")[0]
  }

  const getFieldColor = (field: FieldType) => {
    switch (field) {
      case "description":
        return "bg-blue-100 border-blue-500 text-blue-900"
      case "amount":
        return "bg-green-100 border-green-500 text-green-900"
      case "date":
        return "bg-purple-100 border-purple-500 text-purple-900"
      case "category":
        return "bg-orange-100 border-orange-500 text-orange-900"
      default:
        return ""
    }
  }

  const getFieldLabel = (field: FieldType) => {
    switch (field) {
      case "description":
        return "Description"
      case "amount":
        return "Montant"
      case "date":
        return "Date"
      case "category":
        return "Catégorie"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-4">
      {/* Message d'aide */}
      {!selectedImage && !ocrLines.length && (
        <div className="text-sm text-muted-foreground">
          Prenez une photo claire de votre ticket de caisse ou sélectionnez une
          image existante.
        </div>
      )}

      {/* Sélection d'image */}
      {!selectedImage && !ocrLines.length && (
        <div className="grid gap-2">
          <Label htmlFor="receipt-image">Photo du ticket</Label>
          <input
            ref={fileInputRef}
            id="receipt-image"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelect}
            className="block w-full text-sm text-muted-foreground
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-primary file:text-primary-foreground
              hover:file:bg-primary/90
              cursor-pointer"
          />
        </div>
      )}

      {/* Preview de l'image */}
      {selectedImage && !isScanning && ocrLines.length === 0 && (
        <div className="space-y-3">
          <Label>Aperçu de l'image</Label>
          <div className="border rounded-lg overflow-hidden">
            <img
              src={selectedImage}
              alt="Ticket de caisse"
              className="w-full h-auto max-h-96 object-contain"
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" onClick={handleScan} className="flex-1">
              Scanner le ticket
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Progression du scan */}
      {isScanning && (
        <div className="space-y-3">
          <Label>Scan en cours...</Label>
          <div className="w-full bg-secondary rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
          <p className="text-sm text-center text-muted-foreground">
            {scanProgress}%
          </p>
        </div>
      )}

      {/* Interface de sélection des lignes */}
      {ocrLines.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Sélectionnez le champ à remplir, puis cliquez sur la ligne
            correspondante dans le texte scanné.
          </div>

          {/* Boutons de sélection de champ */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={currentField === "description" ? "default" : "outline"}
              onClick={() => setCurrentField("description")}
              className={
                currentField === "description"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : ""
              }
            >
              Description
            </Button>
            <Button
              type="button"
              variant={currentField === "amount" ? "default" : "outline"}
              onClick={() => setCurrentField("amount")}
              className={
                currentField === "amount"
                  ? "bg-green-500 hover:bg-green-600"
                  : ""
              }
            >
              Montant
            </Button>
            <Button
              type="button"
              variant={currentField === "date" ? "default" : "outline"}
              onClick={() => setCurrentField("date")}
              className={
                currentField === "date"
                  ? "bg-purple-500 hover:bg-purple-600"
                  : ""
              }
            >
              Date
            </Button>
            <Button
              type="button"
              variant={currentField === "category" ? "default" : "outline"}
              onClick={() => setCurrentField("category")}
              className={
                currentField === "category"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
              }
            >
              Catégorie
            </Button>
          </div>

          {/* Texte OCR ligne par ligne */}
          <div className="border rounded-lg p-3 max-h-64 overflow-y-auto space-y-1">
            {ocrLines.map((line, index) => {
              const isDescription = selectedLines.description === index
              const isAmount = selectedLines.amount === index
              const isDate = selectedLines.date === index
              const isCategory = selectedLines.category === index
              const isSelected =
                isDescription || isAmount || isDate || isCategory

              let colorClass = ""
              let label = ""
              if (isDescription) {
                colorClass = getFieldColor("description")
                label = getFieldLabel("description")
              } else if (isAmount) {
                colorClass = getFieldColor("amount")
                label = getFieldLabel("amount")
              } else if (isDate) {
                colorClass = getFieldColor("date")
                label = getFieldLabel("date")
              } else if (isCategory) {
                colorClass = getFieldColor("category")
                label = getFieldLabel("category")
              }

              return (
                <div
                  key={index}
                  onClick={() => handleLineClick(index)}
                  className={`p-2 rounded cursor-pointer transition-colors text-sm ${
                    isSelected
                      ? `${colorClass} border-2`
                      : "hover:bg-secondary border-2 border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono">{line.text}</span>
                    {isSelected && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded">
                        {label}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Boutons de validation */}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleValidateSelection}
              className="flex-1"
              disabled={!selectedLines.description && !selectedLines.amount}
            >
              Valider la sélection
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Recommencer
            </Button>
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
