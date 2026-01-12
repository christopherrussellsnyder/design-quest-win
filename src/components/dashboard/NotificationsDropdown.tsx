import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, TrendingUp, AlertTriangle, Sparkles, X, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'ai';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Generate mock notifications based on common marketing platform events
const generateNotifications = (): Notification[] => {
  const now = new Date();
  return [
    {
      id: '1',
      type: 'success',
      title: 'Campaign performing well',
      message: 'Summer Sale Launch is 23% above target engagement',
      timestamp: new Date(now.getTime() - 15 * 60000),
      read: false,
    },
    {
      id: '2',
      type: 'ai',
      title: 'AI Recommendation',
      message: 'Optimal posting time for Tuesday: 7:00 PM EST',
      timestamp: new Date(now.getTime() - 45 * 60000),
      read: false,
    },
    {
      id: '3',
      type: 'warning',
      title: 'Budget alert',
      message: 'Email Re-engagement campaign is 80% through daily budget',
      timestamp: new Date(now.getTime() - 2 * 3600000),
      read: false,
    },
    {
      id: '4',
      type: 'info',
      title: 'Post scheduled',
      message: 'Your post "New product launch" is scheduled for tomorrow at 9 AM',
      timestamp: new Date(now.getTime() - 3 * 3600000),
      read: true,
    },
    {
      id: '5',
      type: 'success',
      title: 'Milestone reached',
      message: 'You\'ve reached 10,000 total impressions this week!',
      timestamp: new Date(now.getTime() - 5 * 3600000),
      read: true,
    },
    {
      id: '6',
      type: 'ai',
      title: 'Content suggestion',
      message: 'Based on trends, consider posting about "AI productivity tools"',
      timestamp: new Date(now.getTime() - 8 * 3600000),
      read: true,
    },
  ];
};

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(generateNotifications());
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'ai':
        return <Sparkles className="w-4 h-4 text-fuchsia-400" />;
      default:
        return <Clock className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10';
      case 'warning':
        return 'bg-amber-500/10';
      case 'ai':
        return 'bg-fuchsia-500/10';
      default:
        return 'bg-cyan-500/10';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-slate-800 transition-colors relative cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-fuchsia-500 rounded-full animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-200">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-fuchsia-500/20 text-fuchsia-400 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                    !notification.read ? 'bg-slate-800/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getBgColor(
                        notification.type
                      )}`}
                    >
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-medium ${
                            notification.read ? 'text-slate-400' : 'text-slate-200'
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-slate-500 hover:text-slate-300 p-0.5"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-800 text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-violet-400 hover:text-violet-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
