'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
// Removed usePathname to avoid layout router context requirement in root layout
import PrivacyPolicyModal from '../reusable/PrivacyPolicyModal';
import { Facebook, Twitter, Instagram, Linkedin, Phone, Mail, MapPin } from 'lucide-react';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  name: string;
  href: string;
  icon: string;
}

interface FooterProps {
  logo?: string;
  logoText?: string;
  description?: string;
  sections?: FooterSection[];
  socialLinks?: SocialLink[];
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  legalLinks?: FooterLink[];
  copyrightText?: string;
  className?: string;
}

export default function Footer({
  logo = '/images/Footer%20logo.png',
  logoText = '',
  description = 'Sell your home in days, not months. Get a competitive cash offer in 24 hours with no obligation.',
  sections = [
    {
      title: 'Buy',
      links: [
        { label: 'Browse Homes', href: '/browse' },
        { label: 'Featured Properties', href: '/browse?featured=true' },
        { label: 'New Listings', href: '/browse?sort=newest' },
      ]
    },
    {
      title: 'Sell',
      links: [
        { label: 'Get Cash Offer', href: '/sell/get-offer' },
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'Selling Process', href: '/sell' },
        { label: 'Seller FAQ', href: '/contact#faq' },
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/contact#contact-methods' },
        { label: 'Contact Support', href: '/contact#contact-form' },
        { label: 'Agent Portal', href: '/signin?type=agent' },
        { label: 'Terms of Service', href: '/terms' },
      ]
    }
  ],
  socialLinks = [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/profile.php?id=61578094495995',
      icon: 'facebook'
    },

    {
      name: 'Instagram',
      href: 'https://www.instagram.com/onlyifproperty/ ',
      icon: 'instagram'
    }
  ],
  contactInfo = {
    phone: '+61000000000',
    email: 'info@onlyif.com',
    address: '123 Main Street, Perth,Austarila'
  },
  legalLinks = [
    { label: 'Terms of Service', href: '/terms' }
  ],
  copyrightText = '© 2025 OnlyIf. All rights reserved.',
  className = ''
}: FooterProps) {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  // Derive pathname from window to avoid dependency on Next router context
  const [pathname, setPathname] = useState<string>('');
  const [hasFixedSidebar, setHasFixedSidebar] = useState(false);

  // Initialize pathname and detect presence of a fixed sidebar (e.g., admin layout) in the DOM
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setPathname(window.location.pathname);
    const adminSidebar = document.getElementById('admin-sidebar');
    const dashboardSidebar = document.getElementById('dashboard-sidebar');
    setHasFixedSidebar(!!adminSidebar || !!dashboardSidebar);
  }, []);

  const layoutOffsetClass = hasFixedSidebar ? 'lg:ml-64' : '';

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPrivacyModalOpen(true);
  };

  const renderSocialIcon = (iconName: string) => {
    switch (iconName) {
      case 'facebook':
        return (
          <Facebook color="#47C96F" strokeWidth={2} size={24} aria-hidden="true" />
        );
     
      case 'instagram':
        return (
          <Instagram color="#47C96F" strokeWidth={2} size={24} aria-hidden="true" />
        );
     
      default:
        return null;
    }
  };

  return (
    <>
      <footer className={`bg-gray-900 text-white ${layoutOffsetClass} ${className}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-12 sm:py-16 lg:py-20 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Company Info */}
              <div className="lg:col-span-2">
                <div className="flex items-center mb-6">
<img src={logo} alt="OnlyIf Logo" className="h-24 md:h-24 lg:h-24 xl:h-24 w-auto mr-3" />
                  {logoText && (
                    <span className="text-2xl font-bold text-white">{logoText}</span>
                  )}
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {description}
                </p>

                {/* Contact Info */}
                {contactInfo && (
                  <div className="space-y-3">
                    {contactInfo.phone && (
                      <div className="flex items-center text-gray-300">
                        <Phone className="mr-3" color="#47C96F" strokeWidth={2} size={24} aria-hidden="true" />
                        <a href={`tel:${contactInfo.phone}`} className="hover:text-white transition-colors">
                          {contactInfo.phone}
                        </a>
                      </div>
                    )}
                    
                    {contactInfo.email && (
                      <div className="flex items-center text-gray-300">
                        <Mail className="mr-3" color="#47C96F" strokeWidth={2} size={24} aria-hidden="true" />
                        <a href={`mailto:${contactInfo.email}`} className="hover:text-white transition-colors">
                          {contactInfo.email}
                        </a>
                      </div>
                    )}
                    
                    {contactInfo.address && (
                      <div className="flex items-start text-gray-300">
                        <MapPin className="mr-3 mt-0.5 flex-shrink-0" color="#47C96F" strokeWidth={2} size={24} aria-hidden="true" />
                        <span>{contactInfo.address}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Social Links */}
                {socialLinks && socialLinks.length > 0 && (
                  <div className="flex space-x-4 mt-6">
                    {socialLinks.map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                        aria-label={`Follow us on ${social.name}`}
                      >
                        {renderSocialIcon(social.icon)}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation Sections */}
              {sections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-gray-300 hover:text-white transition-colors duration-200"
                          target={link.external ? '_blank' : undefined}
                          rel={link.external ? 'noopener noreferrer' : undefined}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 pt-8 pb-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">{copyrightText}</p>
              <div className="flex flex-wrap gap-6">
                {legalLinks.map((link, index) => (
                  <div key={index}>
                    {link.label === 'Privacy Policy' ? (
                      <button
                        onClick={handlePrivacyClick}
                        className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                        {...(link.external && { target: '_blank', rel: 'noopener noreferrer' })}
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </>
  );
}
