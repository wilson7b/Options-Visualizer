
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Calculator, Target, AlertTriangle, DollarSign } from 'lucide-react';
import { OptionContract, StrategyConfig, ProfitLossPoint, RiskMetrics } from '@/lib/types';
import { STRATEGY_TEMPLATES, calculateProfitLoss, findBreakevens, calculateRiskMetrics, calculatePositionGreeks, calculatePositionSize } from '@/lib/options-strategies';
import { MarketDataService, getMockQuote, QuoteData } from '@/lib/market-data';
import ProfitLossChart from './profit-loss-chart';
import GreeksDisplay from './greeks-display';
import ContractBuilder from './contract-builder';
import MarketDataPanel from './market-data-panel';
import RiskAnalysis from './risk-analysis';

export default function OptionsVisualizer() {
  const [strategy, setStrategy] = useState<StrategyConfig>({
    name: 'Custom Strategy',
    description: 'Build your own options strategy',
    contracts: [],
    underlyingPrice: 100,
    riskFreeRate: 5.0,
    volatility: 25.0,
    daysToExpiration: 30
  });

  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [marketData, setMarketData] = useState<QuoteData | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [useRealData, setUseRealData] = useState(false);
  const [loading, setLoading] = useState(false);

  // Position sizing parameters
  const [accountSize, setAccountSize] = useState(10000);
  const [riskPercentage, setRiskPercentage] = useState(2);

  // Calculate profit/loss data
  const profitLossData = useMemo(() => {
    if (strategy.contracts.length === 0) return [];
    
    const priceRange = {
      min: strategy.underlyingPrice * 0.7,
      max: strategy.underlyingPrice * 1.3,
      steps: 100
    };
    
    return calculateProfitLoss(strategy.contracts, strategy.underlyingPrice, priceRange);
  }, [strategy]);

  // Calculate breakevens and risk metrics
  const breakevens = useMemo(() => findBreakevens(profitLossData), [profitLossData]);
  const riskMetrics = useMemo(() => calculateRiskMetrics(profitLossData, breakevens), [profitLossData, breakevens]);

  // Calculate Greeks
  const positionGreeks = useMemo(() => {
    if (strategy.contracts.length === 0) return null;
    
    return calculatePositionGreeks(
      strategy.contracts,
      strategy.underlyingPrice,
      strategy.riskFreeRate,
      strategy.volatility,
      strategy.daysToExpiration
    );
  }, [strategy]);

  // Calculate position size
  const recommendedPositionSize = useMemo(() => {
    return calculatePositionSize(accountSize, riskPercentage, riskMetrics.maxLoss);
  }, [accountSize, riskPercentage, riskMetrics.maxLoss]);

  // Load strategy template
  const loadTemplate = (templateId: string) => {
    const template = STRATEGY_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const contracts: OptionContract[] = template.contracts.map((contract, index) => ({
      ...contract,
      id: `contract-${index}`,
      underlying: selectedSymbol
    }));

    setStrategy({
      ...strategy,
      name: template.name,
      description: template.description,
      contracts
    });
  };

  // Fetch market data
  const fetchMarketData = async () => {
    setLoading(true);
    try {
      if (useRealData && apiKey) {
        const service = new MarketDataService(apiKey);
        const quote = await service.getQuote(selectedSymbol);
        if (quote) {
          setMarketData(quote);
          setStrategy(prev => ({ ...prev, underlyingPrice: quote.price }));
        } else {
          throw new Error('Failed to fetch real data');
        }
      } else {
        const mockQuote = getMockQuote(selectedSymbol);
        if (mockQuote) {
          setMarketData(mockQuote);
          setStrategy(prev => ({ ...prev, underlyingPrice: mockQuote.price }));
        }
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
      // Fallback to mock data
      const mockQuote = getMockQuote(selectedSymbol);
      if (mockQuote) {
        setMarketData(mockQuote);
        setStrategy(prev => ({ ...prev, underlyingPrice: mockQuote.price }));
      }
    } finally {
      setLoading(false);
    }
  };

  // Load initial market data
  useEffect(() => {
    fetchMarketData();
  }, [selectedSymbol]);

  const addContract = (contract: Omit<OptionContract, 'id'>) => {
    const newContract: OptionContract = {
      ...contract,
      id: `contract-${Date.now()}`,
      underlying: selectedSymbol
    };
    
    setStrategy(prev => ({
      ...prev,
      contracts: [...prev.contracts, newContract]
    }));
  };

  const removeContract = (contractId: string) => {
    setStrategy(prev => ({
      ...prev,
      contracts: prev.contracts.filter(c => c.id !== contractId)
    }));
  };

  const updateContract = (contractId: string, updates: Partial<OptionContract>) => {
    setStrategy(prev => ({
      ...prev,
      contracts: prev.contracts.map(c => 
        c.id === contractId ? { ...c, ...updates } : c
      )
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Options Trading Visualizer</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analyze options strategies with interactive profit/loss charts, Greeks calculations, and risk management tools
          </p>
        </div>

        {/* Market Data and Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MarketDataPanel
            selectedSymbol={selectedSymbol}
            onSymbolChange={setSelectedSymbol}
            marketData={marketData}
            loading={loading}
            onRefresh={fetchMarketData}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            useRealData={useRealData}
            onUseRealDataChange={setUseRealData}
          />

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Strategy Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="underlying-price">Underlying Price</Label>
                  <Input
                    id="underlying-price"
                    type="number"
                    value={strategy.underlyingPrice}
                    onChange={(e) => setStrategy(prev => ({ 
                      ...prev, 
                      underlyingPrice: parseFloat(e.target.value) || 0 
                    }))}
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="volatility">Volatility (%)</Label>
                  <Input
                    id="volatility"
                    type="number"
                    value={strategy.volatility}
                    onChange={(e) => setStrategy(prev => ({ 
                      ...prev, 
                      volatility: parseFloat(e.target.value) || 0 
                    }))}
                    step="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="risk-free-rate">Risk-Free Rate (%)</Label>
                  <Input
                    id="risk-free-rate"
                    type="number"
                    value={strategy.riskFreeRate}
                    onChange={(e) => setStrategy(prev => ({ 
                      ...prev, 
                      riskFreeRate: parseFloat(e.target.value) || 0 
                    }))}
                    step="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="days-to-expiration">Days to Expiration</Label>
                  <Input
                    id="days-to-expiration"
                    type="number"
                    value={strategy.daysToExpiration}
                    onChange={(e) => setStrategy(prev => ({ 
                      ...prev, 
                      daysToExpiration: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="builder" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="builder">Strategy Builder</TabsTrigger>
            <TabsTrigger value="analysis">P&L Analysis</TabsTrigger>
            <TabsTrigger value="greeks">Greeks</TabsTrigger>
            <TabsTrigger value="risk">Risk Management</TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strategy Templates */}
              <Card>
                <CardHeader>
                  <CardTitle>Strategy Templates</CardTitle>
                  <CardDescription>
                    Choose from pre-built options strategies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {STRATEGY_TEMPLATES.map((template) => (
                      <Button
                        key={template.id}
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={() => loadTemplate(template.id)}
                      >
                        <div className="text-left">
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-500">{template.description}</div>
                          <Badge variant="secondary" className="mt-1">
                            {template.category}
                          </Badge>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contract Builder */}
              <ContractBuilder
                onAddContract={addContract}
                underlyingPrice={strategy.underlyingPrice}
              />
            </div>

            {/* Current Strategy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Strategy: {strategy.name}</span>
                  <Badge variant="outline">
                    {strategy.contracts.length} Contract{strategy.contracts.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
                <CardDescription>{strategy.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {strategy.contracts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No contracts added. Use the strategy templates or contract builder to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {strategy.contracts.map((contract) => (
                      <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Badge variant={contract.position === 'long' ? 'default' : 'destructive'}>
                            {contract.position.toUpperCase()}
                          </Badge>
                          <div>
                            <div className="font-medium">
                              {contract.quantity} x {contract.type.toUpperCase()} ${contract.strike}
                            </div>
                            <div className="text-sm text-gray-500">
                              Premium: ${contract.premium} | Expires: {contract.expiration}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeContract(contract.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProfitLossChart
                  data={profitLossData}
                  breakevens={breakevens}
                  currentPrice={strategy.underlyingPrice}
                />
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Key Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Max Profit:</span>
                      <span className={`font-medium ${riskMetrics.maxProfit > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                        {riskMetrics.maxProfit === Infinity ? 'Unlimited' : `$${riskMetrics.maxProfit.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Max Loss:</span>
                      <span className={`font-medium ${riskMetrics.maxLoss < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {riskMetrics.maxLoss === -Infinity ? 'Unlimited' : `$${riskMetrics.maxLoss.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Risk/Reward:</span>
                      <span className="font-medium">
                        {riskMetrics.riskRewardRatio === Infinity ? '∞' : riskMetrics.riskRewardRatio.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Profit Probability:</span>
                      <span className="font-medium">{riskMetrics.probabilityOfProfit}%</span>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Breakeven Points:</div>
                      {breakevens.length === 0 ? (
                        <span className="text-sm text-gray-500">None</span>
                      ) : (
                        <div className="space-y-1">
                          {breakevens.map((breakeven, index) => (
                            <div key={index} className="text-sm font-medium">
                              ${breakeven.toFixed(2)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="greeks">
            <GreeksDisplay
              greeks={positionGreeks}
              contracts={strategy.contracts}
              underlyingPrice={strategy.underlyingPrice}
              riskFreeRate={strategy.riskFreeRate}
              volatility={strategy.volatility}
              daysToExpiration={strategy.daysToExpiration}
            />
          </TabsContent>

          <TabsContent value="risk">
            <RiskAnalysis
              riskMetrics={riskMetrics}
              accountSize={accountSize}
              onAccountSizeChange={setAccountSize}
              riskPercentage={riskPercentage}
              onRiskPercentageChange={setRiskPercentage}
              recommendedPositionSize={recommendedPositionSize}
              strategy={strategy}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
