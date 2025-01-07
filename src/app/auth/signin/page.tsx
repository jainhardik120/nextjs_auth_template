"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Suspense, useState, useTransition } from "react";

import { LoginSchema } from "@/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import Link from "next/link";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ErrorCode } from "@/server/auth/config";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || undefined;

  const urlError: string | undefined = (() => {
    switch (searchParams?.get("error")) {
      case "OAuthAccountNotLinked":
        return "Email already in use with a different provider";
      case "CredentialsSignin":
        switch (searchParams?.get("code")) {
          case ErrorCode.INVALID_CREDENTIALS:
            return "Invalid credentials provided";
          case ErrorCode.USER_NOT_FOUND:
            return "User not found";
          case ErrorCode.EMAIL_NOT_VERIFIED:
            return "Please verify your email address";
          case ErrorCode.INVALID_REQUEST:
            return "Invalid request";
          default:
            return "An unknown credentials error occurred";
        }
      default:
        return undefined;
    }
  })();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      signIn("credentials", {
        email: values.email,
        password: values.password,
        redirectTo: callbackUrl,
      });
    });
  };

  const emailSignin = async () => {
    const isValid = await form.trigger("email");
    if (isValid) {
      setError("");
      startTransition(() => {
        signIn("email", {
          email: form.getValues("email"),
          redirectTo: callbackUrl,
        });
      });
    }
  };

  return (
    <CardWrapper
      headerLabel="Welcome back"
      backButtonLabel="Don't have an account?"
      backButtonHref="/auth/signup"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="john.doe@example.com"
                      {...field}
                    />
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
                    <Input type="password" disabled={isPending} {...field} />
                  </FormControl>
                  <Button size="sm" variant="link" className="px-0 font-normal">
                    <Link href="/auth/reset">Forgot password?</Link>
                  </Button>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error || urlError} />
          <FormSuccess message={success} />
          <Button disabled={isPending} type="submit" className="w-full">
            Login with password
          </Button>
          <Button
            type="button"
            onClick={emailSignin}
            variant="outline"
            className="w-full"
          >
            Send login link
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}
