/**
 * Notification Center Component
 * Manages and displays application-related notifications
 */

import React, { useState, useEffect } from 'react';
import { agentApprovalWorkflowService, type ApplicationNotification } from '../../services/agent-approval-workflow.service';
import { partnerAuthService } from '../../services/partner-auth.service';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<ApplicationNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const authState = await partnerAuthService.initialize();
      if (!authState.user) {
        setError('User not authenticated');
        return;
      }

      const data = await agentApprovalWorkflowService.getNotifications(
        authState.user.id,
        filter === 'all'
      );

      setNotifications(data);

    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await agentApprovalWorkflowService.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );

    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      for (const notification of unreadNotifications) {
        await agentApprovalWorkflowService.markNotificationAsRead(notification.id);
      }

      // Refresh notifications
      await loadNotifications();

    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      'application_received': '📥',
      'review_started': '👀',
      'interview_scheduled': '📅',
      'status_update': '🔄',
      'approval_granted': '✅',
      'rejection_notice': '❌',
      'payment_required': '💳',
      'onboarding_started': '🎉'
    };
    return icons[type as keyof typeof icons] || '📢';
  };

  const getNotificationColor = (type: string) => {
    const colors = {
      'application_received': 'text-blue-600',
      'review_started': 'text-purple-600',
      'interview_scheduled': 'text-green-600',
      'status_update': 'text-blue-600',
      'approval_granted': 'text-green-600',
      'rejection_notice': 'text-red-600',
      'payment_required': 'text-orange-600',
      'onboarding_started': 'text-emerald-600'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600';
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const time = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-600 bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Notification Panel */}
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
              filter === 'unread'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Unread ({notifications.filter(n => !n.is_read).length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
              filter === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All ({notifications.length})
          </button>
        </div>

        {/* Mark All Read Button */}
        {notifications.some(n => !n.is_read) && filter === 'unread' && (
          <div className="p-3 border-b border-gray-200">
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-500 text-4xl mb-2">⚠️</div>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={loadNotifications}
                className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-gray-400 text-4xl mb-2">🔔</div>
              <p className="text-gray-500">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`text-xl ${getNotificationColor(notification.notification_type)}`}>
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${
                          !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                        {notification.sent_via_email && (
                          <span className="text-xs text-gray-400 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            Email sent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional metadata */}
                  {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                    <div className="mt-3 pl-8">
                      <div className="bg-gray-100 p-2 rounded text-xs text-gray-600">
                        Additional info available
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Notification Bell Component (for header/nav)
export const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const authState = await partnerAuthService.initialize();
      if (!authState.user) return;

      const notifications = await agentApprovalWorkflowService.getNotifications(
        authState.user.id,
        false // Only unread
      );

      setUnreadCount(notifications.length);

    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleNotificationClose = () => {
    setShowNotifications(false);
    // Refresh unread count when notifications close
    loadUnreadCount();
  };

  return (
    <>
      <button
        onClick={() => setShowNotifications(true)}
        className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-5-5 5-5m-5 5H9a7.003 7.003 0 01-7-7c0-4.418 3.582-8 8-8s8 3.582 8 8v2m-4 6h.01M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationCenter
        isOpen={showNotifications}
        onClose={handleNotificationClose}
      />
    </>
  );
};

// Application Status Badge Component
export const ApplicationStatusBadge: React.FC<{ 
  status: string; 
  showIcon?: boolean; 
}> = ({ status, showIcon = true }) => {
  const statusConfig = {
    'pending': { 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: '⏳',
      label: 'Pending Review'
    },
    'under_review': { 
      color: 'bg-blue-100 text-blue-800', 
      icon: '👀',
      label: 'Under Review'
    },
    'approved': { 
      color: 'bg-green-100 text-green-800', 
      icon: '✅',
      label: 'Approved'
    },
    'rejected': { 
      color: 'bg-red-100 text-red-800', 
      icon: '❌',
      label: 'Rejected'
    },
    'payment_pending': { 
      color: 'bg-purple-100 text-purple-800', 
      icon: '💳',
      label: 'Payment Required'
    },
    'active': { 
      color: 'bg-emerald-100 text-emerald-800', 
      icon: '🎉',
      label: 'Active'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    color: 'bg-gray-100 text-gray-800',
    icon: '❓',
    label: status
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {config.label}
    </span>
  );
};