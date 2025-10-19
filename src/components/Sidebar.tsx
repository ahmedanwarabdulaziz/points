'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  QrCode, 
  BarChart3, 
  Settings, 
  Gift, 
  CreditCard,
  Building2,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  userRole: 'admin' | 'business' | 'customer';
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  children?: MenuItem[];
}

export default function Sidebar({ userRole, onLogout }: SidebarProps) {
  const { appUser } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: userRole === 'admin' ? '/admin-dashboard' : 
            userRole === 'business' ? '/business-dashboard' : '/dashboard'
    },
    ...(userRole === 'customer' ? [
      {
        id: 'rewards',
        label: 'Rewards',
        icon: Gift,
        href: '/rewards'
      },
      {
        id: 'gift-cards',
        label: 'Gift Cards',
        icon: CreditCard,
        href: '/gift-cards'
      },
      {
        id: 'scan-qr',
        label: 'Scan QR',
        icon: QrCode,
        href: '/scan-qr'
      }
    ] : []),
    ...(userRole === 'business' ? [
      {
        id: 'customers',
        label: 'Customers',
        icon: Users,
        href: '/business-customers'
      },
      {
        id: 'qr-codes',
        label: 'QR Codes',
        icon: QrCode,
        href: '/business-qr'
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        href: '/business-analytics'
      }
    ] : []),
    ...(userRole === 'admin' ? [
      {
        id: 'businesses',
        label: 'Business Approvals',
        icon: Building2,
        href: '/admin-dashboard?tab=businesses'
      },
      {
        id: 'businesses-overview',
        label: 'Businesses Overview',
        icon: Building2,
        href: '/admin-businesses'
      },
      {
        id: 'customers',
        label: 'Customers Overview',
        icon: Users,
        href: '/admin-customers'
      },
      {
        id: 'users',
        label: 'Users',
        icon: Users,
        href: '/admin-dashboard?tab=users'
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        href: '/admin-dashboard?tab=analytics'
      },
      {
        id: 'business-categories',
        label: 'Business Categories',
        icon: Settings,
        href: '/admin-settings'
      },
      {
        id: 'settings',
        label: 'System Settings',
        icon: Settings,
        href: '/admin-dashboard?tab=settings'
      }
    ] : []),
    ...(userRole !== 'admin' ? [{
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/settings'
    }] : [])
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.href);

    return (
      <div key={item.id}>
        <Link
          href={item.href}
          className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            active
              ? 'bg-orange text-white'
              : 'text-gray-700 hover:bg-gray-100 hover:text-navy'
          }`}
        >
          <Icon className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1">{item.label}</span>
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleExpanded(item.id);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
            </>
          )}
        </Link>
        
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="ml-8 mt-2 space-y-1">
            {item.children?.map(child => (
              <Link
                key={child.id}
                href={child.href}
                className={`flex items-center space-x-3 px-4 py-2 text-sm rounded-lg transition-colors ${
                  isActive(child.href)
                    ? 'bg-orange/20 text-orange'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-navy'
                }`}
              >
                <child.icon className="h-4 w-4" />
                <span>{child.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="bg-navy p-2 rounded-lg">
                {userRole === 'admin' ? (
                  <Shield className="h-6 w-6 text-white" />
                ) : userRole === 'business' ? (
                  <Building2 className="h-6 w-6 text-white" />
                ) : (
                  <Gift className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-navy">
                  {appUser?.name || 
                   (userRole === 'admin' ? 'Admin' : 
                    userRole === 'business' ? 'Business' : 'Customer')}
                </h2>
                <p className="text-xs text-gray-500">
                  {userRole === 'admin' ? 'Administrator' : 
                   userRole === 'business' ? 'Business Owner' : 'Customer'}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <Menu className="h-5 w-5 text-gray-600" />
            ) : (
              <X className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map(renderMenuItem)}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <button
          onClick={onLogout}
          className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
