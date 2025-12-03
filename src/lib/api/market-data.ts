/**
 * Market Data API
 * 
 * Integration layer for real estate market data.
 * Structure for ImmoScout24/Immowelt API integration with fallback mock data.
 */

export interface MarketPriceData {
  postalCode: string;
  city: string;
  pricePerSqm: number;
  priceRange: { min: number; max: number };
  trend: 'STEIGEND' | 'STABIL' | 'FALLEND';
  yearOverYearChange: number; // percentage
  lastUpdated: Date;
}

export interface PropertyTypePrice {
  type: 'WOHNUNG' | 'EINFAMILIENHAUS' | 'MEHRFAMILIENHAUS' | 'GEWERBE';
  pricePerSqm: number;
  typicalSize: { min: number; max: number };
}

export interface MarketTrend {
  date: Date;
  avgPricePerSqm: number;
  transactionVolume?: number;
}

export interface RegionalMarketData {
  region: string;
  avgPricePerSqm: number;
  avgRentPerSqm: number;
  yieldPercent: number;
  demandLevel: 'SEHR_HOCH' | 'HOCH' | 'MITTEL' | 'NIEDRIG';
}

// Mock data for major German cities
const CITY_MARKET_DATA: Record<string, MarketPriceData> = {
  '80331': { postalCode: '80331', city: 'München', pricePerSqm: 9500, priceRange: { min: 7000, max: 15000 }, trend: 'STABIL', yearOverYearChange: 2.5, lastUpdated: new Date() },
  '10115': { postalCode: '10115', city: 'Berlin', pricePerSqm: 6200, priceRange: { min: 4000, max: 10000 }, trend: 'STEIGEND', yearOverYearChange: 4.2, lastUpdated: new Date() },
  '20095': { postalCode: '20095', city: 'Hamburg', pricePerSqm: 6500, priceRange: { min: 4500, max: 9500 }, trend: 'STABIL', yearOverYearChange: 1.8, lastUpdated: new Date() },
  '60311': { postalCode: '60311', city: 'Frankfurt', pricePerSqm: 7200, priceRange: { min: 5000, max: 11000 }, trend: 'STABIL', yearOverYearChange: 0.5, lastUpdated: new Date() },
  '70173': { postalCode: '70173', city: 'Stuttgart', pricePerSqm: 5800, priceRange: { min: 4000, max: 8500 }, trend: 'FALLEND', yearOverYearChange: -1.2, lastUpdated: new Date() },
  '50667': { postalCode: '50667', city: 'Köln', pricePerSqm: 4800, priceRange: { min: 3200, max: 7500 }, trend: 'STEIGEND', yearOverYearChange: 3.1, lastUpdated: new Date() },
  '40213': { postalCode: '40213', city: 'Düsseldorf', pricePerSqm: 5200, priceRange: { min: 3500, max: 8000 }, trend: 'STABIL', yearOverYearChange: 1.5, lastUpdated: new Date() },
  '04109': { postalCode: '04109', city: 'Leipzig', pricePerSqm: 3200, priceRange: { min: 2000, max: 5000 }, trend: 'STEIGEND', yearOverYearChange: 5.8, lastUpdated: new Date() },
  '01067': { postalCode: '01067', city: 'Dresden', pricePerSqm: 3000, priceRange: { min: 1800, max: 4500 }, trend: 'STEIGEND', yearOverYearChange: 4.5, lastUpdated: new Date() },
  '90402': { postalCode: '90402', city: 'Nürnberg', pricePerSqm: 4200, priceRange: { min: 2800, max: 6000 }, trend: 'STABIL', yearOverYearChange: 2.0, lastUpdated: new Date() },
};

// Default fallback for unknown locations
const DEFAULT_MARKET_DATA: MarketPriceData = {
  postalCode: '00000',
  city: 'Deutschland',
  pricePerSqm: 3500,
  priceRange: { min: 1500, max: 6000 },
  trend: 'STABIL',
  yearOverYearChange: 2.0,
  lastUpdated: new Date(),
};

/**
 * Fetch market price data for a postal code
 */
export async function fetchMarketData(postalCode: string): Promise<MarketPriceData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Try to find exact match
  if (CITY_MARKET_DATA[postalCode]) {
    return { ...CITY_MARKET_DATA[postalCode], lastUpdated: new Date() };
  }
  
  // Try to find by first 2 digits (region)
  const regionPrefix = postalCode.substring(0, 2);
  const regionMatch = Object.values(CITY_MARKET_DATA).find(
    data => data.postalCode.startsWith(regionPrefix)
  );
  
  if (regionMatch) {
    return {
      ...regionMatch,
      postalCode,
      lastUpdated: new Date(),
    };
  }
  
  return { ...DEFAULT_MARKET_DATA, postalCode, lastUpdated: new Date() };
}

/**
 * Fetch price trends for a location
 */
export async function fetchPriceTrends(postalCode: string): Promise<MarketTrend[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const baseData = await fetchMarketData(postalCode);
  const trends: MarketTrend[] = [];
  const now = new Date();
  let price = baseData.pricePerSqm * 0.85; // Start 15% lower 2 years ago
  
  for (let i = 24; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    // Simulate gradual price increase with some variation
    const monthlyChange = (baseData.yearOverYearChange / 12) / 100;
    price *= (1 + monthlyChange + (Math.random() - 0.5) * 0.01);
    
    trends.push({
      date,
      avgPricePerSqm: Math.round(price),
      transactionVolume: Math.floor(Math.random() * 50 + 10),
    });
  }
  
  return trends;
}

/**
 * Get prices by property type
 */
export async function fetchPricesByType(postalCode: string): Promise<PropertyTypePrice[]> {
  const baseData = await fetchMarketData(postalCode);
  const basePpsqm = baseData.pricePerSqm;
  
  return [
    { type: 'WOHNUNG', pricePerSqm: basePpsqm, typicalSize: { min: 40, max: 120 } },
    { type: 'EINFAMILIENHAUS', pricePerSqm: Math.round(basePpsqm * 1.1), typicalSize: { min: 100, max: 250 } },
    { type: 'MEHRFAMILIENHAUS', pricePerSqm: Math.round(basePpsqm * 0.85), typicalSize: { min: 200, max: 600 } },
    { type: 'GEWERBE', pricePerSqm: Math.round(basePpsqm * 1.2), typicalSize: { min: 50, max: 500 } },
  ];
}

/**
 * Compare price to market average
 */
export function comparePriceToMarket(
  purchasePrice: number,
  livingArea: number,
  marketData: MarketPriceData
): {
  pricePerSqm: number;
  marketComparison: number; // percentage above/below market
  assessment: 'GUENSTIG' | 'MARKTGERECHT' | 'TEUER';
} {
  const pricePerSqm = livingArea > 0 ? purchasePrice / livingArea : 0;
  const marketComparison = marketData.pricePerSqm > 0 
    ? ((pricePerSqm - marketData.pricePerSqm) / marketData.pricePerSqm) * 100 
    : 0;
  
  let assessment: 'GUENSTIG' | 'MARKTGERECHT' | 'TEUER';
  if (marketComparison < -10) {
    assessment = 'GUENSTIG';
  } else if (marketComparison > 10) {
    assessment = 'TEUER';
  } else {
    assessment = 'MARKTGERECHT';
  }
  
  return {
    pricePerSqm: Math.round(pricePerSqm),
    marketComparison: Math.round(marketComparison * 10) / 10,
    assessment,
  };
}

/**
 * Get regional comparison data
 */
export async function fetchRegionalComparison(): Promise<RegionalMarketData[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return [
    { region: 'München', avgPricePerSqm: 9500, avgRentPerSqm: 19.5, yieldPercent: 2.5, demandLevel: 'SEHR_HOCH' },
    { region: 'Berlin', avgPricePerSqm: 6200, avgRentPerSqm: 14.0, yieldPercent: 2.7, demandLevel: 'SEHR_HOCH' },
    { region: 'Hamburg', avgPricePerSqm: 6500, avgRentPerSqm: 14.5, yieldPercent: 2.7, demandLevel: 'HOCH' },
    { region: 'Frankfurt', avgPricePerSqm: 7200, avgRentPerSqm: 16.5, yieldPercent: 2.8, demandLevel: 'HOCH' },
    { region: 'Köln', avgPricePerSqm: 4800, avgRentPerSqm: 13.0, yieldPercent: 3.3, demandLevel: 'HOCH' },
    { region: 'Leipzig', avgPricePerSqm: 3200, avgRentPerSqm: 8.5, yieldPercent: 3.2, demandLevel: 'HOCH' },
    { region: 'Dresden', avgPricePerSqm: 3000, avgRentPerSqm: 9.0, yieldPercent: 3.6, demandLevel: 'MITTEL' },
    { region: 'Ruhrgebiet', avgPricePerSqm: 2200, avgRentPerSqm: 7.5, yieldPercent: 4.1, demandLevel: 'MITTEL' },
  ];
}
