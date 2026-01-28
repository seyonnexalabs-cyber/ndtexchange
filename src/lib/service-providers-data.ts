
export type NDTServiceProvider = {
    id: string;
    name: string;
    logoUrl: string;
    location: string;
    rating: number;
    techniques: string[];
    description: string;
}

export const serviceProviders: NDTServiceProvider[] = [
    {
        id: 'provider-01',
        name: 'MISTRAS Group',
        logoUrl: 'https://picsum.photos/seed/mistras/200/200',
        location: 'Princeton Jct, NJ, USA (Global)',
        rating: 4.8,
        techniques: ['UT', 'PAUT', 'RT', 'ET', 'AE', 'VT', 'MT', 'PT', 'IR'],
        description: 'A leading one-source provider of asset protection solutions used to evaluate the structural integrity of critical energy, industrial and public infrastructure.'
    },
    {
        id: 'provider-02',
        name: 'Applus+',
        logoUrl: 'https://picsum.photos/seed/applus/200/200',
        location: 'Barcelona, Spain (Global)',
        rating: 4.7,
        techniques: ['UT', 'PAUT', 'RT', 'ET', 'VT', 'MT', 'PT', 'LT'],
        description: 'A worldwide leader in the testing, inspection, and certification sector, providing solutions for clients in all types of industries.'
    },
    {
        id: 'provider-03',
        name: 'TEAM, Inc.',
        logoUrl: 'https://picsum.photos/seed/team/200/200',
        location: 'Sugar Land, TX, USA (Global)',
        rating: 4.5,
        techniques: ['UT', 'PAUT', 'RT', 'ET', 'VT', 'MT', 'PT', 'IR'],
        description: 'A leading provider of integrated, digitally-enabled asset performance assurance and optimization solutions.'
    },
    {
        id: 'provider-04',
        name: 'TÜV Rheinland',
        logoUrl: 'https://picsum.photos/seed/tuv/200/200',
        location: 'Cologne, Germany (Global)',
        rating: 4.9,
        techniques: ['UT', 'PAUT', 'RT', 'ET', 'VT', 'MT', 'PT', 'LT', 'TOFD'],
        description: 'Global leader in independent inspection services, founded 150 years ago. Stands for safety and quality in virtually all areas of business and life.'
    },
    {
        id: 'provider-05',
        name: 'Intertek',
        logoUrl: 'https://picsum.photos/seed/intertek/200/200',
        location: 'London, UK (Global)',
        rating: 4.6,
        techniques: ['UT', 'PAUT', 'RT', 'ET', 'VT', 'MT', 'PT'],
        description: 'A leading Total Quality Assurance provider to industries worldwide, helping clients ensure their products, processes, and assets meet quality and safety standards.'
    },
    {
        id: 'provider-06',
        name: 'Acuren',
        logoUrl: 'https://picsum.photos/seed/acuren/200/200',
        location: 'St. John, Canada (North America)',
        rating: 4.7,
        techniques: ['UT', 'PAUT', 'RT', 'ET', 'VT', 'MT', 'PT', 'IR'],
        description: 'The largest inspection services company in North America, offering a comprehensive suite of NDT, inspection, and engineering services.'
    },
     {
        id: 'provider-07',
        name: 'Dekra',
        logoUrl: 'https://picsum.photos/seed/dekra/200/200',
        location: 'Stuttgart, Germany (Global)',
        rating: 4.8,
        techniques: ['UT', 'RT', 'MT', 'PT', 'VT', 'ET', 'LT'],
        description: 'One of the world’s leading expert organizations in the testing, inspection, and certification sector.'
    },
    {
        id: 'provider-08',
        name: 'Bureau Veritas',
        logoUrl: 'https://picsum.photos/seed/bureauveritas/200/200',
        location: 'Paris, France (Global)',
        rating: 4.7,
        techniques: ['UT', 'PAUT', 'RT', 'MT', 'PT', 'VT', 'ET'],
        description: 'A world leader in laboratory testing, inspection, and certification services, with a strong presence in the industrial and infrastructure sectors.'
    },
    {
        id: 'provider-09',
        name: 'Blue Horizon Services',
        logoUrl: 'https://picsum.photos/seed/bluehoriz/200/200',
        location: 'Abu Dhabi, UAE',
        rating: 4.6,
        techniques: ['PAUT', 'TOFD', 'AE', 'GWT', 'VT'],
        description: "Specialists in advanced ultrasonic and acoustic emission technologies. Headquarters: Warehouse C3 01, Mussafah South, ICAD 3, Abu Dhabi. Email: ask@bluehoriz.com, Phone: +971 24440461. Contact: Mr Tawfik Mohamed."
    },
    {
        id: 'provider-10',
        name: 'Arise Global',
        logoUrl: 'https://picsum.photos/seed/ariseglobal/200/200',
        location: 'Singapore',
        rating: 4.7,
        techniques: ['AE', 'APR', 'ACFM', 'Corrosion Mapping', 'GWT', 'MFL', 'DR', 'HTHA', 'PAUT', 'PEC', 'RVI', 'SRUT', 'TOFD', 'Tube Inspection', 'Automated UT'],
        description: "A leading inspection and certification provider in Southeast Asia. Headquarters: 34 Toh Guan Road East, #01-12/13 Enterprise Hub, Singapore 608579. Email: ask@ariseglobal.com, Phone: +65 6559 4677."
    }
];
