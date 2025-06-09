
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, DollarSign, Shield, Target } from 'lucide-react';
import { RiskMetrics, StrategyConfig } from '@/lib/types';

interface RiskAnalysisProps {
  riskMetrics: RiskMetrics;
  accountSize: number;
  onAccountSizeChange: (size: number) => void;
  riskPercentage: number;
  onRiskPercentageChange: (percentage: number) => void;
  recommendedPositionSize: number;
  strategy: StrategyConfig;
}

export default function RiskAnalysis({
  riskMetrics,
  accountSize,
  onAccountSizeChange,
  riskPercentage,
  onRiskPercentageChange,
  recommendedPositionSize,
  strategy
}: RiskAnalysisProps) {
  const maxRiskAmount = accountSize * (riskPercentage / 100);
  const currentRisk = Math.abs(riskMetrics.maxLoss);
  const riskUtilization = currentRisk > 0 ? (currentRisk / maxRiskAmount) * 100 : 0;

  const getRiskLevel = (utilization: number) => {
    if (utilization <= 50) return { level: 'Low', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (utilization <= 80) return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'High', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const riskLevel = getRiskLevel(riskUtilization);

  const kellyPercentage = riskMetrics.probabilityOfProfit > 50 
    ? ((riskMetrics.probabilityOfProfit / 100) - ((100 - riskMetrics.probabilityOfProfit) / 100) / riskMetrics.riskRewardRatio) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Position Sizing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Position Sizing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="account-size">Account Size ($)</Label>
              <Input
                id="account-size"
                type="number"
                value={accountSize}
                onChange={(e) => onAccountSizeChange(parseFloat(e.target.value) || 0)}
                step="1000"
              />
            </div>
            <div>
              <Label htmlFor="risk-percentage">Risk Percentage (%)</Label>
              <Input
                id="risk-percentage"
                type="number"
                value={riskPercentage}
                onChange={(e) => onRiskPercentageChange(parseFloat(e.target.value) || 0)}
                step="0.5"
                min="0.5"
                max="10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Max Risk Amount</div>
              <div className="text-xl font-bold">${maxRiskAmount.toLocaleString()}</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Current Risk</div>
              <div className="text-xl font-bold text-red-600">${currentRisk.toLocaleString()}</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Recommended Size</div>
              <div className="text-xl font-bold">{recommendedPositionSize} contract{recommendedPositionSize !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Risk Utilization</span>
            <Badge className={`${riskLevel.bgColor} ${riskLevel.color}`}>
              {riskLevel.level} Risk
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Risk Used</span>
              <span>{riskUtilization.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(riskUtilization, 100)} className="h-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Win Rate:</span>
                <span>{riskMetrics.probabilityOfProfit}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Risk/Reward:</span>
                <span>{riskMetrics.riskRewardRatio === Infinity ? '∞' : riskMetrics.riskRewardRatio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kelly %:</span>
                <span>{kellyPercentage > 0 ? kellyPercentage.toFixed(1) + '%' : 'N/A'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Days to Expiry:</span>
                <span>{strategy.daysToExpiration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Volatility:</span>
                <span>{strategy.volatility}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Breakevens:</span>
                <span>{riskMetrics.breakevens.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Strategy Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Profit Potential</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Max Profit:</span>
                  <span className="font-medium text-green-600">
                    {riskMetrics.maxProfit === Infinity ? 'Unlimited' : `$${riskMetrics.maxProfit.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Max Loss:</span>
                  <span className="font-medium text-red-600">
                    {riskMetrics.maxLoss === -Infinity ? 'Unlimited' : `$${Math.abs(riskMetrics.maxLoss).toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Profit Factor:</span>
                  <span className="font-medium">
                    {riskMetrics.maxLoss !== 0 ? (riskMetrics.maxProfit / Math.abs(riskMetrics.maxLoss)).toFixed(2) : '∞'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Risk Warnings</h4>
              <div className="space-y-2">
                {riskUtilization > 100 && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Position exceeds risk tolerance</span>
                  </div>
                )}
                {riskMetrics.maxLoss === -Infinity && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Unlimited loss potential</span>
                  </div>
                )}
                {strategy.daysToExpiration < 7 && (
                  <div className="flex items-center gap-2 text-yellow-600 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>High time decay risk</span>
                  </div>
                )}
                {riskMetrics.probabilityOfProfit < 40 && (
                  <div className="flex items-center gap-2 text-yellow-600 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Low probability of profit</span>
                  </div>
                )}
                {riskUtilization <= 50 && riskMetrics.probabilityOfProfit >= 50 && strategy.daysToExpiration >= 7 && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <Shield className="h-4 w-4" />
                    <span>Well-balanced risk profile</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Breakeven Analysis */}
          {riskMetrics.breakevens.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Breakeven Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {riskMetrics.breakevens.map((breakeven, index) => {
                  const distance = Math.abs(breakeven - strategy.underlyingPrice);
                  const percentage = (distance / strategy.underlyingPrice) * 100;
                  return (
                    <div key={index} className="flex justify-between">
                      <span>Breakeven {index + 1}:</span>
                      <span>
                        ${breakeven.toFixed(2)} ({percentage.toFixed(1)}% away)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
