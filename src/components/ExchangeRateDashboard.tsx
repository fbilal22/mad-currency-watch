import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, DollarSign, Euro, TrendingUp } from "lucide-react";
import { ExchangeRateCard } from "./ExchangeRateCard";
import { ExchangeRateComparison } from "./ExchangeRateComparison";
import { ExchangeRateService } from "@/services/exchangeRateService";
import { useToast } from "@/hooks/use-toast";

export const ExchangeRateDashboard = () => {
  const [bankRates, setBankRates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchExchangeRates = async () => {
    setIsLoading(true);
    try {
      const rates = await ExchangeRateService.getExchangeRates();
      setBankRates(rates);
      setLastRefresh(new Date());
      
      toast({
        title: "Taux mis à jour",
        description: "Les taux de change ont été actualisés avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de récupérer les taux de change",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const comparisonData = ExchangeRateService.prepareComparisonData(bankRates);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-financial-primary/5 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-financial bg-clip-text text-transparent mb-4">
            Dashboard Taux de Change
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Suivi en temps réel des taux MAD/USD et MAD/EUR des principales banques marocaines
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={fetchExchangeRates}
              disabled={isLoading}
              className="bg-gradient-financial text-white shadow-financial hover:shadow-hover"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser les Taux
            </Button>
            
            {lastRefresh && (
              <p className="text-sm text-muted-foreground">
                Dernière mise à jour: {lastRefresh.toLocaleString('fr-FR')}
              </p>
            )}
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-card backdrop-blur-sm rounded-lg p-6 shadow-card border-0">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-financial-success/20 rounded-full">
                <DollarSign className="h-6 w-6 text-financial-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">USD Moyen</p>
                <p className="text-2xl font-bold">
                  {bankRates.length > 0 
                    ? (bankRates.reduce((acc, bank) => {
                        const usd = bank.rates.find((r: any) => r.currency === 'USD');
                        return acc + (usd ? (usd.buyRate + usd.sellRate) / 2 : 0);
                      }, 0) / bankRates.length).toFixed(4)
                    : "-.----"
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-card backdrop-blur-sm rounded-lg p-6 shadow-card border-0">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-financial-primary/20 rounded-full">
                <Euro className="h-6 w-6 text-financial-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">EUR Moyen</p>
                <p className="text-2xl font-bold">
                  {bankRates.length > 0 
                    ? (bankRates.reduce((acc, bank) => {
                        const eur = bank.rates.find((r: any) => r.currency === 'EUR');
                        return acc + (eur ? (eur.buyRate + eur.sellRate) / 2 : 0);
                      }, 0) / bankRates.length).toFixed(4)
                    : "-.----"
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-card backdrop-blur-sm rounded-lg p-6 shadow-card border-0">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-financial-warning/20 rounded-full">
                <TrendingUp className="h-6 w-6 text-financial-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Banques Suivies</p>
                <p className="text-2xl font-bold">{bankRates.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cartes des taux par banque */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {bankRates.map((bank, index) => (
            <ExchangeRateCard
              key={index}
              bankName={bank.bankName}
              rates={bank.rates}
              lastUpdated={bank.lastUpdated}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Comparaison des taux */}
        {comparisonData.length > 0 && (
          <div className="mb-8">
            <ExchangeRateComparison rates={comparisonData} />
          </div>
        )}

        {/* Note technique */}
        <div className="bg-financial-warning/10 border border-financial-warning/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-financial-warning">
            Note Technique - Intégration Puppeteer
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Actuellement, l'application utilise des données de démonstration. Pour intégrer le scraping réel avec Puppeteer :
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Créer une Supabase Edge Function qui utilise Puppeteer</li>
            <li>Scraper les sites: bpnet.gbp.ma et attijarinet.attijariwafa.com</li>
            <li>Retourner les données formatées via l'API</li>
            <li>Mettre à jour le service pour appeler cette fonction</li>
          </ul>
        </div>
      </div>
    </div>
  );
};