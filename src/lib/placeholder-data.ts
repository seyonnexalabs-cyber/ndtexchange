
// This file is deprecated. All dynamic data should be fetched from Firestore.
// The data is initially seeded from 'seed-data.ts'.
// Types are now centralized in 'types.ts'.
export * from './types';

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
