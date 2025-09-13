// Service pour gérer les taux de change
// Note: Le scraping avec Puppeteer doit être fait côté serveur (Supabase Edge Functions)

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

// Données de démonstration - à remplacer par les vraies données scrapées
export const mockExchangeRates: BankRates[] = [
  {
    bankName: "Bank Populaire",
    rates: [
      {
        currency: "USD",
        buyRate: 9.8500,
        sellRate: 10.1200,
        change: 0.0120,
        changePercent: 0.12
      },
      {
        currency: "EUR", 
        buyRate: 10.6800,
        sellRate: 10.9500,
        change: -0.0080,
        changePercent: -0.07
      }
    ],
    lastUpdated: new Date().toLocaleString('fr-FR')
  },
  {
    bankName: "Attijariwafa Bank",
    rates: [
      {
        currency: "USD",
        buyRate: 9.8600,
        sellRate: 10.1100,
        change: 0.0100,
        changePercent: 0.10
      },
      {
        currency: "EUR",
        buyRate: 10.6900,
        sellRate: 10.9400,
        change: -0.0060,
        changePercent: -0.06
      }
    ],
    lastUpdated: new Date().toLocaleString('fr-FR')
  }
];

export class ExchangeRateService {
  
  // Méthode pour obtenir les taux de change (actuellement mock data)
  static async getExchangeRates(): Promise<BankRates[]> {
    // Simulation d'un délai d'API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // TODO: Implémenter l'appel à votre Supabase Edge Function
    // qui utilisera Puppeteer pour scraper les sites des banques
    return mockExchangeRates;
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

// Configuration pour Supabase Edge Function (à créer)
export const SUPABASE_FUNCTION_CONFIG = {
  functionName: 'scrape-exchange-rates',
  endpoints: {
    bankPopulaire: 'https://bpnet.gbp.ma/Public/FinaServices/ExchangeRate',
    attijariwafa: 'https://attijarinet.attijariwafa.com/particulier/public/coursdevise'
  }
};

/*
Pour implémenter le scraping réel avec Puppeteer, vous devrez créer une Supabase Edge Function.
Cette fonction utilisera Puppeteer pour scraper les sites des banques et retourner les données formatées.

Étapes d'implémentation:
1. Créer le fichier: supabase/functions/scrape-exchange-rates/index.ts
2. Installer les dépendances Puppeteer dans votre Edge Function
3. Implémenter la logique de scraping pour chaque site
4. Mettre à jour ce service pour appeler votre Edge Function
5. Gérer l'authentification et les CORS

La fonction devra extraire les taux MAD/USD et MAD/EUR depuis:
- Bank Populaire: https://bpnet.gbp.ma/Public/FinaServices/ExchangeRate  
- Attijariwafa: https://attijarinet.attijariwafa.com/particulier/public/coursdevise
*/