import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Navbar: React.FC = () => {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-xl sm:text-2xl font-bold text-green-600 hover:text-green-700 transition-colors">
                            🍎 AI Nutrition
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {session ? (
                            <>
                                <Link href="/dashboard" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                                    Dashboard
                                </Link>
                                <Link href="/quiz" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                                    Quiz
                                </Link>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-600">
                                        Welcome, {session.user?.name || session.user?.email?.split('@')[0]}
                                    </span>
                                    <button
                                        onClick={() => signOut()}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors text-sm font-medium"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                                    Login
                                </Link>
                                <Link href="/auth/register" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors font-medium">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="text-gray-700 hover:text-green-600 focus:outline-none focus:text-green-600 transition-colors"
                            aria-label="Toggle menu"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200 mt-2">
                            {session ? (
                                <>
                                    <div className="px-3 py-2 text-sm text-gray-600 border-b border-gray-100 mb-2">
                                        Welcome, {session.user?.name || session.user?.email?.split('@')[0]}
                                    </div>
                                    <Link
                                        href="/dashboard"
                                        className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        📊 Dashboard
                                    </Link>
                                    <Link
                                        href="/quiz"
                                        className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        🎯 Quiz Challenge
                                    </Link>
                                    <button
                                        onClick={() => {
                                            signOut();
                                            setIsMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors"
                                    >
                                        🚪 Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/auth/login"
                                        className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        🔐 Login
                                    </Link>
                                    <Link
                                        href="/auth/register"
                                        className="block px-3 py-3 text-base font-medium bg-green-500 text-white hover:bg-green-600 rounded-md transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        ✨ Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;