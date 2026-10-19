import NavigationHeader from "@/components/NavigationHeader";

function TermsPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] selection:bg-blue-500/20 selection:text-blue-200">
            <NavigationHeader />
            <main className="relative pt-32 pb-24 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-12">
                        <h1 className="text-4xl font-semibold bg-gradient-to-r from-gray-100 to-gray-300 text-transparent bg-clip-text mb-4">
                            Terms of Service
                        </h1>
                        <p className="text-gray-400">Last Updated: June 2026</p>
                    </div>

                    <div className="space-y-8 text-gray-300">
                        <p>
                            Welcome to DevCanvas. By accessing or using our platform, you agree to these Terms of Service.
                        </p>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Acceptance of Terms</h2>
                            <p>By using DevCanvas, you agree to comply with these Terms and all applicable laws and regulations.</p>
                            <p>If you do not agree with these Terms, you may not use the platform.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">User Accounts</h2>
                            <p>To access certain features, you may be required to create an account.</p>
                            <p>You are responsible for:</p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                <li>Maintaining account security</li>
                                <li>Protecting your login credentials</li>
                                <li>All activities that occur under your account</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">User Content</h2>
                            <p>You retain ownership of the code snippets, comments, and other content you submit.</p>
                            <p>By publishing content on DevCanvas, you grant DevCanvas a non-exclusive license to store, display, and distribute that content solely for operating and improving the platform.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Prohibited Activities</h2>
                            <p>Users may not:</p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                <li>Upload malicious code intended to harm others</li>
                                <li>Violate intellectual property rights</li>
                                <li>Harass, abuse, or threaten other users</li>
                                <li>Attempt unauthorized access to systems or data</li>
                                <li>Distribute spam or misleading content</li>
                                <li>Use the platform for illegal activities</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Content Moderation</h2>
                            <p>We reserve the right to remove content that:</p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                <li>Violates these Terms</li>
                                <li>Creates security risks</li>
                                <li>Infringes intellectual property rights</li>
                                <li>Is unlawful, harmful, or abusive</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Subscription Services</h2>
                            <p>Certain features may require a paid subscription.</p>
                            <p>Subscription benefits, pricing, and availability may change at any time.</p>
                            <p>Failure to maintain an active subscription may result in restricted access to premium features.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Intellectual Property</h2>
                            <p>The DevCanvas platform, branding, design, software, and related materials are protected by applicable intellectual property laws.</p>
                            <p>Users may not copy, modify, reverse engineer, or redistribute platform components without permission.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Disclaimer of Warranties</h2>
                            <p>DevCanvas is provided on an "as is" and "as available" basis.</p>
                            <p>We make no guarantees regarding:</p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                <li>Availability</li>
                                <li>Accuracy</li>
                                <li>Reliability</li>
                                <li>Security</li>
                                <li>Error-free operation</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Limitation of Liability</h2>
                            <p>To the fullest extent permitted by law, DevCanvas shall not be liable for any indirect, incidental, consequential, special, or punitive damages arising from the use of the platform.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Termination</h2>
                            <p>We may suspend or terminate user accounts that violate these Terms or engage in activities that may harm the platform or its users.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Changes to Terms</h2>
                            <p>We may update these Terms periodically. Continued use of DevCanvas after changes become effective constitutes acceptance of the revised Terms.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Contact Us</h2>
                            <p>For questions regarding these Terms, please contact:</p>
                            <p><strong>Email:</strong> <a href="mailto:yashlagare77@gmail.com" className="text-blue-400 hover:text-blue-300">yashlagare77@gmail.com</a></p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default TermsPage;
