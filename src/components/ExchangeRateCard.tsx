import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react";

interface ExchangeRate {
  currency: string;
  buyRate: number;
  sellRate: number;
  change?: number;
  changePercent?: number;
}

interface ExchangeRateCardProps {
  bankName: string;
  rates: ExchangeRate[];
  lastUpdated: string;
  isLoading?: boolean;
}

export const ExchangeRateCard = ({ bankName, rates, lastUpdated, isLoading }: ExchangeRateCardProps) => {
  const formatRate = (rate: number) => rate.toFixed(4);
  
  const getChangeColor = (change?: number) => {
    if (!change) return "financial-neutral";
    return change > 0 ? "financial-success" : "financial-danger";
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return <TrendingUp className="h-4 w-4" />;
    return change > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  return (
    <Card className="bg-gradient-card backdrop-blur-sm border-0 shadow-card hover:shadow-hover transition-all duration-300 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-foreground">{bankName}</h3>
        <Badge variant="secondary" className="bg-financial-primary/10 text-financial-primary border-0">
          {isLoading ? "Mise à jour..." : "En ligne"}
        </Badge>
      </div>
      
      <div className="space-y-4">
        {rates.map((rate) => (
          <div key={rate.currency} className="border-l-4 border-financial-primary pl-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">MAD/{rate.currency}</span>
                {rate.change !== undefined && (
                  <div className={`flex items-center space-x-1 text-${getChangeColor(rate.change)}`}>
                    {getChangeIcon(rate.change)}
                    <span className="text-sm font-medium">
                      {rate.changePercent?.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-financial-success/10 rounded-lg p-3">
                <p className="text-sm text-muted-foreground mb-1">Achat</p>
                <p className="text-lg font-bold text-financial-success">
                  {formatRate(rate.buyRate)}
                </p>
              </div>
              
              <div className="bg-financial-danger/10 rounded-lg p-3">
                <p className="text-sm text-muted-foreground mb-1">Vente</p>
                <p className="text-lg font-bold text-financial-danger">
                  {formatRate(rate.sellRate)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Dernière mise à jour: {lastUpdated}
        </p>
      </div>
    </Card>
  );
};