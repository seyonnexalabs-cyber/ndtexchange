
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-grow">
        <section className="py-20 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-headline font-bold">
                Your First 365 Days are on Us
              </h1>
              <p className="mt-6 text-lg md:text-xl text-primary-foreground/80">
                Sign up today and get your first 365 days of NDT Exchange completely free. No credit card required. Full access to all features to grow your business.
              </p>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <PricingCard
                plan="Client"
                price="Contact Us"
                description="For asset owners managing critical infrastructure."
                features={[
                  "Manage Assets & Documents",
                  "Post Jobs to Marketplace",
                  "Award Bids & Track Progress",
                  "Generate Historical Reports",
                  "Standard Support"
                ]}
                isFeatured={false}
              />
              <PricingCard
                plan="Service Provider"
                price="Contact Us"
                description="For NDT companies providing inspection services."
                features={[
                  "Find & Bid on Jobs",
                  "Manage Technicians & Equipment",
                  "Digital Report Generation",
                  "Client Communication Tools",
                  "Priority Support"
                ]}
                isFeatured={true}
              />
              <PricingCard
                plan="Enterprise"
                price="Custom"
                description="For large organizations with unique requirements."
                features={[
                  "All Provider Features",
                  "Custom Integrations (API)",
                  "Advanced Security & SSO",
                  "Auditor & Regulator access tools",
                  "Dedicated Account Manager",
                  "24/7 Premium Support"
                ]}
                isFeatured={false}
              />
            </div>
             <p className="text-center text-muted-foreground mt-8 text-sm">
                All plans are billed annually after your first 365 days. Contact us for detailed pricing. Auditor access is typically managed via Client or Enterprise accounts.
             </p>
          </div>
        </section>

        <section id="contact-form" className="py-20 bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-headline font-semibold text-primary">
                            Get in Touch
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Have questions about our platform or pricing? We'd love to hear from you.
                        </p>
                    </div>
                    <form className="space-y-6">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" placeholder="Your Name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" placeholder="you@company.com" />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="role">You are a...</Label>
                            <Select name="role">
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="client">Client / Asset Owner</SelectItem>
                                    <SelectItem value="provider">NDT Service Provider</SelectItem>
                                    <SelectItem value="auditor">Auditor / Regulator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" placeholder="e.g., Pricing Inquiry" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" placeholder="How can we help you?" className="min-h-[150px]" />
                        </div>
                        <div className="text-right">
                             <Button type="submit">Send Message</Button>
                        </div>
                    </form>
                    <div className="text-center mt-12 text-muted-foreground">
                        <p className="flex items-center justify-center gap-2">
                            <Mail className="w-4 h-4" /> sales@ndtexchange.com
                        </p>
                         <p className="flex items-center justify-center gap-2 mt-2">
                            <Phone className="w-4 h-4" /> (555) 123-4567
                        </p>
                    </div>
                </div>
            </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

function PricingCard({ plan, price, description, features, isFeatured }: { plan: string; price: string; description: string; features: string[], isFeatured: boolean }) {
  return (
    <Card className={isFeatured ? "border-primary ring-2 ring-primary shadow-lg" : ""}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">{plan}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="pt-4">
            <span className="text-4xl font-bold">{price}</span>
             {price !== "Custom" && price !== "Contact Us" && <span className="text-sm text-muted-foreground">/mo</span>}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center">
              <CheckCircle className="w-5 h-5 text-accent mr-3" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={isFeatured ? 'default' : 'outline'} asChild>
          <Link href="#contact-form">Start Your 365-Day Free Trial</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
