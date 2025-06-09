
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { QuoteData } from '@/lib/market-data';

interface MarketDataPanelProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
  marketData: QuoteData | null;
  loading: boolean;
  onRefresh: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  useRealData: boolean;
  onUseRealDataChange: (use: boolean) => void;
}

const POPULAR_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'SPY', 'QQQ', 'NVDA', 'AMZN'];

export default function MarketDataPanel({
  selectedSymbol,
  onSymbolChange,
  marketData,
  loading,
  onRefresh,
  apiKey,
  onApiKeyChange,
  useRealData,
  onUseRealDataChange
}: MarketDataPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Market Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Symbol Selection */}
        <div>
          <Label htmlFor="symbol">Symbol</Label>
          <Select value={selectedSymbol} onValueChange={onSymbolChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POPULAR_SYMBOLS.map(symbol => (
                <SelectItem key={symbol} value={symbol}>
                  {symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* API Configuration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="use-real-data">Use Real Data</Label>
            <Switch
              id="use-real-data"
              checked={useRealData}
              onCheckedChange={onUseRealDataChange}
            />
          </div>
          
          {useRealData && (
            <div>
              <Label htmlFor="api-key">Alpha Vantage API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
              />
              <div className="text-xs text-gray-500 mt-1">
                Get free API key from{' '}
                <a 
                  href="https://www.alphavantage.co/support/#api-key" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Alpha Vantage
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Market Data Display */}
        {marketData && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-lg">{marketData.symbol}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">${marketData.price.toFixed(2)}</span>
                <div className="flex items-center gap-1">
                  {marketData.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    marketData.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {marketData.change >= 0 ? '+' : ''}{marketData.change.toFixed(2)} 
                    ({marketData.changePercent >= 0 ? '+' : ''}{marketData.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Open:</span>
                  <span>${marketData.open.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">High:</span>
                  <span>${marketData.high.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Low:</span>
                  <span>${marketData.low.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Volume:</span>
                  <span>{(marketData.volume / 1000000).toFixed(1)}M</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Last updated: {marketData.timestamp}</span>
                <Badge variant={useRealData ? 'default' : 'secondary'}>
                  {useRealData ? 'Live' : 'Demo'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {!marketData && !loading && (
          <div className="text-center py-4 text-gray-500">
            No market data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
