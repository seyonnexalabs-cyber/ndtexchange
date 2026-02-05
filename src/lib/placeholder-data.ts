

import { serviceProviders } from './service-providers-data';

export type AssetUpdate = {
    user: string;
    timestamp: string;
    action: string;
    details?: string;
};

export type Asset = {
    id: string;
    companyId: string;
    name: string;
    type: 'Tank' | 'Piping' | 'Vessel' | 'Crane' | 'Weld Joint';
    location: string;
    status: 'Operational' | 'Requires Inspection' | 'Under Repair' | 'Decommissioned';
    approvalStatus: 'Approved' | 'Pending Approval' | 'Rejected';
    nextInspection: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    installationDate?: string;
    notes?: string;
    imageId?: string;
    history?: AssetUpdate[];
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
    bids: Bid[];
    inspections: Inspection[];
    isInternal?: boolean;
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
    event: 'Created' | 'Updated' | 'Checked Out' | 'Checked In' | 'Set to Available' | 'Set to Calibration Due' | 'Set to Out of Service' | 'Checked Out for Service' | 'Assigned to Kit' | 'Removed from Kit';
    timestamp: string;
    user: string;
    notes?: string;
};

export type EquipmentType = 'Instrument' | 'Probe' | 'Source' | 'Sensor' | 'Calibration Standard' | 'Accessory' | 'Visual Aid';

export type InspectorAsset = {
    id: string;
    name: string;
    type: EquipmentType;
    techniques: string[];
    providerId: string;
    status: 'Available' | 'In Use' | 'Calibration Due' | 'Out of Service' | 'Under Service';
    approvalStatus: 'Approved' | 'Pending Approval' | 'Rejected';
    nextCalibration: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    history?: EquipmentHistory[];
    isPublic?: boolean;
    imageId?: string;
    parentId?: string;
};

export type Certification = {
  method: string;
  level: 'Level I' | 'Level II' | 'Level III';
};

export type Bid = {
    id: string;
    jobId: string;
    providerId: string; // The company placing the bid
    amount: number;
    status: 'Submitted' | 'Awarded' | 'Rejected' | 'Withdrawn';
    submittedDate: string;
    comments?: string;
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
    // Technician-specific properties
    certifications?: Certification[];
    workStatus?: 'Available' | 'On Assignment';
    providerId?: string;
    level?: 'Level I' | 'Level II' | 'Level III';
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


export type SupportMessage = {
    user: string;
    userId: string;
    isAdmin: boolean;
    timestamp: string;
    message: string;
};

export type SupportThread = {
    id: string;
    userId: string;
    userName: string;
    userCompany: string;
    subject: string;
    status: 'Open' | 'Closed';
    messages: SupportMessage[];
};

export const supportThreads: SupportThread[] = [
    {
        id: 'SUPPORT-001',
        userId: 'user-client-01',
        userName: 'John Doe',
        userCompany: 'Global Energy Corp.',
        subject: 'General Support',
        status: 'Open',
        messages: [
            { userId: 'user-client-01', user: 'John Doe', isAdmin: false, timestamp: '2024-07-15T10:00:00Z', message: "Hi, I have a question about billing." },
            { userId: 'user-admin-01', user: 'Admin User', isAdmin: true, timestamp: '2024-07-15T10:01:00Z', message: "Hello John, I can help with that. What's your question?" },
            { userId: 'user-client-01', user: 'John Doe', isAdmin: false, timestamp: '2024-07-15T10:02:30Z', message: "I was wondering when the invoice for last month's subscription is due." },
        ]
    },
    {
        id: 'SUPPORT-002',
        userId: 'user-tech-05',
        userName: 'Maria Garcia',
        userCompany: 'TEAM, Inc.',
        subject: 'Technical Issue',
        status: 'Open',
        messages: [
            { userId: 'user-tech-05', user: 'Maria Garcia', isAdmin: false, timestamp: '2024-07-16T14:20:00Z', message: "I can't seem to check out the UTM-1000 equipment, it gives me an error." },
            { userId: 'user-admin-01', user: 'Admin User', isAdmin: true, timestamp: '2024-07-16T14:21:00Z', message: "Hi Maria, I'm looking into this. Can you confirm the status of the equipment on the inventory page?" },
            { userId: 'user-TECH-01', user: 'Carlos Ray', isAdmin: false, timestamp: '2024-07-16T14:25:00Z', message: "I'm seeing the same issue on my end. It says 'Available' but the checkout fails." }
        ]
    }
];

export type Notification = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  href: string;
};

export const notifications: Notification[] = [
    {
        id: 'NOTIF-001',
        title: 'New Bid on "PAUT on Pressure Vessel Welds"',
        description: 'TEAM, Inc. has placed a bid for $11,800.',
        timestamp: '2024-07-01T11:30:00Z',
        read: false,
        href: '/dashboard/my-jobs/JOB-001'
    },
    {
        id: 'NOTIF-002',
        title: 'Job Awarded: "MT Inspection on Crane Hooks"',
        description: 'Your bid for $4,800 has been accepted by Global Energy Corp.',
        timestamp: '2024-06-19T15:05:00Z',
        read: true,
        href: '/dashboard/my-jobs/JOB-002'
    },
    {
        id: 'NOTIF-003',
        title: 'New Message on "MT Inspection on Crane Hooks"',
        description: 'John Doe: "Thanks for the report. What was the outcome on that secondary hook?"',
        timestamp: '2024-06-22T10:00:00Z',
        read: false,
        href: '/dashboard/messages'
    },
    {
        id: 'NOTIF-004',
        title: 'Report Approved for "Tank Floor Corrosion Mapping"',
        description: 'The client has approved your report for JOB-011.',
        timestamp: '2024-07-03T16:00:00Z',
        read: true,
        href: '/dashboard/my-jobs/JOB-011'
    },
];


export const clientAssets: Asset[] = [
    { id: 'ASSET-001', companyId: 'client-02', name: 'Storage Tank T-101', type: 'Tank', location: 'Refinery A', status: 'Operational', nextInspection: '2024-09-15', manufacturer: 'Pro-Fab Tanks', serialNumber: 'SN-A1B2C3D4', installationDate: '2018-05-20', imageId: 'asset1', approvalStatus: 'Approved', history: [
        { user: 'John Doe', timestamp: '2024-07-20T08:00:00Z', action: 'Routine Check Logged: Daily Visual', details: 'Issues Found: No. Notes: All clear.' },
        { user: 'Admin', timestamp: '2018-05-20T09:00:00Z', action: 'Asset Created' }
    ] },
    { id: 'ASSET-006', companyId: 'client-01', name: 'Cooling Tower Piping', type: 'Piping', location: 'Refinery A', status: 'Operational', nextInspection: '2025-02-20', manufacturer: 'FlowLine Pipes', serialNumber: 'SN-E5F6G7H8', installationDate: '2019-11-10', imageId: 'asset6', approvalStatus: 'Approved' },
    { id: 'ASSET-002', companyId: 'client-03', name: 'Main Steam Piping', type: 'Piping', location: 'Power Plant B', status: 'Requires Inspection', nextInspection: '2024-07-20', manufacturer: 'US Pipe', serialNumber: 'SN-I9J0K1L2', installationDate: '2015-03-12', imageId: 'asset2', approvalStatus: 'Approved' },
    { id: 'ASSET-003', companyId: 'client-01', name: 'Pressure Vessel PV-203', type: 'Vessel', location: 'Chemical Plant C', status: 'Operational', nextInspection: '2025-01-10', manufacturer: 'Vessel Works', model: 'VW-2000', serialNumber: 'SN-M3N4O5P6', installationDate: '2020-01-15', imageId: 'asset5', approvalStatus: 'Approved' },
    { id: 'ASSET-004', companyId: 'client-01', name: 'Overhead Crane C-01', type: 'Crane', location: 'Refinery A', status: 'Under Repair', nextInspection: '2024-08-01', manufacturer: 'Konecranes', model: 'CXT', serialNumber: 'SN-Q7R8S9T0', installationDate: '2017-09-01', notes: 'Motor requires replacement. Scheduled for Q3 service.', imageId: 'asset3', approvalStatus: 'Approved' },
    { id: 'ASSET-005', companyId: 'client-04', name: 'Structural Weld SW-05', type: 'Weld Joint', location: 'Bridge E', status: 'Operational', nextInspection: '2024-11-22', notes: 'Critical load-bearing weld on main support beam.', imageId: 'asset4', approvalStatus: 'Approved' },
    { id: 'ASSET-007', companyId: 'client-02', name: 'Condensate Storage Tank', type: 'Tank', location: 'Power Plant B', status: 'Requires Inspection', nextInspection: '2024-08-30', manufacturer: 'Pro-Fab Tanks', serialNumber: 'SN-U1V2W3X4', installationDate: '2016-07-22', imageId: 'asset7', approvalStatus: 'Approved' },
    { id: 'ASSET-008', companyId: 'client-05', name: 'Process Piping Unit 5', type: 'Piping', location: 'Chemical Plant C', status: 'Operational', nextInspection: '2025-03-01', manufacturer: 'FlowLine Pipes', serialNumber: 'SN-Y5Z6A7B8', installationDate: '2021-02-18', imageId: 'asset8', approvalStatus: 'Approved' },
    { id: 'ASSET-009', companyId: 'client-07', name: 'Gantry Crane G-02', type: 'Crane', location: 'Port Terminal F', status: 'Operational', nextInspection: '2024-12-01', manufacturer: 'Liebherr', model: 'LTM 1050', serialNumber: 'SN-C9D0E1F2', installationDate: '2019-08-05', imageId: 'asset9', approvalStatus: 'Approved' },
    { id: 'ASSET-010', companyId: 'client-01', name: 'Heat Exchanger E-401', type: 'Vessel', location: 'Refinery A', status: 'Requires Inspection', nextInspection: '2024-07-30', manufacturer: 'HeatEx Inc.', model: 'HE-500', serialNumber: 'SN-G3H4I5J6', installationDate: '2019-01-20', approvalStatus: 'Approved' },
    { id: 'ASSET-PEND-01', companyId: 'client-01', name: 'New Pipeline Segment', type: 'Piping', location: 'Refinery A', status: 'Requires Inspection', approvalStatus: 'Pending Approval', nextInspection: '2025-06-01', notes: 'Newly created asset awaiting admin approval.' },
];

export const inspectorAssets: InspectorAsset[] = [
    { 
        id: 'UTM-1000', 
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
        imageId: 'tech-ut',
        history: [
            { event: 'Created', user: 'Admin', timestamp: '2023-01-05T10:00:00Z', notes: 'Item created in inventory.' },
            { event: 'Checked In', user: 'Jane Smith', timestamp: '2024-06-25T14:00:00Z', notes: 'Condition: Good. Job: Annual UT Thickness Survey.' },
            { event: 'Checked Out', user: 'Jane Smith', timestamp: '2024-06-10T08:00:00Z', notes: 'Job: Annual UT Thickness Survey' },
        ]
    },
    { 
        id: 'PA-Probe-5MHz', 
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
        imageId: 'tech-ut',
        parentId: 'UTM-1000',
        history: [
             { event: 'Assigned to Kit', user: 'Admin', timestamp: '2023-02-10T11:05:00Z', notes: 'Assigned to Olympus 45MG kit.' },
             { event: 'Checked Out', user: 'Carlos Ray', timestamp: '2024-07-01T09:30:00Z', notes: 'Job: Pipeline Weld Inspections' },
             { event: 'Created', user: 'Admin', timestamp: '2023-02-10T11:00:00Z', notes: 'Item created in inventory.' }
        ]
    },
    { 
        id: 'CAL-BLK-01', 
        name: 'IIW Type 1 Block',
        type: 'Calibration Standard',
        manufacturer: 'Generic',
        techniques: ['UT', 'PAUT'], 
        providerId: 'provider-03',
        status: 'Available', 
        approvalStatus: 'Approved',
        nextCalibration: 'N/A',
        isPublic: false,
        parentId: 'UTM-1000',
        history: [
            { event: 'Assigned to Kit', user: 'Admin', timestamp: '2023-01-15T16:05:00Z', notes: 'Assigned to Olympus 45MG kit.' },
            { event: 'Created', user: 'Admin', timestamp: '2023-01-15T16:00:00Z', notes: 'Item created in inventory.' }
        ]
    },
    { 
        id: 'YOKE-02', 
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
        imageId: 'tech-mt',
        history: [
            { event: 'Set to Calibration Due', user: 'System', timestamp: '2024-07-15T00:00:00Z', notes: 'Automatic status change based on calibration date.' },
            { event: 'Checked In', user: 'Carlos Ray', timestamp: '2024-06-22T17:00:00Z', notes: 'Condition: Good. Job: MT Inspection on Crane Hooks' },
            { event: 'Checked Out', user: 'Carlos Ray', timestamp: '2024-06-21T09:00:00Z', notes: 'Job: MT Inspection on Crane Hooks' },
            { event: 'Created', user: 'Admin', timestamp: '2023-03-01T12:00:00Z', notes: 'Item created in inventory.' }
        ]
    },
    {
        id: 'APR-G3',
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
        imageId: 'tech-apr',
        history: [
             { event: 'Created', user: 'Admin', timestamp: '2024-05-20T10:00:00Z', notes: 'New advanced equipment added.' }
        ]
    },
    {
        id: 'EQ-PEND-01',
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
            { user: 'John Doe', timestamp: '2024-06-28T10:00:00Z', action: 'Created job and posted to marketplace.', statusChange: 'Posted' },
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
        technicianIds: ['user-TECH-01'], 
        equipmentIds: ['YOKE-02'], 
        assetIds: ['ASSET-004'], 
        workflow: 'level3',
        history: [
            { user: 'Carlos Ray', timestamp: '2024-06-22T09:00:00Z', action: 'Submitted inspection report.', documentName: 'Inspection_Report_JOB-002.pdf', statusChange: 'Report Submitted' },
            { user: 'Carlos Ray', timestamp: '2024-06-21T08:00:00Z', action: 'Assigned resources.', details: 'Assigned Carlos Ray, Parker B-300S' },
            { user: 'Maria Garcia', timestamp: '2024-06-20T08:00:00Z', action: 'Scheduled job.', details: 'Inspection scheduled for 2024-06-21', statusChange: 'Scheduled' },
            { user: 'John Doe', timestamp: '2024-06-19T15:00:00Z', action: 'Awarded job to provider "TEAM, Inc." for $4,800.', statusChange: 'Assigned' },
            { user: 'Carlos Ray', timestamp: '2024-06-18T14:00:00Z', action: 'Bid for $4,800 submitted by TEAM, Inc.', details: 'Includes on-site mobilization and reporting.' },
            { user: 'John Doe', timestamp: '2024-06-18T10:00:00Z', action: 'Created job and posted to marketplace.', statusChange: 'Posted' },
        ],
        messages: [
            { user: 'John Doe', role: 'Client', timestamp: '2024-06-20T14:15:00Z', message: 'Carlos, please ensure you check the secondary hook as well. We had some concerns about it during the last visual inspection.' },
            { user: 'Carlos Ray', role: 'Inspector', timestamp: '2024-06-20T15:00:00Z', message: 'Not a problem, John. I\'ve added it to the inspection plan. I will pay special attention to it.' },
            { user: 'John Doe', role: 'Client', timestamp: '2024-06-22T10:00:00Z', message: 'Thanks for the report. What was the outcome on that secondary hook?' },
        ],
        documents: [
            { name: 'Crane_Maintenance_Manual.pdf', url: '#' },
            { name: 'Lifting_Procedure.pdf', url: '#' },
        ],
    },
    { id: 'JOB-003', title: 'Annual UT Thickness Survey', client: 'Marine Tankers Ltd.', providerId: 'provider-01', location: 'New Orleans, LA', technique: 'UT', status: 'Completed', postedDate: '2024-05-15', scheduledStartDate: '2024-06-10', scheduledEndDate: '2024-06-12', technicianIds: ['user-TECH-02'], equipmentIds: ['UTM-1000'], assetIds: ['ASSET-001'], workflow: 'standard' },
    { 
        id: 'JOB-004', 
        title: 'Pipeline Weld Inspections', 
        client: 'Energy Transfer', 
        providerId: 'provider-01', 
        location: 'Midland, TX', 
        technique: 'PAUT', 
        status: 'In Progress', 
        postedDate: '2024-07-01', 
        scheduledStartDate: dayAfterTomorrow.toISOString().split('T')[0], 
        scheduledEndDate: twoDaysAfterTomorrow.toISOString().split('T')[0], 
        technicianIds: ['user-TECH-01', 'user-TECH-03'], 
        equipmentIds: ['UTM-1000', 'PA-Probe-5MHz'], 
        assetIds: ['ASSET-002'], 
        workflow: 'level3',
        messages: [
            { user: 'Ben Carter', role: 'Inspector', timestamp: '2024-07-01T11:00:00Z', message: 'Team, just confirming we are all set for the Midland job tomorrow. All equipment is calibrated.'},
            { user: 'Carlos Ray', role: 'Inspector', timestamp: '2024-07-01T11:05:00Z', message: 'Confirmed. I have the procedure documents ready.'},
        ]
    },
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
    { id: 'JOB-007', title: 'Eddy Current on Heat Exchanger Tubes', client: 'Chemical Plant C', providerId: 'provider-01', location: 'Baton Rouge, LA', technique: 'ET', status: 'Report Submitted', postedDate: '2024-07-05', scheduledStartDate: yesterday.toISOString().split('T')[0], scheduledEndDate: yesterday.toISOString().split('T')[0], assetIds: ['ASSET-003'], technicianIds: ['user-TECH-02'], workflow: 'level3' },
    { id: 'JOB-008', title: 'Emergency Repair Verification', client: 'Global Energy Corp.', providerId: 'provider-03', location: 'Long Beach, CA', technique: 'UT', status: 'Scheduled', postedDate: '2024-07-10', scheduledStartDate: tomorrow.toISOString().split('T')[0], scheduledEndDate: dayAfterTomorrow.toISOString().split('T')[0], technicianIds: ['user-TECH-03'], equipmentIds: ['UTM-1000'], assetIds: ['ASSET-004'], workflow: 'standard' },
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
        history: [ { user: 'New Client User', timestamp: '2024-07-12T11:00:00Z', action: 'Created and posted job.', statusChange: 'Posted' } ]
    },
    { id: 'JOB-010', title: 'Gantry Crane Cable Inspection', client: 'Port Authority', providerId: 'provider-04', location: 'Port Terminal F', technique: 'VT', status: 'Completed', postedDate: '2024-07-08', scheduledStartDate: '2024-07-14', scheduledEndDate: '2024-07-15', technicianIds: ['user-TECH-07'], assetIds: ['ASSET-009'], workflow: 'standard' },
    { id: 'JOB-011', title: 'Tank Floor Corrosion Mapping', client: 'Marine Tankers Ltd.', providerId: 'provider-02', location: 'New Orleans, LA', technique: 'UT', status: 'Completed', postedDate: '2024-06-01', scheduledStartDate: '2024-06-20', scheduledEndDate: '2024-06-22', technicianIds: ['user-TECH-04', 'user-TECH-06'], assetIds: ['ASSET-007'], workflow: 'standard' },
    { id: 'JOB-012', title: 'Advanced RT of Turbine Blades', client: 'Power Generation LLC', providerId: 'provider-01', location: 'Houston, TX', technique: 'DR', status: 'Paid', postedDate: '2024-05-01', scheduledStartDate: '2024-05-25', scheduledEndDate: '2024-05-26', technicianIds: ['user-TECH-03'], workflow: 'level3' },
    { id: 'JOB-013', title: 'Acoustic Emission Monitoring of Sphere Tank', client: 'Global Energy Corp.', providerId: 'provider-09', location: 'Freeport, TX', technique: 'AE', status: 'Assigned', postedDate: '2024-07-20', assetIds: [], workflow: 'level3' },
    { id: 'JOB-014', title: 'Internal Corrosion Mapping of Piping', client: 'Energy Transfer', providerId: 'provider-03', location: 'Permian Basin, TX', technique: 'UT', status: 'In Progress', postedDate: '2024-07-18', scheduledStartDate: '2024-07-25', scheduledEndDate: '2024-07-28', technicianIds: ['user-TECH-01', 'user-TECH-08'], equipmentIds: ['UTM-1000'], assetIds: ['ASSET-002'], workflow: 'standard' },
    { id: 'JOB-015', title: 'Remote Visual Inspection of Gearbox', client: 'Manufacturing Solutions Inc.', providerId: 'provider-07', location: 'Detroit, MI', technique: 'RVI', status: 'Completed', postedDate: '2024-07-01', scheduledStartDate: '2024-07-10', scheduledEndDate: '2024-07-10', technicianIds: ['user-TECH-02'], workflow: 'standard' },
    { id: 'JOB-016', title: 'MFL Scan of Tank Floor', client: 'Marine Tankers Ltd.', status: 'Posted', postedDate: '2024-07-22', bidExpiryDate: nextMonth.toISOString().split('T')[0], assetIds: ['ASSET-001'], workflow: 'auto' },
    { id: 'JOB-017', title: 'Shutdown Support - PT/MT', client: 'Global Energy Corp.', providerId: 'provider-03', location: 'Houston, TX', technique: 'PT', status: 'Scheduled', postedDate: '2024-07-25', scheduledStartDate: nextWeek.toISOString().split('T')[0], scheduledEndDate: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], assetIds: [], workflow: 'standard' },
    { id: 'JOB-018', title: 'Landing Gear Weld Inspection', client: 'Aviation Maintenance Pros', location: 'Wichita, KS', technique: 'RT', status: 'Posted', postedDate: '2024-07-28', bidExpiryDate: '2024-08-10', assetIds: [], workflow: 'level3' },
    { id: 'JOB-019', title: 'Fuselage Skin Eddy Current Scan', client: 'Aviation Maintenance Pros', location: 'Wichita, KS', technique: 'ET', status: 'Posted', postedDate: '2024-07-29', bidExpiryDate: '2024-08-12', assetIds: [], workflow: 'standard' },
    { id: 'JOB-020', title: 'Marine Riser Inspection', client: 'Global Energy Corp.', location: 'Gulf of Mexico', technique: 'UT', status: 'Completed', postedDate: '2024-06-15', providerId: 'provider-12', scheduledStartDate: '2024-07-01', scheduledEndDate: '2024-07-03', technicianIds: ['user-TECH-15'], assetIds: [], workflow: 'standard' },
    { 
        id: 'JOB-021', 
        title: 'Tank Wall Thickness UT', 
        client: 'Global Energy Corp.', 
        providerId: 'provider-01',
        location: 'Houston, TX', 
        technique: 'UT', 
        status: 'Client Review', 
        postedDate: '2024-07-15', 
        scheduledStartDate: '2024-07-22', 
        scheduledEndDate: '2024-07-22', 
        technicianIds: ['user-TECH-03'], 
        equipmentIds: ['UTM-1000'], 
        assetIds: ['ASSET-001'], 
        workflow: 'standard',
        history: [
            { user: 'Ben Carter', timestamp: '2024-07-23T11:00:00Z', action: 'Submitted inspection report.', documentName: 'Inspection_Report_JOB-021.pdf', statusChange: 'Report Submitted' },
            { user: 'John Doe', timestamp: '2024-07-16T10:00:00Z', action: 'Awarded job to MISTRAS Group.', statusChange: 'Assigned' },
        ]
    },
    { 
        id: 'JOB-022', 
        title: 'Nozzle Weld PAUT', 
        client: 'Global Energy Corp.', 
        providerId: 'provider-02',
        location: 'Freeport, TX', 
        technique: 'PAUT', 
        status: 'Audit Approved', 
        postedDate: '2024-07-10', 
        scheduledStartDate: '2024-07-20', 
        scheduledEndDate: '2024-07-20', 
        technicianIds: ['user-TECH-04'], 
        equipmentIds: ['PA-Probe-5MHz'], 
        assetIds: ['ASSET-003'], 
        workflow: 'level3',
        history: [
             { user: 'Alex Chen', timestamp: '2024-07-24T10:00:00Z', action: 'Approved inspection report.', statusChange: 'Audit Approved' },
             { user: 'David Lee', timestamp: '2024-07-21T16:00:00Z', action: 'Submitted inspection report.', documentName: 'Inspection_Report_JOB-022.pdf', statusChange: 'Report Submitted' },
        ]
    },
     { 
        id: 'JOB-023', 
        title: 'Flare Stack RVI', 
        client: 'TEAM, Inc.', 
        providerId: 'provider-03', 
        location: 'Midland, TX', 
        technique: 'RVI', 
        status: 'Scheduled', 
        postedDate: '2024-07-28', 
        scheduledStartDate: '2024-08-05', 
        technicianIds: ['user-TECH-05'],
        workflow: 'standard',
        isInternal: true,
    },
    { 
        id: 'JOB-024', 
        title: 'Storage Tank Weld RT', 
        client: 'Marine Tankers Ltd.', 
        providerId: 'provider-04',
        location: 'New Orleans, LA', 
        technique: 'RT', 
        status: 'Report Submitted', 
        postedDate: '2024-07-20', 
        scheduledStartDate: '2024-07-25',
        technicianIds: ['user-TECH-07'],
        workflow: 'level3',
        history: [
            { user: 'Samantha Wu', timestamp: '2024-07-26T14:00:00Z', action: 'Submitted inspection report.', documentName: 'Inspection_Report_JOB-024.pdf', statusChange: 'Report Submitted' }
        ]
    },
];

const bidsData: Bid[] = [
    { id: 'BID-001', jobId: 'JOB-001', providerId: 'provider-01', amount: 12500, status: 'Submitted', submittedDate: '2024-06-29', comments: 'We are available to start next week. Our Level III is on standby for data review.' },
    { id: 'BID-001A', jobId: 'JOB-001', providerId: 'provider-03', amount: 11800, status: 'Submitted', submittedDate: '2024-07-01', comments: 'Our team has extensive experience with this vessel type. We can mobilize within 48 hours.' },
    { id: 'BID-002', jobId: 'JOB-002', providerId: 'provider-03', amount: 4800, status: 'Awarded', submittedDate: '2024-06-18' },
    { id: 'BID-003', jobId: 'JOB-005', providerId: 'provider-01', amount: 8200, status: 'Submitted', submittedDate: '2024-07-03' },
    { id: 'BID-004', jobId: 'JOB-006', providerId: 'provider-02', amount: 22000, status: 'Rejected', submittedDate: '2024-07-04' },
    { id: 'BID-004A', jobId: 'JOB-006', providerId: 'provider-01', amount: 21500, status: 'Awarded', submittedDate: '2024-07-04' },
    { id: 'BID-005', jobId: 'JOB-007', providerId: 'provider-01', amount: 15000, status: 'Awarded', submittedDate: '2024-07-06' },
    { id: 'BID-009', jobId: 'JOB-009', providerId: 'provider-05', amount: 9500, status: 'Submitted', submittedDate: '2024-07-13' },
    { id: 'BID-011', jobId: 'JOB-011', providerId: 'provider-02', amount: 18000, status: 'Awarded', submittedDate: '2024-06-05' },
    { id: 'BID-012', jobId: 'JOB-012', providerId: 'provider-01', amount: 35000, status: 'Awarded', submittedDate: '2024-05-05' },
    { id: 'BID-013', jobId: 'JOB-013', providerId: 'provider-09', amount: 18000, status: 'Awarded', submittedDate: '2024-07-22' },
    { id: 'BID-015', jobId: 'JOB-015', providerId: 'provider-07', amount: 3500, status: 'Awarded', submittedDate: '2024-07-03' },
    { id: 'BID-016', jobId: 'JOB-016', providerId: 'provider-02', amount: 14000, status: 'Submitted', submittedDate: '2024-07-24' },
    { id: 'BID-017', jobId: 'JOB-017', providerId: 'provider-03', amount: 19500, status: 'Awarded', submittedDate: '2024-07-26' },
    { id: 'BID-018', jobId: 'JOB-018', providerId: 'provider-11', amount: 25000, status: 'Submitted', submittedDate: '2024-07-29' },
    { id: 'BID-019', jobId: 'JOB-019', providerId: 'provider-11', amount: 18000, status: 'Submitted', submittedDate: '2024-07-30' },
    { id: 'BID-020', jobId: 'JOB-020', providerId: 'provider-12', amount: 32000, status: 'Awarded', submittedDate: '2024-06-20' },
    { id: 'BID-021', jobId: 'JOB-021', providerId: 'provider-01', amount: 7500, status: 'Awarded', submittedDate: '2024-07-16' },
    { id: 'BID-022', jobId: 'JOB-022', providerId: 'provider-02', amount: 13000, status: 'Awarded', submittedDate: '2024-07-12' },
    { id: 'BID-023', jobId: 'JOB-023', providerId: 'provider-03', amount: 5500, status: 'Awarded', submittedDate: '2024-07-29' },
    { id: 'BID-024', jobId: 'JOB-024', providerId: 'provider-04', amount: 19000, status: 'Awarded', submittedDate: '2024-07-21' },
];

const inspectionsData: Inspection[] = [
    { id: 'INSP-001', jobId: 'JOB-003', assetName: 'Storage Tank T-101', assetId: 'ASSET-001', technique: 'UT', inspector: 'Jane Smith', date: '2024-06-15', status: 'Completed' },
    { id: 'INSP-002', jobId: 'JOB-004', assetName: 'Main Steam Piping', assetId: 'ASSET-002', technique: 'PAUT', inspector: 'Pending', date: dayAfterTomorrow.toISOString().split('T')[0], status: 'Scheduled' },
    { id: 'INSP-003', jobId: 'JOB-002', assetName: 'Overhead Crane C-01', assetId: 'ASSET-004', technique: 'MT', inspector: 'Carlos Ray', date: '2024-06-21', status: 'Requires Review' },
    { id: 'INSP-004', jobId: 'JOB-007', assetName: 'Pressure Vessel PV-203', assetId: 'ASSET-003', technique: 'ET', inspector: 'Aisha Khan', date: yesterday.toISOString().split('T')[0], status: 'Requires Review' },
    { id: 'INSP-005', jobId: 'JOB-010', assetName: 'Gantry Crane G-02', assetId: 'ASSET-009', technique: 'VT', inspector: 'Samantha Wu', date: '2024-07-14', status: 'Completed' },
    { id: 'INSP-006', jobId: 'JOB-011', assetName: 'Condensate Storage Tank', assetId: 'ASSET-007', technique: 'UT', inspector: 'Frank Miller', date: '2024-06-21', status: 'Completed' },
    { id: 'INSP-007', jobId: 'JOB-012', assetName: 'Turbine Blades Set 1', assetId: 'N/A', technique: 'RT', inspector: 'Ben Carter', date: '2024-05-25', status: 'Completed' },
    { id: 'INSP-008', jobId: 'JOB-014', assetName: 'Main Steam Piping', assetId: 'ASSET-002', technique: 'UT', inspector: 'Carlos Ray', date: '2024-07-26', status: 'Scheduled' },
    { id: 'INSP-009', jobId: 'JOB-015', assetName: 'Manufacturing Gearbox', assetId: 'N/A', technique: 'VT', inspector: 'Aisha Khan', date: '2024-07-10', status: 'Completed' },
    { id: 'INSP-010', jobId: 'JOB-017', assetName: 'Various Assets', assetId: 'N/A', technique: 'PT', inspector: 'Pending', date: nextWeek.toISOString().split('T')[0], status: 'Scheduled' },
    { id: 'INSP-011', jobId: 'JOB-020', assetName: 'Marine Riser Segment 4', assetId: 'N/A', technique: 'UT', inspector: 'Lars Andersen', date: '2024-07-02', status: 'Completed' },
    { id: 'INSP-012', jobId: 'JOB-021', assetName: 'Storage Tank T-101', assetId: 'ASSET-001', technique: 'UT', inspector: 'Ben Carter', date: '2024-07-22', status: 'Completed' },
    { id: 'INSP-013', jobId: 'JOB-022', assetName: 'Pressure Vessel PV-203', assetId: 'ASSET-003', technique: 'PAUT', inspector: 'David Lee', date: '2024-07-20', status: 'Requires Review' },
    { id: 'INSP-014', jobId: 'JOB-023', assetName: 'Flare Stack FS-01', assetId: 'N/A', technique: 'VT', inspector: 'Maria Garcia', date: '2024-08-05', status: 'Scheduled' },
    { id: 'INSP-015', jobId: 'JOB-024', assetName: 'Storage Tank T-205', assetId: 'N/A', technique: 'RT', inspector: 'Samantha Wu', date: '2024-07-25', status: 'Requires Review' },
];

export const jobs: Job[] = jobsData.map(job => ({
    ...job,
    bids: bidsData.filter(bid => bid.jobId === job.id),
    inspections: inspectionsData.filter(inspection => inspection.jobId === job.id),
}));


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
    { id: 'client-08', name: 'Manufacturing Solutions Inc.', contactPerson: 'Factory Manager', contactEmail: 'fm@mansol.com', activeJobs: 1, totalSpend: 3500 },
    { id: 'client-09', name: 'Aviation Maintenance Pros', contactPerson: 'Chuck Yeager', contactEmail: 'chuck@avpros.com', activeJobs: 2, totalSpend: 45000 },
];

export const reviews: Review[] = [
  { id: 'REV-001', jobId: 'JOB-003', providerId: 'provider-03', clientId: 'client-02', rating: 5, comment: 'Excellent and thorough service. The report was detailed and delivered on time.', date: '2024-06-20', status: 'Approved' },
  { id: 'REV-002', jobId: 'JOB-002', providerId: 'provider-03', clientId: 'client-01', rating: 4, comment: 'Good work, but the inspector was a bit late on the first day.', date: '2024-07-01', status: 'Pending' },
  { id: 'REV-003', jobId: 'JOB-004', providerId: 'provider-01', clientId: 'client-03', rating: 5, comment: 'Top-notch professionals. Ben Carter and his team are the best in the business.', date: '2024-07-15', status: 'Approved' },
  { id: 'REV-004', jobId: 'JOB-011', providerId: 'provider-02', clientId: 'client-02', rating: 4, comment: 'The team was efficient and professional. Found some areas we need to monitor, which was very helpful.', date: '2024-07-01', status: 'Approved' },
  { id: 'REV-005', jobId: 'JOB-012', providerId: 'provider-01', clientId: 'client-06', rating: 5, comment: 'Extremely high-quality digital radiography work. The clarity of the images was exceptional.', date: '2024-06-10', status: 'Pending' },
  { id: 'REV-006', jobId: 'JOB-010', providerId: 'provider-04', clientId: 'client-07', rating: 5, comment: 'Very professional and on time.', date: '2024-07-18', status: 'Pending' },
  { id: 'REV-007', jobId: 'JOB-015', providerId: 'provider-07', clientId: 'client-08', rating: 4, comment: 'Good service, would use again.', date: '2024-07-12', status: 'Approved' },
  { id: 'REV-008', jobId: 'JOB-020', providerId: 'provider-12', clientId: 'client-01', rating: 5, comment: 'DNV provided excellent service. Very knowledgeable and professional.', date: '2024-07-10', status: 'Approved' },
  { id: 'REV-009', jobId: 'JOB-010', providerId: 'provider-04', clientId: 'client-07', rating: 4, comment: 'Solid work, communication could be slightly better.', date: '2024-07-25', status: 'Pending' },
];

export const allUsers: PlatformUser[] = [
    { id: 'user-client-01', name: 'John Doe', email: 'john.d@globalenergy.corp', role: 'Client', company: 'Global Energy Corp.', status: 'Active' },
    { id: 'user-client-02', name: 'Sarah Johnson', email: 's.johnson@marinetankers.com', role: 'Client', company: 'Marine Tankers Ltd.', status: 'Active' },
    { id: 'user-admin-01', name: 'Admin User', email: 'admin@ndtexchange.com', role: 'Admin', company: 'NDT Exchange', status: 'Active' },
    { id: 'user-auditor-01', name: 'Alex Chen', email: 'alex.c@ndtauditors.gov', role: 'Auditor', company: 'NDT Auditors LLC', status: 'Active' },
    { id: 'user-auditor-02', name: 'Brenda Vance', email: 'brenda.v@ndtauditors.gov', role: 'Senior Auditor', company: 'Aero-Compliance Partners', status: 'Active' },
    { id: 'user-TECH-01', name: 'Carlos Ray', email: 'carlos.ray@teaminc.com', role: 'Inspector', company: 'TEAM, Inc.', status: 'Active', certifications: [{method: 'UT', level: 'Level II'}, {method: 'MT', level: 'Level II'}, {method: 'PT', level: 'Level II'}], workStatus: 'Available', providerId: 'provider-03', level: 'Level II' },
    { id: 'user-TECH-02', name: 'Aisha Khan', email: 'aisha.khan@mistras.com', role: 'Inspector', company: 'MISTRAS Group', status: 'Active', certifications: [{method: 'RT', level: 'Level II'}, {method: 'VT', level: 'Level II'}, {method: 'ET', level: 'Level II'}], workStatus: 'On Assignment', providerId: 'provider-01', level: 'Level II' },
    { id: 'user-TECH-03', name: 'Ben Carter', email: 'ben.carter@mistras.com', role: 'Inspector', company: 'MISTRAS Group', status: 'Active', certifications: [{method: 'UT', level: 'Level III'}, {method: 'PAUT', level: 'Level III'}, {method: 'TOFD', level: 'Level II'}, {method: 'AE', level: 'Level II'}], workStatus: 'Available', providerId: 'provider-01', level: 'Level III' },
    { id: 'user-TECH-04', name: 'David Lee', email: 'david.lee@applus.com', role: 'Inspector', company: 'Applus+', status: 'Active', certifications: [{method: 'MT', level: 'Level I'}, {method: 'PT', level: 'Level I'}], workStatus: 'Available', providerId: 'provider-02', level: 'Level I' },
    { id: 'user-TECH-05', name: 'Maria Garcia', email: 'maria.garcia@teaminc.com', role: 'Inspector', company: 'TEAM, Inc.', status: 'Active', certifications: [{method: 'UT', level: 'Level II'}, {method: 'RT', level: 'Level II'}], workStatus: 'On Assignment', providerId: 'provider-03', level: 'Level II' },
    { id: 'user-TECH-06', name: 'Frank Miller', email: 'frank.miller@applus.com', role: 'Inspector', company: 'Applus+', status: 'Active', certifications: [{method: 'ET', level: 'Level II'}, {method: 'ACFM', level: 'Level II'}, {method: 'RFT', level: 'Level II'}], workStatus: 'Available', providerId: 'provider-02', level: 'Level II' },
    { id: 'user-TECH-07', name: 'Samantha Wu', email: 'samantha.wu@tuv.com', role: 'Inspector', company: 'TÜV Rheinland', status: 'Active', certifications: [{method: 'VT', level: 'Level III'}, {method: 'RVI', level: 'Level II'}, {method: 'IR', level: 'Level II'}], workStatus: 'On Assignment', providerId: 'provider-04', level: 'Level III' },
    { id: 'user-TECH-08', name: 'James Wilson', email: 'james.wilson@teaminc.com', role: 'Inspector', company: 'TEAM, Inc.', status: 'Active', certifications: [{method: 'UT', level: 'Level II'}, {method: 'MT', level: 'Level II'}, {method: 'PAUT', level: 'Level I'}], workStatus: 'Available', providerId: 'provider-03', level: 'Level II' },
    { id: 'user-TECH-09', name: 'Steven Shaw', email: 'steven.shaw@teaminc.com', role: 'Inspector', company: 'TEAM, Inc.', status: 'Disabled', certifications: [{method: 'RT', level: 'Level II'}], workStatus: undefined, providerId: 'provider-03', level: 'Level II' },
    { id: 'user-TECH-10', name: 'Olivia Chen', email: 'olivia.chen@tuv.com', role: 'Inspector', company: 'TÜV Rheinland', status: 'Active', certifications: [{method: 'PT', level: 'Level II'}, {method: 'VT', level: 'Level II'}], workStatus: 'Available', providerId: 'provider-04', level: 'Level II' },
    { id: 'user-TECH-11', name: 'Michael Brown', email: 'michael.brown@teaminc.com', role: 'Inspector', company: 'TEAM, Inc.', status: 'Active', certifications: [{method: 'UT', level: 'Level I'}, {method: 'MT', level: 'Level I'}], workStatus: 'Available', providerId: 'provider-03', level: 'Level I' },
    { id: 'user-TECH-12', name: 'Emily Rodriguez', email: 'emily.rodriguez@mistras.com', role: 'Inspector', company: 'MISTRAS Group', status: 'Active', certifications: [{method: 'PAUT', level: 'Level II'}, {method: 'UT', level: 'Level II'}], workStatus: 'On Assignment', providerId: 'provider-01', level: 'Level II' },
    { id: 'user-TECH-13', name: 'Isabelle Laurent', email: 'isabelle.laurent@sgs.com', role: 'Inspector', company: 'SGS', status: 'Active', certifications: [{method: 'RT', level: 'Level III'}, {method: 'UT', level: 'Level II'}], workStatus: 'Available', providerId: 'provider-11', level: 'Level III' },
    { id: 'user-TECH-14', name: 'Jean-Pierre', email: 'jp@sgs.com', role: 'Inspector', company: 'SGS', status: 'Active', certifications: [{method: 'ET', level: 'Level II'}, {method: 'PT', level: 'Level II'}], workStatus: 'Available', providerId: 'provider-11', level: 'Level II' },
    { id: 'user-TECH-15', name: 'Lars Andersen', email: 'lars.andersen@dnv.com', role: 'Inspector', company: 'DNV (Det Norske Veritas)', status: 'Active', certifications: [{method: 'VT', level: 'Level III'}, {method: 'AE', level: 'Level III'}], workStatus: 'Available', providerId: 'provider-12', level: 'Level III' },
    { id: 'user-client-05', name: 'Invited User', email: 'new.user@clientcorp.com', role: 'Client', company: 'Global Energy Corp.', status: 'Invited' },
    { id: 'user-client-06', name: 'New Client User', email: 'contact@chemc.com', role: 'Client', company: 'Chemical Plant C', status: 'Active' },
    { id: 'user-client-07', name: 'Power Admin', email: 'admin@powergen.com', role: 'Client', company: 'Power Generation LLC', status: 'Active' },
    { id: 'user-client-08', name: 'Factory Manager', email: 'fm@mansol.com', role: 'Client', company: 'Manufacturing Solutions Inc.', status: 'Active' },
    { id: 'user-client-09', name: 'Chuck Yeager', email: 'chuck@avpros.com', role: 'Client', company: 'Aviation Maintenance Pros', status: 'Active' },
];

export const subscriptions: Subscription[] = [
    { id: 'SUB-001', companyId: 'client-01', companyName: 'Global Energy Corp.', plan: 'Enterprise', status: 'Active', startDate: '2024-01-15', userCount: 25, dataUsageGB: 15.2 },
    { id: 'SUB-002', companyId: 'client-02', companyName: 'Marine Tankers Ltd.', plan: 'Client', status: 'Trialing', startDate: '2024-07-05', endDate: '2024-08-04', userCount: 5, dataUsageGB: 2.1 },
    { id: 'SUB-003', companyId: 'provider-01', companyName: 'MISTRAS Group', plan: 'Provider', status: 'Active', startDate: '2024-03-20', userCount: 50, dataUsageGB: 45.8 },
    { id: 'SUB-004', companyId: 'provider-02', companyName: 'Applus+', plan: 'Past Due', startDate: '2023-11-10', userCount: 38, dataUsageGB: 32.5 },
    { id: 'SUB-005', companyId: 'client-03', companyName: 'Energy Transfer', plan: 'Client', status: 'Canceled', startDate: '2024-02-01', endDate: '2024-05-01', userCount: 10, dataUsageGB: 8.7 },
    { id: 'SUB-006', companyId: 'provider-04', companyName: 'TÜV Rheinland', plan: 'Provider', status: 'Active', startDate: '2024-06-01', userCount: 150, dataUsageGB: 88.1 },
    { id: 'SUB-007', companyId: 'client-04', companyName: 'State DOT', plan: 'Client', status: 'Payment Failed', startDate: '2024-04-15', userCount: 8, dataUsageGB: 12.3 },
    { id: 'SUB-008', companyId: 'auditor-01', companyName: 'NDT Auditors LLC', plan: 'Enterprise', status: 'Active', startDate: '2024-01-01', userCount: 2, dataUsageGB: 1.5 },
    { id: 'SUB-009', companyId: 'client-05', companyName: 'Chemical Plant C', plan: 'Client', status: 'Active', startDate: '2024-07-10', userCount: 3, dataUsageGB: 0.5 },
    { id: 'SUB-010', companyId: 'provider-09', companyName: 'Blue Horizon Services', plan: 'Provider', status: 'Active', startDate: '2024-07-20', userCount: 12, dataUsageGB: 4.5 },
    { id: 'SUB-011', companyId: 'client-08', companyName: 'Manufacturing Solutions Inc.', plan: 'Trialing', startDate: '2024-07-15', endDate: '2024-08-14', userCount: 2, dataUsageGB: 0.8 },
    { id: 'SUB-012', companyId: 'client-09', companyName: 'Aviation Maintenance Pros', plan: 'Enterprise', status: 'Active', startDate: '2024-07-25', userCount: 1, dataUsageGB: 0.1 },
    { id: 'SUB-013', companyId: 'provider-11', companyName: 'SGS', plan: 'Provider', status: 'Active', startDate: '2024-07-26', userCount: 2, dataUsageGB: 0.3 },
    { id: 'SUB-014', companyId: 'provider-12', companyName: 'DNV (Det Norske Veritas)', plan: 'Enterprise', status: 'Active', startDate: '2024-06-10', userCount: 1, dataUsageGB: 2.5 },
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


export type UserAuditLog = {
  id: string;
  timestamp: string;
  actorName: string; 
  actorCompany: string;
  action: 'User Invited' | 'User Disabled' | 'User Enabled' | 'Admin Promotion' | 'Admin Demotion';
  targetUserName: string;
  targetCompany: string;
  details?: string;
};

export type JobAuditLog = {
  id: string;
  timestamp: string;
  jobId: string;
  jobTitle: string;
  actorName: string;
  actorRole: 'Client' | 'Provider' | 'Admin';
  action: 'Job Created' | 'Bid Placed' | 'Job Awarded' | 'Status Changed' | 'Resource Assigned' | 'Report Submitted';
  details: string; 
};

export type BillingAuditLog = {
  id: string;
  timestamp: string;
  companyName: string;
  action: 'Subscription Started' | 'Subscription Canceled' | 'Payment Succeeded' | 'Payment Failed' | 'Plan Changed';
  details: string;
};


export const userAuditLog: UserAuditLog[] = [
  { id: 'ACT-001', timestamp: '2024-07-28T10:00:00Z', actorName: 'Admin User', actorCompany: 'NDT Exchange', action: 'Admin Promotion', targetUserName: 'Ben Carter', targetCompany: 'MISTRAS Group', details: 'Promoted to Company Admin, replacing old admin.' },
  { id: 'ACT-002', timestamp: '2024-07-27T15:30:00Z', actorName: 'Admin User', actorCompany: 'NDT Exchange', action: 'User Disabled', targetUserName: 'Steven Shaw', targetCompany: 'TEAM, Inc.', details: '' },
  { id: 'ACT-003', timestamp: '2024-07-26T11:00:00Z', actorName: 'Admin User', actorCompany: 'NDT Exchange', action: 'User Invited', targetUserName: 'New User', targetCompany: 'Global Energy Corp.', details: 'Invited as Client.' },
  { id: 'ACT-004', timestamp: '2024-07-25T09:20:00Z', actorName: 'John Doe', actorCompany: 'Global Energy Corp.', action: 'User Invited', targetUserName: 'New Finance Person', targetCompany: 'Global Energy Corp.', details: 'Invited as Client.' },
  { id: 'ACT-005', timestamp: '2024-07-29T14:00:00Z', actorName: 'Admin User', actorCompany: 'NDT Exchange', action: 'User Enabled', targetUserName: 'Steven Shaw', targetCompany: 'TEAM, Inc.', details: 'Re-enabled user upon request.' },
  { id: 'ACT-006', timestamp: '2024-07-30T10:00:00Z', actorName: 'Admin User', actorCompany: 'NDT Exchange', action: 'User Invited', targetUserName: 'Sophia Rodriguez', targetCompany: 'Applus+', details: 'Invited as Inspector (Level II).' },
  { id: 'ACT-007', timestamp: '2024-07-25T10:00:00Z', actorName: 'Admin User', actorCompany: 'NDT Exchange', action: 'User Invited', targetUserName: 'Chuck Yeager', targetCompany: 'Aviation Maintenance Pros', details: 'Invited as Client.' },
  { id: 'ACT-008', timestamp: '2024-07-30T14:00:00Z', actorName: 'Admin User', actorCompany: 'NDT Exchange', action: 'User Invited', targetUserName: 'Kevin White', targetCompany: 'Energy Transfer', details: 'Invited as Client.' },
];

export const jobAuditLog: JobAuditLog[] = [
    { id: 'JLOG-001', timestamp: '2024-06-28T10:00:00Z', jobId: 'JOB-001', jobTitle: 'PAUT on Pressure Vessel Welds', actorName: 'John Doe', actorRole: 'Client', action: 'Job Created', details: 'Job posted to marketplace.' },
    { id: 'JLOG-002', timestamp: '2024-06-29T11:30:00Z', jobId: 'JOB-001', jobTitle: 'PAUT on Pressure Vessel Welds', actorName: 'Ben Carter', actorRole: 'Provider', action: 'Bid Placed', details: 'Bid for $12,500 submitted by MISTRAS Group.' },
    { id: 'JLOG-003', timestamp: '2024-06-19T15:00:00Z', jobId: 'JOB-002', jobTitle: 'MT Inspection on Crane Hooks', actorName: 'John Doe', actorRole: 'Client', action: 'Job Awarded', details: 'Awarded to TEAM, Inc. for $4,800.' },
    { id: 'JLOG-004', timestamp: '2024-06-22T09:00:00Z', jobId: 'JOB-002', jobTitle: 'MT Inspection on Crane Hooks', actorName: 'Carlos Ray', actorRole: 'Provider', action: 'Report Submitted', details: 'Inspection report uploaded.' },
    { id: 'JLOG-005', timestamp: '2024-06-22T09:00:00Z', jobId: 'JOB-002', jobTitle: 'MT Inspection on Crane Hooks', actorName: 'System', actorRole: 'Admin', action: 'Status Changed', details: 'Status changed to Report Submitted.' },
    { id: 'JLOG-006', timestamp: '2024-07-26T10:00:00Z', jobId: 'JOB-017', jobTitle: 'Shutdown Support - PT/MT', actorName: 'John Doe', actorRole: 'Client', action: 'Job Awarded', details: 'Directly awarded to TEAM, Inc. for $19,500.' },
    { id: 'JLOG-007', timestamp: '2024-07-28T09:00:00Z', jobId: 'JOB-017', jobTitle: 'Shutdown Support - PT/MT', actorName: 'Maria Garcia', actorRole: 'Provider', action: 'Resource Assigned', details: 'Assigned Technicians: Maria Garcia, James Wilson' },
    { id: 'JLOG-008', timestamp: '2024-06-20T11:00:00Z', jobId: 'JOB-020', jobTitle: 'Marine Riser Inspection', actorName: 'John Doe', actorRole: 'Client', action: 'Job Awarded', details: 'Awarded to DNV (Det Norske Veritas) for $32,000.' },
];

export const billingAuditLog: BillingAuditLog[] = [
    { id: 'BLOG-001', timestamp: '2024-07-10T00:00:00Z', companyName: 'Chemical Plant C', action: 'Subscription Started', details: 'Started on Client plan.' },
    { id: 'BLOG-002', timestamp: '2024-07-01T00:00:00Z', companyName: 'Applus+', action: 'Payment Failed', details: 'Monthly payment of $299 failed.' },
    { id: 'BLOG-003', timestamp: '2024-07-01T00:00:00Z', companyName: 'MISTRAS Group', action: 'Payment Succeeded', details: 'Monthly payment of $299 succeeded.' },
    { id: 'BLOG-004', timestamp: '2024-05-01T00:00:00Z', companyName: 'Energy Transfer', action: 'Subscription Canceled', details: 'Client plan was canceled.' },
    { id: 'BLOG-005', timestamp: '2024-07-20T00:00:00Z', companyName: 'Blue Horizon Services', action: 'Subscription Started', details: 'Started on Provider plan.' },
    { id: 'BLOG-006', timestamp: '2024-07-21T10:00:00Z', companyName: 'Applus+', action: 'Payment Succeeded', details: 'Manual payment of $299 for past due invoice.' },
    { id: 'BLOG-007', timestamp: '2024-07-25T00:00:00Z', companyName: 'Aviation Maintenance Pros', action: 'Subscription Started', details: 'Started on Enterprise plan.' },
];


// Rename 'assets' to 'clientAssets' for clarity
export { clientAssets as assets };
    

  
