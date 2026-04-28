"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createConcert, updateConcert } from "@/app/(admin)/concerts/actions"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

const concertSchema = z.object({
  concert_name: z.string().min(1, "Concert name is required"),
  concert_date: z.string().regex(dateRegex, "Use dd/mm/yyyy format"),
  concert_start_time: z.string().regex(timeRegex, "Use HH:MM format"),
  concert_end_time: z.string().regex(timeRegex, "Use HH:MM format"),
  concert_location_name: z.string().min(1, "Location name is required"),
  concert_status: z.enum(["active", "inactive"]),
  front_image: z.string().url("Enter a valid URL").or(z.literal("")),
  logo: z.string().url("Enter a valid URL").or(z.literal("")),
  concert_description: z.string().optional(),
  terms: z.string().optional(),
})

type ConcertFormValues = z.infer<typeof concertSchema>

interface ConcertRecord {
  id: string | number
  concert_name: string | null
  concert_date: string | null
  concert_start_time: string | null
  concert_end_time: string | null
  concert_location_name: string | null
  concert_status: boolean | null
  front_image: string | null
  logo: string | null
  concert_description: string | null
  terms: string | null
}

interface ConcertFormPageProps {
  concert?: ConcertRecord
}

export function ConcertFormPage({ concert }: ConcertFormPageProps) {
  const router = useRouter()
  const isEditing = !!concert
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ConcertFormValues>({
    resolver: zodResolver(concertSchema),
    defaultValues: {
      concert_name: concert?.concert_name || "",
      concert_date: concert?.concert_date || "",
      concert_start_time: concert?.concert_start_time || "",
      concert_end_time: concert?.concert_end_time || "",
      concert_location_name: concert?.concert_location_name || "",
      concert_status: concert?.concert_status ? "active" : "inactive",
      front_image: concert?.front_image || "",
      logo: concert?.logo || "",
      concert_description: concert?.concert_description || "",
      terms: concert?.terms || "",
    },
  })

  const onSubmit = async (data: ConcertFormValues) => {
    setIsLoading(true)
    try {
      const payload = {
        concert_name: data.concert_name,
        concert_date: data.concert_date,
        concert_start_time: data.concert_start_time,
        concert_end_time: data.concert_end_time,
        concert_location_name: data.concert_location_name,
        concert_status: data.concert_status === "active",
        front_image: data.front_image || null,
        logo: data.logo || null,
        concert_description: data.concert_description || null,
        terms: data.terms || null,
      }

      const result = isEditing
        ? await updateConcert(String(concert.id), payload)
        : await createConcert(payload)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(isEditing ? "Concert updated successfully" : "Concert created successfully")
      router.push("/concerts")
      router.refresh()
    } catch {
      toast.error("Failed to save concert")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="concert_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Concert Name</FormLabel>
                <FormControl>
                  <Input placeholder="Concert name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="concert_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Concert Date</FormLabel>
                <FormControl>
                  <Input placeholder="dd/mm/yyyy" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="concert_start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input placeholder="--:--" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="concert_end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input placeholder="--:--" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="concert_location_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Name</FormLabel>
              <FormControl>
                <Input placeholder="Location name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="concert_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="front_image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Front Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/front-image.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/logo.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="concert_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Description" className="min-h-32" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terms and Conditions</FormLabel>
              <FormControl>
                <Textarea placeholder="Terms and Conditions" className="min-h-32" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/concerts")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Update Concert" : "Create Concert"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
