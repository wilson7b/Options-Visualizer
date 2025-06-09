
export interface OptionContract {
  id: string;
  type: 'call' | 'put';
  strike: number;
  premium: number;
  quantity: number;
  position: 'long' | 'short';
  expiration: string;
  underlying: string;
}

export interface StrategyConfig {
  name: string;
  description: string;
  contracts: OptionContract[];
  underlyingPrice: number;
  riskFreeRate: number;
  volatility: number;
  daysToExpiration: number;
}

export interface ProfitLossPoint {
  price: number;
  profit: number;
  breakeven?: boolean;
}

export interface Greeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  contracts: Omit<OptionContract, 'id' | 'underlying'>[];
}

export interface RiskMetrics {
  maxProfit: number;
  maxLoss: number;
  breakevens: number[];
  probabilityOfProfit: number;
  riskRewardRatio: number;
}
