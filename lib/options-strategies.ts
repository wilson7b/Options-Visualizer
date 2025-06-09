
import { OptionContract, StrategyTemplate, ProfitLossPoint, RiskMetrics } from './types';
import { blackScholesCall, blackScholesPut, calculateGreeks } from './black-scholes';

export const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  {
    id: 'long-call',
    name: 'Long Call',
    description: 'Bullish strategy with unlimited upside potential',
    category: 'Basic',
    contracts: [{
      type: 'call',
      strike: 100,
      premium: 5,
      quantity: 1,
      position: 'long',
      expiration: '2024-12-31'
    }]
  },
  {
    id: 'long-put',
    name: 'Long Put',
    description: 'Bearish strategy with high profit potential',
    category: 'Basic',
    contracts: [{
      type: 'put',
      strike: 100,
      premium: 5,
      quantity: 1,
      position: 'long',
      expiration: '2024-12-31'
    }]
  },
  {
    id: 'covered-call',
    name: 'Covered Call',
    description: 'Income strategy for stock owners',
    category: 'Income',
    contracts: [{
      type: 'call',
      strike: 105,
      premium: 3,
      quantity: 1,
      position: 'short',
      expiration: '2024-12-31'
    }]
  },
  {
    id: 'protective-put',
    name: 'Protective Put',
    description: 'Insurance for stock positions',
    category: 'Hedging',
    contracts: [{
      type: 'put',
      strike: 95,
      premium: 4,
      quantity: 1,
      position: 'long',
      expiration: '2024-12-31'
    }]
  },
  {
    id: 'bull-call-spread',
    name: 'Bull Call Spread',
    description: 'Limited risk, limited reward bullish strategy',
    category: 'Spreads',
    contracts: [
      {
        type: 'call',
        strike: 100,
        premium: 5,
        quantity: 1,
        position: 'long',
        expiration: '2024-12-31'
      },
      {
        type: 'call',
        strike: 110,
        premium: 2,
        quantity: 1,
        position: 'short',
        expiration: '2024-12-31'
      }
    ]
  },
  {
    id: 'bear-put-spread',
    name: 'Bear Put Spread',
    description: 'Limited risk, limited reward bearish strategy',
    category: 'Spreads',
    contracts: [
      {
        type: 'put',
        strike: 100,
        premium: 5,
        quantity: 1,
        position: 'long',
        expiration: '2024-12-31'
      },
      {
        type: 'put',
        strike: 90,
        premium: 2,
        quantity: 1,
        position: 'short',
        expiration: '2024-12-31'
      }
    ]
  },
  {
    id: 'long-straddle',
    name: 'Long Straddle',
    description: 'Profit from high volatility in either direction',
    category: 'Volatility',
    contracts: [
      {
        type: 'call',
        strike: 100,
        premium: 5,
        quantity: 1,
        position: 'long',
        expiration: '2024-12-31'
      },
      {
        type: 'put',
        strike: 100,
        premium: 5,
        quantity: 1,
        position: 'long',
        expiration: '2024-12-31'
      }
    ]
  },
  {
    id: 'long-strangle',
    name: 'Long Strangle',
    description: 'Lower cost volatility play with wider breakevens',
    category: 'Volatility',
    contracts: [
      {
        type: 'call',
        strike: 105,
        premium: 3,
        quantity: 1,
        position: 'long',
        expiration: '2024-12-31'
      },
      {
        type: 'put',
        strike: 95,
        premium: 3,
        quantity: 1,
        position: 'long',
        expiration: '2024-12-31'
      }
    ]
  },
  {
    id: 'iron-condor',
    name: 'Iron Condor',
    description: 'Profit from low volatility with defined risk',
    category: 'Advanced',
    contracts: [
      {
        type: 'put',
        strike: 90,
        premium: 1,
        quantity: 1,
        position: 'long',
        expiration: '2024-12-31'
      },
      {
        type: 'put',
        strike: 95,
        premium: 3,
        quantity: 1,
        position: 'short',
        expiration: '2024-12-31'
      },
      {
        type: 'call',
        strike: 105,
        premium: 3,
        quantity: 1,
        position: 'short',
        expiration: '2024-12-31'
      },
      {
        type: 'call',
        strike: 110,
        premium: 1,
        quantity: 1,
        position: 'long',
        expiration: '2024-12-31'
      }
    ]
  }
];

export function calculateProfitLoss(
  contracts: OptionContract[],
  underlyingPrice: number,
  priceRange: { min: number; max: number; steps: number }
): ProfitLossPoint[] {
  const points: ProfitLossPoint[] = [];
  const step = (priceRange.max - priceRange.min) / priceRange.steps;
  
  for (let i = 0; i <= priceRange.steps; i++) {
    const price = priceRange.min + (i * step);
    let totalProfit = 0;
    
    contracts.forEach(contract => {
      let intrinsicValue = 0;
      
      if (contract.type === 'call') {
        intrinsicValue = Math.max(price - contract.strike, 0);
      } else {
        intrinsicValue = Math.max(contract.strike - price, 0);
      }
      
      const contractProfit = contract.position === 'long' 
        ? (intrinsicValue - contract.premium) * contract.quantity * 100
        : (contract.premium - intrinsicValue) * contract.quantity * 100;
      
      totalProfit += contractProfit;
    });
    
    points.push({ price, profit: totalProfit });
  }
  
  return points;
}

export function findBreakevens(profitLossPoints: ProfitLossPoint[]): number[] {
  const breakevens: number[] = [];
  
  for (let i = 1; i < profitLossPoints.length; i++) {
    const prev = profitLossPoints[i - 1];
    const curr = profitLossPoints[i];
    
    // Check if profit crosses zero
    if ((prev.profit <= 0 && curr.profit > 0) || (prev.profit > 0 && curr.profit <= 0)) {
      // Linear interpolation to find exact breakeven
      const ratio = Math.abs(prev.profit) / (Math.abs(prev.profit) + Math.abs(curr.profit));
      const breakeven = prev.price + ratio * (curr.price - prev.price);
      breakevens.push(Number(breakeven.toFixed(2)));
    }
  }
  
  return breakevens;
}

export function calculateRiskMetrics(
  profitLossPoints: ProfitLossPoint[],
  breakevens: number[]
): RiskMetrics {
  const profits = profitLossPoints.map(p => p.profit);
  const maxProfit = Math.max(...profits);
  const maxLoss = Math.min(...profits);
  
  // Calculate probability of profit (simplified - assumes normal distribution)
  const profitablePoints = profitLossPoints.filter(p => p.profit > 0).length;
  const probabilityOfProfit = (profitablePoints / profitLossPoints.length) * 100;
  
  const riskRewardRatio = maxLoss !== 0 ? Math.abs(maxProfit / maxLoss) : Infinity;
  
  return {
    maxProfit: Number(maxProfit.toFixed(2)),
    maxLoss: Number(maxLoss.toFixed(2)),
    breakevens,
    probabilityOfProfit: Number(probabilityOfProfit.toFixed(1)),
    riskRewardRatio: Number(riskRewardRatio.toFixed(2))
  };
}

export function calculatePositionGreeks(
  contracts: OptionContract[],
  underlyingPrice: number,
  riskFreeRate: number,
  volatility: number,
  daysToExpiration: number
) {
  let totalDelta = 0;
  let totalGamma = 0;
  let totalTheta = 0;
  let totalVega = 0;
  let totalRho = 0;
  
  const timeToExpiration = daysToExpiration / 365;
  
  contracts.forEach(contract => {
    const greeks = calculateGreeks({
      S: underlyingPrice,
      K: contract.strike,
      T: timeToExpiration,
      r: riskFreeRate / 100,
      sigma: volatility / 100
    }, contract.type);
    
    const multiplier = contract.position === 'long' ? 1 : -1;
    const quantity = contract.quantity * multiplier;
    
    totalDelta += greeks.delta * quantity;
    totalGamma += greeks.gamma * quantity;
    totalTheta += greeks.theta * quantity;
    totalVega += greeks.vega * quantity;
    totalRho += greeks.rho * quantity;
  });
  
  return {
    delta: Number(totalDelta.toFixed(4)),
    gamma: Number(totalGamma.toFixed(4)),
    theta: Number(totalTheta.toFixed(4)),
    vega: Number(totalVega.toFixed(4)),
    rho: Number(totalRho.toFixed(4))
  };
}

export function calculatePositionSize(
  accountSize: number,
  riskPercentage: number,
  maxLoss: number
): number {
  if (maxLoss >= 0) return 0; // No risk, no position sizing needed
  
  const riskAmount = accountSize * (riskPercentage / 100);
  const positionSize = Math.floor(riskAmount / Math.abs(maxLoss));
  
  return Math.max(positionSize, 1);
}
