
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Read the NDT EXCHANGE privacy policy to understand how we collect, use, and protect your personal information and data.',
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-8">
            Privacy Policy
          </h1>
          <div className="space-y-6 text-muted-foreground">
            <p>
              Your privacy is important to us. It is NDT EXCHANGE's policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.
            </p>
            
            <h2 className="text-2xl font-headline text-foreground pt-4">1. Information We Collect</h2>
            <p>
                <strong>Log data:</strong> When you visit our website, our servers may automatically log the standard data provided by your web browser. It may include your computer’s Internet Protocol (IP) address, your browser type and version, the pages you visit, the time and date of your visit, the time spent on each page, and other details.
            </p>
            <p>
                <strong>Personal Information:</strong> We may ask for personal information, such as your: Name, Email, Social media profiles, Phone/mobile number, Work address. This data is collected for the purpose of providing our service, and to communicate with you.
            </p>

            <h2 className="text-2xl font-headline text-foreground pt-4">2. Legal Bases for Processing</h2>
            <p>
                We will process your personal information lawfully, fairly and in a transparent manner. We collect and process information about you only where we have legal bases for doing so.
            </p>
            
            <h2 className="text-2xl font-headline text-foreground pt-4">3. Security of Your Personal Information</h2>
            <p>
                When we collect and process personal information, and while we retain this information, we will protect it within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.
            </p>

            <h2 className="text-2xl font-headline text-foreground pt-4">4. Your Rights and Controlling Your Personal Information</h2>
            <p>
                You always retain the right to withhold personal information from us, with the understanding that your experience of our website may be affected. We will not discriminate against you for exercising any of your rights over your personal information. If you do provide us with personal information you understand that we will collect, hold, use and disclose it in accordance with this privacy policy. You retain the right to request details of any personal information we hold about you.
            </p>

            <h2 className="text-2xl font-headline text-foreground pt-4">5. Data Sharing and Disclosure</h2>
            <p>
              Our platform is designed to connect professionals. As such, some of your information is shared to facilitate these connections:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                    <strong>For Asset Owners (Clients):</strong> When you post a job, your company name and the general location of the job will be visible to potential service providers in the marketplace. Your personal name and direct contact information are not shared until you award a job to a provider.
                </li>
                <li>
                    <strong>For Service Providers (Inspectors):</strong> Your company's profile, including its name, location, and the NDT techniques you offer, is listed in our public provider directory. Your technicians' names and certifications may be visible to clients when you bid on or are assigned to a job.
                </li>
                <li>
                    <strong>Between Connected Parties:</strong> Once a job is awarded, contact information (like names and emails) will be shared between the client and the awarded provider to facilitate communication and project execution.
                </li>
            </ul>
            <p>
              We do not sell your personal information to third parties. We may disclose your information to third-party service providers who assist us in operating our website and conducting our business, so long as those parties agree to keep this information confidential.
            </p>

            <h2 className="text-2xl font-headline text-foreground pt-4">6. Data Retention and Integrity</h2>
            <p>
                To ensure a complete and tamper-proof audit trail for all platform activities, core records are not permanently deleted from our system. Instead, they are marked as inactive. For example:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                    <strong>Assets</strong> that are no longer in service are marked as "Decommissioned."
                </li>
                <li>
                    <strong>User profiles</strong> for individuals who have left a company are marked as "Disabled."
                </li>
            </ul>
            <p>
                This practice ensures that historical data related to jobs, inspections, and reports remains intact for compliance, auditing, and analytical purposes, reinforcing the reliability and integrity of your records.
            </p>

          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
