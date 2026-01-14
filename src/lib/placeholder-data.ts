export type Asset = {
    id: string;
    name: string;
    type: 'Tank' | 'Piping' | 'Vessel' | 'Crane' | 'Weld Joint';
    location: string;
    status: 'Operational' | 'Requires Inspection' | 'Under Repair' | 'Decommissioned';
    nextInspection: string;
};

export type Job = {
    id: string;
    title: string;
    client: string;
    location: string;
    technique: 'UT' | 'RT' | 'MT' | 'PT' | 'VT' | 'PAUT' | 'TOFD';
    status: 'Open' | 'In Progress' | 'Completed' | 'Awarded';
    postedDate: string;
    technicianIds?: string[];
    equipmentIds?: string[];
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
    certifications: ('UT' | 'MT' | 'PT' | 'RT' | 'VT' | 'PAUT' | 'TOFD')[];
    status: 'Available' | 'On Assignment';
    avatar: string;
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
    { id: 'TECH-02', name: 'Aisha Khan', level: 'Level II', certifications: ['RT', 'VT'], status: 'On Assignment', avatar: 'tech-aisha' },
    { id: 'TECH-03', name: 'Ben Carter', level: 'Level III', certifications: ['UT', 'PAUT', 'TOFD'], status: 'Available', avatar: 'tech-ben' },
];


export const jobs: Job[] = [
    { id: 'JOB-001', title: 'PAUT on Pressure Vessel Welds', client: 'PetroChem Inc.', location: 'Houston, TX', technique: 'PAUT', status: 'Open', postedDate: '2024-06-28' },
    { id: 'JOB-002', title: 'MT Inspection on Crane Hooks', client: 'Logistics Corp', location: 'Long Beach, CA', technique: 'MT', status: 'In Progress', postedDate: '2024-06-25', technicianIds: ['TECH-02'], equipmentIds: ['YOKE-02'] },
    { id: 'JOB-003', title: 'Annual UT Thickness Survey', client: 'Marine Tankers Ltd.', location: 'New Orleans, LA', technique: 'UT', status: 'Completed', postedDate: '2024-05-15' },
    { id: 'JOB-004', title: 'Pipeline Weld Inspections', client: 'Energy Transfer', location: 'Midland, TX', technique: 'PAUT', status: 'In Progress', postedDate: '2024-07-01', technicianIds: ['TECH-01', 'TECH-03'], equipmentIds: ['UTM-1000', 'PA-Probe-5MHz'] },
];

export const inspections: Inspection[] = [
    { id: 'INSP-001', assetName: 'Storage Tank T-101', assetId: 'ASSET-001', technique: 'UT', inspector: 'Jane Smith', date: '2024-06-15', status: 'Completed' },
    { id: 'INSP-002', assetName: 'Main Steam Piping', assetId: 'ASSET-002', technique: 'VT', inspector: 'Pending', date: '2024-07-20', status: 'Scheduled' },
    { id: 'INSP-003', assetName: 'Overhead Crane C-01', assetId: 'ASSET-004', technique: 'MT', inspector: 'Mike Johnson', date: '2024-06-22', status: 'Requires Review' },
];


// Rename 'assets' to 'clientAssets' for clarity
export { clientAssets as assets };
