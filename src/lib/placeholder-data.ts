

import { serviceProviders } from './service-providers-data';

export type Asset = {
    id: string;
    companyId: string;
    name: string;
    type: 'Tank' | 'Piping' | 'Vessel' | 'Crane' | 'Weld Joint';
    location: string;
    status: 'Operational' | 'Requires Inspection' | 'Under Repair' | 'Decommissioned';
    nextInspection: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    installationDate?: string;
    notes?: string;
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
    technique: 'UT' | 'PAUT' | 'TOFD' | 'RT' | 'CR' | 'DR' | 'CT' | 'MT' | 'PT' | 'VT' | 'RVI' | 'ET' | 'ACFM' | 'RFT' | 'MFL' | 'AE' | 'LT' | 'IR' | 'APR' | 'GWT';
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
    technique: 'UT' | 'RT' | 'MT' | 'PT' | 'VT' | 'PAUT' | 'ET';
    inspector: string;
    date: string;
    status: 'Scheduled' | 'Completed' | 'Requires Review';
};

export type EquipmentHistory = {
    event: 'Created' | 'Updated' | 'Checked Out' | 'Checked In' | 'Set to Available' | 'Set to Calibration Due' | 'Set to Out of Service' | 'Checked Out for Service';
    timestamp: string;
    user: string;
    notes?: string;
};

export type InspectorAsset = {
    id: string;
    name: string;
    type: string;
    providerId: string;
    status: 'Available' | 'In Use' | 'Calibration Due' | 'Out of Service' | 'Under Service';
    nextCalibration: string;
    history?: EquipmentHistory[];
};

export type Technician = {
    id: string;
    name: string;
    level: 'Level I' | 'Level II' | 'Level III';
    certifications: ('UT' | 'PAUT' | 'TOFD' | 'RT' | 'CR' | 'DR' | 'CT' | 'MT' | 'PT' | 'VT' | 'RVI' | 'ET' | 'ACFM' | 'RFT' | 'MFL' | 'AE' | 'LT' | 'IR' | 'APR' | 'GWT')[];
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
    { id: 'ASSET-001', companyId: 'client-02', name: 'Storage Tank T-101', type: 'Tank', location: 'Refinery A', status: 'Operational', nextInspection: '2024-09-15', manufacturer: 'Pro-Fab Tanks', serialNumber: 'SN-A1B2C3D4', installationDate: '2018-05-20' },
    { id: 'ASSET-006', companyId: 'client-01', name: 'Cooling Tower Piping', type: 'Piping', location: 'Refinery A', status: 'Operational', nextInspection: '2025-02-20', manufacturer: 'FlowLine Pipes', serialNumber: 'SN-E5F6G7H8', installationDate: '2019-11-10' },
    { id: 'ASSET-002', companyId: 'client-03', name: 'Main Steam Piping', type: 'Piping', location: 'Power Plant B', status: 'Requires Inspection', nextInspection: '2024-07-20', manufacturer: 'US Pipe', serialNumber: 'SN-I9J0K1L2', installationDate: '2015-03-12' },
    { id: 'ASSET-003', companyId: 'client-01', name: 'Pressure Vessel PV-203', type: 'Vessel', location: 'Chemical Plant C', status: 'Operational', nextInspection: '2025-01-10', manufacturer: 'Vessel Works', model: 'VW-2000', serialNumber: 'SN-M3N4O5P6', installationDate: '2020-01-15' },
    { id: 'ASSET-004', companyId: 'client-01', name: 'Overhead Crane C-01', type: 'Crane', location: 'Refinery A', status: 'Under Repair', nextInspection: '2024-08-01', manufacturer: 'Konecranes', model: 'CXT', serialNumber: 'SN-Q7R8S9T0', installationDate: '2017-09-01', notes: 'Motor requires replacement. Scheduled for Q3 service.' },
    { id: 'ASSET-005', companyId: 'client-04', name: 'Structural Weld SW-05', type: 'Weld Joint', location: 'Bridge E', status: 'Operational', nextInspection: '2024-11-22', notes: 'Critical load-bearing weld on main support beam.' },
    { id: 'ASSET-007', companyId: 'client-02', name: 'Condensate Storage Tank', type: 'Tank', location: 'Power Plant B', status: 'Requires Inspection', nextInspection: '2024-08-30', manufacturer: 'Pro-Fab Tanks', serialNumber: 'SN-U1V2W3X4', installationDate: '2016-07-22' },
    { id: 'ASSET-008', companyId: 'client-05', name: 'Process Piping Unit 5', type: 'Piping', location: 'Chemical Plant C', status: 'Operational', nextInspection: '2025-03-01', manufacturer: 'FlowLine Pipes', serialNumber: 'SN-Y5Z6A7B8', installationDate: '2021-02-18' },
    { id: 'ASSET-009', companyId: 'client-07', name: 'Gantry Crane G-02', type: 'Crane', location: 'Port Terminal F', status: 'Operational', nextInspection: '2024-12-01', manufacturer: 'Liebherr', model: 'LTM 1050', serialNumber: 'SN-C9D0E1F2', installationDate: '2019-08-05' },
];

export const inspectorAssets: InspectorAsset[] = [
    { 
        id: 'UTM-1000', 
        name: 'Olympus 45MG', 
        type: 'UT Equipment', 
        providerId: 'provider-03',
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
        providerId: 'provider-03',
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
        providerId: 'provider-03',
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
        providerId: 'provider-03',
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
    { id: 'TECH-06', name: 'Frank Miller', level: 'Level II', certifications: ['ET', 'ACFM', 'RFT'], status: 'Available', providerId: 'provider-02' },
    { id: 'TECH-07', name: 'Samantha Wu', level: 'Level III', certifications: ['VT', 'RVI', 'IR'], status: 'On Assignment', providerId: 'provider-04' },
    { id: 'TECH-08', name: 'James Wilson', level: 'Level II', certifications: ['UT', 'MT', 'PAUT'], status: 'Available', providerId: 'provider-03' },
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
    { 
        id: 'JOB-009', 
        title: 'APR Inspection of Boiler Tubes', 
        client: 'Chemical Plant C',
        location: 'Plaquemine, LA', 
        technique: 'APR', 
        status: 'Posted', 
        postedDate: '2024-07-12',
        bidExpiryDate: nextMonth.toISOString().split('T')[0],
        assetIds: ['ASSET-008'], 
        workflow: 'auto',
        documents: [ { name: 'Boiler_Tube_Diagram.pdf', url: '#' } ],
        history: [ { user: 'New Client User', timestamp: '2024-07-12 11:00 AM', action: 'Created and posted job.', statusChange: 'Posted' } ]
    },
    { id: 'JOB-010', title: 'Gantry Crane Cable Inspection', client: 'Port Authority', providerId: 'provider-04', location: 'Port Terminal F', technique: 'VT', status: 'In Progress', postedDate: '2024-07-08', scheduledStartDate: '2024-07-14', scheduledEndDate: '2024-07-15', technicianIds: ['TECH-07'], assetIds: ['ASSET-009'], workflow: 'standard' },
    { id: 'JOB-011', title: 'Tank Floor Corrosion Mapping', client: 'Marine Tankers Ltd.', providerId: 'provider-02', location: 'New Orleans, LA', technique: 'UT', status: 'Completed', postedDate: '2024-06-01', scheduledStartDate: '2024-06-20', scheduledEndDate: '2024-06-22', technicianIds: ['TECH-04', 'TECH-06'], assetIds: ['ASSET-007'], workflow: 'standard' },
    { id: 'JOB-012', title: 'Advanced RT of Turbine Blades', client: 'Power Generation LLC', providerId: 'provider-01', location: 'Houston, TX', technique: 'DR', status: 'Paid', postedDate: '2024-05-01', scheduledStartDate: '2024-05-25', scheduledEndDate: '2024-05-26', technicianIds: ['TECH-03'], workflow: 'level3' },
];

export const bids: Bid[] = [
    { id: 'BID-001', jobId: 'JOB-001', providerId: 'provider-01', amount: 12500, status: 'Submitted', submittedDate: '2024-06-29' },
    { id: 'BID-001A', jobId: 'JOB-001', providerId: 'provider-03', amount: 11800, status: 'Submitted', submittedDate: '2024-07-01' },
    { id: 'BID-002', jobId: 'JOB-002', providerId: 'provider-03', amount: 4800, status: 'Awarded', submittedDate: '2024-06-26' },
    { id: 'BID-003', jobId: 'JOB-005', providerId: 'provider-01', amount: 8200, status: 'Submitted', submittedDate: '2024-07-03' },
    { id: 'BID-004', jobId: 'JOB-006', providerId: 'provider-02', amount: 22000, status: 'Rejected', submittedDate: '2024-07-04' },
    { id: 'BID-004A', jobId: 'JOB-006', providerId: 'provider-01', amount: 21500, status: 'Awarded', submittedDate: '2024-07-04' },
    { id: 'BID-005', jobId: 'JOB-007', providerId: 'provider-01', amount: 15000, status: 'Awarded', submittedDate: '2024-07-06' },
    { id: 'BID-009', jobId: 'JOB-009', providerId: 'provider-05', amount: 9500, status: 'Submitted', submittedDate: '2024-07-13' },
    { id: 'BID-011', jobId: 'JOB-011', providerId: 'provider-02', amount: 18000, status: 'Awarded', submittedDate: '2024-06-05' },
    { id: 'BID-012', jobId: 'JOB-012', providerId: 'provider-01', amount: 35000, status: 'Awarded', submittedDate: '2024-05-05' },
];


export const inspections: Inspection[] = [
    { id: 'INSP-001', jobId: 'JOB-003', assetName: 'Storage Tank T-101', assetId: 'ASSET-001', technique: 'UT', inspector: 'Jane Smith', date: '2024-06-15', status: 'Completed' },
    { id: 'INSP-002', jobId: 'JOB-004', assetName: 'Main Steam Piping', assetId: 'ASSET-002', technique: 'PAUT', inspector: 'Pending', date: dayAfterTomorrow.toISOString().split('T')[0], status: 'Scheduled' },
    { id: 'INSP-003', jobId: 'JOB-002', assetName: 'Overhead Crane C-01', assetId: 'ASSET-004', technique: 'MT', inspector: 'Carlos Ray', date: '2024-06-21', status: 'Requires Review' },
    { id: 'INSP-004', jobId: 'JOB-007', assetName: 'Pressure Vessel PV-203', assetId: 'ASSET-003', technique: 'ET', inspector: 'Aisha Khan', date: yesterday.toISOString().split('T')[0], status: 'Requires Review' },
    { id: 'INSP-005', jobId: 'JOB-010', assetName: 'Gantry Crane G-02', assetId: 'ASSET-009', technique: 'VT', inspector: 'Samantha Wu', date: '2024-07-14', status: 'Completed' },
    { id: 'INSP-006', jobId: 'JOB-011', assetName: 'Condensate Storage Tank', assetId: 'ASSET-007', technique: 'UT', inspector: 'Frank Miller', date: '2024-06-21', status: 'Completed' },
    { id: 'INSP-007', jobId: 'JOB-012', assetName: 'Turbine Blades Set 1', assetId: 'N/A', technique: 'RT', inspector: 'Ben Carter', date: '2024-05-25', status: 'Completed' },
];

export const NDTTechniques = [
  { "id": "UT", "name": "Ultrasonic Testing" },
  { "id": "PAUT", "name": "Phased Array UT" },
  { "id": "TOFD", "name": "Time-of-Flight Diffraction" },
  { "id": "RT", "name": "Radiographic Testing" },
  { "id": "CR", "name": "Computed Radiography" },
  { "id": "DR", "name": "Digital Radiography" },
  { "id": "CT", "name": "Computed Tomography" },
  { "id": "MT", "name": "Magnetic Particle Testing" },
  { "id": "PT", "name": "Penetrant Testing" },
  { "id": "VT", "name": "Visual Testing" },
  { "id": "RVI", "name": "Remote Visual Inspection" },
  { "id": "ET", "name": "Electromagnetic Testing" },
  { "id": "ACFM", "name": "AC Field Measurement" },
  { "id": "RFT", "name": "Remote Field Testing" },
  { "id": "MFL", "name": "Magnetic Flux Leakage" },
  { "id": "AE", "name": "Acoustic Emission" },
  { "id": "LT", "name": "Leak Testing" },
  { "id": "IR", "name": "Infrared/Thermal Testing" },
  { "id": "APR", "name": "Acoustic Pulse Reflectometry" },
  { "id": "GWT", "name": "Guided Wave Testing" }
];

export const clientData: Client[] = [
    { id: 'client-01', name: 'Global Energy Corp.', contactPerson: 'John Doe', contactEmail: 'john.d@globalenergy.corp', activeJobs: 3, totalSpend: 250000 },
    { id: 'client-02', name: 'Marine Tankers Ltd.', contactPerson: 'Sarah Johnson', contactEmail: 's.johnson@marinetankers.com', activeJobs: 1, totalSpend: 93000 },
    { id: 'client-03', name: 'Energy Transfer', contactPerson: 'Mike Williams', contactEmail: 'm.williams@energytransfer.com', activeJobs: 1, totalSpend: 120000 },
    { id: 'client-04', name: 'State Department of Transportation', contactPerson: 'Emily White', contactEmail: 'ewhite@dot.state.gov', activeJobs: 1, totalSpend: 8200 },
    { id: 'auditor-01', name: 'NDT Auditors LLC', contactPerson: 'Alex Chen', contactEmail: 'alex.c@ndtauditors.gov', activeJobs: 0, totalSpend: 0 },
    { id: 'client-05', name: 'Chemical Plant C', contactPerson: 'New Client User', contactEmail: 'contact@chemc.com', activeJobs: 2, totalSpend: 24500 },
    { id: 'client-06', name: 'Power Generation LLC', contactPerson: 'Power Admin', contactEmail: 'admin@powergen.com', activeJobs: 2, totalSpend: 56500 },
    { id: 'client-07', name: 'Port Authority', contactPerson: 'Port Manager', contactEmail: 'manager@portauthority.com', activeJobs: 1, totalSpend: 0 },
];

export const reviews: Review[] = [
  { id: 'REV-001', jobId: 'JOB-003', providerId: 'provider-03', clientId: 'client-02', rating: 5, comment: 'Excellent and thorough service. The report was detailed and delivered on time.', date: '2024-06-20', status: 'Approved' },
  { id: 'REV-002', jobId: 'JOB-002', providerId: 'provider-03', clientId: 'client-01', rating: 4, comment: 'Good work, but the inspector was a bit late on the first day.', date: '2024-07-01', status: 'Pending' },
  { id: 'REV-003', jobId: 'JOB-004', providerId: 'provider-01', clientId: 'client-03', rating: 5, comment: 'Top-notch professionals. Ben Carter and his team are the best in the business.', date: '2024-07-15', status: 'Approved' },
  { id: 'REV-004', jobId: 'JOB-011', providerId: 'provider-02', clientId: 'client-02', rating: 4, comment: 'The team was efficient and professional. Found some areas we need to monitor, which was very helpful.', date: '2024-07-01', status: 'Approved' },
  { id: 'REV-005', jobId: 'JOB-012', providerId: 'provider-01', clientId: 'client-06', rating: 5, comment: 'Extremely high-quality digital radiography work. The clarity of the images was exceptional.', date: '2024-06-10', status: 'Pending' },
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
     { id: 'user-tech-09', name: 'Disabled Tech', email: 'old.tech@provider.com', role: 'Inspector (Level II)', company: 'Applus+', status: 'Disabled' },
     { id: 'user-client-06', name: 'New Client User', email: 'contact@chemc.com', role: 'Client', company: 'Chemical Plant C', status: 'Active' },
     { id: 'user-client-07', name: 'Power Admin', email: 'admin@powergen.com', role: 'Client', company: 'Power Generation LLC', status: 'Active' },
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
    { id: 'SUB-009', companyId: 'client-05', companyName: 'Chemical Plant C', plan: 'Client', status: 'Active', startDate: '2024-07-10', userCount: 3, dataUsageGB: 0.5 },
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
];


// Rename 'assets' to 'clientAssets' for clarity
export { clientAssets as assets };

    

```

</content>
  </change>
  <change>
    <file>src/app/dashboard/assets/page.tsx</file>
    <content><![CDATA[
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { clientAssets as initialClientAssets, Asset } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Building, QrCode, Calendar as CalendarIcon, Printer } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { TankIcon, PipeIcon, CraneIcon, WeldIcon } from "@/app/components/icons";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState, cloneElement } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useSearch } from "@/app/components/layout/search-provider";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn, GLOBAL_DATE_FORMAT, ACCEPTED_FILE_TYPES } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQRScanner } from "@/app/components/layout/qr-scanner-provider";
import { Textarea } from "@/components/ui/textarea";

const assetSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters.'),
    type: z.enum(['Tank', 'Piping', 'Vessel', 'Crane', 'Weld Joint']),
    location: z.string({ required_error: 'Please select a location or add a new one.'}),
    newLocation: z.string().optional(),
    status: z.enum(['Operational', 'Requires Inspection', 'Under Repair', 'Decommissioned']),
    nextInspection: z.date(),
    notes: z.string().optional(),
    thumbnail: z.any().optional(),
    documents: z.any().optional(),
}).refine(data => {
    if (data.location === '__add_new__') {
        return data.newLocation && data.newLocation.length > 2;
    }
    return true;
}, {
    message: 'New location name must be at least 3 characters.',
    path: ['newLocation'],
});

const AssetForm = ({ onCancel, onSubmit, assets }: { onCancel: () => void, onSubmit: (values: z.infer<typeof assetSchema>) => void, assets: Asset[] }) => {
    const form = useForm<z.infer<typeof assetSchema>>({
        resolver: zodResolver(assetSchema),
        defaultValues: {
            name: '',
            type: 'Tank',
            status: 'Operational',
            nextInspection: new Date(),
            notes: '',
        }
    });

    const [showNewLocation, setShowNewLocation] = useState(false);
    const uniqueLocations = useMemo(() => {
        const allLocations = assets.map(asset => asset.location);
        return [...new Set(allLocations)];
    }, [assets]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Asset Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Storage Tank T-102" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Asset Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Tank">Tank</SelectItem>
                                        <SelectItem value="Piping">Piping</SelectItem>
                                        <SelectItem value="Vessel">Vessel</SelectItem>
                                        <SelectItem value="Crane">Crane</SelectItem>
                                        <SelectItem value="Weld Joint">Weld Joint</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Operational">Operational</SelectItem>
                                        <SelectItem value="Requires Inspection">Requires Inspection</SelectItem>
                                        <SelectItem value="Under Repair">Under Repair</SelectItem>
                                        <SelectItem value="Decommissioned">Decommissioned</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <Select onValueChange={(value) => {
                                field.onChange(value);
                                setShowNewLocation(value === '__add_new__');
                            }} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select an existing location" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {uniqueLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                                    <SelectItem value="__add_new__">+ Add a new location</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 {showNewLocation && (
                    <FormField
                        control={form.control}
                        name="newLocation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Location Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Warehouse B, Section 3" {...field} autoFocus />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                 <FormField
                    control={form.control}
                    name="nextInspection"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Next Inspection Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, GLOBAL_DATE_FORMAT)
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                    date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes / Comments (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Add any additional details or comments about the asset..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="thumbnail"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Thumbnail Image (Optional)</FormLabel>
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0])} />
                            </FormControl>
                            <FormDescription>
                                This image will be used as the display card for the asset.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="documents"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Attach Additional Documents (Optional)</FormLabel>
                            <FormControl>
                                <Input type="file" multiple accept={ACCEPTED_FILE_TYPES} onChange={(e) => field.onChange(e.target.files)} />
                            </FormControl>
                            <FormDescription>
                                Attach initial drawings, photos, or certificates.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Create Asset</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};


const assetIcons = {
    'Tank': <TankIcon className="w-6 h-6 text-muted-foreground" />,
    'Piping': <PipeIcon className="w-6 h-6 text-muted-foreground" />,
    'Crane': <CraneIcon className="w-6 h-6 text-muted-foreground" />,
    'Vessel': <TankIcon className="w-6 h-6 text-muted-foreground" />,
    'Weld Joint': <WeldIcon className="w-6 h-6 text-muted-foreground" />,
};

const ClientAssetsView = ({ assets }: { assets: Asset[] }) => {
    const searchParams = useSearchParams();
    const [qrCodeData, setQrCodeData] = useState<{ id: string, name: string } | null>(null);
    const { searchQuery } = useSearch();

    const filteredAssets = useMemo(() => {
        if (!searchQuery) return assets;
        return assets.filter(asset => 
            asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, assets]);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const assetsByLocation = useMemo(() => {
        return filteredAssets.reduce((acc, asset) => {
            if (!acc[asset.location]) {
                acc[asset.location] = [];
            }
            acc[asset.location].push(asset);
            return acc;
        }, {} as Record<string, typeof initialClientAssets>);
    }, [filteredAssets]);

    return (
        <div className="space-y-8">
            {Object.keys(assetsByLocation).length === 0 && (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No assets found for your search.</p>
                </div>
            )}
            {Object.entries(assetsByLocation).map(([location, locationAssets]) => (
                <div key={location}>
                    <h2 className="text-xl font-semibold mb-4">{location}</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {locationAssets.map((asset) => {
                            const imageIndex = initialClientAssets.findIndex(a => a.id === asset.id);
                            const image = PlaceHolderImages.find(p => p.id === `asset${imageIndex + 1}`);
                            return (
                                <Card key={asset.id} className="flex flex-col">
                                    <CardHeader className="p-0">
                                        <div className="relative h-48 w-full flex items-center justify-center bg-muted/20 rounded-t-lg">
                                            {image ? (
                                                <Image src={image.imageUrl} alt={asset.name} fill className="object-cover rounded-t-lg" data-ai-hint={image.imageHint}/>
                                            ) : (
                                                cloneElement(assetIcons[asset.type], { className: 'w-16 h-16 text-muted-foreground/50' })
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 flex-grow">
                                        <div className="flex items-start justify-between">
                                            {assetIcons[asset.type]}
                                            <Badge variant={
                                                asset.status === 'Operational' ? 'success' :
                                                asset.status === 'Requires Inspection' ? 'destructive' :
                                                asset.status === 'Under Repair' ? 'secondary' : 'outline'
                                            }>{asset.status}</Badge>
                                        </div>
                                        <CardTitle className="mt-2 font-semibold text-lg">{asset.name}</CardTitle>
                                        <CardDescription>{asset.id}</CardDescription>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm text-muted-foreground">
                                        <span>Next: {format(new Date(asset.nextInspection), GLOBAL_DATE_FORMAT)}</span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild><Link href={constructUrl(`/dashboard/assets/${asset.id}`)}>View Details</Link></DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setQrCodeData({ id: asset.id, name: asset.name })}>Show QR Code</DropdownMenuItem>
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                <DropdownMenuItem>Archive</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            ))}
             <Dialog open={!!qrCodeData} onOpenChange={(open) => {if (!open) {setQrCodeData(null)}}}>
                <DialogContent className="sm:max-w-md">
                    <div className="printable-area">
                        <DialogHeader>
                            <DialogTitle>Asset QR Code</DialogTitle>
                            <DialogDescription>
                               Print this QR code and attach it to your asset for easy scanning.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center justify-center p-6 gap-4">
                            {qrCodeData && (
                                <>
                                    <Image 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCodeData.id)}`}
                                        alt={`QR Code for ${qrCodeData.name}`}
                                        width={250}
                                        height={250}
                                    />
                                    <div className="text-center">
                                        <p className="font-bold text-lg">{qrCodeData.name}</p>
                                        <p className="font-mono text-muted-foreground">{qrCodeData.id}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="non-printable">
                        <Button type="button" variant="secondary" onClick={() => setQrCodeData(null)}>
                            Close
                        </Button>
                        <Button type="button" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


export default function AssetsPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';

    // This would come from a user session/context in a real app
    // For this demo, we'll map the client role to a specific company ID
    const currentUserCompanyId = 'client-01'; // 'Global Energy Corp.'

    const [currentAssets, setCurrentAssets] = useState<Asset[]>(() =>
        initialClientAssets.filter(asset => asset.companyId === currentUserCompanyId)
    );
    
    const [isAddAssetOpen, setAddAssetOpen] = useState(false);
    const { setScanOpen } = useQRScanner();
    const { toast } = useToast();
    const router = useRouter();
    
    const handleFormSubmit = (values: z.infer<typeof assetSchema>) => {
        const finalLocation = values.location === '__add_new__' ? values.newLocation! : values.location;

        const newAsset: Asset = {
            id: `ASSET-${String(initialClientAssets.length + 1).padStart(3, '0')}`,
            companyId: currentUserCompanyId,
            name: values.name,
            type: values.type,
            location: finalLocation,
            status: values.status,
            nextInspection: format(values.nextInspection, 'yyyy-MM-dd'),
            notes: values.notes,
        };
        
        setCurrentAssets(prevAssets => {
            const newAssets = [newAsset, ...prevAssets];
            // Sort by location then name to keep things organized
            newAssets.sort((a, b) => {
                if (a.location < b.location) return -1;
                if (a.location > b.location) return 1;
                return a.name.localeCompare(b.name);
            });
            return newAssets;
        });

        toast({
            title: "Asset Created",
            description: `${values.name} has been added to your asset list.`,
        });
        
        if (values.thumbnail) {
            console.log("Uploaded thumbnail: ", values.thumbnail);
            toast({
                title: "Thumbnail Attached",
                description: `A thumbnail was attached to the new asset. (This is a simulation)`,
            });
        }

        if (values.documents && values.documents.length > 0) {
            console.log("Uploaded documents: ", values.documents);
            toast({
                title: "Documents Attached",
                description: `${values.documents.length} document(s) were attached to the new asset. (This is a simulation)`,
            });
        }

        setAddAssetOpen(false);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Building/>
                    Asset Management
                </h1>
                <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => setScanOpen(true)} className="w-full sm:w-auto">
                        <QrCode className="mr-2 h-4 w-4"/>
                        Scan Asset
                    </Button>
                    {role === 'client' && (
                        <Button variant="outline" onClick={() => setAddAssetOpen(true)} className="w-full sm:w-auto">
                            Add New Asset
                        </Button>
                    )}
                </div>
            </div>
            
            {role === 'client' ? <ClientAssetsView assets={currentAssets} /> : (
                 <div className="text-center p-10 border rounded-lg mt-8">
                    <QrCode className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-headline">Ready to Scan</h2>
                    <p className="mt-2 text-muted-foreground">Click "Scan Asset" to find an asset and view its details.</p>
                </div>
            )}


             <Dialog open={isAddAssetOpen} onOpenChange={setAddAssetOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Asset</DialogTitle>
                        <DialogDescription>
                            Enter the details for the new asset to add it to your inventory.
                        </DialogDescription>
                    </DialogHeader>
                    <AssetForm
                        assets={currentAssets}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setAddAssetOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

    
