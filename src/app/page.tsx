import { signIn, auth, signOut } from "@/server/auth";

export default async function Home() {
  const session = await auth();
  if (session) {
    return (
      <>
        Signed in as {session.user?.email} <br />
        <button onClick={async () => {
          "use server"
          await signOut()
        }}>Sign out</button>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <button onClick={async () => {
          "use server"
          await signIn()
        }}>Sign in</button>
    </>
  )

}
