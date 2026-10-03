import type { BloodBank, HospitalEntity, DonorEntity, BloodUnit, StockSummary } from '@/types/blood';

export const CITIES_CONFIG = {
  Mumbai: { lat: 19.0760, lng: 72.8777, geohash: 'te7u' },
  Pune: { lat: 18.5204, lng: 73.8567, geohash: 'tek8' },
  Nagpur: { lat: 21.1458, lng: 79.0882, geohash: 'tgce' }
};

export const SEED_BANKS: BloodBank[] = [
  // Nagpur (Includes the Race Demo target bank)
  {
    id: 'bank_nagpur_central',
    name: 'JeevanSetu Central Blood Bank (Nagpur)',
    city: 'Nagpur',
    location: { lat: 21.1460, lng: 79.0885, geohash: 'tgce1' },
    address: 'Near Medical College Square, Nagpur',
    phone: '+91 712 2548901',
    verified: true,
    licenseNumber: 'BB-MH-NGP-2021-004',
    rating: 4.9,
    responseRate: 0.98,
    isRaceTarget: true, // Holds exactly 1 unit of O- for the concurrency race demo!
    createdAt: new Date('2024-01-01').toISOString()
  },
  {
    id: 'bank_nagpur_metro',
    name: 'Metro Regional Blood Centre (Nagpur)',
    city: 'Nagpur',
    location: { lat: 21.1520, lng: 79.0810, geohash: 'tgce2' },
    address: 'Dharampeth, Nagpur',
    phone: '+91 712 2521190',
    verified: true,
    licenseNumber: 'BB-MH-NGP-2022-019',
    rating: 4.7,
    responseRate: 0.92,
    createdAt: new Date('2024-01-10').toISOString()
  },
  // Pune
  {
    id: 'bank_pune_sanjivani',
    name: 'Sanjivani Blood Bank & Component Lab (Pune)',
    city: 'Pune',
    location: { lat: 18.5215, lng: 73.8540, geohash: 'tek81' },
    address: 'Shivajinagar, Pune',
    phone: '+91 20 25531001',
    verified: true,
    licenseNumber: 'BB-MH-PUN-2019-112',
    rating: 4.8,
    responseRate: 0.96,
    createdAt: new Date('2024-01-05').toISOString()
  },
  {
    id: 'bank_pune_redcross',
    name: 'Red Cross Blood Service Center (Pune)',
    city: 'Pune',
    location: { lat: 18.5140, lng: 73.8680, geohash: 'tek82' },
    address: 'Camp Area, Pune',
    phone: '+91 20 26124500',
    verified: true,
    licenseNumber: 'BB-MH-PUN-2020-058',
    rating: 4.6,
    responseRate: 0.90,
    createdAt: new Date('2024-01-15').toISOString()
  },
  // Mumbai
  {
    id: 'bank_mumbai_apex',
    name: 'Apex Rotary Blood Bank (Mumbai)',
    city: 'Mumbai',
    location: { lat: 19.0780, lng: 72.8790, geohash: 'te7u1' },
    address: 'Bandra East, Mumbai',
    phone: '+91 22 26590011',
    verified: true,
    licenseNumber: 'BB-MH-MUM-2018-001',
    rating: 4.9,
    responseRate: 0.99,
    createdAt: new Date('2024-01-02').toISOString()
  },
  {
    id: 'bank_mumbai_samarpan',
    name: 'Samarpan Charitable Blood Bank (Mumbai)',
    city: 'Mumbai',
    location: { lat: 19.0180, lng: 72.8420, geohash: 'te7u2' },
    address: 'Dadar West, Mumbai',
    phone: '+91 22 24305544',
    verified: true,
    licenseNumber: 'BB-MH-MUM-2021-087',
    rating: 4.7,
    responseRate: 0.94,
    createdAt: new Date('2024-01-20').toISOString()
  }
];

export const SEED_HOSPITALS: HospitalEntity[] = [
  // Nagpur (4)
  {
    id: 'hosp_nagpur_aiims',
    name: 'AIIMS Nagpur Super Specialty',
    city: 'Nagpur',
    location: { lat: 21.0650, lng: 79.0320 },
    licenseNumber: 'HOSP-MH-NGP-001',
    emergencyContact: '+91 712 2855555',
    verified: true,
    reputation: 99
  },
  {
    id: 'hosp_nagpur_orange',
    name: 'Orange City Hospital & Research Institute',
    city: 'Nagpur',
    location: { lat: 21.1210, lng: 79.0750 },
    licenseNumber: 'HOSP-MH-NGP-002',
    emergencyContact: '+91 712 2223344',
    verified: true,
    reputation: 95
  },
  {
    id: 'hosp_nagpur_gmc',
    name: 'Government Medical College & Hospital',
    city: 'Nagpur',
    location: { lat: 21.1440, lng: 79.0910 },
    licenseNumber: 'HOSP-MH-NGP-003',
    emergencyContact: '+91 712 2744400',
    verified: true,
    reputation: 97
  },
  {
    id: 'hosp_nagpur_care',
    name: 'Care Hospital Ramdaspeth',
    city: 'Nagpur',
    location: { lat: 21.1390, lng: 79.0760 },
    licenseNumber: 'HOSP-MH-NGP-004',
    emergencyContact: '+91 712 3982222',
    verified: true,
    reputation: 93
  },
  // Pune (2)
  {
    id: 'hosp_pune_ruby',
    name: 'Ruby Hall Clinic',
    city: 'Pune',
    location: { lat: 18.5320, lng: 73.8750 },
    licenseNumber: 'HOSP-MH-PUN-001',
    emergencyContact: '+91 20 66455100',
    verified: true,
    reputation: 98
  },
  {
    id: 'hosp_pune_jehangir',
    name: 'Jehangir Hospital',
    city: 'Pune',
    location: { lat: 18.5280, lng: 73.8770 },
    licenseNumber: 'HOSP-MH-PUN-002',
    emergencyContact: '+91 20 66811000',
    verified: true,
    reputation: 96
  },
  // Mumbai (2)
  {
    id: 'hosp_mumbai_lilavati',
    name: 'Lilavati Hospital & Research Centre',
    city: 'Mumbai',
    location: { lat: 19.0520, lng: 72.8290 },
    licenseNumber: 'HOSP-MH-MUM-001',
    emergencyContact: '+91 22 26751000',
    verified: true,
    reputation: 99
  },
  {
    id: 'hosp_mumbai_kokilaben',
    name: 'Kokilaben Dhirubhai Ambani Hospital',
    city: 'Mumbai',
    location: { lat: 19.1310, lng: 72.8250 },
    licenseNumber: 'HOSP-MH-MUM-002',
    emergencyContact: '+91 22 30999999',
    verified: true,
    reputation: 98
  }
];

export const SEED_DONORS: DonorEntity[] = [
  // 10 Nagpur Donors
  {
    id: 'donor_ngp_01',
    name: 'Dr. Rohan Deshmukh',
    gender: 'male',
    bloodGroup: 'O-',
    city: 'Nagpur',
    location: { lat: 21.147, lng: 79.085 },
    phone: '+91 98221 11001',
    verified: true,
    available: true,
    lastDonationAt: '2026-05-10T10:00:00Z', // > 90 days ago (eligible)
    donationCount: 14,
    reputation: 98
  },
  {
    id: 'donor_ngp_02',
    name: 'Pooja Kulkarni',
    gender: 'female',
    bloodGroup: 'A+',
    city: 'Nagpur',
    location: { lat: 21.140, lng: 79.080 },
    phone: '+91 98221 11002',
    verified: true,
    available: true,
    lastDonationAt: '2026-04-12T10:00:00Z', // > 120 days ago (eligible)
    donationCount: 6,
    reputation: 94
  },
  {
    id: 'donor_ngp_03',
    name: 'Amitabh Sen',
    gender: 'male',
    bloodGroup: 'B+',
    city: 'Nagpur',
    location: { lat: 21.155, lng: 79.090 },
    phone: '+91 98221 11003',
    verified: true,
    available: false, // temporarily unavailable
    lastDonationAt: '2026-09-01T10:00:00Z',
    donationCount: 3,
    reputation: 88
  },
  {
    id: 'donor_ngp_04',
    name: 'Snehal Patil',
    gender: 'female',
    bloodGroup: 'AB+',
    city: 'Nagpur',
    location: { lat: 21.135, lng: 79.072 },
    phone: '+91 98221 11004',
    verified: true,
    available: true,
    lastDonationAt: '2026-03-15T10:00:00Z',
    donationCount: 8,
    reputation: 96
  },
  {
    id: 'donor_ngp_05',
    name: 'Gaurav Sharma',
    gender: 'male',
    bloodGroup: 'O+',
    city: 'Nagpur',
    location: { lat: 21.150, lng: 79.095 },
    phone: '+91 98221 11005',
    verified: true,
    available: true,
    lastDonationAt: '2026-06-20T10:00:00Z',
    donationCount: 5,
    reputation: 92
  },
  {
    id: 'donor_ngp_06',
    name: 'Neha Verma',
    gender: 'female',
    bloodGroup: 'A-',
    city: 'Nagpur',
    location: { lat: 21.130, lng: 79.085 },
    phone: '+91 98221 11006',
    verified: true,
    available: true,
    lastDonationAt: '2026-02-10T10:00:00Z',
    donationCount: 7,
    reputation: 95
  },
  {
    id: 'donor_ngp_07',
    name: 'Vikram Joshi',
    gender: 'male',
    bloodGroup: 'B-',
    city: 'Nagpur',
    location: { lat: 21.160, lng: 79.075 },
    phone: '+91 98221 11007',
    verified: true,
    available: true,
    lastDonationAt: '2026-05-01T10:00:00Z',
    donationCount: 11,
    reputation: 97
  },
  {
    id: 'donor_ngp_08',
    name: 'Kavita Rao',
    gender: 'female',
    bloodGroup: 'AB-',
    city: 'Nagpur',
    location: { lat: 21.142, lng: 79.068 },
    phone: '+91 98221 11008',
    verified: true,
    available: true,
    lastDonationAt: '2026-01-20T10:00:00Z',
    donationCount: 4,
    reputation: 91
  },
  {
    id: 'donor_ngp_09',
    name: 'Suresh Meshram',
    gender: 'male',
    bloodGroup: 'O-',
    city: 'Nagpur',
    location: { lat: 21.125, lng: 79.089 },
    phone: '+91 98221 11009',
    verified: true,
    available: true,
    lastDonationAt: '2026-04-18T10:00:00Z',
    donationCount: 12,
    reputation: 99
  },
  {
    id: 'donor_ngp_10',
    name: 'Tanvi Shinde',
    gender: 'female',
    bloodGroup: 'B+',
    city: 'Nagpur',
    location: { lat: 21.149, lng: 79.098 },
    phone: '+91 98221 11010',
    verified: false, // Pending verification
    available: true,
    lastDonationAt: null,
    donationCount: 0,
    reputation: 70
  },
  // 10 Pune Donors
  {
    id: 'donor_pun_01',
    name: 'Pranav Kulkarni',
    gender: 'male',
    bloodGroup: 'O-',
    city: 'Pune',
    location: { lat: 18.522, lng: 73.855 },
    phone: '+91 98222 22001',
    verified: true,
    available: true,
    lastDonationAt: '2026-05-15T10:00:00Z',
    donationCount: 9,
    reputation: 97
  },
  {
    id: 'donor_pun_02',
    name: 'Ananya Joshi',
    gender: 'female',
    bloodGroup: 'A+',
    city: 'Pune',
    location: { lat: 18.518, lng: 73.850 },
    phone: '+91 98222 22002',
    verified: true,
    available: true,
    lastDonationAt: '2026-03-10T10:00:00Z',
    donationCount: 5,
    reputation: 93
  },
  {
    id: 'donor_pun_03',
    name: 'Rahul Gokhale',
    gender: 'male',
    bloodGroup: 'B+',
    city: 'Pune',
    location: { lat: 18.530, lng: 73.860 },
    phone: '+91 98222 22003',
    verified: true,
    available: true,
    lastDonationAt: '2026-06-01T10:00:00Z',
    donationCount: 8,
    reputation: 95
  },
  {
    id: 'donor_pun_04',
    name: 'Meera Bapat',
    gender: 'female',
    bloodGroup: 'AB+',
    city: 'Pune',
    location: { lat: 18.525, lng: 73.865 },
    phone: '+91 98222 22004',
    verified: true,
    available: true,
    lastDonationAt: '2026-04-05T10:00:00Z',
    donationCount: 4,
    reputation: 90
  },
  {
    id: 'donor_pun_05',
    name: 'Chetan Tambe',
    gender: 'male',
    bloodGroup: 'O+',
    city: 'Pune',
    location: { lat: 18.512, lng: 73.848 },
    phone: '+91 98222 22005',
    verified: true,
    available: true,
    lastDonationAt: '2026-06-18T10:00:00Z',
    donationCount: 15,
    reputation: 98
  },
  {
    id: 'donor_pun_06',
    name: 'Swati Date',
    gender: 'female',
    bloodGroup: 'A-',
    city: 'Pune',
    location: { lat: 18.535, lng: 73.870 },
    phone: '+91 98222 22006',
    verified: true,
    available: true,
    lastDonationAt: '2026-02-28T10:00:00Z',
    donationCount: 6,
    reputation: 94
  },
  {
    id: 'donor_pun_07',
    name: 'Nikhil Kelkar',
    gender: 'male',
    bloodGroup: 'B-',
    city: 'Pune',
    location: { lat: 18.515, lng: 73.862 },
    phone: '+91 98222 22007',
    verified: true,
    available: true,
    lastDonationAt: '2026-05-22T10:00:00Z',
    donationCount: 7,
    reputation: 92
  },
  {
    id: 'donor_pun_08',
    name: 'Aishwarya Gadgil',
    gender: 'female',
    bloodGroup: 'AB-',
    city: 'Pune',
    location: { lat: 18.528, lng: 73.845 },
    phone: '+91 98222 22008',
    verified: true,
    available: true,
    lastDonationAt: '2026-01-14T10:00:00Z',
    donationCount: 3,
    reputation: 89
  },
  {
    id: 'donor_pun_09',
    name: 'Sarang Apte',
    gender: 'male',
    bloodGroup: 'O-',
    city: 'Pune',
    location: { lat: 18.508, lng: 73.858 },
    phone: '+91 98222 22009',
    verified: true,
    available: false, // in 90-day cooldown
    lastDonationAt: '2026-09-10T10:00:00Z',
    donationCount: 10,
    reputation: 96
  },
  {
    id: 'donor_pun_10',
    name: 'Radhika Karve',
    gender: 'female',
    bloodGroup: 'O+',
    city: 'Pune',
    location: { lat: 18.540, lng: 73.852 },
    phone: '+91 98222 22010',
    verified: true,
    available: true,
    lastDonationAt: '2026-04-30T10:00:00Z',
    donationCount: 2,
    reputation: 88
  },
  // 10 Mumbai Donors
  {
    id: 'donor_mum_01',
    name: 'Kabir Merchant',
    gender: 'male',
    bloodGroup: 'O-',
    city: 'Mumbai',
    location: { lat: 19.077, lng: 72.876 },
    phone: '+91 98223 33001',
    verified: true,
    available: true,
    lastDonationAt: '2026-05-12T10:00:00Z',
    donationCount: 16,
    reputation: 99
  },
  {
    id: 'donor_mum_02',
    name: 'Shalini Nambiar',
    gender: 'female',
    bloodGroup: 'A+',
    city: 'Mumbai',
    location: { lat: 19.082, lng: 72.880 },
    phone: '+91 98223 33002',
    verified: true,
    available: true,
    lastDonationAt: '2026-03-25T10:00:00Z',
    donationCount: 8,
    reputation: 95
  },
  {
    id: 'donor_mum_03',
    name: 'Farhan Sayyed',
    gender: 'male',
    bloodGroup: 'B+',
    city: 'Mumbai',
    location: { lat: 19.065, lng: 72.865 },
    phone: '+91 98223 33003',
    verified: true,
    available: true,
    lastDonationAt: '2026-06-10T10:00:00Z',
    donationCount: 12,
    reputation: 97
  },
  {
    id: 'donor_mum_04',
    name: 'Rhea Fernandez',
    gender: 'female',
    bloodGroup: 'AB+',
    city: 'Mumbai',
    location: { lat: 19.055, lng: 72.835 },
    phone: '+91 98223 33004',
    verified: true,
    available: true,
    lastDonationAt: '2026-02-18T10:00:00Z',
    donationCount: 5,
    reputation: 92
  },
  {
    id: 'donor_mum_05',
    name: 'Aditya Singhania',
    gender: 'male',
    bloodGroup: 'O+',
    city: 'Mumbai',
    location: { lat: 19.090, lng: 72.890 },
    phone: '+91 98223 33005',
    verified: true,
    available: true,
    lastDonationAt: '2026-05-28T10:00:00Z',
    donationCount: 7,
    reputation: 94
  },
  {
    id: 'donor_mum_06',
    name: 'Zoya Contractor',
    gender: 'female',
    bloodGroup: 'A-',
    city: 'Mumbai',
    location: { lat: 19.040, lng: 72.820 },
    phone: '+91 98223 33006',
    verified: true,
    available: true,
    lastDonationAt: '2026-04-02T10:00:00Z',
    donationCount: 9,
    reputation: 96
  },
  {
    id: 'donor_mum_07',
    name: 'Darshan Mehta',
    gender: 'male',
    bloodGroup: 'B-',
    city: 'Mumbai',
    location: { lat: 19.070, lng: 72.870 },
    phone: '+91 98223 33007',
    verified: true,
    available: true,
    lastDonationAt: '2026-06-04T10:00:00Z',
    donationCount: 6,
    reputation: 91
  },
  {
    id: 'donor_mum_08',
    name: 'Natasha Dsouza',
    gender: 'female',
    bloodGroup: 'AB-',
    city: 'Mumbai',
    location: { lat: 19.100, lng: 72.860 },
    phone: '+91 98223 33008',
    verified: true,
    available: true,
    lastDonationAt: '2026-01-05T10:00:00Z',
    donationCount: 4,
    reputation: 90
  },
  {
    id: 'donor_mum_09',
    name: 'Harsh Vardhan',
    gender: 'male',
    bloodGroup: 'O-',
    city: 'Mumbai',
    location: { lat: 19.085, lng: 72.875 },
    phone: '+91 98223 33009',
    verified: true,
    available: true,
    lastDonationAt: '2026-04-22T10:00:00Z',
    donationCount: 13,
    reputation: 98
  },
  {
    id: 'donor_mum_10',
    name: 'Pooja Bhatt',
    gender: 'female',
    bloodGroup: 'A+',
    city: 'Mumbai',
    location: { lat: 19.030, lng: 72.830 },
    phone: '+91 98223 33010',
    verified: false,
    available: true,
    lastDonationAt: null,
    donationCount: 0,
    reputation: 75
  }
];

// Helper to generate seed units with varied expiry dates: 1 day, 3 days, 7 days, 35 days
export function generateSeedUnitsAndStock(): { units: BloodUnit[]; stockSummaries: Record<string, StockSummary> } {
  const units: BloodUnit[] = [];
  const stockSummaries: Record<string, StockSummary> = {};
  const bloodGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as const;
  
  const now = Date.now();
  const DAY = 24 * 3600 * 1000;

  for (const bank of SEED_BANKS) {
    stockSummaries[bank.id] = {
      bankId: bank.id,
      bankName: bank.name,
      city: bank.city,
      lastUpdated: new Date().toISOString(),
      counts: {
        'O-': 0, 'O+': 0, 'A-': 0, 'A+': 0,
        'B-': 0, 'B+': 0, 'AB-': 0, 'AB+': 0
      }
    };

    if (bank.isRaceTarget) {
      // THE CRITICAL RACE DEMO BANK:
      // Holds EXACTLY 1 unit of O-!
      // Other blood groups have standard shelf quantities
      const raceUnit: BloodUnit = {
        id: `unit_${bank.id}_O_neg_sole`,
        bankId: bank.id,
        bloodGroup: 'O-',
        component: 'RBC',
        collectedAt: new Date(now - 10 * DAY).toISOString(),
        expiresAt: new Date(now + 15 * DAY).toISOString(),
        status: 'available',
        shelfLocation: 'Vault-A-Slot-01'
      };
      units.push(raceUnit);
      stockSummaries[bank.id].counts['O-'] = 1;

      // Add other non-O- units
      const otherGroups = ['O+', 'A+', 'B+', 'AB+'] as const;
      for (const bg of otherGroups) {
        for (let i = 1; i <= 3; i++) {
          const unit: BloodUnit = {
            id: `unit_${bank.id}_${bg}_${i}`,
            bankId: bank.id,
            bloodGroup: bg,
            component: 'RBC',
            collectedAt: new Date(now - 5 * DAY).toISOString(),
            expiresAt: new Date(now + (i === 1 ? 2 : i === 2 ? 6 : 28) * DAY).toISOString(),
            status: 'available',
            shelfLocation: `Vault-B-Slot-${i}`
          };
          units.push(unit);
          stockSummaries[bank.id].counts[bg]++;
        }
      }
    } else {
      // Normal banks: have diversified stock across all 8 blood groups with varied expiry
      for (const bg of bloodGroups) {
        // Quantities vary: 2 to 6 units per blood group
        const qty = bg === 'O-' ? 2 : 4;
        for (let i = 1; i <= qty; i++) {
          // Expiry spread: some 1 day away, some 3 days, some 7 days, some 35 days
          let expiryDays = 25;
          if (i === 1) expiryDays = 1; // 1-day alert
          else if (i === 2) expiryDays = 3; // 3-day alert
          else if (i === 3) expiryDays = 7; // 7-day alert

          const unit: BloodUnit = {
            id: `unit_${bank.id}_${bg.replace('+', '_pos').replace('-', '_neg')}_${i}`,
            bankId: bank.id,
            bloodGroup: bg,
            component: i % 2 === 0 ? 'whole' : 'RBC',
            collectedAt: new Date(now - (35 - expiryDays) * DAY).toISOString(),
            expiresAt: new Date(now + expiryDays * DAY).toISOString(),
            status: 'available',
            shelfLocation: `Rack-${bg}-${i}`
          };
          units.push(unit);
          stockSummaries[bank.id].counts[bg]++;
        }
      }
    }
  }

  return { units, stockSummaries };
}
