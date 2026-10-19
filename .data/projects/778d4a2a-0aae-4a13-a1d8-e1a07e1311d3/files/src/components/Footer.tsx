import Image from "next/image";
import Link from "next/link";

function Footer() {
    return (
        <footer className="relative border-t border-gray-800/50 mt-auto">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-gray-900 to-transparent" />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Image src="/logo.png" alt="DevCanvas Logo" width={20} height={20} />

                        <span>© {new Date().getFullYear()} DevCanvas</span>

                        <a
                            href="https://github.com/yashlagare"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Visit Yash Lagare GitHub Profile"
                            className="hover:text-gray-300 transition-colors"
                        >
                            • Built by Yash Lagare
                        </a>
                    </div>
                    {/* <div className="flex items-center gap-2 text-gray-400">
                        <Image src="/logo.png" alt="DevCanvas Logo" width={20} height={20} />
                        <span>
                            © {new Date().getFullYear()} DevCanvas 
                            <a
                                href="https://github.com/yashlagare"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Visit Yash Lagare GitHub Profile"
                                className="text-gray-400 hover:text-gray-300 transition-colors"
                            >
                                Built by Yash Lagare
                            </a> 
                        </span>
                    </div> */}
                    <div className="flex items-center gap-6">
                        <Link href="/support" className="text-gray-400 hover:text-gray-300 transition-colors">
                            Support
                        </Link>
                        <Link href="/privacy" className="text-gray-400 hover:text-gray-300 transition-colors">
                            Privacy
                        </Link>
                        <Link href="/terms" className="text-gray-400 hover:text-gray-300 transition-colors">
                            Terms
                        </Link>
                        <a
                            href="https://portfolio-five-opal-53.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Visit Yash Lagare Portfolio"
                            className="text-gray-400 hover:text-gray-300 transition-colors"
                        >
                            Portfolio
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
export default Footer;