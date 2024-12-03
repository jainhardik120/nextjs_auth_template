
import { redirect } from "next/navigation"
import { signIn } from "@/server/auth"
import { providerMap } from "@/server/auth/config"
import { AuthError } from "next-auth"
import { LoginForm } from "./login-form"



const SIGNIN_ERROR_URL = "/api/auth/error"


export default function SignInPage() {
  return (
    <div className="flex flex-col gap-2">
      <LoginForm/>
      {Object.values(providerMap).map((provider) => (
        <form
          key={provider.id}
          action={async () => {
            "use server"
            try {
              await signIn(provider.id)
            } catch (error) {
              if (error instanceof AuthError) {
                return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`)
              }
              throw error
            }
          }}
        >
          <button type="submit">
            <span>Sign in with {provider.name}</span>
          </button>
        </form>
      ))}
    </div>
  )
}