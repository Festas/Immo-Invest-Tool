/**
 * Infrastructure Scoring for Location Analysis
 * 
 * Calculate infrastructure scores based on various amenities and services.
 */

export interface InfrastructureCategory {
  category: string;
  score: number;
  details: InfrastructureDetail[];
}

export interface InfrastructureDetail {
  name: string;
  distance: number; // in meters
  quality: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
}

export interface InfrastructureAnalysis {
  overallScore: number;
  categories: InfrastructureCategory[];
  summary: string;
  recommendations: string[];
}

export interface NearbyAmenity {
  type: string;
  name: string;
  distance: number;
  rating?: number;
}

/**
 * Calculate transport score based on nearby public transport
 */
export function calculateTransportScore(
  nearestBusStop: number, // meters
  nearestTrainStation: number,
  nearestSubway: number | null,
  busFrequency: number = 15 // minutes
): { score: number; details: string[] } {
  let score = 50;
  const details: string[] = [];
  
  // Bus stop scoring
  if (nearestBusStop <= 200) {
    score += 15;
    details.push('Bushaltestelle in unmittelbarer Nähe');
  } else if (nearestBusStop <= 400) {
    score += 10;
    details.push('Bushaltestelle gut erreichbar');
  } else if (nearestBusStop <= 600) {
    score += 5;
  } else {
    score -= 10;
    details.push('Bushaltestelle weit entfernt');
  }
  
  // Train station scoring
  if (nearestTrainStation <= 500) {
    score += 20;
    details.push('Bahnhof in Laufnähe');
  } else if (nearestTrainStation <= 1000) {
    score += 15;
    details.push('Bahnhof gut erreichbar');
  } else if (nearestTrainStation <= 2000) {
    score += 8;
  } else {
    score -= 5;
  }
  
  // Subway scoring (if available)
  if (nearestSubway !== null) {
    if (nearestSubway <= 300) {
      score += 20;
      details.push('U-Bahn-Station in der Nähe');
    } else if (nearestSubway <= 600) {
      score += 15;
    } else if (nearestSubway <= 1000) {
      score += 8;
    }
  }
  
  // Frequency bonus
  if (busFrequency <= 5) {
    score += 10;
    details.push('Sehr gute Taktung');
  } else if (busFrequency <= 10) {
    score += 5;
  } else if (busFrequency >= 30) {
    score -= 10;
    details.push('Seltene Verbindungen');
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    details,
  };
}

/**
 * Calculate shopping score
 */
export function calculateShoppingScore(
  nearestSupermarket: number,
  nearestDiscounter: number,
  shoppingCenterDistance: number | null,
  pharmacyDistance: number
): { score: number; details: string[] } {
  let score = 50;
  const details: string[] = [];
  
  // Supermarket
  if (nearestSupermarket <= 300) {
    score += 20;
    details.push('Supermarkt in Laufnähe');
  } else if (nearestSupermarket <= 600) {
    score += 15;
  } else if (nearestSupermarket <= 1000) {
    score += 8;
  } else {
    score -= 10;
    details.push('Kein Supermarkt in der Nähe');
  }
  
  // Discounter
  if (nearestDiscounter <= 500) {
    score += 10;
    details.push('Discounter gut erreichbar');
  } else if (nearestDiscounter <= 800) {
    score += 5;
  }
  
  // Shopping center
  if (shoppingCenterDistance !== null && shoppingCenterDistance <= 2000) {
    score += 10;
    details.push('Einkaufszentrum in der Nähe');
  }
  
  // Pharmacy
  if (pharmacyDistance <= 500) {
    score += 10;
    details.push('Apotheke gut erreichbar');
  } else if (pharmacyDistance <= 1000) {
    score += 5;
  } else {
    score -= 5;
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    details,
  };
}

/**
 * Calculate education score
 */
export function calculateEducationScore(
  nearestKindergarten: number,
  nearestPrimarySchool: number,
  nearestSecondarySchool: number | null,
  nearestUniversity: number | null
): { score: number; details: string[] } {
  let score = 50;
  const details: string[] = [];
  
  // Kindergarten
  if (nearestKindergarten <= 500) {
    score += 15;
    details.push('Kindergarten in der Nähe');
  } else if (nearestKindergarten <= 1000) {
    score += 10;
  } else if (nearestKindergarten <= 1500) {
    score += 5;
  } else {
    score -= 10;
  }
  
  // Primary school
  if (nearestPrimarySchool <= 800) {
    score += 15;
    details.push('Grundschule gut erreichbar');
  } else if (nearestPrimarySchool <= 1500) {
    score += 10;
  } else {
    score -= 5;
  }
  
  // Secondary school
  if (nearestSecondarySchool !== null) {
    if (nearestSecondarySchool <= 1500) {
      score += 10;
      details.push('Weiterführende Schule in der Nähe');
    } else if (nearestSecondarySchool <= 3000) {
      score += 5;
    }
  }
  
  // University (nice to have)
  if (nearestUniversity !== null && nearestUniversity <= 5000) {
    score += 10;
    details.push('Hochschule in der Stadt');
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    details,
  };
}

/**
 * Calculate healthcare score
 */
export function calculateHealthcareScore(
  nearestDoctor: number,
  nearestHospital: number,
  nearestPharmacy: number,
  specialistAvailability: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'
): { score: number; details: string[] } {
  let score = 50;
  const details: string[] = [];
  
  // General practitioner
  if (nearestDoctor <= 500) {
    score += 15;
    details.push('Arztpraxis in der Nähe');
  } else if (nearestDoctor <= 1000) {
    score += 10;
  } else if (nearestDoctor <= 2000) {
    score += 5;
  } else {
    score -= 10;
  }
  
  // Hospital
  if (nearestHospital <= 3000) {
    score += 20;
    details.push('Krankenhaus gut erreichbar');
  } else if (nearestHospital <= 10000) {
    score += 10;
  } else {
    score -= 10;
    details.push('Krankenhaus weit entfernt');
  }
  
  // Pharmacy
  if (nearestPharmacy <= 500) {
    score += 10;
  } else if (nearestPharmacy <= 1000) {
    score += 5;
  }
  
  // Specialist availability
  switch (specialistAvailability) {
    case 'HIGH':
      score += 10;
      details.push('Gute Facharztversorgung');
      break;
    case 'MEDIUM':
      score += 5;
      break;
    case 'LOW':
      score -= 5;
      details.push('Wenig Fachärzte vor Ort');
      break;
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    details,
  };
}

/**
 * Calculate recreation score
 */
export function calculateRecreationScore(
  nearestPark: number,
  nearestSportsCenter: number,
  nearestRestaurants: number,
  greenSpaceRatio: number = 0.2 // percentage of green space in area
): { score: number; details: string[] } {
  let score = 50;
  const details: string[] = [];
  
  // Park
  if (nearestPark <= 300) {
    score += 15;
    details.push('Park in Laufnähe');
  } else if (nearestPark <= 600) {
    score += 10;
  } else if (nearestPark <= 1000) {
    score += 5;
  } else {
    score -= 5;
  }
  
  // Sports center
  if (nearestSportsCenter <= 1000) {
    score += 10;
    details.push('Sportmöglichkeiten vorhanden');
  } else if (nearestSportsCenter <= 2000) {
    score += 5;
  }
  
  // Restaurants
  if (nearestRestaurants <= 200) {
    score += 10;
    details.push('Gute Gastronomie');
  } else if (nearestRestaurants <= 500) {
    score += 5;
  }
  
  // Green space ratio
  if (greenSpaceRatio >= 0.3) {
    score += 10;
    details.push('Viel Grünfläche');
  } else if (greenSpaceRatio >= 0.15) {
    score += 5;
  } else if (greenSpaceRatio < 0.05) {
    score -= 5;
    details.push('Wenig Grünfläche');
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    details,
  };
}

/**
 * Calculate overall infrastructure analysis
 */
export function analyzeInfrastructure(
  transport: { score: number; details: string[] },
  shopping: { score: number; details: string[] },
  education: { score: number; details: string[] },
  healthcare: { score: number; details: string[] },
  recreation: { score: number; details: string[] }
): InfrastructureAnalysis {
  const categories: InfrastructureCategory[] = [
    { category: 'ÖPNV & Verkehr', score: transport.score, details: transport.details.map(d => ({ name: d, distance: 0, quality: 'GOOD' as const })) },
    { category: 'Einkaufen', score: shopping.score, details: shopping.details.map(d => ({ name: d, distance: 0, quality: 'GOOD' as const })) },
    { category: 'Bildung', score: education.score, details: education.details.map(d => ({ name: d, distance: 0, quality: 'GOOD' as const })) },
    { category: 'Gesundheit', score: healthcare.score, details: healthcare.details.map(d => ({ name: d, distance: 0, quality: 'GOOD' as const })) },
    { category: 'Freizeit', score: recreation.score, details: recreation.details.map(d => ({ name: d, distance: 0, quality: 'GOOD' as const })) },
  ];
  
  // Weighted average (transport and shopping are more important for renters)
  const weights = { transport: 0.3, shopping: 0.25, education: 0.15, healthcare: 0.15, recreation: 0.15 };
  const overallScore = Math.round(
    transport.score * weights.transport +
    shopping.score * weights.shopping +
    education.score * weights.education +
    healthcare.score * weights.healthcare +
    recreation.score * weights.recreation
  );
  
  // Generate summary
  let summary: string;
  if (overallScore >= 75) {
    summary = 'Ausgezeichnete Infrastruktur mit sehr guter Anbindung und Versorgung.';
  } else if (overallScore >= 60) {
    summary = 'Gute Infrastruktur mit den wichtigsten Einrichtungen in der Nähe.';
  } else if (overallScore >= 45) {
    summary = 'Durchschnittliche Infrastruktur mit einigen Einschränkungen.';
  } else {
    summary = 'Schwache Infrastruktur - bei Vermietung könnten Probleme auftreten.';
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  if (transport.score < 50) {
    recommendations.push('ÖPNV-Anbindung ist schwach - Auto erforderlich');
  }
  if (shopping.score < 50) {
    recommendations.push('Einkaufsmöglichkeiten eingeschränkt');
  }
  if (education.score < 50) {
    recommendations.push('Bildungseinrichtungen weit entfernt - für Familien weniger geeignet');
  }
  if (healthcare.score < 50) {
    recommendations.push('Medizinische Versorgung eingeschränkt');
  }
  
  return {
    overallScore,
    categories,
    summary,
    recommendations,
  };
}

/**
 * Get mock infrastructure data for a postal code
 */
export function getMockInfrastructureData(postalCode: string): InfrastructureAnalysis {
  // Generate semi-random but consistent data based on postal code
  const hash = postalCode.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const baseScore = 40 + (hash % 40);
  
  const transport = calculateTransportScore(
    200 + (hash % 400),
    500 + (hash % 1500),
    hash > 300 ? 400 + (hash % 600) : null,
    10 + (hash % 20)
  );
  
  const shopping = calculateShoppingScore(
    300 + (hash % 500),
    400 + (hash % 400),
    hash > 250 ? 1500 + (hash % 1500) : null,
    400 + (hash % 600)
  );
  
  const education = calculateEducationScore(
    600 + (hash % 600),
    800 + (hash % 800),
    hash > 200 ? 1500 + (hash % 1500) : null,
    hash > 280 ? 3000 + (hash % 3000) : null
  );
  
  const healthcare = calculateHealthcareScore(
    500 + (hash % 1000),
    4000 + (hash % 6000),
    400 + (hash % 600),
    hash > 260 ? 'HIGH' : hash > 220 ? 'MEDIUM' : 'LOW'
  );
  
  const recreation = calculateRecreationScore(
    300 + (hash % 700),
    1000 + (hash % 1500),
    200 + (hash % 500),
    0.1 + (hash % 30) / 100
  );
  
  return analyzeInfrastructure(transport, shopping, education, healthcare, recreation);
}
