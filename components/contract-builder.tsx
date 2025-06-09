
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { OptionContract } from '@/lib/types';

interface ContractBuilderProps {
  onAddContract: (contract: Omit<OptionContract, 'id'>) => void;
  underlyingPrice: number;
}

export default function ContractBuilder({ onAddContract, underlyingPrice }: ContractBuilderProps) {
  const [contract, setContract] = useState({
    type: 'call' as 'call' | 'put',
    strike: underlyingPrice,
    premium: 5,
    quantity: 1,
    position: 'long' as 'long' | 'short',
    expiration: '2024-12-31'
  });

  const handleAddContract = () => {
    onAddContract({
      ...contract,
      underlying: 'STOCK'
    });
  };

  const suggestedStrikes = [
    underlyingPrice * 0.9,
    underlyingPrice * 0.95,
    underlyingPrice,
    underlyingPrice * 1.05,
    underlyingPrice * 1.1
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Contract
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contract-type">Type</Label>
            <Select
              value={contract.type}
              onValueChange={(value: 'call' | 'put') => 
                setContract(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="put">Put</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="contract-position">Position</Label>
            <Select
              value={contract.position}
              onValueChange={(value: 'long' | 'short') => 
                setContract(prev => ({ ...prev, position: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="long">Long (Buy)</SelectItem>
                <SelectItem value="short">Short (Sell)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="strike-price">Strike Price</Label>
            <Input
              id="strike-price"
              type="number"
              value={contract.strike}
              onChange={(e) => setContract(prev => ({ 
                ...prev, 
                strike: parseFloat(e.target.value) || 0 
              }))}
              step="0.50"
            />
            <div className="mt-1 text-xs text-gray-500">
              Suggested: {suggestedStrikes.map(s => `$${s.toFixed(2)}`).join(', ')}
            </div>
          </div>

          <div>
            <Label htmlFor="premium">Premium</Label>
            <Input
              id="premium"
              type="number"
              value={contract.premium}
              onChange={(e) => setContract(prev => ({ 
                ...prev, 
                premium: parseFloat(e.target.value) || 0 
              }))}
              step="0.01"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={contract.quantity}
              onChange={(e) => setContract(prev => ({ 
                ...prev, 
                quantity: parseInt(e.target.value) || 1 
              }))}
              min="1"
            />
          </div>

          <div>
            <Label htmlFor="expiration">Expiration</Label>
            <Input
              id="expiration"
              type="date"
              value={contract.expiration}
              onChange={(e) => setContract(prev => ({ 
                ...prev, 
                expiration: e.target.value 
              }))}
            />
          </div>
        </div>

        <Button onClick={handleAddContract} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Contract
        </Button>
      </CardContent>
    </Card>
  );
}
