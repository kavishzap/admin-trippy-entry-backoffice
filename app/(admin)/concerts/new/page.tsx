import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConcertFormPage } from "@/components/admin/concerts/concert-form-page"

export default async function NewConcertPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add Concert</h1>
        <p className="text-muted-foreground">Create a new concert with full event details.</p>
      </div>
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Concert Details</CardTitle>
          <CardDescription>Fill in all required fields to publish the concert.</CardDescription>
        </CardHeader>
        <CardContent>
          <ConcertFormPage />
        </CardContent>
      </Card>
    </div>
  )
}
