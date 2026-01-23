import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OAuthConsent() {
  const [authDetails, setAuthDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getAuthDetails = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authorizationId = urlParams.get('authorization_id');

      if (!authorizationId) {
        setError('Missing authorization_id parameter');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

        if (error) {
          setError(error.message);
        } else {
          setAuthDetails(data);
        }
      } catch (err) {
        setError('Failed to get authorization details');
      } finally {
        setLoading(false);
      }
    };

    getAuthDetails();
  }, []);

  const handleApprove = async () => {
    if (!authDetails) return;

    const urlParams = new URLSearchParams(window.location.search);
    const authorizationId = urlParams.get('authorization_id');

    if (!authorizationId) return;

    try {
      const { data, error } = await supabase.auth.oauth.approveAuthorization(authorizationId);

      if (error) {
        setError(error.message);
      } else {
        window.location.href = (data as any).redirect_url;
      }
    } catch (err) {
      setError('Failed to approve authorization');
    }
  };

  const handleDeny = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authorizationId = urlParams.get('authorization_id');

    if (!authorizationId) return;

    try {
      const { data, error } = await supabase.auth.oauth.denyAuthorization(authorizationId);

      if (error) {
        setError(error.message);
      } else {
        window.location.href = (data as any).redirect_url;
      }
    } catch (err) {
      setError('Failed to deny authorization');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading authorization details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authorization Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!authDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Request</CardTitle>
            <CardDescription>No authorization details found</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authorize Application</CardTitle>
          <CardDescription>
            <strong>{authDetails.client?.name}</strong> wants to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Application Details:</p>
            <div className="space-y-1 text-sm">
              <p><strong>Client ID:</strong> {authDetails.client?.client_id}</p>
              <p><strong>Redirect URI:</strong> {authDetails.redirect_uri}</p>
            </div>
          </div>

          {authDetails.scopes && authDetails.scopes.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Requested Permissions:</p>
              <ul className="text-sm space-y-1">
                {authDetails.scopes.map((scope: string) => (
                  <li key={scope} className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    {scope}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button onClick={handleDeny} variant="outline" className="flex-1">
              Deny
            </Button>
            <Button onClick={handleApprove} className="flex-1">
              Approve
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}