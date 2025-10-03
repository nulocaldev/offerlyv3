/**
 * Partner Agent Management Component
 * Allows partners to invite, manage, and track their team members
 */

import React, { useState, useEffect } from 'react';
import { partnerAuthService } from '../../services/partner-auth.service';
import { supabase } from '../../../shared-kernel/supabase/client';

interface Agent {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'neighborhood_agent' | 'team_member';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  business_name?: string;
  phone?: string;
  created_at: string;
  last_login?: string;
}

interface Invitation {
  id: string;
  email: string;
  role: 'neighborhood_agent' | 'team_member';
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitation_code: string;
  message?: string;
  expires_at: string;
  created_at: string;
  accepted_at?: string;
}

export const PartnerAgentManagement: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'neighborhood_agent' as 'neighborhood_agent' | 'team_member',
    message: ''
  });

  useEffect(() => {
    loadAgentsAndInvitations();
  }, []);

  const loadAgentsAndInvitations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current partner
      const authState = await partnerAuthService.initialize();
      if (!authState.profile) {
        setError('Partner profile not found');
        return;
      }

      // Load agents (simplified - would need more complex query in real app)
      const { data: agentsData, error: agentsError } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['neighborhood_agent', 'team_member'])
        .order('created_at', { ascending: false });

      if (agentsError) throw agentsError;

      // Mock agents data (in real app, would filter by partner relationship)
      const mockAgents: Agent[] = [
        {
          id: '1',
          email: 'sarah.agent@example.com',
          first_name: 'Sarah',
          last_name: 'Johnson',
          role: 'neighborhood_agent',
          status: 'active',
          business_name: 'Sarah\'s Marketing Co',
          phone: '+1-555-0123',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          last_login: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          email: 'mike.helper@example.com',
          first_name: 'Mike',
          last_name: 'Chen',
          role: 'team_member',
          status: 'active',
          phone: '+1-555-0124',
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          last_login: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setAgents(mockAgents);

      // Load invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('partner_invitations')
        .select('*')
        .eq('partner_id', authState.profile.id)
        .order('created_at', { ascending: false });

      if (invitationsError) throw invitationsError;

      setInvitations(invitationsData || []);

    } catch (err) {
      console.error('Failed to load agents and invitations:', err);
      setError('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async () => {
    try {
      if (!inviteForm.email || !inviteForm.role) {
        alert('Please fill in all required fields');
        return;
      }

      // Get current partner
      const authState = await partnerAuthService.initialize();
      if (!authState.profile) {
        throw new Error('Partner profile not found');
      }

      // Generate invitation code
      const invitationCode = Math.random().toString(36).substring(2, 15) + 
                           Math.random().toString(36).substring(2, 15);

      // Set expiry date (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Create invitation
      const { data, error } = await supabase
        .from('partner_invitations')
        .insert({
          partner_id: authState.profile.id,
          email: inviteForm.email,
          role: inviteForm.role,
          invitation_code: invitationCode,
          message: inviteForm.message,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setInvitations(prev => [data, ...prev]);

      // Reset form
      setInviteForm({
        email: '',
        role: 'neighborhood_agent',
        message: ''
      });
      setShowInviteForm(false);

      alert('Invitation sent successfully!');

    } catch (err) {
      console.error('Failed to send invitation:', err);
      alert('Failed to send invitation');
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('partner_invitations')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (error) throw error;

      // Update local state
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId 
            ? { ...inv, status: 'cancelled' as const }
            : inv
        )
      );

    } catch (err) {
      console.error('Failed to cancel invitation:', err);
      alert('Failed to cancel invitation');
    }
  };

  const updateAgentStatus = async (agentId: string, newStatus: Agent['status']) => {
    try {
      // In a real app, this would update the database
      setAgents(prev => 
        prev.map(agent => 
          agent.id === agentId 
            ? { ...agent, status: newStatus }
            : agent
        )
      );

      alert(`Agent status updated to ${newStatus}`);

    } catch (err) {
      console.error('Failed to update agent status:', err);
      alert('Failed to update agent status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'neighborhood_agent': return '🏪';
      case 'team_member': return '👤';
      default: return '👥';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const timeAgo = (dateString: string) => {
    const now = new Date();
    const time = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">👥</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Team</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadAgentsAndInvitations}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
                <p className="mt-2 text-gray-600">
                  Manage your agents and team members
                </p>
              </div>
              <button 
                onClick={() => setShowInviteForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Invite Team Member
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Team Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Team Members</p>
                <p className="text-3xl font-bold text-gray-900">{agents.length}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
            <div className="mt-4">
              <span className="text-green-600 text-sm font-medium">
                {agents.filter(a => a.status === 'active').length} active
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agents</p>
                <p className="text-3xl font-bold text-gray-900">
                  {agents.filter(a => a.role === 'neighborhood_agent').length}
                </p>
              </div>
              <div className="text-4xl">🏪</div>
            </div>
            <div className="mt-4">
              <span className="text-blue-600 text-sm font-medium">
                Neighborhood agents
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Invitations</p>
                <p className="text-3xl font-bold text-gray-900">
                  {invitations.filter(i => i.status === 'pending').length}
                </p>
              </div>
              <div className="text-4xl">📧</div>
            </div>
            <div className="mt-4">
              <span className="text-yellow-600 text-sm font-medium">
                Awaiting response
              </span>
            </div>
          </div>
        </div>

        {/* Invite Form Modal */}
        {showInviteForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Team Member</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm(prev => ({ 
                      ...prev, 
                      role: e.target.value as 'neighborhood_agent' | 'team_member'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="neighborhood_agent">Neighborhood Agent</option>
                    <option value="team_member">Team Member</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a personal message to your invitation..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowInviteForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={sendInvitation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Team Members */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Active Team Members</h3>
          </div>
          
          {agents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No team members yet</h3>
              <p className="text-gray-600 mb-6">
                Invite agents and team members to help grow your business!
              </p>
              <button 
                onClick={() => setShowInviteForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Invite Your First Team Member
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {agents.map((agent) => (
                <div key={agent.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{getRoleIcon(agent.role)}</div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {agent.first_name} {agent.last_name}
                        </h4>
                        <p className="text-gray-600">{agent.email}</p>
                        {agent.business_name && (
                          <p className="text-sm text-gray-500">{agent.business_name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(agent.status)}`}>
                          {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {agent.last_login ? `Last seen ${timeAgo(agent.last_login)}` : 'Never logged in'}
                        </p>
                      </div>
                      <div className="relative">
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Joined {formatDate(agent.created_at)} • {agent.role.replace('_', ' ')}
                      {agent.phone && ` • ${agent.phone}`}
                    </div>
                    <div className="flex space-x-2">
                      {agent.status === 'active' && (
                        <button
                          onClick={() => updateAgentStatus(agent.id, 'suspended')}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Suspend
                        </button>
                      )}
                      {agent.status === 'suspended' && (
                        <button
                          onClick={() => updateAgentStatus(agent.id, 'active')}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          Reactivate
                        </button>
                      )}
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Pending Invitations</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">📧</div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{invitation.email}</h4>
                        <p className="text-gray-600">{invitation.role.replace('_', ' ')}</p>
                        {invitation.message && (
                          <p className="text-sm text-gray-500 mt-1">"{invitation.message}"</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invitation.status)}`}>
                          {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Expires {formatDate(invitation.expires_at)}
                        </p>
                      </div>
                      {invitation.status === 'pending' && (
                        <button
                          onClick={() => cancelInvitation(invitation.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Sent {formatDate(invitation.created_at)} • Code: {invitation.invitation_code}
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Resend
                      </button>
                      <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                        Copy Link
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};