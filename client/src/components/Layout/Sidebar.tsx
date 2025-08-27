import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UserGroupIcon, 
  UserIcon, 
  CurrencyDollarIcon, 
  CheckCircleIcon, 
  ChartBarIcon, 
  CogIcon 
} from '@heroicons/react/24/outline';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Contacts', href: '/contacts', icon: UserGroupIcon },
    { name: 'Leads', href: '/leads', icon: UserIcon },
    { name: 'Deals', href: '/deals', icon: CurrencyDollarIcon },
    { name: 'Tasks', href: '/tasks', icon: CheckCircleIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Integrations', href: '/integrations', icon: CogIcon },
  ];

  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-logo">BizHub</h1>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <li key={item.name} className="nav-item">
                  <NavLink
                    to={item.href}
                    className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                    onClick={handleNavClick}
                  >
                    <Icon className="nav-icon" />
                    <span className="nav-text">{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;





