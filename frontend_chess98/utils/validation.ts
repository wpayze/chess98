export const validateEmail = (email: string): string | null => {
  if (!email) return "Email is required"

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address"
  }

  return null
}

// Password validation
export const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required"

  if (password.length < 8) {
    return "Password must be at least 8 characters long"
  }

  // Check for at least one uppercase letter, one lowercase letter, and one number
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  // if (!hasUppercase || !hasLowercase || !hasNumber) {
  //   return "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  // }

  return null
}

// Username validation
export const validateUsername = (username: string): string | null => {
  if (!username) return "Username is required"

  if (username.length < 3) {
    return "Username must be at least 3 characters long"
  }

  if (username.length > 20) {
    return "Username must be less than 20 characters long"
  }

  // Only allow alphanumeric characters and underscores
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  if (!usernameRegex.test(username)) {
    return "Username can only contain letters, numbers, and underscores"
  }

  return null
}

// Confirm password validation
export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return "Please confirm your password"

  if (password !== confirmPassword) {
    return "Passwords do not match"
  }

  return null
}

// Display name validation
export const validateDisplayName = (displayName: string): string | null => {
  if (!displayName) return null // Display name is optional

  if (displayName.length < 2) {
    return "Display name must be at least 2 characters long"
  }

  if (displayName.length > 30) {
    return "Display name must be less than 30 characters long"
  }

  return null
}

