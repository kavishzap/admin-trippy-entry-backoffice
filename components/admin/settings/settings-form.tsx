"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateSettings } from "@/app/(admin)/settings/actions"
import { toast } from "sonner"

interface Setting {
  id: string
  key: string
  value: string
  label: string
  description: string
  type?: "text" | "number" | "email"
}

interface SettingsFormProps {
  settings: Setting[]
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit } = useForm({
    defaultValues: settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      },
      {} as Record<string, string>
    ),
  })

  const onSubmit = async (data: Record<string, string>) => {
    setIsLoading(true)
    try {
      const updates = settings.map((setting) => ({
        key: setting.key,
        value: data[setting.key],
      }))

      const result = await updateSettings(updates)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Settings updated successfully")
      }
    } catch {
      toast.error("Failed to update settings")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {settings.map((setting) => (
        <div key={setting.key} className="space-y-2">
          <Label htmlFor={setting.key}>{setting.label}</Label>
          <Input
            id={setting.key}
            type={setting.type || "text"}
            {...register(setting.key)}
            className="bg-secondary"
          />
          <p className="text-xs text-muted-foreground">{setting.description}</p>
        </div>
      ))}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
