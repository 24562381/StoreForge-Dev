'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './tailwind.css';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  HelpCircle,
  Star,
  Settings,
  Languages,
  LogOut,
  ExternalLink,
  Store,
  Menu,
  X,
  User,
  ChevronRight,
  FileText,
  Sparkles,
  TicketPercent,
  Users,
  ShieldCheck,
  UserCircle,
  Database,
  Palette,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import NextLink from 'next/link';
import { AdminModalProvider } from '@/lib/AdminModalContext';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { DynamicFavicon } from '@/components/DynamicFavicon';
import { PwaRegister } from '@/components/PwaRegister';
import { fetchApi } from '@/lib/api';
import { useStoreUrl, setCachedStoreUrl } from '@/lib/storeUrl';
import { getBrandInitials } from '@/lib/brand';

interface NavItem {
  label: string;
  path: string;
  icon: any;
  requiredPermission?: string;
  adminOnly?: boolean;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { label: 'Overview', path: '/', icon: LayoutDashboard },
  { label: 'Orders', path: '/orders', icon: ShoppingBag, requiredPermission: PERMISSIONS.ORDERS_VIEW },
  { label: 'Custom Orders', path: '/customizations', icon: Palette, requiredPermission: PERMISSIONS.CUSTOMIZATIONS_MANAGE },
  { label: 'Products', path: '/products', icon: Package, requiredPermission: PERMISSIONS.PRODUCTS_VIEW },
  { label: 'Featured Product', path: '/featured-product', icon: Sparkles, requiredPermission: PERMISSIONS.PRODUCTS_EDIT },
  { label: 'Promo Codes', path: '/promo-codes', icon: TicketPercent, requiredPermission: PERMISSIONS.PROMO_CODES_MANAGE },
  { label: 'Categories', path: '/categories', icon: FolderTree, requiredPermission: PERMISSIONS.CATEGORIES_MANAGE },
  { label: 'Customer Reviews', path: '/reviews', icon: Star, requiredPermission: PERMISSIONS.REVIEWS_MANAGE },
  { label: 'FAQs', path: '/faqs', icon: HelpCircle, requiredPermission: PERMISSIONS.FAQS_MANAGE },
  { label: 'Policy Pages', path: '/policies', icon: FileText, requiredPermission: PERMISSIONS.PRODUCTS_EDIT },
  { label: 'Translations (i18n)', path: '/translations', icon: Languages, requiredPermission: PERMISSIONS.TRANSLATIONS_MANAGE },
  { label: 'Database Backup', path: '/database', icon: Database, requiredPermission: PERMISSIONS.DATABASE_BACKUP },
  { label: 'Store Settings', path: '/settings', icon: Settings, requiredPermission: PERMISSIONS.SETTINGS_MANAGE },
  { label: 'Moderators & Team', path: '/moderators', icon: Users, requiredPermission: PERMISSIONS.MODERATORS_MANAGE },
];

export default function RootAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const isLoginPage = pathname === '/login';
  const isPrintPage = pathname.includes('/shipping-label') || pathname.includes('/print');

  const [adminUser, setAdminUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siteTitle, setSiteTitle] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('sf_admin_site_title') || '';
      } catch {}
    }
    return '';
  });
  const [adminFavicon, setAdminFavicon] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('sf_admin_favicon') || '';
      } catch {}
    }
    return '';
  });
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Restore collapsed sidebar preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sf_admin_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch {}
  }, []);

  const toggleCollapse = React.useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sf_admin_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  }, []);

  // Keyboard shortcut Ctrl/Cmd + B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCollapse]);

  // Fetch site title & live store URL configured in store settings / .env
  useEffect(() => {
    fetchApi('/settings/public', { cache: 'no-store' })
      .then((data) => {
        if (data && (data.store_name_en || data.store_name)) {
          const name = data.store_name_en || data.store_name;
          setSiteTitle(name);
          try {
            localStorage.setItem('sf_admin_site_title', name);
          } catch {}
        }
        const resolvedFavicon = data?.admin_favicon_url || data?.store_favicon_url;
        if (resolvedFavicon && typeof resolvedFavicon === 'string') {
          setAdminFavicon(resolvedFavicon);
          try {
            localStorage.setItem('sf_admin_favicon', resolvedFavicon);
          } catch {}
        }
        const resolvedStoreUrl = data?.store_url || data?.frontend_url;
        if (resolvedStoreUrl && typeof resolvedStoreUrl === 'string' && resolvedStoreUrl.trim()) {
          setCachedStoreUrl(resolvedStoreUrl);
        }
      })
      .catch(() => { });

    const handleTitleUpdated = (e: any) => {
      if (e?.detail && typeof e.detail === 'string') {
        setSiteTitle(e.detail);
      }
    };
    const handleFaviconUpdated = (e: any) => {
      if (e?.detail && typeof e.detail === 'string') {
        setAdminFavicon(e.detail);
        try {
          localStorage.setItem('sf_admin_favicon', e.detail);
        } catch {}
      }
    };
    window.addEventListener('sf_site_title_updated', handleTitleUpdated);
    window.addEventListener('sf_favicon_updated', handleFaviconUpdated);
    return () => {
      window.removeEventListener('sf_site_title_updated', handleTitleUpdated);
      window.removeEventListener('sf_favicon_updated', handleFaviconUpdated);
    };
  }, []);


  useEffect(() => {
    if (isLoginPage) return;
    const token = localStorage.getItem('sf_admin_token');
    const userStr = localStorage.getItem('sf_admin_user');
    if (!token) {
      router.push('/login');
      return;
    }
    if (userStr) {
      try {
        setAdminUser(JSON.parse(userStr));
      } catch { }
    }
  }, [pathname, isLoginPage, router]);

  const handleLogout = React.useCallback(() => {
    localStorage.removeItem('sf_admin_token');
    localStorage.removeItem('sf_admin_user');
    router.push('/login');
  }, [router]);

  // Filter navigation items based on user role and permissions
  const navItems = React.useMemo(() => {
    return ALL_NAV_ITEMS.filter((item) => {
      if (!adminUser) return true;
      if (adminUser.role === 'admin') return true;
      if (item.adminOnly) return false;
      if (!item.requiredPermission) return true;
      return hasPermission(adminUser, item.requiredPermission);
    });
  }, [adminUser]);

  const currentNav = React.useMemo(() => {
    if (pathname === '/profile') {
      return { label: 'My Profile' };
    }
    return navItems.find((n) => n.path === pathname || (n.path !== '/' && pathname.startsWith(n.path))) || {
      label: 'Dashboard',
    };
  }, [navItems, pathname]);

  const storeUrl = useStoreUrl();
  const isSuperAdmin = adminUser?.role === 'admin';
  const displayBrand = siteTitle || (isSuperAdmin ? 'StoreForge Admin' : 'Staff Panel');
  const brandInitials = React.useMemo(() => {
    return getBrandInitials(siteTitle || 'StoreForge');
  }, [siteTitle]);

  return (
    <html lang="en">
      <head>
        <title>{siteTitle ? `${siteTitle} — Admin Portal` : 'StoreForge — Admin Portal'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/css/globals.css" />
        <link rel="stylesheet" href="/css/tiptapeditor.css" />

        {/* Favicon */}
        <link rel="icon" href={adminFavicon || '/icons/icon.svg'} />
        <link rel="shortcut icon" href={adminFavicon || '/icons/icon.svg'} />

        {/* PWA Manifest & App Meta */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={siteTitle ? `${siteTitle} Admin` : 'SF Admin'} />
        <link rel="apple-touch-icon" href="/icons/admin-apple-touch-icon.png" />
      </head>
      <body>
        <PwaRegister />
        <DynamicFavicon />
        <AdminModalProvider>
          {isLoginPage || isPrintPage ? (
            children
          ) : (
            <div className="min-h-screen md:h-screen md:overflow-hidden bg-[#f8fafc] text-slate-800 flex flex-col md:flex-row font-sans">
              {/* Mobile Top Header */}
              <div className="md:hidden bg-[#0f172a] border-b border-slate-800 p-4 flex items-center justify-between text-white print:hidden sticky top-0 z-30">
                <NextLink href="/" className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {brandInitials}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-indigo-300 block truncate max-w-[170px]" title={displayBrand}>
                      {displayBrand}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {isSuperAdmin ? 'Master Portal' : 'Staff Panel'}
                    </span>
                  </div>
                </NextLink>

                <div className="flex items-center gap-2">
                  <a
                    href={storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
                    title="View Store"
                  >
                    <Store className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                    aria-label="Toggle Navigation Menu"
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Mobile Backdrop */}
              {mobileMenuOpen && (
                <div
                  onClick={() => setMobileMenuOpen(false)}
                  className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden transition-opacity"
                  aria-hidden="true"
                />
              )}

              {/* Sidebar Navigation */}
              <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#0f172a] text-slate-300 flex-shrink-0 flex flex-col border-r border-slate-800 transition-all duration-200 ease-in-out md:static md:translate-x-0 md:z-30 print:hidden overflow-x-hidden ${
                  mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
                } ${isCollapsed ? 'md:w-[72px]' : 'md:w-64'}`}
              >
                {/* Mobile Drawer Header with Close Button */}
                <div className="flex md:hidden items-center justify-between p-4 border-b border-slate-800">
                  <NextLink href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {brandInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-white tracking-wide truncate max-w-[170px]" title={siteTitle || (isSuperAdmin ? 'STOREFORGE' : 'STAFF PORTAL')}>
                        {siteTitle || (isSuperAdmin ? 'STOREFORGE' : 'STAFF PORTAL')}
                      </div>
                      <div className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                        {isSuperAdmin ? 'Master Control' : 'Moderator'}
                      </div>
                    </div>
                  </NextLink>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Close Menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Brand Logo Header (Desktop) */}
                <div className={`hidden md:flex items-center border-b border-slate-800 transition-all duration-200 overflow-x-hidden ${
                  isCollapsed ? 'p-3 justify-center' : 'p-5 justify-between'
                }`}>
                  <NextLink href="/" className={`flex items-center gap-2.5 min-w-0 ${isCollapsed ? 'justify-center' : ''}`} title={displayBrand}>
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
                      {brandInitials}
                    </div>
                    {!isCollapsed && (
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-white tracking-wide truncate max-w-[130px]" title={siteTitle || (isSuperAdmin ? 'STOREFORGE' : 'STAFF PORTAL')}>
                          {siteTitle || (isSuperAdmin ? 'STOREFORGE' : 'STAFF PORTAL')}
                        </div>
                        <div className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                          {isSuperAdmin ? 'Master Control' : 'Moderator'}
                        </div>
                      </div>
                    )}
                  </NextLink>

                  {!isCollapsed && (
                    <button
                      type="button"
                      onClick={toggleCollapse}
                      className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-slate-600 transition-all cursor-pointer shrink-0 shadow-2xs flex items-center justify-center"
                      title="Collapse sidebar (Ctrl/Cmd+B)"
                      aria-label="Collapse sidebar"
                    >
                      <PanelLeftClose className="w-4 h-4 text-slate-300" />
                    </button>
                  )}
                </div>

                {/* Navigation Links List */}
                <nav className={`flex-1 space-y-1 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-140px)] transition-all ${isCollapsed ? 'p-2' : 'p-3'}`}>
                  {navItems.map((item) => {
                    const IconComp = item.icon;
                    const active = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);

                    return (
                      <NextLink
                        key={item.path}
                        href={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`group relative flex items-center rounded-xl text-xs font-semibold transition-all ${
                          isCollapsed
                            ? 'justify-center p-2.5 md:w-11 md:h-11 mx-auto'
                            : 'justify-between px-3.5 py-2.5'
                        } ${active
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                          }`}
                        title={item.label}
                      >
                        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                          <IconComp className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                          {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </div>
                        {!isCollapsed && active && <ChevronRight className="w-3.5 h-3.5 opacity-80 shrink-0" />}
                      </NextLink>
                    );
                  })}
                </nav>

                {/* Bottom Staff Profile & Store Actions */}
                <div className={`border-t border-slate-800 space-y-2 bg-[#0b1120] transition-all overflow-x-hidden ${isCollapsed ? 'p-2' : 'p-3'}`}>
                  <a
                    href={storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative flex items-center rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors ${
                      isCollapsed ? 'justify-center p-2.5 md:w-11 md:h-11 mx-auto' : 'justify-between w-full px-3.5 py-2'
                    }`}
                    title="Visit Live Store"
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                      <Store className="w-4 h-4 text-indigo-400 shrink-0" />
                      {!isCollapsed && <span>Visit Live Store</span>}
                    </div>
                    {!isCollapsed && <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                  </a>

                  <div className={`flex items-center rounded-xl bg-slate-900/60 border ${
                    pathname === '/profile' ? 'border-indigo-500/50 bg-indigo-950/20' : 'border-slate-800'
                  } transition-all ${
                    isCollapsed ? 'justify-center p-2 flex-col gap-2' : 'justify-between px-3 py-2'
                  }`}>
                    <NextLink
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group/prof relative flex items-center ${
                        isCollapsed ? 'justify-center p-1' : 'gap-2.5 min-w-0 flex-1 hover:opacity-95'
                      }`}
                      title="My Profile"
                    >
                      <div className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-all ${
                        pathname === '/profile'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-indigo-500/20 text-indigo-400 group-hover/prof:bg-indigo-600 group-hover/prof:text-white'
                      }`}>
                        <User className="w-3.5 h-3.5" />
                      </div>
                      {!isCollapsed && (
                        <div className="min-w-0">
                          <div className={`text-xs font-semibold truncate transition-colors ${
                            pathname === '/profile' ? 'text-indigo-300' : 'text-white group-hover/prof:text-indigo-200'
                          }`}>
                            {adminUser?.name || 'Administrator'}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {adminUser?.email || 'admin@storeforge.io'}
                          </div>
                        </div>
                      )}
                    </NextLink>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                      title="Log Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </aside>

              {/* Main Content Area */}
              <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
                {/* Top Desktop Bar */}
                <header className="hidden md:block bg-white border-b border-slate-200/80 sticky top-0 z-20 print:hidden">
                  <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 max-w-8xl w-full mx-auto">
                    <div className="flex items-center gap-3 min-w-0">
                      {isCollapsed && (
                        <>
                          <button
                            type="button"
                            onClick={toggleCollapse}
                            className="p-2 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 transition-all cursor-pointer shrink-0 shadow-2xs flex items-center justify-center"
                            title="Expand sidebar (Ctrl/Cmd+B)"
                            aria-label="Expand sidebar"
                          >
                            <PanelLeftOpen className="w-4 h-4 text-[#c08a46]" />
                          </button>
                          <div className="h-4 w-px bg-slate-200 shrink-0" />
                        </>
                      )}
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate max-w-[220px]" title={siteTitle || 'StoreForge Portal'}>
                          {siteTitle ? `${siteTitle} Admin` : 'StoreForge Portal'}
                        </span>
                        <span className="text-slate-300 font-medium">/</span>
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {currentNav.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href={storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 transition-colors"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>View Store</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>
                  </div>
                </header>

                <div className="p-3.5 sm:p-6 lg:p-8 lg:px-20 max-w-8xl w-full mx-auto">
                  {children}
                </div>
              </main>
            </div>
          )}
        </AdminModalProvider>
      </body>
    </html>
  );
}
