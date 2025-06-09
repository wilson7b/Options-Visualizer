
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Activity, Zap, Clock } from 'lucide-react';
import { Greeks, OptionContract } from '@/lib/types';
import { calculateGreeks } from '@/lib/black-scholes';

interface GreeksDisplayProps {
  greeks: Greeks | null;
  contracts: OptionContract[];
  underlyingPrice: number;
  riskFreeRate: number;
  volatility: number;
  daysToExpiration: number;
}

export default function GreeksDisplay({
  greeks,
  contracts,
  underlyingPrice,
  riskFreeRate,
  volatility,
  daysToExpiration
}: GreeksDisplayProps) {
  if (!greeks || contracts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Greeks Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Add contracts to see Greeks analysis
          </div>
        </CardContent>
      </Card>
    );
  }

  const timeToExpiration = daysToExpiration / 365;

  // Calculate individual contract Greeks for detailed view
  const contractGreeks = contracts.map(contract => {
    const individualGreeks = calculateGreeks({
      S: underlyingPrice,
      K: contract.strike,
      T: timeToExpiration,
      r: riskFreeRate / 100,
      sigma: volatility / 100
    }, contract.type);

    const multiplier = contract.position === 'long' ? 1 : -1;
    const quantity = contract.quantity * multiplier;

    return {
      contract,
      greeks: {
        delta: individualGreeks.delta * quantity,
        gamma: individualGreeks.gamma * quantity,
        theta: individualGreeks.theta * quantity,
        vega: individualGreeks.vega * quantity,
        rho: individualGreeks.rho * quantity
      }
    };
  });

  const getGreekColor = (value: number, type: string) => {
    if (type === 'theta') {
      return value < 0 ? 'text-red-600' : 'text-green-600';
    }
    return value > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGreekIcon = (type: string) => {
    switch (type) {
      case 'delta':
        return <TrendingUp className="h-4 w-4" />;
      case 'gamma':
        return <Activity className="h-4 w-4" />;
      case 'theta':
        return <Clock className="h-4 w-4" />;
      case 'vega':
        return <Zap className="h-4 w-4" />;
      case 'rho':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getGreekDescription = (type: string) => {
    switch (type) {
      case 'delta':
        return 'Price sensitivity to underlying movement';
      case 'gamma':
        return 'Rate of change of delta';
      case 'theta':
        return 'Time decay (daily P&L change)';
      case 'vega':
        return 'Volatility sensitivity';
      case 'rho':
        return 'Interest rate sensitivity';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Greeks Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Portfolio Greeks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {Object.entries(greeks).map(([greek, value]) => (
              <div key={greek} className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  {getGreekIcon(greek)}
                  <span className="font-medium capitalize">{greek}</span>
                </div>
                <div className={`text-2xl font-bold ${getGreekColor(value, greek)}`}>
                  {value.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500">
                  {getGreekDescription(greek)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual Contract Greeks */}
      <Card>
        <CardHeader>
          <CardTitle>Contract-Level Greeks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contractGreeks.map(({ contract, greeks: contractGreek }, index) => (
              <div key={contract.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={contract.position === 'long' ? 'default' : 'destructive'}>
                      {contract.position.toUpperCase()}
                    </Badge>
                    <span className="font-medium">
                      {contract.quantity} x {contract.type.toUpperCase()} ${contract.strike}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Premium: ${contract.premium}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  {Object.entries(contractGreek).map(([greek, value]) => (
                    <div key={greek} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{greek}:</span>
                      <span className={`font-medium ${getGreekColor(value, greek)}`}>
                        {value.toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Greeks Interpretation */}
      <Card>
        <CardHeader>
          <CardTitle>Greeks Interpretation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Risk Exposure</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Directional Risk (Delta):</span>
                  <span className={getGreekColor(greeks.delta, 'delta')}>
                    {Math.abs(greeks.delta) > 0.5 ? 'High' : Math.abs(greeks.delta) > 0.2 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Volatility Risk (Vega):</span>
                  <span className={getGreekColor(greeks.vega, 'vega')}>
                    {Math.abs(greeks.vega) > 10 ? 'High' : Math.abs(greeks.vega) > 5 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time Decay (Theta):</span>
                  <span className={getGreekColor(greeks.theta, 'theta')}>
                    {Math.abs(greeks.theta) > 10 ? 'High' : Math.abs(greeks.theta) > 5 ? 'Medium' : 'Low'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Position Characteristics</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Delta:</strong> For every $1 move in the underlying, 
                  the position will change by approximately ${Math.abs(greeks.delta).toFixed(2)}
                </div>
                <div>
                  <strong>Theta:</strong> The position loses approximately 
                  ${Math.abs(greeks.theta).toFixed(2)} per day due to time decay
                </div>
                <div>
                  <strong>Vega:</strong> For every 1% change in volatility, 
                  the position will change by approximately ${Math.abs(greeks.vega).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
