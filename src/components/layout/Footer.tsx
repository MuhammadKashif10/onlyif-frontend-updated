'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
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
  description = 'List your home at the price you’d actually sell for. Only If lets you quietly test the market, connect with serious buyers, and only sell when the price is right.',
  sections = [
    {
      title: 'Buy',
      links: [
        { label: 'Browse Homes', href: '/buy' },
        { label: 'Featured Properties', href: '/buy?featured=true' },
        { label: 'New Listings', href: '/buy?sort=newest' },
      ]
    },
    {
      title: 'Sell',
      links: [
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
    phone: 'Phone',
    email: 'Email',
    address: 'Location in Victoria, Australia'
  },
  legalLinks = [
    { label: 'Terms of Service', href: '/terms' }
  ],
  copyrightText = '© 2025 OnlyIf. All rights reserved.',
  className = ''
}: FooterProps) {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const pathname = usePathname();
  const [fixedSidebarOffset, setFixedSidebarOffset] = useState(0);

  // Keep the global footer aligned with fixed dashboard sidebars.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let resizeObserver: ResizeObserver | undefined;

    const updateSidebarOffset = () => {
      const sidebar =
        document.getElementById('dashboard-sidebar') ||
        document.getElementById('admin-sidebar');

      if (!sidebar) {
        setFixedSidebarOffset(0);
        return;
      }

      setFixedSidebarOffset(sidebar.getBoundingClientRect().width);

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver?.disconnect();
        resizeObserver = new ResizeObserver(() => {
          setFixedSidebarOffset(sidebar.getBoundingClientRect().width);
        });
        resizeObserver.observe(sidebar);
      }
    };

    updateSidebarOffset();
    const animationFrame = window.requestAnimationFrame(updateSidebarOffset);
    window.addEventListener('resize', updateSidebarOffset);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', updateSidebarOffset);
      resizeObserver?.disconnect();
    };
  }, [pathname]);

  const footerStyle = {
    '--dashboard-footer-offset': `${fixedSidebarOffset}px`,
  } as CSSProperties;

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
      <footer
        className={`border-t border-[#cfe1d0] bg-[#dff1df] text-[#0b1d10] transition-[margin] lg:ml-[var(--dashboard-footer-offset)] ${className}`}
        style={footerStyle}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-12 sm:py-14 lg:py-16">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.65fr_1fr_1fr_1fr] lg:gap-16">
              {/* Company Info */}
              <div className="max-w-md">
                <div className="mb-5 flex items-center">
<img src={logo} alt="OnlyIf Logo" className="h-16 w-auto md:h-18 lg:h-20" />
                  {logoText && (
                    <span className="ml-3 text-2xl font-bold text-[#0b1d10]">{logoText}</span>
                  )}
                </div>
                
                <p className="mb-7 max-w-sm text-sm leading-6 text-[#4d6252]">
                  {description}
                </p>

                {/* Contact Info */}
                {contactInfo && (
                  <div className="grid gap-3 text-sm text-[#223a29]">
                    {contactInfo.phone && (
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#bfd8c2] bg-[#edfbea]">
                          <Phone color="#087735" strokeWidth={2} size={16} aria-hidden="true" />
                        </span>
                        <a href={`tel:${contactInfo.phone}`} className="font-medium hover:text-[#087735]">
                          {contactInfo.phone}
                        </a>
                      </div>
                    )}
                    
                    {contactInfo.email && (
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#bfd8c2] bg-[#edfbea]">
                          <Mail color="#087735" strokeWidth={2} size={16} aria-hidden="true" />
                        </span>
                        <a href={`mailto:${contactInfo.email}`} className="font-medium hover:text-[#087735]">
                          {contactInfo.email}
                        </a>
                      </div>
                    )}
                    
                    {contactInfo.address && (
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#bfd8c2] bg-[#edfbea]">
                          <MapPin color="#087735" strokeWidth={2} size={16} aria-hidden="true" />
                        </span>
                        <span className="pt-1 font-medium">{contactInfo.address}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Social Links */}
                {socialLinks && socialLinks.length > 0 && (
                  <div className="mt-7 flex gap-3">
                    {socialLinks.map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#bfd8c2] bg-[#edfbea] text-[#087735] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#087735] hover:bg-white"
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
                  <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#0b1d10]">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm font-medium text-[#4d6252] transition-colors duration-200 hover:text-[#087735]"
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
          <div className="border-t border-[#c8dec9] py-7">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <p className="text-sm text-[#5b6f60]">{copyrightText}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {legalLinks.map((link, index) => (
                  <div key={index}>
                    {link.label === 'Privacy Policy' ? (
                      <button
                        onClick={handlePrivacyClick}
                        className="cursor-pointer text-sm font-medium text-[#5b6f60] transition-colors hover:text-[#087735]"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm font-medium text-[#5b6f60] transition-colors hover:text-[#087735]"
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
