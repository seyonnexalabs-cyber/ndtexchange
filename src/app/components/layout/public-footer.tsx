import Link from 'next/link';

export default function PublicFooter() {
    return (
        <footer className="bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
                    <p>&copy; {new Date().getFullYear()} NDT Exchange. All Rights Reserved.</p>
                    <div className="flex gap-4 mt-4 sm:mt-0">
                        <Link href="/terms" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">Terms & Conditions</Link>
                        <Link href="/privacy" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
