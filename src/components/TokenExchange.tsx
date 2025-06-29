'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface TokenExchangeData {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: string;
  user_info: {
    id: string;
    name: string;
    email?: string;
  };
}

interface TokenExchangeProps {
  onSuccess?: (data: TokenExchangeData) => void;
  onError?: (error: string) => void;
}

export default function TokenExchange({ onSuccess, onError }: TokenExchangeProps) {
  const [shortToken, setShortToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TokenExchangeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExchange = async () => {
    if (!shortToken.trim()) {
      setError('Please enter a Facebook access token');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/auth/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          short_lived_token: shortToken.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to exchange token');
      }

      if (data.success) {
        setResult(data.data);
        onSuccess?.(data.data);
      } else {
        throw new Error(data.message || 'Token exchange failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatExpiryDate = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  const getDaysUntilExpiry = (isoString: string) => {
    const expiryDate = new Date(isoString);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Facebook Access Token Exchange
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="short-token">
            Short-lived Facebook Access Token
          </Label>
          <Input
            id="short-token"
            placeholder="Paste your Facebook access token here..."
            value={shortToken}
            onChange={(e) => setShortToken(e.target.value)}
            type="password"
          />
          <p className="text-sm text-muted-foreground">
            Get your token from{' '}
            <a
              href="https://developers.facebook.com/tools/explorer/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Facebook Graph API Explorer
            </a>
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium text-green-800">
                  ✅ Token exchanged successfully!
                </p>
                <div className="text-sm space-y-1">
                  <p><strong>User:</strong> {result.user_info.name}</p>
                  {result.user_info.email && (
                    <p><strong>Email:</strong> {result.user_info.email}</p>
                  )}
                  <p><strong>Expires:</strong> {formatExpiryDate(result.expires_at)}</p>
                  <p><strong>Valid for:</strong> {getDaysUntilExpiry(result.expires_at)} days</p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How to get your Facebook Access Token:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://developers.facebook.com/tools/explorer/" target="_blank" className="underline">Facebook Graph API Explorer</a></li>
            <li>Select your Facebook App</li>
            <li>Generate an access token with required permissions</li>
            <li>Copy the token and paste it above</li>
            <li>We'll exchange it for a long-lived token (60 days)</li>
          </ol>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleExchange}
          disabled={isLoading || !shortToken.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exchanging Token...
            </>
          ) : (
            'Exchange for Long-lived Token'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
