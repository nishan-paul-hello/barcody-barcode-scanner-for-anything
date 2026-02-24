'use client';

import { useState, useMemo } from 'react';
import { useUsers } from '@/hooks/useAnalytics';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  UserCheck,
  UserX,
  Calendar,
  Mail,
} from 'lucide-react';
import { format, formatDistanceToNow, subDays, isAfter } from 'date-fns';

const PAGE_SIZE = 20;

type User = {
  id: string;
  email: string;
  createdAt: string;
  lastLogin?: string | null;
};

type UserListResponse = {
  items: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function isActive(lastLogin?: string | null): boolean {
  if (!lastLogin) return false;
  return isAfter(new Date(lastLogin), subDays(new Date(), 30));
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, isFetching } = useUsers({ page, limit: PAGE_SIZE });
  const users = data as UserListResponse | undefined;
  const items = useMemo(() => users?.items ?? [], [users?.items]);

  // Client-side search filter (backend doesn't support search on users endpoint)
  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (u) => u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q)
    );
  }, [items, search]);

  const activeCount = useMemo(
    () => items.filter((u) => isActive(u.lastLogin)).length,
    [items]
  );

  const neverLoggedIn = useMemo(
    () => items.filter((u) => !u.lastLogin).length,
    [items]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = users?.totalPages ?? 1;
  const total = users?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage and monitor all registered users across the platform.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Total Users"
          value={isLoading ? null : total.toLocaleString()}
          sub="all time registrations"
        />
        <StatCard
          icon={<UserCheck className="h-4 w-4" />}
          label="Active (30d)"
          value={isLoading ? null : activeCount.toLocaleString()}
          sub={`${total > 0 ? ((activeCount / Math.max(users?.items?.length ?? 1, 1)) * 100).toFixed(0) : 0}% of current page`}
          highlight
        />
        <StatCard
          icon={<UserX className="h-4 w-4" />}
          label="Never Logged In"
          value={isLoading ? null : neverLoggedIn.toLocaleString()}
          sub="no login recorded"
        />
        <StatCard
          icon={<Calendar className="h-4 w-4" />}
          label="Page"
          value={isLoading ? null : `${page} / ${totalPages}`}
          sub={`${PAGE_SIZE} per page`}
        />
      </div>

      {/* Search + Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>User Directory</CardTitle>
              <CardDescription>
                {total.toLocaleString()} total registered users
              </CardDescription>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                <input
                  id="user-search"
                  type="text"
                  placeholder="Search by email or ID…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-9 w-64 rounded-md border border-zinc-800 bg-zinc-950 pr-3 pl-8 text-sm text-zinc-100 placeholder-zinc-600 ring-0 transition outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
                />
              </div>
              <button
                type="submit"
                className="h-9 rounded-md bg-zinc-800 px-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700 active:scale-95"
              >
                Search
              </button>
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setSearchInput('');
                  }}
                  className="h-9 rounded-md px-3 text-sm text-zinc-400 transition hover:text-zinc-200"
                >
                  Clear
                </button>
              )}
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <>
              {/* subtle fetching indicator */}
              {isFetching && !isLoading && (
                <div className="mb-3 h-0.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-cyan-500" />
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="py-3 pr-4 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase">
                        Email
                      </th>
                      <th className="py-3 pr-4 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase">
                        Status
                      </th>
                      <th className="py-3 pr-4 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase">
                        Joined
                      </th>
                      <th className="py-3 pr-4 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase">
                        Last Login
                      </th>
                      <th className="py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase">
                        User ID
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-12 text-center text-zinc-500"
                        >
                          No users found{search ? ` for "${search}"` : ''}.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((user) => (
                        <UserRow key={user.id} user={user} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4">
                  <p className="text-muted-foreground text-xs">
                    Page {page} of {totalPages} &mdash; {total.toLocaleString()}{' '}
                    users
                  </p>
                  <div className="flex items-center gap-1">
                    <PagBtn
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      title="First"
                    >
                      <ChevronsLeft className="h-3.5 w-3.5" />
                    </PagBtn>
                    <PagBtn
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      title="Previous"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </PagBtn>

                    {/* Page number pills */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const start = Math.max(
                        1,
                        Math.min(page - 2, totalPages - 4)
                      );
                      const p = start + i;
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`h-7 min-w-7 rounded px-2 text-xs font-medium transition ${
                            p === page
                              ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/50'
                              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}

                    <PagBtn
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      title="Next"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </PagBtn>
                    <PagBtn
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                      title="Last"
                    >
                      <ChevronsRight className="h-3.5 w-3.5" />
                    </PagBtn>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UserRow({ user }: { user: User }) {
  const active = isActive(user.lastLogin);
  const joined = new Date(user.createdAt);
  const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;

  return (
    <tr className="group border-b border-zinc-800/50 transition-colors hover:bg-zinc-900/40">
      {/* Email */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-300">
            {user.email[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex items-center gap-1.5 text-zinc-200">
            <Mail className="h-3 w-3 text-zinc-600" />
            <span className="max-w-[220px] truncate">{user.email}</span>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="py-3 pr-4">
        {active ? (
          <Badge className="border-0 bg-emerald-500/10 text-xs text-emerald-400">
            Active
          </Badge>
        ) : user.lastLogin ? (
          <Badge className="border-0 bg-zinc-700/50 text-xs text-zinc-400">
            Inactive
          </Badge>
        ) : (
          <Badge className="border-0 bg-amber-500/10 text-xs text-amber-400">
            Never logged in
          </Badge>
        )}
      </td>

      {/* Joined */}
      <td className="py-3 pr-4 text-xs text-zinc-400">
        <div>{format(joined, 'MMM d, yyyy')}</div>
        <div className="text-zinc-600">
          {formatDistanceToNow(joined, { addSuffix: true })}
        </div>
      </td>

      {/* Last login */}
      <td className="py-3 pr-4 text-xs text-zinc-400">
        {lastLogin ? (
          <>
            <div>{format(lastLogin, 'MMM d, yyyy')}</div>
            <div className="text-zinc-600">
              {formatDistanceToNow(lastLogin, { addSuffix: true })}
            </div>
          </>
        ) : (
          <span className="text-zinc-600 italic">—</span>
        )}
      </td>

      {/* User ID */}
      <td className="py-3 font-mono text-xs text-zinc-600">
        {user.id.slice(0, 8)}…
      </td>
    </tr>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <span
          className={highlight ? 'text-emerald-400' : 'text-muted-foreground'}
        >
          {icon}
        </span>
      </CardHeader>
      <CardContent>
        {value === null ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <div className="text-xl font-bold">{value}</div>
        )}
        {sub && <p className="text-muted-foreground mt-0.5 text-xs">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function PagBtn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  title: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 border-b border-zinc-800 pb-3">
        {[160, 80, 100, 100, 80].map((w, i) => (
          <Skeleton key={i} style={{ width: w }} className="h-3" />
        ))}
      </div>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
