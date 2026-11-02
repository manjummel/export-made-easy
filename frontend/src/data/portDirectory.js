/**
 * Global Shipping Corridors & Port Directory
 * Indian Customs Sea/Air Gateway Ports & Global Trading Hubs.
 */

export const INDIAN_GATEWAY_PORTS = [
  { code: 'INNSA', name: 'Jawaharlal Nehru Port (JNPT)', city: 'Nhava Sheva, Navi Mumbai', state: 'Maharashtra', type: 'Sea', share: '50% of Indian Container Freight', lat: 18.9499, lng: 72.9515 },
  { code: 'INMUN', name: 'Mundra Port', city: 'Kutch', state: 'Gujarat', type: 'Sea', share: 'Largest Private Commercial Port', lat: 22.7441, lng: 69.7056 },
  { code: 'INMAA', name: 'Chennai Port', city: 'Chennai', state: 'Tamil Nadu', type: 'Sea', share: 'Primary Gateway for South-East Asia', lat: 13.0827, lng: 80.2707 },
  { code: 'INCOK', name: 'Cochin Port (ICTT Vallarpadam)', city: 'Kochi', state: 'Kerala', type: 'Sea', share: 'Transshipment Hub on Main Suez Corridor', lat: 9.9312, lng: 76.2673 },
  { code: 'INBOM4', name: 'Chhatrapati Shivaji Maharaj Air Cargo', city: 'Mumbai', state: 'Maharashtra', type: 'Air', share: 'Key Pharma & Perishable Air Gateway', lat: 19.0896, lng: 72.8656 },
  { code: 'INDEL4', name: 'Indira Gandhi Air Cargo Hub', city: 'New Delhi', state: 'Delhi NCR', type: 'Air', share: 'Largest Northern Air Logistics Hub', lat: 28.5562, lng: 77.1000 }
];

export const DESTINATION_HUBS = [
  { code: 'NLRTM', name: 'Port of Rotterdam', country: 'Netherlands', region: 'Europe', lat: 51.9244, lng: 4.4777 },
  { code: 'AEJEA', name: 'Jebel Ali Port', country: 'United Arab Emirates', region: 'Middle East', lat: 24.9857, lng: 55.0273 },
  { code: 'DEHAM', name: 'Port of Hamburg', country: 'Germany', region: 'Europe', lat: 53.5511, lng: 9.9937 },
  { code: 'USLAX', name: 'Port of Los Angeles', country: 'United States', region: 'North America', lat: 33.7432, lng: -118.2673 },
  { code: 'SGSIN', name: 'Port of Singapore', country: 'Singapore', region: 'Asia-Pacific', lat: 1.3521, lng: 103.8198 },
  { code: 'GBFXT', name: 'Port of Felixstowe', country: 'United Kingdom', region: 'Europe', lat: 51.9639, lng: 1.3511 }
];

export const SHIPPING_CORRIDORS = [
  { origin: 'INNSA', destination: 'AEJEA', seaDays: 3, airDays: 1, distNm: 1060, avgTeuUSD: 450, carriers: ['Maersk', 'MSC', 'Hapag-Lloyd', 'CMA CGM'] },
  { origin: 'INNSA', destination: 'NLRTM', seaDays: 22, airDays: 2, distNm: 6300, avgTeuUSD: 1850, carriers: ['MSC', 'Maersk', 'ONE', 'COSCO'] },
  { origin: 'INNSA', destination: 'DEHAM', seaDays: 24, airDays: 2, distNm: 6600, avgTeuUSD: 1950, carriers: ['Hapag-Lloyd', 'Maersk', 'MSC'] },
  { origin: 'INMUN', destination: 'USLAX', seaDays: 32, airDays: 3, distNm: 9800, avgTeuUSD: 2400, carriers: ['Ocean Network Express', 'CMA CGM', 'Maersk'] },
  { origin: 'INMAA', destination: 'SGSIN', seaDays: 5, airDays: 1, distNm: 1650, avgTeuUSD: 520, carriers: ['PIL', 'Evergreen', 'Wan Hai'] },
  { origin: 'INNSA', destination: 'GBFXT', seaDays: 21, airDays: 2, distNm: 6200, avgTeuUSD: 1800, carriers: ['Maersk', 'CMA CGM', 'MSC'] }
];

export function getCorridorInfo(originCode, destinationCode) {
  return SHIPPING_CORRIDORS.find(c => c.origin === originCode && c.destination === destinationCode) || {
    origin: originCode,
    destination: destinationCode,
    seaDays: 20,
    airDays: 2,
    avgTeuUSD: 1600,
    carriers: ['Standard Global Shipping Lines']
  };
}
