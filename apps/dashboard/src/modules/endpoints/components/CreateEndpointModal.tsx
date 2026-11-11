"use client";

import { AlertCircle, Globe, Key, Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateEndpointMutation } from "@/modules/endpoints/hooks/useEndpoints";
import type { CreateEndpointState, Endpoint } from "@/modules/endpoints/types";

interface CreateEndpointModalProps {
  isOpen: boolean;
  applicationId: string;
  onClose: () => void;
  onSuccess?: (endpoint: Endpoint) => void;
}

export function CreateEndpointModal({
  isOpen,
  applicationId,
  onClose,
  onSuccess,
}: CreateEndpointModalProps) {
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [fieldErrors, setFieldErrors] = useState<CreateEndpointState["errors"]>(
    {},
  );

  const mutation = useCreateEndpointMutation(applicationId);

  if (!isOpen) return null;

  const handleClose = () => {
    if (!mutation.isPending) {
      setFieldErrors({});
      setUrl("");
      setSecret("");
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    try {
      const created = await mutation.mutateAsync({
        url: url.trim(),
        secret: secret.trim() ? secret.trim() : undefined,
      });
      if (created && onSuccess) {
        onSuccess(created);
      }
      handleClose();
    } catch (err: unknown) {
      const errorObj = err as CreateEndpointState;
      if (errorObj?.errors) {
        setFieldErrors(errorObj.errors);
      } else {
        setFieldErrors({
          _form: [(err as Error)?.message || "Failed to register endpoint."],
        });
      }
    }
  };

  const formErrorMessage =
    fieldErrors?._form?.[0] ||
    (mutation.isError && (mutation.error as Error)?.message);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed backdrop */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close dialog backdrop"
        className="fixed inset-0 bg-foreground/50 backdrop-blur-xs transition-opacity cursor-default border-0 p-0 m-0"
        onClick={handleClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-canvas p-6 shadow-xl animate-in fade-in zoom-in-95 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Register Webhook Endpoint
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Provide an HTTPS destination URL to receive event webhook
              dispatches.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={mutation.isPending}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Error Banner */}
        {formErrorMessage && (
          <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{formErrorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Destination URL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="create-endpoint-url"
                className="text-xs font-semibold text-foreground"
              >
                Endpoint URL
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Required • HTTPS recommended
              </span>
            </div>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="create-endpoint-url"
                type="url"
                placeholder="https://api.yourdomain.com/webhooks"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={mutation.isPending}
                required
                className={`pl-9 font-mono text-xs ${
                  fieldErrors?.url
                    ? "border-destructive focus-visible:ring-destructive"
                    : "border-input"
                }`}
              />
            </div>
            {fieldErrors?.url ? (
              <p className="text-[11px] font-medium text-destructive">
                {fieldErrors.url[0]}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Must be an active HTTP/HTTPS endpoint capable of accepting POST
                requests.
              </p>
            )}
          </div>

          {/* Optional Webhook Secret */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="create-endpoint-secret"
                className="text-xs font-semibold text-foreground"
              >
                Signing Secret{" "}
                <span className="text-muted-foreground font-normal">
                  (Optional)
                </span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Auto-generated if empty
              </span>
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="create-endpoint-secret"
                type="text"
                placeholder="whsec_customsecret..."
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                disabled={mutation.isPending}
                className={`pl-9 font-mono text-xs ${
                  fieldErrors?.secret
                    ? "border-destructive focus-visible:ring-destructive"
                    : "border-input"
                }`}
              />
            </div>
            {fieldErrors?.secret ? (
              <p className="text-[11px] font-medium text-destructive">
                {fieldErrors.secret[0]}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Leave empty to let TrueHook generate a cryptographically secure
                HMAC secret (`whsec_...`).
              </p>
            )}
          </div>

          {/* Modal Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={mutation.isPending}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending || !url.trim()}
              className="text-xs"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Register Endpoint
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
