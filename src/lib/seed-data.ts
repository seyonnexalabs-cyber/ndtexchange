

import type { Asset, Job, InspectorAsset, PlatformUser, Client, Review, Subscription, Payment, JobPayment, JobChat, Notification, UserAuditLog, JobAuditLog, BillingAuditLog, NDTServiceProvider, AuditFirm, Inspection, Bid, Manufacturer, NDTTechnique } from '@/lib/types';
import { subscriptionPlans } from './subscription-plans';

// This file serves as the master data source for seeding the Firestore database.
// The application itself should NOT import data from this file for rendering.
// Instead, components should use the Firebase hooks (useCollection, useDoc) to fetch live data.
// The only exception is the database seeding function on the admin dashboard.

export const NDTTechniques: NDTTechnique[] = [
    { id: 'UT', acronym: 'UT', title: 'Ultrasonic Testing', description: 'Uses high-frequency sound waves to detect flaws or measure thickness.', isHighlighted: true, imageId: 'tech-ut' },
    { id: 'PAUT', acronym: 'PAUT', title: 'Phased Array Ultrasonic Testing', description: 'An advanced UT method that uses multiple ultrasonic elements to steer beams and create detailed images.', isHighlighted: false, imageId: 'tech-ut' },
    { id: 'TOFD', acronym: 'TOFD', title: 'Time-of-Flight Diffraction', description: 'An advanced UT method for finding and sizing flaws with high accuracy, especially in welds.', isHighlighted: false, imageId: 'tech-ut' },
    { id: 'RT', acronym: 'RT', title: 'Radiographic Testing', description: 'Uses X-rays or gamma rays to see inside a material and find flaws.', isHighlighted: true, imageId: 'tech-rt' },
    { id: 'CR', acronym: 'CR', title: 'Computed Radiography', description: 'Uses flexible imaging plates to capture digital images, replacing traditional X-ray film.', isHighlighted: false, imageId: 'tech-rt' },
    { id: 'DR', acronym: 'DR', title: 'Digital Radiography', description: 'Uses flat-panel detectors for real-time digital imaging, offering immediate results.', isHighlighted: false, imageId: 'tech-rt' },
    { id: 'MT', acronym: 'MT', title: 'Magnetic Particle Testing', description: 'Finds surface and near-surface flaws in ferromagnetic materials by applying magnetic fields.', isHighlighted: true, imageId: 'tech-mt' },
    { id: 'PT', acronym: 'PT', title: 'Liquid Penetrant Testing', description: 'Uses a liquid dye to find surface-breaking defects in non-porous materials.', isHighlighted: true, imageId: 'tech-pt' },
    { id: 'VT', acronym: 'VT', title: 'Visual Testing', description: 'The most basic NDT method, involving the visual inspection of a component to find surface flaws.', isHighlighted: true, imageId: 'tech-vt' },
    { id: 'RVI', acronym: 'RVI', title: 'Remote Visual Inspection', description: 'Uses borescopes, videoscopes, or drones to visually inspect hard-to-reach areas.', isHighlighted: false, imageId: 'tech-vt' },
    { id: 'ET', acronym: 'ET', title: 'Eddy Current Testing', description: 'Uses electromagnetic induction to detect surface and near-surface flaws in conductive materials.', isHighlighted: false, imageId: 'tech-et' },
    { id: 'AE', acronym: 'AE', title: 'Acoustic Emission Testing', description: 'Listens for the high-frequency sounds (acoustic emissions) released by materials under stress.', isHighlighted: true, imageId: 'tech-ae' },
    { id: 'GWT', acronym: 'GWT', title: 'Guided Wave Testing', description: 'Screens long lengths of pipes or structures from a single test point using low-frequency sound waves.', isHighlighted: false, imageId: 'tech-other' },
    { id: 'APR', acronym: 'APR', title: 'Acoustic Pulse Reflectometry', description: 'An advanced acoustic technique used to inspect tubes from the inside, detecting blockages and wall loss.', isHighlighted: false, imageId: 'tech-apr' },
    { id: 'MFL', acronym: 'MFL', title: 'Magnetic Flux Leakage', description: 'Detects corrosion and pitting in steel structures, commonly used for tank floors and pipelines.', isHighlighted: false, imageId: 'tech-mt' },
    { id: 'ACFM', acronym: 'ACFM', title: 'Alternating Current Field Measurement', description: 'An electromagnetic technique for detecting and sizing surface-breaking cracks in metallic components.', isHighlighted: false, imageId: 'tech-et' },
    { id: 'IR', acronym: 'IR', title: 'Infrared Thermography', description: 'Detects temperature differences to find issues like electrical faults, insulation gaps, or material thinning.', isHighlighted: false, imageId: 'tech-ir' },
    { id: 'LT', acronym: 'LT', title: 'Leak Testing', description: 'Detects and locates leaks in pressurized or vacuum systems using various methods like bubble testing or pressure change.', isHighlighted: false, imageId: 'tech-lt' },
];

export const manufacturersData: Manufacturer[] = [
  { id: 'manu-01', name: 'Olympus', url: 'https://www.olympus-ims.com/', logoUrl: 'https://placehold.co/200x80/0055A8/FFFFFF/png?text=OLYMPUS', description: 'A leading manufacturer of optical and digital precision technology.', techniqueIds: ['UT', 'PAUT', 'ET', 'VT'] },
  { id: 'manu-02', name: 'GE Inspection Technologies', url: 'https://www.bakerhughes.com/waygate-technologies', logoUrl: 'https://placehold.co/200x80/00A9E0/FFFFFF/png?text=GE', description: 'Provides a wide range of non-destructive testing solutions.', techniqueIds: ['UT', 'RT', 'ET', 'VT'] },
  { id: 'manu-03', name: 'Zetec', url: 'https://www.zetec.com/', logoUrl: 'https://placehold.co/200x80/D9232D/FFFFFF/png?text=Zetec', description: 'A global leader in nondestructive testing (NDT) solutions for the critical inspection needs of industries.', techniqueIds: ['ET', 'PAUT', 'UT'] },
  { id: 'manu-04', name: 'Sonatest', url: 'https://www.sonatest.com/', logoUrl: 'https://placehold.co/200x80/00AEEF/FFFFFF/png?text=Sonatest', description: 'A leading manufacturer of ultrasonic NDT equipment.', techniqueIds: ['UT', 'PAUT', 'TOFD'] },
  { id: 'manu-05', name: 'Fujifilm', url: 'https://www.fujifilm.com/us/en/business/ndt', description: 'Provider of high-quality imaging products for radiographic testing.', techniqueIds: ['RT', 'CR', 'DR'] },
  { id: 'manu-06', name: 'Carestream', url: 'https://www.carestream.com/en/us/nondestructive-testing', description: 'Offers a range of digital radiography solutions.', techniqueIds: ['RT', 'CR', 'DR'] },
  { id: 'manu-07', name: 'Magnaflux', url: 'https://www.magnaflux.com/', description: 'A global leader in magnetic particle and liquid penetrant inspection materials and equipment.', techniqueIds: ['MT', 'PT'] },
  { id: 'manu-08', name: 'Physical Acoustics Corp (PAC)', url: 'https://www.physicalacoustics.com/', description: 'A member of the MISTRAS Group, specializing in acoustic emission technology.', techniqueIds: ['AE'] },
  { id: 'manu-09', name: 'Talcyon', url: 'https://www.talcyon.com/', description: 'Developer of Acoustic Pulse Reflectometry (APR) for tube inspections.', techniqueIds: ['APR'] },
  { id: 'manu-10', name: 'Guided Ultrasonics Ltd (GUL)', url: 'https://www.guided-ultrasonics.com/', description: 'Pioneers and leaders in the field of guided wave testing technology.', techniqueIds: ['GWT'] }
];

export const clientData: Client[] = [
    { id: 'client-01', type: 'Client', name: 'Global Energy Corp.', contactPerson: 'John Doe', contactEmail: 'john.d@globalenergy.corp', activeJobs: 3, totalSpend: 250000, logoUrl: 'https://placehold.co/200x80/0033A0/FFFFFF/png?text=Global+Energy', brandColor: '#0033A0' },
    { id: 'client-02', type: 'Client', name: 'Marine Tankers Ltd.', contactPerson: 'Sarah Johnson', contactEmail: 's.johnson@marinetankers.com', activeJobs: 1, totalSpend: 93000 },
    { id: 'client-03', type: 'Client', name: 'Energy Transfer', contactPerson: 'Mike Williams', contactEmail: 'm.williams@energytransfer.com', activeJobs: 1, totalSpend: 120000 },
    { id: 'client-04', type: 'Client', name: 'State Department of Transportation', contactPerson: 'Emily White', contactEmail: 'ewhite@dot.state.gov', activeJobs: 1, totalSpend: 8200 },
    { id: 'client-05', type: 'Client', name: 'Chemical Plant C', contactPerson: 'Carlos Ruiz', contactEmail: 'c.ruiz@chemc.com', activeJobs: 2, totalSpend: 24500 },
    { id: 'client-06', type: 'Client', name: 'Power Generation LLC', contactPerson: 'Power Admin', contactEmail: 'admin@powergen.com', activeJobs: 2, totalSpend: 56500 },
    { id: 'client-07', type: 'Client', name: 'Port Authority', contactPerson: 'Port Manager', contactEmail: 'manager@portauthority.com', activeJobs: 1, totalSpend: 0 },
    { id: 'client-08', type: 'Client', name: 'Manufacturing Solutions Inc.', contactPerson: 'Factory Manager', contactEmail: 'fm@mansol.com', activeJobs: 1, totalSpend: 3500 },
    { id: 'client-09', type: 'Client', name: 'Aviation Maintenance Pros', contactPerson: 'Chuck Yeager', contactEmail: 'chuck@avpros.com', activeJobs: 2, totalSpend: 45000 },
];

export const serviceProviders: NDTServiceProvider[] = [
    {
        id: 'provider-01',
        name: 'MISTRAS Group',
        type: 'Provider',
        contactPerson: 'Ben Carter',
        contactEmail: 'ben.carter@mistras.com',
        location: 'Princeton Jct, NJ, USA (Global)',
        rating: 4.8,
        techniques: ['UT', 'PAUT', 'RT', 'ET', 'AE', 'VT', 'MT', 'PT', 'IR'],
        industries: ['Oil & Gas', 'Power Generation', 'Aerospace & Defense'],
        description: 'A leading one-source provider of asset protection solutions used to evaluate the structural integrity of critical energy, industrial and public infrastructure.'
    },
    {
        id: 'provider-02',
        name: 'Applus+',
        type: 'Provider',
        contactPerson: 'David Lee',
        contactEmail: 'david.lee@applus.com',
        location: 'Barcelona, Spain (Global)',
        rating: 4.7,
        techniques: ['UT', 'PAUT', 'RT', 'ET', 'VT', 'MT', 'PT', 'LT'],
        industries: ['Power Generation', 'Infrastructure', 'Marine'],
        description: 'A worldwide leader in the testing, inspection, and certification sector, providing solutions for clients in all types of industries.'
    },
    {
        id: 'provider-03',
        name: 'TEAM, Inc.',
        type: 'Provider',
        logoUrl: 'https://placehold.co/200x80/FF6600/FFFFFF/png?text=TEAM',
        brandColor: '#FF6600',
        contactPerson: 'Maria Garcia',
        contactEmail: 'maria.garcia@teaminc.com',
        location: 'Sugar Land, TX, USA (Global)',
        rating: 4.5,
        techniques: ['UT', 'PAUT', 'RT', 'ET', 'VT', 'MT', 'PT', 'IR'],
        industries: ['Oil & Gas', 'Manufacturing', 'Power Generation'],
        description: 'A leading provider of integrated, digitally-enabled asset performance assurance and optimization solutions.'
    },
    {
        id: 'provider-04',
        name: 'TÜV Rheinland',
        type: 'Provider',
        contactPerson: 'Samantha Wu',
        contactEmail: 'samantha.wu@tuv.com',
        location: 'Cologne, Germany (Global)',
        rating: 4.9,
        techniques: ['UT', 'PAUT', 'RT', 'ET', 'VT', 'MT', 'PT', 'LT', 'TOFD'],
        industries: ['Manufacturing', 'Infrastructure', 'Aerospace & Defense'],
        description: 'Global leader in independent inspection services, founded 150 years ago. Stands for safety and quality in virtually all areas of business and life.'
    },
    {
        id: 'provider-05',
        name: 'Intertek',
        type: 'Provider',
        contactPerson: 'Peter Jones',
        contactEmail: 'peter.jones@intertek.com',
        location: 'London, UK (Global)',
        rating: 4.6,
        techniques: ['UT', 'PAUT', 'RT', 'ET', 'VT', 'MT', 'PT'],
        industries: ['Marine', 'Oil & Gas'],
        description: 'A leading Total Quality Assurance provider to industries worldwide, helping clients ensure their products, processes, and assets meet quality and safety standards.'
    },
    {
        id: 'provider-06',
        name: 'Acuren',
        type: 'Provider',
        contactPerson: 'Sarah Brown',
        contactEmail: 'sarah.brown@acuren.com',
        location: 'St. John, Canada (North America)',
        rating: 4.7,
        techniques: ['UT', 'PAUT', 'RT', 'ET', 'VT', 'MT', 'PT', 'IR'],
        industries: ['Oil & Gas', 'Power Generation', 'Infrastructure'],
        description: 'The largest inspection services company in North America, offering a comprehensive suite of NDT, inspection, and engineering services.'
    },
     {
        id: 'provider-07',
        name: 'Dekra',
        type: 'Provider',
        contactPerson: 'Hans Schmidt',
        contactEmail: 'hans.schmidt@dekra.com',
        location: 'Stuttgart, Germany (Global)',
        rating: 4.8,
        techniques: ['UT', 'RT', 'MT', 'PT', 'VT', 'ET', 'LT'],
        industries: ['Manufacturing', 'Marine', 'Infrastructure'],
        description: 'One of the world\'s leading expert organizations in the testing, inspection, and certification sector.'
    },
    {
        id: 'provider-08',
        name: 'Bureau Veritas',
        type: 'Provider',
        contactPerson: 'Juliette Dubois',
        contactEmail: 'j.dubois@bureauveritas.com',
        location: 'Paris, France (Global)',
        rating: 4.7,
        techniques: ['UT', 'PAUT', 'RT', 'MT', 'PT', 'VT', 'ET'],
        industries: ['Marine', 'Infrastructure', 'Power Generation'],
        description: 'A world leader in laboratory testing, inspection, and certification services, with a strong presence in the industrial and infrastructure sectors.'
    },
    {
        id: 'provider-09',
        name: 'Blue Horizon Services',
        type: 'Provider',
        contactPerson: 'Tawfik Mohamed',
        contactEmail: 'ask@bluehoriz.com',
        location: 'Abu Dhabi, UAE',
        rating: 4.6,
        techniques: ['AE', 'APR', 'ACFM', 'GWT', 'MFL', 'DR', 'PAUT', 'ET', 'RVI', 'TOFD', 'UT'],
        industries: ['Oil & Gas', 'Marine'],
        description: "Specialists in advanced ultrasonic and acoustic emission technologies. Headquarters: Warehouse C3 01, Mussafah South, ICAD 3, Abu Dhabi. Email: ask@bluehoriz.com, Phone: +971 24440461. Contact: Mr Tawfik Mohamed."
    },
    {
        id: 'provider-10',
        name: 'Arise Global',
        type: 'Provider',
        contactPerson: 'Chen Wei',
        contactEmail: 'chen.wei@ariseglobal.com',
        location: 'Singapore',
        rating: 4.7,
        techniques: ['AE', 'APR', 'ACFM', 'GWT', 'MFL', 'DR', 'PAUT', 'ET', 'RVI', 'TOFD', 'UT'],
        industries: ['Manufacturing', 'Aerospace & Defense'],
        description: "A leading inspection and certification provider in Southeast Asia. Headquarters: 34 Toh Guan Road East, #01-12/13 Enterprise Hub, Singapore 608579. Email: ask@ariseglobal.com, Phone: +65 6559 4677."
    },
    {
        id: 'provider-11',
        name: 'SGS',
        type: 'Provider',
        contactPerson: 'Isabelle Laurent',
        contactEmail: 'isabelle.laurent@sgs.com',
        location: 'Geneva, Switzerland (Global)',
        rating: 4.8,
        techniques: ['UT', 'RT', 'MT', 'PT', 'VT', 'ET', 'LT'],
        industries: ['Manufacturing', 'Infrastructure', 'Oil & Gas'],
        description: 'The world\'s leading inspection, verification, testing and certification company. Recognized as the global benchmark for quality and integrity.'
    },
    {
        id: 'provider-12',
        name: 'DNV (Det Norske Veritas)',
        type: 'Provider',
        contactPerson: 'Lars Andersen',
        contactEmail: 'lars.andersen@dnv.com',
        location: 'Høvik, Norway (Global)',
        rating: 4.9,
        techniques: ['UT', 'AE', 'GWT', 'VT', 'MT', 'PT'],
        industries: ['Marine', 'Oil & Gas', 'Power Generation'],
        description: 'An independent expert in assurance and risk management. Driven by its purpose, to safeguard life, property and the environment, DNV empowers its customers and their stakeholders with facts and reliable insights.'
    },
    {
        id: 'provider-ndtx',
        name: 'NDT EXCHANGE',
        type: 'Provider',
        contactPerson: 'Admin User',
        contactEmail: 'admin@ndtexchange.com',
        location: 'Palo Alto, CA',
        rating: 5.0,
        techniques: ['ALL'],
        industries: ['Software'],
        description: 'The platform provider.'
    }
];

export const auditFirms: AuditFirm[] = [
    {
        id: 'auditor-firm-01',
        name: 'NDT Auditors LLC',
        type: 'Auditor',
        contactPerson: 'Alex Chen',
        contactEmail: 'alex.c@ndtauditors.gov',
        location: 'Washington, D.C., USA',
        services: ['Compliance Audits', 'Level III Services', 'Procedure Development'],
        industries: ['Oil & Gas', 'Power Generation', 'Infrastructure'],
        description: 'A specialized firm providing independent third-party auditing and Level III consulting services to ensure regulatory compliance and quality assurance.'
    },
    {
        id: 'auditor-firm-02',
        name: 'Aero-Compliance Partners',
        type: 'Auditor',
        contactPerson: 'Brenda Vance',
        contactEmail: 'b.vance@aerocompliance.com',
        location: 'Seattle, WA, USA',
        services: ['Procedure Development', 'Level III Services', 'Vendor Audits'],
        industries: ['Aerospace & Defense', 'Manufacturing'],
        description: 'Experts in aerospace NDT compliance, offering certified Level III services and procedure development to meet stringent aviation standards.'
    },
    {
        id: 'auditor-firm-03',
        name: 'Global Compliance Experts',
        type: 'Auditor',
        contactPerson: 'Kenji Tanaka',
        contactEmail: 'k.tanaka@globalcompliance.com',
        location: 'Tokyo, Japan',
        services: ['Compliance Audits', 'Vendor Audits', 'Procedure Development'],
        industries: ['Manufacturing', 'Power Generation', 'Marine'],
        description: 'A global leader in providing comprehensive compliance and auditing services with a focus on manufacturing and energy sectors.'
    }
];

export const clientAssets: Asset[] = [
    { id: 'ASSET-001', companyId: 'client-02', name: 'Storage Tank T-101', type: 'Tank', location: 'Refinery A', status: 'Operational', nextInspection: '2024-09-15', manufacturer: 'Pro-Fab Tanks', serialNumber: 'SN-A1B2C3D4', installationDate: '2018-05-20', thumbnailUrl: 'https://images.unsplash.com/photo-1766560505794-3d3978bf5f89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxpbmR1c3RyaWFsJTIwdGFua3xlbnwwfHx8fDE3NjkwMTUzMjZ8MA&ixlib=rb-4.1.0&q=80&w=1080', approvalStatus: 'Approved', history: [
        { user: 'John Doe', timestamp: '2024-07-20T08:00:00Z', action: 'Routine Check Logged: Daily Visual', details: 'Issues Found: No. Notes: All clear.' },
        { user: 'Admin', timestamp: '2018-05-20T09:00:00Z', action: 'Asset Created' }
    ] },
    { id: 'ASSET-006', companyId: 'client-01', name: 'Cooling Tower Piping', type: 'Piping', location: 'Refinery A', status: 'Operational', nextInspection: '2025-02-20', manufacturer: 'FlowLine Pipes', serialNumber: 'SN-E5F6G7H8', installationDate: '2019-11-10', thumbnailUrl: 'https://images.unsplash.com/photo-1729954924953-ff957b3e9edc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxjb29saW5nJTIwdG93ZXJ8ZW58MHx8fHwxNzY5MDE1MzIyfDA&ixlib=rb-4.1.0&q=80&w=1080', approvalStatus: 'Approved' },
    { id: 'ASSET-002', companyId: 'client-03', name: 'Main Steam Piping', type: 'Piping', location: 'Power Plant B', status: 'Requires Inspection', nextInspection: '2024-07-20', manufacturer: 'US Pipe', serialNumber: 'SN-I9J0K1L2', installationDate: '2015-03-12', thumbnailUrl: 'https://images.unsplash.com/photo-1578337159840-ec3abc0b0d17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8aW5kdXN0cmlhbCUyMHBpcGVzfGVufDB8fHx8fDE3NjkwMDY4MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080', approvalStatus: 'Approved' },
    { id: 'ASSET-003', companyId: 'client-05', name: 'Pressure Vessel PV-203', type: 'Vessel', location: 'Chemical Plant C', status: 'Operational', nextInspection: '2025-01-10', manufacturer: 'Vessel Works', model: 'VW-2000', serialNumber: 'SN-M3N4O5P6', installationDate: '2020-01-15', thumbnailUrl: 'https://images.unsplash.com/photo-1588877981142-0851cb22ad89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxwcmVzc3VyZSUyMHZlc3NlbHxlbnwwfHx8fDE3NjkwMTUzMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080', approvalStatus: 'Approved' },
    { id: 'ASSET-004', companyId: 'client-01', name: 'Overhead Crane C-01', type: 'Crane', location: 'Refinery A', status: 'Under Repair', nextInspection: '2024-08-01', manufacturer: 'Konecranes', model: 'CXT', serialNumber: 'SN-Q7R8S9T0', installationDate: '2017-09-01', notes: 'Motor requires replacement. Scheduled for Q3 service.', thumbnailUrl: 'https://images.unsplash.com/photo-1575230167650-dce335edc7f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxjb25zdHJ1Y3Rpb24lMjBjcmFuZXxlbnwwfHx8fDE3Njg5NTA2MjB8MA&ixlib=rb-4.1.0&q=80&w=1080', approvalStatus: 'Approved' },
    { id: 'ASSET-005', companyId: 'client-04', name: 'Structural Weld SW-05', type: 'Weld Joint', location: 'Bridge E', status: 'Operational', nextInspection: '2024-11-22', notes: 'Critical load-bearing weld on main support beam.', thumbnailUrl: 'https://images.unsplash.com/photo-1632838961436-26d62b5ffbc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHx3ZWxkJTIwam9pbnR8ZW58MHx8fHwxNzY5MDE1MzIyfDA&ixlib=rb-4.1.0&q=80&w=1080', approvalStatus: 'Approved' },
    { id: 'ASSET-007', companyId: 'client-06', name: 'Condensate Storage Tank', type: 'Tank', location: 'Power Plant B', status: 'Requires Inspection', nextInspection: '2024-08-30', manufacturer: 'Pro-Fab Tanks', serialNumber: 'SN-U1V2W3X4', installationDate: '2016-07-22', thumbnailUrl: 'https://images.unsplash.com/photo-1638294834907-d11608bc11d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxzdG9yYWdlJTIwdGFua3xlbnwwfHx8fDE3NjkwMDIyMTZ8MA&ixlib=rb-4.1.0&q=80&w=1080', approvalStatus: 'Approved' },
    { id: 'ASSET-008', companyId: 'client-05', name: 'Process Piping Unit 5', type: 'Piping', location: 'Chemical Plant C', status: 'Operational', nextInspection: '2025-03-01', manufacturer: 'FlowLine Pipes', serialNumber: 'SN-Y5Z6A7B8', installationDate: '2021-02-18', thumbnailUrl: 'https://images.unsplash.com/photo-1578776349090-de61da00ff1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxjaGVtaWNhbCUyMHBsYW50fGVufDB8fHx8fDE3NjODk5OTQxOXww&ixlib=rb-4.1.0&q=80&w=1080', approvalStatus: 'Approved' },
    { id: 'ASSET-009', companyId: 'client-07', name: 'Gantry Crane G-02', type: 'Crane', location: 'Port Terminal F', status: 'Operational', nextInspection: '2024-12-01', manufacturer: 'Liebherr', model: 'LTM 1050', serialNumber: 'SN-C9D0E1F2', installationDate: '2019-08-05', thumbnailUrl: 'https://images.unsplash.com/photo-1759390304074-dc0bb44b5f4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8Z2FudHJ5JTIwY3JhbmV8ZW58MHx8fHwxNzY5MDAyMjE2fDA&ixlib=rb-4.1.0&q=80&w=1080', approvalStatus: 'Approved' },
    { id: 'ASSET-010', companyId: 'client-01', name: 'Heat Exchanger E-401', type: 'Vessel', location: 'Refinery A', status: 'Requires Inspection', nextInspection: '2024-07-30', manufacturer: 'HeatEx Inc.', model: 'HE-500', serialNumber: 'SN-G3H4I5J6', installationDate: '2019-01-20', approvalStatus: 'Approved' },
    { id: 'ASSET-PEND-01', companyId: 'client-01', name: 'New Pipeline Segment', type: 'Piping', location: 'Refinery A', status: 'Requires Inspection', approvalStatus: 'Pending Approval', nextInspection: '2025-06-01', notes: 'Newly created asset awaiting admin approval.' },
];

export const inspectorAssets: InspectorAsset[] = [
    { 
        id: 'EQUIP-1000', 
        name: 'Olympus 45MG', 
        type: 'Instrument',
        manufacturer: 'Olympus',
        model: '45MG',
        serialNumber: 'SN-45MG-12345',
        techniques: ['UT'], 
        providerId: 'provider-03',
        status: 'Available', 
        approvalStatus: 'Approved',
        nextCalibration: '2025-01-05',
        isPublic: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1732881112419-ca9ce3b852d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHx1bHRyYXNvbmljJTIwdGVzdGluZ3xlbnwwfHx8fDE3NjkwMTUzMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        history: [
            { event: 'Created', user: 'Admin User', timestamp: '2023-01-05T10:00:00Z', notes: 'Item created in inventory.' },
            { event: 'Checked In', user: 'Maria Garcia', timestamp: '2024-06-25T14:00:00Z', notes: 'Condition: Good. Job: Annual UT Thickness Survey.' },
            { event: 'Checked Out', user: 'Maria Garcia', timestamp: '2024-06-10T08:00:00Z', notes: 'Job: Annual UT Thickness Survey' },
        ]
    },
    { 
        id: 'EQUIP-1001', 
        name: '5MHz Phased Array Probe', 
        type: 'Probe',
        manufacturer: 'Olympus',
        model: '5L64-A2',
        serialNumber: 'SN-PROBE-67890',
        techniques: ['PAUT', 'UT'], 
        providerId: 'provider-03',
        status: 'In Use', 
        approvalStatus: 'Approved',
        nextCalibration: '2024-12-11',
        isPublic: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1732881112419-ca9ce3b852d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHx1bHRyYXNvbmljJTIwdGVzdGluZ3xlbnwwfHx8fDE3NjkwMTUzMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        parentId: 'EQUIP-1000',
        history: [
             { event: 'Assigned to Kit', user: 'Admin User', timestamp: '2023-02-10T11:05:00Z', notes: 'Assigned to Olympus 45MG kit.' },
             { event: 'Checked Out', user: 'Maria Garcia', timestamp: '2024-07-01T09:30:00Z', notes: 'Job: Pipeline Weld Inspections' },
             { event: 'Created', user: 'Admin User', timestamp: '2023-02-10T11:00:00Z', notes: 'Item created in inventory.' }
        ]
    },
    { 
        id: 'EQUIP-1002', 
        name: 'IIW Type 1 Block',
        type: 'Calibration Standard',
        manufacturer: 'Generic',
        techniques: ['UT', 'PAUT'], 
        providerId: 'provider-03',
        status: 'Available', 
        approvalStatus: 'Approved',
        nextCalibration: 'N/A',
        isPublic: false,
        parentId: 'EQUIP-1000',
        history: [
            { event: 'Assigned to Kit', user: 'Admin User', timestamp: '2023-01-15T16:05:00Z', notes: 'Assigned to Olympus 45MG kit.' },
            { event: 'Created', user: 'Admin User', timestamp: '2023-01-15T16:00:00Z', notes: 'Item created in inventory.' }
        ]
    },
    { 
        id: 'EQUIP-1003', 
        name: 'Parker B-300S Yoke', 
        type: 'Visual Aid',
        manufacturer: 'Parker Research Corp',
        model: 'B-300S',
        serialNumber: 'SN-YOKE-ABCDE',
        techniques: ['MT'], 
        providerId: 'provider-03',
        status: 'Calibration Due', 
        approvalStatus: 'Approved',
        nextCalibration: '2024-07-30',
        isPublic: false,
        thumbnailUrl: 'https://images.unsplash.com/photo-1729119578948-5c36e632fca6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8bWFnbmV0aWMlMjBwYXJ0aWNsZXxlbnwwfHx8fDE3NjkwMTUzMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        history: [
            { event: 'Set to Calibration Due', user: 'System', timestamp: '2024-07-15T00:00:00Z', notes: 'Automatic status change based on calibration date.' },
            { event: 'Checked In', user: 'Maria Garcia', timestamp: '2024-06-22T17:00:00Z', notes: 'Condition: Good. Job: MT Inspection on Crane Hooks' },
            { event: 'Checked Out', user: 'Maria Garcia', timestamp: '2024-06-21T09:00:00Z', notes: 'Job: MT Inspection on Crane Hooks' },
            { event: 'Created', user: 'Admin User', timestamp: '2023-03-01T12:00:00Z', notes: 'Item created in inventory.' }
        ]
    },
    {
        id: 'EQUIP-1004',
        name: 'Dolphin G3',
        type: 'Instrument',
        manufacturer: 'Talcyon',
        model: 'Dolphin G3',
        serialNumber: 'SN-G3-XYZ',
        techniques: ['APR'],
        providerId: 'provider-03',
        status: 'Available',
        approvalStatus: 'Approved',
        nextCalibration: '2025-03-01',
        isPublic: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1704741389627-5991d9953ba3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxzb3VuZCUyMHdhdmVzfGVufDB8fHx8fDE3Njg5Mjk0Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
        history: [
             { event: 'Created', user: 'Admin User', timestamp: '2024-05-20T10:00:00Z', notes: 'New advanced equipment added.' }
        ]
    },
    {
        id: 'EQUIP-PEND-01',
        name: 'New Eddy Current Probe',
        type: 'Probe',
        techniques: ['ET'],
        providerId: 'provider-03',
        status: 'Available',
        approvalStatus: 'Pending Approval',
        nextCalibration: '2025-07-01',
        isPublic: false,
        notes: 'Awaiting admin approval'
    }
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
const twoDaysAfterTomorrow = new Date(today);
twoDaysAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);
const nextMonth = new Date(today);
nextMonth.setMonth(nextMonth.getMonth() + 1);


const jobsData: Omit<Job, 'bids' | 'inspections'>[] = [
    { 
        id: 'JOB-001', 
        title: 'PAUT on Pressure Vessel Welds', 
        client: 'Chemical Plant C', 
        clientCompanyId: 'client-05',
        location: 'Baton Rouge, LA', 
        status: 'Posted', 
        postedDate: '2024-06-28',
        bidExpiryDate: nextWeek.toISOString().split('T')[0],
        assetIds: ['ASSET-003'], 
        workflow: 'level3',
        documents: [
            { name: 'Scope of Work.pdf', url: '#' },
            { name: 'Vessel Drawings.pdf', url: '#' },
            { name: 'Previous Inspection Report.pdf', url: '#' },
        ],
        history: [
            { user: 'Carlos Ruiz', timestamp: new Date('2024-06-28T10:00:00Z'), action: 'Created job and posted to marketplace.', statusChange: 'Posted' },
        ],
        techniques: ['PAUT'],
        jobType: 'project',
        industry: 'Chemical Processing',
        estimatedBudget: '$15,000',
        certificationsRequired: 'ASNT UT L-II'
    },
    { 
        id: 'JOB-002', 
        title: 'MT Inspection on Crane Hooks', 
        client: 'Global Energy Corp.', 
        clientCompanyId: 'client-01',
        providerId: 'provider-03',
        location: 'Long Beach, CA', 
        status: 'Revisions Requested', 
        postedDate: '2024-06-18', 
        scheduledStartDate: '2024-06-21', 
        scheduledEndDate: '2024-06-21', 
        technicianIds: ['NAXP822MG6cWlaCNkaqkYpxDRmQ2'], 
        equipmentIds: ['EQUIP-1003'], 
        assetIds: ['ASSET-004'], 
        workflow: 'level3',
        history: [
            { user: 'Alex Chen', timestamp: new Date('2024-06-23T10:00:00Z'), action: 'Auditor requested revisions.', details: 'Please clarify the distinction between the primary and secondary hooks in the summary. The client had specific concerns about the secondary hook that are not explicitly addressed.', statusChange: 'Revisions Requested' },
            { user: 'Maria Garcia', timestamp: new Date('2024-06-22T09:00:00Z'), action: 'Submitted inspection report.', documentName: 'Inspection_Report_JOB-002.pdf', statusChange: 'Report Submitted' },
            { user: 'Maria Garcia', timestamp: new Date('2024-06-21T08:00:00Z'), action: 'Assigned resources.', details: 'Assigned Maria Garcia, Parker B-300S' },
            { user: 'Maria Garcia', timestamp: new Date('2024-06-20T08:00:00Z'), action: 'Scheduled job.', details: 'Inspection scheduled for 2024-06-21', statusChange: 'Scheduled' },
            { user: 'John Doe', timestamp: new Date('2024-06-19T15:00:00Z'), action: 'Awarded job to provider "TEAM, Inc." for $4,800.', statusChange: 'Assigned' },
            { user: 'Maria Garcia', timestamp: new Date('2024-06-18T14:00:00Z'), action: 'Bid for $4,800 submitted by TEAM, Inc.', details: 'Includes on-site mobilization and reporting.' },
            { user: 'John Doe', timestamp: new Date('2024-06-18T10:00:00Z'), action: 'Created job and posted to marketplace.', statusChange: 'Posted' },
        ],
        documents: [
            { name: 'Crane_Maintenance_Manual.pdf', url: '#' },
            { name: 'Lifting_Procedure.pdf', url: '#' },
        ],
        techniques: ['MT'],
        jobType: 'callout',
        industry: 'Oil & Gas — Downstream/Refinery',
        estimatedBudget: '$5,000',
        certificationsRequired: 'ASNT MT L-II'
    },
    { id: 'JOB-003', title: 'Annual UT Thickness Survey', client: 'Marine Tankers Ltd.', clientCompanyId: 'client-02', providerId: 'provider-01', location: 'Vessel MT-Alpha', techniques: ['UT'], status: 'Completed', postedDate: '2024-05-15', scheduledStartDate: '2024-06-10', scheduledEndDate: '2024-06-12', technicianIds: ['user-tech-01'], equipmentIds: ['EQUIP-1000'], assetIds: ['ASSET-001'], workflow: 'standard', jobType: 'project', industry: 'Marine', certificationsRequired: 'ASNT UT L-I' },
    { 
        id: 'JOB-004', 
        title: 'Pipeline Weld Inspections', 
        client: 'Energy Transfer',
        clientCompanyId: 'client-03',
        providerId: 'provider-01', 
        location: 'Midland, TX', 
        status: 'In Progress', 
        postedDate: '2024-07-01', 
        scheduledStartDate: dayAfterTomorrow.toISOString().split('T')[0], 
        scheduledEndDate: twoDaysAfterTomorrow.toISOString().split('T')[0], 
        technicianIds: ['NAXP822MG6cWlaCNkaqkYpxDRmQ2'], 
        equipmentIds: ['EQUIP-1000', 'EQUIP-1001'], 
        assetIds: ['ASSET-002'], 
        workflow: 'level3',
        techniques: ['PAUT'],
        jobType: 'project',
        industry: 'Oil & Gas — Midstream',
        certificationsRequired: 'ASNT UT L-II PAUT'
    },
    { 
        id: 'JOB-005', 
        title: 'VT of Bridge Structural Welds', 
        client: 'State Department of Transportation', 
        clientCompanyId: 'client-04',
        location: 'Sacramento, CA', 
        status: 'Posted', 
        postedDate: '2024-07-02', 
        bidExpiryDate: nextWeek.toISOString().split('T')[0],
        assetIds: ['ASSET-005'], 
        workflow: 'standard',
        documents: [ { name: 'Bridge_Structural_Plans.pdf', url: '#' } ],
        techniques: ['VT'],
        jobType: 'project',
        industry: 'Infrastructure & Construction',
        certificationsRequired: 'CWI'
    },
    { id: 'JOB-006', title: 'RT on Boiler Tubes', client: 'Power Generation LLC', clientCompanyId: 'client-06', location: 'Houston, TX', status: 'Posted', postedDate: '2024-07-03', bidExpiryDate: nextWeek.toISOString().split('T')[0], workflow: 'level3', assetIds: ['ASSET-007'], techniques: ['RT'], jobType: 'shutdown', industry: 'Power Generation — Fossil Fuel', certificationsRequired: 'ASNT RT L-II' },
    { id: 'JOB-007', title: 'Eddy Current on Heat Exchanger Tubes', client: 'Chemical Plant C', clientCompanyId: 'client-05', providerId: 'provider-01', location: 'Baton Rouge, LA', status: 'Report Submitted', postedDate: '2024-07-05', scheduledStartDate: yesterday.toISOString().split('T')[0], scheduledEndDate: yesterday.toISOString().split('T')[0], assetIds: ['ASSET-003'], technicianIds: ['user-tech-01'], workflow: 'level3', techniques: ['ET'], jobType: 'project', industry: 'Chemical Processing', certificationsRequired: 'ASNT ET L-II' },
    { id: 'JOB-008', title: 'Emergency Repair Verification', client: 'Global Energy Corp.', clientCompanyId: 'client-01', providerId: 'provider-03', location: 'Long Beach, CA', status: 'Scheduled', postedDate: '2024-07-10', scheduledStartDate: tomorrow.toISOString().split('T')[0], scheduledEndDate: dayAfterTomorrow.toISOString().split('T')[0], technicianIds: ['NAXP822MG6cWlaCNkaqkYpxDRmQ2'], equipmentIds: ['EQUIP-1000'], assetIds: ['ASSET-004'], workflow: 'standard', techniques: ['UT'], jobType: 'callout', industry: 'Oil & Gas — Downstream/Refinery', certificationsRequired: 'ASNT UT L-II' },
    { 
        id: 'JOB-009', 
        title: 'APR Inspection of Boiler Tubes', 
        client: 'Chemical Plant C',
        clientCompanyId: 'client-05',
        location: 'Plaquemine, LA', 
        status: 'Posted', 
        postedDate: '2024-07-12',
        bidExpiryDate: nextMonth.toISOString().split('T')[0],
        assetIds: ['ASSET-008'], 
        workflow: 'auto',
        documents: [ { name: 'Boiler_Tube_Diagram.pdf', url: '#' } ],
        history: [ { user: 'Carlos Ruiz', timestamp: new Date('2024-07-12T11:00:00Z'), action: 'Created and posted job.', statusChange: 'Posted' } ],
        techniques: ['APR'],
        jobType: 'project',
        industry: 'Chemical Processing',
        certificationsRequired: 'OEM Certified'
    },
    { id: 'JOB-010', title: 'Gantry Crane Cable Inspection', client: 'Port Authority', clientCompanyId: 'client-07', providerId: 'provider-04', location: 'Port Terminal F', status: 'Completed', postedDate: '2024-07-08', scheduledStartDate: '2024-07-14', scheduledEndDate: '2024-07-15', technicianIds: ['user-tech-01'], assetIds: ['ASSET-009'], workflow: 'standard', techniques: ['VT'], jobType: 'project', industry: 'Marine', certificationsRequired: 'ASNT VT L-II' },
    { id: 'JOB-011', title: 'Tank Floor Corrosion Mapping', client: 'Marine Tankers Ltd.', clientCompanyId: 'client-02', providerId: 'provider-02', location: 'New Orleans, LA', status: 'Completed', postedDate: '2024-06-01', scheduledStartDate: '2024-06-20', scheduledEndDate: '2024-06-22', technicianIds: ['NAXP822MG6cWlaCNkaqkYpxDRmQ2'], assetIds: ['ASSET-007'], workflow: 'standard', techniques: ['UT', 'MFL'], jobType: 'project', industry: 'Marine', certificationsRequired: 'ASNT UT L-I' },
    { id: 'JOB-012', title: 'Advanced RT of Turbine Blades', client: 'Power Generation LLC', clientCompanyId: 'client-06', providerId: 'provider-01', location: 'Houston, TX', status: 'Paid', postedDate: '2024-05-01', scheduledStartDate: '2024-05-25', scheduledEndDate: '2024-05-26', technicianIds: ['user-tech-01'], assetIds: ['ASSET-007'], workflow: 'level3', techniques: ['DR'], jobType: 'project', industry: 'Power Generation — Fossil Fuel', certificationsRequired: 'ASNT DR L-II' },
    { id: 'JOB-013', title: 'Acoustic Emission Monitoring of Sphere Tank', client: 'Global Energy Corp.', clientCompanyId: 'client-01', providerId: 'provider-09', location: 'Freeport, TX', status: 'Assigned', postedDate: '2024-07-20', assetIds: ['ASSET-003'], workflow: 'level3', techniques: ['AE'], jobType: 'project', industry: 'Oil & Gas — Midstream', certificationsRequired: 'ASNT AE L-II' },
    { 
        id: 'JOB-014', 
        title: 'Internal Corrosion Mapping of Piping', 
        client: 'Energy Transfer',
        clientCompanyId: 'client-03',
        providerId: 'provider-03', 
        location: 'Permian Basin, TX', 
        status: 'In Progress', 
        postedDate: '2024-07-18', 
        scheduledStartDate: '2024-07-25', 
        scheduledEndDate: '2024-07-28', 
        technicianIds: ['NAXP822MG6cWlaCNkaqkYpxDRmQ2'], 
        equipmentIds: ['EQUIP-1000'], 
        assetIds: ['ASSET-002'], 
        workflow: 'standard',
        history: [
            { user: 'Maria Garcia', timestamp: new Date('2024-07-25T08:00:00Z'), action: 'Job status changed to In Progress.', statusChange: 'In Progress', details: 'Inspection work has commenced on site.' },
            { user: 'Maria Garcia', timestamp: new Date('2024-07-24T10:00:00Z'), action: 'Scheduled job.', statusChange: 'Scheduled', details: 'Inspection scheduled for 2024-07-25 to 2024-07-28' },
            { user: 'John Doe', timestamp: new Date('2024-07-19T13:00:00Z'), action: 'Awarded job to provider "TEAM, Inc." for $15,000.', statusChange: 'Assigned' },
            { user: 'Maria Garcia', timestamp: new Date('2024-07-18T16:00:00Z'), action: 'Bid for $15,000 submitted by TEAM, Inc.', details: 'Standard rates for pipeline corrosion mapping.' },
            { user: 'John Doe', timestamp: new Date('2024-07-18T09:00:00Z'), action: 'Created job and posted to marketplace.', statusChange: 'Posted' },
        ],
        techniques: ['UT'],
        jobType: 'project',
        industry: 'Oil & Gas — Midstream',
        certificationsRequired: 'ASNT UT L-II'
    },
    { id: 'JOB-015', title: 'Remote Visual Inspection of Gearbox', client: 'Manufacturing Solutions Inc.', clientCompanyId: 'client-08', providerId: 'provider-07', location: 'Detroit, MI', status: 'Completed', postedDate: '2024-07-01', scheduledStartDate: '2024-07-10', scheduledEndDate: '2024-07-10', technicianIds: ['user-tech-01'], assetIds: ['ASSET-004'], workflow: 'standard', techniques: ['RVI'], jobType: 'project', industry: 'Manufacturing', certificationsRequired: 'ASNT VT L-II' },
    { id: 'JOB-016', title: 'Tank Floor Corrosion Mapping', client: 'Marine Tankers Ltd.', clientCompanyId: 'client-02', status: 'Posted', postedDate: '2024-07-22', bidExpiryDate: nextMonth.toISOString().split('T')[0], assetIds: ['ASSET-001'], workflow: 'auto', techniques: ['MFL'], jobType: 'project', industry: 'Marine', certificationsRequired: 'ASNT MFL L-II' },
    { 
        id: 'JOB-017', 
        title: 'Shutdown Support - PT', 
        client: 'Global Energy Corp.', 
        clientCompanyId: 'client-01',
        providerId: 'provider-03', 
        location: 'Houston, TX', 
        status: 'Scheduled', 
        postedDate: '2024-07-25', 
        scheduledStartDate: nextWeek.toISOString().split('T')[0], 
        scheduledEndDate: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        assetIds: ['ASSET-003', 'ASSET-006'], 
        workflow: 'standard',
        techniques: ['PT'],
        jobType: 'shutdown',
        industry: 'Oil & Gas — Downstream/Refinery',
        certificationsRequired: 'ASNT PT L-II'
    },
    { id: 'JOB-018', title: 'Landing Gear Weld Inspection', client: 'Aviation Maintenance Pros', clientCompanyId: 'client-09', location: 'Wichita, KS', status: 'Posted', postedDate: '2024-07-28', bidExpiryDate: '2024-08-10', assetIds: ['ASSET-005'], workflow: 'level3', techniques: ['RT'], jobType: 'project', industry: 'Aerospace & Defense', certificationsRequired: 'ASNT RT L-II' },
    { id: 'JOB-019', title: 'Fuselage Skin Eddy Current Scan', client: 'Aviation Maintenance Pros', clientCompanyId: 'client-09', location: 'Wichita, KS', status: 'Posted', postedDate: '2024-07-29', bidExpiryDate: '2024-08-12', assetIds: ['ASSET-005'], workflow: 'standard', techniques: ['ET'], jobType: 'project', industry: 'Aerospace & Defense', certificationsRequired: 'ASNT ET L-II' },
    { id: 'JOB-020', title: 'Marine Riser Inspection', client: 'Global Energy Corp.', clientCompanyId: 'client-01', providerId: 'provider-12', location: 'Gulf of Mexico', status: 'Completed', postedDate: '2024-06-15', scheduledStartDate: '2024-07-01', scheduledEndDate: '2024-07-03', technicianIds: ['user-tech-01'], assetIds: ['ASSET-006'], workflow: 'standard', techniques: ['UT'], jobType: 'project', industry: 'Oil & Gas — Upstream', certificationsRequired: 'ASNT UT L-II' },
    { 
        id: 'JOB-021', 
        title: 'Tank Wall Thickness UT', 
        client: 'Global Energy Corp.', 
        clientCompanyId: 'client-01',
        providerId: 'provider-01',
        location: 'Houston, TX', 
        status: 'Client Review', 
        postedDate: '2024-07-15', 
        scheduledStartDate: '2024-07-22', 
        scheduledEndDate: '2024-07-22', 
        technicianIds: ['user-tech-01'], 
        equipmentIds: ['EQUIP-1000'], 
        assetIds: ['ASSET-001'], 
        workflow: 'standard',
        history: [
            { user: 'Maria Garcia', timestamp: new Date('2024-07-23T11:00:00Z'), action: 'Submitted inspection report.', documentName: 'Inspection_Report_JOB-021.pdf', statusChange: 'Report Submitted' },
            { user: 'John Doe', timestamp: new Date('2024-07-16T10:00:00Z'), action: 'Awarded job to MISTRAS Group.', statusChange: 'Assigned' },
        ],
        techniques: ['UT'],
        jobType: 'callout',
        industry: 'Oil & Gas — Downstream/Refinery',
        certificationsRequired: 'ASNT UT L-I'
    },
    { 
        id: 'JOB-022', 
        title: 'Nozzle Weld PAUT', 
        client: 'Global Energy Corp.',
        clientCompanyId: 'client-01',
        providerId: 'provider-02',
        location: 'Freeport, TX', 
        status: 'Audit Approved', 
        postedDate: '2024-07-10', 
        scheduledStartDate: '2024-07-20', 
        scheduledEndDate: '2024-07-20', 
        technicianIds: ['user-tech-01'], 
        equipmentIds: ['EQUIP-1001'], 
        assetIds: ['ASSET-003'], 
        workflow: 'level3',
        history: [
             { user: 'Alex Chen', timestamp: new Date('2024-07-24T10:00:00Z'), action: 'Approved inspection report.', statusChange: 'Audit Approved' },
             { user: 'Maria Garcia', timestamp: new Date('2024-07-21T16:00:00Z'), action: 'Submitted inspection report.', documentName: 'Inspection_Report_JOB-022.pdf', statusChange: 'Report Submitted' },
        ],
        techniques: ['PAUT'],
        jobType: 'project',
        industry: 'Oil & Gas — Midstream',
        certificationsRequired: 'ASNT UT L-II PAUT'
    },
     { 
        id: 'JOB-023', 
        title: 'Flare Stack RVI', 
        client: 'TEAM, Inc.', 
        clientCompanyId: 'provider-03',
        providerId: 'provider-03', 
        location: 'Midland, TX', 
        status: 'Scheduled', 
        postedDate: '2024-07-28', 
        scheduledStartDate: '2024-08-05', 
        technicianIds: ['NAXP822MG6cWlaCNkaqkYpxDRmQ2'],
        workflow: 'standard',
        isInternal: true,
        assetIds: ['ASSET-001'],
        techniques: ['RVI'],
        jobType: 'project',
        industry: 'Oil & Gas — Midstream',
        certificationsRequired: 'ASNT VT L-II'
    },
    { 
        id: 'JOB-024', 
        title: 'Storage Tank Weld RT', 
        client: 'Marine Tankers Ltd.', 
        clientCompanyId: 'client-02',
        providerId: 'provider-04',
        location: 'New Orleans, LA', 
        status: 'Report Submitted', 
        postedDate: '2024-07-20', 
        scheduledStartDate: '2024-07-25',
        technicianIds: ['user-tech-01'],
        workflow: 'level3',
        assetIds: ['ASSET-007'],
        history: [
            { user: 'Maria Garcia', timestamp: new Date('2024-07-26T14:00:00Z'), action: 'Submitted inspection report.', documentName: 'Inspection_Report_JOB-024.pdf', statusChange: 'Report Submitted' }
        ],
        techniques: ['RT'],
        jobType: 'project',
        industry: 'Marine',
        certificationsRequired: 'ASNT RT L-II'
    },
    { 
        id: 'JOB-025', 
        title: 'Shutdown Support - MT', 
        client: 'Global Energy Corp.',
        clientCompanyId: 'client-01',
        providerId: 'provider-03', 
        location: 'Houston, TX', 
        status: 'Scheduled', 
        postedDate: '2024-07-25', 
        scheduledStartDate: nextWeek.toISOString().split('T')[0], 
        scheduledEndDate: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        assetIds: ['ASSET-003', 'ASSET-006'], 
        workflow: 'standard',
        techniques: ['MT'],
        jobType: 'shutdown',
        industry: 'Oil & Gas — Downstream/Refinery',
        certificationsRequired: 'ASNT MT L-II'
    },
];

export const bidsData: Omit<Bid, 'providerId' | 'providerName'>[] = [
    { id: 'BID-001', jobId: 'JOB-001', inspectorId: 'user-tech-01', amount: 12500, status: 'Shortlisted', submittedDate: '2024-06-29', comments: 'We are available to start next week. Our Level III is on standby for data review.' },
    { id: 'BID-001A', jobId: 'JOB-001', inspectorId: 'NAXP822MG6cWlaCNkaqkYpxDRmQ2', amount: 11800, status: 'Submitted', submittedDate: '2024-07-01', comments: 'Our team has extensive experience with this vessel type. We can mobilize within 48 hours.' },
    { id: 'BID-002', jobId: 'JOB-002', inspectorId: 'NAXP822MG6cWlaCNkaqkYpxDRmQ2', amount: 4800, status: 'Awarded', submittedDate: '2024-06-18' },
    { id: 'BID-003', jobId: 'JOB-005', inspectorId: 'user-tech-01', amount: 8200, status: 'Submitted', submittedDate: '2024-07-03' },
    { id: 'BID-004', jobId: 'JOB-006', inspectorId: 'user-tech-02', amount: 22000, status: 'Not Selected', submittedDate: '2024-07-04' },
    { id: 'BID-004A', jobId: 'JOB-006', inspectorId: 'user-tech-01', amount: 21500, status: 'Awarded', submittedDate: '2024-07-04' },
    { id: 'BID-005', jobId: 'JOB-007', inspectorId: 'user-tech-01', amount: 15000, status: 'Awarded', submittedDate: '2024-07-06' },
    { id: 'BID-009', jobId: 'JOB-009', inspectorId: 'user-tech-01', amount: 9500, status: 'Submitted', submittedDate: '2024-07-13' },
    { id: 'BID-011', jobId: 'JOB-011', inspectorId: 'user-tech-02', amount: 18000, status: 'Awarded', submittedDate: '2024-06-05' },
    { id: 'BID-012', jobId: 'JOB-012', inspectorId: 'user-tech-01', amount: 35000, status: 'Awarded', submittedDate: '2024-05-05' },
    { id: 'BID-013', jobId: 'JOB-013', inspectorId: 'NAXP822MG6cWlaCNkaqkYpxDRmQ2', amount: 18000, status: 'Awarded', submittedDate: '2024-07-22' },
    { id: 'BID-015', jobId: 'JOB-015', inspectorId: 'user-tech-01', amount: 3500, status: 'Awarded', submittedDate: '2024-07-03' },
    { id: 'BID-016', jobId: 'JOB-016', inspectorId: 'user-tech-02', amount: 14000, status: 'Submitted', submittedDate: '2024-07-24' },
    { id: 'BID-017', jobId: 'JOB-017', inspectorId: 'NAXP822MG6cWlaCNkaqkYpxDRmQ2', amount: 9500, status: 'Awarded', submittedDate: '2024-07-26' },
    { id: 'BID-018', jobId: 'JOB-018', inspectorId: 'user-tech-01', amount: 25000, status: 'Submitted', submittedDate: '2024-07-29' },
    { id: 'BID-019', jobId: 'JOB-019', inspectorId: 'user-tech-01', amount: 18000, status: 'Submitted', submittedDate: '2024-07-30' },
    { id: 'BID-020', jobId: 'JOB-020', inspectorId: 'user-tech-01', amount: 32000, status: 'Awarded', submittedDate: '2024-06-20' },
    { id: 'BID-021', jobId: 'JOB-021', inspectorId: 'user-tech-01', amount: 7500, status: 'Awarded', submittedDate: '2024-07-16' },
    { id: 'BID-022', jobId: 'JOB-022', inspectorId: 'user-tech-02', amount: 13000, status: 'Awarded', submittedDate: '2024-07-12' },
    { id: 'BID-023', jobId: 'JOB-023', inspectorId: 'NAXP822MG6cWlaCNkaqkYpxDRmQ2', amount: 5500, status: 'Awarded', submittedDate: '2024-07-29' },
    { id: 'BID-024', jobId: 'JOB-024', inspectorId: 'user-tech-03', amount: 19000, status: 'Awarded', submittedDate: '2024-07-21' },
    { id: 'BID-014', jobId: 'JOB-014', inspectorId: 'NAXP822MG6cWlaCNkaqkYpxDRmQ2', amount: 15000, status: 'Awarded', submittedDate: '2024-07-18' },
    { id: 'BID-025', jobId: 'JOB-025', inspectorId: 'NAXP822MG6cWlaCNkaqkYpxDRmQ2', amount: 10000, status: 'Awarded', submittedDate: '2024-07-26' },
];

export const inspectionsData: Inspection[] = [
    { id: 'INSP-001', jobId: 'JOB-003', assetName: 'Storage Tank T-101', assetId: 'ASSET-001', technique: 'UT', inspector: 'Maria Garcia', date: '2024-06-15', status: 'Completed' },
    { id: 'INSP-002', jobId: 'JOB-004', assetName: 'Main Steam Piping', assetId: 'ASSET-002', technique: 'PAUT', inspector: 'Pending', date: dayAfterTomorrow.toISOString().split('T')[0], status: 'Scheduled' },
    { id: 'INSP-003', jobId: 'JOB-002', assetName: 'Overhead Crane C-01', assetId: 'ASSET-004', technique: 'MT', inspector: 'Maria Garcia', date: '2024-06-21', status: 'Completed',
      report: {
        id: 'REP-001',
        submittedOn: '2024-06-22T09:00:00Z',
        submittedBy: 'Maria Garcia',
        reportData: {
          equipmentUsed: 'Parker B-300S Yoke',
          calibrationBlock: 'N/A for MT',
          couplant: 'N/A for MT',
          surfaceCondition: 'Cleaned, As-welded',
          inspectionArea: 'All primary and secondary hook welds',
          findings: [
            { location: 'Hook A, throat area', thickness: 0, notes: 'No linear indications found.' },
            { location: 'Hook B, shank area', thickness: 0, notes: 'Small rounded indication noted, within spec.' }
          ],
          summary: 'Both hooks inspected. Hook B has a minor permissible indication. Both are fit for service.'
        },
        documents: [
          { name: 'MT-findings.jpg', url: 'https://picsum.photos/seed/mt-findings/800/600' },
          { name: 'calibration_cert_yoke.pdf', url: '#' },
        ]
      }
    },
    { id: 'INSP-004', jobId: 'JOB-007', assetName: 'Pressure Vessel PV-203', assetId: 'ASSET-003', technique: 'ET', inspector: 'Maria Garcia', date: yesterday.toISOString().split('T')[0], status: 'Requires Review' },
    { id: 'INSP-005', jobId: 'JOB-010', assetName: 'Gantry Crane G-02', assetId: 'ASSET-009', technique: 'VT', inspector: 'Maria Garcia', date: '2024-07-14', status: 'Completed' },
    { id: 'INSP-006', jobId: 'JOB-011', assetName: 'Condensate Storage Tank', assetId: 'ASSET-007', technique: 'UT', inspector: 'Maria Garcia', date: '2024-06-21', status: 'Completed' },
    { id: 'INSP-007', jobId: 'JOB-012', assetName: 'Turbine Blades Set 1', assetId: 'ASSET-007', technique: 'RT', inspector: 'Maria Garcia', date: '2024-05-25', status: 'Completed' },
    { id: 'INSP-008', jobId: 'JOB-014', assetName: 'Main Steam Piping', assetId: 'ASSET-002', technique: 'UT', inspector: 'Maria Garcia', date: '2024-07-26', status: 'Scheduled' },
    { id: 'INSP-009', jobId: 'JOB-015', assetName: 'Manufacturing Gearbox', assetId: 'ASSET-004', technique: 'VT', inspector: 'Maria Garcia', date: '2024-07-10', status: 'Completed' },
    { id: 'INSP-010', jobId: 'JOB-017', assetName: 'Pressure Vessel PV-203', assetId: 'ASSET-003', technique: 'PT', inspector: 'Pending', date: nextWeek.toISOString().split('T')[0], status: 'Scheduled' },
    { id: 'INSP-010B', jobId: 'JOB-025', assetName: 'Cooling Tower Piping', assetId: 'ASSET-006', technique: 'MT', inspector: 'Pending', date: new Date(nextWeek.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'Scheduled' },
    { id: 'INSP-011', jobId: 'JOB-020', assetName: 'Marine Riser Segment 4', assetId: 'ASSET-006', technique: 'UT', inspector: 'Maria Garcia', date: '2024-07-02', status: 'Completed' },
    { id: 'INSP-012', jobId: 'JOB-021', assetName: 'Storage Tank T-101', assetId: 'ASSET-001', technique: 'UT', inspector: 'Maria Garcia', date: '2024-07-22', status: 'Completed' },
    { id: 'INSP-013', jobId: 'JOB-022', assetName: 'Pressure Vessel PV-203', assetId: 'ASSET-003', technique: 'PAUT', inspector: 'Maria Garcia', date: '2024-07-20', status: 'Requires Review' },
    { id: 'INSP-014', jobId: 'JOB-023', assetName: 'Storage Tank T-101', assetId: 'ASSET-001', technique: 'VT', inspector: 'Maria Garcia', date: '2024-08-05', status: 'Scheduled' },
    { id: 'INSP-015', jobId: 'JOB-024', assetName: 'Condensate Storage Tank', assetId: 'ASSET-007', technique: 'RT', inspector: 'Maria Garcia', date: '2024-07-25', status: 'Requires Review' },
];

export const jobs: Job[] = jobsData.map(job => ({
    ...job,
    bids: bidsData.filter(bid => bid.jobId === job.id).map(b => {
        const inspector = allUsers.find(u => u.id === b.inspectorId);
        return {
            ...b,
            providerId: inspector?.companyId || 'N/A',
            providerName: inspector?.company || 'Unknown Provider',
        }
    }) as Bid[],
    inspections: inspectionsData.filter(inspection => inspection.jobId === job.id),
}));

export const allUsers: PlatformUser[] = [
    { id: 'nxHzdOkwW6RLPWEgVvVbHyzN8OR2', name: 'John Doe', email: 'john.d@globalenergy.corp', role: 'Client', companyId: 'client-01', company: 'Global Energy Corp.', status: 'Active', password: 'password123', createdAt: '2024-01-15T10:00:00Z' },
    { id: 'user-client-02', name: 'Sarah Johnson', email: 's.johnson@marinetankers.com', role: 'Client', companyId: 'client-02', company: 'Marine Tankers Ltd.', status: 'Active', password: 'password123', createdAt: '2024-02-10T10:00:00Z' },
    { id: 'user-client-03', name: 'Mike Williams', email: 'm.williams@energytransfer.com', role: 'Client', companyId: 'client-03', company: 'Energy Transfer', status: 'Active', password: 'password123', createdAt: '2024-02-20T10:00:00Z' },
    { id: 'user-client-04', name: 'Carlos Ruiz', email: 'c.ruiz@chemc.com', role: 'Client', companyId: 'client-05', company: 'Chemical Plant C', status: 'Active', password: 'password123', createdAt: '2024-03-05T10:00:00Z' },
    { id: 'user-client-05', name: 'Chuck Yeager', email: 'chuck@avpros.com', role: 'Client', companyId: 'client-09', company: 'Aviation Maintenance Pros', status: 'Active', password: 'password123', createdAt: '2024-03-15T10:00:00Z' },
    { id: 'i947NWP5Hfb3Tpe5P6XcrjODRIJ2', name: 'Admin User', email: 'admin@ndtexchange.com', role: 'Admin', companyId: 'provider-ndtx', company: 'NDT EXCHANGE', status: 'Active', password: 'password123', createdAt: '2024-01-01T10:00:00Z' },
    { id: '8ulGMzDhV1VgocwqptGCpV6Dkkl1', name: 'Seyon', email: 'seyonnexalabs@gmail.com', role: 'Admin', companyId: 'provider-ndtx', company: 'NDT EXCHANGE', status: 'Active', password: 'password123', createdAt: '2024-01-01T10:00:00Z' },
    { id: 'gpx1kGbkuqQz0Fhmgfhyv4t3B3f2', name: 'Alex Chen', email: 'alex.c@ndtauditors.gov', role: 'Auditor', companyId: 'auditor-firm-01', company: 'NDT Auditors LLC', status: 'Active', password: 'password123', certifications: [{method: 'UT', level: 'Level III'}, {method: 'RT', level: 'Level III'}, {method: 'MT', level: 'Level III'}, {method: 'PT', level: 'Level III'}], level: 'Level III', createdAt: '2024-04-01T10:00:00Z' },
    { id: 'user-auditor-02', name: 'Brenda Vance', email: 'b.vance@aerocompliance.com', role: 'Auditor', companyId: 'auditor-firm-02', company: 'Aero-Compliance Partners', status: 'Active', password: 'password123', certifications: [{method: 'ET', level: 'Level III'}, {method: 'UT', level: 'Level III'}], level: 'Level III', createdAt: '2024-04-05T10:00:00Z' },
    { id: 'NAXP822MG6cWlaCNkaqkYpxDRmQ2', name: 'Maria Garcia', email: 'maria.garcia@teaminc.com', role: 'Inspector', companyId: 'provider-03', company: 'TEAM, Inc.', status: 'Active', certifications: [{method: 'UT', level: 'Level II'}, {method: 'RT', level: 'Level II'}], workStatus: 'On Assignment', providerId: 'provider-03', level: 'Level II', password: 'password123', createdAt: '2024-05-10T10:00:00Z' },
    { id: 'user-tech-01', name: 'Ben Carter', email: 'ben.carter@mistras.com', role: 'Inspector', companyId: 'provider-01', company: 'MISTRAS Group', status: 'Active', certifications: [{method: 'PAUT', level: 'Level II'}, {method: 'ET', level: 'Level III'}], workStatus: 'Available', providerId: 'provider-01', level: 'Level III', password: 'password123', createdAt: '2024-05-12T10:00:00Z' },
    { id: 'user-tech-02', name: 'David Lee', email: 'david.lee@applus.com', role: 'Inspector', companyId: 'provider-02', company: 'Applus+', status: 'Active', certifications: [{method: 'UT', level: 'Level II'}, {method: 'MT', level: 'Level II'}], workStatus: 'On Assignment', providerId: 'provider-02', level: 'Level II', password: 'password123', createdAt: '2024-06-01T10:00:00Z' },
    { id: 'user-tech-03', name: 'Samantha Wu', email: 'samantha.wu@tuv.com', role: 'Inspector', companyId: 'provider-04', company: 'TÜV Rheinland', status: 'Active', certifications: [{method: 'TOFD', level: 'Level II'}, {method: 'PAUT', level: 'Level II'}], workStatus: 'Available', providerId: 'provider-04', level: 'Level II', password: 'password123', createdAt: '2024-06-15T10:00:00Z' },
    { id: 'user-tech-04', name: 'James Wilson', email: 'james.wilson@teaminc.com', role: 'Inspector', companyId: 'provider-03', company: 'TEAM, Inc.', status: 'Active', certifications: [{method: 'MT', level: 'Level II'}, {method: 'PT', level: 'Level II'}], workStatus: 'Available', providerId: 'provider-03', level: 'Level II', password: 'password123', createdAt: '2024-07-01T10:00:00Z' },
];

export const subscriptions: Subscription[] = [
    { id: 'SUB-001', companyId: 'client-01', companyName: 'Global Energy Corp.', plan: 'Client Plus', status: 'Active', startDate: '2024-01-15', userCount: 25, dataUsageGB: 15.2, userLimit: 200, dataLimitGB: 500 },
    { id: 'SUB-002', companyId: 'client-02', companyName: 'Marine Tankers Ltd.', plan: 'Client Access', status: 'Trialing', startDate: '2024-07-05', endDate: '2024-08-04', userCount: 5, dataUsageGB: 2.1, userLimit: 10, dataLimitGB: 20 },
    { id: 'SUB-003', companyId: 'provider-01', companyName: 'MISTRAS Group', plan: 'Company Growth', status: 'Active', startDate: '2024-03-20', userCount: 50, dataUsageGB: 45.8, userLimit: 50, dataLimitGB: 100 },
    { id: 'SUB-004', companyId: 'provider-02', companyName: 'Applus+', plan: 'Provider Pro', status: 'Past Due', startDate: '2023-11-10', userCount: 38, dataUsageGB: 32.5, userLimit: 75, dataLimitGB: 120 },
    { id: 'SUB-005', companyId: 'client-03', companyName: 'Energy Transfer', plan: 'Client Access', status: 'Canceled', startDate: '2024-02-01', endDate: '2024-05-01', userCount: 10, dataUsageGB: 8.7, userLimit: 10, dataLimitGB: 20 },
    { id: 'SUB-006', companyId: 'provider-04', companyName: 'TÜV Rheinland', plan: 'Company Growth', status: 'Active', startDate: '2024-06-01', userCount: 150, dataUsageGB: 88.1, userLimit: 150, dataLimitGB: 100 },
    { id: 'SUB-007', companyId: 'client-04', companyName: 'State DOT', plan: 'Client Access', status: 'Payment Failed', startDate: '2024-04-15', userCount: 8, dataUsageGB: 12.3, userLimit: 10, dataLimitGB: 20 },
    { id: 'SUB-008', companyId: 'auditor-firm-01', companyName: 'NDT Auditors LLC', plan: 'Free Access', status: 'Active', startDate: '2024-01-01', userCount: 2, dataUsageGB: 1.5, userLimit: 200, dataLimitGB: 500 },
    { id: 'SUB-009', companyId: 'client-05', companyName: 'Chemical Plant C', plan: 'Client Access', status: 'Active', startDate: '2024-07-10', userCount: 3, dataUsageGB: 0.5, userLimit: 10, dataLimitGB: 20 },
    { id: 'SUB-010', companyId: 'provider-09', companyName: 'Blue Horizon Services', plan: 'Provider Pro', status: 'Active', startDate: '2024-07-20', userCount: 12, dataUsageGB: 4.5, userLimit: 50, dataLimitGB: 100 },
    { id: 'SUB-011', companyId: 'client-08', companyName: 'Manufacturing Solutions Inc.', plan: 'Client Access', status: 'Trialing', startDate: '2024-07-15', endDate: '2024-08-14', userCount: 2, dataUsageGB: 0.8, userLimit: 5, dataLimitGB: 5 },
    { id: 'SUB-012', companyId: 'client-09', companyName: 'Aviation Maintenance Pros', plan: 'Client Plus', status: 'Active', startDate: '2024-07-25', userCount: 1, dataUsageGB: 0.1, userLimit: 200, dataLimitGB: 500 },
    { id: 'SUB-013', companyId: 'provider-11', companyName: 'SGS', plan: 'Provider Pro', status: 'Active', startDate: '2024-07-26', userCount: 2, dataUsageGB: 0.3, userLimit: 50, dataLimitGB: 100 },
    { id: 'SUB-014', companyId: 'provider-12', companyName: 'DNV (Det Norske Veritas)', plan: 'Company Growth', status: 'Active', startDate: '2024-06-10', userCount: 1, dataUsageGB: 2.5, userLimit: 200, dataLimitGB: 500 },
    { id: 'SUB-015', companyId: 'provider-03', companyName: 'TEAM, Inc.', plan: 'Company Growth', status: 'Active', startDate: '2024-01-01', userCount: 3, dataUsageGB: 10, userLimit: 15, dataLimitGB: 75 },
];

export const payments: Payment[] = [
  { id: 'PAY-001', subscriptionId: 'SUB-001', companyName: 'Global Energy Corp.', amount: 499, date: '2024-07-01', status: 'Succeeded' },
  { id: 'PAY-002', subscriptionId: 'SUB-003', companyName: 'MISTRAS Group', amount: 299, date: '2024-07-01', status: 'Succeeded' },
  { id: 'PAY-003', subscriptionId: 'SUB-004', companyName: 'Applus+', amount: 299, date: '2024-07-01', status: 'Failed' },
  { id: 'PAY-004', subscriptionId: 'SUB-006', companyName: 'TÜV Rheinland', amount: 299, date: '2024-07-01', status: 'Succeeded' },
  { id: 'PAY-005', subscriptionId: 'SUB-007', companyName: 'State DOT', amount: 99, date: '2024-07-01', status: 'Failed' },
  { id: 'PAY-006', subscriptionId: 'SUB-001', companyName: 'Global Energy Corp.', amount: 499, date: '2024-06-01', status: 'Succeeded' },
  { id: 'PAY-007', subscriptionId: 'SUB-003', companyName: 'MISTRAS Group', amount: 299, date: '2024-06-01', status: 'Succeeded' },
  { id: 'PAY-008', subscriptionId: 'SUB-009', companyName: 'Chemical Plant C', amount: 99, date: '2024-07-10', status: 'Succeeded' },
  { id: 'PAY-009', subscriptionId: 'SUB-010', companyName: 'Blue Horizon Services', amount: 299, date: '2024-07-20', status: 'Succeeded' },
  { id: 'PAY-010', subscriptionId: 'SUB-004', companyName: 'Applus+', amount: 299, date: '2024-06-01', status: 'Succeeded' },
  { id: 'PAY-011', subscriptionId: 'SUB-012', companyName: 'Aviation Maintenance Pros', amount: 499, date: '2024-07-25', status: 'Succeeded' },
  { id: 'PAY-012', subscriptionId: 'SUB-013', companyName: 'SGS', amount: 299, date: '2024-07-26', status: 'Succeeded' },
  { id: 'PAY-013', subscriptionId: 'SUB-014', companyName: 'DNV (Det Norske Veritas)', amount: 499, date: '2024-07-10', status: 'Succeeded' },
];

export const jobPayments: JobPayment[] = [
    { id: 'JP-001', jobId: 'JOB-003', jobTitle: 'Annual UT Thickness Survey', amount: 15000, payer: 'Marine Tankers Ltd.', payee: 'MISTRAS Group', payeeType: 'Provider', paidOn: '2024-06-30', status: 'Paid' },
    { id: 'JP-002', jobId: 'JOB-002', jobTitle: 'MT Inspection on Crane Hooks', amount: 4800, payer: 'Global Energy Corp.', payee: 'TEAM, Inc.', payeeType: 'Provider', paidOn: '2024-07-05', status: 'Paid' },
    { id: 'JP-002A', jobId: 'JOB-002', jobTitle: 'MT Inspection on Crane Hooks', amount: 500, payer: 'Global Energy Corp.', payee: 'NDT Auditors LLC', payeeType: 'Auditor', paidOn: '2024-07-06', status: 'Paid' },
    { id: 'JP-003', jobId: 'JOB-007', jobTitle: 'Eddy Current on Heat Exchanger Tubes', amount: 15000, payer: 'Chemical Plant C', payee: 'MISTRAS Group', payeeType: 'Provider', paidOn: '2024-07-12', status: 'Pending' },
    { id: 'JP-003A', jobId: 'JOB-007', jobTitle: 'Eddy Current on Heat Exchanger Tubes', amount: 1200, payer: 'Chemical Plant C', payee: 'NDT Auditors LLC', payeeType: 'Auditor', paidOn: '2024-07-13', status: 'Pending' },
    { id: 'JP-004', jobId: 'JOB-008', jobTitle: 'Emergency Repair Verification', amount: 6500, payer: 'Global Energy Corp.', payee: 'TEAM, Inc.', payeeType: 'Provider', paidOn: '2024-07-15', status: 'Pending' },
    { id: 'JP-005', jobId: 'JOB-011', jobTitle: 'Tank Floor Corrosion Mapping', amount: 18000, payer: 'Marine Tankers Ltd.', payee: 'Applus+', payeeType: 'Provider', paidOn: '2024-07-02', status: 'Paid' },
    { id: 'JP-006', jobId: 'JOB-012', jobTitle: 'Advanced RT of Turbine Blades', amount: 35000, payer: 'Power Generation LLC', payee: 'MISTRAS Group', payeeType: 'Provider', paidOn: '2024-06-15', status: 'Paid' },
    { id: 'JP-006A', jobId: 'JOB-012', jobTitle: 'Advanced RT of Turbine Blades', amount: 2500, payer: 'Power Generation LLC', payee: 'NDT Auditors LLC', payeeType: 'Auditor', paidOn: '2024-06-16', status: 'Paid' },
    { id: 'JP-007', jobId: 'JOB-013', jobTitle: 'Acoustic Emission Monitoring of Sphere Tank', amount: 18000, payer: 'Global Energy Corp.', payee: 'Blue Horizon Services', payeeType: 'Provider', paidOn: '2024-07-28', status: 'Pending' },
    { id: 'JP-008', jobId: 'JOB-015', jobTitle: 'Remote Visual Inspection of Gearbox', amount: 3500, payer: 'Manufacturing Solutions Inc.', payee: 'Dekra', payeeType: 'Provider', paidOn: '2024-07-15', status: 'Paid' },
    { id: 'JP-009', jobId: 'JOB-020', jobTitle: 'Marine Riser Inspection', amount: 32000, payer: 'Global Energy Corp.', payee: 'DNV (Det Norske Veritas)', payeeType: 'Provider', paidOn: '2024-07-15', status: 'Paid' },
];

export const jobChats: JobChat[] = [
    {
        id: 'CHAT-001',
        jobId: 'JOB-002',
        participants: ['nxHzdOkwW6RLPWEgVvVbHyzN8OR2', 'NAXP822MG6cWlaCNkaqkYpxDRmQ2'],
        lastMessage: "Thanks for the report. What was the outcome on that secondary hook?",
        lastMessageTimestamp: '2024-06-22T10:00:00Z',
        messages: [
            { id: 'MSG-001', senderId: 'nxHzdOkwW6RLPWEgVvVbHyzN8OR2', text: 'Carlos, please ensure you check the secondary hook as well. We had some concerns about it during the last visual inspection.', timestamp: '2024-06-20T14:15:00Z' },
            { id: 'MSG-002', senderId: 'NAXP822MG6cWlaCNkaqkYpxDRmQ2', text: 'Not a problem, John. I\'ve added it to the inspection plan. I will pay special attention to it.', timestamp: '2024-06-20T15:00:00Z' },
            { id: 'MSG-003', senderId: 'nxHzdOkwW6RLPWEgVvVbHyzN8OR2', text: "Thanks for the report. What was the outcome on that secondary hook?", timestamp: '2024-06-22T10:00:00Z' },
        ]
    },
    {
        id: 'CHAT-002',
        jobId: 'JOB-004',
        participants: ['NAXP822MG6cWlaCNkaqkYpxDRmQ2'],
        lastMessage: "Confirmed. I have the procedure documents ready.",
        lastMessageTimestamp: '2024-07-01T11:05:00Z',
        messages: [
            { id: 'MSG-004', senderId: 'NAXP822MG6cWlaCNkaqkYpxDRmQ2', text: "Team, just confirming we are all set for the Midland job tomorrow. All equipment is calibrated.", timestamp: '2024-07-01T11:00:00Z'},
            { id: 'MSG-005', senderId: 'NAXP822MG6cWlaCNkaqkYpxDRmQ2', text: "Confirmed. I have the procedure documents ready.", timestamp: '2024-07-01T11:05:00Z'},
        ]
    }
];

export const notifications: Notification[] = [
    {
        id: 'NOTIF-001',
        userId: 'nxHzdOkwW6RLPWEgVvVbHyzN8OR2',
        title: 'New Bid on "PAUT on Pressure Vessel Welds"',
        description: 'TEAM, Inc. has placed a bid for $11,800.',
        timestamp: '2024-07-01T11:30:00Z',
        read: false,
        href: '/dashboard/my-jobs/JOB-001'
    },
    {
        id: 'NOTIF-002',
        userId: 'NAXP822MG6cWlaCNkaqkYpxDRmQ2',
        title: 'Job Awarded: "MT Inspection on Crane Hooks"',
        description: 'Your bid for $4,800 has been accepted by Global Energy Corp.',
        timestamp: '2024-06-19T15:05:00Z',
        read: true,
        href: '/dashboard/my-jobs/JOB-002'
    },
    {
        id: 'NOTIF-003',
        userId: 'nxHzdOkwW6RLPWEgVvVbHyzN8OR2',
        title: 'New Message on "MT Inspection on Crane Hooks"',
        description: 'Maria Garcia: "Not a problem, John. I\'ve added it to the inspection plan..."',
        timestamp: '2024-06-20T15:00:00Z',
        read: false,
        href: '/dashboard/messages'
    },
    {
        id: 'NOTIF-004',
        userId: 'NAXP822MG6cWlaCNkaqkYpxDRmQ2',
        title: 'Report Approved for "Tank Floor Corrosion Mapping"',
        description: 'The client has approved your report for JOB-011.',
        timestamp: '2024-07-03T16:00:00Z',
        read: true,
        href: '/dashboard/my-jobs/JOB-011'
    },
];

export const userAuditLog: UserAuditLog[] = [
  { id: 'ACT-001', timestamp: new Date('2024-07-28T10:00:00Z'), actorName: 'Admin User', actorCompany: 'NDT EXCHANGE', action: 'Admin Promotion', targetUserName: 'Maria Garcia', targetCompany: 'MISTRAS Group', details: 'Promoted to Company Admin, replacing old admin.' },
  { id: 'ACT-002', timestamp: new Date('2024-07-27T15:30:00Z'), actorName: 'Admin User', actorCompany: 'NDT EXCHANGE', action: 'User Disabled', targetUserName: 'Maria Garcia', targetCompany: 'TEAM, Inc.', details: '' },
  { id: 'ACT-003', timestamp: new Date('2024-07-26T11:00:00Z'), actorName: 'Admin User', actorCompany: 'NDT EXCHANGE', action: 'User Invited', targetUserName: 'John Doe', targetCompany: 'Global Energy Corp.', details: 'Invited as Client.' },
  { id: 'ACT-004', timestamp: new Date('2024-07-25T09:20:00Z'), actorName: 'John Doe', actorCompany: 'Global Energy Corp.', action: 'User Invited', targetUserName: 'John Doe', targetCompany: 'Global Energy Corp.', details: 'Invited as Client.' },
  { id: 'ACT-005', timestamp: new Date('2024-07-29T14:00:00Z'), actorName: 'Admin User', actorCompany: 'NDT EXCHANGE', action: 'User Enabled', targetUserName: 'Maria Garcia', targetCompany: 'TEAM, Inc.', details: 'Re-enabled user upon request.' },
  { id: 'ACT-006', timestamp: new Date('2024-07-30T10:00:00Z'), actorName: 'Admin User', actorCompany: 'NDT EXCHANGE', action: 'User Invited', targetUserName: 'Maria Garcia', targetCompany: 'Applus+', details: 'Invited as Inspector (Level II).' },
  { id: 'ACT-007', timestamp: new Date('2024-07-25T10:00:00Z'), actorName: 'Admin User', actorCompany: 'NDT EXCHANGE', action: 'User Invited', targetUserName: 'John Doe', targetCompany: 'Aviation Maintenance Pros', details: 'Invited as Client.' },
  { id: 'ACT-008', timestamp: new Date('2024-07-30T14:00:00Z'), actorName: 'Admin User', actorCompany: 'NDT EXCHANGE', action: 'User Invited', targetUserName: 'John Doe', targetCompany: 'Energy Transfer', details: 'Invited as Client.' },
];

export const jobAuditLog: JobAuditLog[] = [
    { id: 'JLOG-001', timestamp: new Date('2024-06-28T10:00:00Z'), jobId: 'JOB-001', jobTitle: 'PAUT on Pressure Vessel Welds', actorName: 'John Doe', actorRole: 'Client', action: 'Job Created', details: 'Job posted to marketplace.' },
    { id: 'JLOG-002', timestamp: new Date('2024-06-29T11:30:00Z'), jobId: 'JOB-001', jobTitle: 'PAUT on Pressure Vessel Welds', actorName: 'Maria Garcia', actorRole: 'Provider', action: 'Bid Placed', details: 'Bid for $12,500 submitted by MISTRAS Group.' },
    { id: 'JLOG-003', timestamp: new Date('2024-06-19T15:00:00Z'), jobId: 'JOB-002', jobTitle: 'MT Inspection on Crane Hooks', actorName: 'John Doe', actorRole: 'Client', action: 'Job Awarded', details: 'Awarded to TEAM, Inc. for $4,800.' },
    { id: 'JLOG-004', timestamp: new Date('2024-06-22T09:00:00Z'), jobId: 'JOB-002', jobTitle: 'MT Inspection on Crane Hooks', actorName: 'Maria Garcia', actorRole: 'Provider', action: 'Report Submitted', details: 'Inspection report uploaded.' },
    { id: 'JLOG-005', timestamp: new Date('2024-06-22T09:00:00Z'), jobId: 'JOB-002', jobTitle: 'MT Inspection on Crane Hooks', actorName: 'System', actorRole: 'Admin', action: 'Status Changed', details: 'Status changed to Report Submitted.' },
    { id: 'JLOG-006', timestamp: new Date('2024-07-26T10:00:00Z'), jobId: 'JOB-017', jobTitle: 'Shutdown Support - PT', actorName: 'John Doe', actorRole: 'Client', action: 'Job Awarded', details: 'Directly awarded to TEAM, Inc. for $9,500.' },
    { id: 'JLOG-007', timestamp: new Date('2024-07-28T09:00:00Z'), jobId: 'JOB-017', jobTitle: 'Shutdown Support - PT', actorName: 'Maria Garcia', actorRole: 'Provider', action: 'Resource Assigned', details: 'Assigned Technicians: Maria Garcia, James Wilson' },
    { id: 'JLOG-008', timestamp: new Date('2024-06-20T11:00:00Z'), jobId: 'JOB-020', jobTitle: 'Marine Riser Inspection', actorName: 'John Doe', actorRole: 'Client', action: 'Job Awarded', details: 'Awarded to DNV (Det Norske Veritas) for $32,000.' },
    { id: 'JLOG-009', timestamp: new Date('2024-07-26T10:01:00Z'), jobId: 'JOB-025', jobTitle: 'Shutdown Support - MT', actorName: 'John Doe', actorRole: 'Client', action: 'Job Awarded', details: 'Directly awarded to TEAM, Inc. for $10,000.' },
];

export const billingAuditLog: BillingAuditLog[] = [
  { id: 'BLOG-001', timestamp: new Date('2024-07-10T00:00:00Z'), companyName: 'Chemical Plant C', action: 'Subscription Started', details: 'Started on Client plan.' },
  { id: 'BLOG-002', timestamp: new Date('2024-07-01T00:00:00Z'), companyName: 'Applus+', action: 'Payment Failed', details: 'Monthly payment of $299 failed.' },
  { id: 'BLOG-003', timestamp: new Date('2024-07-01T00:00:00Z'), companyName: 'MISTRAS Group', action: 'Payment Succeeded', details: 'Monthly payment of $299 succeeded.' },
  { id: 'BLOG-004', timestamp: new Date('2024-05-01T00:00:00Z'), companyName: 'Energy Transfer', action: 'Subscription Canceled', details: 'Client plan was canceled.' },
  { id: 'BLOG-005', timestamp: new Date('2024-07-20T00:00:00Z'), companyName: 'Blue Horizon Services', action: 'Subscription Started', details: 'Started on Provider plan.' },
  { id: 'BLOG-006', timestamp: new Date('2024-07-21T10:00:00Z'), companyName: 'Applus+', action: 'Payment Succeeded', details: 'Manual payment of $299 for past due invoice.' },
  { id: 'BLOG-007', timestamp: new Date('2024-07-25T00:00:00Z'), companyName: 'Aviation Maintenance Pros', action: 'Subscription Started', details: 'Started on Enterprise plan.' },
];

export const reviews: Review[] = [
  { id: 'REV-001', jobId: 'JOB-003', providerId: 'provider-01', clientId: 'client-02', rating: 5, comment: 'MISTRAS Group was excellent. Very professional and the report was detailed. Will hire again.', date: '2024-07-01T10:00:00Z', status: 'Approved' },
  { id: 'REV-002', jobId: 'JOB-012', providerId: 'provider-01', clientId: 'client-06', rating: 4, comment: 'Good work, but the final report was a day late. Otherwise, very satisfied with the quality of the inspection.', date: '2024-06-20T10:00:00Z', status: 'Approved' },
  { id: 'REV-003', jobId: 'JOB-015', providerId: 'provider-07', clientId: 'client-08', rating: 5, comment: 'Dekra provided a quick and efficient service for our emergency gearbox inspection. Highly recommend.', date: '2024-07-16T10:00:00Z', status: 'Pending' },
];


export const auditFirmServices = ['Compliance Audits', 'Level III Services', 'Procedure Development', 'Vendor Audits'];
export const auditFirmIndustries = ['Oil & Gas', 'Power Generation', 'Manufacturing', 'Aerospace & Defense', 'Infrastructure', 'Marine'];
