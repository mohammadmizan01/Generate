"use client";

import { useAuth, useFetchOptions, useRequestPasswordReset } from "@better-auth-ui/react";
import { type ComponentType, type SyntheticEvent, useState } from "react";
import { toast } from "sonner";

import { authClient as appAuthClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export type ForgotPasswordProps = {
  className?: string;
};

type AuthPlugin = {
  captchaComponent?: ComponentType;
};

type ForgotPasswordContextShape = {
  authClient: typeof appAuthClient;
  basePaths: { auth: string };
  localization: {
    auth: {
      forgotPassword: string;
      email: string;
      emailPlaceholder: string;
      sendResetLink: string;
      passwordResetEmailSent: string;
      rememberYourPassword: string;
      signIn: string;
    };
  };
  plugins: AuthPlugin[];
  viewPaths: {
    auth: {
      signIn: string;
    };
  };
  Link: ComponentType<{ href: string; className?: string; children?: React.ReactNode }>;
};

export function ForgotPassword({ className }: ForgotPasswordProps) {
  const { authClient, basePaths, localization, plugins, viewPaths, Link } =
    useAuth() as ForgotPasswordContextShape;

  const { fetchOptions, resetFetchOptions } = useFetchOptions();

  const { mutate: requestPasswordReset, isPending } = useRequestPasswordReset(
    authClient,
    {
      onError: (error) => {
        toast.error(error.error?.message || error.message);
        resetFetchOptions();
      },
      onSuccess: () => toast.success(localization.auth.passwordResetEmailSent),
    }
  );

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    requestPasswordReset({
      email: formData.get("email") as string,
      fetchOptions,
    });
  }

  const Captcha = plugins.find((plugin) => plugin.captchaComponent)?.captchaComponent;

  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({});

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {localization.auth.forgotPassword}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={!!fieldErrors.email}>
              <Label htmlFor="email">{localization.auth.email}</Label>

              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={localization.auth.emailPlaceholder}
                required
                disabled={isPending}
                onChange={() => {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                onInvalid={(e) => {
                  e.preventDefault();
                  setFieldErrors((prev) => ({
                    ...prev,
                    email: (e.target as HTMLInputElement).validationMessage,
                  }));
                }}
                aria-invalid={!!fieldErrors.email}
              />

              <FieldError>{fieldErrors.email}</FieldError>
            </Field>

            {Captcha && (
              <div className="flex justify-center">
                <Captcha />
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending && <Spinner />}
                {localization.auth.sendResetLink}
              </Button>
            </div>
          </FieldGroup>
        </form>

        <div className="mt-4 flex w-full flex-col items-center gap-3">
          <FieldDescription className="text-center">
            {localization.auth.rememberYourPassword}{" "}
            <Link
              href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
              className="underline underline-offset-4"
            >
              {localization.auth.signIn}
            </Link>
          </FieldDescription>
        </div>
      </CardContent>
    </Card>
  );
}