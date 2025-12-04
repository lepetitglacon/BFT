import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { Expense } from "../hooks/useExpenses";
import { generateRecurringExpenses } from "../services/recurrenceGenerator";
import { ReceiptScanner } from "./ReceiptScanner";
import type { ReceiptData } from "../services/receiptParser";
import { saveReceiptImage } from "../services/imageStorage";

interface ExpenseModalProps {
  expense: Expense | null;
  open: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  onSaveBatch?: (expenses: Expense[]) => void; // Pour la génération en lot
  existingExpenses: Expense[]; // Pour calculer le prochain ID
}

export function ExpenseModal({
  expense,
  open,
  onClose,
  onSave,
  onSaveBatch,
  existingExpenses: _existingExpenses,
}: ExpenseModalProps) {
  const [formData, setFormData] = useState<Expense>({
    id: 0,
    category: "",
    description: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    recurring: false,
    type: "expense",
  });

  // État pour la génération sur période
  const [generateForPeriod, setGenerateForPeriod] = useState(false);

  // États pour le scanner de tickets
  const [activeTab, setActiveTab] = useState<'manual' | 'scan'>('manual');
  const [scannedImage, setScannedImage] = useState<string | null>(null);

  useEffect(() => {
    if (expense) {
      setFormData(expense);
      setGenerateForPeriod(false); // Reset lors de l'édition
    } else {
      setFormData({
        id: Date.now(),
        category: "",
        description: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        recurring: false,
        type: "expense",
      });
      setGenerateForPeriod(false); // Reset lors de la création
    }
    // Reset scanner states
    setActiveTab('manual');
    setScannedImage(null);
  }, [expense, open]); // Ajouter open pour reset à chaque ouverture

  const handleScanComplete = (data: ReceiptData, imageBase64: string) => {
    // Pré-remplir le formulaire avec les données scannées
    setFormData(prev => ({
      ...prev,
      description: data.merchant,
      category: data.category,
      amount: data.total,
      date: data.date,
      type: "expense",
    }));

    // Stocker l'image
    setScannedImage(imageBase64);

    // Basculer vers l'onglet manuel pour permettre les corrections
    setActiveTab('manual');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Préparer les données de la dépense
    let expenseToSave = { ...formData };

    // Si une image a été scannée, la sauvegarder
    if (scannedImage) {
      try {
        const imageId = await saveReceiptImage(scannedImage);
        expenseToSave.receiptImage = imageId;
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'image:', error);
        // Continuer même si l'image n'a pas pu être sauvegardée
      }
    }

    // Si génération sur période est activée
    if (generateForPeriod && formData.recurring && formData.recurrenceEndDate && formData.recurrenceFrequency) {
      const startDate = new Date(formData.date);
      const endDate = new Date(formData.recurrenceEndDate);

      // Générer toutes les occurrences
      const generatedExpenses = generateRecurringExpenses(
        expenseToSave,
        startDate,
        endDate,
        formData.recurrenceFrequency
      );

      // Sauvegarder en lot si la fonction existe
      if (onSaveBatch) {
        onSaveBatch(generatedExpenses);
      } else {
        // Sinon, sauvegarder une par une
        generatedExpenses.forEach(expense => onSave(expense));
      }
    } else {
      // Sauvegarde simple
      onSave(expenseToSave);
    }

    onClose();
  };

  const handleChange = (field: keyof Expense, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {expense
              ? `Modifier ${formData.type === "income" ? "le revenu" : "la dépense"}`
              : "Nouvelle transaction"}
          </DialogTitle>
          <DialogDescription>
            {expense
              ? `Modifiez les informations de votre ${formData.type === "income" ? "revenu" : "dépense"}`
              : "Ajoutez une nouvelle transaction à votre liste"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Onglets uniquement pour les nouvelles dépenses (pas en mode édition) */}
          {!expense && (
            <div className="flex border-b border-border mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'manual'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Saisie manuelle
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('scan')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'scan'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Scanner un ticket
              </button>
            </div>
          )}

          {/* Contenu de l'onglet Scanner */}
          {activeTab === 'scan' && !expense && (
            <div className="py-4">
              <ReceiptScanner onScanComplete={handleScanComplete} />
            </div>
          )}

          {/* Contenu de l'onglet Manuel (ou mode édition) */}
          {(activeTab === 'manual' || expense) && (
            <div className="grid gap-4 py-4">
            {/* Indicateur d'image scannée */}
            {scannedImage && (
              <div className="p-3 rounded-md bg-primary/10 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-primary">📷</span>
                  <span>Ticket scanné - Vérifiez et corrigez les informations si nécessaire</span>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Type de transaction</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="expense"
                    checked={formData.type === "expense"}
                    onChange={(e) => handleChange("type", e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Dépense</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="income"
                    checked={formData.type === "income"}
                    onChange={(e) => handleChange("type", e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Revenu</span>
                </label>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Ex: Courses alimentaires"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Catégorie</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                placeholder="Ex: Alimentation"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Montant (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  handleChange("amount", parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="recurring"
                type="checkbox"
                checked={formData.recurring}
                onChange={(e) => handleChange("recurring", e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="recurring" className="cursor-pointer">
                {formData.type === "income" ? "Revenu" : "Dépense"} récurrent(e)
              </Label>
            </div>

            {/* Option de génération sur période */}
            {formData.recurring && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  id="generateForPeriod"
                  type="checkbox"
                  checked={generateForPeriod}
                  onChange={(e) => setGenerateForPeriod(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="generateForPeriod" className="cursor-pointer">
                  Générer sur une période
                </Label>
              </div>
            )}

            {/* Champs de génération sur période */}
            {formData.recurring && generateForPeriod && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="recurrenceFrequency">Fréquence</Label>
                  <select
                    id="recurrenceFrequency"
                    value={formData.recurrenceFrequency || "monthly"}
                    onChange={(e) => handleChange("recurrenceFrequency", e.target.value)}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuel</option>
                    <option value="yearly">Annuel</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="recurrenceEndDate">Date de fin</Label>
                  <Input
                    id="recurrenceEndDate"
                    type="date"
                    value={formData.recurrenceEndDate || ""}
                    onChange={(e) => handleChange("recurrenceEndDate", e.target.value)}
                    min={formData.date}
                    required
                  />
                </div>
              </>
            )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">{expense ? "Enregistrer" : "Ajouter"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
