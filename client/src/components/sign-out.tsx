import { useAuth, useSignOut } from "@better-auth-ui/react"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export type SignOutProps = {
  className?: string
}

export function SignOut({ className }: SignOutProps) {
  const { authClient } = useAuth()

  const { mutate: signOut } = useSignOut(authClient, {
    onError: (error) => {
      toast.error(error.error?.message || error.message)

      window.location.href = "/auth/sign-in"
    },

    onSuccess: () => {
      toast.success("Signed out successfully")

      window.location.href = "/auth/sign-in"
    }
  })

  const hasSignedOut = useRef(false)

  useEffect(() => {
    if (hasSignedOut.current) return

    hasSignedOut.current = true

    signOut()
  }, [signOut])

  return <Spinner className={cn("mx-auto my-auto", className)} />
}