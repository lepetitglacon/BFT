- flow chart par mois
- créer des dépenses recurrente (sur une période donnée)

- OCR des photos de notes
- imports de différentes banques
    - imports via API

# Roadmap

1. Flow chart par mois ✅ Déjà partiellement fait

État actuel : Le graphique Sankey affiche les transactions récurrentes.

À améliorer :

- Ajouter un sélecteur de mois
- Filtrer les transactions par mois sélectionné
- Afficher les transactions ponctuelles ET récurrentes du mois
- Calculer les totaux mensuels réels

Plan technique :

1. Ajouter un state selectedMonth dans Sankey.tsx
2. Filtrer expenses par date (mois/année)
3. Créer les liens Sankey pour ce mois spécifique
4. Afficher un résumé : revenus vs dépenses du mois

  ---

2. Créer des dépenses récurrentes sur une période donnée

Objectif : Générer automatiquement des transactions récurrentes sur plusieurs mois.

Plan technique :

Étape 1 : Ajouter les champs à Expense
interface Expense {
// ... champs existants
recurrenceEndDate?: string // Date de fin de récurrence
recurrenceFrequency?: "monthly" | "weekly" | "yearly"
}

Étape 2 : Créer un service de génération
// src/services/recurrenceGenerator.ts
function generateRecurringExpenses(
baseExpense: Expense,
startDate: Date,
endDate: Date,
frequency: "monthly" | "weekly"
): Expense[]

Étape 3 : Modifier ExpenseModal

- Ajouter checkbox "Générer pour une période"
- Si coché, afficher :
    - Date de début
    - Date de fin
    - Fréquence (mensuel/hebdomadaire)
- À la sauvegarde, générer toutes les occurrences

Étape 4 : Affichage dans Expenses

- Grouper les dépenses récurrentes générées
- Option "Voir toutes les occurrences" ou "Voir uniquement le modèle"

  ---

3. OCR des photos de notes

Objectif : Scanner une photo de ticket de caisse et extraire les données.

Plan technique :

Étape 1 : Choisir une solution OCR

- Option A : Tesseract.js (client-side, gratuit)
- Option B : Google Cloud Vision API (plus précis, payant)
- Option C : Azure Computer Vision

Étape 2 : Créer le composant de capture
// src/components/ReceiptScanner.tsx

- Input file ou capture photo (mobile)
- Preview de l'image
- Bouton "Scanner"

Étape 3 : Parser le résultat OCR
// src/services/receiptParser.ts
interface ReceiptData {
merchant: string
date: string
total: number
items: { description: string; amount: number }[]
}

function parseReceipt(ocrText: string): ReceiptData

Étape 4 : Intégration dans ExpenseModal

- Ajouter onglet "Scanner un ticket"
- Après scan, pré-remplir le formulaire
- Permettre correction manuelle avant sauvegarde

Étape 5 : Gestion des images

- Stocker l'image dans localStorage (base64) ou
- Upload vers un service cloud (Firebase Storage)
- Associer l'image à la dépense

  ---

4. Imports de différentes banques

Objectif : Parser les formats CSV/OFX de différentes banques françaises.

Plan technique :

Étape 1 : Identifier les formats
Créer des parsers pour :

- Crédit Agricole (CSV spécifique)
- BNP Paribas (format OFX/QIF)
- Société Générale (CSV)
- Boursorama (CSV)
- N26 (CSV)

Étape 2 : Créer un système de détection
// src/services/bankDetector.ts
function detectBankFormat(csvContent: string): "credit-agricole" | "bnp" | ...

interface BankParser {
parse(content: string): Transaction[]
}

class CreditAgricoleParser implements BankParser { ... }
class BNPParser implements BankParser { ... }

Étape 3 : Modifier CsvImportModal

- Auto-détecter le format de la banque
- Afficher "Format détecté : Crédit Agricole"
- Permettre sélection manuelle si détection échoue
- Adapter le mapping automatique aux colonnes spécifiques

Étape 4 : Support OFX/QIF

- Installer une lib de parsing OFX : ofx-js
- Ajouter support dans le file input : .ofx, .qif, .csv
- Parser et normaliser en format interne

  ---

5. Imports via API

Objectif : Se connecter directement aux banques via API.

Plan technique :

Étape 1 : Choisir une solution d'agrégation

- Budget API (Européen, PSD2)
- Plaid (USA/Europe)
- TrueLayer (UK/Europe)
- Bridge API (France)

Étape 2 : Setup Backend
// backend/src/services/bankConnection.ts

- Endpoint OAuth pour connexion banque
- Stocker tokens de manière sécurisée
- Endpoint pour fetch transactions

Étape 3 : Frontend
// src/components/BankConnectionModal.tsx

- Liste des banques disponibles
- Bouton "Connecter ma banque"
- Redirection OAuth
- Callback et stockage du token

Étape 4 : Synchronisation
// src/hooks/useBankSync.ts

- Fetch automatique des nouvelles transactions
- Détection des doublons
- Merge avec transactions locales
- Notification des nouvelles transactions

Étape 5 : Gestion des connexions

- Page Settings : liste des banques connectées
- Bouton "Re-synchroniser"
- Bouton "Déconnecter"
- Afficher date dernière synchro

  ---

Ordre de priorité recommandé :

1. Flow chart par mois (1-2 jours) - Extension simple
2. Dépenses récurrentes sur période (2-3 jours) - Grande valeur ajoutée
3. Imports multi-banques (CSV) (3-4 jours) - Très pratique
4. OCR tickets (1 semaine) - Feature innovante
5. API bancaire (2+ semaines) - Complexe, nécessite backend

Voulez-vous que je commence par l'une de ces features ?