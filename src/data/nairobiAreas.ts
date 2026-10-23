import { NairobiArea } from '../types';

export const NAIROBI_AREAS: NairobiArea[] = [
  { id: 'kilimani', name: 'Kilimani', subCounty: 'Dagoretti North', zone: 'West' },
  { id: 'kileleshwa', name: 'Kileleshwa', subCounty: 'Dagoretti North', zone: 'West' },
  { id: 'lavington', name: 'Lavington', subCounty: 'Dagoretti North', zone: 'West' },
  { id: 'westlands', name: 'Westlands', subCounty: 'Westlands', zone: 'West' },
  { id: 'parklands', name: 'Parklands & Highridge', subCounty: 'Westlands', zone: 'West' },
  { id: 'spring_valley', name: 'Spring Valley & Lower Kabete', subCounty: 'Westlands', zone: 'West' },
  { id: 'karen', name: 'Karen & Hardy', subCounty: 'Lang\'ata', zone: 'South' },
  { id: 'langata', name: 'Lang\'ata & Nairobi West', subCounty: 'Lang\'ata', zone: 'South' },
  { id: 'south_c', name: 'South C & Bellevue', subCounty: 'Lang\'ata', zone: 'South' },
  { id: 'south_b', name: 'South B & Hazina', subCounty: 'Starehe', zone: 'South' },
  { id: 'kasarani', name: 'Kasarani & Clay City', subCounty: 'Kasarani', zone: 'North' },
  { id: 'roysambu', name: 'Roysambu & Mirema', subCounty: 'Roysambu', zone: 'North' },
  { id: 'zimmerman', name: 'Zimmerman & Githurai 44', subCounty: 'Roysambu', zone: 'North' },
  { id: 'kahawa_west', name: 'Kahawa West & Wendani', subCounty: 'Roysambu', zone: 'North' },
  { id: 'embakasi_east', name: 'Embakasi Village & Fedha', subCounty: 'Embakasi East', zone: 'East' },
  { id: 'nyayo_estate', name: 'Nyayo Estate & Donholm', subCounty: 'Embakasi East', zone: 'East' },
  { id: 'umoja', name: 'Umoja 1 & 2', subCounty: 'Embakasi West', zone: 'East' },
  { id: 'buruburu', name: 'Buruburu & Harambee', subCounty: 'Makadara', zone: 'East' },
  { id: 'eastleigh', name: 'Eastleigh North & South', subCounty: 'Kamukunji', zone: 'East' },
  { id: 'pangani', name: 'Pangani & Ngara', subCounty: 'Starehe', zone: 'Central' },
  { id: 'cbd', name: 'Nairobi Central Business District', subCounty: 'Starehe', zone: 'Central' },
  { id: 'kibra', name: 'Kibra (Olympic, Sarang\'ombe)', subCounty: 'Kibra', zone: 'South' },
  { id: 'dagoretti_corner', name: 'Dagoretti Corner & Waithaka', subCounty: 'Dagoretti South', zone: 'West' },
  { id: 'ruai', name: 'Ruai & Njiru', subCounty: 'Kasarani', zone: 'East' },
];

export const getAreaNameById = (id: string): string => {
  const found = NAIROBI_AREAS.find((a) => a.id === id);
  return found ? found.name : id;
};
