import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'LEAD' | 'DEAL' | 'TASK' | 'SYSTEM';
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user?.id) {
      // Mock notification setup - replace with actual socket.io implementation later
      console.log('Setting up notification connection for user:', user.id);
    }
  }, [user?.id]);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === id ? { ...notification, isRead: true } : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('http://localhost:3001/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, isRead: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
