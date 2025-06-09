
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { ProfitLossPoint } from '@/lib/types';
import dynamic from 'next/dynamic';

const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), {
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center">Loading chart...</div>
});

// Register Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ProfitLossChartProps {
  data: ProfitLossPoint[];
  breakevens: number[];
  currentPrice: number;
}

export default function ProfitLossChart({ data, breakevens, currentPrice }: ProfitLossChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Profit/Loss Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-gray-500">
            Add contracts to see profit/loss visualization
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: data.map(point => point.price.toFixed(2)),
    datasets: [
      {
        label: 'Profit/Loss',
        data: data.map(point => point.profit),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          
          if (!chartArea) return null;
          
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.1)');
          gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
          gradient.addColorStop(1, 'rgba(34, 197, 94, 0.1)');
          
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        borderWidth: 3
      },
      {
        label: 'Zero Line',
        data: data.map(() => 0),
        borderColor: 'rgba(107, 114, 128, 0.5)',
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            if (context.datasetIndex === 0) {
              const value = context.parsed.y;
              return `P&L: $${value.toLocaleString()}`;
            }
            return undefined;
          },
          afterLabel: function(context: any) {
            if (context.datasetIndex === 0) {
              const price = parseFloat(context.label);
              const isBreakeven = breakevens.some(be => Math.abs(be - price) < 0.5);
              if (isBreakeven) {
                return 'Breakeven Point';
              }
            }
            return undefined;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Underlying Price ($)'
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Profit/Loss ($)'
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    },
    elements: {
      point: {
        hoverBackgroundColor: 'rgb(59, 130, 246)',
        hoverBorderColor: 'white',
        hoverBorderWidth: 2
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Profit/Loss Chart
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 relative">
          <Line data={chartData} options={options} />
        </div>
        
        {/* Chart annotations */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Profit/Loss</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-gray-400 border-dashed border"></div>
            <span>Zero Line</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Current Price: ${currentPrice.toFixed(2)}</span>
          </div>
          {breakevens.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Breakevens: {breakevens.map(be => `$${be.toFixed(2)}`).join(', ')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
