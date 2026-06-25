"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Link, Unlink, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CJConnectionStatus {
  connected: boolean;
  storeName?: string;
  lastValidatedAt?: string;
}

export function CjConnectionCard() {
  const [status, setStatus] = useState<CJConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [storeName, setStoreName] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/cj-connection");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Failed to fetch CJ connection status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);

    try {
      const response = await fetch("/api/cj-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, storeName }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setShowForm(false);
        setApiKey("");
        setStoreName("");
        fetchStatus();
      } else {
        toast.error(data.error || "Failed to connect");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);

    try {
      const response = await fetch("/api/cj-connection", {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchStatus();
      } else {
        toast.error(data.error || "Failed to disconnect");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="glass border-glass-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-glass-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="size-5" />
          CJ Dropshipping Connection
        </CardTitle>
        <CardDescription>
          Connect your CJ Dropshipping account to sync products and fulfill orders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status?.connected ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="size-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-500">Connected</p>
                {status.storeName && (
                  <p className="text-sm text-muted-foreground mt-1">Store: {status.storeName}</p>
                )}
                {status.lastValidatedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last validated: {new Date(status.lastValidatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="w-full gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
            >
              {isDisconnecting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Unlink className="size-4" />
              )}
              Disconnect Account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertCircle className="size-5 text-yellow-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-500">Not Connected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect your CJ Dropshipping account to enable product sync and order fulfillment
                </p>
              </div>
            </div>
            
            {showForm ? (
              <form onSubmit={handleConnect} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">CJ API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your CJ Dropshipping API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Get your API key from the CJ Dropshipping developer portal
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name (Optional)</Label>
                  <Input
                    id="storeName"
                    placeholder="My Store"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isConnecting}
                    className="flex-1 gap-2"
                  >
                    {isConnecting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Link className="size-4" />
                    )}
                    Connect
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    disabled={isConnecting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                onClick={() => setShowForm(true)}
                className="w-full gap-2"
              >
                <Link className="size-4" />
                Connect Account
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
