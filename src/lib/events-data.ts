
export type NDTEvent = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  city: string;
  country: string;
  region: 'North America' | 'Europe' | 'Asia' | 'South America' | 'Middle East' | 'Africa' | 'Oceania';
  organizer: string;
  description: string;
  imageUrl: string;
  website: string;
};

export const ndtEvents: NDTEvent[] = [
  {
    id: 'event-01',
    title: 'ASNT 2024: The Annual Conference',
    startDate: '2024-10-21',
    endDate: '2024-10-24',
    city: 'Las Vegas, NV',
    country: 'USA',
    region: 'North America',
    organizer: 'ASNT',
    description: 'The world\'s largest gathering of NDT professionals, offering a forum for the exchange of scientific and technical information related to the field.',
    imageUrl: 'https://picsum.photos/seed/asnt24/600/400',
    website: 'https://asnt.org/annual',
  },
  {
    id: 'event-02',
    title: '14th European Conference on NDT (ECNDT)',
    startDate: '2025-07-07',
    endDate: '2025-07-11',
    city: 'Lisbon',
    country: 'Portugal',
    region: 'Europe',
    organizer: 'EFNDT',
    description: 'A major European event for all topics related to Non-Destructive Testing, structural integrity, and condition monitoring.',
    imageUrl: 'https://picsum.photos/seed/ecndt25/600/400',
    website: 'https://www.ecndt2025.org/',
  },
  {
    id: 'event-03',
    title: 'BINDT NDT Conference 2024',
    startDate: '2024-09-03',
    endDate: '2024-09-05',
    city: 'Telford',
    country: 'UK',
    region: 'Europe',
    organizer: 'BINDT',
    description: 'The British Institute of Non-Destructive Testing\'s annual conference, showcasing the latest research and technology.',
    imageUrl: 'https://picsum.photos/seed/bindt24/600/400',
    website: '#',
  },
  {
    id: 'event-07',
    title: 'NDT-CE 2024',
    startDate: '2024-09-09',
    endDate: '2024-09-11',
    city: 'Prague',
    country: 'Czech Republic',
    region: 'Europe',
    organizer: 'CNDT',
    description: 'The 54th annual conference on Non-Destructive Testing and Condition Evaluation of materials and structures.',
    imageUrl: 'https://picsum.photos/seed/ndtce24/600/400',
    website: '#',
  },
  {
    id: 'event-08',
    title: '13th NDT in Aerospace Conference',
    startDate: '2024-11-13',
    endDate: '2024-11-15',
    city: 'Charleston, SC',
    country: 'USA',
    region: 'North America',
    organizer: 'ASNT',
    description: 'A premier event for NDT professionals in the aerospace industry, covering the latest advancements and challenges.',
    imageUrl: 'https://picsum.photos/seed/ndtaero24/600/400',
    website: '#',
  },
  {
    id: 'event-04',
    title: 'Asia Pacific Conference for NDT (APCNDT)',
    startDate: '2025-02-18',
    endDate: '2025-02-22',
    city: 'Melbourne',
    country: 'Australia',
    region: 'Oceania',
    organizer: 'AINDT',
    description: 'Bringing together NDT professionals from across the Asia Pacific region to share knowledge and innovations.',
    imageUrl: 'https://picsum.photos/seed/apcndt25/600/400',
    website: '#',
  },
  {
    id: 'event-06',
    title: 'Digital NDT 2025',
    startDate: '2025-06-25',
    endDate: '2025-06-27',
    city: 'Munich',
    country: 'Germany',
    region: 'Europe',
    organizer: 'DGZfP',
    description: 'A specialized conference focusing on the digitalization of NDT, including topics like AI, digital twins, and automated systems.',
    imageUrl: 'https://picsum.photos/seed/digitalndt25/600/400',
    website: '#',
  },
  {
    id: 'event-09',
    title: 'Materials Testing 2025',
    startDate: '2025-09-02',
    endDate: '2025-09-04',
    city: 'Telford',
    country: 'UK',
    region: 'Europe',
    organizer: 'BINDT',
    description: 'The leading international exhibition for the materials testing, non-destructive testing, and condition monitoring sectors.',
    imageUrl: 'https://picsum.photos/seed/mt25/600/400',
    website: '#',
  },
  {
    id: 'event-05',
    title: 'Middle East NDT Conference and Exhibition',
    startDate: '2025-09-15',
    endDate: '2025-09-17',
    city: 'Manama',
    country: 'Bahrain',
    region: 'Middle East',
    organizer: 'ASNT Saudi Arabian Section',
    description: 'The premier NDT event in the Middle East, focusing on challenges and solutions in the oil & gas and power sectors.',
    imageUrl: 'https://picsum.photos/seed/mendt25/600/400',
    website: '#',
  },
];
