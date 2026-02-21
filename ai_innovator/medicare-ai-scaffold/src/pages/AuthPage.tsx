import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Alert, message } from 'antd'
import { PhoneOutlined, LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons'
import * as Tabs from '@radix-ui/react-tabs'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services'
import type { LoginPayload, RegisterPayload } from '../../types'

// ─── OTP Input Component ──────────────────────────────────────────────────────
const OTPInput = ({
  onComplete,
  onBack,
  phone,
  loading,
}: {
  onComplete: (otp: string) => void
  onBack: () => void
  phone: string
  loading: boolean
}) => {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [resendSeconds, setResendSeconds] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const timerRef = useRef<number | null>(null)

  // Countdown timer
  useState(() => {
    timerRef.current = window.setInterval(() => {
      setResendSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!)
          setCanResend(true)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  })

  const handleChange = (idx: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const updated = [...digits]
    updated[idx] = digit
    setDigits(updated)

    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus()

    if (updated.every((d) => d !== '')) {
      onComplete(updated.join(''))
    }
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  // Paste handler — populates all 6 boxes
  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const updated = pasted.split('')
      setDigits(updated)
      inputRefs.current[5]?.focus()
      onComplete(pasted)
    }
  }

  const handleResend = async () => {
    try {
      await authService.resendOtp(phone)
      setDigits(['', '', '', '', '', ''])
      setResendSeconds(30)
      setCanResend(false)
      inputRefs.current[0]?.focus()
      // Restart timer
      timerRef.current = window.setInterval(() => {
        setResendSeconds((s) => {
          if (s <= 1) { clearInterval(timerRef.current!); setCanResend(true); return 0 }
          return s - 1
        })
      }, 1000)
      message.success('OTP resent successfully')
    } catch {
      message.error('Failed to resend OTP. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-brand-textLight mb-4">
          OTP sent to <strong className="font-semibold text-brand-text">{phone}</strong>
        </p>

        <fieldset>
          <legend className="sr-only">Enter 6-digit OTP</legend>
          <div
            className="flex gap-2 justify-center"
            onPaste={handlePaste}
          >
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el }}
                type="text"
                inputMode="numeric"
                autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                aria-label={`OTP digit ${idx + 1} of 6`}
                className="w-12 h-12 text-center text-lg font-bold border-2 border-brand-border
                           rounded-[8px] focus:outline-none focus:border-brand-primary
                           focus-visible:ring-2 focus-visible:ring-brand-primary
                           transition-colors font-variant-numeric-tabular"
              />
            ))}
          </div>
        </fieldset>
      </div>

      <Button
        type="primary"
        size="large"
        block
        loading={loading}
        disabled={digits.some((d) => !d)}
        aria-busy={loading}
        className="h-12 text-base font-semibold rounded-[8px]"
        onClick={() => onComplete(digits.join(''))}
      >
        {loading ? 'Verifying…' : 'Verify OTP'}
      </Button>

      <div className="text-center">
        {canResend ? (
          <button
            onClick={handleResend}
            className="text-sm text-brand-primary hover:underline
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded"
          >
            Resend OTP
          </button>
        ) : (
          <p className="text-sm text-brand-muted" aria-live="polite">
            Resend OTP in{' '}
            <span className="font-semibold font-variant-numeric-tabular">{resendSeconds}s</span>
          </p>
        )}
      </div>

      <button
        onClick={onBack}
        className="w-full text-sm text-brand-textLight hover:text-brand-text text-center
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded"
      >
        ← Back to Sign Up
      </button>
    </div>
  )
}

// ─── Main Auth Page ───────────────────────────────────────────────────────────
export const AuthPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otpState, setOtpState] = useState<{ show: boolean; phone: string }>({ show: false, phone: '' })
  const firstErrorRef = useRef<HTMLInputElement | null>(null)

  const handleSignIn = async (values: LoginPayload) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authService.login(values)
      const { user, tokens } = res.data.data
      setAuth(user, tokens.accessToken, tokens.refreshToken)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (values: RegisterPayload) => {
    setLoading(true)
    setError(null)
    try {
      await authService.register(values)
      setOtpState({ show: true, phone: values.phone })
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpVerify = async (otp: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authService.verifyOtp({ phone: otpState.phone, otp })
      const { user, tokens } = res.data.data
      setAuth(user, tokens.accessToken, tokens.refreshToken)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-surface flex">
      {/* Skip link */}
      <a
        href="#auth-card"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50
                   focus:px-4 focus:py-2 focus:bg-brand-primary focus:text-white focus:rounded-[8px]"
      >
        Skip to login form
      </a>

      {/* Left panel — Hero */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] bg-brand-primary p-12 text-white"
        aria-hidden="true"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="font-bold text-xl">Medicare AI</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-balance">
            Your AI-powered health companion
          </h1>
          <p className="text-white/80 text-lg">
            Symptom checking, disease prediction, and emergency services — all in one place.
          </p>
          <div className="space-y-3">
            {[
              '🩺 AI-powered symptom analysis',
              '🖼️ Image-based disease detection',
              '🚨 Emergency services at your fingertips',
              '🏥 Find hospitals near you',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 bg-white/10 rounded-[10px] px-4 py-3 text-sm">
                {feature}
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/50 text-xs">
          Not a replacement for professional medical advice. Always consult a qualified doctor.
        </p>
      </div>

      {/* Right panel — Auth card */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-[8px] bg-brand-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-bold text-brand-text text-lg">Medicare AI</span>
        </div>

        <div
          id="auth-card"
          className="w-full max-w-md bg-white rounded-[16px] shadow-cardHover p-8 border border-brand-border"
        >
          <Tabs.Root
            value={activeTab}
            onValueChange={(v) => { setActiveTab(v as 'signin' | 'signup'); setError(null); setOtpState({ show: false, phone: '' }) }}
          >
            <Tabs.List
              className="flex bg-brand-surface rounded-[10px] p-1 mb-6"
              aria-label="Authentication method"
            >
              {(['signin', 'signup'] as const).map((tab) => (
                <Tabs.Trigger
                  key={tab}
                  value={tab}
                  className="flex-1 py-2 px-4 text-sm font-medium rounded-[8px] transition-colors
                             text-brand-muted
                             data-[state=active]:bg-white data-[state=active]:text-brand-text
                             data-[state=active]:shadow-card
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  {tab === 'signin' ? t('auth.signIn') : t('auth.signUp')}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {/* Error */}
            {error && (
              <Alert
                type="error"
                message={error}
                className="mb-4 rounded-[8px]"
                showIcon
                closable
                onClose={() => setError(null)}
                role="alert"
              />
            )}

            {/* Sign In */}
            <Tabs.Content value="signin">
              <Form
                layout="vertical"
                onFinish={handleSignIn}
                validateTrigger="onBlur"
                autoComplete="on"
              >
                <Form.Item
                  label="Mobile Number"
                  name="phone"
                  rules={[
                    { required: true, message: 'Mobile number is required' },
                    { pattern: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit Indian mobile number' },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined aria-hidden="true" />}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    spellCheck={false}
                    placeholder="98XXXXXXXX…"
                    size="large"
                    className="rounded-[8px]"
                  />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  rules={[{ required: true, message: 'Password is required' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined aria-hidden="true" />}
                    autoComplete="current-password"
                    placeholder="Enter your password…"
                    size="large"
                    className="rounded-[8px]"
                  />
                </Form.Item>

                <div className="flex justify-end mb-4">
                  <a href="/forgot-password" className="text-sm text-brand-primary hover:underline">
                    Forgot password?
                  </a>
                </div>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={loading}
                    aria-busy={loading}
                    className="h-12 text-base font-semibold rounded-[8px]"
                  >
                    {loading ? 'Signing in…' : t('auth.signIn')}
                  </Button>
                </Form.Item>
              </Form>
            </Tabs.Content>

            {/* Sign Up */}
            <Tabs.Content value="signup">
              {otpState.show ? (
                <OTPInput
                  phone={otpState.phone}
                  loading={loading}
                  onComplete={handleOtpVerify}
                  onBack={() => setOtpState({ show: false, phone: '' })}
                />
              ) : (
                <Form
                  layout="vertical"
                  onFinish={handleRegister}
                  validateTrigger="onBlur"
                  autoComplete="on"
                >
                  <Form.Item
                    label="Full Name"
                    name="fullName"
                    rules={[{ required: true, message: 'Full name is required' }]}
                  >
                    <Input
                      prefix={<UserOutlined aria-hidden="true" />}
                      type="text"
                      autoComplete="name"
                      placeholder="Enter your full name…"
                      size="large"
                      className="rounded-[8px]"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Mobile Number"
                    name="phone"
                    rules={[
                      { required: true, message: 'Mobile number is required' },
                      { pattern: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit Indian mobile number' },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined aria-hidden="true" />}
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      spellCheck={false}
                      placeholder="98XXXXXXXX…"
                      size="large"
                      className="rounded-[8px]"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Email (optional)"
                    name="email"
                    rules={[{ type: 'email', message: 'Enter a valid email address' }]}
                  >
                    <Input
                      prefix={<MailOutlined aria-hidden="true" />}
                      type="email"
                      autoComplete="email"
                      spellCheck={false}
                      placeholder="your@email.com…"
                      size="large"
                      className="rounded-[8px]"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                      { required: true, message: 'Password is required' },
                      { min: 8, message: 'Password must be at least 8 characters' },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined aria-hidden="true" />}
                      autoComplete="new-password"
                      placeholder="Min 8 characters…"
                      size="large"
                      className="rounded-[8px]"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Confirm Password"
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: 'Please confirm your password' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) return Promise.resolve()
                          return Promise.reject('Passwords do not match')
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined aria-hidden="true" />}
                      autoComplete="new-password"
                      placeholder="Re-enter your password…"
                      size="large"
                      className="rounded-[8px]"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      loading={loading}
                      aria-busy={loading}
                      className="h-12 text-base font-semibold rounded-[8px]"
                    >
                      {loading ? 'Sending OTP…' : t('auth.sendOtp')}
                    </Button>
                  </Form.Item>
                </Form>
              )}
            </Tabs.Content>
          </Tabs.Root>

          {/* Legal note */}
          <p className="text-center text-xs text-brand-muted mt-4">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-brand-primary hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-brand-primary hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}
