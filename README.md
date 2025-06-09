
# Options Trading Visualizer

A comprehensive NextJS web application for options trading profit/loss visualization with interactive charts, Greeks calculations, and risk management tools.

## Features

### Core Functionality
- **Multiple Options Strategies**: Support for single calls/puts, bull/bear spreads, straddles, strangles, iron condors, covered calls, and protective puts
- **Interactive P&L Charts**: Real-time profit/loss visualization with breakeven analysis
- **Greeks Calculations**: Complete Greeks analysis (Delta, Gamma, Theta, Vega, Rho) using Black-Scholes model
- **Market Data Integration**: Real-time data via Alpha Vantage API with demo mode fallback
- **Risk Management**: Position sizing calculator and comprehensive risk analysis

### Technical Features
- **Black-Scholes Implementation**: Full JavaScript implementation of the Black-Scholes pricing model
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Charts**: Interactive charts using Chart.js with smooth animations
- **Strategy Templates**: Pre-built templates for common options strategies
- **Risk Assessment**: Automated risk level calculation and warnings

## Installation

1. Clone or download the project
2. Navigate to the app directory:
   ```bash
   cd options-trading-visualizer/app
   ```
3. Install dependencies:
   ```bash
   yarn install
   ```
4. Start the development server:
   ```bash
   yarn dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Getting Started
1. **Select a Symbol**: Choose from popular stocks (AAPL, MSFT, GOOGL, etc.)
2. **Configure Market Data**: 
   - Use demo mode for testing
   - Add Alpha Vantage API key for real-time data
3. **Build Strategy**: 
   - Use pre-built templates or create custom strategies
   - Add individual option contracts with strike, premium, and expiration

### Strategy Builder
- **Templates**: Choose from 9 pre-built strategies including long calls, spreads, and complex strategies
- **Custom Contracts**: Add individual options with full customization
- **Real-time Updates**: See profit/loss charts update as you modify contracts

### Analysis Tools
- **P&L Visualization**: Interactive charts showing profit/loss across price ranges
- **Greeks Analysis**: Individual and portfolio-level Greeks with explanations
- **Risk Management**: Position sizing recommendations based on account size and risk tolerance
- **Breakeven Analysis**: Automatic calculation and visualization of breakeven points

### API Configuration
To use real-time market data:
1. Get a free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Enable "Use Real Data" in the Market Data panel
3. Enter your API key
4. Refresh to load live market data

## Strategy Templates

### Basic Strategies
- **Long Call**: Bullish strategy with unlimited upside
- **Long Put**: Bearish strategy with high profit potential
- **Covered Call**: Income strategy for stock owners
- **Protective Put**: Insurance for stock positions

### Spread Strategies
- **Bull Call Spread**: Limited risk/reward bullish strategy
- **Bear Put Spread**: Limited risk/reward bearish strategy

### Volatility Strategies
- **Long Straddle**: Profit from high volatility in either direction
- **Long Strangle**: Lower cost volatility play with wider breakevens

### Advanced Strategies
- **Iron Condor**: Profit from low volatility with defined risk

## Risk Management Features

### Position Sizing
- Account size configuration
- Risk percentage settings (recommended 1-3%)
- Automatic position size calculation based on maximum loss

### Risk Assessment
- Real-time risk utilization monitoring
- Risk level indicators (Low/Medium/High)
- Kelly Criterion percentage calculation
- Comprehensive risk warnings

### Analysis Metrics
- Maximum profit/loss calculations
- Probability of profit estimation
- Risk/reward ratio analysis
- Breakeven distance calculations

## Technical Implementation

### Black-Scholes Model
- Complete implementation of Black-Scholes formula for calls and puts
- Greeks calculations (Delta, Gamma, Theta, Vega, Rho)
- Implied volatility calculation using Newton-Raphson method
- Time decay and interest rate sensitivity analysis

### Market Data
- Alpha Vantage API integration for real-time quotes
- Historical volatility calculation
- Demo mode with realistic mock data
- Error handling and fallback mechanisms

### Charting
- Chart.js integration for smooth, interactive charts
- Real-time updates as strategy parameters change
- Responsive design for mobile devices
- Custom styling and animations

## Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance
- Optimized for fast loading and smooth interactions
- Client-side calculations for instant updates
- Efficient chart rendering with Chart.js
- Responsive design with minimal layout shifts

## Security
- No sensitive data stored locally
- API keys handled securely
- Input validation and sanitization
- HTTPS recommended for production deployment

## Deployment

### Development
```bash
yarn dev
```

### Production Build
```bash
yarn build
yarn start
```

### Environment Variables
Create a `.env.local` file for production:
```
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_api_key_here
```

## Support

For questions or issues:
1. Check the demo mode functionality first
2. Verify API key configuration for real-time data
3. Ensure all required fields are filled in strategy builder
4. Check browser console for any error messages

## License

This project is for educational and demonstration purposes. Please ensure compliance with your local financial regulations when using for actual trading decisions.

## Disclaimer

This tool is for educational purposes only. Options trading involves significant risk and may not be suitable for all investors. Past performance does not guarantee future results. Please consult with a qualified financial advisor before making investment decisions.
