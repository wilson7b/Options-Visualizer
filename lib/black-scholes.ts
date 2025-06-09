
// Black-Scholes Option Pricing Model Implementation

// Standard normal cumulative distribution function
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2.0);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

// Standard normal probability density function
function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

export interface BlackScholesParams {
  S: number; // Current stock price
  K: number; // Strike price
  T: number; // Time to expiration (in years)
  r: number; // Risk-free rate
  sigma: number; // Volatility
}

export function blackScholesCall(params: BlackScholesParams): number {
  const { S, K, T, r, sigma } = params;
  
  if (T <= 0) return Math.max(S - K, 0);
  
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  
  return S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
}

export function blackScholesPut(params: BlackScholesParams): number {
  const { S, K, T, r, sigma } = params;
  
  if (T <= 0) return Math.max(K - S, 0);
  
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  
  return K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
}

export function calculateGreeks(params: BlackScholesParams, optionType: 'call' | 'put') {
  const { S, K, T, r, sigma } = params;
  
  if (T <= 0) {
    return {
      delta: 0,
      gamma: 0,
      theta: 0,
      vega: 0,
      rho: 0
    };
  }
  
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  
  const nd1 = normalCDF(d1);
  const nd2 = normalCDF(d2);
  const npd1 = normalPDF(d1);
  
  let delta: number;
  let rho: number;
  
  if (optionType === 'call') {
    delta = nd1;
    rho = K * T * Math.exp(-r * T) * nd2 / 100;
  } else {
    delta = nd1 - 1;
    rho = -K * T * Math.exp(-r * T) * normalCDF(-d2) / 100;
  }
  
  const gamma = npd1 / (S * sigma * Math.sqrt(T));
  const theta = (-S * npd1 * sigma / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * 
    (optionType === 'call' ? nd2 : normalCDF(-d2))) / 365;
  const vega = S * npd1 * Math.sqrt(T) / 100;
  
  return {
    delta: Number(delta.toFixed(4)),
    gamma: Number(gamma.toFixed(4)),
    theta: Number(theta.toFixed(4)),
    vega: Number(vega.toFixed(4)),
    rho: Number(rho.toFixed(4))
  };
}

export function calculateImpliedVolatility(
  marketPrice: number,
  params: Omit<BlackScholesParams, 'sigma'>,
  optionType: 'call' | 'put'
): number {
  let sigma = 0.2; // Initial guess
  const tolerance = 0.0001;
  const maxIterations = 100;
  
  for (let i = 0; i < maxIterations; i++) {
    const price = optionType === 'call' 
      ? blackScholesCall({ ...params, sigma })
      : blackScholesPut({ ...params, sigma });
    
    const vega = calculateGreeks({ ...params, sigma }, optionType).vega * 100;
    
    if (Math.abs(price - marketPrice) < tolerance || vega === 0) {
      break;
    }
    
    sigma = sigma - (price - marketPrice) / vega;
    
    // Ensure sigma stays positive
    if (sigma <= 0) sigma = 0.01;
  }
  
  return Math.max(sigma, 0.01);
}
