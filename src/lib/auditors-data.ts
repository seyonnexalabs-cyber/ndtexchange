export type AuditFirm = {
    id: string;
    name: string;
    logoUrl?: string;
    location: string;
    rating: number;
    specialties: string[];
    description: string;
}

export const NDTSpecialties = [
    'Compliance Audits', 'Level III Services', 'Procedure Development', 'Welding Inspection', 'Aerospace & Defense', 'Oil & Gas', 'Power Generation', 'Manufacturing'
];

export const auditFirms: AuditFirm[] = [
    {
        id: 'auditor-firm-01',
        name: 'NDT Auditors LLC',
        location: 'Washington, D.C., USA',
        rating: 4.9,
        specialties: ['Compliance Audits', 'Level III Services', 'Oil & Gas', 'Power Generation'],
        description: 'A specialized firm providing independent third-party auditing and Level III consulting services to ensure regulatory compliance and quality assurance.'
    },
    {
        id: 'auditor-firm-02',
        name: 'Aero-Compliance Partners',
        location: 'Seattle, WA, USA',
        rating: 4.8,
        specialties: ['Aerospace & Defense', 'Procedure Development', 'Level III Services', 'Manufacturing'],
        description: 'Experts in aerospace NDT compliance, offering certified Level III services and procedure development to meet stringent aviation standards.'
    }
];
