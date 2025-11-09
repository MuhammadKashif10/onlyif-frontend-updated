'use client';

import { useEffect, useState } from 'react';
import {
  Navbar,
  HeroSection,
  CTASection
  // Footer removed from import
} from '@/components';
import ContactForm from '@/components/ui/ContactForm';
import { DataService } from '@/utils/dataService';
import { Testimonial } from '@/types/api';

// Move metadata to a separate metadata.ts file or use Next.js head
export default function ContactPage() {
  // Remove unused testimonials state since it's not being used in the component
  // const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // Remove unused useEffect since testimonials are not being displayed
  // useEffect(() => {
  //   const fetchTestimonials = async () => {
  //     const data = await DataService.getFeaturedTestimonials(3);
  //     setTestimonials(data);
  //   };
  //   fetchTestimonials();
  // }, []);

  const contactMethods = [
    {
      name: 'Customer Support',
      description: 'Get help with your account or transactions',
      phone: '1-800-ONLYIF',
      email: 'support@onlyif.com',
      hours: 'Mon-Fri 9AM-6PM EST',
      icon: 'phone'
    },
    {
      name: 'Sales Team',
      description: 'Questions about buying or selling',
      phone: '1-800-ONLYIF',
      email: 'sales@onlyif.com',
      hours: 'Mon-Sun 8AM-8PM EST',
      icon: 'users'
    },
    {
      name: 'Technical Support',
      description: 'Help with our platform and tools',
      phone: '1-800-ONLYIF',
      email: 'tech@onlyif.com',
      hours: 'Mon-Fri 9AM-5PM EST',
      icon: 'settings'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection
        headline="Get in Touch"
        subheadline="We're here to help - Have questions? Need support? Our team is ready to assist you with all your real estate needs."
        backgroundImage="/images/contact.jpg"
        primaryCtaText="Call Us Now"
        primaryCtaHref="tel:1-800-ONLYIF"
        secondaryCtaText="Email Support"
        secondaryCtaHref="mailto:hello@onlyif.com.au"
      />

      
      {/* Contact Form */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Send Us a Message
            </h2>
            <p className="text-lg text-gray-600">
              Fill out the form below and we'll get back to you within 24 hours.
            </p>
          </div>
          
          <ContactForm />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Quick answers to common questions.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How quickly can I get a cash offer?
              </h3>
              <p className="text-gray-600">
                Most cash offers are provided within 24 hours of submitting your property information.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What areas do you serve?
              </h3>
              <p className="text-gray-600">
                We currently serve major metropolitan areas in Texas, with plans to expand to additional states.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Are there any fees for sellers?
              </h3>
              <p className="text-gray-600">
                Our fee structure is transparent and competitive. Contact us for detailed pricing information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Ready to Get Started?"
        subtitle="Let's make your real estate goals a reality"
        description="Whether you're buying or selling, our team is here to help you every step of the way."
        primaryCtaText="Get Your Cash Offer"
        primaryCtaHref="/sell/get-offer"
        secondaryCtaText="Browse Homes"
        secondaryCtaHref="/browse"
        backgroundGradient={true}
        variant="primary"
        alignment="center"
      />

      {/* Footer removed - now global */}
    </div>
  );
}
