
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
}

export const auditFirmServices = ['Compliance Audits', 'Level III Services', 'Procedure Development', 'Welding Inspection', 'Vendor Audits'];
export const auditFirmIndustries = ['Aerospace & Defense', 'Oil & Gas', 'Power Generation', 'Manufacturing', 'Marine', 'Infrastructure'];


export const auditFirms: AuditFirm[] = [
    {
        id: 'auditor-firm-01',
        name: 'NDT Auditors LLC',
        contactPerson: 'Alex Chen',
        contactEmail: 'alex.c@ndtauditors.gov',
        location: 'Washington, D.C., USA',
        services: ['Compliance Audits', 'Level III Services', 'Procedure Development'],
        industries: ['Oil & Gas', 'Power Generation', 'Infrastructure'],
        description: 'A specialized firm providing independent third-party auditing and Level III consulting services to ensure regulatory compliance and quality assurance.'
    },
    {
        id: 'auditor-firm-02',
        name: 'Aero-Compliance Partners',
        contactPerson: 'Brenda Vance',
        contactEmail: 'b.vance@aerocompliance.com',
        location: 'Seattle, WA, USA',
        services: ['Procedure Development', 'Level III Services', 'Vendor Audits'],
        industries: ['Aerospace & Defense', 'Manufacturing'],
        description: 'Experts in aerospace NDT compliance, offering certified Level III services and procedure development to meet stringent aviation standards.'
    },
    {
        id: 'auditor-firm-03',
        name: 'Global Compliance Experts',
        contactPerson: 'Kenji Tanaka',
        contactEmail: 'k.tanaka@globalcompliance.com',
        location: 'Tokyo, Japan',
        services: ['Compliance Audits', 'Vendor Audits', 'Procedure Development'],
        industries: ['Manufacturing', 'Power Generation', 'Marine'],
        description: 'A global leader in providing comprehensive compliance and auditing services with a focus on manufacturing and energy sectors.'
    }
];
