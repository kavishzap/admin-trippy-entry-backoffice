import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConcertFormPage } from "@/components/admin/concerts/concert-form-page"

interface EditConcertPageProps {
  params: Promise<{ id: string }>
}

export default async function EditConcertPage({ params }: EditConcertPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: concert } = await supabase.from("concerts").select("*").eq("id", id).single()

  if (!concert) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Concert</h1>
        <p className="text-muted-foreground">Update the concert details and save your changes.</p>
      </div>
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Concert Details</CardTitle>
          <CardDescription>Edit the fields below to update this concert.</CardDescription>
        </CardHeader>
        <CardContent>
          <ConcertFormPage concert={concert} />
        </CardContent>
      </Card>
    </div>
  )
}
