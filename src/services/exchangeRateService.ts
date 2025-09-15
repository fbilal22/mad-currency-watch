// Service pour gérer les taux de change avec API Ninja

interface ExchangeRate {
  currency: string;
  buyRate: number;
  sellRate: number;
  change?: number;
  changePercent?: number;
}

interface BankRates {
  bankName: string;
  rates: ExchangeRate[];
  lastUpdated: string;
}

// Configuration API Ninja
const API_NINJA_KEY = '9rwxuPFL+NWlBdYRZIbjIg==0B8mUCTFHFmp0RWa';
const API_NINJA_BASE_URL = 'https://api.api-ninjas.com/v1/webscraper';

// URLs des banques à scraper
const BANK_URLS = {
  bankPopulaire: 'https://bpnet.gbp.ma/Public/FinaServices/ExchangeRate',
  attijariwafa: 'https://attijarinet.attijariwafa.com/particulier/public/coursdevise',
  bankAlMaghreb: 'https://www.bkam.ma/Marches/Principaux-indicateurs/Marche-des-changes/Cours-de-change/Cours-de-reference'
};

export class ExchangeRateService {
  
  // Méthode pour scraper une page avec API Ninja
  static async scrapePage(url: string): Promise<string> {
    try {
      const response = await fetch(`${API_NINJA_BASE_URL}?url=${encodeURIComponent(url)}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': API_NINJA_KEY,
        }
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`API Ninja error: ${response.status} ${text?.slice(0,200)}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data: any = await response.json();
        const payload = typeof data === 'string' ? data : (data.content || data.html || data.body || data.text || '');
        return typeof payload === 'string' && payload ? payload : JSON.stringify(data);
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error('Erreur lors du scraping:', error);
      return '';
    }
  }

  // Parse les taux de Bank Populaire depuis le HTML
  static parsePopulaireRates(html: string): ExchangeRate[] {
    const rates: ExchangeRate[] = [];

    const normalize = (s: string) => parseFloat(s.replace(/\s/g, '').replace(',', '.'));
    const extract = (label: string): { buy: number; sell: number } | null => {
      const idx = html.indexOf(label);
      if (idx === -1) return null;
      const segment = html.slice(idx, idx + 800);
      const nums = segment.match(/\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2,5})/g) || [];
      // Structure observée: [buy, change, high, low, sell, change, high, low]
      if (nums.length >= 6) {
        const buy = normalize(nums[0]);
        const sell = normalize(nums[4]);
        if (!isNaN(buy) && !isNaN(sell)) return { buy, sell };
      }
      // Fallback: prendre les deux premiers nombres plausibles
      const numeric = nums.map(normalize).filter((n) => !isNaN(n) && n > 0);
      if (numeric.length >= 2) return { buy: numeric[0], sell: numeric[1] };
      return null;
    };

    const eur = extract('EUR');
    if (eur) rates.push({ currency: 'EUR', buyRate: eur.buy, sellRate: eur.sell });
    const usd = extract('USD');
    if (usd) rates.push({ currency: 'USD', buyRate: usd.buy, sellRate: usd.sell });

    return rates;
  }

  // Parse les taux d'Attijariwafa depuis le HTML
  static parseAttijariwafaRates(html: string): ExchangeRate[] {
    const rates: ExchangeRate[] = [];

    const normalize = (s: string) => parseFloat(s.replace(/\s/g, '').replace(',', '.'));
    const extract = (label: RegExp): { buy: number; sell: number } | null => {
      const idx = html.search(label);
      if (idx === -1) return null;
      const segment = html.slice(idx, idx + 600);
      const nums = segment.match(/\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2,5})/g) || [];
      const values = nums.map(normalize).filter((n) => !isNaN(n));
      if (values.length >= 2) return { buy: values[0], sell: values[1] };
      return null;
    };

    const eur = extract(/EURO/i);
    if (eur) rates.push({ currency: 'EUR', buyRate: eur.buy, sellRate: eur.sell });
    const usd = extract(/DOLLARS?\s*USD/i);
    if (usd) rates.push({ currency: 'USD', buyRate: usd.buy, sellRate: usd.sell });

    return rates;
  }

  // Parse les taux de Bank Al-Maghreb depuis le HTML
  static parseBankAlMaghrebRates(html: string): ExchangeRate[] {
    const rates: ExchangeRate[] = [];

    const normalize = (s: string) => parseFloat(s.replace(/\s/g, '').replace(',', '.'));
    
    // Rechercher les lignes de tableau pour EURO et DOLLAR
    const euroMatch = html.match(/1\s*EURO[^0-9]*([0-9]+[,.]?[0-9]*)/i);
    const dollarMatch = html.match(/1\s*DOLLAR\s*U\.?S\.?A\.?[^0-9]*([0-9]+[,.]?[0-9]*)/i);
    
    if (euroMatch && euroMatch[1]) {
      const eurRate = normalize(euroMatch[1]);
      if (!isNaN(eurRate) && eurRate > 0) {
        // Pour Bank Al-Maghreb, c'est le cours de référence (on utilise le même pour achat et vente)
        rates.push({ 
          currency: 'EUR', 
          buyRate: eurRate, 
          sellRate: eurRate 
        });
      }
    }
    
    if (dollarMatch && dollarMatch[1]) {
      const usdRate = normalize(dollarMatch[1]);
      if (!isNaN(usdRate) && usdRate > 0) {
        // Pour Bank Al-Maghreb, c'est le cours de référence (on utilise le même pour achat et vente)
        rates.push({ 
          currency: 'USD', 
          buyRate: usdRate, 
          sellRate: usdRate 
        });
      }
    }

    return rates;
  }

  static async getExchangeRates(): Promise<BankRates[]> {
    try {
      // Scraper les trois sites en parallèle
      const [populaireHtml, attijariwafaHtml, bankAlMaghrebHtml] = await Promise.all([
        this.scrapePage(BANK_URLS.bankPopulaire),
        this.scrapePage(BANK_URLS.attijariwafa),
        this.scrapePage(BANK_URLS.bankAlMaghreb)
      ]);

      const bankRates: BankRates[] = [];
      const currentTime = new Date().toLocaleString('fr-FR');

      // Traiter les données de Bank Populaire
      if (populaireHtml) {
        const populaireRates = this.parsePopulaireRates(populaireHtml);
        if (populaireRates.length > 0) {
          bankRates.push({
            bankName: "Bank Populaire",
            rates: populaireRates,
            lastUpdated: currentTime
          });
        }
      }

      // Traiter les données d'Attijariwafa
      if (attijariwafaHtml) {
        const attijariwafaRates = this.parseAttijariwafaRates(attijariwafaHtml);
        if (attijariwafaRates.length > 0) {
          bankRates.push({
            bankName: "Attijariwafa Bank",
            rates: attijariwafaRates,
            lastUpdated: currentTime
          });
        }
      }

      // Traiter les données de Bank Al-Maghreb
      if (bankAlMaghrebHtml) {
        const bankAlMaghrebRates = this.parseBankAlMaghrebRates(bankAlMaghrebHtml);
        if (bankAlMaghrebRates.length > 0) {
          bankRates.push({
            bankName: "Bank Al-Maghreb (Référence)",
            rates: bankAlMaghrebRates,
            lastUpdated: currentTime
          });
        }
      }

      if (bankRates.length === 0) {
        throw new Error('Aucune donnée de taux de change récupérée');
      }

      return bankRates;
    } catch (error) {
      console.error('Erreur lors de la récupération des taux:', error);
      throw error instanceof Error ? error : new Error('Échec de récupération des taux');
    }
  }

  // Méthode pour préparer les données de comparaison
  static prepareComparisonData(bankRates: BankRates[]) {
    if (bankRates.length < 2) return [];

    const bp = bankRates.find(bank => bank.bankName.includes('Populaire'));
    const att = bankRates.find(bank => bank.bankName.includes('Attijariwafa'));

    if (!bp || !att) return [];

    const comparison = [];
    
    // Comparer USD
    const bpUsd = bp.rates.find(rate => rate.currency === 'USD');
    const attUsd = att.rates.find(rate => rate.currency === 'USD');
    
    if (bpUsd && attUsd) {
      comparison.push({
        currency: 'USD',
        bankPopulaire: { buy: bpUsd.buyRate, sell: bpUsd.sellRate },
        attijariwafa: { buy: attUsd.buyRate, sell: attUsd.sellRate }
      });
    }

    // Comparer EUR
    const bpEur = bp.rates.find(rate => rate.currency === 'EUR');
    const attEur = att.rates.find(rate => rate.currency === 'EUR');
    
    if (bpEur && attEur) {
      comparison.push({
        currency: 'EUR',
        bankPopulaire: { buy: bpEur.buyRate, sell: bpEur.sellRate },
        attijariwafa: { buy: attEur.buyRate, sell: attEur.sellRate }
      });
    }

    return comparison;
  }
}

/*
INTÉGRATION API NINJA TERMINÉE

Le service utilise maintenant l'API Ninja pour scraper les sites des banques.
Les parseurs HTML sont basiques et devront être affinés selon la structure réelle des pages.

Pour optimiser l'extraction des taux:
1. Examiner la structure HTML des pages scrapées
2. Ajuster les méthodes parsePopulaireRates() et parseAttijariwafaRates()
3. Implémenter des regex ou des sélecteurs plus précis pour extraire les valeurs exactes

Note sécurité: La clé API est actuellement en dur dans le code. 
Pour la production, utilisez l'intégration Supabase pour stocker les secrets de manière sécurisée.
*/