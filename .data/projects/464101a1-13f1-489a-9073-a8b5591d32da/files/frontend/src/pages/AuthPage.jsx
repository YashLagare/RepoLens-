import { SignInButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { useState } from "react";
import "../styles/auth.css";

const AuthPage = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    return (
        <div className="auth-container">
            {/* Left Section - Enhanced Content */}
            <div className="auth-left">
                <div className="auth-hero">
                    {/* Enhanced Brand Section */}
                    <motion.div
                        className="brand-container"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <div className="logo-wrapper">
                            <img
                                src="/logo.png"
                                alt="Connectify Logo"
                                className="brand-logo"
                                width="48"
                                height="48"
                            />
                        </div>
                        <div className="brand-text">
                            <span className="brand-name">Connectify</span>
                            <span className="brand-tagline">Enterprise Communication</span>
                        </div>
                    </motion.div>

                    {/* Enhanced Hero Title with Animation */}
                    <motion.h1
                        className="hero-title"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Where Work
                        <span className="gradient-text"> Happens</span>
                        <span className="sparkle-icon" role="img" aria-label="sparkle">✨</span>
                    </motion.h1>

                    {/* Enhanced Subtitle with Better Typography */}
                    <motion.p
                        className="hero-subtitle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        Connect with your team instantly through secure, real-time messaging.
                        <span className="highlight-text"> Experience seamless collaboration</span> with
                        powerful features designed for modern teams.
                    </motion.p>

                    {/* Enhanced Features List with Icons */}
                    <motion.div
                        className="features-list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        <div className="feature-item">
                            <div className="feature-icon-container">
                                <svg className="feature-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="feature-text">
                                <span className="feature-title">Real-time Messaging</span>
                                <span className="feature-description">Instant communication with your team</span>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon-container">
                                <svg className="feature-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M23 7l-7 5 7 5V7z" stroke="currentColor" strokeWidth="2"
                                        strokeLinecap="round" strokeLinejoin="round" />
                                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"
                                        stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>
                            <div className="feature-text">
                                <span className="feature-title">Video Calls & Meetings</span>
                                <span className="feature-description">Face-to-face collaboration anywhere</span>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon-container">
                                <svg className="feature-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"
                                        stroke="currentColor" strokeWidth="2" />
                                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>
                            <div className="feature-text">
                                <span className="feature-title">Secure & Private</span>
                                <span className="feature-description">Enterprise-grade security built-in</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Enhanced CTA Section */}
                    <motion.div
                        className="cta-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                    >
                        <SignInButton mode="modal">
                            <button
                                className="cta-button"
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                aria-label="Get started with Connectify"
                            >
                                <span className="cta-text">Get Started Free</span>
                                <motion.span
                                    className="button-arrow"
                                    animate={{ x: isHovered ? 5 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor"
                                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </motion.span>
                                <div className="button-shine"></div>
                            </button>
                        </SignInButton>

                        <p className="cta-footer">
                            <span className="users-count">10,000+</span> teams already connected
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Section - Enhanced Image Display */}
            <div className="auth-right">
                <div className="auth-image-container">
                    {!isImageLoaded && (
                        <div className="image-skeleton" aria-hidden="true">
                            <div className="skeleton-shimmer"></div>
                        </div>
                    )}
                    <img
                        src="/auth-i.png"
                        alt="Modern team collaboration interface showing real-time messaging and video features"
                        className={`auth-image ${isImageLoaded ? 'loaded' : ''}`}
                        onLoad={() => setIsImageLoaded(true)}
                        loading="eager"
                    />
                    <div className="image-overlay" aria-hidden="true">
                        <div className="overlay-pattern"></div>
                        <div className="overlay-gradient"></div>
                    </div>

                    {/* Floating Stats Cards */}
                    <div className="floating-stats">
                        <div className="stat-card">
                            <span className="stat-number">99.9%</span>
                            <span className="stat-label">Uptime</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">256-bit</span>
                            <span className="stat-label">Encryption</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;