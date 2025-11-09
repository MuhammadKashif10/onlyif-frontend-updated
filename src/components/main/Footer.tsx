import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-4">OnlyIf</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your trusted partner in real estate. We make buying and selling homes simple, fast, and stress-free.
            </p>
            
            {/* Social Icons */}
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=61578094495995" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook color="#47C96F" strokeWidth={2} size={24} aria-hidden="true" />
              </a>
             
              <a href="https://www.instagram.com/onlyifproperty/ " className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram color="#47C96F" strokeWidth={2} size={24} aria-hidden="true" />
              </a>
             
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/browse" className="text-gray-300 hover:text-white transition-colors">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link href="/sell" className="text-gray-300 hover:text-white transition-colors">
                  Sell Your Home
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-300 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/agents" className="text-gray-300 hover:text-white transition-colors">
                  Our Agents
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-300 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-3">
              <li className="text-gray-300">Buy Properties</li>
              <li className="text-gray-300">Sell Properties</li>
              <li className="text-gray-300">Cash Offers</li>
              <li className="text-gray-300">Property Management</li>
              <li className="text-gray-300">Home Inspections</li>
              <li className="text-gray-300">Title Services</li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact & Legal</h4>
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              <p>&copy; {currentYear} OnlyIf. All rights reserved.</p>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
              <Link href="/accessibility" className="text-gray-400 hover:text-white transition-colors">
                Accessibility
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
              <p className="text-base text-gray-400">
                © 2025 OnlyIf. All rights reserved.
              </p>
              <div className="mt-4 md:mt-0 flex space-x-6">
                <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}