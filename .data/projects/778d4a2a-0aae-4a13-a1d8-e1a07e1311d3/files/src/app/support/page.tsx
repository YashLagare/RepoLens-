import NavigationHeader from "@/components/NavigationHeader";

function SupportPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] selection:bg-blue-500/20 selection:text-blue-200">
            <NavigationHeader />
            <main className="relative pt-32 pb-24 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-12">
                        <h1 className="text-4xl font-semibold bg-gradient-to-r from-gray-100 to-gray-300 text-transparent bg-clip-text mb-4">
                            Support
                        </h1>
                        <p className="text-gray-400">Welcome to DevCanvas Support.</p>
                    </div>

                    <div className="space-y-8 text-gray-300">
                        <p>We're committed to providing a reliable and enjoyable experience for developers using our platform.</p>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Common Issues</h2>
                            
                            <div className="space-y-4">
                                <h3 className="text-xl font-medium text-gray-200">Account Problems</h3>
                                <p>If you're unable to sign in:</p>
                                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                    <li>Verify your login credentials</li>
                                    <li>Ensure your authentication provider account is active</li>
                                    <li>Try clearing your browser cache and cookies</li>
                                </ul>

                                <h3 className="text-xl font-medium text-gray-200">Snippet Issues</h3>
                                <p>If snippets are not loading correctly:</p>
                                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                    <li>Refresh the page</li>
                                    <li>Check your internet connection</li>
                                    <li>Try again after a few moments</li>
                                </ul>

                                <h3 className="text-xl font-medium text-gray-200">Subscription Issues</h3>
                                <p>For subscription-related concerns:</p>
                                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                    <li>Verify your payment status</li>
                                    <li>Allow a few minutes for subscription updates to process</li>
                                    <li>Contact support if premium features are not activated</li>
                                </ul>

                                <h3 className="text-xl font-medium text-gray-200">Technical Issues</h3>
                                <p>When reporting a bug, please include:</p>
                                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                    <li>Browser name and version</li>
                                    <li>Operating system</li>
                                    <li>Steps to reproduce the issue</li>
                                    <li>Screenshots or screen recordings (if available)</li>
                                </ul>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Feature Requests</h2>
                            <p>We welcome suggestions and feedback that help improve DevCanvas. Share your ideas and feature requests through our support email.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Response Time</h2>
                            <p>We aim to respond to support requests within 24–48 business hours.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-medium text-white">Contact Support</h2>
                            <p>For technical assistance, account issues, subscription inquiries, bug reports, or general questions:</p>
                            <p><strong>Email:</strong> <a href="mailto:yashlagare77@gmail.com" className="text-blue-400 hover:text-blue-300">yashlagare77@gmail.com</a></p>
                            <p className="pt-2">Please provide as much detail as possible so we can assist you efficiently.</p>
                            <p>Thank you for using DevCanvas.</p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default SupportPage;
