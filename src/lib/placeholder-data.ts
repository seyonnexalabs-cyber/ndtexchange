

import { serviceProviders } from './service-providers-data';

export type Asset = {
    id: string;
    name: string;
    type: 'Tank' | 'Piping' | 'Vessel' | 'Crane' | 'Weld Joint';
    location: string;
    status: 'Operational' | 'Requires Inspection' | 'Under Repair' | 'Decommissioned';
    nextInspection: string;
};

export type JobDocument = {
    name: string;
    url: string;
};

export type JobUpdate = {
    user: string;
    timestamp: string;
    action: string;
    details?: string;
    documentName?: string;
    statusChange?: Job['status'];
};

export type JobMessage = {
    user: string;
    role: 'Client' | 'Inspector' | 'Auditor';
    timestamp: string;
    message: string;
};

export type Job = {
    id: string;
    title: string;
    client: string;
    providerId?: string; // The service provider company awarded the job
    location: string;
    technique: 'UT' | 'RT' | 'MT' | 'PT' | 'VT' | 'PAUT' | 'TOFD' | 'ET' | 'AE' | 'LT' | 'IR' | 'APR';
    status: 'Draft' | 'Posted' | 'Assigned' | 'Scheduled' | 'In Progress' | 'Report Submitted' | 'Under Audit' | 'Audit Approved' | 'Client Review' | 'Client Approved' | 'Completed' | 'Paid';
    postedDate: string;
    bidExpiryDate?: string;
    scheduledStartDate?: string;
    scheduledEndDate?: string;
    technicianIds?: string[];
    equipmentIds?: string[];
    assetIds?: string[];
    workflow: 'standard' | 'level3' | 'auto';
    documents?: JobDocument[];
    history?: JobUpdate[];
    messages?: JobMessage[];
};

export type Inspection = {
    id: string;
    jobId: string;
    assetName: string;
    assetId: string;
    technique: 'UT' | 'RT' | 'MT' | 'PT' | 'VT';
    inspector: string;
    date: string;
    status: 'Scheduled' | 'Completed' | 'Requires Review';
};

export type EquipmentHistory = {
    event: 'Created' | 'Updated' | 'Checked Out' | 'Checked In' | 'Set to Available' | 'Set to Calibration Due' | 'Set to Out of Service';
    timestamp: string;
    user: string;
    notes?: string;
};

export type InspectorAsset = {
    id: string;
    name: string;
    type: string;
    status: 'Available' | 'In Use' | 'Calibration Due' | 'Out of Service';
    nextCalibration: string;
    history?: EquipmentHistory[];
};

export type Technician = {
    id: string;
    name: string;
    level: 'Level I' | 'Level II' | 'Level III';
    certifications: ('UT' | 'MT' | 'PT' | 'RT' | 'VT' | 'PAUT' | 'TOFD' | 'ET' | 'AE' | 'LT' | 'IR')[];
    status: 'Available' | 'On Assignment';
    providerId: string;
};

export type Bid = {
    id: string;
    jobId: string;
    providerId: string; // The company placing the bid
    amount: number;
    status: 'Submitted' | 'Awarded' | 'Rejected' | 'Withdrawn';
    submittedDate: string;
    proposedTechnique?: string;
    proposalJustification?: string;
};

export type Client = {
    id: string;
    name: string;
    contactPerson: string;
    contactEmail: string;
    activeJobs: number;
    totalSpend: number;
};

export type Review = {
  id: string;
  jobId: string;
  providerId: string;
  clientId: string;
  rating: number;
  comment: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
};

export type PlatformUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    company: string;
    status: 'Active' | 'Invited' | 'Disabled';
};

export type Subscription = {
  id: string;
  companyId: string;
  companyName: string;
  plan: 'Free Trial' | 'Client' | 'Provider' | 'Enterprise';
  status: 'Active' | 'Trialing' | 'Past Due' | 'Canceled' | 'Payment Failed';
  startDate: string;
  endDate?: string;
  userCount: number;
  dataUsageGB: number; // in GB
};

export type Payment = {
  id: string;
  subscriptionId: string;
  companyName: string;
  amount: number;
  date: string;
  status: 'Succeeded' | 'Failed';
};

export type JobPayment = {
    id: string;
    jobId: string;
    jobTitle: string;
    amount: number;
    payer: string;
    payee: string;
    payeeType: 'Provider' | 'Auditor';
    paidOn: string;
    status: 'Paid' | 'Pending';
};


export const clientAssets: Asset[] = [
    { id: 'ASSET-001', name: 'Storage Tank T-101', type: 'Tank', location: 'Refinery A', status: 'Operational', nextInspection: '2024-09-15' },
    { id: 'ASSET-006', name: 'Cooling Tower Piping', type: 'Piping', location: 'Refinery A', status: 'Operational', nextInspection: '2025-02-20' },
    { id: 'ASSET-002', name: 'Main Steam Piping', type: 'Piping', location: 'Power Plant B', status: 'Requires Inspection', nextInspection: '2024-07-20' },
    { id: 'ASSET-003', name: 'Pressure Vessel PV-203', type: 'Vessel', location: 'Chemical Plant C', status: 'Operational', nextInspection: '2025-01-10' },
    { id: 'ASSET-004', name: 'Overhead Crane C-01', type: 'Crane', location: 'Under Repair', nextInspection: '2024-08-01' },
    { id: 'ASSET-005', name: 'Structural Weld SW-05', type: 'Weld Joint', location: 'Bridge E', status: 'Operational', nextInspection: '2024-11-22' },
];

export const inspectorAssets: InspectorAsset[] = [
    { 
        id: 'UTM-1000', 
        name: 'Olympus 45MG', 
        type: 'UT Equipment', 
        status: 'Available', 
        nextCalibration: '2025-01-05',
        history: [
            { event: 'Created', user: 'Admin', timestamp: '2023-01-05T10:00:00Z', notes: 'Item created in inventory.' },
            { event: 'Checked In', user: 'Jane Smith', timestamp: '2024-06-25T14:00:00Z', notes: 'Condition: Good. Job: Annual UT Thickness Survey.' },
            { event: 'Checked Out', user: 'Jane Smith', timestamp: '2024-06-10T08:00:00Z', notes: 'Job: Annual UT Thickness Survey' },
        ]
    },
    { 
        id: 'PA-Probe-5MHz', 
        name: '5L64-A2 Probe', 
        type: 'PAUT Probe', 
        status: 'In Use', 
        nextCalibration: '2024-12-11',
        history: [
             { event: 'Checked Out', user: 'Carlos Ray', timestamp: '2024-07-01T09:30:00Z', notes: 'Job: Pipeline Weld Inspections' },
             { event: 'Created', user: 'Admin', timestamp: '2023-02-10T11:00:00Z', notes: 'Item created in inventory.' }
        ]
    },
    { 
        id: 'CAL-BLK-01', 
        name: 'IIW Type 1 Block', 
        type: 'Calibration Block', 
        status: 'Available', 
        nextCalibration: 'N/A',
        history: [
            { event: 'Created', user: 'Admin', timestamp: '2023-01-15T16:00:00Z', notes: 'Item created in inventory.' }
        ]
    },
    { 
        id: 'YOKE-02', 
        name: 'Parker B-300S', 
        type: 'Yoke', 
        status: 'Calibration Due', 
        nextCalibration: '2024-07-30',
        history: [
            { event: 'Set to Calibration Due', user: 'System', timestamp: '2024-07-15T00:00:00Z', notes: 'Automatic status change based on calibration date.' },
            { event: 'Checked In', user: 'Carlos Ray', timestamp: '2024-06-22T17:00:00Z', notes: 'Condition: Good. Job: MT Inspection on Crane Hooks' },
            { event: 'Checked Out', user: 'Carlos Ray', timestamp: '2024-06-21T09:00:00Z', notes: 'Job: MT Inspection on Crane Hooks' },
            { event: 'Created', user: 'Admin', timestamp: '2023-03-01T12:00:00Z', notes: 'Item created in inventory.' }
        ]
    },
];

export const technicians: Technician[] = [
    { id: 'TECH-01', name: 'Carlos Ray', level: 'Level II', certifications: ['UT', 'MT', 'PT'], status: 'Available', providerId: 'provider-03' },
    { id: 'TECH-02', name: 'Aisha Khan', level: 'Level II', certifications: ['RT', 'VT', 'ET'], status: 'On Assignment', providerId: 'provider-01' },
    { id: 'TECH-03', name: 'Ben Carter', level: 'Level III', certifications: ['UT', 'PAUT', 'TOFD', 'AE'], status: 'Available', providerId: 'provider-01' },
    { id: 'TECH-04', name: 'David Lee', level: 'Level I', certifications: ['MT', 'PT'], status: 'Available', providerId: 'provider-02' },
    { id: 'TECH-05', name: 'Maria Garcia', level: 'Level II', certifications: ['UT', 'RT'], status: 'On Assignment', providerId: 'provider-03' },
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


export const jobs: Job[] = [
    { 
        id: 'JOB-001', 
        title: 'PAUT on Pressure Vessel Welds', 
        client: 'Global Energy Corp.', 
        location: 'Houston, TX', 
        technique: 'PAUT', 
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
            { user: 'John Doe', timestamp: '2024-06-28 10:00 AM', action: 'Created job and posted to marketplace.', statusChange: 'Posted' },
        ]
    },
    { 
        id: 'JOB-002', 
        title: 'MT Inspection on Crane Hooks', 
        client: 'Global Energy Corp.', 
        providerId: 'provider-03',
        location: 'Long Beach, CA', 
        technique: 'MT', 
        status: 'Report Submitted', 
        postedDate: '2024-06-18', 
        scheduledStartDate: '2024-06-21', 
        scheduledEndDate: '2024-06-21', 
        technicianIds: ['TECH-01'], 
        equipmentIds: ['YOKE-02'], 
        assetIds: ['ASSET-004'], 
        workflow: 'level3',
        history: [
            { user: 'Carlos Ray', timestamp: '2024-06-22 09:00 AM', action: 'Submitted inspection report.', documentName: 'Inspection_Report_JOB-002.pdf', statusChange: 'Report Submitted' },
            { user: 'Carlos Ray', timestamp: '2024-06-20 08:00 AM', action: 'Scheduled job.', details: 'Start: 2024-06-21', statusChange: 'Scheduled' },
            { user: 'John Doe', timestamp: '2024-06-19 03:00 PM', action: 'Awarded job to provider "TEAM, Inc.".', statusChange: 'Assigned' },
            { user: 'John Doe', timestamp: '2024-06-18 10:00 AM', action: 'Created and posted job.', statusChange: 'Posted' },
        ],
        messages: [
            { user: 'John Doe', role: 'Client', timestamp: '2024-06-20 02:15 PM', message: 'Carlos, please ensure you check the secondary hook as well. We had some concerns about it during the last visual inspection.' },
            { user: 'Carlos Ray', role: 'Inspector', timestamp: '2024-06-20 03:00 PM', message: 'Not a problem, John. I\'ve added it to the inspection plan. I will pay special attention to it.' },
            { user: 'John Doe', role: 'Client', timestamp: '2024-06-22 10:00 AM', message: 'Thanks for the report. What was the outcome on that secondary hook?' },
        ]
    },
    { id: 'JOB-003', title: 'Annual UT Thickness Survey', client: 'Marine Tankers Ltd.', providerId: 'provider-01', location: 'New Orleans, LA', technique: 'UT', status: 'Completed', postedDate: '2024-05-15', scheduledStartDate: '2024-06-10', scheduledEndDate: '2024-06-12', technicianIds: ['TECH-02'], equipmentIds: ['UTM-1000'], assetIds: ['ASSET-001'], workflow: 'standard' },
    { id: 'JOB-004', title: 'Pipeline Weld Inspections', client: 'Energy Transfer', providerId: 'provider-01', location: 'Midland, TX', technique: 'PAUT', status: 'In Progress', postedDate: '2024-07-01', scheduledStartDate: dayAfterTomorrow.toISOString().split('T')[0], scheduledEndDate: twoDaysAfterTomorrow.toISOString().split('T')[0], technicianIds: ['TECH-01', 'TECH-03'], equipmentIds: ['UTM-1000', 'PA-Probe-5MHz'], assetIds: ['ASSET-002'], workflow: 'level3' },
    { 
        id: 'JOB-005', 
        title: 'VT of Bridge Structural Welds', 
        client: 'State Department of Transportation', 
        location: 'Sacramento, CA', 
        technique: 'VT', 
        status: 'Posted', 
        postedDate: '2024-07-02', 
        bidExpiryDate: nextWeek.toISOString().split('T')[0],
        assetIds: ['ASSET-005'], 
        workflow: 'standard',
        documents: [
            { name: 'Bridge_Structural_Plans.pdf', url: '#' }
        ] 
    },
    { id: 'JOB-006', title: 'RT on Boiler Tubes', client: 'Power Generation LLC', location: 'Houston, TX', technique: 'RT', status: 'Posted', postedDate: '2024-07-03', bidExpiryDate: nextWeek.toISOString().split('T')[0], workflow: 'level3' },
    { id: 'JOB-007', title: 'Eddy Current on Heat Exchanger Tubes', client: 'Chemical Plant C', providerId: 'provider-01', location: 'Baton Rouge, LA', technique: 'ET', status: 'Report Submitted', postedDate: '2024-07-05', scheduledStartDate: yesterday.toISOString().split('T')[0], scheduledEndDate: yesterday.toISOString().split('T')[0], assetIds: ['ASSET-003'], technicianIds: ['TECH-02'], workflow: 'level3' },
    { id: 'JOB-008', title: 'Emergency Repair Verification', client: 'Global Energy Corp.', providerId: 'provider-03', location: 'Long Beach, CA', technique: 'UT', status: 'Scheduled', postedDate: '2024-07-10', scheduledStartDate: tomorrow.toISOString().split('T')[0], scheduledEndDate: dayAfterTomorrow.toISOString().split('T')[0], technicianIds: ['TECH-03'], equipmentIds: ['UTM-1000'], assetIds: ['ASSET-004'], workflow: 'standard' },
];

export const bids: Bid[] = [
    { id: 'BID-001', jobId: 'JOB-001', providerId: 'provider-01', amount: 12500, status: 'Submitted', submittedDate: '2024-06-29' },
    { id: 'BID-002', jobId: 'JOB-002', providerId: 'provider-03', amount: 4800, status: 'Awarded', submittedDate: '2024-06-26' },
    { id: 'BID-003', jobId: 'JOB-005', providerId: 'provider-01', amount: 8200, status: 'Submitted', submittedDate: '2024-07-03' },
    { id: 'BID-004', jobId: 'JOB-006', providerId: 'provider-02', amount: 22000, status: 'Rejected', submittedDate: '2024-07-04' },
    { id: 'BID-005', jobId: 'JOB-007', providerId: 'provider-01', amount: 15000, status: 'Withdrawn', submittedDate: '2024-07-06' },
];


export const inspections: Inspection[] = [
    { id: 'INSP-001', jobId: 'JOB-003', assetName: 'Storage Tank T-101', assetId: 'ASSET-001', technique: 'UT', inspector: 'Jane Smith', date: '2024-06-15', status: 'Completed' },
    { id: 'INSP-002', jobId: 'JOB-004', assetName: 'Main Steam Piping', assetId: 'ASSET-002', technique: 'VT', inspector: 'Pending', date: '2024-07-20', status: 'Scheduled' },
    { id: 'INSP-003', jobId: 'JOB-002', assetName: 'Overhead Crane C-01', assetId: 'ASSET-004', technique: 'MT', inspector: 'Carlos Ray', date: '2024-06-21', status: 'Requires Review' },
    { id: 'INSP-004', jobId: 'JOB-007', assetName: 'Pressure Vessel PV-203', assetId: 'ASSET-003', technique: 'ET', inspector: 'Aisha Khan', date: yesterday.toISOString().split('T')[0], status: 'Requires Review' },
];

export const NDTTechniques = [
  { "id": "UT", "name": "Ultrasonic Testing" },
  { "id": "PAUT", "name": "Phased Array UT" },
  { "id": "TOFD", "name": "Time-of-Flight Diffraction" },
  { "id": "RT", "name": "Radiographic Testing" },
  { "id": "MT", "name": "Magnetic Particle Testing" },
  { "id": "PT", "name": "Penetrant Testing" },
  { "id": "VT", "name": "Visual Testing" },
  { "id": "ET", "name": "Electromagnetic Testing" },
  { "id": "AE", "name": "Acoustic Emission" },
  { "id": "LT", "name": "Leak Testing" },
  { "id": "IR", "name": "Infrared/Thermal Testing" },
  { "id": "APR", "name": "Acoustic Pulse Reflectometry" }
];

export const clientData: Client[] = [
    { id: 'client-01', name: 'Global Energy Corp.', contactPerson: 'John Doe', contactEmail: 'john.d@globalenergy.corp', activeJobs: 3, totalSpend: 250000 },
    { id: 'client-02', name: 'Marine Tankers Ltd.', contactPerson: 'Sarah Johnson', contactEmail: 's.johnson@marinetankers.com', activeJobs: 1, totalSpend: 75000 },
    { id: 'client-03', name: 'Energy Transfer', contactPerson: 'Mike Williams', contactEmail: 'm.williams@energytransfer.com', activeJobs: 1, totalSpend: 120000 },
    { id: 'client-04', name: 'State DOT', contactPerson: 'Emily White', contactEmail: 'ewhite@dot.state.gov', activeJobs: 1, totalSpend: 8200 },
    { id: 'auditor-01', name: 'NDT Auditors LLC', contactPerson: 'Alex Chen', contactEmail: 'alex.c@ndtauditors.gov', activeJobs: 0, totalSpend: 0 },
];

export const reviews: Review[] = [
  { id: 'REV-001', jobId: 'JOB-003', providerId: 'provider-03', clientId: 'client-02', rating: 5, comment: 'Excellent and thorough service. The report was detailed and delivered on time.', date: '2024-06-20', status: 'Approved' },
  { id: 'REV-002', jobId: 'JOB-002', providerId: 'provider-03', clientId: 'client-01', rating: 4, comment: 'Good work, but the inspector was a bit late on the first day.', date: '2024-07-01', status: 'Pending' },
  { id: 'REV-003', jobId: 'JOB-004', providerId: 'provider-01', clientId: 'client-03', rating: 5, comment: 'Top-notch professionals. Ben Carter and his team are the best in the business.', date: '2024-07-15', status: 'Approved' },
];

export const allUsers: PlatformUser[] = [
    { id: 'user-client-01', name: 'John Doe', email: 'john.d@globalenergy.corp', role: 'Client', company: 'Global Energy Corp.', status: 'Active' },
    { id: 'user-client-02', name: 'Sarah Johnson', email: 's.johnson@marinetankers.com', role: 'Client', company: 'Marine Tankers Ltd.', status: 'Active' },
    { id: 'user-admin-01', name: 'Admin User', email: 'admin@ndtexchange.com', role: 'Admin', company: 'NDT Exchange', status: 'Active' },
    { id: 'user-auditor-01', name: 'Alex Chen', email: 'alex.c@ndtauditors.gov', role: 'Auditor', company: 'NDT Auditors LLC', status: 'Active' },
    ...technicians.map(t => {
        const provider = serviceProviders.find(p => p.id === t.providerId);
        return {
            id: `user-${t.id}`,
            name: t.name,
            email: `${t.name.toLowerCase().replace(' ', '.')}@provider.com`,
            role: `Inspector (${t.level})`,
            company: provider?.name || `Unknown Provider`,
            status: 'Active' as 'Active' | 'Invited' | 'Disabled',
        };
    }),
     { id: 'user-client-05', name: 'Invited User', email: 'new.user@clientcorp.com', role: 'Client', company: 'Global Energy Corp.', status: 'Invited' },
     { id: 'user-tech-06', name: 'Disabled Tech', email: 'old.tech@provider.com', role: 'Inspector (Level II)', company: 'Applus+', status: 'Disabled' },
];

export const subscriptions: Subscription[] = [
    { id: 'SUB-001', companyId: 'client-01', companyName: 'Global Energy Corp.', plan: 'Enterprise', status: 'Active', startDate: '2024-01-15', userCount: 25, dataUsageGB: 15.2 },
    { id: 'SUB-002', companyId: 'client-02', companyName: 'Marine Tankers Ltd.', plan: 'Client', status: 'Trialing', startDate: '2024-07-05', endDate: '2024-08-04', userCount: 5, dataUsageGB: 2.1 },
    { id: 'SUB-003', companyId: 'provider-01', companyName: 'MISTRAS Group', plan: 'Provider', status: 'Active', startDate: '2024-03-20', userCount: 50, dataUsageGB: 45.8 },
    { id: 'SUB-004', companyId: 'provider-02', companyName: 'Applus+', plan: 'Provider', status: 'Past Due', startDate: '2023-11-10', userCount: 38, dataUsageGB: 32.5 },
    { id: 'SUB-005', companyId: 'client-03', companyName: 'Energy Transfer', plan: 'Client', status: 'Canceled', startDate: '2024-02-01', endDate: '2024-05-01', userCount: 10, dataUsageGB: 8.7 },
    { id: 'SUB-006', companyId: 'provider-04', companyName: 'TÜV Rheinland', plan: 'Provider', status: 'Active', startDate: '2024-06-01', userCount: 150, dataUsageGB: 88.1 },
    { id: 'SUB-007', companyId: 'client-04', companyName: 'State DOT', plan: 'Client', status: 'Payment Failed', startDate: '2024-04-15', userCount: 8, dataUsageGB: 12.3 },
    { id: 'SUB-008', companyId: 'auditor-01', companyName: 'NDT Auditors LLC', plan: 'Enterprise', status: 'Active', startDate: '2024-01-01', userCount: 2, dataUsageGB: 1.5 },
];

export const payments: Payment[] = [
  { id: 'PAY-001', subscriptionId: 'SUB-001', companyName: 'Global Energy Corp.', amount: 499, date: '2024-07-01', status: 'Succeeded' },
  { id: 'PAY-002', subscriptionId: 'SUB-003', companyName: 'MISTRAS Group', amount: 299, date: '2024-07-01', status: 'Succeeded' },
  { id: 'PAY-003', subscriptionId: 'SUB-004', companyName: 'Applus+', amount: 299, date: '2024-07-01', status: 'Failed' },
  { id: 'PAY-004', subscriptionId: 'SUB-006', companyName: 'TÜV Rheinland', amount: 299, date: '2024-07-01', status: 'Succeeded' },
  { id: 'PAY-005', subscriptionId: 'SUB-007', companyName: 'State DOT', amount: 99, date: '2024-07-01', status: 'Failed' },
  { id: 'PAY-006', subscriptionId: 'SUB-001', companyName: 'Global Energy Corp.', amount: 499, date: '2024-06-01', status: 'Succeeded' },
  { id: 'PAY-007', subscriptionId: 'SUB-003', companyName: 'MISTRAS Group', amount: 299, date: '2024-06-01', status: 'Succeeded' },
];

export const jobPayments: JobPayment[] = [
    { id: 'JP-001', jobId: 'JOB-003', jobTitle: 'Annual UT Thickness Survey', amount: 15000, payer: 'Marine Tankers Ltd.', payee: 'MISTRAS Group', payeeType: 'Provider', paidOn: '2024-06-30', status: 'Paid' },
    { id: 'JP-002', jobId: 'JOB-002', jobTitle: 'MT Inspection on Crane Hooks', amount: 4800, payer: 'Global Energy Corp.', payee: 'TEAM, Inc.', payeeType: 'Provider', paidOn: '2024-07-05', status: 'Paid' },
    { id: 'JP-002A', jobId: 'JOB-002', jobTitle: 'MT Inspection on Crane Hooks', amount: 500, payer: 'Global Energy Corp.', payee: 'NDT Auditors LLC', payeeType: 'Auditor', paidOn: '2024-07-06', status: 'Paid' },
    { id: 'JP-003', jobId: 'JOB-007', jobTitle: 'Eddy Current on Heat Exchanger Tubes', amount: 15000, payer: 'Chemical Plant C', payee: 'MISTRAS Group', payeeType: 'Provider', paidOn: '2024-07-12', status: 'Pending' },
    { id: 'JP-003A', jobId: 'JOB-007', jobTitle: 'Eddy Current on Heat Exchanger Tubes', amount: 1200, payer: 'Chemical Plant C', payee: 'NDT Auditors LLC', payeeType: 'Auditor', paidOn: '2024-07-13', status: 'Pending' },
    { id: 'JP-004', jobId: 'JOB-008', jobTitle: 'Emergency Repair Verification', amount: 6500, payer: 'Global Energy Corp.', payee: 'TEAM, Inc.', payeeType: 'Provider', paidOn: '2024-07-15', status: 'Pending' },
];


// Rename 'assets' to 'clientAssets' for clarity
export { clientAssets as assets };

    














