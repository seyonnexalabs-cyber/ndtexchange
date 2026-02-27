export type NDTEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  region: 'North America' | 'Europe' | 'Asia' | 'South America' | 'Africa' | 'Oceania';
  imageUrl: string;
  imageHint: string;
  url: string;
};

export const ndtEvents: NDTEvent[] = [
  {
    id: 'event-01',
    title: 'ASNT 2024: The Annual Conference',
    description: 'Connect with the NDT community, explore new technologies, and advance your career with top-tier programming.',
    date: '2024-10-21',
    location: 'Las Vegas, NV, USA',
    region: 'North America',
    imageUrl: 'https://images.unsplash.com/photo-1577033521254-8c79213d2894?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxsYXMlMjB2ZWdhc3xlbnwwfHx8fDE3NjkwMTU0ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'las vegas',
    url: 'https://asnt.org/annual',
  },
  {
    id: 'event-02',
    title: '14th European Conference on NDT (ECNDT)',
    description: 'ECNDT is one of the most important events for the European NDT community, held every four years.',
    date: '2026-06-08',
    location: 'Lisbon, Portugal',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1587899912079-2e0081033a36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxsaXNib258ZW58MHx8fHwxNzY5MDExODI4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'lisbon',
    url: 'https://www.ecndt2026.com/',
  },
  {
    id: 'event-03',
    title: 'BINDT NDT 2024 Conference and Exhibition',
    description: 'The British Institute of Non-Destructive Testing\'s flagship annual conference.',
    date: '2024-09-03',
    location: 'Telford, United Kingdom',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxsb25kb258ZW58MHx8fHwxNzY5MDExODczfDA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'london',
    url: 'https://www.bindt.org/events/ndt-2024/',
  },
  {
    id: 'event-04',
    title: '20th World Conference on Non-Destructive Testing',
    description: 'The premier global event for NDT professionals, held every four years.',
    date: '2028-05-22',
    location: 'Incheon, South Korea',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1577789724645-814138b05f2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzZW91bCUyMHNvdXRoJTIwa29yZWF8ZW58MHx8fHwxNzY5MDExODc0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'seoul south korea',
    url: 'https://www.wcndt2028.com/',
  },
  {
    id: 'event-05',
    title: 'NDT-CE 2025 - International Symposium NDT in Civil Engineering',
    description: 'A specialized symposium focusing on the application of NDT in the civil engineering sector.',
    date: '2025-08-25',
    location: 'Tokyo, Japan',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHx0b2t5b3xlbnwwfHx8fDE3NjkwMTE4NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'tokyo japan',
    url: 'https://www.jsndi.jp/ndt-ce2025/',
  },
  {
    id: 'event-06',
    title: 'Pan-American Conference for NDT (PANNDT)',
    description: 'A major NDT event for professionals in North, Central, and South America.',
    date: '2027-06-14',
    location: 'São Paulo, Brazil',
    region: 'South America',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzYW8lMjBwYXVsbyUyMGJyYXppbHxlbnwwfHx8fDE3NjkwMTU0ODd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'sao paulo',
    url: 'https://panndt.org/',
  },
];
