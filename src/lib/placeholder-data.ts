


import type { Asset, Job, InspectorAsset, PlatformUser, Client, Review, Subscription, Payment, JobPayment, JobChat, Notification, UserAuditLog, JobAuditLog, BillingAuditLog, NDTServiceProvider, AuditFirm } from '@/lib/types';
import { clientAssets, clientData, jobs, inspectorAssets, allUsers, userAuditLog, jobAuditLog, billingAuditLog, reviews, subscriptions, payments, jobPayments, jobChats, notifications, serviceProviders, auditFirms, auditFirmServices, auditFirmIndustries } from './seed-data';

// This file is now deprecated and exists for reference during transition.
// All data is now sourced from 'seed-data.ts' and seeded into Firestore.
// Components should be updated to fetch data from Firestore directly.

export { 
    clientAssets, 
    jobs, 
    inspectorAssets, 
    allUsers,
    userAuditLog,
    jobAuditLog,
    billingAuditLog,
    reviews,
    subscriptions,
    clientData,
    payments,
    jobPayments,
    jobChats,
    notifications,
    serviceProviders,
    auditFirms,
    auditFirmServices,
    auditFirmIndustries
};

export const NDTTechniques: { id: string; name: string }[] = [
  { id: "UT", name: "Ultrasonic Testing" },
  { id: "PAUT", name: "Phased Array Ultrasonic Testing" },
  { id: "TOFD", name: "Time-of-Flight Diffraction" },
  { id: "RT", name: "Radiographic Testing" },
  { id: "CR", name: "Computed Radiography" },
  { id: "DR", name: "Digital Radiography" },
  { id: "MT", name: "Magnetic Particle Testing" },
  { id: "PT", name: "Penetrant Testing" },
  { id: "VT", name: "Visual Testing" },
  { id: "RVI", name: "Remote Visual Inspection" },
  { id: "ET", name: "Eddy Current Testing" },
  { id: "AE", name: "Acoustic Emission" },
  { id: "GWT", name: "Guided Wave Testing" },
  { id: "LT", name: "Leak Testing" },
  { id: "IR", name: "Infrared Thermography" },
  { id: "MFL", name: "Magnetic Flux Leakage" },
  { id: "APR", name: "Acoustic Pulse Reflectometry" },
  { id: "ACFM", name: "Alternating Current Field Measurement" }
];

export * from './types';
