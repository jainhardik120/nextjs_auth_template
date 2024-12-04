import { CardWrapper } from "@/components/auth/card-wrapper";

export default function VerifyRequestPage() {
  return (
    <CardWrapper
      headerLabel="Check your email"
      backButtonHref="/auth/signin"
      backButtonLabel="Back to login"
    >
      <p>A sign in link has been sent to your email address</p>
    </CardWrapper>
  );
}
