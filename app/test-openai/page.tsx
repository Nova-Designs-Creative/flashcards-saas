"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface TestResult {
  success: boolean;
  error?: string;
  status?: number;
  details?: string;
  model?: string;
  response?: string;
  message?: string;
}

export default function TestOpenAIPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const testOpenAI = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-groq');
      const data = await response.json();
      setResult(data);
    } catch {
      setResult({
        success: false,
        error: "Failed to connect to test API",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Groq API Test
          </CardTitle>
          <CardDescription>
            Test your Groq API connection and diagnose any issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testOpenAI} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Testing..." : "Test Groq Connection"}
          </Button>

          {result && (
            <Alert className={result.success ? "border-green-500" : "border-red-500"}>
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertDescription className="space-y-2">
                    {result.success ? (
                      <div>
                        <p className="font-semibold text-green-700">✅ Groq API is working!</p>
                        <p>Model: {result.model}</p>
                        <p>Response: &ldquo;{result.response}&rdquo;</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-red-700">❌ Groq API Error</p>
                        <p><strong>Error:</strong> {result.error}</p>
                        {result.status && <p><strong>Status:</strong> {result.status}</p>}
                        {result.details && <p><strong>Details:</strong> {result.details}</p>}
                        
                        {result.status === 429 && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded border">
                            <p className="font-semibold text-yellow-800">💡 How to fix 429 errors:</p>
                            <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
                              <li>Go to <a href="https://console.groq.com/usage" target="_blank" className="text-blue-600 underline" rel="noopener noreferrer">Groq Usage Dashboard</a></li>
                              <li>Check your current usage and limits</li>
                              <li>Groq has very generous free limits that reset frequently</li>
                              <li>Wait a few minutes and try again</li>
                              <li>Consider upgrading if you need higher limits</li>
                            </ol>
                          </div>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Groq API Benefits:</strong></p>
            <ul className="list-disc ml-4 space-y-1">
              <li><strong>Fast Inference:</strong> Much faster than OpenAI</li>
              <li><strong>Generous Free Tier:</strong> Higher limits than OpenAI</li>
              <li><strong>No Payment Required:</strong> Free tier works immediately</li>
              <li><strong>Quality Models:</strong> Llama 3.1 70B is excellent for text generation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}