'use client';

import { useEffect, useState } from 'react';
import { Navbar, AgentCardSkeleton, LoadingError } from '@/components';
import { agentsApi } from '@/api';
import { getSafeImageUrl } from '@/utils/imageUtils';
import HeroSection from '@/components/sections/HeroSection';

// Mock data as fallback when API fails
const mockAgents = [
  {
    id: 'mock-1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    avatar: null, // Changed from '/images/default-avatar.jpg'
    title: 'Senior Real Estate Agent',
    office: 'Premium Realty',
    rating: '4.8',
    reviews: 127,
    experience: '8 years',
    specializations: ['Residential', 'Commercial'],
    languages: ['English', 'Spanish']
  },
  {
    id: 'mock-2',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '(555) 987-6543',
    avatar: null, // Changed from '/images/default-avatar.jpg'
    title: 'Luxury Property Specialist',
    office: 'Elite Properties',
    rating: '4.9',
    reviews: 89,
    experience: '6 years',
    specializations: ['Luxury Homes', 'Investment'],
    languages: ['English']
  },
  {
    id: 'mock-3',
    name: 'Michael Johnson',
    email: 'michael.johnson@example.com',
    phone: '(555) 456-7890',
    avatar: null, // Changed from '/images/default-avatar.jpg'
    title: 'First-Time Buyer Specialist',
    office: 'Community Realty',
    rating: '4.7',
    reviews: 156,
    experience: '5 years',
    specializations: ['First-Time Buyers', 'Condos'],
    languages: ['English', 'French']
  }
];

const mockStats = {
  totalAgents: 150,
  totalPropertiesSold: 2847,
  averageRating: 4.8
};

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [topAgents, setTopAgents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setUsingMockData(false);
        
        console.log('🚀 Starting API calls...');
        
        // Try to fetch real data with timeout
        const fetchWithTimeout = (promise, timeout = 10000) => {
          return Promise.race([
            promise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), timeout)
            )
          ]);
        };
        
        const [agentsData, topAgentsData, statsData] = await Promise.allSettled([
          fetchWithTimeout(agentsApi.getAgents()),
          fetchWithTimeout(agentsApi.getTopAgents(3)),
          fetchWithTimeout(agentsApi.getGeneralStats())
        ]);
        
        console.log('📊 API Results:', { agentsData, topAgentsData, statsData });
        
        // Check if any API calls failed
        const hasApiErrors = [
          agentsData.status === 'rejected',
          topAgentsData.status === 'rejected', 
          statsData.status === 'rejected'
        ].some(failed => failed);
        
        if (hasApiErrors) {
          console.warn('⚠️ Some API calls failed, using mock data as fallback');
          throw new Error('API calls failed, using fallback data');
        }
        
        // Process successful API responses
        const processedAgents = processAgentsData(
          agentsData.status === 'fulfilled' ? agentsData.value : null
        );
        const processedTopAgents = processAgentsData(
          topAgentsData.status === 'fulfilled' ? topAgentsData.value : null
        );
        const processedStats = processStatsData(
          statsData.status === 'fulfilled' ? statsData.value : null
        );
        
        setAgents(processedAgents);
        setTopAgents(processedTopAgents.slice(0, 3)); // Ensure only 3 top agents
        setStats(processedStats);
        
        console.log('✅ Successfully loaded real data');
        
      } catch (error) {
        console.error('❌ Error fetching data, falling back to mock data:', error);
        
        // Use mock data as fallback
        setAgents(mockAgents);
        setTopAgents(mockAgents.slice(0, 3));
        setStats(mockStats);
        setUsingMockData(true);
        
        // Set a user-friendly error message
        setError('Using demo data. Please ensure the backend server is running on port 5000.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  // Helper function to process agents data
  const processAgentsData = (data) => {
    if (!data) return [];
    
    // Handle different response structures
    let agentsArray = [];
    if (Array.isArray(data)) {
      agentsArray = data;
    } else if (data?.data && Array.isArray(data.data)) {
      agentsArray = data.data;
    } else if (data?.agents && Array.isArray(data.agents)) {
      agentsArray = data.agents;
    }
    
    return agentsArray.map(agent => ({
      id: agent?._id || agent?.id || Math.random().toString(),
      name: agent?.name || 'Unknown Agent',
      email: agent?.email || 'contact@example.com',
      phone: agent?.agentProfile?.phone || agent?.phone || '(555) 000-0000',
      avatar: agent?.profileImage || agent?.avatar || null, // Prefer saved profileImage path
      title: agent?.agentProfile?.brokerage || agent?.title || 'Real Estate Agent',
      office: agent?.agentProfile?.brokerage || agent?.office || 'Independent',
      rating: agent?.stats?.rating ? agent.stats.rating.toFixed(1) : '4.5',
      reviews: agent?.stats?.reviews || 0,
      experience: `${agent?.stats?.experience || agent?.agentProfile?.yearsOfExperience || 0} years`,
      specializations: agent?.agentProfile?.specializations || [],
      languages: agent?.agentProfile?.languages || [],
      description: agent?.agentProfile?.bio || ''
    }));
  };

  // Helper function to process stats data
  const processStatsData = (data) => {
    if (!data) return mockStats;
    
    return {
      totalAgents: data?.totalAgents || data?.agents || 0,
      totalPropertiesSold: data?.totalPropertiesSold || data?.propertiesSold || 0,
      averageRating: data?.averageRating || data?.rating || 4.5
    };
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                {/* Name Bar Skeleton */}
                <div className="bg-gray-200 px-4 py-3 rounded-t-xl">
                  <div className="h-6 bg-gray-300 rounded animate-pulse"></div>
                </div>
                
                {/* Image Skeleton */}
                <div className="flex justify-center py-6">
                  <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse"></div>
                </div>
                
                {/* Agent Info Skeleton */}
                <div className="px-4 pb-4">
                  <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Show warning if using mock data */}
      {usingMockData && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Demo Mode:</strong> Displaying sample data. Backend server may not be running.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <HeroSection
        backgroundImage="/images/04.jpg"
        headline="Find Your Perfect Real Estate Agent"
        subheadline="Connect with experienced professionals in your area"
        primaryCtaText="Browse Agents"
        primaryCtaHref="#agents-list"
        secondaryCtaText="Learn More"
        secondaryCtaHref="#about-agents"
      />

    
      {/* Top Agents Section */}
      {topAgents.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Top Performing Agents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topAgents.map((agent) => (
                <a
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-teal-200 hover:-translate-y-1 block"
                >
                  {/* Name Bar */}
                  <div className="px-4 py-3 rounded-t-xl" style={{backgroundColor: '#14b8a6'}}>
                    <h3 className="text-white font-bold text-center text-lg">{agent.name || 'Agent Name'}</h3>
                  </div>
                  
                  {/* Agent Image */}
                  <div className="flex justify-center py-6">
                    <img
                      src={getSafeImageUrl(agent.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMiAxNEM5LjMzIDEzLjk5IDcuMDEgMTUuNjIgNiAxOEMxMC4wMSAyMCAxMy45OSAyMCAxOCAxOEMxNi45OSAxNS42MiAxNC42NyAxMy45OSAxMiAxNFoiIGZpbGw9IiM5QjlCQTAiLz4KPC9zdmc+Cjwvc3ZnPgo=', 'agent')}
                      alt={agent.name}
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-teal-200 transition-all duration-300"
                    />
                  </div>
                  
                  {/* Agent Info */}
                  <div className="px-4 pb-4">
                    <p className="text-xs text-gray-500 text-center">{agent.title}</p>
                    {agent.description && (
                      <p className="text-xs text-gray-400 text-center mt-2 line-clamp-2">
                        {agent.description.length > 100 
                          ? `${agent.description.substring(0, 100)}...` 
                          : agent.description}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Agents Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">OnlyIf Agents</h2>
          {agents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No agents available at the moment.</p>
              <button 
                onClick={handleRetry}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {agents.map((agent) => {
                console.log('Agent data:', agent);
                return (
                  <a
                    key={agent.id}
                    href={`/agents/${agent.id}`}
                    className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-teal-200 hover:-translate-y-1 block"
                  >
                    {/* Name Bar */}
                    <div className="px-4 py-3 rounded-t-xl" style={{backgroundColor: '#14b8a6'}}>
                      <h3 className="text-white font-bold text-center text-lg">{agent.name || 'Agent Name'}</h3>
                    </div>
                    
                    {/* Agent Image */}
                    <div className="flex justify-center py-6">
                      <img
                        src={getSafeImageUrl(agent.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMiAxNEM5LjMzIDEzLjk5IDcuMDEgMTUuNjIgNiAxOEMxMC4wMSAyMCAxMy45OSAyMCAxOCAxOEMxNi45OSAxNS42MiAxNC42NyAxMy45OSAxMiAxNFoiIGZpbGw9IiM5QjlCQTAiLz4KPC9zdmc+Cjwvc3ZnPgo=', 'agent')}
                        alt={agent.name}
                        className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-teal-200 transition-all duration-300"
                      />
                    </div>
                    
                    {/* Agent Info */}
                    <div className="px-4 pb-4">
                      <p className="text-xs text-gray-500 text-center">{agent.title}</p>
                      {agent.description && (
                        <p className="text-xs text-gray-400 text-center mt-2 line-clamp-2">
                          {agent.description.length > 100 
                            ? `${agent.description.substring(0, 100)}...` 
                            : agent.description}
                        </p>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}