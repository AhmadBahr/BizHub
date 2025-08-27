import React, { useState } from 'react';
import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import type { User } from '../../types';
import './TopNav.css';

interface TopNavProps {
  onMenuClick: () => void;
  user: User | null;
  onLogout: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ onMenuClick, user, onLogout }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = () => {
    onLogout();
    setUserMenuOpen(false);
  };

  return (
    <header className="top-nav">
      <div className="top-nav-left">
        <button className="menu-button" onClick={onMenuClick}>
          <Bars3Icon className="menu-icon" />
        </button>
        <h2 className="page-title">BizHub</h2>
      </div>
      
      <div className="top-nav-right">
        <button className="notification-button">
          <BellIcon className="notification-icon" />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="user-menu">
          <button className="user-button" onClick={toggleUserMenu}>
            <UserCircleIcon className="user-icon" />
            <span className="user-name">{user?.firstName} {user?.lastName}</span>
          </button>
          
          {userMenuOpen && (
            <div className="user-dropdown">
              <div className="user-info">
                <p className="user-email">{user?.email}</p>
                <p className="user-role">{user?.role?.name}</p>
              </div>
              <div className="user-actions">
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
