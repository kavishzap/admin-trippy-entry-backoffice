"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { createUserType, updateUserType } from "@/app/(admin)/user-types/actions"
import { toast } from "sonner"

const userTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  discount_percentage: z.coerce.number().min(0).max(100),
})

type UserTypeFormValues = z.infer<typeof userTypeSchema>

interface UserType {
  id: string
  name: string
  description: string | null
  discount_percentage: number
}

interface UserTypeDialogProps {
  userType?: UserType
  trigger?: React.ReactNode
}

export function UserTypeDialog({ userType, trigger }: UserTypeDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!userType

  const form = useForm<UserTypeFormValues>({
    resolver: zodResolver(userTypeSchema),
    defaultValues: {
      name: userType?.name || "",
      description: userType?.description || "",
      discount_percentage: userType?.discount_percentage || 0,
    },
  })

  const onSubmit = async (data: UserTypeFormValues) => {
    setIsLoading(true)
    try {
      const result = isEditing
        ? await updateUserType(userType.id, data)
        : await createUserType(data)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(isEditing ? "User type updated" : "User type created")
        setOpen(false)
        form.reset()
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add User Type
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User Type" : "Add User Type"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the user type details."
              : "Create a new user type with discount settings."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="VIP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description of this user type..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="discount_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Percentage</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
