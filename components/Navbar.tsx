
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getNavItems, ADMIN_USER_ID } from '../constants'; // Updated import
import { useUser } from '../contexts/UserContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user } = useUser(); // Get user from context

  const isAdmin = user.userId === ADMIN_USER_ID;
  const navItems = getNavItems(isAdmin); // Get items based on admin status

  return (
    <nav className="bg-[#1F143A] shadow-t-lg sticky bottom-0 z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const IconComponent = isActive ? item.activeIcon : item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive: isLinkActive }) =>
                `flex flex-col items-center justify-center text-center px-1 py-1 rounded-md transition-colors duration-200 ease-in-out hover:bg-purple-700/30 w-1/${navItems.length} 
                ${isLinkActive ? 'text-orange-400' : 'text-gray-400'}`
              }
            >
              <IconComponent className={`h-6 w-6 mb-0.5 ${isActive ? 'text-orange-400' : 'text-gray-400'}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
