import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp } from "lucide-react";

interface ComparisonRate {
  currency: string;
  bankPopulaire: { buy: number; sell: number };
  attijariwafa: { buy: number; sell: number };
}

interface ExchangeRateComparisonProps {
  rates: ComparisonRate[];
}

export const ExchangeRateComparison = ({ rates }: ExchangeRateComparisonProps) => {
  const getBestRate = (type: 'buy' | 'sell', bp: number, att: number) => {
    if (type === 'buy') {
      return bp > att ? 'bp' : att > bp ? 'att' : 'equal';
    } else {
      return bp < att ? 'bp' : att < bp ? 'att' : 'equal';
    }
  };

  const formatRate = (rate: number) => rate.toFixed(4);

  return (
    <Card className="bg-gradient-card backdrop-blur-sm border-0 shadow-card p-6">
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="h-6 w-6 text-financial-primary" />
        <h3 className="text-xl font-bold">Comparaison des Taux</h3>
      </div>

      <div className="space-y-6">
        {rates.map((rate) => (
          <div key={rate.currency} className="border rounded-lg p-4 bg-background/50">
            <h4 className="text-lg font-semibold mb-4 text-center">
              MAD/{rate.currency}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Taux d'achat */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-financial-success mb-2">Taux d'Achat</p>
                
                <div className="flex items-center justify-between p-2 rounded bg-financial-success/10">
                  <span className="text-sm">Bank Populaire</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">{formatRate(rate.bankPopulaire.buy)}</span>
                    {getBestRate('buy', rate.bankPopulaire.buy, rate.attijariwafa.buy) === 'bp' && (
                      <Badge className="bg-financial-success text-white text-xs">Meilleur</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className="flex items-center justify-between p-2 rounded bg-financial-success/10">
                  <span className="text-sm">Attijariwafa</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">{formatRate(rate.attijariwafa.buy)}</span>
                    {getBestRate('buy', rate.bankPopulaire.buy, rate.attijariwafa.buy) === 'att' && (
                      <Badge className="bg-financial-success text-white text-xs">Meilleur</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Taux de vente */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-financial-danger mb-2">Taux de Vente</p>
                
                <div className="flex items-center justify-between p-2 rounded bg-financial-danger/10">
                  <span className="text-sm">Bank Populaire</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">{formatRate(rate.bankPopulaire.sell)}</span>
                    {getBestRate('sell', rate.bankPopulaire.sell, rate.attijariwafa.sell) === 'bp' && (
                      <Badge className="bg-financial-danger text-white text-xs">Meilleur</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className="flex items-center justify-between p-2 rounded bg-financial-danger/10">
                  <span className="text-sm">Attijariwafa</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">{formatRate(rate.attijariwafa.sell)}</span>
                    {getBestRate('sell', rate.bankPopulaire.sell, rate.attijariwafa.sell) === 'att' && (
                      <Badge className="bg-financial-danger text-white text-xs">Meilleur</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};