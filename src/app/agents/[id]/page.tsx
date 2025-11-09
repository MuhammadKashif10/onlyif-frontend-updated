'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components';
import { agentsApi } from '@/api';
import { getSafeImageUrl } from '@/utils/imageUtils';

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  title: string;
  office: string;
  rating: string;
  reviews: number;
  experience: string;
  specializations: string[];
  languages: string[];
  description: string;
  stats: {
    assignedProperties: number;
    completedInspections: number;
    soldProperties: number;
    experience: number;
    rating: number;
    reviews: number;
  };
}

export default function AgentDetailPage() {
  const params = useParams();
  const agentId = params.id as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await agentsApi.getAgentById(agentId);
        const agentData = response.data;
        
        // Process agent data to match our interface
        const processedAgent: Agent = {
          id: agentData._id || agentData.id,
          name: agentData.name || 'Unknown Agent',
          email: agentData.email || 'contact@example.com',
          phone: agentData.phone || '(555) 000-0000',
          avatar: agentData.profileImage || agentData.avatar || null,
          title: agentData.agentProfile?.brokerage || 'Real Estate Agent',
          office: agentData.agentProfile?.brokerage || 'Independent',
          rating: agentData.stats?.rating ? agentData.stats.rating.toFixed(1) : '4.5',
          reviews: agentData.stats?.reviews || 0,
          experience: `${agentData.stats?.experience || agentData.agentProfile?.yearsOfExperience || 0} years`,
          specializations: agentData.agentProfile?.specializations || [],
          languages: agentData.agentProfile?.languages || [],
          description: agentData.agentProfile?.bio || '',
          stats: agentData.stats || {
            assignedProperties: 0,
            completedInspections: 0,
            soldProperties: 0,
            experience: 0,
            rating: 4.5,
            reviews: 0
          }
        };
        
        setAgent(processedAgent);
      } catch (error) {
        console.error('Error fetching agent:', error);
        setError('Failed to load agent details');
      } finally {
        setLoading(false);
      }
    };

    if (agentId) {
      fetchAgent();
    }
  }, [agentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Agent Not Found</h1>
          <p className="text-gray-600 mb-8">The agent you're looking for doesn't exist or has been removed.</p>
          <a 
            href="/agents" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Agents
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><a href="/agents" className="hover:text-blue-600">Agents</a></li>
            <li>/</li>
            <li className="text-gray-900">{agent.name}</li>
          </ol>
        </nav>

        {/* Agent Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Agent Image */}
            <div className="flex-shrink-0">
              <img
                src={getSafeImageUrl(agent.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMiAxNEM5LjMzIDEzLjk5IDcuMDEgMTUuNjIgNiAxOEMxMC4wMSAyMCAxMy45OSAyMCAxOCAxOEMxNi45OSAxNS42MiAxNC42NyAxMy45OSAxMiAxNFoiIGZpbGw9IiM5QjlCQTAiLz4KPC9zdmc+Cjwvc3ZnPgo=', 'agent')}
                alt={agent.name}
                className="w-32 h-32 rounded-full object-cover ring-4 ring-gray-100"
              />
            </div>

            {/* Agent Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{agent.name}</h1>
              <p className="text-xl text-gray-600 mb-4">{agent.title}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Experience</h3>
                  <p className="text-lg text-gray-900">{agent.experience}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Office</h3>
                  <p className="text-lg text-gray-900">{agent.office}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Rating</h3>
                  <p className="text-lg text-gray-900">{agent.rating} ({agent.reviews} reviews)</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Properties Sold</h3>
                  <p className="text-lg text-gray-900">{agent.stats.soldProperties}</p>
                </div>
              </div>

              {/* Contact Button */}
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Contact Agent
              </button>
            </div>
          </div>
        </div>

        {/* Agent Description */}
        {agent.description && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About {agent.name}</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {agent.description}
              </p>
            </div>
          </div>
        )}

        {/* Agent Stats */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{agent.stats.assignedProperties}</div>
              <div className="text-sm text-gray-500">Active Listings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{agent.stats.completedInspections}</div>
              <div className="text-sm text-gray-500">Inspections Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{agent.stats.soldProperties}</div>
              <div className="text-sm text-gray-500">Properties Sold</div>
            </div>
          </div>
        </div>

        {/* Specializations */}
        {agent.specializations.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Specializations</h2>
            <div className="flex flex-wrap gap-2">
              {agent.specializations.map((spec, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {agent.languages.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Languages</h2>
            <div className="flex flex-wrap gap-2">
              {agent.languages.map((language, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
