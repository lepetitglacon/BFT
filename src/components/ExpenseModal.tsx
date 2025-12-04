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

interface ExpenseModalProps {
  expense: Expense | null;
  open: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
}

export function ExpenseModal({
  expense,
  open,
  onClose,
  onSave,
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

  useEffect(() => {
    if (expense) {
      setFormData(expense);
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
    }
  }, [expense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
          <div className="grid gap-4 py-4">
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
          </div>

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
