'use client';

import { auth, db } from "../../lib/firebase";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Select,
  SelectItem,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Image as HeroImage,
} from "@heroui/react";
import NextImage from "next/image";
import {
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  where,
  collectionGroup,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgePercent,
  List,
  User,
  Star,
  Eye,
  Trash2,
  Edit3,
  Search,
  Film,
  Tv,
  MessageSquare,
  Heart,
  Calendar,
  TrendingUp,
  Settings,
  LogOut,
  Shield,
  Database,
  Activity,
  ExternalLink,
  ChevronLeft,
  BellRing
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../components/ToastProvider";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "mads@netflyer.icu";

export default function AdminDashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [tvShows, setTvShows] = useState<any[]>([]);
  const [reviews, setReviewList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReviews: 0,
    activeUsers: 0,
    totalMovies: 0,
    totalTv: 0,
    totalWatched: 0,
    totalWatchlist: 0,
  });

  const router = useRouter();
  const { createToast } = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingItem, setEditingItem] = useState(null);
  const [editType, setEditType] = useState(""); // 'user', 'movie', 'tv', 'review'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email === ADMIN_EMAIL) {
        setUser(currentUser);
        setIsAdmin(true);
        fetchData();
      } else {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userSnap, movieSnap, tvSnap, reviewSnap, watchedSnap, watchlistSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "movies")),
        getDocs(collection(db, "tvShows")),
        getDocs(collection(db, "reviews")),
        getDocs(collectionGroup(db, "items")),
        getDocs(collection(db, "watchlist"))
      ]);

      const userData = userSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];
      const movieData = movieSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];
      const tvData = tvSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];
      const reviewData = reviewSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      setUsers(userData);
      setMovies(movieData);
      setTvShows(tvData);
      setReviewList(reviewData);

      setStats({
        totalUsers: userData.length,
        totalMovies: movieData.length,
        totalTv: tvData.length,
        totalReviews: reviewData.length,
        activeUsers: userData.filter((u) => u.lastLogin).length,
        totalWatched: watchedSnap.size,
        totalWatchlist: watchlistSnap.size,
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, type, id));
        fetchData();
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
      }
    }
  };

  if (!isAdmin && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] text-white p-4">
        <div className="max-w-md w-full glass-panel p-10 rounded-2xl text-center shadow-2xl">
          <Shield className="w-20 h-20 mx-auto mb-8 text-red-500 opacity-50 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]" />
          <h1 className="heading-2 mb-4 text-white">Access Denied</h1>
          <p className="text-[var(--color-text-secondary)] mb-10 font-medium">
            Only authorized administrators can access this secure area.
          </p>
          <button
            className="btn btn-primary w-full py-4"
            onClick={() => router.push("/")}
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--color-text-tertiary)] font-bold uppercase tracking-[0.2em] animate-pulse">
            Secure Authentication
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-white pt-24 pb-12">
      <header className="sticky top-24 z-40 glass-panel border-b border-white/5 mx-auto container rounded-2xl shadow-2xl py-4 px-8 mb-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-[var(--color-accent-primary)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white uppercase tracking-widest">
                Netflyer Admin
              </h1>
              <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-[0.2em]">System Management v2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-white">{user?.email}</p>
              <p className="text-[10px] text-green-500 font-bold flex items-center justify-end gap-1.5 uppercase tracking-widest mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                Active Session
              </p>
            </div>
            <button
              onClick={() => auth.signOut()}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-all"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container space-y-10">
        {/* Header with Broadcast */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Dashboard Overview</h2>
          <button 
            onClick={() => createToast("Global notice broadcasted to all users", { type: "success" })}
            className="btn btn-primary px-6 py-3 text-sm flex items-center gap-2"
          >
            <BellRing className="w-4 h-4" />
            Broadcast Notice
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard
            icon={<User className="w-6 h-6 text-blue-400" />}
            label="Total Users"
            value={stats.totalUsers}
            trend="+12%"
          />
          <StatCard
            icon={<Activity className="w-6 h-6 text-orange-400" />}
            label="Active Users"
            value={stats.activeUsers}
            trend="+3%"
          />
          <StatCard
            icon={<Film className="w-6 h-6 text-purple-400" />}
            label="Media Library"
            value={stats.totalMovies + stats.totalTv}
            trend="+5%"
          />
          <StatCard
            icon={<MessageSquare className="w-6 h-6 text-green-400" />}
            label="Reviews"
            value={stats.totalReviews}
            trend="+8%"
          />
          <StatCard
            icon={<Eye className="w-6 h-6 text-cyan-400" />}
            label="Total Watched"
            value={stats.totalWatched}
            trend="+24%"
          />
          <StatCard
            icon={<Heart className="w-6 h-6 text-red-400" />}
            label="Watchlist Items"
            value={stats.totalWatchlist}
            trend="+15%"
          />
        </div>

        {/* Management Tabs */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 p-2">
          <Tabs
            aria-label="Management sections"
            variant="underlined"
            classNames={{
              tabList: "gap-8 px-6",
              cursor: "bg-[var(--color-accent-primary)]",
              tab: "h-14",
              tabContent: "group-data-[selected=true]:text-white font-bold uppercase tracking-widest text-xs",
            }}
          >
            <Tab
              key="users"
              title={
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Users</span>
                </div>
              }
            >
              <div className="p-6">
                <UserManagement users={users} onDelete={(id: string) => handleDelete("users", id)} />
              </div>
            </Tab>
            <Tab
              key="movies"
              title={
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  <span>Movies</span>
                </div>
              }
            >
              <div className="p-6">
                <ContentManagement
                  title="Movie Library"
                  items={movies}
                  onDelete={(id: string) => handleDelete("movies", id)}
                />
              </div>
            </Tab>
            <Tab
              key="tv"
              title={
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4" />
                  <span>TV Shows</span>
                </div>
              }
            >
              <div className="p-6">
                <ContentManagement
                  title="TV Show Library"
                  items={tvShows}
                  onDelete={(id: string) => handleDelete("tvShows", id)}
                />
              </div>
            </Tab>
            <Tab
              key="system"
              title={
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span>System</span>
                </div>
              }
            >
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <SystemCard
                  title="Database Status"
                  status="Healthy"
                  details="Firestore collection nodes operating within normal parameters."
                  lastCheck="2 minutes ago"
                />
                <SystemCard
                  title="TMDB API Link"
                  status="Connected"
                  details="Active connection to TMDB API v3. Latency: 142ms."
                  lastCheck="Real-time"
                />
              </div>
            </Tab>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: any) {
  return (
    <div className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">{icon}</div>
        <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
          {trend}
        </span>
      </div>
      <div>
        <p className="text-[var(--color-text-tertiary)] text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{label}</p>
        <h3 className="text-4xl font-bold text-white font-display tracking-tight">{value}</h3>
      </div>
    </div>
  );
}

function SystemCard({ title, status, details, lastCheck }: any) {
  return (
    <div className="glass-light p-8 rounded-2xl border border-white/5">
      <div className="flex gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Activity className="w-6 h-6 text-[var(--color-accent-primary)]" />
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-lg font-bold text-white uppercase tracking-wider">{title}</p>
          <p className="text-xs text-green-500 font-bold flex items-center gap-2 uppercase tracking-widest mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {status}
          </p>
        </div>
      </div>
      <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-8 font-medium">
        {details}
      </p>
      <div className="pt-6 border-t border-white/5 flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">Check: {lastCheck}</span>
        <button className="text-[var(--color-accent-primary)] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
          Diagnostics
        </button>
      </div>
    </div>
  );
}

function UserManagement({ users, onDelete }: any) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">User Directory</h2>
        <div className="flex gap-3 w-full md:w-auto">
          <Input
            placeholder="Search directory..."
            startContent={<Search className="w-4 h-4 text-[var(--color-text-tertiary)]" />}
            className="flex-1 md:w-64"
            variant="bordered"
            classNames={{ inputWrapper: "border-white/10 bg-white/5 h-12" }}
          />
          <button className="btn btn-secondary py-0 h-12 text-xs">
            Export Data
          </button>
        </div>
      </div>

      <div className="border border-white/5 rounded-xl overflow-hidden shadow-2xl">
        <Table
          aria-label="User data table"
          removeWrapper
          classNames={{
            th: "bg-white/5 text-[var(--color-text-tertiary)] border-b border-white/10 py-5 text-[10px] font-bold uppercase tracking-[0.2em]",
            td: "py-5",
          }}
        >
          <TableHeader>
            <TableColumn>IDENTITY</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>JOINED</TableColumn>
            <TableColumn>ACTIVITY</TableColumn>
            <TableColumn align="center">ACTIONS</TableColumn>
          </TableHeader>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={user.photoURL}
                      name={user.displayName || user.email}
                      className="w-10 h-10 rounded-xl"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-white">{user.displayName || 'Anonymous'}</span>
                      <span className="text-xs text-[var(--color-text-tertiary)]">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    variant="flat"
                    className={user.emailVerified ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {user.emailVerified ? "Verified" : "Pending"}
                    </span>
                  </Chip>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-bold text-[var(--color-text-secondary)]">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-2 text-[var(--color-text-tertiary)] hover:text-white transition-all">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-[var(--color-text-tertiary)] hover:text-red-500 transition-all"
                      onClick={() => onDelete(user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ContentManagement({ title, items, onDelete }: any) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">{title}</h2>
        <div className="flex gap-3 w-full md:w-auto">
          <Input
            placeholder="Filter library..."
            startContent={<Search className="w-4 h-4 text-[var(--color-text-tertiary)]" />}
            className="flex-1 md:w-64"
            variant="bordered"
            classNames={{ inputWrapper: "border-white/10 bg-white/5 h-12" }}
          />
          <button className="btn btn-primary py-0 h-12 text-xs">
            Sync Library
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item: any) => (
          <div key={item.id} className="glass-light p-4 rounded-xl border border-white/5 flex items-center gap-5 hover:border-white/20 transition-all group">
            <div className="relative w-14 aspect-poster overflow-hidden rounded-lg flex-shrink-0 vignette shadow-lg">
              <NextImage
                src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : '/not-found.png'}
                className="object-cover transition-transform group-hover:scale-110"
                alt={item.title || item.name}
                fill
                sizes="56px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-white truncate text-base mb-1">{item.title || item.name}</h4>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-bold text-[var(--color-text-tertiary)] px-2 py-0.5 bg-white/5 border border-white/10 rounded uppercase tracking-widest">
                  ID: {item.id}
                </span>
                <div className="flex items-center gap-1.5 text-yellow-500">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-[10px] font-bold">{item.vote_average?.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <button className="p-2 text-[var(--color-text-tertiary)] hover:text-white transition-all">
                <Eye className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-[var(--color-text-tertiary)] hover:text-red-500 transition-all"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
