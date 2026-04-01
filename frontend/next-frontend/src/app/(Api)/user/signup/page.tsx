"use client"
import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Github, Loader2 } from "lucide-react"
import { useAuth } from '@/src/Authentication/authcontext';

export default function Authentication() {
  const { Login, Signin } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username) {
      newErrors.username = "Username is required"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    if (isSignUp && !formData.firstname) {
      newErrors.firstname = "First name is required"
    }
    if (isSignUp && !formData.lastname) {
      newErrors.lastname = "Last name is required"
    }
    if (isSignUp && !formData.email) {
      newErrors.email = "Email is required"
    } else if (isSignUp &&  !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (isSignUp && !formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your Passsword"
    } else if (isSignUp && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const isvalid = validateForm()
    
    if (isvalid) {
      setIsLoading(true)
      try {
        if (isSignUp) {
          await Signin(formData)
        } else {
          await Login(formData)
        }
      } catch (error) {
        setIsLoading(false) // Only reset if there's an error; if success, the redirect will handle it
      }
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Gradient Background with Tagline */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="max-w-md text-center space-y-6">
            <h1 className="text-5xl font-bold tracking-tight">Plan. Track. Deliver.</h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Transform your workflow with intelligent project management that adapts to your team's needs.
            </p>
            <div className="flex items-center justify-center space-x-2 text-white/70">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white dark:bg-gray-800">
          <CardHeader className="space-y-3 pb-4">
            <div className="text-center">
              <CardTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
                {isSignUp ? "Start your productivity journey today" : "Sign in to continue to your workspace"}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className={`h-10 text-base transition-all duration-200 ${errors.username
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                />
                {errors.username && <p className="text-sm text-red-600 dark:text-red-400">{errors.username}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`h-10 text-base pr-12 transition-all duration-200 ${errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
              </div>

              {/* Confirm Password Field (Sign Up Only) */}
              {isSignUp && (
                <>
                  <div className='flex gap-3'>
                    <div className="space-y-2 w-1/2">
                      <Label htmlFor="firstname" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        First Name
                      </Label>
                      <div className="relative">
                        <Input
                          id="firstname"
                          type="text"
                          placeholder="First Name"
                          value={formData.firstname}
                          onChange={(e) => handleInputChange("firstname", e.target.value)}
                          className={`h-10 text-base pr-12 transition-all duration-200 ${errors.firstname
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                            }`}
                        />
                      </div>
                      {errors.firstname && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.firstname}</p>
                      )}
                    </div>
                    <div className="space-y-2 w-1/2">
                      <Label htmlFor="lastname" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Last Name
                      </Label>
                      <div className="relative">
                        <Input
                          id="Lastname"
                          type="text"
                          placeholder="last Name"
                          value={formData.lastname}
                          onChange={(e) => handleInputChange("lastname", e.target.value)}
                          className={`h-10 text-base pr-12 transition-all duration-200 ${errors.lastname
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                            }`}
                        />
                      </div>
                      {errors.lastname && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.lastname}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className={`h-10 text-base pr-12 transition-all duration-200 ${errors.confirmPassword
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="Your@company.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`h-10 text-base pr-12 transition-all duration-200 ${errors.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                    )}
                  </div>
                </>
              )}

              {/* Forgot Password Link (Sign In Only) */}
              {!isSignUp && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 text-base mb-2 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  isSignUp ? "Create Account" : "Sign In"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <Separator className="bg-gray-200 dark:bg-gray-700" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-4 text-sm text-gray-500 dark:text-gray-400">
                or continue with
              </span>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-10 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 bg-transparent"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2 text-sm font-medium">Google</span>
              </Button>
              <Button
                variant="outline"
                className="h-10 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 bg-transparent"
              >
                <Github className="w-5 h-5" />
                <span className="ml-2 text-sm font-medium">GitHub</span>
              </Button>
            </div>

            {/* Toggle Sign In/Sign Up */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// useEffect(() => {
//   const signUpButton = document.getElementById('signUp');
//   const signInButton = document.getElementById('signIn');
//   const main = document.getElementById('main');

//   if (signUpButton && signInButton && main) {
//     const handleSignUpClick = () => {
//       main.classList.add("right-panel-active");
//     };
//     const handleSignInClick = () => {
//       main.classList.remove("right-panel-active");
//     };

//     signUpButton.addEventListener('click', handleSignUpClick);
//     signInButton.addEventListener('click', handleSignInClick);

//     // Cleanup event listeners on unmount
//     return () => {
//       signUpButton.removeEventListener('click', handleSignUpClick);
//       signInButton.removeEventListener('click', handleSignInClick);
//     };
//   }
// }, []);

// const handleSignupClick = () => {
//   try {
//     setLoading(true);
//     Signin(formData);
//   } catch (error) {
//     console.error(error)
//   } finally{
//     setLoading(false)
//   }
// };

// const handleSigninClick = async () => {
//   setLoading(true);
//   try {
//     await Login(loginData);
//   } catch (error) {
//     console.error(error)
//   } finally{
//     setLoading(false)
//   }
// };

// return (
//   <div className="container" id="main">
//     <div className="sign-up">
//       <form action="#" onSubmit={handleSubmit}>
//         <h1>Create account</h1>
//         <div className="social-container">
//           <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
//           <a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
//           <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
//         </div>
//         <p>or use your email for registration</p>
//         <input type="text" name="firstname" placeholder="Firstname" required onChange={(e) => { setFormData({ ...formData, firstname: e.target.value }) }} />
//         <input type="text" name="lastname" placeholder="Lastname" required onChange={(e) => { setFormData({ ...formData, lastname: e.target.value }) }} />
//         <input type="text" name="username" placeholder="Username" required onChange={(e) => { setFormData({ ...formData, username: e.target.value }) }} />
//         <input type="email" name="email" placeholder="Email" required onChange={(e) => { setFormData({ ...formData, email: e.target.value }) }} />
//         <input type="password" name="password" placeholder="Password" required onChange={(e) => { setFormData({ ...formData, password: e.target.value }) }} />
//         <button type="button" onClick={handleSignupClick} disabled={buttonDisabled}>Sign Up</button>
//       </form>
//     </div>
//     <div className="sign-in">
//       <form action="#" onSubmit={handleSubmit}>
//         <h1>Sign in</h1>
//         <div className="social-container">
//           <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
//           <a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
//           <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
//         </div>
//         <p>or use your account</p>
//         <input type="text" name="username" placeholder="Username" required onChange={(e) => { setLoginData({ ...loginData, username: e.target.value }) }} />
//         <input type="password" name="password" placeholder="Password" required onChange={(e) => { setLoginData({ ...loginData, password: e.target.value }) }} />
//         <a href="#"> Forget your password?</a>
//         <button type="button" onClick={handleSigninClick}>Sign In</button>
//       </form>
//     </div>
//     <div className="overlay-container">
//       <div className="overlay">
//         <div className="overlay-left">
//           <h1>Welcome back!</h1>
//           <p>To keep connected with us please login with your personal info</p>
//           <button id="signIn">Sign In</button>
//         </div>
//         <div className="overlay-right">
//           <h1>Hello, friend</h1>
//           <p>Enter your personal details and start a journey with us</p>
//           <button id="signUp">Sign Up</button>
//         </div>
//       </div>
//     </div>
//   </div>
// );
// };
