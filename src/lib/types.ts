

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
    thumbnailUrl?: string;
    history?: AssetUpdate[];
};

export type JobDocument = {
    name: string;
    url: string;
};

export type InspectionReport = {
    id: string;
    submittedOn: string;
    submittedBy: string;
    reportData: any; // This will hold the structured form data.
    documents: JobDocument[]; // Re-using JobDocument for supplementary files.
};

export type JobUpdate = {
    user: string;
    timestamp: string;
    action: string;
    details?: string;
    documentName?: string;
    statusChange?: Job['status'];
};

export type Job = {
    id: string;
    title: string;
    client: string;
    providerId?: string; // The service provider company awarded the job
    location: string;
    technique: string;
    status: 'Draft' | 'Posted' | 'Assigned' | 'Scheduled' | 'In Progress' | 'Report Submitted' | 'Under Audit' | 'Audit Approved' | 'Client Review' | 'Client Approved' | 'Completed' | 'Paid' | 'Revisions Requested';
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
    bids: Bid[];
    inspections: Inspection[];
    isInternal?: boolean;
};

export type Inspection = {
    id: string;
    jobId: string;
    assetName: string;
    assetId: string;
    technique: string;
    inspector: string;
    date: string;
    status: 'Scheduled' | 'Completed' | 'Requires Review';
    report?: InspectionReport;
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
    thumbnailUrl?: string;
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
    logoUrl?: string;
    brandColor?: string;
};

export type Review = {
  id: string;
  jobId: string;
  providerId: string;
  clientId: string;
  rating: number;
  comment: string;
  date: any;
  status: 'Pending' | 'Approved' | 'Rejected';
};

export type PlatformUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    companyId: string;
    company: string;
    status: 'Active' | 'Invited' | 'Disabled';
    password?: string; // For dev login purposes
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
  plan: string;
  status: 'Active' | 'Trialing' | 'Past Due' | 'Canceled' | 'Payment Failed';
  startDate: string;
  endDate?: string;
  userCount: number;
  dataUsageGB: number;
  userLimit: number;
  dataLimitGB: number;
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

export type ChatMessage = {
    id: string;
    text: string;
    senderId: string;
    timestamp: string;
};

export type JobChat = {
    id: string;
    jobId: string;
    participants: string[];
    lastMessage: string;
    lastMessageTimestamp: string;
    messages: ChatMessage[];
};

export type Notification = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  href: string;
};

export type UserAuditLog = {
  id: string;
  timestamp: any;
  actorName: string; 
  actorCompany: string;
  action: 'User Invited' | 'User Disabled' | 'User Enabled' | 'Admin Promotion' | 'Admin Demotion';
  targetUserName: string;
  targetCompany: string;
  details?: string;
};

export type JobAuditLog = {
  id: string;
  timestamp: any;
  jobId: string;
  jobTitle: string;
  actorName: string;
  actorRole: 'Client' | 'Provider' | 'Admin';
  action: 'Job Created' | 'Bid Placed' | 'Job Awarded' | 'Status Changed' | 'Resource Assigned' | 'Report Submitted';
  details: string; 
};

export type BillingAuditLog = {
  id: string;
  timestamp: any;
  companyName: string;
  action: 'Subscription Started' | 'Subscription Canceled' | 'Payment Succeeded' | 'Payment Failed' | 'Plan Changed';
  details: string;
};

export type NDTServiceProvider = {
    id: string;
    name: string;
    logoUrl?: string;
    brandColor?: string;
    location: string;
    rating: number;
    techniques: string[];
    industries: string[];
    description: string;
    contactPerson: string;
    contactEmail: string;
};

export type AuditFirm = {
    id: string;
    name: string;
    logoUrl?: string;
    location: string;
    services: string[];
    industries: string[];
    description: string;
    contactPerson: string;
    contactEmail: string;
};

export type NDTTechniqueData = {
  id: string,
  name: string
};
