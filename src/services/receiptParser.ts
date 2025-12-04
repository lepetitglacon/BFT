export interface ReceiptData {
  merchant: string;
  date: string;
  total: number;
  items: { description: string; amount: number }[];
  category: string;
}

/**
 * Parse le texte OCR d'un ticket de caisse pour en extraire les informations structurées
 */
export function parseReceipt(ocrText: string): ReceiptData {
  const lines = ocrText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const result: ReceiptData = {
    merchant: extractMerchant(lines),
    date: extractDate(lines),
    total: extractTotal(lines),
    items: extractItems(lines),
    category: guessCategory(lines),
  };

  return result;
}

/**
 * Extrait le nom du commerçant (généralement en haut du ticket)
 */
function extractMerchant(lines: string[]): string {
  // Le commerçant est souvent dans les 5 premières lignes
  const topLines = lines.slice(0, 5);

  // Chercher des noms connus de commerçants français
  const knownMerchants = [
    'CARREFOUR', 'AUCHAN', 'LECLERC', 'INTERMARCHE', 'CASINO',
    'MONOPRIX', 'FRANPRIX', 'LIDL', 'ALDI', 'SUPER U',
    'PICARD', 'BIOCOOP', 'NATURALIA', 'SEPHORA', 'DECATHLON',
    'FNAC', 'DARTY', 'IKEA', 'LEROY MERLIN', 'BRICORAMA'
  ];

  for (const line of topLines) {
    const upperLine = line.toUpperCase();
    for (const merchant of knownMerchants) {
      if (upperLine.includes(merchant)) {
        return merchant;
      }
    }
  }

  // Si pas de commerçant connu, retourner la première ligne non vide
  return topLines[0] || 'Commerçant inconnu';
}

/**
 * Extrait la date du ticket
 */
function extractDate(lines: string[]): string {
  const today = new Date().toISOString().split('T')[0];

  // Patterns de dates français
  const datePatterns = [
    // Format: 04/12/2025 ou 04-12-2025 ou 04.12.2025
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/,
    // Format: 2025-12-04
    /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,
  ];

  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        try {
          let year: number, month: number, day: number;

          if (match[1].length === 4) {
            // Format YYYY-MM-DD
            year = parseInt(match[1]);
            month = parseInt(match[2]);
            day = parseInt(match[3]);
          } else {
            // Format DD-MM-YYYY
            day = parseInt(match[1]);
            month = parseInt(match[2]);
            year = parseInt(match[3]);

            // Si l'année est sur 2 chiffres, on ajoute 2000
            if (year < 100) {
              year += 2000;
            }
          }

          // Valider que la date est correcte
          if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            // Formater en YYYY-MM-DD
            return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          }
        } catch (e) {
          continue;
        }
      }
    }
  }

  // Par défaut, retourner aujourd'hui
  return today;
}

/**
 * Extrait le montant total du ticket
 */
function extractTotal(lines: string[]): number {
  // Mots-clés pour identifier la ligne du total
  const totalKeywords = ['TOTAL', 'MONTANT', 'A PAYER', 'APAYER', 'SOMME'];

  // Pattern pour extraire des montants (ex: 12.50, 12,50, 12€50)
  const amountPattern = /(\d{1,6})[,\.](\d{2})/;

  // Chercher d'abord avec les mots-clés
  for (const line of lines) {
    const upperLine = line.toUpperCase();
    const hasKeyword = totalKeywords.some(keyword => upperLine.includes(keyword));

    if (hasKeyword) {
      const match = line.match(amountPattern);
      if (match) {
        return parseFloat(`${match[1]}.${match[2]}`);
      }
    }
  }

  // Si pas de mot-clé trouvé, chercher le montant le plus élevé dans le ticket
  let maxAmount = 0;
  for (const line of lines) {
    const match = line.match(amountPattern);
    if (match) {
      const amount = parseFloat(`${match[1]}.${match[2]}`);
      if (amount > maxAmount && amount < 10000) { // Limiter à 10000€ pour éviter les erreurs
        maxAmount = amount;
      }
    }
  }

  return maxAmount;
}

/**
 * Extrait les articles individuels du ticket
 */
function extractItems(lines: string[]): { description: string; amount: number }[] {
  const items: { description: string; amount: number }[] = [];
  const amountPattern = /(\d{1,6})[,\.](\d{2})/;

  // Mots-clés à ignorer
  const skipKeywords = [
    'TOTAL', 'SOUS-TOTAL', 'TVA', 'CARTE', 'CB', 'ESPECES',
    'RENDU', 'TICKET', 'MERCI', 'BONNE JOURNEE'
  ];

  for (const line of lines) {
    const upperLine = line.toUpperCase();

    // Ignorer les lignes avec des mots-clés système
    if (skipKeywords.some(keyword => upperLine.includes(keyword))) {
      continue;
    }

    // Chercher un montant dans la ligne
    const match = line.match(amountPattern);
    if (match) {
      const amount = parseFloat(`${match[1]}.${match[2]}`);

      // Extraire la description (texte avant le montant)
      const description = line.substring(0, match.index).trim();

      if (description.length > 0 && amount > 0 && amount < 1000) {
        items.push({ description, amount });
      }
    }
  }

  return items;
}

/**
 * Devine la catégorie en fonction du contenu du ticket
 */
function guessCategory(lines: string[]): string {
  const fullText = lines.join(' ').toUpperCase();

  // Catégories alimentaires
  if (fullText.match(/CARREFOUR|AUCHAN|LECLERC|INTERMARCHE|CASINO|MONOPRIX|FRANPRIX|LIDL|ALDI|SUPER U|PICARD/)) {
    return 'Alimentation';
  }

  // Catégories santé/beauté
  if (fullText.match(/PHARMACIE|SEPHORA|YVES ROCHER|MARIONNAUD/)) {
    return 'Santé & Beauté';
  }

  // Catégories sport
  if (fullText.match(/DECATHLON|GO SPORT|INTERSPORT/)) {
    return 'Sport & Loisirs';
  }

  // Catégories bricolage
  if (fullText.match(/LEROY MERLIN|BRICORAMA|BRICO DEPOT|CASTORAMA/)) {
    return 'Bricolage & Maison';
  }

  // Catégories tech
  if (fullText.match(/FNAC|DARTY|BOULANGER|APPLE STORE/)) {
    return 'High-Tech';
  }

  // Catégories restaurant
  if (fullText.match(/RESTAURANT|CAFE|BAR|BRASSERIE|PIZZERIA/)) {
    return 'Restaurants';
  }

  // Par défaut
  return 'Divers';
}
