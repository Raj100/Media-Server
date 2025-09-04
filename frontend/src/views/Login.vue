<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <!-- Logo and Welcome -->
        <div class="auth-header">
          <h1 class="auth-logo">MediaHub</h1>
          <h2 class="auth-title">Welcome Back</h2>
          <p class="auth-subtitle">Sign in to access your media collection</p>
        </div>

        <!-- Error Message -->
        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="loginForm.email"
              type="email"
              placeholder="Enter your email"
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="loginForm.password"
              type="password"
              placeholder="Enter your password"
              required
              class="form-input"
            />
          </div>

          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="auth-button primary"
          >
            <span v-if="authStore.isLoading" class="loading-spinner"></span>
            {{ authStore.isLoading ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>

        <!-- Divider -->
        <div class="auth-divider">
          <span>or</span>
        </div>

        <!-- Google OAuth -->
        <button
          @click="handleGoogleLogin"
          :disabled="authStore.isLoading"
          class="auth-button google"
        >
          <svg class="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <!-- Switch to Signup -->
        <div class="auth-switch">
          <p>Don't have an account? 
            <button @click="switchToSignup" class="switch-button">Sign up</button>
          </p>
        </div>
      </div>

      <!-- Signup Form (Hidden by default) -->
      <div v-if="showSignup" class="auth-card signup-card">
        <div class="auth-header">
          <h2 class="auth-title">Create Account</h2>
          <p class="auth-subtitle">Join MediaHub and start enjoying your media</p>
        </div>

        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>

        <form @submit.prevent="handleSignup" class="auth-form">
          <div class="form-group">
            <label for="signup-name">Full Name</label>
            <input
              id="signup-name"
              v-model="signupForm.name"
              type="text"
              placeholder="Enter your full name"
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="signup-email">Email</label>
            <input
              id="signup-email"
              v-model="signupForm.email"
              type="email"
              placeholder="Enter your email"
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="signup-password">Password</label>
            <input
              id="signup-password"
              v-model="signupForm.password"
              type="password"
              placeholder="Create a password"
              required
              minlength="6"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              v-model="signupForm.confirmPassword"
              type="password"
              placeholder="Confirm your password"
              required
              class="form-input"
            />
          </div>

          <button
            type="submit"
            :disabled="authStore.isLoading || !passwordsMatch"
            class="auth-button primary"
          >
            <span v-if="authStore.isLoading" class="loading-spinner"></span>
            {{ authStore.isLoading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <div class="auth-divider">
          <span>or</span>
        </div>

        <button
          @click="handleGoogleLogin"
          :disabled="authStore.isLoading"
          class="auth-button google"
        >
          <svg class="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign up with Google
        </button>

        <div class="auth-switch">
          <p>Already have an account? 
            <button @click="switchToLogin" class="switch-button">Sign in</button>
          </p>
        </div>
      </div>
    </div>

    <!-- Background Animation -->
    <div class="auth-background">
      <div class="floating-shape" v-for="i in 6" :key="i"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { showToast } from "@/lib/toast";

const router = useRouter()
const authStore = useAuthStore()

const showSignup = ref(false)

const loginForm = ref({
  email: 'test@gmail.com', // Pre-filled for demo
  password: 'testing'
})

const signupForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const passwordsMatch = computed(() => {
  return signupForm.value.password === signupForm.value.confirmPassword
})

// const handleLogin = async () => {
//   const success = await authStore.login(loginForm.value)
//   if (success) {
//     router.push('/dashboard')
//   }
// }
const loginLoading = ref(false)
const error = ref("")

const handleLogin = async (): Promise<void> => {
  loginLoading.value = true
  error.value = ""

  const response = await authStore.login(loginForm.value)
  if (!response.success) {
    error.value = response.error || "Login failed"
  }
  if (response.success) {
    router.push('/dashboard')
  }

  loginLoading.value = false
}

const handleSignup = async () => {
  if (!passwordsMatch.value) {
    authStore.error = 'Passwords do not match'
    return
  }
  
  const success = await authStore.signup(signupForm.value)
  if (success) {
    router.push('/dashboard')
  }
}

const handleGoogleLogin = async () => {
  const success = await authStore.loginWithGoogle()
  if (success) {
    router.push('/dashboard')
  }
}

const switchToSignup = () => {
  showSignup.value = true
  authStore.error = null
}

const switchToLogin = () => {
  showSignup.value = false
  authStore.error = null
}

onMounted(() => {
  // Clear any previous errors
  authStore.error = null
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.auth-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 400px;
}

.auth-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 1.5rem;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(88, 28, 135, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.dark .auth-card {
  background: rgba(42, 42, 42, 0.95);
  border: 1px solid rgba(168, 85, 247, 0.2);
}

.signup-card {
  margin-top: 2rem;
  animation: slideUp 0.3s ease;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-logo {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #581c87, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.auth-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #581c87;
}

.dark .auth-title {
  color: #a855f7;
}

.auth-subtitle {
  color: #6b7280;
  font-size: 0.95rem;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  text-align: center;
}

.dark .error-message {
  background: rgba(220, 38, 38, 0.1);
  color: #fca5a5;
}

.auth-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.dark .form-group label {
  color: #d1d5db;
}

.form-input {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.dark .form-input {
  background: #374151;
  border-color: #4b5563;
  color: white;
}

.form-input:focus {
  outline: none;
  border-color: #a855f7;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
}

.auth-button {
  width: 100%;
  padding: 0.875rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-button.primary {
  background: linear-gradient(135deg, #581c87, #a855f7);
  color: white;
}

.auth-button.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(88, 28, 135, 0.3);
}

.auth-button.google {
  background: white;
  color: #374151;
  border: 2px solid #e5e7eb;
  margin-top: 1rem;
}

.dark .auth-button.google {
  background: #374151;
  color: white;
  border-color: #4b5563;
}

.auth-button.google:hover:not(:disabled) {
  background: #f9fafb;
  transform: translateY(-2px);
}

.dark .auth-button.google:hover:not(:disabled) {
  background: #4b5563;
}

.google-icon {
  width: 20px;
  height: 20px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.auth-divider {
  text-align: center;
  margin: 1.5rem 0;
  position: relative;
}

.auth-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
}

.dark .auth-divider::before {
  background: #4b5563;
}

.auth-divider span {
  background: rgba(255, 255, 255, 0.95);
  padding: 0 1rem;
  color: #6b7280;
  font-size: 0.9rem;
}

.dark .auth-divider span {
  background: rgba(42, 42, 42, 0.95);
}

.auth-switch {
  text-align: center;
  margin-top: 1.5rem;
}

.auth-switch p {
  color: #6b7280;
  font-size: 0.9rem;
}

.switch-button {
  background: none;
  border: none;
  color: #a855f7;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

.switch-button:hover {
  color: #581c87;
}

.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #faf5ff, #f3e8ff);
  z-index: 1;
}

.dark .auth-background {
  background: linear-gradient(135deg, #1a1a1a, #2a1a2a);
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(88, 28, 135, 0.1));
  animation: float 6s ease-in-out infinite;
}

.floating-shape:nth-child(1) {
  width: 80px;
  height: 80px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.floating-shape:nth-child(2) {
  width: 120px;
  height: 120px;
  top: 20%;
  right: 10%;
  animation-delay: 1s;
}

.floating-shape:nth-child(3) {
  width: 60px;
  height: 60px;
  bottom: 30%;
  left: 20%;
  animation-delay: 2s;
}

.floating-shape:nth-child(4) {
  width: 100px;
  height: 100px;
  bottom: 10%;
  right: 20%;
  animation-delay: 3s;
}

.floating-shape:nth-child(5) {
  width: 40px;
  height: 40px;
  top: 50%;
  left: 5%;
  animation-delay: 4s;
}

.floating-shape:nth-child(6) {
  width: 70px;
  height: 70px;
  top: 70%;
  right: 5%;
  animation-delay: 5s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .auth-page {
    padding: 1rem;
  }
  
  .auth-card {
    padding: 2rem;
  }
  
  .auth-title {
    font-size: 1.5rem;
  }
}
</style>
