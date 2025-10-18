'use client';

import { useState } from &apos;react';
import Link from &apos;next/link';
import { usePathname } from &apos;next/navigation';
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
} from &apos;lucide-react';

interface SidebarProps {
  userRole: &apos;admin&apos; | &apos;business&apos; | &apos;customer';
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  children?: MenuItem[];
}

export default function Sidebar({ userRole, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      id: &apos;dashboard&apos;,
      label: &apos;Dashboard&apos;,
      icon: LayoutDashboard,
      href: userRole === &apos;admin&apos; ? &apos;/admin-dashboard&apos; : 
            userRole === &apos;business&apos; ? &apos;/business-dashboard&apos; : &apos;/dashboard&apos;
    },
    ...(userRole === &apos;customer&apos; ? [
      {
        id: &apos;rewards&apos;,
        label: &apos;Rewards&apos;,
        icon: Gift,
        href: &apos;/rewards&apos;
      },
      {
        id: &apos;gift-cards&apos;,
        label: &apos;Gift Cards&apos;,
        icon: CreditCard,
        href: &apos;/gift-cards&apos;
      },
      {
        id: &apos;scan-qr&apos;,
        label: &apos;Scan QR&apos;,
        icon: QrCode,
        href: &apos;/scan-qr&apos;
      }
    ] : []),
    ...(userRole === &apos;business&apos; ? [
      {
        id: &apos;customers&apos;,
        label: &apos;Customers&apos;,
        icon: Users,
        href: &apos;/business-customers&apos;
      },
      {
        id: &apos;qr-codes&apos;,
        label: &apos;QR Codes&apos;,
        icon: QrCode,
        href: &apos;/business-qr&apos;
      },
      {
        id: &apos;analytics&apos;,
        label: &apos;Analytics&apos;,
        icon: BarChart3,
        href: &apos;/business-analytics&apos;
      }
    ] : []),
    ...(userRole === &apos;admin&apos; ? [
      {
        id: &apos;businesses&apos;,
        label: &apos;Business Approvals&apos;,
        icon: Building2,
        href: &apos;/admin-dashboard?tab=businesses&apos;
      },
      {
        id: &apos;users&apos;,
        label: &apos;Users&apos;,
        icon: Users,
        href: &apos;/admin-dashboard?tab=users&apos;
      },
      {
        id: &apos;analytics&apos;,
        label: &apos;Analytics&apos;,
        icon: BarChart3,
        href: &apos;/admin-dashboard?tab=analytics&apos;
      },
      {
        id: &apos;settings&apos;,
        label: &apos;System Settings&apos;,
        icon: Settings,
        href: &apos;/admin-dashboard?tab=settings&apos;
      }
    ] : []),
    ...(userRole !== &apos;admin&apos; ? [{
      id: &apos;settings&apos;,
      label: &apos;Settings&apos;,
      icon: Settings,
      href: &apos;/settings&apos;
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
              ? &apos;bg-orange text-white&apos;
              : &apos;text-gray-700 hover:bg-gray-100 hover:text-navy&apos;
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
                    ? &apos;bg-orange/20 text-orange&apos;
                    : &apos;text-gray-600 hover:bg-gray-100 hover:text-navy&apos;
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
      isCollapsed ? &apos;w-16&apos; : &apos;w-64&apos;
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="bg-navy p-2 rounded-lg">
                {userRole === &apos;admin&apos; ? (
                  <Shield className="h-6 w-6 text-white" />
                ) : userRole === &apos;business&apos; ? (
                  <Building2 className="h-6 w-6 text-white" />
                ) : (
                  <Gift className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-navy">
                  {userRole === &apos;admin&apos; ? &apos;Admin&apos; : 
                   userRole === &apos;business&apos; ? &apos;Business&apos; : &apos;Customer&apos;}
                </h2>
                <p className="text-xs text-gray-500">Dashboard</p>
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
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
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
