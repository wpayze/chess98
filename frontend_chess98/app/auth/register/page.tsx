"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Mail, Lock, User, ArrowRight, ChevronLeft, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateConfirmPassword,
  validateDisplayName,
} from "@/utils/validation"

export default function RegisterPage() {
  const router = useRouter()
  const { register, login, isAuthenticated, isLoading, error, clearError } = useAuthStore()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Validation states
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [displayNameError, setDisplayNameError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null)
  const [formSubmitted, setFormSubmitted] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  // Clear error when inputs change
  useEffect(() => {
    if (error) {
      clearError()
    }

    // Validate inputs when they change (but only after first submission)
    if (formSubmitted) {
      setUsernameError(validateUsername(username))
      setEmailError(validateEmail(email))
      setDisplayNameError(validateDisplayName(displayName))
      setPasswordError(validatePassword(password))
      setConfirmPasswordError(validateConfirmPassword(password, confirmPassword))
    }
  }, [username, email, displayName, password, confirmPassword, clearError, error, formSubmitted])

  const validateForm = (): boolean => {
    const usernameValidationResult = validateUsername(username)
    const emailValidationResult = validateEmail(email)
    const displayNameValidationResult = validateDisplayName(displayName)
    const passwordValidationResult = validatePassword(password)
    const confirmPasswordValidationResult = validateConfirmPassword(password, confirmPassword)

    setUsernameError(usernameValidationResult)
    setEmailError(emailValidationResult)
    setDisplayNameError(displayNameValidationResult)
    setPasswordError(passwordValidationResult)
    setConfirmPasswordError(confirmPasswordValidationResult)

    return (
      !usernameValidationResult &&
      !emailValidationResult &&
      !displayNameValidationResult &&
      !passwordValidationResult &&
      !confirmPasswordValidationResult
    )
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)

    if (!validateForm()) {
      return
    }

    // Register the user
    const user = await register({
      email,
      username,
      password,
      display_name: displayName || username, // Use username as display name if not provided
    })

    if (user) {
      // If registration is successful but doesn't automatically log in,
      // we can log in the user manually
      await login({ email, password })
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90">
      {/* Left panel - Branding and benefits */}
      <div className="md:w-1/2 p-8 flex flex-col justify-center items-center md:items-start">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors self-start mb-12"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-full overflow-hidden w-10 h-10">
            <Image
              src="/images/chess98_logo.png"
              alt="Chess98 Logo"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Chess98
          </h1>
        </div>

        <h2 className="text-4xl font-bold mb-6 text-white">Join our chess community</h2>
        <p className="text-slate-400 mb-8 max-w-md">
          Create your account today and start your journey to becoming a chess master. Play against players from around
          the world and improve your skills.
        </p>

        <div className="space-y-4 mb-8 max-w-md">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-emerald-500">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-white">Play anytime, anywhere</h3>
              <p className="text-sm text-slate-400">Access your games from any device, continue where you left off</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 text-emerald-500">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-white">Track your progress</h3>
              <p className="text-sm text-slate-400">Detailed statistics and analysis to help you improve</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 text-emerald-500">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-white">Join tournaments</h3>
              <p className="text-sm text-slate-400">Compete in regular tournaments with players at your skill level</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-500 max-w-md">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Sign in instead
          </Link>
        </p>
      </div>

      {/* Right panel - Registration form */}
      <div className="md:w-1/2 p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-md border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-white">Create your account</CardTitle>
          </CardHeader>

          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-900/50 text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Choose a username"
                    className={`pl-10 bg-slate-800/50 border-slate-700 h-10 ${usernameError ? "border-red-500" : ""}`}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                {usernameError && <p className="text-xs text-red-500 mt-1">{usernameError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="display-name" className="text-sm font-medium">
                  Display Name (optional)
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="display-name"
                    type="text"
                    placeholder="Eg. John Doe"
                    className={`pl-10 bg-slate-800/50 border-slate-700 h-10 ${displayNameError ? "border-red-500" : ""}`}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {displayNameError && <p className="text-xs text-red-500 mt-1">{displayNameError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className={`pl-10 bg-slate-800/50 border-slate-700 h-10 ${emailError ? "border-red-500" : ""}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`pl-10 pr-10 bg-slate-800/50 border-slate-700 h-10 ${passwordError ? "border-red-500" : ""}`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`pl-10 bg-slate-800/50 border-slate-700 h-10 ${confirmPasswordError ? "border-red-500" : ""}`}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  {confirmPasswordError && <p className="text-xs text-red-500 mt-1">{confirmPasswordError}</p>}
                </div>
              </div>

              <p className="text-xs text-slate-400">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-indigo-400 hover:text-indigo-300">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300">
                  Privacy Policy
                </Link>
                .
              </p>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating your account...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

