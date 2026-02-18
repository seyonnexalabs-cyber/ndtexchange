

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
    createdAt?: any;
    createdBy?: string;
    modifiedAt?: any;
    modifiedBy?: string;
};

export type JobDocument = {
    name: string;
    url: string;
    createdAt?: any;
    createdBy?: string;
};

export type InspectionReport = {
    id: string;
    submittedOn: string;
    submittedBy: string;
    reportData: any; 
    documents: JobDocument[];
    createdAt?: any;
    createdBy?: string;
    modifiedAt?: any;
    modifiedBy?: string;
};

export type JobUpdate = {
    user: string;
    timestamp: any;
    action: string;
    details?: string;
    documentName?: string;
    statusChange?: Job['status'];
};

export type Job = {
    id: string;
    title: string;
    client: string;
    providerId?: string;
    location: string;
    techniques: string[];
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
    jobType?: 'shutdown' | 'project' | 'callout';
    industry?: string;
    durationDays?: number;
    estimatedBudget?: string;
    certificationsRequired?: string;
    clientCompanyId?: string;
    createdAt?: any;
    createdBy?: string;
    modifiedAt?: any;
    modifiedBy?: string;
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
    createdAt?: any;
    createdBy?: string;
    modifiedAt?: any;
    modifiedBy?: string;
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
    createdAt?: any;
    createdBy?: string;
    modifiedAt?: any;
    modifiedBy?: string;
};

export type Certification = {
  method: string;
  level: 'Level I' | 'Level II' | 'Level III';
};

export type Bid = {
    id: string;
    jobId: string;
    inspectorId: string;
    providerId: string;
    providerName: string;
    amount: number;
    status: 'Submitted' | 'Awarded' | 'Rejected' | 'Withdrawn' | 'Shortlisted' | 'Not Selected';
    submittedDate: string;
    comments?: string;
    proposedTechnique?: string;
    proposalJustification?: string;
    createdAt?: any;
    createdBy?: string;
    modifiedAt?: any;
    modifiedBy?: string;
};

export type Customer = {
    id: string;
    name: string;
    type: 'Customer';
    contactPerson: string;
    contactEmail: string;
    activeJobs: number;
    totalSpend: number;
    logoUrl?: string;
    brandColor?: string;
    country?: string;
    currency?: string;
    createdAt?: any;
    createdBy?: string;
    modifiedAt?: any;
    modifiedBy?: string;
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
  createdAt?: any;
  createdBy?: string;
  modifiedAt?: any;
  modifiedBy?: string;
};

export type PlatformUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    companyId: string;
    company: string;
    status: 'Active' | 'Invited' | 'Disabled';
    password?: string;
    certifications?: Certification[];
    workStatus?: 'Available' | 'On Assignment';
    providerId?: string;
    level?: 'Level I' | 'Level II' | 'Level III';
    notificationSettings?: {
        [key: string]: boolean;
    };
    createdAt?: any;
    createdBy?: string;
    modifiedAt?: any;
    modifiedBy?: string;
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
  createdAt?: any;
  createdBy?: string;
  modifiedAt?: any;
  modifiedBy?: string;
};

export type Payment = {
  id: string;
  subscriptionId: string;
  companyName: string;
  amount: number;
  date: string;
  status: 'Succeeded' | 'Failed';
  createdAt?: any;
  createdBy?: string;
  modifiedAt?: any;
  modifiedBy?: string;
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
    createdAt?: any;
    createdBy?: string;
    modifiedAt?: any;
    modifiedBy?: string;
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
    createdAt?: any;
    createdBy?: string;
    modifiedAt?: any;
    modifiedBy?: string;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  href: string;
  createdAt?: any;
  createdBy?: string;
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
  actorRole: 'Customer' | 'Provider' | 'Admin';
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

export type Client = {
    id: string;
    type: 'Client';
    name: string;
    contactPerson: string;
    contactEmail: string;
    activeJobs: number;
    totalSpend: number;
    logoUrl?: string;
    brandColor?: string;
    country?: string;
    currency?: string;
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
    type: 'Provider';
    country?: string;
    currency?: string;
    createdAt?: any;
    createdBy?: string;
    modifiedAt?: any;
    modifiedBy?: string;
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
    type: 'Auditor';
    country?: string;
    currency?: string;
    createdAt?: any;
    createdBy?: string;
    modifiedAt?: any;
    modifiedBy?: string;
};

export type Manufacturer = {
  id: string;
  name: string;
  url:string;
  description?: string;
  logoUrl?: string;
  techniqueIds: string[];
  createdAt?: any;
  createdBy?: string;
  modifiedAt?: any;
  modifiedBy?: string;
};

export type NDTTechnique = {
    id: string;
    acronym: string;
    title: string;
    description: string;
    isHighlighted: boolean;
    imageId: string;
    createdAt?: any;
    createdBy?: string;
    modifiedAt?: any;
    modifiedBy?: string;
};
