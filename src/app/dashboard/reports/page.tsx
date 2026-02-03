import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight font-headline mb-4">
        Reports
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Reporting Center</CardTitle>
          <CardDescription>This feature is under development.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Soon, you will be able to generate and download detailed reports on sales, pricing, compliance, and crisis response logs.</p>
        </CardContent>
      </Card>
    </div>
  );
}
