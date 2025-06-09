
export interface AlphaVantageConfig {
  apiKey: string;
  baseUrl: string;
}

export interface QuoteData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: string;
}

export class MarketDataService {
  private config: AlphaVantageConfig;
  
  constructor(apiKey: string) {
    this.config = {
      apiKey,
      baseUrl: 'https://www.alphavantage.co/query'
    };
  }
  
  async getQuote(symbol: string): Promise<QuoteData | null> {
    try {
      const url = `${this.config.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.config.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data['Error Message'] || data['Note']) {
        throw new Error(data['Error Message'] || data['Note']);
      }
      
      const quote = data['Global Quote'];
      
      if (!quote) {
        throw new Error('No quote data available');
      }
      
      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        open: parseFloat(quote['02. open']),
        previousClose: parseFloat(quote['08. previous close']),
        timestamp: quote['07. latest trading day']
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      return null;
    }
  }
  
  async getHistoricalData(symbol: string, period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<any> {
    try {
      const functionMap = {
        daily: 'TIME_SERIES_DAILY',
        weekly: 'TIME_SERIES_WEEKLY',
        monthly: 'TIME_SERIES_MONTHLY'
      };
      
      const url = `${this.config.baseUrl}?function=${functionMap[period]}&symbol=${symbol}&apikey=${this.config.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data['Error Message'] || data['Note']) {
        throw new Error(data['Error Message'] || data['Note']);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return null;
    }
  }
  
  // Calculate implied volatility from historical data
  calculateHistoricalVolatility(prices: number[], period: number = 30): number {
    if (prices.length < 2) return 0.2; // Default 20% volatility
    
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / (returns.length - 1);
    const dailyVolatility = Math.sqrt(variance);
    
    // Annualize the volatility
    return dailyVolatility * Math.sqrt(252) * 100; // 252 trading days per year
  }
}

// Mock data for demo purposes when API is not available
export const MOCK_QUOTES: Record<string, QuoteData> = {
  'AAPL': {
    symbol: 'AAPL',
    price: 175.50,
    change: 2.30,
    changePercent: 1.33,
    volume: 45678900,
    high: 176.80,
    low: 173.20,
    open: 174.00,
    previousClose: 173.20,
    timestamp: '2024-06-09'
  },
  'MSFT': {
    symbol: 'MSFT',
    price: 420.15,
    change: -3.85,
    changePercent: -0.91,
    volume: 23456789,
    high: 425.00,
    low: 418.50,
    open: 424.00,
    previousClose: 424.00,
    timestamp: '2024-06-09'
  },
  'GOOGL': {
    symbol: 'GOOGL',
    price: 2750.80,
    change: 15.60,
    changePercent: 0.57,
    volume: 1234567,
    high: 2760.00,
    low: 2735.00,
    open: 2740.00,
    previousClose: 2735.20,
    timestamp: '2024-06-09'
  },
  'TSLA': {
    symbol: 'TSLA',
    price: 185.25,
    change: -8.75,
    changePercent: -4.51,
    volume: 67890123,
    high: 195.00,
    low: 183.50,
    open: 194.00,
    previousClose: 194.00,
    timestamp: '2024-06-09'
  },
  'SPY': {
    symbol: 'SPY',
    price: 525.40,
    change: 1.20,
    changePercent: 0.23,
    volume: 89012345,
    high: 526.50,
    low: 523.80,
    open: 524.20,
    previousClose: 524.20,
    timestamp: '2024-06-09'
  }
};

export function getMockQuote(symbol: string): QuoteData | null {
  return MOCK_QUOTES[symbol.toUpperCase()] || null;
}
