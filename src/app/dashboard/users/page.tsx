
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UsersPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>User Account Management</CardTitle>
                    <CardDescription>
                        This section is for managing all individual user accounts across the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                        From here, an administrator can view, create, edit, and disable user accounts. Each user must be associated with a specific Client company, Provider company, or the internal NDT Exchange team (Admin, Auditor).
                    </p>
                    <p>
                        <strong>Example tasks include:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 pl-4">
                        <li>Creating a new "Project Manager" user for Global Energy Corp.</li>
                        <li>Assigning a "Level II Technician" role to a new user at TEAM, Inc.</li>
                        <li>Resetting a user's password.</li>
                        <li>Deactivating an account for an employee who has left a client company.</li>
                    </ul>
                     <p className="pt-4 font-medium">
                        This functionality is coming soon.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
