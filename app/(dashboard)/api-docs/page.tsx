'use client';

import { useState } from 'react';
import { 
  Code, 
  Copy, 
  ExternalLink, 
  Globe, 
  Key, 
  Lock, 
  Play, 
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function APIDocsPage() {
  const [activeEndpoint, setActiveEndpoint] = useState('issues');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const endpoints = {
    issues: {
      title: 'Issues API',
      description: 'Manage civic issues and reports',
      baseUrl: '/api/v1/issues',
      methods: [
        {
          method: 'GET',
          path: '/api/v1/issues',
          description: 'Get all issues with optional filtering',
          parameters: [
            { name: 'status', type: 'string', required: false, description: 'Filter by status (pending, in_progress, resolved, closed)' },
            { name: 'category', type: 'string', required: false, description: 'Filter by category' },
            { name: 'priority', type: 'string', required: false, description: 'Filter by priority (low, medium, high, urgent)' },
            { name: 'page', type: 'number', required: false, description: 'Page number for pagination' },
            { name: 'limit', type: 'number', required: false, description: 'Number of items per page' }
          ],
          example: {
            request: `GET /api/v1/issues?status=pending&category=infrastructure&page=1&limit=20
Authorization: Bearer YOUR_API_KEY`,
            response: `{
  "data": [
    {
      "id": "uuid",
      "title": "Broken Street Light",
      "description": "Street light on Main Street is not working",
      "category": "infrastructure",
      "priority": "medium",
      "status": "pending",
      "location": {
        "latitude": 15.4989,
        "longitude": 73.8278
      },
      "address": "Main Street, Panaji, Goa",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}`
          }
        },
        {
          method: 'POST',
          path: '/api/v1/issues',
          description: 'Create a new issue',
          parameters: [
            { name: 'title', type: 'string', required: true, description: 'Issue title' },
            { name: 'description', type: 'string', required: true, description: 'Detailed description' },
            { name: 'category', type: 'string', required: true, description: 'Issue category' },
            { name: 'priority', type: 'string', required: false, description: 'Priority level' },
            { name: 'location', type: 'object', required: true, description: 'Geographic location' },
            { name: 'address', type: 'string', required: true, description: 'Human-readable address' },
            { name: 'media_urls', type: 'array', required: false, description: 'Array of media file URLs' }
          ],
          example: {
            request: `POST /api/v1/issues
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "title": "Pothole on Highway",
  "description": "Large pothole causing traffic issues",
  "category": "infrastructure",
  "priority": "high",
  "location": {
    "latitude": 15.5000,
    "longitude": 73.8300
  },
  "address": "NH66, Near Panaji, Goa",
  "media_urls": ["https://example.com/image1.jpg"]
}`,
            response: `{
  "data": {
    "id": "uuid",
    "title": "Pothole on Highway",
    "description": "Large pothole causing traffic issues",
    "category": "infrastructure",
    "priority": "high",
    "status": "pending",
    "location": {
      "latitude": 15.5000,
      "longitude": 73.8300
    },
    "address": "NH66, Near Panaji, Goa",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}`
          }
        }
      ]
    },
    analytics: {
      title: 'Analytics API',
      description: 'Access analytics and reporting data',
      baseUrl: '/api/v1/analytics',
      methods: [
        {
          method: 'GET',
          path: '/api/v1/analytics/overview',
          description: 'Get overview statistics',
          parameters: [],
          example: {
            request: `GET /api/v1/analytics/overview
Authorization: Bearer YOUR_API_KEY`,
            response: `{
  "data": {
    "total_issues": 1247,
    "resolved_issues": 892,
    "pending_issues": 203,
    "in_progress_issues": 152,
    "average_resolution_time": 5.2,
    "citizen_satisfaction": 4.2
  }
}`
          }
        }
      ]
    },
    ai: {
      title: 'AI Services API',
      description: 'AI-powered categorization and insights',
      baseUrl: '/api/v1/ai',
      methods: [
        {
          method: 'POST',
          path: '/api/v1/ai/analyze',
          description: 'Analyze issue with AI for categorization and priority',
          parameters: [
            { name: 'title', type: 'string', required: true, description: 'Issue title' },
            { name: 'description', type: 'string', required: true, description: 'Issue description' }
          ],
          example: {
            request: `POST /api/v1/ai/analyze
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "title": "Broken Street Light",
  "description": "Street light on Main Street is not working, making it dangerous for pedestrians at night."
}`,
            response: `{
  "data": {
    "suggested_category": "infrastructure",
    "suggested_priority": "medium",
    "confidence": 0.85,
    "keywords": ["street", "light", "broken", "dangerous"],
    "reasoning": "Based on high confidence analysis, this issue appears to be related to infrastructure based on keywords: street, light, broken. Priority is set to medium based on urgency indicators in the description."
  }
}`
          }
        }
      ]
    }
  };

  const currentEndpoint = endpoints[activeEndpoint as keyof typeof endpoints];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
          <p className="text-gray-600 mt-2">Comprehensive API reference for integrating with the Civic Issues Management System</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Endpoints</h3>
              <nav className="space-y-2">
                {Object.entries(endpoints).map(([key, endpoint]) => (
                  <button
                    key={key}
                    onClick={() => setActiveEndpoint(key)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeEndpoint === key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {endpoint.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentEndpoint.title}</h2>
                <p className="text-gray-600 mb-4">{currentEndpoint.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Globe className="h-4 w-4 mr-2" />
                  <code className="bg-gray-100 px-2 py-1 rounded">{currentEndpoint.baseUrl}</code>
                </div>
              </div>

              {/* Authentication */}
              <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Key className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-blue-900">Authentication</h3>
                </div>
                <p className="text-sm text-blue-800 mb-2">
                  All API requests require authentication using a Bearer token in the Authorization header.
                </p>
                <code className="text-sm bg-blue-100 px-2 py-1 rounded">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>

              {/* Methods */}
              <div className="space-y-8">
                {currentEndpoint.methods.map((method, index) => (
                  <div key={index} className="border-b border-gray-200 pb-8 last:border-b-0">
                    <div className="flex items-center mb-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium mr-3 ${
                        method.method === 'GET' ? 'bg-green-100 text-green-800' :
                        method.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                        method.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                        method.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {method.method}
                      </span>
                      <code className="text-lg font-mono">{method.path}</code>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{method.description}</p>

                    {/* Parameters */}
                    {method.parameters && method.parameters.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Parameters</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {method.parameters.map((param, paramIndex) => (
                                <tr key={paramIndex}>
                                  <td className="px-4 py-2 text-sm font-mono text-gray-900">{param.name}</td>
                                  <td className="px-4 py-2 text-sm text-gray-600">{param.type}</td>
                                  <td className="px-4 py-2 text-sm">
                                    {param.required ? (
                                      <span className="text-red-600 font-medium">Yes</span>
                                    ) : (
                                      <span className="text-gray-500">No</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-600">{param.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Example */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Example Request</h4>
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                          <code>{method.example.request}</code>
                        </pre>
                        <button
                          onClick={() => copyToClipboard(method.example.request, `request-${index}`)}
                          className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white"
                        >
                          {copiedCode === `request-${index}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>

                      <h4 className="font-semibold text-gray-900">Example Response</h4>
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                          <code>{method.example.response}</code>
                        </pre>
                        <button
                          onClick={() => copyToClipboard(method.example.response, `response-${index}`)}
                          className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white"
                        >
                          {copiedCode === `response-${index}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rate Limits */}
            <div className="mt-8 card">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Rate Limits</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">1000</div>
                  <div className="text-sm text-gray-600">Requests per hour</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">100</div>
                  <div className="text-sm text-gray-600">Requests per minute</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">10</div>
                  <div className="text-sm text-gray-600">Concurrent requests</div>
                </div>
              </div>
            </div>

            {/* SDKs */}
            <div className="mt-8 card">
              <div className="flex items-center mb-4">
                <Code className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">SDKs & Libraries</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">JavaScript/Node.js</h4>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded block mb-2">
                    npm install civic-issues-sdk
                  </code>
                  <a href="#" className="text-blue-600 text-sm hover:underline">
                    View Documentation →
                  </a>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Python</h4>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded block mb-2">
                    pip install civic-issues
                  </code>
                  <a href="#" className="text-blue-600 text-sm hover:underline">
                    View Documentation →
                  </a>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">PHP</h4>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded block mb-2">
                    composer require civic-issues/sdk
                  </code>
                  <a href="#" className="text-blue-600 text-sm hover:underline">
                    View Documentation →
                  </a>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">cURL</h4>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded block mb-2">
                    curl -H "Authorization: Bearer YOUR_KEY"
                  </code>
                  <a href="#" className="text-blue-600 text-sm hover:underline">
                    View Examples →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
