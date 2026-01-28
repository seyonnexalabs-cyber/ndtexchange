
export type NDTServiceProvider = {
    id: string;
    name: string;
    logoUrl?: string;
    location: string;
    rating: number;
    techniques: string[];
    industries: string[];
    description: string;
}

export const serviceProviders: NDTServiceProvider[] = [
    {
        id: 'provider-01',
        name: 'MISTRAS Group',
        location: 'Princeton Jct, NJ, USA (Global)',
        rating: 4.8,
        techniques: ['UT', 'PAUT', 'RT', 'ET', 'AE', 'VT', 'MT', 'PT', 'IR'],
        industries: ['Oil & Gas', 'Power Generation', 'Aerospace & Defense'],
        description: 'A leading one-source provider of asset protection solutions used to evaluate the structural integrity of critical energy, industrial and public infrastructure.'
    },
    {
        id: 'provider-02',
        name: 'Applus+',
        location: 'Barcelona, Spain (Global)',
        rating: 4.7,
        techniques: ['UT', 'PAUT', 'RT', 'ET', 'VT', 'MT', 'PT', 'LT'],
        industries: ['Power Generation', 'Infrastructure', 'Marine'],
        description: 'A worldwide leader in the testing, inspection, and certification sector, providing solutions for clients in all types of industries.'
    },
    {
        id: 'provider-03',
        name: 'TEAM, Inc.',
        location: 'Sugar Land, TX, USA (Global)',
        rating: 4.5,
        techniques: ['UT', 'PAUT', 'RT', 'ET', 'VT', 'MT', 'PT', 'IR'],
        industries: ['Oil & Gas', 'Manufacturing', 'Power Generation'],
        description: 'A leading provider of integrated, digitally-enabled asset performance assurance and optimization solutions.'
    },
    {
        id: 'provider-04',
        name: 'TÜV Rheinland',
        location: 'Cologne, Germany (Global)',
        rating: 4.9,
        techniques: ['UT', 'PAUT', 'RT', 'ET', 'VT', 'MT', 'PT', 'LT', 'TOFD'],
        industries: ['Manufacturing', 'Infrastructure', 'Aerospace & Defense'],
        description: 'Global leader in independent inspection services, founded 150 years ago. Stands for safety and quality in virtually all areas of business and life.'
    },
    {
        id: 'provider-05',
        name: 'Intertek',
        location: 'London, UK (Global)',
        rating: 4.6,
        techniques: ['UT', 'PAUT', 'RT', 'ET', 'VT', 'MT', 'PT'],
        industries: ['Marine', 'Oil & Gas'],
        description: 'A leading Total Quality Assurance provider to industries worldwide, helping clients ensure their products, processes, and assets meet quality and safety standards.'
    },
    {
        id: 'provider-06',
        name: 'Acuren',
        location: 'St. John, Canada (North America)',
        rating: 4.7,
        techniques: ['UT', 'PAUT', 'RT', 'ET', 'VT', 'MT', 'PT', 'IR'],
        industries: ['Oil & Gas', 'Power Generation', 'Infrastructure'],
        description: 'The largest inspection services company in North America, offering a comprehensive suite of NDT, inspection, and engineering services.'
    },
     {
        id: 'provider-07',
        name: 'Dekra',
        location: 'Stuttgart, Germany (Global)',
        rating: 4.8,
        techniques: ['UT', 'RT', 'MT', 'PT', 'VT', 'ET', 'LT'],
        industries: ['Manufacturing', 'Marine', 'Infrastructure'],
        description: 'One of the world’s leading expert organizations in the testing, inspection, and certification sector.'
    },
    {
        id: 'provider-08',
        name: 'Bureau Veritas',
        location: 'Paris, France (Global)',
        rating: 4.7,
        techniques: ['UT', 'PAUT', 'RT', 'MT', 'PT', 'VT', 'ET'],
        industries: ['Marine', 'Infrastructure', 'Power Generation'],
        description: 'A world leader in laboratory testing, inspection, and certification services, with a strong presence in the industrial and infrastructure sectors.'
    },
    {
        id: 'provider-09',
        name: 'Blue Horizon Services',
        location: 'Abu Dhabi, UAE',
        rating: 4.6,
        techniques: ['UT', 'PAUT', 'TOFD', 'AE', 'GWT'],
        industries: ['Oil & Gas', 'Marine'],
        description: "Specialists in advanced ultrasonic and acoustic emission technologies. Headquarters: Warehouse C3 01, Mussafah South, ICAD 3, Abu Dhabi. Email: ask@bluehoriz.com, Phone: +971 24440461. Contact: Mr Tawfik Mohamed."
    },
    {
        id: 'provider-10',
        name: 'Arise Global',
        location: 'Singapore',
        rating: 4.7,
        techniques: ['AE', 'APR', 'ACFM', 'GWT', 'MFL', 'DR', 'PAUT', 'ET', 'RVI', 'TOFD', 'UT'],
        industries: ['Manufacturing', 'Aerospace & Defense'],
        description: "A leading inspection and certification provider in Southeast Asia. Headquarters: 34 Toh Guan Road East, #01-12/13 Enterprise Hub, Singapore 608579. Email: ask@ariseglobal.com, Phone: +65 6559 4677."
    }
];
