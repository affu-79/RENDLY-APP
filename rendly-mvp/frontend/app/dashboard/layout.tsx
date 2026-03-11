'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { DashboardSidebarProvider } from './DashboardSidebarContext';
import { CurrentUserProvider } from '@/context/CurrentUserContext';
import { CallProvider } from '@/context/CallContext';
import { IncomingCallOverlay } from './chat/IncomingCallOverlay';
import { auth } from '@/services/auth';
import { useDashboard } from '@/hooks/useDashboard';
import { groupsApi } from '@/services/groups';
import './dashboard.css';

type ApiNotification = {
  id: string;
  user_id: string;
  type: string;
  payload: Record<string, unknown>;
  read: boolean;
  created_at: string;
};

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: dashboardUser } = useDashboard();
  /* On mobile/tablet, show page content: we're always under /dashboard when this layout runs, so always treat as subpage.
   * When pathname is null (SSR/initial render), default to true so content is visible and we avoid "404" blank state. */
  const isSubpage = pathname == null || pathname.startsWith('/dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [brandExiting, setBrandExiting] = useState(false);
  const [mobileWaveRevealed, setMobileWaveRevealed] = useState(false);
  const [mobileRevealing, setMobileRevealing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [apiNotifications, setApiNotifications] = useState<ApiNotification[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [actingInviteId, setActingInviteId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(() => {
    groupsApi.getNotifications().then((list) => setApiNotifications(list)).catch(() => setApiNotifications([]));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSidebarOpen(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (dropdownOpen) fetchNotifications();
  }, [dropdownOpen, fetchNotifications]);

  /* Add welcome notification when landing from profile-setup (?welcome=1) and clear param */
  useEffect(() => {
    if (typeof window === 'undefined' || !dashboardUser?.username) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('welcome') !== '1') return;
    const url = window.location.pathname + window.location.hash;
    window.history.replaceState(null, '', url);
  }, [dashboardUser?.username]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', onEscape);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onEscape);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [dropdownOpen]);

  const onBeforeNavigate = useCallback(() => setBrandExiting(true), []);

  return (
    <DashboardSidebarProvider
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      onBeforeNavigate={onBeforeNavigate}
    >
      <div
        className={`dash-root ${sidebarOpen ? 'dash-root--sidebar-open' : ''} ${mobileRevealing ? 'dash-root--mobile-revealing' : ''} ${mobileWaveRevealed ? 'dash-root--mobile-revealed' : ''} ${isSubpage ? 'dash-root--subpage' : ''}`}
      >
        <main className="dash-main">
          <header className="dash-header-bar">
            <div
              className={`dash-brand ${brandExiting ? 'dash-brand--out' : 'dash-brand--in'}`}
            >
              <Link
                href="/dashboard"
                className="dash-brand-logo-wrap"
                aria-label="Go to dashboard home"
              >
                <Image
                  src="/images/logo.svg"
                  alt="Rendly"
                  width={192}
                  height={192}
                  className="dash-brand-logo"
                />
              </Link>
              <span className="dash-brand-tagline">Know Your Why, Find Your Who</span>
            </div>
            <div className="dash-header-right">
              <div className="dash-notif-wrap" ref={dropdownRef}>
                <button
                  type="button"
                  className="dash-header-pill dash-header-pill-btn"
                  onClick={() => setDropdownOpen((o) => !o)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  aria-label={dropdownOpen ? 'Close notifications' : 'Open notifications'}
                >
                  <span className="dash-header-pill-icon" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </span>
                  <span className="dash-header-pill-text">
                    {apiNotifications.length > 0
                      ? `Notifications (${apiNotifications.filter((n) => !n.read).length || apiNotifications.length})`
                      : 'New Notifications'}
                  </span>
                </button>
                {dropdownOpen && (
                  <div className="dash-notif-dropdown" role="menu">
                    {apiNotifications.length === 0 ? (
                      <div className="dash-notif-item dash-notif-empty">No notifications yet.</div>
                    ) : (
                      apiNotifications.map((n) => {
                        const payload = n.payload || {};
                        const inviteId = payload.invite_id as string | undefined;
                        const isGroupInvite = n.type === 'group_invite' && inviteId;
                        const inviter = (payload.inviter_username as string) ?? (payload.inviter_name as string) ?? 'Someone';
                        const groupName = (payload.group_name as string) ?? 'a group';
                        const acting = actingInviteId === inviteId;
                        return (
                          <div
                            key={n.id}
                            className={`dash-notif-item ${n.read ? 'dash-notif-item--read' : ''}`}
                            role="menuitem"
                          >
                            {n.type === 'group_invite' && (
                              <>
                                <p className="dash-notif-item-text">
                                  @{String(inviter).replace(/^@/, '')} invited you to group {groupName}.
                                </p>
                                {!n.read && (
                                  <div className="dash-notif-item-actions">
                                    <button
                                      type="button"
                                      className="dash-notif-item-btn dash-notif-item-btn--accept"
                                      onClick={() => {
                                        if (!inviteId || acting) return;
                                        setActingInviteId(inviteId);
                                        groupsApi
                                          .acceptInvite(inviteId)
                                          .then(() => {
                                            groupsApi.markNotificationRead(n.id).then(() => fetchNotifications());
                                            setDropdownOpen(false);
                                            router.push('/dashboard/chat?tab=Group');
                                          })
                                          .catch(() => { })
                                          .finally(() => setActingInviteId(null));
                                      }}
                                      disabled={acting}
                                    >
                                      {acting ? '…' : 'Accept'}
                                    </button>
                                    <button
                                      type="button"
                                      className="dash-notif-item-btn dash-notif-item-btn--reject"
                                      onClick={() => {
                                        if (!inviteId || acting) return;
                                        setActingInviteId(inviteId);
                                        groupsApi
                                          .rejectInvite(inviteId)
                                          .then(() => {
                                            groupsApi.markNotificationRead(n.id).then(() => fetchNotifications());
                                          })
                                          .catch(() => { })
                                          .finally(() => setActingInviteId(null));
                                      }}
                                      disabled={acting}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                            {(n.type === 'group_invite_accepted' || n.type === 'group_invite_rejected') && (
                              <p className="dash-notif-item-text">
                                {(payload.invitee_username as string) ?? 'A user'}{' '}
                                {n.type === 'group_invite_accepted' ? 'accepted' : 'rejected'} your invite to{' '}
                                {(payload.group_name as string) ?? 'the group'}.
                              </p>
                            )}
                            {n.type !== 'group_invite' && n.type !== 'group_invite_accepted' && n.type !== 'group_invite_rejected' && (
                              <p className="dash-notif-item-text">
                                {(payload.message as string) ?? n.type ?? 'Notification'}
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
              <div className="dash-header-avatar-wrap">
                {dashboardUser?.avatar_url ? (
                  <img
                    src={dashboardUser.avatar_url}
                    alt="Your profile"
                    className="dash-header-avatar"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="dash-header-avatar dash-header-avatar-initials">
                    {dashboardUser?.username
                      ? dashboardUser.username.slice(0, 2).toUpperCase()
                      : '?'}
                  </div>
                )}
              </div>
            </div>
          </header>
          <button
            type="button"
            className="dash-sidebar-toggle"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <span className="dash-sidebar-toggle-icon" aria-hidden>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="dash-sidebar-toggle-svg"
              >
                {sidebarOpen ? (
                  <path d="M9 18l6-6-6-6" />
                ) : (
                  <path d="M15 18l-6-6 6-6" />
                )}
              </svg>
            </span>
          </button>
          <div className="dash-main-inner">{children}</div>

          {/* Mobile/tablet: bottom bar with nav icons only (no logo, no log out) */}
          <nav className="dash-bottom-bar" aria-label="Dashboard navigation">
            <Link href="/dashboard" className={`dash-bottom-bar-item ${pathname === '/dashboard' ? 'dash-bottom-bar-item--active' : ''}`} aria-label="Dashboard">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="3" width="7" height="9" rx="1" />
                <rect x="14" y="3" width="7" height="5" rx="1" />
                <rect x="14" y="12" width="7" height="9" rx="1" />
                <rect x="3" y="16" width="7" height="5" rx="1" />
              </svg>
            </Link>
            <Link href="/dashboard/chat" className={`dash-bottom-bar-item ${pathname?.startsWith('/dashboard/chat') ? 'dash-bottom-bar-item--active' : ''}`} aria-label="Whispers">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </Link>
            <Link href="/dashboard/huddles" className={`dash-bottom-bar-item ${pathname?.startsWith('/dashboard/huddles') ? 'dash-bottom-bar-item--active' : ''}`} aria-label="Huddles">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="9" cy="9" r="4" />
                <circle cx="15" cy="9" r="4" />
                <circle cx="9" cy="15" r="2.5" />
                <circle cx="15" cy="15" r="2.5" />
                <path d="M9 11.5V13m6-1.5V13" strokeWidth="1.5" />
              </svg>
            </Link>
            <Link href="/dashboard/profile" className={`dash-bottom-bar-item ${pathname === '/dashboard/profile' ? 'dash-bottom-bar-item--active' : ''}`} aria-label="Profile">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </Link>
            <Link href="/dashboard/settings" className={`dash-bottom-bar-item ${pathname === '/dashboard/settings' ? 'dash-bottom-bar-item--active' : ''}`} aria-label="Settings">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </Link>
          </nav>

          {/* Mobile-only: gradient bg, white overlay, brand + tagline + waves + CTA */}
          <div
            className={`dash-mobile-hero ${mobileRevealing ? 'dash-mobile-hero--revealing' : ''} ${mobileWaveRevealed ? 'dash-mobile-hero--revealed' : ''}`}
            aria-hidden="true"
          >
            <div className="dash-mobile-hero-overlay" />
            <div className="dash-mobile-hero-content">
              <h1 className="dash-mobile-brand-name">Rendly</h1>
              <p className="dash-mobile-tagline">Know Your Why, Find Your Who</p>
            </div>
            <div className="dash-mobile-cta-wrap">
              <button
                type="button"
                className="dash-mobile-cta-btn"
                onClick={() => {
                  if (mobileRevealing || mobileWaveRevealed) return;
                  setMobileRevealing(true);
                  setTimeout(() => {
                    setMobileWaveRevealed(true);
                    setMobileRevealing(false);
                  }, 3400);
                }}
                aria-label="Continue"
              >
                <svg
                  className="dash-mobile-cta-arrow"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </button>
            </div>
            <div className="dash-mobile-waves-wrap">
              <div className="dash-mobile-waves">
                <svg
                  className="dash-mobile-waves-svg"
                  viewBox="0 0 1200 120"
                  preserveAspectRatio="none"
                >
                  <path
                    className="dash-mobile-wave dash-mobile-wave-1"
                    d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z"
                  />
                  <path
                    className="dash-mobile-wave dash-mobile-wave-2"
                    d="M0,70 C200,20 400,100 600,70 C800,20 1000,100 1200,70 L1200,120 L0,120 Z"
                  />
                  <path
                    className="dash-mobile-wave dash-mobile-wave-3"
                    d="M0,50 C250,100 450,10 600,50 C750,100 950,10 1200,50 L1200,120 L0,120 Z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Mobile: sliding next section (transparent, waves at top, gradient content below) - slides up over hero */}
          <div
            className={`dash-mobile-next ${mobileRevealing ? 'dash-mobile-next--revealing' : ''} ${mobileWaveRevealed ? 'dash-mobile-next--revealed' : ''}`}
            aria-hidden="true"
          >
            <div className="dash-mobile-next-inner">
              <div className="dash-mobile-next-waves">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="dash-mobile-next-waves-svg">
                  <path className="dash-mobile-next-wave dash-mobile-next-wave-1" d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z" />
                  <path className="dash-mobile-next-wave dash-mobile-next-wave-2" d="M0,70 C200,20 400,100 600,70 C800,20 1000,100 1200,70 L1200,120 L0,120 Z" />
                  <path className="dash-mobile-next-wave dash-mobile-next-wave-3" d="M0,50 C250,100 450,10 600,50 C750,100 950,10 1200,50 L1200,120 L0,120 Z" />
                </svg>
              </div>
              <div className="dash-mobile-next-content" aria-hidden="true">
                {/* Dashboard content not shown on mobile */}
              </div>
            </div>
          </div>
        </main>

        <aside
          className={`dash-sidebar-right ${sidebarOpen ? 'dash-sidebar-right--open' : ''}`}
          aria-hidden={!sidebarOpen}
        >
          <div className="dash-sidebar-right-inner">
            <nav className="dash-sidebar-nav" aria-label="Dashboard navigation">
              <Link href="/dashboard" className="dash-sidebar-nav-item">
                <span className="dash-sidebar-nav-icon" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="9" rx="1" />
                    <rect x="14" y="3" width="7" height="5" rx="1" />
                    <rect x="14" y="12" width="7" height="9" rx="1" />
                    <rect x="3" y="16" width="7" height="5" rx="1" />
                  </svg>
                </span>
                <span className="dash-sidebar-nav-label">Dashboard</span>
              </Link>
              <Link href="/dashboard/chat" className="dash-sidebar-nav-item">
                <span className="dash-sidebar-nav-icon" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <span className="dash-sidebar-nav-label">Whispers</span>
              </Link>
              <Link href="/dashboard/huddles" className="dash-sidebar-nav-item">
                <span className="dash-sidebar-nav-icon" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="9" r="4" />
                    <circle cx="15" cy="9" r="4" />
                    <circle cx="9" cy="15" r="2.5" />
                    <circle cx="15" cy="15" r="2.5" />
                    <path d="M9 11.5V13m6-1.5V13" strokeWidth="1.5" />
                  </svg>
                </span>
                <span className="dash-sidebar-nav-label">Huddles</span>
              </Link>
              <Link href="/dashboard/profile" className="dash-sidebar-nav-item">
                <span className="dash-sidebar-nav-icon" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                  </svg>
                </span>
                <span className="dash-sidebar-nav-label">Profile</span>
              </Link>
              <Link href="/dashboard/settings" className="dash-sidebar-nav-item">
                <span className="dash-sidebar-nav-icon" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </span>
                <span className="dash-sidebar-nav-label">Settings</span>
              </Link>
              <button
                type="button"
                className="dash-sidebar-nav-item dash-sidebar-nav-item--logout"
                onClick={async () => {
                  if (loggingOut) return;
                  setLoggingOut(true);
                  try {
                    await auth.logout();
                    router.push('/login');
                  } catch {
                    setLoggingOut(false);
                  }
                }}
                disabled={loggingOut}
                aria-busy={loggingOut}
                aria-label={loggingOut ? 'Logging out…' : 'Log out'}
              >
                <span className="dash-sidebar-nav-icon" aria-hidden>
                  {loggingOut ? (
                    <span className="dash-sidebar-nav-spinner" />
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  )}
                </span>
                <span className="dash-sidebar-nav-label">{loggingOut ? 'Logging out…' : 'Log out'}</span>
              </button>
            </nav>
          </div>
        </aside>
      </div>
    </DashboardSidebarProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CurrentUserProvider>
      <CallProvider>
        <DashboardLayoutInner>{children}</DashboardLayoutInner>
        <IncomingCallOverlay />
      </CallProvider>
    </CurrentUserProvider>
  );
}
