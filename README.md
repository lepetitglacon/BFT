- flow chart par mois
- créer des dépenses recurrente (sur une période donnée)

- OCR des photos de notes
- imports de différentes banques
    - imports via API

# test CI

- ajouté la var IP dans github
- nouvelle clé SSH sans password

# Roadmap

1. Flow chart par mois ✅ TERMINÉ

État : Le graphique Sankey affiche désormais toutes les transactions (récurrentes et ponctuelles) par mois.

Fonctionnalités implémentées :

- ✅ Sélecteur de mois et année
- ✅ Filtrage des transactions par mois sélectionné
- ✅ Affichage des transactions ponctuelles ET récurrentes du mois
- ✅ Calcul et affichage des totaux mensuels (revenus, dépenses, solde)
- ✅ Interface avec résumé financier mensuel

  ---

2. Créer des dépenses récurrentes sur une période donnée ✅ TERMINÉ

État : Les utilisateurs peuvent maintenant générer automatiquement des transactions récurrentes sur plusieurs mois.

Fonctionnalités implémentées :

- ✅ Champs ajoutés à l'interface Expense (recurrenceEndDate, recurrenceFrequency)
- ✅ Service de génération créé (src/services/recurrenceGenerator.ts)
- ✅ ExpenseModal modifié avec checkbox "Générer sur une période"
- ✅ Sélecteur de fréquence (hebdomadaire, mensuel, annuel)
- ✅ Génération automatique lors de la sauvegarde
- ✅ Sauvegarde en lot des dépenses générées

  ---

3. OCR des photos de notes ✅ TERMINÉ

État : Les utilisateurs peuvent maintenant scanner des tickets de caisse et extraire automatiquement les données avec
une sélection interactive ligne par ligne.

Fonctionnalités implémentées :

- ✅ Solution OCR : Tesseract.js (client-side, gratuit)
- ✅ Composant ReceiptScanner.tsx avec preview et progression
- ✅ **Interface de sélection interactive**
    - Affichage du texte OCR ligne par ligne
    - Sélection manuelle des lignes pour chaque champ (Description, Montant, Date, Catégorie)
    - Code couleur pour différencier les champs sélectionnés
    - Pré-sélection automatique suggérée par le parser
    - Interface intuitive avec boutons de champ colorés
- ✅ Service receiptParser.ts pour parser le texte OCR
    - Extraction du commerçant
    - Extraction de la date (formats multiples)
    - Extraction du montant total
    - Extraction des articles
    - Détection automatique de la catégorie
- ✅ Intégration dans ExpenseModal avec système d'onglets
    - Onglet "Saisie manuelle"
    - Onglet "Scanner un ticket"
    - Validation et correction manuelle
- ✅ Service imageStorage.ts pour la gestion des images
    - Compression automatique des images
    - Stockage dans localStorage (base64)
    - Association image/dépense via ID unique
    - Fonctions de nettoyage des images orphelines

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