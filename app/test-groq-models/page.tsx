"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface ModelResult {
  model: string;
  status: string;
  response?: string;
  error?: string;
}

interface TestResult {
  success: boolean;
  timestamp: string;
  models: ModelResult[];
}

export default function TestGroqModelsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const testAllModels = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-groq-models');
      const data = await response.json();
      setResult(data);
    } catch {
      setResult({
        success: false,
        timestamp: new Date().toISOString(),
        models: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-500" />
            Groq Models Status Check
          </CardTitle>
          <CardDescription>
            Test all available Groq models to see which ones are currently working
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testAllModels} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Testing All Models..." : "Test All Groq Models"}
          </Button>

          {result && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Last tested: {new Date(result.timestamp).toLocaleString()}
              </div>
              
              <div className="grid gap-3">
                {result.models.map((model, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {model.status.includes("Working") ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <div className="font-mono text-sm font-medium">
                          {model.model}
                        </div>
                        {model.response && (
                          <div className="text-xs text-muted-foreground">
                            Response: &ldquo;{model.response}&rdquo;
                          </div>
                        )}
                        {model.error && (
                          <div className="text-xs text-red-600">
                            Error: {model.error}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={model.status.includes("Working") ? "default" : "destructive"}
                    >
                      {model.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>How the fallback system works:</strong></p>
            <ul className="list-disc ml-4 space-y-1">
              <li>The app tries models in order of preference</li>
              <li>If a model is decommissioned, it automatically tries the next one</li>
              <li>This ensures your flashcard generation keeps working</li>
              <li>Models are tested from fastest/best to slower alternatives</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}