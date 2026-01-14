

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

export type Job = {
    id: string;
    title: string;
    client: string;
    location: string;
    technique: 'UT' | 'RT' | 'MT' | 'PT' | 'VT' | 'PAUT' | 'TOFD' | 'ET' | 'AE' | 'LT' | 'IR' | 'APR';
    status: 'Draft' | 'Posted' | 'Assigned' | 'Scheduled' | 'In Progress' | 'Report Submitted' | 'Under Audit' | 'Audit Approved' | 'Client Review' | 'Client Approved' | 'Completed' | 'Paid';
    postedDate: string;
    bidExpiryDate?: string;
    scheduledDate?: string;
    technicianIds?: string[];
    equipmentIds?: string[];
    assetIds?: string[];
    workflow?: 'standard' | 'level3' | 'auto';
    documents?: JobDocument[];
};

export type Inspection = {
    id: string;
    assetName: string;
    assetId: string;
    technique: 'UT' | 'RT' | 'MT' | 'PT' | 'VT';
    inspector: string;
    date: string;
    status: 'Scheduled' | 'Completed' | 'Requires Review';
};

export type InspectorAsset = {
    id: string;
    name: string;
    type: 'UT Equipment' | 'PAUT Probe' | 'Calibration Block' | 'Yoke';
    status: 'Calibrated' | 'Calibration Due' | 'In Service';
    nextCalibration: string;
};

export type Technician = {
    id: string;
    name: string;
    level: 'Level I' | 'Level II' | 'Level III';
    certifications: ('UT' | 'MT' | 'PT' | 'RT' | 'VT' | 'PAUT' | 'TOFD' | 'ET' | 'AE' | 'LT' | 'IR')[];
    status: 'Available' | 'On Assignment';
    avatar: string;
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


export const clientAssets: Asset[] = [
    { id: 'ASSET-001', name: 'Storage Tank T-101', type: 'Tank', location: 'Refinery A', status: 'Operational', nextInspection: '2024-09-15' },
    { id: 'ASSET-006', name: 'Cooling Tower Piping', type: 'Piping', location: 'Refinery A', status: 'Operational', nextInspection: '2025-02-20' },
    { id: 'ASSET-002', name: 'Main Steam Piping', type: 'Piping', location: 'Power Plant B', status: 'Requires Inspection', nextInspection: '2024-07-20' },
    { id: 'ASSET-003', name: 'Pressure Vessel PV-203', type: 'Vessel', location: 'Chemical Plant C', status: 'Operational', nextInspection: '2025-01-10' },
    { id: 'ASSET-004', name: 'Overhead Crane C-01', type: 'Crane', location: 'Warehouse D', status: 'Under Repair', nextInspection: '2024-08-01' },
    { id: 'ASSET-005', name: 'Structural Weld SW-05', type: 'Weld Joint', location: 'Bridge E', status: 'Operational', nextInspection: '2024-11-22' },
];

export const inspectorAssets: InspectorAsset[] = [
    { id: 'UTM-1000', name: 'Olympus 45MG', type: 'UT Equipment', status: 'Calibrated', nextCalibration: '2025-01-05' },
    { id: 'PA-Probe-5MHz', name: '5L64-A2 Probe', type: 'PAUT Probe', status: 'In Service', nextCalibration: '2024-12-11' },
    { id: 'CAL-BLK-01', name: 'IIW Type 1 Block', type: 'Calibration Block', status: 'In Service', nextCalibration: 'N/A' },
    { id: 'YOKE-02', name: 'Parker B-300S', type: 'Yoke', status: 'Calibration Due', nextCalibration: '2024-07-30' },
];

export const technicians: Technician[] = [
    { id: 'TECH-01', name: 'Carlos Ray', level: 'Level II', certifications: ['UT', 'MT', 'PT'], status: 'Available', avatar: 'tech-carlos' },
    { id: 'TECH-02', name: 'Aisha Khan', level: 'Level II', certifications: ['RT', 'VT', 'ET'], status: 'On Assignment', avatar: 'tech-aisha' },
    { id: 'TECH-03', name: 'Ben Carter', level: 'Level III', certifications: ['UT', 'PAUT', 'TOFD', 'AE'], status: 'Available', avatar: 'tech-ben' },
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
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
        ]
    },
    { id: 'JOB-002', title: 'MT Inspection on Crane Hooks', client: 'Global Energy Corp.', location: 'Long Beach, CA', technique: 'MT', status: 'Scheduled', postedDate: '2024-06-25', scheduledDate: tomorrow.toISOString().split('T')[0], technicianIds: ['TECH-01'], equipmentIds: ['YOKE-02'], assetIds: ['ASSET-004'], workflow: 'standard' },
    { id: 'JOB-003', title: 'Annual UT Thickness Survey', client: 'Marine Tankers Ltd.', location: 'New Orleans, LA', technique: 'UT', status: 'Completed', postedDate: '2024-05-15', scheduledDate: '2024-06-10', technicianIds: ['TECH-01'], equipmentIds: ['UTM-1000'], assetIds: ['ASSET-001'], workflow: 'standard' },
    { id: 'JOB-004', title: 'Pipeline Weld Inspections', client: 'Energy Transfer', location: 'Midland, TX', technique: 'PAUT', status: 'In Progress', postedDate: '2024-07-01', scheduledDate: dayAfterTomorrow.toISOString().split('T')[0], technicianIds: ['TECH-01', 'TECH-03'], equipmentIds: ['UTM-1000', 'PA-Probe-5MHz'], assetIds: ['ASSET-002'], workflow: 'level3' },
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
    { id: 'JOB-006', title: 'RT on Boiler Tubes', client: 'Power Generation LLC', location: 'Houston, TX', technique: 'RT', status: 'Posted', postedDate: '2024-07-03', bidExpiryDate: nextWeek.toISOString().split('T')[0] },
    { id: 'JOB-007', title: 'Eddy Current on Heat Exchanger Tubes', client: 'Chemical Plant C', location: 'Baton Rouge, LA', technique: 'ET', status: 'Scheduled', postedDate: '2024-07-05', scheduledDate: yesterday.toISOString().split('T')[0], assetIds: ['ASSET-003'], technicianIds: ['TECH-02'], workflow: 'standard' },
    { id: 'JOB-008', title: 'Emergency Repair Verification', client: 'Global Energy Corp.', location: 'Long Beach, CA', technique: 'UT', status: 'Scheduled', postedDate: '2024-07-10', scheduledDate: tomorrow.toISOString().split('T')[0], technicianIds: ['TECH-03'], equipmentIds: ['UTM-1000'], assetIds: ['ASSET-004'], workflow: 'standard' },
];

export const bids: Bid[] = [
    { id: 'BID-001', jobId: 'JOB-001', providerId: 'inspector-provider', amount: 12500, status: 'Submitted', submittedDate: '2024-06-29' },
    { id: 'BID-002', jobId: 'JOB-002', providerId: 'inspector-provider', amount: 4800, status: 'Awarded', submittedDate: '2024-06-26' },
    { id: 'BID-003', jobId: 'JOB-005', providerId: 'inspector-provider', amount: 8200, status: 'Submitted', submittedDate: '2024-07-03' },
    { id: 'BID-004', jobId: 'JOB-006', providerId: 'inspector-provider', amount: 22000, status: 'Rejected', submittedDate: '2024-07-04' },
    { id: 'BID-005', jobId: 'JOB-007', providerId: 'inspector-provider', amount: 15000, status: 'Withdrawn', submittedDate: '2024-07-06' },
];


export const inspections: Inspection[] = [
    { id: 'INSP-001', assetName: 'Storage Tank T-101', assetId: 'ASSET-001', technique: 'UT', inspector: 'Jane Smith', date: '2024-06-15', status: 'Completed' },
    { id: 'INSP-002', assetName: 'Main Steam Piping', assetId: 'ASSET-002', technique: 'VT', inspector: 'Pending', date: '2024-07-20', status: 'Scheduled' },
    { id: 'INSP-003', assetName: 'Overhead Crane C-01', assetId: 'ASSET-004', technique: 'MT', inspector: 'Mike Johnson', date: '2024-06-22', status: 'Requires Review' },
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


// Rename 'assets' to 'clientAssets' for clarity
export { clientAssets as assets };

    
