"use client";

import * as React from "react";
import { useState, useId, useEffect } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || "";

  useEffect(() => {
    if (!currentText) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex(0);
            setTextArrayIndex((prev) => (prev + 1) % textArray.length);
          }
        }
      },
      isDeleting ? deleteSpeed : speed,
    );

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    isDeleting,
    currentText,
    loop,
    speed,
    deleteSpeed,
    delay,
    displayText,
    text,
  ]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  );
}

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input dark:border-input/50 bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary-foreground/60 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input dark:border-input/50 bg-background px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:bg-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, ...props }, ref) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    return (
      <div className="grid w-full items-center gap-2 text-left">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input id={id} type={showPassword ? "text" : "password"} className={cn("pe-10", className)} ref={ref} {...props} />
          <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? (<EyeOff className="size-4" aria-hidden="true" />) : (<Eye className="size-4" aria-hidden="true" />)}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

type AuthMode = "signin" | "signup" | "forgot" | "check_email" | "verify_signup" | "new_password" | "success_signup" | "success_signin";

export function AuthUI({ initialMode = "signin" }: { initialMode?: AuthMode }) {
  const { 
    signInWithGoogle, signInWithEmail, signUpWithEmail, 
    verifyEmailOtp, resetPassword, updatePassword 
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || "/";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (from && from !== "/") {
      localStorage.setItem("lastPath", from);
    } else {
      localStorage.removeItem("lastPath");
    }
  }, [from]);

  useEffect(() => {
    (window as any).skipAuthRedirect = false;
    
    // Check for recovery hash on mount or hash change
    const checkHash = () => {
      if (window.location.hash.includes("recovery") || window.location.hash.includes("type=recovery") || window.location.search.includes("type=recovery")) {
        setMode("new_password");
      }
    };
    
    checkHash();
    window.addEventListener('hashchange', checkHash);

    return () => {
      (window as any).skipAuthRedirect = false;
      window.removeEventListener('hashchange', checkHash);
    };
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (mode === "success_signup" || mode === "success_signin") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            (window as any).skipAuthRedirect = false;
            navigate(from, { replace: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (error: any) {
      setError(error.message || "An error occurred during sign in");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        if (!email || !password) throw new Error("Please fill out all fields.");
        (window as any).skipAuthRedirect = true;
        await signInWithEmail(email, password);
        setMode("success_signin");
      } 
      else if (mode === "signup") {
        if (!email || !password || !fullName) throw new Error("Please fill out all fields.");
        await signUpWithEmail(email, password, fullName);
        setMode("verify_signup");
      }
      else if (mode === "forgot") {
        if (!email) throw new Error("Please enter your email.");
        try {
          await resetPassword(email);
          setMode("check_email");
        } catch (error: any) {
          // If it's a rate limit error or something else that isn't security-related silence
          if (error?.message && !error.message.toLowerCase().includes("not found")) {
            setError(error.message);
          } else {
            // Still show check_email for security if it's "user not found"
            setMode("check_email");
          }
        }
      }
      else if (mode === "verify_signup") {
        if (!otp) throw new Error("Please enter the 6-digit code.");
        (window as any).skipAuthRedirect = true;
        await verifyEmailOtp(email, otp, 'signup');
        setMode("success_signup");
      }
      else if (mode === "new_password") {
        if (!password) throw new Error("Please enter a new password.");
        await updatePassword(password);
        setMode("success_signin");
      }
    } catch (error: any) {
      console.error("[Auth] Submit Error:", error);
      let message = error.message || "An error occurred during authentication";
      
      if (message.includes("Failed to fetch")) {
        message = "Network Error: Could not reach the authentication server. Please check your internet connection or verify if your Supabase project is active (not paused).";
      } else if (message.includes("Error sending recovery email") || message.includes("Error sending confirmation code")) {
        message = "Email Service Error: Supabase failed to send an email/code. This usually means your SMTP settings in the Supabase dashboard are incorrect or your email quota has been exceeded.";
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => {
    const targetName = from && from !== "/" ? "previous page" : "homepage";
    switch (mode) {
      case "signin": return { title: "Welcome back", sub: "Sign in to continue your journey and discover amazing opportunities." };
      case "signup": return { title: "Create an account", sub: "Sign up to start discovering opportunities." };
      case "forgot": return { title: "Reset your password", sub: "Enter your email to receive a password reset link" };
      case "check_email": return { 
        title: "Check your inbox", 
        sub: resendSuccess 
          ? "We've sent another link! Please check your inbox and spam folder again." 
          : `If an account exists, we've sent a link to reset your password to ${email}. Search for an email from LeapBod with the subject 'Reset Your Password'.` 
      };
      case "verify_signup": return { title: "Verify your email", sub: `We sent a 6-digit code to ${email}` };
      case "new_password": return { title: "New Password", sub: "Enter your new password below to regain access." };
      case "success_signup": return { title: "Account successfully created", sub: `Redirecting you to ${targetName} in ${countdown} sec...` };
      case "success_signin": return { title: "Action successful", sub: `Redirecting you to ${targetName} in ${countdown} sec...` };
    }
  };

  const header = renderHeader();

  const currentContent = mode === "signup" || mode === "verify_signup" || mode === "success_signup" ? {
    image: { src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80", alt: "Professional Team Meeting" },
    quote: { text: "Connect with industry leaders and accelerate your career.", author: "LeapBod" }
  } : {
    image: { src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80", alt: "Modern Architecture" },
    quote: { text: "The journey of a thousand miles begins with a single leap.", author: "LeapBod" }
  };

  return (
    <div className="w-full flex-1 flex flex-col md:grid md:grid-cols-2 bg-background">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>

      {/* LEFT SIDE: FORM */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 pt-20 md:pt-28 relative z-10 w-full min-h-screen md:min-h-[500px]">
          <div className="w-full max-w-[380px] gap-6 flex flex-col">
              <div className="flex flex-col items-center gap-2 text-center mb-2">
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                      {header.title}
                  </h1>
                  <p className="text-balance text-sm text-muted-foreground opacity-80 sm:text-base">
                      {header.sub}
                  </p>


              </div>

              {error && (
                <div style={{ 
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  background: '#fff1f2', 
                  color: '#e11d48', 
                  fontSize: '14px', 
                  marginBottom: '16px',
                  border: '1px solid #fecdd3',
                  textAlign: 'center',
                  fontWeight: 500
                }}>
                  {error}
                </div>
              )}

              {mode !== "success_signup" && mode !== "success_signin" && (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                     {mode === "signup" && (
                         <div className="grid gap-2 text-left">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" type="text" value={fullName} onChange={(e)=>setFullName(e.target.value)} required />
                         </div>
                     )}

                     {(mode === "signin" || mode === "signup" || mode === "forgot") && (
                         <div className="grid gap-2 text-left">
                            <Label htmlFor="email">{mode === "forgot" ? "Email *" : "Email"}</Label>
                            <Input id="email" type="email" placeholder={mode === "forgot" ? "Enter your email address" : "name@example.com"} value={email} onChange={(e)=>setEmail(e.target.value)} required />
                         </div>
                     )}

                     {mode === "verify_signup" && (
                         <div className="grid gap-2 text-left">
                             <Label htmlFor="otp">6-Digit Code</Label>
                             <Input id="otp" type="text" maxLength={6} className="text-center text-2xl tracking-widest h-14" value={otp} onChange={(e)=>setOtp(e.target.value)} required />
                         </div>
                     )}

                     {(mode === "signin" || mode === "signup" || mode === "new_password") && (
                         <PasswordInput 
                             label={mode === "new_password" ? "New Password" : "Password"}
                             value={password}
                             onChange={(e: any) => setPassword(e.target.value)}
                             required 
                         />
                     )}

                     <Button 
                        type="submit" 
                        disabled={loading} 
                        className="mt-4 w-full bg-[#111010] text-[#f6f3ee] hover:bg-[#2a2a2a] transition-all" 
                        size="lg"
                     >
                         {loading ? "Processing..." : 
                            mode === "signin" ? "Sign In" : 
                            mode === "signup" ? "Sign Up" : 
                            mode === "forgot" ? "Send reset link" : 
                            mode === "new_password" ? "Update Password" : "Verify Code"}
                     </Button>

                     {mode === "signin" && (
                         <div className="text-right -mt-2">
                            <Button type="button" variant="link" className="px-0 py-0 h-auto text-xs text-muted-foreground" onClick={() => { setError(null); navigate("/auth/forgot-password"); }}>
                                Forgot password?
                            </Button>
                         </div>
                     )}
                  </form>
              )}

              {(mode === "signin" || mode === "signup") && (
                  <>
                      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border mt-2 mb-2">
                          <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
                      </div>
                      <Button variant="outline" type="button" size="lg" onClick={handleGoogleSignIn} disabled={loading} className="w-full">
                          <FcGoogle size={20} className="mr-2" />
                          Google
                      </Button>
                  </>
              )}

              {mode === "check_email" && (
                <div className="flex flex-col gap-4">
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <p className="font-medium text-foreground mb-1">Didn't receive the email?</p>
                    <ul className="list-disc list-inside space-y-1 opacity-80">
                      <li>Check your spam or junk folder</li>
                      <li>Wait a few minutes (it can be delayed)</li>
                      <li>Ensure you typed the email correctly</li>
                    </ul>
                  </div>

                  <Button 
                    type="button" 
                    variant="outline"
                    className="w-full h-12 rounded-xl transition-all hover:bg-accent"
                    onClick={async () => {
                      if (resendTimer > 0) return;
                      setLoading(true);
                      setError(null);
                      try {
                        await resetPassword(email);
                        setResendSuccess(true);
                        setResendTimer(60); // 1 minute cooldown
                        setTimeout(() => setResendSuccess(false), 5000);
                      } catch (e: any) {
                        setError(e.message || "Failed to resend email. Please try again later.");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading || resendTimer > 0}
                  >
                    {loading ? "Sending..." : resendTimer > 0 ? `Wait ${resendTimer}s` : "Resend Email"}
                  </Button>
                  
                  <div className="text-center pt-2">
                    <Button 
                      variant="link" 
                      className="text-muted-foreground hover:text-foreground text-xs" 
                      onClick={() => { setError(null); setMode("signin"); }}
                    >
                        Back to sign in
                    </Button>
                  </div>
                </div>
              )}

              {mode !== "success_signup" && mode !== "success_signin" && mode !== "check_email" && (
                  <div className="text-center text-sm mt-4">
                      {mode === "signin" ? "Don't have an account?" : 
                       mode === "signup" ? "Already have an account?" : ""}
                      {(mode === "signin" || mode === "signup") ? (
                          <Button variant="link" className="pl-1 text-foreground" onClick={() => { setError(null); setMode(mode === "signin" ? "signup" : "signin"); }}>
                              {mode === "signin" ? "Sign up" : "Sign in"}
                          </Button>
                      ) : (
                          <Button variant="link" className="text-foreground" onClick={() => { setError(null); setMode("signin"); navigate("/auth/login"); }}>
                              Back to sign in
                          </Button>
                      )}
                  </div>
              )}
          </div>
      </div>

      {/* RIGHT SIDE: IMAGE BANNER */}
      <div
        className="hidden md:block relative bg-cover bg-center transition-all duration-500 ease-in-out"
        style={{ backgroundImage: `url(${currentContent.image.src})`, minHeight: '600px' }}
        key={currentContent.image.src}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-[300px] bg-gradient-to-t from-black to-transparent" />
        
        <div className="relative z-10 flex h-full flex-col items-center justify-end p-8 pb-16">
            <blockquote className="space-y-4 text-center text-white">
              <p className="text-2xl font-medium tracking-wide max-w-lg">
                “<Typewriter
                    key={currentContent.quote.text}
                    text={currentContent.quote.text}
                    speed={60}
                  />”
              </p>
              <cite className="block text-md font-light text-white/80 not-italic">
                  — {currentContent.quote.author}
              </cite>
            </blockquote>
        </div>
      </div>
    </div>
  );
}