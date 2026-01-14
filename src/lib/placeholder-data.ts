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

export const assets: Asset[] = [
    { id: 'ASSET-001', name: 'Storage Tank T-101', type: 'Tank', location: 'Refinery A', status: 'Operational', nextInspection: '2024-09-15' },
    { id: 'ASSET-006', name: 'Cooling Tower Piping', type: 'Piping', location: 'Refinery A', status: 'Operational', nextInspection: '2025-02-20' },
    { id: 'ASSET-002', name: 'Main Steam Piping', type: 'Piping', location: 'Power Plant B', status: 'Requires Inspection', nextInspection: '2024-07-20' },
    { id: 'ASSET-003', name: 'Pressure Vessel PV-203', type: 'Vessel', location: 'Chemical Plant C', status: 'Operational', nextInspection: '2025-01-10' },
    { id: 'ASSET-004', name: 'Overhead Crane C-01', type: 'Crane', location: 'Warehouse D', status: 'Under Repair', nextInspection: '2024-08-01' },
    { id: 'ASSET-005', name: 'Structural Weld SW-05', type: 'Weld Joint', location: 'Bridge E', status: 'Operational', nextInspection: '2024-11-22' },
];

export const jobs: Job[] = [
    { id: 'JOB-001', title: 'PAUT on Pressure Vessel Welds', client: 'PetroChem Inc.', location: 'Houston, TX', technique: 'PAUT', status: 'Open', postedDate: '2024-06-28' },
    { id: 'JOB-002', title: 'MT Inspection on Crane Hooks', client: 'Logistics Corp', location: 'Long Beach, CA', technique: 'In Progress', status: 'In Progress', postedDate: '2024-06-25' },
    { id: 'JOB-003', title: 'Annual UT Thickness Survey', client: 'Marine Tankers Ltd.', location: 'New Orleans, LA', technique: 'UT', status: 'Completed', postedDate: '2024-05-15' },
];

export const inspections: Inspection[] = [
    { id: 'INSP-001', assetName: 'Storage Tank T-101', assetId: 'ASSET-001', technique: 'UT', inspector: 'Jane Smith', date: '2024-06-15', status: 'Completed' },
    { id: 'INSP-002', assetName: 'Main Steam Piping', assetId: 'ASSET-002', technique: 'VT', inspector: 'Pending', date: '2024-07-20', status: 'Scheduled' },
    { id: 'INSP-003', assetName: 'Overhead Crane C-01', assetId: 'ASSET-004', technique: 'MT', inspector: 'Mike Johnson', date: '2024-06-22', status: 'Requires Review' },
];
