

import { CheckCircle2, Circle, HelpCircle, XCircle, ArrowDown, ArrowRight, ArrowUp, Repeat, Square } from 'lucide-react';


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
    isMovable?: boolean;
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
    designIds?: string[];
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
    providerCompanyId?: string;
    auditorCompanyId?: string;
    auditorUserId?: string;
    location: string;
    techniques: string[];
    status: 'Draft' | 'Posted' | 'Assigned' | 'Scheduled' | 'In Progress' | 'Report Submitted' | 'Under Audit' | 'Audit Approved' | 'Client Review' | 'Client Approved' | 'Completed' | 'Paid' | 'Revisions Requested';
    postedDate: string;
    bidExpiryDate?: string;
    scheduledStartDate?: string;
    scheduledEndDate?: string;
    technicianIds?: string[];
    assignedTechnicians?: {
      id: string;
      name: string;
      level?: string;
    }[];
    equipmentIds?: string[];
    assetIds?: string[];
    workflow: 'standard' | 'level3' | 'auto';
    documents?: JobDocument[];
    history?: JobUpdate[];
    isInternal?: boolean;
    internalNotes?: string;
    jobType?: 'shutdown' | 'project' | 'callout';
    industry?: string;
    durationDays?: number;
    estimatedBudget?: string;
    certificationsRequired?: string[];
    description?: string;
    clientCompanyId?: string;
    providerId?: string;
    userId?: string; // The user ID of the creator of the job
    temaDesignIds?: string[];
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

export type Equipment = {
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

export type InspectorAsset = Equipment;

export type Award = {
    name: string;
    year: number;
    imageUrl?: string;
};

export type Specification = {
  name: string;
  value: string;
};

export type ProductCertification = {
  name: string;
  authority?: string;
  logoUrl?: string;
};

export type Product = {
    id: string;
    name: string;
    manufacturerId: string;
    manufacturerName: string;
    type: EquipmentType;
    techniques: string[];
    description?: string;
    imageUrls?: string[];
    isAwardWinning?: boolean;
    awards?: Award[];
    specifications?: Specification[];
    certifications?: ProductCertification[];
    createdAt?: any;
    createdBy?: string;
    modifiedAt?: any;
    modifiedBy?: string;
};

export type ReviewReply = {
    text: string;
    authorName: string;
    timestamp: any;
};

export type Review = {
  id: string;
  jobId?: string;
  productId?: string;
  productName?: string;
  providerId?: string;
  clientId?: string;
  userEmail?: string;
  userName?: string;
  rating: number;
  comment: string;
  date: any;
  status: 'Pending' | 'Approved' | 'Rejected';
  reply?: ReviewReply;
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

export type Notification = {
    id: string;
    userId: string;
    type?: string;
    title: string;
    href?: string;
    message?: string;
    description?: string;
    read?: boolean;
    timestamp?: string;
    createdAt?: any;
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
  userLimit: number | 'Unlimited';
  dataLimitGB: number | 'Unlimited';
  assetLimit: number | 'Unlimited';
  equipmentLimit: number | 'Unlimited';
  biddingLimit: number | 'Unlimited';
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
  contactEmail: string;
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

export type Task = {
  id: string;
  title: string;
  label: string;
  status: 'todo' | 'in progress' | 'done' | 'canceled';
  priority: 'low' | 'medium' | 'high';
  type: 'One-Time' | 'Recurring';
  userId: string;
  createdAt?: any;
};

export type Plan = {
    id: string;
    name: string;
    audience: 'Client' | 'Provider' | 'Auditor';
    price: {
        // Price in USD cents to avoid floating point issues
        monthlyUSD: number;
        yearlyUSD: number;
    };
    priceDescription?: string;
    description: string;
    userLimit: number | 'Unlimited';
    dataLimitGB: number | 'Unlimited';
    assetLimit: 'Unlimited' | number;
    biddingLimit: 'Unlimited' | number;
    equipmentLimit: 'Unlimited' | number;
    marketplaceAccess: boolean;
    reportingLevel: 'Basic' | 'Advanced';
    apiAccess: boolean;
    customBranding: boolean;
    isPublic: boolean;
    isActive: boolean;
    isFeatured?: boolean;
    isPopular?: boolean;
    trialPeriodDays?: number;
    userCredits?: number;
    dataCreditsGB?: number;
    overagePricePerUserUSD?: number;
    overagePricePer10GBUSD?: number;
    features: string[];
};

export type Bid = {
  id: string;
  jobId: string;
  jobTitle: string;
  inspectorId: string;
  providerCompanyId: string;
  clientCompanyId: string;
  userId: string; // The client user ID who owns the job
  client: string; // The client company name
  location: string;
  amount: number;
  status: 'Submitted' | 'Shortlisted' | 'Awarded' | 'Rejected' | 'Withdrawn' | 'Not Selected';
  submittedDate: any;
  jobDate?: string;
  comments?: string;
  mobilizationDate?: string;
  certifications?: string[];
  proposedTechnique?: string;
  proposalJustification?: string;
};


// The 'Certification' type was missing
export type Certification = {
  method: string;
  level: 'Level I' | 'Level II' | 'Level III';
  certificateNumber?: string;
  validUntil?: string;
};

export type NDTEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  region: 'North America' | 'Europe' | 'Asia' | 'South America' | 'Africa' | 'Oceania';
  imageId: string;
  imageHint: string;
  url: string;
};

// Types from TEMA lib
export type TEMAConfig = {
  tubeOdIn: number;
  pitchRatio: number;
  pattern: 'triangular' | 'rotated-triangular' | 'square' | 'rotated-square';
  numPasses: number;
  shape: any; // Simplified for now
};

export type LayoutTube = {
  id: number;
  x: number;
  y: number;
  r: number;
  row: number;
  col: number;
  pass: number;
  status?: 'ok' | 'plugged' | 'damaged' | string;
};

export type TemaDesign = {
    id: string;
    userId: string;
    name: string;
    description?: string;
    config: TEMAConfig;
    tubes: LayoutTube[];
    createdAt: any;
    modifiedAt: any;
    jobId?: string;
};

export type TankDesign = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  config: {
    diameter: number;
    shellCourses: number;
    floorPlates: number;
  };
  floorScans?: {
    plate: number;
    x: number;
    y: number;
    thickness: number;
  }[];
  shellReadings?: {
    course: number;
    readings: number[];
  }[];
  annularReadings?: {
    position: string;
    thickness: number;
  }[];
  createdAt: any;
  modifiedAt: any;
};
