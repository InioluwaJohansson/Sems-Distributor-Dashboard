"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { UserCog, Loader2, Check, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { debounce } from "lodash"

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]|[^a-zA-Z0-9]/, "Password must contain at least one number or special character")

// Form schema for creating administrator
const createAdminSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    userName: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type CreateAdminFormValues = z.infer<typeof createAdminSchema>

interface AddAdministratorSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (values: CreateAdminFormValues) => void
}

export function AddAdministratorSidebar({ open, onOpenChange, onSubmit }: AddAdministratorSidebarProps) {
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true)
  const [usernameMessage, setUsernameMessage] = useState("")

  // Initialize form with default values
  const form = useForm<CreateAdminFormValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const handleSubmit = (values: CreateAdminFormValues) => {
    console.log("Form submitted:", values)
    if (onSubmit) {
      onSubmit(values)
    }
    onOpenChange(false)
    form.reset({
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    })
  }

  // Function to check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (!username) {
      setIsUsernameAvailable(true)
      setUsernameMessage("")
      return
    }

    setIsCheckingUsername(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, we'll consider usernames containing "admin" as taken
      const isAvailable = !username.toLowerCase().includes("admin")
      setIsUsernameAvailable(isAvailable)
      setUsernameMessage(isAvailable ? "Username is available" : "Username is already taken")
    } catch (error) {
      console.error("Error checking username:", error)
      setIsUsernameAvailable(true)
      setUsernameMessage("")
    } finally {
      setIsCheckingUsername(false)
    }
  }

  // Create a debounced version of the username check function
  const debouncedCheckUsername = debounce(checkUsernameAvailability, 500)

  // Watch for username changes
  const username = form.watch("userName")
  useEffect(() => {
    if (username) {
      debouncedCheckUsername(username)
    } else {
      setIsUsernameAvailable(true)
      setUsernameMessage("")
    }

    return () => {
      debouncedCheckUsername.cancel()
    }
  }, [username])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:max-w-[400px] overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />
              Add Administrator
            </SheetTitle>
          </div>
          <SheetDescription>Create a new administrator account</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="space-y-6 p-6 pt-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder="Username" {...field} />
                          {isCheckingUsername && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                          )}
                          {!isCheckingUsername && usernameMessage && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {isUsernameAvailable ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      {usernameMessage && (
                        <p className={isUsernameAvailable ? "text-green-500 text-xs" : "text-red-500 text-xs"}>
                          {usernameMessage}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Password" {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Must be at least 8 characters with a capital letter and a number or special character
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCheckingUsername || !isUsernameAvailable}>
                    Create Administrator
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
