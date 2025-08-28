import React, { useState, useEffect, useRef } from 'react';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccessibility } from '../../hooks/useAccessibility';
import './MobileNav.css';

interface MobileNavProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onToggle, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const { announceToScreenReader, focusFirstElement } = useAccessibility();

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const navigationItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
    { name: 'Contacts', icon: UserGroupIcon, path: '/contacts' },
    { name: 'Leads', icon: UserIcon, path: '/leads' },
    { name: 'Deals', icon: CurrencyDollarIcon, path: '/deals' },
    { name: 'Tasks', icon: ClipboardDocumentListIcon, path: '/tasks' },
    { name: 'Analytics', icon: ChartBarIcon, path: '/analytics' },
    { name: 'Integrations', icon: Cog6ToothIcon, path: '/integrations' },
  ];

  // Handle swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && isOpen) {
      // Swipe left to close
      onClose();
      announceToScreenReader('Navigation menu closed');
    } else if (isRightSwipe && !isOpen) {
      // Swipe right to open
      onToggle();
      announceToScreenReader('Navigation menu opened');
    }
  };

  // Handle navigation
  const handleNavigation = (path: string, name: string) => {
    navigate(path);
    onClose();
    announceToScreenReader(`Navigated to ${name}`);
  };

  // Close nav when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus first navigation item when menu opens
      setTimeout(() => {
        focusFirstElement();
      }, 100);
    }
  }, [isOpen, focusFirstElement]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="mobile-menu-button"
        onClick={onToggle}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      {/* Mobile navigation overlay */}
      <div 
        className={`mobile-nav-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Mobile navigation menu */}
      <nav
        ref={navRef}
        id="mobile-navigation"
        className={`mobile-nav ${isOpen ? 'open' : ''}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="mobile-nav-header">
          <h2 className="mobile-nav-title">BizHub CRM</h2>
          <button
            className="mobile-nav-close"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mobile-nav-content">
          <ul className="mobile-nav-list">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <button
                    className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavigation(item.path, item.name)}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={`Navigate to ${item.name}${isActive ? ' (current page)' : ''}`}
                  >
                    <Icon className="mobile-nav-icon" />
                    <span className="mobile-nav-text">{item.name}</span>
                    {isActive && <span className="sr-only">(current page)</span>}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Quick actions */}
          <div className="mobile-quick-actions">
            <h3 className="mobile-section-title">Quick Actions</h3>
            <div className="mobile-action-buttons">
              <button
                className="mobile-action-btn"
                onClick={() => handleNavigation('/notifications', 'Notifications')}
                aria-label="View notifications"
              >
                <BellIcon className="w-5 h-5" />
                <span>Notifications</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
