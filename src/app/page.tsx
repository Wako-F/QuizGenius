"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import SignInWithGoogle from "@/components/SignInWithGoogle";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const testimonialRef = useRef(null);
  const testimonials = [
    {
      initial: "S",
      name: "Sarah Johnson",
      role: "Medical Student",
      text: "QuizGenius has revolutionized how I study for my medical exams. The AI-generated questions are incredibly relevant!",
      rating: 5,
      color: "indigo"
    },
    {
      initial: "M",
      name: "Mark Chen",
      role: "High School Teacher",
      text: "As a teacher, this tool saves me hours of quiz preparation time. My students love the interactive format!",
      rating: 5,
      color: "purple"
    },
    {
      initial: "L",
      name: "Lisa Patel",
      role: "Software Engineer",
      text: "Perfect for keeping my technical skills sharp. The adaptive difficulty ensures I'm always challenged.",
      rating: 5,
      color: "pink"
    },
    {
      initial: "D",
      name: "David Wilson",
      role: "Language Student",
      text: "The personalized quizzes have helped me master vocabulary and grammar much faster than traditional methods.",
      rating: 5,
      color: "blue"
    },
    {
      initial: "R",
      name: "Rachel Kim",
      role: "University Professor",
      text: "An excellent tool for creating engaging assessments. My students' performance has notably improved.",
      rating: 5,
      color: "emerald"
    }
  ];

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => {
        const next = Math.floor(prev) + 1;
        return next >= testimonials.length ? 0 : next;
      });
    }, 5000); // Show each testimonial for 5 seconds
    
    return () => clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevTestimonial();
      if (e.key === 'ArrowRight') nextTestimonial();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const nextTestimonial = () => {
    setIsTransitioning(true);
    setCurrentTestimonial((prev) => {
      const next = Math.floor(prev) + 1;
      return next >= testimonials.length ? 0 : next;
    });
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevTestimonial = () => {
    setIsTransitioning(true);
    setCurrentTestimonial((prev) => {
      const next = Math.floor(prev) - 1;
      return next < 0 ? testimonials.length - 1 : next;
    });
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToTestimonial = (index: number) => {
    setIsTransitioning(true);
    setCurrentTestimonial(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold relative overflow-hidden transition-all duration-300 group-hover:scale-110">
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <span className="relative z-10">Q</span>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              QuizGenius
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link 
                  href="/dashboard"
                  className="text-sm px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition transform hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="text-sm px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition transform hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20 flex items-center gap-2"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-4 h-4" />
                Sign in with Google
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-28 pb-16 md:pt-32 flex flex-col items-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,rgba(99,102,241,0)_100%)] opacity-50"></div>
        <div className="relative">
          <span className="inline-block px-4 py-2 rounded-full bg-indigo-900/50 text-indigo-200 text-sm font-medium mb-8 animate-bounce border border-indigo-700/50 hover:bg-indigo-800/50 transition-colors cursor-default">
            ✨ Join 100,000+ learners worldwide
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 leading-tight animate-gradient">
            Master Any Subject<br />with AI-Powered Quizzes
          </h1>
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-purple-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
        </div>
        <p className="mt-6 text-lg md:text-xl text-center text-gray-300 max-w-2xl">
          Generate personalized quizzes instantly using AI. Perfect for students, educators, 
          and lifelong learners. Start learning smarter today!
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {user ? (
            <Link 
              href="/create-quiz"
              className="group px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold hover:opacity-90 transition text-center shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:scale-105 transform duration-200 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <span className="relative z-10">Create Your First Quiz</span>
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none ml-2 relative z-10">
                →
              </span>
            </Link>
          ) : (
            <>
              <button
                onClick={signInWithGoogle}
                className="group px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold hover:opacity-90 transition text-center shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:scale-105 transform duration-200 relative overflow-hidden flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-5 h-5 mr-2" />
                <span className="relative z-10">Get Started with Google</span>
              </button>
              <button
                onClick={signInWithGoogle}
                className="group px-8 py-4 bg-gray-800 text-gray-300 rounded-full font-semibold hover:bg-gray-700 transition text-center border-2 border-gray-700 hover:border-gray-600 hover:scale-105 transform duration-200 flex items-center justify-center"
              >
                Try Demo Quiz
              </button>
            </>
          )}
        </div>
        <div className="mt-12 flex flex-wrap justify-center items-center gap-4 text-gray-400 text-sm">
          <span className="flex items-center bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700/50 hover:bg-gray-700/50 transition-colors cursor-default group">
            <svg className="w-5 h-5 text-yellow-500 mr-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            4.9/5 Rating
          </span>
          <span className="bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700/50 hover:bg-gray-700/50 transition-colors cursor-default">
            10K+ Active Users
          </span>
          <span className="bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700/50 hover:bg-gray-700/50 transition-colors cursor-default">
            100K+ Quizzes Created
          </span>
          <span className="bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700/50 hover:bg-gray-700/50 transition-colors cursor-default">
            24/7 Support
          </span>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
            Why Millions Choose QuizGenius
          </h2>
          <p className="text-gray-400">
            Our platform combines cutting-edge AI technology with proven learning methods to create
            the most effective study experience.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="group bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 border border-gray-700 hover:border-indigo-500/50 hover:bg-gray-800/80">
            <div className="w-12 h-12 bg-indigo-900/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-indigo-800/50">
              <span className="text-2xl group-hover:scale-110 transition-transform">🎯</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-indigo-400 transition-colors">AI-Powered Generation</h3>
            <p className="text-gray-400 leading-relaxed">
              Create custom quizzes instantly with our advanced AI technology, perfectly tailored to your learning goals.
            </p>
          </div>
          <div className="group bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 border border-gray-700 hover:border-purple-500/50 hover:bg-gray-800/80">
            <div className="w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-purple-800/50">
              <span className="text-2xl group-hover:scale-110 transition-transform">⚡</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-purple-400 transition-colors">Smart Difficulty Scaling</h3>
            <p className="text-gray-400 leading-relaxed">
              Adaptive difficulty levels that grow with you, from beginner-friendly to expert challenges.
            </p>
          </div>
          <div className="group bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 border border-gray-700 hover:border-pink-500/50 hover:bg-gray-800/80">
            <div className="w-12 h-12 bg-pink-900/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-pink-800/50">
              <span className="text-2xl group-hover:scale-110 transition-transform">🎓</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-pink-400 transition-colors">Learn from Mistakes</h3>
            <p className="text-gray-400 leading-relaxed">
              Detailed explanations and insights help you understand concepts better and improve faster.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-white">
          What Our Users Say
        </h2>
        <div 
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          ref={testimonialRef}
        >
          <div className="overflow-hidden rounded-2xl">
            <div 
              className="transition-all duration-500 ease-in-out flex"
              style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div 
                    className={`group bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-700 hover:border-${testimonial.color}-500/50 transition-all duration-300 hover:shadow-xl ${
                      isTransitioning ? 'opacity-0' : 'opacity-100'
                    } transition-opacity duration-500`}
                  >
                    <div className="flex items-center mb-6">
                      <div className={`w-16 h-16 bg-${testimonial.color}-900/50 rounded-full flex items-center justify-center text-${testimonial.color}-400 font-bold text-2xl group-hover:scale-110 transition-transform`}>
                        {testimonial.initial}
                      </div>
                      <div className="ml-4 flex-grow">
                        <h4 className={`font-semibold text-white group-hover:text-${testimonial.color}-400 transition-colors text-xl`}>
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-gray-400">{testimonial.role}</p>
                      </div>
                      <div className="flex items-center">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <svg 
                            key={i}
                            className="w-5 h-5 text-amber-400 transition-transform group-hover:scale-110 ml-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed italic">
                      "{testimonial.text}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button 
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 bg-gray-800/90 text-white p-4 rounded-full hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 hover:scale-110 group"
            aria-label="Previous testimonial"
          >
            <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 bg-gray-800/90 text-white p-4 rounded-full hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 hover:scale-110 group"
            aria-label="Next testimonial"
          >
            <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Progress Indicators */}
          <div className="flex justify-center mt-8 gap-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`group relative h-2 rounded-full transition-all duration-300 focus:outline-none ${
                  Math.floor(currentTestimonial) === index 
                    ? 'w-8 bg-indigo-500' 
                    : 'w-2 bg-gray-600 hover:bg-gray-500 hover:w-4'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              >
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {index + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Quiz CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-20 blur-3xl group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-3xl p-8 md:p-12 text-center border border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0)_100%)]"></div>
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                Experience the Future of Learning
              </h2>
              <p className="mb-8 text-gray-300 max-w-2xl mx-auto">
                Try our interactive demo quiz and see how AI adapts to your knowledge level in real-time.
                No sign-up required!
              </p>
              <Link
                href="/demo-quiz"
                className="group inline-flex items-center px-8 py-4 bg-indigo-500 text-white rounded-full font-semibold hover:bg-indigo-600 transition shadow-xl hover:shadow-2xl hover:scale-105 transform duration-200 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <span className="relative z-10">Start Demo Quiz</span>
                <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {/* Brand Section */}
            <div className="col-span-2 sm:col-span-2 md:col-span-1 mb-6 md:mb-0">
              <Link href="/" className="flex items-center gap-2 mb-4 group">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold relative overflow-hidden transition-all duration-300 group-hover:scale-110">
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <span className="relative z-10">Q</span>
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                  QuizGenius
                </span>
              </Link>
              <p className="text-gray-400 text-sm max-w-xs">
                Making learning smarter and more engaging with AI-powered quizzes.
              </p>
              {/* Social Links - Moved to top on mobile */}
              <div className="flex gap-4 mt-6">
                <Link href="#" className="text-gray-500 hover:text-indigo-400 transition-colors transform hover:scale-110">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-500 hover:text-indigo-400 transition-colors transform hover:scale-110">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-500 hover:text-indigo-400 transition-colors transform hover:scale-110">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Quick Links Sections */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Product</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/features" className="text-gray-400 hover:text-indigo-400 transition-colors hover:underline decoration-indigo-400/30">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-indigo-400 transition-colors hover:underline decoration-indigo-400/30">Pricing</Link></li>
                <li><Link href="/demo" className="text-gray-400 hover:text-indigo-400 transition-colors hover:underline decoration-indigo-400/30">Demo</Link></li>
                <li><Link href="/updates" className="text-gray-400 hover:text-indigo-400 transition-colors hover:underline decoration-indigo-400/30">Updates</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Company</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="text-gray-400 hover:text-indigo-400 transition-colors hover:underline decoration-indigo-400/30">About</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-indigo-400 transition-colors hover:underline decoration-indigo-400/30">Blog</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-indigo-400 transition-colors hover:underline decoration-indigo-400/30">Careers</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-indigo-400 transition-colors hover:underline decoration-indigo-400/30">Contact</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/privacy" className="text-gray-400 hover:text-indigo-400 transition-colors hover:underline decoration-indigo-400/30">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-indigo-400 transition-colors hover:underline decoration-indigo-400/30">Terms of Service</Link></li>
                <li><Link href="/cookies" className="text-gray-400 hover:text-indigo-400 transition-colors hover:underline decoration-indigo-400/30">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Copyright Section */}
          <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 text-center sm:text-left order-2 sm:order-1">
              © 2024 QuizGenius. All rights reserved.
            </p>
            <div className="flex items-center gap-4 order-1 sm:order-2">
              <Link href="/accessibility" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">
                Accessibility
              </Link>
              <span className="text-gray-700">•</span>
              <Link href="/sitemap" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
