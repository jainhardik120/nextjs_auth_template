import { CardWrapper } from "@/components/auth/card-wrapper";
import { FaExclamationTriangle } from "react-icons/fa";

export default function ErrorCard() {
  return (
    <CardWrapper
      headerLabel="Oops! Something went wrong"
      backButtonHref="/auth/signin"
      backButtonLabel="Back to login"
    >
      <div className="flex w-full items-center justify-center">
        <FaExclamationTriangle className="text-destructive w-16 h-16" />
      </div>
    </CardWrapper>
  );
}