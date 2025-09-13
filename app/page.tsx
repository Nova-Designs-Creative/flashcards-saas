import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Sparkles, 
  Crown, 
  BookOpen, 
  Zap, 
  Target,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"} className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                StudyAI - Flashcard Generator
              </Link>
              <div className="flex items-center gap-4 ml-8">
                <Link href="/flashcards" className="hover:text-primary transition-colors">
                  Flashcards
                </Link>
                <Link href="/premium" className="hover:text-primary transition-colors flex items-center gap-1">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  Premium
                </Link>
              </div>
            </div>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>
        
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          {/* Hero Section */}
          <section className="text-center space-y-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="w-12 h-12 text-primary" />
              <h1 className="text-4xl font-bold">StudyAI Flashcard Generator</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transform your study notes into AI-powered flashcards instantly. 
              Boost your learning efficiency with intelligent question generation.
            </p>
            <div className="flex items-center justify-center gap-4 mt-8">
              <Link href="/flashcards">
                <Button size="lg" className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Start Creating Flashcards
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/premium">
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  View Premium
                </Button>
              </Link>
            </div>
          </section>

          {/* Features Section */}
          <section className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Brain className="w-8 h-8 text-primary mb-2" />
                <CardTitle>AI-Powered Generation</CardTitle>
                <CardDescription>
                  Advanced ChatGPT integration creates intelligent flashcards from your notes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Smart question extraction</li>
                  <li>• Automatic difficulty scoring</li>
                  <li>• Context-aware answers</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Intelligent Study Mode</CardTitle>
                <CardDescription>
                  Interactive flashcards with progress tracking and performance analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Flip-card interactions</li>
                  <li>• Accuracy tracking</li>
                  <li>• Spaced repetition</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Premium Features</CardTitle>
                <CardDescription>
                  Unlimited flashcards and advanced study tools for serious learners
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Unlimited generation</li>
                  <li>• Priority processing</li>
                  <li>• Advanced analytics</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Pricing Preview */}
          <section className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Free Plan
                </CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="text-2xl font-bold">$0<span className="text-lg font-normal text-muted-foreground">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ 10 flashcards per month</li>
                  <li>✓ Basic AI generation</li>
                  <li>✓ Simple study mode</li>
                  <li>✓ Progress tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    Premium Plan
                  </CardTitle>
                  <Badge>Most Popular</Badge>
                </div>
                <CardDescription>Everything you need to excel</CardDescription>
                <div className="text-2xl font-bold text-primary">
                  $9.99<span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Unlimited flashcards</li>
                  <li>✓ Priority AI processing</li>
                  <li>✓ Advanced study features</li>
                  <li>✓ Detailed analytics</li>
                  <li>✓ Team collaboration</li>
                  <li>✓ Export options</li>
                </ul>
                <Link href="/premium">
                  <Button className="w-full mt-4">
                    Upgrade to Premium
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>

          <main className="flex-1 flex flex-col gap-6 px-4">
            <h2 className="font-medium text-xl mb-4">Getting Started</h2>
            {hasEnvVars ? <SignUpUserSteps /> : <ConnectSupabaseSteps />}
          </main>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>{" "}
            and{" "}
            <a
              href="https://openai.com"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              OpenAI
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
