import NavigationHeader from "@/components/NavigationHeader";

function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] selection:bg-blue-500/20 selection:text-blue-200">
            <NavigationHeader />
            <main className="relative pt-32 pb-24 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-12">
                        <h1 className="text-4xl font-semibold bg-gradient-to-r from-gray-100 to-gray-300 text-transparent bg-clip-text mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-gray-400">Last Updated: June 2026</p>
                    </div>

                    <div className="space-y-8 text-gray-300">
                        <p>
                            Welcome to DevCanvas. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our platform.
                        </p>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Information We Collect</h2>
                            
                            <div className="space-y-4">
                                <h3 className="text-xl font-medium text-gray-200">Account Information</h3>
                                <p>When you create an account through our authentication provider, we may collect:</p>
                                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                    <li>Name</li>
                                    <li>Email address</li>
                                    <li>User identifier</li>
                                    <li>Profile information provided by the authentication service</li>
                                </ul>

                                <h3 className="text-xl font-medium text-gray-200">Content You Create</h3>
                                <p>When using DevCanvas, we may store:</p>
                                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                    <li>Code snippets</li>
                                    <li>Comments</li>
                                    <li>Starred snippets</li>
                                    <li>Code execution history</li>
                                    <li>Subscription information</li>
                                </ul>

                                <h3 className="text-xl font-medium text-gray-200">Technical Information</h3>
                                <p>We may automatically collect:</p>
                                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                    <li>Browser type</li>
                                    <li>Device information</li>
                                    <li>IP address</li>
                                    <li>Usage analytics</li>
                                    <li>Error logs</li>
                                </ul>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">How We Use Your Information</h2>
                            <p>We use your information to:</p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                <li>Provide and maintain the platform</li>
                                <li>Authenticate users</li>
                                <li>Display your snippets and comments</li>
                                <li>Process subscriptions and upgrades</li>
                                <li>Improve platform performance</li>
                                <li>Prevent abuse and unauthorized access</li>
                                <li>Respond to support requests</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Sharing of Information</h2>
                            <p>We do not sell your personal information.</p>
                            <p>Information may be shared with trusted service providers used to operate DevCanvas, including:</p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                <li>Authentication providers</li>
                                <li>Payment processors</li>
                                <li>Hosting and infrastructure providers</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Public Content</h2>
                            <p>Code snippets, usernames, and comments that you choose to publish may be visible to other users of the platform.</p>
                            <p>Please do not publish confidential information, passwords, API keys, or sensitive personal data.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Data Security</h2>
                            <p>We implement reasonable technical and organizational measures to protect your information. However, no internet-based service can guarantee absolute security.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Subscription Information</h2>
                            <p>Subscription purchases are processed through third-party payment providers. We do not store your payment card information on our servers.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Your Rights</h2>
                            <p>Depending on your jurisdiction, you may have rights to:</p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                <li>Access your data</li>
                                <li>Correct inaccurate information</li>
                                <li>Request deletion of your account data</li>
                                <li>Object to certain processing activities</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Data Retention</h2>
                            <p>We retain user information only as long as necessary to provide services, comply with legal obligations, and resolve disputes.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Children's Privacy</h2>
                            <p>DevCanvas is not intended for children under 13 years of age. We do not knowingly collect information from children.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Changes to This Policy</h2>
                            <p>We may update this Privacy Policy from time to time. Continued use of the platform after updates constitutes acceptance of the revised policy.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Contact Us</h2>
                            <p>For privacy-related questions, concerns, or data requests, please contact:</p>
                            <p><strong>Email:</strong> <a href="mailto:yashlagare77@gmail.com" className="text-blue-400 hover:text-blue-300">yashlagare77@gmail.com</a></p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default PrivacyPage;
