import React, { useState, useEffect } from 'react';
import { 
  User, 
  Home,
  BookOpen, 
  Calendar, 
  Bell, 
  DollarSign, 
  MessageSquare, 
  Megaphone, 
  Settings, 
  LogOut, 
  Plus, 
  AlertTriangle,
  Trash2, 
  Edit, 
  Edit2,
  CheckCircle, 
  XCircle,
  Mail,
  Shield,
  ArrowLeft,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Search,
  Moon,
  Sun,
  ChevronRight,
  ChevronLeft,
  Menu,
  Clock,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Users,
  Users2,
  Send,
  X,
  Info,
  FileText,
  LayoutDashboard,
  Camera,
  Upload,
  Download,
  Key,
  LifeBuoy,
  CreditCard,
  Library,
  UserCheck,
  Wallet,
  Heart,
  PlusCircle,
  GraduationCap,
  Palette,
  ClipboardList,
  Book,
  Globe,
  ShieldCheck,
  BarChart3,
  Database,
  Calculator,
  Receipt,
  Play,
  Check,
  CloudUpload,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { isSupabaseConfigured, updateSupabaseConfig, supabase } from './lib/supabase';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Role = 'student' | 'faculty' | 'staff' | 'admin';

interface UserData {
  id: string;
  surname: string;
  name: string;
  role: Role;
  status?: 'pending' | 'approved' | 'rejected';
  course?: string;
  yearLevel?: string;
  balance?: number;
  grades?: any[];
  schedule?: any[];
  password?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  profilePic?: string;
  mentorId?: string;
}

export default function App() {
  const [user, setUser] = useState<UserData | null>(() => {
    const saved = localStorage.getItem('aid_portal_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [view, setView] = useState<string>(() => {
    const saved = localStorage.getItem('aid_portal_view');
    return saved || 'landing';
  });
  const [selectedChatUser, setSelectedChatUser] = useState<UserData | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [regData, setRegData] = useState({ 
    id: '', 
    surname: '', 
    name: '', 
    role: 'student' as Role, 
    course: 'BSIT', 
    yearLevel: '1st Year',
    password: '',
    confirmPassword: '',
    securityQuestion: 'What is your favorite color?',
    securityAnswer: ''
  });
  const [error, setError] = useState('');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [financialAid, setFinancialAid] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('aid_portal_dark_mode');
    return saved === 'true';
  });
  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('aid_portal_accent_color') || 'red';
  });
  const [notificationSettings, setNotificationSettings] = useState(() => {
    const saved = localStorage.getItem('aid_portal_notifications');
    return saved ? JSON.parse(saved) : { email: true, push: true, sms: true, reports: true };
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('aid_portal_sidebar_open');
    return saved !== null ? saved === 'true' : true;
  });
  // Database Sync: Provision Faculty Accounts directly to database
  useEffect(() => {
    const provisionFaculty = async () => {
      // IDs to explicitly remove as requested by user
      const facultyToDelete = [
        'FAC-Anton Alvarez', 
        'FAC-Cidric Sanchez', 
        'FAC-Sarno Solis', 
        'FAC-Lucel Luna', 
        'FAC-Dodong Dizon'
      ];

      const facultyToSeed = [
        { id: 'FAC-001', name: 'Faculty', surname: 'One', role: 'faculty', password: 'admin12345', status: 'approved', balance: 0, grades: [], schedule: [] },
        { id: 'FAC-002', name: 'Faculty', surname: 'Two', role: 'faculty', password: 'admin12345', status: 'approved', balance: 0, grades: [], schedule: [] },
        { id: 'FAC-003', name: 'Faculty', surname: 'Three', role: 'faculty', password: 'admin12345', status: 'approved', balance: 0, grades: [], schedule: [] },
        { id: 'FAC-004', name: 'Faculty', surname: 'Four', role: 'faculty', password: 'admin12345', status: 'approved', balance: 0, grades: [], schedule: [] },
        { id: 'FAC-005', name: 'Faculty', surname: 'Five', role: 'faculty', password: 'admin12345', status: 'approved', balance: 0, grades: [], schedule: [] }
      ];

      try {
        // First, remove the unwanted faculty records
        await supabase
          .from('users')
          .delete()
          .in('id', facultyToDelete);

        // Then, use upsert to directly synchronize the intended faculty with the database
        const { error } = await supabase
          .from('users')
          .upsert(facultyToSeed, { onConflict: 'id' });
        
        if (error) {
          console.error("Database provisioning failed:", error.message);
        } else {
          // Refresh local user state only after successful sync
          fetchUsers();
        }
      } catch (err) {
        console.error("Unexpected error during provisioning:", err);
      }
    };
    
    provisionFaculty();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ users: UserData[], announcements: any[], applications: any[] } | null>(null);
  const [policies, setPolicies] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'danger' });

  const [selectedScholarship, setSelectedScholarship] = useState<string | null>(null);
  const [selectedStudentForRec, setSelectedStudentForRec] = useState<{id: string, name: string} | null>(null);
  const [gradeEntryFilter, setGradeEntryFilter] = useState('');
  const [classListMode, setClassListMode] = useState<'list' | 'enroll'>('list');
  const [selectedApplicationForSummary, setSelectedApplicationForSummary] = useState<any>(null);
  const [previewFile, setPreviewFile] = useState<{name: string, data: string} | null>(null);

  // Persist state
  useEffect(() => {
    if (user) {
      localStorage.setItem('aid_portal_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aid_portal_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('aid_portal_sidebar_open', String(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('aid_portal_view', view);
  }, [view]);

  useEffect(() => {
    localStorage.setItem('aid_portal_dark_mode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('aid_portal_sidebar_open', isSidebarOpen.toString());
  }, [isSidebarOpen]);

  const [mentors, setMentors] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [communityEvents, setCommunityEvents] = useState<any[]>([]);
  const [communityOrgs, setCommunityOrgs] = useState<any[]>([]);

  // Fetch data
  useEffect(() => {
    if (user) {
      fetchAnnouncements();
      fetchUsers();
      fetchMessages();
      fetchFinancialAid();
      fetchScholarships();
      fetchRecommendations();
      fetchNotifications();
      fetchPolicies();
      fetchMentors();
      fetchResources();
      fetchCourses();
      fetchCommunityData();
      fetchTransactions();
    }
  }, [user?.id]);

  // Seed demo data for applications to make "Application Status Distribution" functional
  useEffect(() => {
    const seedApplications = async () => {
      if (user && user.role === 'admin' && financialAid.length === 0) {
        const demoApps = [
          { studentId: 'SCC-26-00000001', studentName: 'John Doe', program: 'Academic Scholarship', type: 'Scholarship', date: new Date().toISOString(), status: 'pending', facultyId: null },
          { studentId: 'SCC-26-00000002', studentName: 'Jane Smith', program: 'Financial Assistance', type: 'Financial Aid', date: new Date().toISOString(), status: 'approved', facultyId: 'FAC-001' },
          { studentId: 'SCC-26-00000003', studentName: 'Bob Wilson', program: 'Sports Grant', type: 'Scholarship', date: new Date().toISOString(), status: 'rejected', facultyId: 'FAC-002' },
          { studentId: 'SCC-26-00000004', studentName: 'Alice Brown', program: 'Academic Scholarship', type: 'Scholarship', date: new Date().toISOString(), status: 'pending', facultyId: null },
          { studentId: 'SCC-26-00000005', studentName: 'Charlie Davis', program: 'Financial Assistance', type: 'Financial Aid', date: new Date().toISOString(), status: 'approved', facultyId: 'FAC-003' }
        ];
        
        const { error } = await supabase.from('financial_aid').upsert(demoApps);
        if (!error) fetchFinancialAid();
      }
    };
    seedApplications();
  }, [user, financialAid.length]);

  const fetchMentors = async () => {
    const { data, error } = await supabase.from('mentors').select('*');
    if (!error && data) setMentors(data);
  };

  const fetchResources = async () => {
    const { data, error } = await supabase.from('resources').select('*');
    if (!error && data) setResources(data);
  };

  const fetchCourses = async () => {
    const { data, error } = await supabase.from('courses').select('*');
    if (!error && data) setCourses(data);
  };

  const fetchCommunityData = async () => {
    const { data: events, error: eError } = await supabase.from('community_events').select('*');
    const { data: orgs, error: oError } = await supabase.from('community_orgs').select('*');
    if (!eError && events) setCommunityEvents(events);
    if (!oError && orgs) setCommunityOrgs(orgs);
  };

  // Generate ID for registration
  useEffect(() => {
    const generateSequentialId = async () => {
      if (isRegistering && !regData.id) {
        try {
          const year = new Date().getFullYear().toString().slice(-2);
          
          // Fetch the total count of users to determine the next sequence number
          const { count, error } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

          if (error) throw error;

          const nextNumber = (count || 0) + 1;
          const paddedNumber = nextNumber.toString().padStart(8, '0');
          const generatedId = `SCC-${year}-${paddedNumber}`;
          
          setRegData(prev => ({ ...prev, id: generatedId }));
        } catch (err) {
          console.error('Error generating sequential ID:', err);
          // Fallback to random if count fails
          const year = new Date().getFullYear().toString().slice(-2);
          const random = Math.floor(10000000 + Math.random() * 90000000);
          setRegData(prev => ({ ...prev, id: `SCC-${year}-${random}` }));
        }
      }
    };

    generateSequentialId();
  }, [isRegistering, regData.id]);

  const fetchPolicies = async () => {
    const { data, error } = await supabase
      .from('policies')
      .select('*');
    if (!error && data) {
      setPolicies(data[0] || null);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('userId', user.id)
      .order('timestamp', { ascending: false });
    
    if (!error && data) {
      setNotifications(data);
    }
  };

  const markNotificationsRead = async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('userId', user.id);
    
    fetchNotifications();
  };

  const fetchScholarships = async () => {
    const { data, error } = await supabase
      .from('scholarships')
      .select('*');
    
    if (!error && data) {
      setScholarships(data);
    }
  };

  const fetchRecommendations = async () => {
    const { data, error } = await supabase
      .from('recommendations')
      .select('*');
    
    if (!error && data) {
      setRecommendations(data);
    }
  };

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('date', { ascending: false });
    
    if (!error && data) {
      setAnnouncements(data);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    let query = supabase
      .from('transactions')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (user.role === 'student') {
      query = query.eq('userId', user.id);
    }
    
    const { data, error } = await query;
    if (!error && data) setTransactions(data);
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (!error && data) {
        setUsers(data);
        if (user) {
          const freshUser = data.find(u => u.id === user.id);
          if (freshUser) {
            setUser(freshUser);
            localStorage.setItem('aid_portal_user', JSON.stringify(freshUser));
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    const q = query.toLowerCase();
    const filteredUsers = users.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.id.toLowerCase().includes(q) || 
      u.role.toLowerCase().includes(q)
    );
    const filteredAnnouncements = announcements.filter(a => 
      a.title.toLowerCase().includes(q) || 
      a.content.toLowerCase().includes(q)
    );
    const filteredApplications = financialAid.filter(f => 
      f.studentName?.toLowerCase().includes(q) || 
      f.program?.toLowerCase().includes(q) || 
      f.status?.toLowerCase().includes(q)
    );

    setSearchResults({
      users: filteredUsers,
      announcements: filteredAnnouncements,
      applications: filteredApplications
    });
    setView('search');
  };

  const fetchMessages = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`to.eq.${user.id},from.eq.${user.id}`)
      .order('timestamp', { ascending: true });
    
    if (!error && data) {
      setMessages(data);
    }
  };

  const fetchFinancialAid = async () => {
    const { data, error } = await supabase
      .from('financial_aid')
      .select('*');
    
    if (!error && data) {
      setFinancialAid(data);
    }
  };

  const updateFinancialAidStatus = async (id: number, status: string) => {
    const app = financialAid.find(a => a.id === id);
    if (!app) return;

    const { error: updateError } = await supabase
      .from('financial_aid')
      .update({ status })
      .eq('id', id);

    if (!updateError) {
      logActivity('FINANCIAL_AID_UPDATE', `Application #${id} status updated to ${status}`, 'Successful');
    }
    
    // If approved, deduct from student balance and log transaction
    if (status === 'approved' && !updateError) {
      const student = users.find(u => u.id === app.studentId);
      if (student) {
        const aidAmount = parseInt(app.amount?.replace(/[^0-9]/g, '') || '0');
        const prevBal = student.balance || 0;
        const newBalance = Math.max(0, prevBal - aidAmount);

        // Update student balance
        await supabase
          .from('users')
          .update({ balance: newBalance })
          .eq('id', student.id);

        // Log transaction
        await supabase.from('transactions').insert({
          userId: student.id,
          userName: `${student.name} ${student.surname}`,
          amount: aidAmount,
          type: 'Aid Disbursement',
          method: 'CREDIT',
          status: 'Successful',
          timestamp: new Date().toISOString(),
          prevBalance: prevBal,
          updatedBalance: newBalance,
          details: `Financial assistance for ${app.program} approved and applied to outstanding balance.`
        });
      }
    }

    // Create notification for student
    let notificationType: 'success' | 'error' | 'info' = 'info';
    if (status === 'approved') notificationType = 'success';
    if (status === 'rejected') notificationType = 'error';

    await supabase.from('notifications').insert({
      userId: app.studentId,
      title: "Application Update",
      message: `Your application for ${app.program} has been ${status}.`,
      type: notificationType,
      read: false,
      timestamp: new Date().toISOString()
    });

    fetchFinancialAid();
    fetchUsers();
    fetchTransactions();
  };

  const deleteFinancialAid = async (id: number) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    const { error } = await supabase
      .from('financial_aid')
      .delete()
      .eq('id', id);
    if (!error) {
      fetchFinancialAid();
    }
  };

  const handleUpdateFinancialAid = async (id: number, updates: any) => {
    const { error } = await supabase
      .from('financial_aid')
      .update(updates)
      .eq('id', id);
    if (!error) {
      fetchFinancialAid();
    }
  };

  const assignFaculty = async (applicationId: number, facultyId: string) => {
    await supabase
      .from('financial_aid')
      .update({ facultyId })
      .eq('id', applicationId);
    
    // Create notification for faculty
    await supabase.from('notifications').insert({
      userId: facultyId,
      title: "New Assignment",
      message: `You have been assigned to review an application.`,
      type: 'info',
      read: false,
      timestamp: new Date().toISOString()
    });

    fetchFinancialAid();
  };

  const logActivity = async (action: string, details: string, status: string = 'Successful', overrideUser?: UserData | null) => {
    const currentUser = overrideUser || user;
    if (!currentUser) return;

    try {
      await supabase.from('audit_logs').insert({
        userId: currentUser.id,
        userName: `${currentUser.name} ${currentUser.surname}`,
        role: currentUser.role,
        action: action.toUpperCase(),
        details,
        status,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Logging error:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', loginId)
        .eq('password', loginPassword)
        .single();

      if (error || !data) {
        setError('Invalid ID or password');
        // Log failed attempt if ID exists
        if (loginId) {
          logActivity('LOGIN_FAILED', `Failed login attempt for ID: ${loginId}`, 'Failed', { id: loginId, name: 'Unknown', surname: 'User', role: 'student' } as UserData);
        }
        return;
      }

      if (data.status === 'pending') {
        setError('Your account is pending approval');
        logActivity('LOGIN_BLOCKED', `Login attempt blocked: Account pending approval`, 'Blocked', data);
        return;
      }

      if (data.status === 'rejected') {
        setError('Your account has been rejected');
        logActivity('LOGIN_BLOCKED', `Login attempt blocked: Account rejected`, 'Blocked', data);
        return;
      }

      setUser(data);
      setView('dashboard');
      
      // Log audit
      logActivity('LOGIN', `User ${data.id} logged in successfully`, 'Successful', data);

    } catch (err) {
      console.error('Login error:', err);
      setError('Connection failed. Please check your internet.');
    }
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) return "Password must be at least 8 characters long.";
    if (!hasUpperCase) return "Password must contain at least one uppercase letter.";
    if (!hasLowerCase) return "Password must contain at least one lowercase letter.";
    if (!hasNumbers) return "Password must contain at least one number.";
    if (!hasSpecialChar) return "Password must contain at least one special character.";
    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (regData.password !== regData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(regData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      // Check if ID already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', regData.id)
        .single();
      
      if (existingUser) {
        setError('School ID Number already exists. Please use a unique ID.');
        return;
      }

      const { confirmPassword, ...dataToInsert } = regData;
      
      // EXCLUSIVE ID FORMATTING: Force FAC-Firstname Surname for Faculty roles
      let finalId = regData.id;
      if (regData.role === 'faculty') {
        finalId = `FAC-${regData.name} ${regData.surname}`;
      }

      const newUser = {
        ...dataToInsert,
        id: finalId,
        status: 'approved',
        balance: 0,
        grades: [],
        schedule: []
      };

      const { error } = await supabase
        .from('users')
        .insert(newUser);

      if (error) {
        setError(error.message);
        logActivity('REGISTER_FAILED', `Registration failed for ${regData.id}: ${error.message}`, 'Failed', { id: regData.id, name: regData.name, surname: regData.surname, role: regData.role } as UserData);
        return;
      }

      const registeredId = regData.id;
      setIsRegistering(false);
      setLoginId(registeredId);
      setLoginPassword(regData.password);
      setError(`Registration successful! Your School ID is: ${registeredId}. You can now log in and start using your account.`);
      setView('login');

      // Log audit
      logActivity('REGISTER', `New user ${registeredId} registered as ${regData.role}`, 'Successful', { id: registeredId, name: regData.name, surname: regData.surname, role: regData.role } as UserData);

      // Reset registration data for next time
      setRegData({ 
        id: '', 
        surname: '', 
        name: '', 
        role: 'student' as Role, 
        course: 'BSIT', 
        yearLevel: '1st Year',
        password: '',
        confirmPassword: '',
        securityQuestion: 'What is your favorite color?',
        securityAnswer: ''
      });

    } catch (err) {
      console.error('Register error:', err);
      setError('Registration failed. Connection error.');
    }
  };

  const handleLogout = () => {
    // Clear all persistent data
    localStorage.removeItem('aid_portal_user');
    localStorage.removeItem('aid_portal_view');
    
    if (user) {
      logActivity('LOGOUT', `User ${user.name} ${user.surname} logged out`, 'Successful');
    }
    
    setUser(null);
    setView('landing');
    setLoginId('');
    setLoginPassword('');
    setIsRegistering(false);
    setIsForgotPassword(false);
  };

  if (!user && view === 'landing') {
    return <LandingPage onGetStarted={() => setView('login')} onRegister={() => { setView('login'); setIsRegistering(true); }} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex flex-col font-sans">
        <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
          <button onClick={() => setView('landing')} className="flex items-center gap-2 text-stone-900 font-bold text-xl">
            <Shield className="w-6 h-6" />
            Student Aid Portal
          </button>
        </nav>
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-stone-200"
          >
            {error && (
              <div className={cn(
                "p-3 rounded-xl mb-4 text-sm text-center",
                error.includes('successful') ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              )}>
                {error}
              </div>
            )}

            {isForgotPassword ? (
              <ForgotPassword 
                onBack={() => setIsForgotPassword(false)} 
                isDarkMode={isDarkMode} 
                setError={setError}
              />
            ) : !isRegistering ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="text-center mb-8">
                  <div className="inline-block p-4 bg-red-50 rounded-full mb-4">
                    <Shield className="w-8 h-8 text-red-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-[#1a2b4b]">Welcome Back</h1>
                  <p className="text-stone-500 mt-2">Sign in to Student Aid Portal</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">School ID Number</label>
                  <input 
                    type="text" 
                    value={loginId || ''}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all"
                    placeholder="SCC-00-00000000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={loginPassword || ''}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all pr-12 text-stone-900"
                      placeholder="Enter your password"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <button 
                    type="button" 
                    onClick={() => setIsForgotPassword(true)}
                    className="text-red-600 text-sm font-medium hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-100">
                  <LogIn className="w-5 h-5" />
                  Login
                </button>
                
                <div className="pt-6 border-t border-stone-100">
                  <p className="text-center text-sm text-stone-500">
                    Don't have an account? <button type="button" onClick={() => setIsRegistering(true)} className="text-red-600 font-bold hover:underline">Register here</button>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <button 
                  type="button" 
                  onClick={() => setIsRegistering(false)}
                  className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors mb-6 text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </button>

                <div className="text-center mb-8">
                  <div className="inline-block p-4 bg-red-50 rounded-full mb-4">
                    <Shield className="w-8 h-8 text-red-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-[#1a2b4b]">Create Account</h1>
                  <p className="text-stone-500 mt-2">Join the Student Aid Portal</p>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl mb-6">
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Assigned School ID</label>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-mono font-black text-red-600">{regData.id || 'Generating...'}</p>
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase">Read Only</span>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-2 italic">Please remember this ID. You will use it to log in once your account is approved. (Much better to screenshot this!)</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={regData.name || ''}
                      onChange={(e) => setRegData({...regData, name: e.target.value})}
                      className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Surname</label>
                    <input 
                      type="text" 
                      value={regData.surname || ''}
                      onChange={(e) => setRegData({...regData, surname: e.target.value})}
                      className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
                    <input 
                      type="password" 
                      value={regData.password || ''}
                      onChange={(e) => setRegData({...regData, password: e.target.value})}
                      className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all"
                      placeholder="Create a password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Confirm Password</label>
                    <input 
                      type="password" 
                      value={regData.confirmPassword || ''}
                      onChange={(e) => setRegData({...regData, confirmPassword: e.target.value})}
                      className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all"
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>

                <div className="text-[10px] text-stone-500 bg-stone-50 p-3 rounded-xl space-y-1">
                  <p className="font-bold uppercase tracking-widest text-stone-400 mb-1">Password Requirements:</p>
                  <p className={cn(regData.password.length >= 8 ? "text-emerald-600" : "text-stone-400")}>• Minimum 8 characters</p>
                  <p className={cn(/[A-Z]/.test(regData.password) ? "text-emerald-600" : "text-stone-400")}>• At least one uppercase letter</p>
                  <p className={cn(/[a-z]/.test(regData.password) ? "text-emerald-600" : "text-stone-400")}>• At least one lowercase letter</p>
                  <p className={cn(/\d/.test(regData.password) ? "text-emerald-600" : "text-stone-400")}>• At least one number</p>
                  <p className={cn(/[!@#$%^&*(),.?":{}|<>]/.test(regData.password) ? "text-emerald-600" : "text-stone-400")}>• At least one special character</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Security Question</label>
                  <select 
                    value={regData.securityQuestion}
                    onChange={(e) => setRegData({...regData, securityQuestion: e.target.value})}
                    className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all appearance-none text-stone-900"
                  >
                    <option>What is your favorite color?</option>
                    <option>What was your first pet's name?</option>
                    <option>What is your mother's maiden name?</option>
                    <option>What city were you born in?</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Security Answer</label>
                  <input 
                    type="text" 
                    value={regData.securityAnswer || ''}
                    onChange={(e) => setRegData({...regData, securityAnswer: e.target.value})}
                    className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all"
                    placeholder="Your answer"
                    required
                  />
                </div>

                <div className="hidden">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Role</label>
                  <select 
                    value={regData.role}
                    onChange={(e) => setRegData({...regData, role: e.target.value as Role})}
                    className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all appearance-none text-stone-900"
                  >
                    <option value="student">Student</option>
                  </select>
                </div>

                {regData.role === 'student' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Course</label>
                      <select 
                        value={regData.course}
                        onChange={(e) => setRegData({...regData, course: e.target.value})}
                        className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all appearance-none text-stone-900"
                      >
                        <option value="BSIT">BSIT</option>
                        <option value="BSBA">BSBA</option>
                        <option value="BSHM">BSHM</option>
                        <option value="BSED">BSED</option>
                        <option value="BEED">BEED</option>
                        <option value="BSCRIM">BSCRIM</option>
                        <option value="BSCS">BSCS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Year Level</label>
                      <select 
                        value={regData.yearLevel}
                        onChange={(e) => setRegData({...regData, yearLevel: e.target.value})}
                        className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all appearance-none text-stone-900"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                  </>
                )}

                <button className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-100">
                  <UserPlus className="w-5 h-5" />
                  Register
                </button>
                <p className="text-center text-sm text-stone-500 mt-4">
                  Already have an account? <button type="button" onClick={() => setIsRegistering(false)} className="text-red-600 font-bold hover:underline">Login here</button>
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen flex transition-colors duration-300",
      isDarkMode ? "bg-[#0A0A0A] text-white" : "bg-[#F8FAFC] text-slate-900",
      "font-sans"
    )}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(true)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:relative z-50 h-screen transition-all duration-300 border-r",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200",
        isSidebarOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full lg:w-20 lg:translate-x-0"
      )}>
        <div className="h-full flex flex-col overflow-hidden">
          <div className={cn(
            "p-6 flex items-center transition-all",
            isSidebarOpen ? "justify-between" : "justify-center"
          )}>
            {isSidebarOpen && (
              <h2 className="font-black tracking-tighter flex items-center gap-3 transition-all text-2xl opacity-100">
                <Shield className={cn(
                  "w-8 h-8 shrink-0",
                  accentColor === 'red' ? "text-red-600" :
                  accentColor === 'blue' ? "text-blue-600" :
                  accentColor === 'emerald' ? "text-emerald-600" :
                  "text-amber-600"
                )} />
                <span className="truncate">PORTAL</span>
              </h2>
            )}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={cn(
                "p-2 rounded-xl transition-colors hidden lg:block",
                isDarkMode ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-100 text-slate-500"
              )}
            >
              {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            {/* Mobile Close Button */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className={cn(
                "p-2 rounded-xl transition-colors lg:hidden",
                isDarkMode ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-100 text-slate-500"
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
            {user.role !== 'faculty' && (
              <>
                <NavCategory label="MAIN" collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Home />} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                <NavItem icon={<User />} label="My Profile" active={view === 'profile'} onClick={() => setView('profile')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
              </>
            )}
            
            {user.role === 'student' && (
              <>
                <NavCategory label="ACADEMIC" collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<BookOpen />} label="My Grades" active={view === 'grades'} onClick={() => setView('grades')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                <NavItem icon={<Calendar />} label="Class Schedule" active={view === 'schedule'} onClick={() => setView('schedule')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                <NavItem icon={<LifeBuoy />} label="Academic Support" active={view === 'academic-support'} onClick={() => setView('academic-support')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                
                <NavCategory label="FINANCIAL" collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<DollarSign />} label="Financial Aid" active={view === 'finance'} onClick={() => setView('finance')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                <NavItem icon={<Wallet />} label="Balance & Payments" active={view === 'payments'} onClick={() => setView('payments')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                <NavItem icon={<Receipt />} label="Transaction Log" active={view === 'transactions'} onClick={() => setView('transactions')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
              </>
            )}
            
            {user.role === 'student' && (
              <>
                <NavCategory label="SUPPORT" collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Heart />} label="Mentorship & Counseling" active={view === 'mentorship'} onClick={() => setView('mentorship')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                <NavItem icon={<Library />} label="Resource Library" active={view === 'resources'} onClick={() => setView('resources')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                <NavItem icon={<Users />} label="Community" active={view === 'community'} onClick={() => setView('community')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                
                <NavCategory label="COMMUNICATION" collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<MessageSquare />} label="Messages" active={view === 'messages'} onClick={() => setView('messages')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                <NavItem icon={<Megaphone />} label="Announcements" active={view === 'announcements'} onClick={() => setView('announcements')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
              </>
            )}

            {user.role === 'admin' && (
              <>
                <NavCategory label="USER MANAGEMENT" collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Users />} label="Users" active={view === 'admin'} onClick={() => setView('admin')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                
                <NavCategory label="FINANCIAL MANAGEMENT" collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<DollarSign />} label="Financial Aid Applications" active={view === 'applications'} onClick={() => setView('applications')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                <NavItem icon={<Award />} label="Post Aid Programs" active={view === 'programs'} onClick={() => setView('programs')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                <NavItem icon={<Receipt />} label="Transactions" active={view === 'transactions'} onClick={() => setView('transactions')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />

                <NavCategory label="ACADEMIC" collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Book />} label="Courses" active={view === 'courses'} onClick={() => setView('courses')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                <NavItem icon={<UserPlus />} label="Course Enrollment" active={view === 'enrollment'} onClick={() => setView('enrollment')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                <NavItem icon={<ClipboardList />} label="Grades Management" active={view === 'grades-mgmt'} onClick={() => setView('grades-mgmt')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />

                <NavCategory label="CONTENT" collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Megaphone />} label="Announcements" active={view === 'announcements'} onClick={() => setView('announcements')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                <NavItem icon={<Library />} label="Resource Library" active={view === 'resources'} onClick={() => setView('resources')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                <NavItem icon={<Heart />} label="Mentorship" active={view === 'mentorship'} onClick={() => setView('mentorship')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                
                <NavCategory label="SYSTEM" collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<BarChart3 />} label="Reports & Analytics" active={view === 'reports'} onClick={() => setView('reports')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                <NavItem icon={<Database />} label="Transaction Logs Dashboard" active={view === 'activity'} onClick={() => setView('activity')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                <NavItem icon={<Settings />} label="Settings" active={view === 'settings'} onClick={() => setView('settings')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
              </>
            )}

            {user.role === 'faculty' && (
              <>
                <NavItem icon={<Home />} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                <NavItem icon={<User />} label="My Profile" active={view === 'profile'} onClick={() => setView('profile')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />

                <NavCategory label="TEACHING" collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Book />} label="My Courses" active={view === 'courses'} onClick={() => setView('courses')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                <NavItem icon={<ClipboardList />} label="Grade Entry" active={view === 'grade-entry'} onClick={() => setView('grade-entry')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />

                <NavCategory label="STUDENTS" collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Users />} label="My Students" active={view === 'students'} onClick={() => setView('students')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                <NavItem icon={<Users2 />} label="Mentorship" active={view === 'mentorship'} onClick={() => setView('mentorship')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />

                <NavCategory label="COMMUNICATION" collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Mail />} label="Messages" active={view === 'messages'} onClick={() => setView('messages')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
                <NavItem icon={<Megaphone />} label="Announcements" active={view === 'announcements'} onClick={() => setView('announcements')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} accentColor={accentColor} />
              </>
            )}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium relative group",
                isDarkMode ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                !isSidebarOpen && "justify-center"
              )}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {isSidebarOpen && <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
              {!isSidebarOpen && (
                <div className={cn(
                  "absolute left-full ml-4 px-3 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 z-50 whitespace-nowrap",
                  isDarkMode ? "bg-white text-slate-900" : "bg-slate-900 text-white"
                )}>
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </div>
              )}
            </button>
            <button 
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium text-red-500 relative group",
                isDarkMode ? "hover:bg-red-500/10" : "hover:bg-red-50",
                !isSidebarOpen && "justify-center"
              )}
            >
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span>Logout</span>}
              {!isSidebarOpen && (
                <div className={cn(
                  "absolute left-full ml-4 px-3 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 z-50 whitespace-nowrap",
                  isDarkMode ? "bg-white text-slate-900" : "bg-slate-900 text-white"
                )}>
                  Logout
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className={cn(
          "h-20 border-b flex items-center justify-between px-8 shrink-0 transition-colors",
          isDarkMode ? "bg-[#0A0A0A] border-white/5" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={cn(
                "p-2 rounded-xl lg:hidden transition-colors",
                isDarkMode ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-100 text-slate-500"
              )}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className={cn(
              "relative w-full group",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>
              <Search className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors",
                accentColor === 'red' ? "group-focus-within:text-red-600" :
                accentColor === 'blue' ? "group-focus-within:text-blue-600" :
                accentColor === 'emerald' ? "group-focus-within:text-emerald-600" :
                "group-focus-within:text-amber-600"
              )} />
              <input 
                type="text" 
                placeholder="Search anything (users, announcements, applications)..." 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className={cn(
                  "w-full pl-12 pr-4 py-3 rounded-2xl outline-none border transition-all",
                  isDarkMode 
                    ? cn(
                        "bg-white/5 border-white/10",
                        accentColor === 'red' ? "focus:border-red-600/50" :
                        accentColor === 'blue' ? "focus:border-blue-600/50" :
                        accentColor === 'emerald' ? "focus:border-emerald-600/50" :
                        "focus:border-amber-600/50"
                      )
                    : cn(
                        "bg-slate-50 border-slate-200",
                        accentColor === 'red' ? "focus:border-red-600 focus:ring-red-600/5" :
                        accentColor === 'blue' ? "focus:border-blue-600 focus:ring-blue-600/5" :
                        accentColor === 'emerald' ? "focus:border-emerald-600 focus:ring-emerald-600/5" :
                        "focus:border-amber-600 focus:ring-amber-600/5",
                        "focus:ring-4"
                      )
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markNotificationsRead();
                }}
                className={cn(
                  "p-3 rounded-2xl relative transition-all",
                  isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
                )}
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => !n.read) && (
                  <span className={cn(
                    "absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white dark:border-[#0A0A0A]",
                    accentColor === 'red' ? "bg-red-600" :
                    accentColor === 'blue' ? "bg-blue-600" :
                    accentColor === 'emerald' ? "bg-emerald-600" :
                    "bg-amber-600"
                  )}></span>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={cn(
                      "absolute right-0 mt-4 w-80 rounded-[2rem] border shadow-2xl z-50 overflow-hidden",
                      isDarkMode ? "bg-[#111111] border-white/10" : "bg-white border-slate-200"
                    )}
                  >
                    <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <h3 className="font-black tracking-tight">Notifications</h3>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                        accentColor === 'red' ? "text-red-600 bg-red-50" :
                        accentColor === 'blue' ? "text-blue-600 bg-blue-50" :
                        accentColor === 'emerald' ? "text-emerald-600 bg-emerald-50" :
                        "text-amber-600 bg-amber-50"
                      )}>
                        {notifications.filter(n => !n.read).length} New
                      </span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-12 text-center">
                          <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                          <p className="text-sm font-bold text-slate-400 italic">No notifications yet</p>
                        </div>
                      ) : (
                        (notifications || []).slice().reverse().map((n: any, i: number) => (
                          <div key={i} className={cn(
                            "p-4 border-b border-slate-50 dark:border-white/5 last:border-0 transition-colors",
                            !n.read && (isDarkMode ? "bg-white/5" : "bg-red-50/30")
                          )}>
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                n.type === 'success' ? "bg-emerald-500" : n.type === 'error' ? "bg-red-500" : "bg-blue-500"
                              )} />
                              <div>
                                <h4 className="text-sm font-black mb-1">{n.title}</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                                  {new Date(n.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold truncate max-w-[150px]">{user.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">{user.role}</p>
              </div>
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg overflow-hidden",
                accentColor === 'red' ? "bg-red-600 shadow-red-600/20" :
                accentColor === 'blue' ? "bg-blue-600 shadow-blue-600/20" :
                accentColor === 'emerald' ? "bg-emerald-600 shadow-emerald-600/20" :
                "bg-amber-600 shadow-amber-600/20"
              )}>
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  user.name[0]
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
              user.role === 'admin' ? (
                <AdminDashboard 
                  user={user}
                  users={users} 
                  isDarkMode={isDarkMode} 
                  financialAid={financialAid} 
                  scholarships={scholarships} 
                  announcements={announcements}
                  transactions={transactions}
                  updateFinancialAidStatus={updateFinancialAidStatus}
                  setView={setView} 
                />
              ) : user.role === 'faculty' ? (
                <FacultyDashboard 
                  user={user} 
                  isDarkMode={isDarkMode} 
                  financialAid={financialAid} 
                  scholarships={scholarships} 
                  recommendations={recommendations} 
                  fetchRecommendations={fetchRecommendations} 
                  users={users} 
                  fetchUsers={fetchUsers} 
                  setView={setView} 
                  selectedStudentForRec={selectedStudentForRec} 
                  setSelectedStudentForRec={setSelectedStudentForRec} 
                />
              ) : (
                <StudentDashboard 
                  user={user} 
                  isDarkMode={isDarkMode} 
                  setView={setView} 
                  announcements={announcements} 
                  scholarships={scholarships} 
                  financialAid={financialAid} 
                  users={users}
                  mentors={mentors}
                  transactions={transactions}
                />
              )
            )}
            {view === 'search' && <SearchResults results={searchResults} query={searchQuery} isDarkMode={isDarkMode} />}
            {view === 'profile' && <Profile user={user} setUser={setUser} isDarkMode={isDarkMode} />}
            {view === 'grades' && <Grades user={user} isDarkMode={isDarkMode} users={users} />}
            {view === 'schedule' && <Schedule user={user} isDarkMode={isDarkMode} />}
            {view === 'courses' && <CoursesView isDarkMode={isDarkMode} setView={setView} setGradeEntryFilter={setGradeEntryFilter} users={users} fetchUsers={fetchUsers} facultyUser={user} courses={courses} fetchCourses={fetchCourses} isAdmin={user.role === 'admin'} logActivity={logActivity} />}
            {view === 'grade-entry' && <GradeEntryView users={users} isDarkMode={isDarkMode} facultyUser={user} fetchUsers={fetchUsers} initialFilter={gradeEntryFilter} setGradeEntryFilter={setGradeEntryFilter} courses={courses} logActivity={logActivity} />}
            {view === 'finance' && <FinancialAid user={user} financialAid={financialAid} fetchFinancialAid={fetchFinancialAid} isDarkMode={isDarkMode} selectedScholarship={selectedScholarship} setSelectedScholarship={setSelectedScholarship} users={users} scholarships={scholarships} />}
            {view === 'messages' && <Messages user={user} messages={messages} fetchMessages={fetchMessages} users={users} isDarkMode={isDarkMode} selectedChatUser={selectedChatUser} setSelectedChatUser={setSelectedChatUser} courses={courses} mentors={mentors} />}
            {view === 'documents' && <Documents user={user} isDarkMode={isDarkMode} />}
            {view === 'announcements' && <Announcements announcements={announcements} user={user} isDarkMode={isDarkMode} fetchAnnouncements={fetchAnnouncements} setConfirmConfig={setConfirmConfig} activeModal={activeModal} setActiveModal={setActiveModal} logActivity={logActivity} />}
            {view === 'admin' && <AdminPanel users={users} fetchUsers={fetchUsers} isDarkMode={isDarkMode} setConfirmConfig={setConfirmConfig} />}
            {view === 'transactions' && <TransactionsView user={user} isDarkMode={isDarkMode} transactions={transactions} fetchTransactions={fetchTransactions} />}
            {view === 'enrollment' && <EnrollmentView isDarkMode={isDarkMode} users={users} courses={courses} fetchUsers={fetchUsers} fetchCourses={fetchCourses} logActivity={logActivity} />}
            {view === 'grades-mgmt' && <GradesMgmtView users={users} isDarkMode={isDarkMode} fetchUsers={fetchUsers} initialFilter={gradeEntryFilter} />}
            {view === 'students' && <StudentsView users={users} isDarkMode={isDarkMode} currentUser={user} courses={courses} />}
            {view === 'policies' && <PoliciesView policies={policies} isDarkMode={isDarkMode} />}
            {view === 'scholarships' && <ScholarshipsView scholarships={scholarships} user={user} isDarkMode={isDarkMode} setView={setView} setSelectedScholarship={setSelectedScholarship} fetchScholarships={fetchScholarships} />}
            {view === 'programs' && <ScholarshipsView scholarships={scholarships} user={user} isDarkMode={isDarkMode} fetchScholarships={fetchScholarships} setView={setView} setSelectedScholarship={setSelectedScholarship} />}
            {view === 'applications' && <ApplicationsView financialAid={financialAid} user={user} isDarkMode={isDarkMode} updateFinancialAidStatus={updateFinancialAidStatus} handleUpdateFinancialAid={handleUpdateFinancialAid} users={users} assignFaculty={assignFaculty} setView={setView} setSelectedStudentForRec={setSelectedStudentForRec} deleteFinancialAid={deleteFinancialAid} setSelectedApplicationForSummary={setSelectedApplicationForSummary} fetchFinancialAid={fetchFinancialAid} />}
            {view === 'reports' && <ReportsView financialAid={financialAid} scholarships={scholarships} isDarkMode={isDarkMode} user={user} />}
            {view === 'activity' && <ActivityView isDarkMode={isDarkMode} />}
            {view === 'recommendations' && <RecommendationsView recommendations={recommendations} user={user} isDarkMode={isDarkMode} fetchRecommendations={fetchRecommendations} users={users} />}
            {view === 'notifications' && <NotificationsView notifications={notifications} isDarkMode={isDarkMode} />}
            {view === 'academic-support' && <AcademicSupport user={user} isDarkMode={isDarkMode} />}
            {view === 'payments' && <Payments user={user} setUser={setUser} isDarkMode={isDarkMode} setConfirmConfig={setConfirmConfig} courses={courses} fetchUsers={fetchUsers} fetchTransactions={fetchTransactions} transactions={transactions} logActivity={logActivity} />}
            {view === 'mentorship' && <Mentorship user={user} isDarkMode={isDarkMode} mentors={mentors} fetchMentors={fetchMentors} fetchUsers={fetchUsers} users={users} fetchNotifications={fetchNotifications} activeModal={activeModal} setActiveModal={setActiveModal} setView={setView} setSelectedChatUser={setSelectedChatUser} setConfirmConfig={setConfirmConfig} setSelectedStudentForRec={setSelectedStudentForRec} />}
            {view === 'resources' && <Resources user={user} isDarkMode={isDarkMode} resources={resources} fetchResources={fetchResources} activeModal={activeModal} setActiveModal={setActiveModal} />}
            {view === 'community' && <Community user={user} isDarkMode={isDarkMode} events={communityEvents} orgs={communityOrgs} fetchCommunityData={fetchCommunityData} activeModal={activeModal} setActiveModal={setActiveModal} />}
            {view === 'settings' && (
              <SettingsView 
                user={user} 
                isDarkMode={isDarkMode} 
                setIsDarkMode={setIsDarkMode} 
                accentColor={accentColor} 
                setAccentColor={setAccentColor}
                notificationSettings={notificationSettings}
                setNotificationSettings={setNotificationSettings}
              />
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        isDarkMode={isDarkMode}
      />

      {/* Application Summary Modal */}
      {selectedApplicationForSummary && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedApplicationForSummary(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "relative w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl overflow-hidden flex flex-col",
              isDarkMode ? "bg-[#111111] border border-white/5" : "bg-white border border-slate-200"
            )}
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-black tracking-tighter">Application Summary</h3>
              <button onClick={() => setSelectedApplicationForSummary(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
              <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5">
                <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center text-white text-3xl font-black">
                  {selectedApplicationForSummary.studentName?.[0] || 'A'}
                </div>
                <div>
                  <p className="text-2xl font-black tracking-tight">{selectedApplicationForSummary.studentName}</p>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{selectedApplicationForSummary.studentId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Type</p>
                  <p className="font-bold">{selectedApplicationForSummary.program}</p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submitted On</p>
                  <p className="font-bold">{new Date(selectedApplicationForSummary.date).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedApplicationForSummary.personalStatement && (
                <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Personal Statement / Essay</p>
                  <p className="text-sm font-medium leading-relaxed italic whitespace-pre-wrap">"{selectedApplicationForSummary.personalStatement}"</p>
                </div>
              )}

              {selectedApplicationForSummary.reason && (
                <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Justification / Funding Reason</p>
                  <p className="text-sm font-medium leading-relaxed italic whitespace-pre-wrap">"{selectedApplicationForSummary.reason}"</p>
                </div>
              )}

              {selectedApplicationForSummary.attachments && (
                <div className="p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Verification Documents</p>
                  <div className="space-y-2">
                    {Object.entries(selectedApplicationForSummary.attachments).map(([key, val]: [string, any]) => (
                      <div key={key} className={cn(
                        "p-3 rounded-xl border flex items-center justify-between",
                        isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
                      )}>
                        <div className="flex items-center gap-3">
                          {val ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-red-400" />}
                          <span className="text-[10px] font-bold capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                        {val && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewFile({ name: key, data: val });
                            }}
                            className="text-[10px] font-black uppercase text-red-600 hover:underline"
                          >
                            View File
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Current Status</p>
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest",
                    selectedApplicationForSummary.status === 'pending' ? "bg-amber-500 text-white" :
                    selectedApplicationForSummary.status === 'approved' ? "bg-emerald-500 text-white" :
                    "bg-red-500 text-white"
                  )}>
                    {selectedApplicationForSummary.status}
                  </span>
                  <p className="text-xs text-slate-400 font-medium italic">
                    {selectedApplicationForSummary.status === 'pending' ? 'Review in progress' : 
                     selectedApplicationForSummary.status === 'approved' ? 'Beneficiary confirmed' : 'Request declined'}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  onClick={() => setSelectedApplicationForSummary(null)}
                  className="flex-1 py-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl"
                >
                  Close Details
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* File Preview Modal (Global) */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setPreviewFile(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between border-b border-white/10 bg-slate-900/50 backdrop-blur-md">
                <div>
                  <h4 className="text-white font-black uppercase tracking-widest text-xs">File Preview</h4>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                    {previewFile.name.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>
                <button 
                  onClick={() => setPreviewFile(null)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#000]">
                {typeof previewFile.data === 'string' && (previewFile.data.startsWith('data:application/pdf') || previewFile.data.includes('.pdf')) ? (
                  <iframe 
                    src={previewFile.data} 
                    className="w-full h-[70vh] rounded-xl border-none"
                    title="PDF Preview"
                  />
                ) : typeof previewFile.data === 'string' ? (
                  <img 
                    src={previewFile.data} 
                    alt="Preview" 
                    className="max-w-full max-h-full object-contain shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-white font-bold text-center">
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <p>File content not available for older applications.</p>
                  </div>
                )}
              </div>
              <div className="p-6 bg-slate-900/50 backdrop-blur-md border-t border-white/10 flex justify-end">
                <button 
                  onClick={() => setPreviewFile(null)}
                  className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, type, isDarkMode }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-[1000]">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className={cn(
          "p-10 rounded-[4rem] w-full max-w-lg shadow-2xl border relative overflow-hidden",
          isDarkMode ? "bg-[#0A0A0A] border-white/10 text-white" : "bg-white border-slate-200"
        )}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/10 blur-[80px] rounded-full -mr-20 -mt-20" />
        
        <div className="relative z-10 text-center">
          <div className={cn(
            "w-20 h-20 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-2xl",
            type === 'danger' ? "bg-red-600 text-white shadow-red-600/20" : "bg-amber-500 text-white shadow-amber-500/20"
          )}>
            {type === 'danger' ? <Trash2 className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
          </div>
          
          <h2 className="text-4xl font-black tracking-tighter mb-4 leading-none">{title}</h2>
          <p className={cn("mb-10 text-lg leading-relaxed px-4", isDarkMode ? "text-slate-400 font-medium" : "text-slate-500 font-medium")}>
            {message}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onCancel}
              className={cn(
                "flex-1 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] active:scale-95",
                isDarkMode ? "bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              )}
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              className={cn(
                "flex-1 py-5 rounded-[2rem] text-white font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all hover:scale-[1.02] active:scale-95",
                type === 'danger' || title.toLowerCase().includes('logout') ? "bg-red-600 hover:bg-red-700 shadow-red-600/40" : "bg-slate-900 hover:bg-black shadow-slate-900/40"
              )}
            >
              {title.toLowerCase().includes('logout') ? 'Confirm Logout' : 'Confirm Action'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

function LandingPage({ onGetStarted, onRegister }: { onGetStarted: () => void, onRegister: () => void }) {
  return (
    <div className="min-h-screen bg-white font-sans text-stone-900">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-xl">
          <span>Student Aid Portal</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={onRegister} className="bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 transition-colors">
            Get Started
          </button>
          <button onClick={onGetStarted} className="text-stone-600 font-medium hover:text-stone-900">Login</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h1 className="text-7xl md:text-8xl font-black leading-[0.85] tracking-tighter uppercase mb-8">
              ST. CECILIA'S <br />
              <span className="text-red-600">COLLEGE</span> - CEBU, <br />
              INC.
            </h1>
            <p className="text-xl text-stone-500 max-w-xl mb-10 leading-relaxed">
              Official Student Aid Portal. Empowering students through 
              seamless financial aid management and academic 
              tracking.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={onRegister}
                className="bg-red-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-200"
              >
                Register Now
              </button>
            </div>
          </div>
          <div className="flex-1 flex justify-center lg:justify-end">
            {/* Red box removed */}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-[#F8FBFF] py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-bold mb-6">System Summary</h2>
            <p className="text-stone-500 text-lg">Everything you need to manage your academic journey in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<DollarSign className="text-emerald-500" />} 
              title="Financial Aid Management" 
              description="Apply for scholarships, grants, and loans, with real-time status tracking and automated balance updates."
            />
            <FeatureCard 
              icon={<BookOpen className="text-red-500" />} 
              title="Academic Tracking" 
              description="View your grades, calculate your GPA, and monitor your progress across semesters."
            />
            <FeatureCard 
              icon={<BookOpen className="text-amber-500" />} 
              title="Course Catalog" 
              description="Browse available courses across departments like BSIT, BSBA, and more. View prerequisites and credits."
            />
            <FeatureCard 
              icon={<MessageSquare className="text-pink-500" />} 
              title="Internal Messaging" 
              description="Communicate directly with faculty and administration through our secure internal messaging system."
            />
            <FeatureCard 
              icon={<Bell className="text-red-400" />} 
              title="Real-time Notifications" 
              description="Stay updated with instant alerts for application approvals, new grades, and campus announcements."
            />
            <FeatureCard 
              icon={<Shield className="text-emerald-400" />} 
              title="Admin Control" 
              description="Powerful tools for administration to manage users, approve aid, and broadcast campus-wide news."
            />
            <FeatureCard 
              icon={<Shield className="text-stone-400" />} 
              title="Secure Authentication" 
              description="Multi-layered security protocols to ensure your academic and financial data remains private."
            />
            <FeatureCard 
              icon={<Calendar className="text-red-500" />} 
              title="Mobile Responsive" 
              description="Access your portal from any device, anywhere. Optimized for smartphones and tablets."
            />
            <FeatureCard 
              icon={<Shield className="text-amber-600" />} 
              title="Campus Integration" 
              description="Seamlessly connected with university systems for real-time data synchronization."
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-6 py-40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <div>
            <h2 className="text-6xl font-bold leading-tight mb-16 uppercase tracking-tighter">
              WHY CHOOSE THE <span className="text-red-600">STUDENT AID PORTAL?</span>
            </h2>
            <div className="space-y-12">
              <div className="flex gap-8">
                <div className="p-4 bg-red-50 rounded-2xl h-fit"><User className="text-red-600 w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-2xl mb-3">Student-Centric Design</h4>
                  <p className="text-stone-500 text-lg leading-relaxed">Built with the student experience in mind, making complex processes simple and intuitive.</p>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="p-4 bg-amber-50 rounded-2xl h-fit"><Shield className="text-amber-600 w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-2xl mb-3">Instant Processing</h4>
                  <p className="text-stone-500 text-lg leading-relaxed">No more waiting in long lines. Submit applications and get feedback in record time.</p>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="p-4 bg-emerald-50 rounded-2xl h-fit"><MessageSquare className="text-emerald-600 w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-2xl mb-3">Dedicated Support</h4>
                  <p className="text-stone-500 text-lg leading-relaxed">Our team is always ready to help you navigate your financial aid journey.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#111111] p-16 rounded-[4rem] text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[120px] rounded-full"></div>
            <h3 className="text-4xl font-bold mb-8">Ready to start?</h3>
            <p className="text-stone-400 mb-12 text-xl leading-relaxed">Join thousands of students who have already simplified their academic life.</p>
            <button onClick={onRegister} className="bg-red-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-red-700 transition-all">
              Create Your Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-2 font-bold opacity-80">
            <Shield className="w-6 h-6 text-red-600" />
            <span>Student Aid Portal</span>
          </div>
          <p className="text-stone-400 text-sm">© 2026 Student Aid Portal. All rights reserved.</p>
          <div className="flex gap-10 text-sm text-stone-400">
            <a href="#" className="hover:text-stone-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-stone-900 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="bg-white p-10 rounded-3xl border border-stone-100 hover:shadow-xl transition-all group">
      <div className="p-4 bg-stone-50 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { className: "w-8 h-8" })}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-stone-500 leading-relaxed text-sm">{description}</p>
    </div>
  );
}

function NavCategory({ label, collapsed, isDarkMode }: { label: string, collapsed?: boolean, isDarkMode?: boolean }) {
  if (collapsed) return <div className="h-px bg-slate-200 dark:bg-white/5 my-4 mx-2" />;
  return (
    <div className={cn(
      "px-4 pt-6 pb-2 text-[10px] font-black uppercase tracking-[0.2em]",
      isDarkMode ? "text-slate-600" : "text-slate-400"
    )}>
      {label}
    </div>
  );
}

function NavItem({ icon, label, active, onClick, collapsed, isDarkMode, accentColor }: { icon: any, label: string, active: boolean, onClick: () => void, collapsed?: boolean, isDarkMode?: boolean, accentColor?: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium relative group",
        active 
          ? (isDarkMode 
              ? cn(
                  "text-white shadow-lg",
                  accentColor === 'red' ? "bg-red-600 shadow-red-600/20" :
                  accentColor === 'blue' ? "bg-blue-600 shadow-blue-600/20" :
                  accentColor === 'emerald' ? "bg-emerald-600 shadow-emerald-600/20" :
                  "bg-amber-600 shadow-amber-600/20"
                ) 
              : "bg-slate-900 text-white shadow-lg shadow-slate-200") 
          : (isDarkMode ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"),
        collapsed && "justify-center"
      )}
    >
      {React.cloneElement(icon, { className: "w-5 h-5 shrink-0" })}
      {!collapsed && <span className="truncate">{label}</span>}
      
      {collapsed && (
        <div className={cn(
          "absolute left-full ml-4 px-3 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 z-50 whitespace-nowrap",
          isDarkMode ? "bg-white text-slate-900" : "bg-slate-900 text-white"
        )}>
          {label}
        </div>
      )}
    </button>
  );
}

function StudentDashboard({ 
  user, 
  isDarkMode, 
  setView, 
  announcements = [], 
  scholarships = [], 
  financialAid = [],
  users = [],
  mentors = [],
  transactions = []
}: { 
  user: UserData, 
  isDarkMode?: boolean, 
  setView: (v: string) => void,
  announcements?: any[],
  scholarships?: any[],
  financialAid?: any[],
  users?: UserData[],
  mentors?: any[],
  transactions?: any[]
}) {
  const isStudent = user.role === 'student';
  const myApplications = (financialAid || []).filter(a => a.studentId === user.id);
  const approvedAid = myApplications.filter(a => a.status === 'approved').reduce((acc, curr) => acc + (parseInt(curr.amount?.replace(/[^0-9]/g, '') || '0')), 0);
  const pendingApps = myApplications.filter(a => a.status === 'pending').length;

  // Admin/Faculty Stats
  const totalStudents = users.filter((u: any) => u.role === 'student').length;
  const totalApplications = (financialAid || []).length;
  const totalScholarships = (scholarships || []).length;
  const totalMentors = (mentors || []).length;

  const courses = user.schedule || [];
  const gpa = 3.82; 
  const currentTerm = "Second Semester 2023-2024";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 pb-20 pt-4">
      {/* Heavy-Duty Professional Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-red-600/20">Verified Student</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ID: {user.id}</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
            Mabuhay, <span className="text-red-600 underline font-sans decoration-red-600/30 underline-offset-8">{user.name.split(' ')[0]}</span>!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium font-sans">
            Enrolled in <span className="text-slate-900 dark:text-white font-black">{user.course || 'Bachelor of Science'}</span> • Year {user.yearLevel || 'N/A'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Current Academic Term</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{currentTerm}</p>
          </div>
          <div className="h-10 w-[1px] bg-slate-200 dark:bg-white/10 hidden lg:block" />
          <button 
            onClick={() => setView('profile')}
            className={cn(
              "p-2 rounded-2xl border transition-all hover:scale-105",
              isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
            )}
          >
            <div className="flex items-center gap-3 pr-4">
               <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black overflow-hidden shadow-lg shadow-red-600/20">
                {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : user.name[0]}
               </div>
               <div className="text-left">
                 <p className="text-xs font-black">{user.surname}, {user.name[0]}.</p>
                 <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">View Profile</p>
               </div>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Wallet />} 
          label="Account Balance" 
          value={`₱${user.balance?.toLocaleString() || '0'}`} 
          trend="DUE IN 12 DAYS"
          trendType="neutral"
          color="red"
          isDarkMode={isDarkMode}
        />
        <StatCard 
          icon={<GraduationCap />} 
          label="GPA Standing" 
          value={gpa.toString()} 
          trend="TOP 5% OF CLASS"
          trendType="up"
          color="emerald"
          isDarkMode={isDarkMode}
        />
        <StatCard 
          icon={<BookOpen />} 
          label="Active Schedule" 
          value={`${courses.length} Subjects`} 
          trend="FULL ENROLLMENT"
          trendType="neutral"
          color="blue"
          isDarkMode={isDarkMode}
        />
        <StatCard 
          icon={<FileText />} 
          label="Applications" 
          value={myApplications.length.toString()} 
          trend={`${pendingApps} PENDING REVIEW`}
          trendType="neutral"
          color="purple"
          isDarkMode={isDarkMode}
        />
      </div>

      {isStudent && myApplications.some(a => a.status === 'approved') && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-500 font-bold text-sm">
          <CheckCircle className="w-5 h-5" />
          <span>Your application has been approved! Disbursement is being processed.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {isStudent ? (
            <>
              <div className={cn(
                "p-8 rounded-[2.5rem] border transition-all",
                isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
              )}>
                <h3 className="text-xl font-bold mb-6">My Applications</h3>
                <div className="space-y-4">
                  {myApplications.length > 0 ? myApplications.map((app, i) => (
                    <div key={i} className={cn(
                      "p-6 rounded-2xl border flex flex-col gap-4",
                      isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
                    )}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-black">{app.program || 'N/A'}</h4>
                          <p className="text-xs text-slate-400">{app.id?.toString().slice(-8) || 'N/A'} • {app.date ? new Date(app.date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          app.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" :
                          app.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                          "bg-blue-500/10 text-blue-500"
                        )}>
                          {app.status}
                        </span>
                      </div>
                      <button 
                        onClick={() => setView('documents')}
                        className="w-full py-3 rounded-xl border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        View Documents
                      </button>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-slate-400 font-bold italic">
                      No active applications found.
                    </div>
                  )}
                  <button 
                    onClick={() => setView('finance')}
                    className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Apply for More Aid
                  </button>
                </div>
              </div>

              <div className={cn(
                "p-8 rounded-[2.5rem] border transition-all",
                isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
              )}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">My Mentor</h3>
                  <button 
                    onClick={() => setView('mentorship')}
                    className="text-xs font-black uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors"
                  >
                    {user.mentorId ? 'Change Mentor →' : 'Select Mentor →'}
                  </button>
                </div>
                {user.mentorId ? (
                  (() => {
                    const myMentor = mentors.find(m => m.id === user.mentorId);
                    return myMentor ? (
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xl">
                          {myMentor.name[0]}
                        </div>
                        <div>
                          <p className="font-bold">{myMentor.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{myMentor.role}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-slate-400 font-bold italic">
                        Mentor information not found.
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-8 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                    <Heart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400 font-bold italic">No mentor selected yet.</p>
                  </div>
                )}
              </div>

              {user.mentorId && (
                <div className={cn(
                  "p-8 rounded-[2.5rem] border transition-all",
                  isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
                )}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Mentor Sessions</h3>
                    <button 
                      onClick={() => setView('mentorship')}
                      className="text-xs font-black uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors"
                    >
                      Book New →
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className={cn(
                      "p-6 rounded-2xl border flex items-center justify-between",
                      isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
                    )}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Next Session</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Scheduled with your mentor</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">TBD</span>
                    </div>
                  </div>
                </div>
              )}

              <div className={cn(
                "p-8 rounded-[2.5rem] border transition-all",
                isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
              )}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-red-600" />
                    Transaction Log
                  </h3>
                  <button 
                    onClick={() => setView('transactions')}
                    className="text-xs font-black uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-4">
                  {(transactions || []).slice(0, 3).map((t, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl px-2 transition-colors">
                      <div>
                        <p className="font-bold text-sm tracking-tight">{t.details || t.type}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(t.timestamp || t.date).toLocaleDateString()}</p>
                      </div>
                      <p className={cn(
                        "text-lg font-black tracking-tighter", 
                        (t.type || '').includes('Payment') ? "text-emerald-500" : "text-blue-500"
                      )}>
                        {(t.type || '').includes('Payment') ? '-' : '+'}₱{t.amount?.toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {(!transactions || transactions.length === 0) && (
                    <p className="text-center py-10 text-slate-400 font-bold italic">No recent transactions recorded.</p>
                  )}
                </div>
              </div>

              <div className={cn(
                "p-8 rounded-[2.5rem] border transition-all",
                isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
              )}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Document Checklist</h3>
                  <button 
                    onClick={() => setView('documents')}
                    className="text-xs font-black uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors"
                  >
                    Manage All →
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Valid School ID', status: 'Pending', color: 'text-amber-500', icon: <Clock className="w-4 h-4" /> },
                    { label: 'Report Card (Grades)', status: 'Pending', color: 'text-amber-500', icon: <Clock className="w-4 h-4" /> },
                    { label: 'Income Certificate', status: 'Pending', color: 'text-amber-500', icon: <Clock className="w-4 h-4" /> },
                    { label: 'Barangay Certificate', status: 'Pending', color: 'text-amber-500', icon: <Clock className="w-4 h-4" /> },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className={doc.color}>{doc.icon}</span>
                        <span className="font-bold text-sm">{doc.label}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", doc.color)}>{doc.status}</span>
                        {doc.status === 'Pending' && (
                          <button 
                            onClick={() => setView('documents')}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <Upload className="w-4 h-4 text-slate-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={cn(
                "p-8 rounded-[2.5rem] border transition-all",
                isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
              )}>
                <h3 className="text-xl font-bold mb-6">Recent Applications</h3>
                <div className="space-y-4">
                  {(financialAid || []).slice(0, 5).map((app, i) => (
                    <div key={i} className={cn(
                      "p-4 rounded-2xl border flex items-center justify-between",
                      isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
                    )}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center text-red-600">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{app.studentName || 'Unknown Student'}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{app.program || 'N/A'} • {app.date ? new Date(app.date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                        app.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" :
                        app.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                        "bg-blue-500/10 text-blue-500"
                      )}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                  <button 
                    onClick={() => setView('applications')}
                    className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    View All Applications
                  </button>
                </div>
              </div>

              <div className={cn(
                "p-8 rounded-[2.5rem] border transition-all",
                isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
              )}>
                <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Add Scholarship', icon: <Plus />, onClick: () => setView('scholarships') },
                    { label: 'Post Announcement', icon: <Megaphone />, onClick: () => setView('announcements') },
                    { label: 'Manage Users', icon: <Users />, onClick: () => setView('users') },
                    { label: 'Backup & Recovery', icon: <Database />, onClick: () => setView('activity') },
                  ].map((action, i) => (
                    <button 
                      key={i}
                      onClick={action.onClick}
                      className={cn(
                        "p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all group",
                        isDarkMode ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                      )}
                    >
                      <div className="w-12 h-12 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                        {action.icon}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-center">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="space-y-8">
          <div className={cn(
            "p-8 rounded-[2.5rem] border transition-all",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <h3 className="text-xl font-bold mb-6">Announcements</h3>
            <div className="space-y-6">
              {(announcements || []).slice(0, 3).map((a, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2 group cursor-pointer hover:border-red-600/30 transition-all" onClick={() => setView('announcements')}>
                  <h4 className="font-black text-sm group-hover:text-red-600 transition-colors">{a.title || 'No Title'}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{a.content || 'No Content'}</p>
                  <p className="text-[10px] font-bold text-slate-500">{a.date || 'N/A'} • {a.author || 'Unknown'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={cn(
            "p-8 rounded-[2.5rem] border transition-all",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <h3 className="text-xl font-bold mb-6">Available Scholarships</h3>
            <div className="space-y-6">
              {(scholarships || []).slice(0, 5).map((s, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer" onClick={() => setView('finance')}>
                  <div>
                    <h4 className="font-black text-sm group-hover:text-red-600 transition-colors">{s.name || 'No Name'}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Deadline: {s.deadline || 'N/A'} • GPA {s.gpa || 'N/A'}</p>
                  </div>
                  <span className="text-sm font-black text-emerald-500">{s.amount || 'N/A'}</span>
                </div>
              ))}
              <button 
                onClick={() => setView('finance')}
                className="w-full py-3 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
              >
                View All →
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const CoursesView = ({ isDarkMode, setView, setGradeEntryFilter, users, fetchUsers, facultyUser, courses, fetchCourses, isAdmin, logActivity }: { isDarkMode: boolean, setView: (view: string) => void, setGradeEntryFilter: (filter: string) => void, users: UserData[], fetchUsers: () => void, facultyUser: UserData, courses: any[], fetchCourses: () => void, isAdmin: boolean, logActivity: any }) => {
  const [showClassList, setShowClassList] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [classListMode, setClassListMode] = useState<'list' | 'enroll'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [newCourse, setNewCourse] = useState({ 
    id: '', 
    name: '', 
    days: 'Mon/Wed', 
    startTime: '08:00 AM', 
    endTime: '09:30 AM', 
    location: '', 
    instructor: '',
    price: '' as any,
    semester: '1st Semester'
  });

  // Validation logic: Alphanumeric, at least 3 characters
  const isIdValid = newCourse.id.length >= 2 && /^[A-Z0-9]/i.test(newCourse.id);
  const isNameValid = newCourse.name.length >= 3;
  const isLocationValid = newCourse.location.length >= 1;
  const isInstructorValid = newCourse.instructor.length > 0;
  const isPriceValid = newCourse.price > 0;

  const [formError, setFormError] = useState<string | null>(null);

  const handleAddCourse = async () => {
    setFormError(null);
    
    // Comprehensive Validation using easy-to-read flags
    if (!isIdValid || !isNameValid || !isLocationValid || !isInstructorValid || !isPriceValid) {
      let missing = [];
      if (!isIdValid) missing.push("Valid Course ID (Need uppercase letters/numbers)");
      if (!isNameValid) missing.push("Course Name (At least 3 characters)");
      if (!isLocationValid) missing.push("Room Number");
      if (!isInstructorValid) missing.push("Assign an Instructor");
      if (!isPriceValid) missing.push("Price must be greater than 0");
      
      setFormError(`Please fix the following:\n${missing.join(', ')}`);
      return;
    }

    setIsAdding(true);
    
    try {
      console.log("Adding/Updating Course...", newCourse);
      
      let roomVal = newCourse.location.trim();
      const finalLocation = roomVal.toLowerCase().startsWith('room') ? roomVal : `Room ${roomVal}`;

      const courseData: any = {
        id: newCourse.id.toUpperCase().trim(),
        name: newCourse.name.trim(),
        schedule: `${newCourse.days} ${newCourse.startTime} - ${newCourse.endTime}`,
        day: newCourse.days,
        time: `${newCourse.startTime} - ${newCourse.endTime}`,
        location: finalLocation,
        instructor: newCourse.instructor,
        students: editingCourse ? (editingCourse.students || 0) : 0,
        price: Number(newCourse.price) || 0,
        semester: newCourse.semester
      };

      if (editingCourse) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id);
        
        if (error) throw error;
        logActivity('UPDATE_COURSE', `Updated course details for ${courseData.id} (${courseData.name})`, 'Successful');
        
        await fetchCourses();
        setShowAddCourseModal(false);
        setEditingCourse(null);
        setNewCourse({ id: '', name: '', days: 'Mon/Wed', startTime: '08:00 AM', endTime: '09:30 AM', location: '', instructor: '', price: 0, semester: '1st Semester' });
        alert('Course updated successfully!');
      } else {
        const { error } = await supabase.from('courses').insert([courseData]);
        if (error) throw error;
        
        logActivity('CREATE_COURSE', `Created new course: ${courseData.id} (${courseData.name})`, 'Successful');
        await fetchCourses();
        console.log("Course added successfully");
        setShowAddCourseModal(false);
        setNewCourse({ id: '', name: '', days: 'Mon/Wed', startTime: '08:00 AM', endTime: '09:30 AM', location: '', instructor: '', price: 0, semester: '1st Semester' });
        alert(`Successfully added Course ${courseData.id}!`);
      }
    } catch (err: any) {
      console.error("Course operation failed:", err);
      if (err.code === '23505') {
        setFormError('This Course ID already exists. Please use a unique ID.');
      } else {
        setFormError(err.message || 'Connection error. Please try again.');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm(`Are you sure you want to delete course ${courseId}?`)) return;
    
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);
    
    if (!error) {
      logActivity('DELETE_COURSE', `Course ${courseId} deleted from system`, 'Successful');
      fetchCourses();
      alert('Course deleted successfully!');
    } else {
      alert('Error deleting course: ' + error.message);
    }
  };

  const students = users.filter(u => u.role === 'student');
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [selectedStudentsForEnroll, setSelectedStudentsForEnroll] = useState<string[]>([]);

  const handleBulkEnroll = async () => {
    if (!selectedCourse || selectedStudentsForEnroll.length === 0) return;
    setIsAdding(true);

    try {
      const coursePrice = Number(selectedCourse.price) || 0;
      
      // Parse schedule: "Mon/Wed 08:00 AM - 09:30 AM"
      const scheduleParts = (selectedCourse.schedule || '').split(' ');
      const extractedDay = scheduleParts[0] || 'TBA';
      const extractedTime = scheduleParts.slice(1).join(' ') || 'TBA';

      const newScheduleEntry = {
        subject: selectedCourse.id,
        instructor: selectedCourse.instructor || 'Not Assigned',
        day: extractedDay,
        time: extractedTime,
        location: selectedCourse.location
      };

      let enrollSuccessCount = 0;
      const enrollPromises = selectedStudentsForEnroll.map(async (studentId) => {
        const student = users.find(u => u.id === studentId);
        if (!student) return;

        // Check if already in schedule
        const alreadyEnrolled = (student.schedule || []).some((s: any) => s.subject === selectedCourse.id);
        if (alreadyEnrolled) return;

        const updatedSchedule = [...(student.schedule || []), newScheduleEntry];
        const newBalance = (student.balance || 0) + coursePrice;

        const { error } = await supabase
          .from('users')
          .update({ 
            schedule: updatedSchedule,
            balance: newBalance
          })
          .eq('id', student.id);

        if (!error) {
          enrollSuccessCount++;
          // Create transaction record
          await supabase.from('transactions').insert({
            userId: student.id,
            userName: `${student.name} ${student.surname}`,
            type: 'Tuition Fee',
            amount: coursePrice,
            method: 'Automatic Charge',
            timestamp: new Date().toISOString(),
            status: 'completed',
            details: `Enrolled in ${selectedCourse.id}: ${selectedCourse.name}`
          });
        }
      });

      await Promise.all(enrollPromises);

      logActivity('BULK_ENROLLMENT', `Bulk enrolled ${enrollSuccessCount} students into ${selectedCourse.id}`, 'Successful');

      // Update course student count
      if (enrollSuccessCount > 0) {
        await supabase
          .from('courses')
          .update({ students: (selectedCourse.students || 0) + enrollSuccessCount })
          .eq('id', selectedCourse.id);
      }

      await fetchUsers();
      await fetchCourses();
      
      alert(`Successfully enrolled students in ${selectedCourse.id}.`);
      setSelectedStudentsForEnroll([]);
    } catch (err: any) {
      alert('Error during bulk enrollment: ' + err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveStudentFromCourse = async (student: UserData) => {
    if (!selectedCourse) return;
    if (!confirm(`Are you sure you want to remove ${student.name} from ${selectedCourse.id}?`)) return;
    setIsAdding(true);
    
    try {
      const updatedSchedule = (student.schedule || []).filter((s: any) => s.subject !== selectedCourse.id);
      const coursePrice = Number(selectedCourse.price) || 0;
      const newBalance = Math.max(0, (student.balance || 0) - coursePrice);

      const { error } = await supabase
        .from('users')
        .update({ 
          schedule: updatedSchedule,
          balance: newBalance 
        })
        .eq('id', student.id);
      
      if (!error) {
        // Update course student count
        await supabase
          .from('courses')
          .update({ students: Math.max(0, (selectedCourse.students || 1) - 1) })
          .eq('id', selectedCourse.id);

        fetchUsers();
        fetchCourses();
      } else {
        alert('Error removing student: ' + error.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const annexRooms = Array.from({ length: 10 }, (_, f) => 
    Array.from({ length: 6 }, (_, r) => `${(f + 1) * 100 + (r + 1)} Annex`)
  ).flat();

  const campusRooms = Array.from({ length: 6 }, (_, f) => 
    Array.from({ length: 5 }, (_, r) => `${(f + 1) * 100 + (r + 1)} Campus`)
  ).flat();

  const allRooms = [...annexRooms, ...campusRooms];

  const filteredCourses = (isAdmin ? courses : courses.filter(c => c.instructor === facultyUser.id))
    .filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">{isAdmin ? 'Manage Courses' : 'My Courses'}</h1>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>
            {isAdmin ? 'Manage all academic courses and offerings.' : 'View and manage your assigned teaching loads.'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={cn(
                  "pl-11 pr-6 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-red-600 font-bold text-sm",
                  isDarkMode ? "bg-white/5 text-white" : "bg-white text-slate-900 shadow-sm border border-slate-100"
                )}
              />
            </div>
            
            <button 
              onClick={() => {
                setEditingCourse(null);
                setNewCourse({ id: '', name: '', days: 'Mon/Wed', startTime: '08:00 AM', endTime: '09:30 AM', location: '', instructor: '', price: 0 });
                setFormError(null);
                setShowAddCourseModal(true);
              }}
              disabled={isAdding}
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-600/20 hover:bg-red-500 transition-all flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Course
            </button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, i) => (
          <div key={i} className={cn(
            "p-8 rounded-[2.5rem] border transition-all hover:scale-[1.02] relative group",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white mb-6">
              <Book className="w-6 h-6" />
            </div>
            <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {isAdmin && (
                <>
                  <button 
                    onClick={() => {
                      setEditingCourse(course);
                      // Parse the schedule string: "Mon/Wed 08:00 AM - 09:30 AM"
                      const schedule = course.schedule || "";
                      const parts = schedule.split(' ');
                      
                      const days = parts[0] || 'Mon/Wed';
                      const startTime = parts.length >= 3 ? `${parts[1]} ${parts[2]}` : '08:00 AM';
                      const endTime = parts.length >= 6 ? `${parts[4]} ${parts[5]}` : '09:30 AM';

                      setNewCourse({
                        id: course.id,
                        name: course.name,
                        days: days,
                        startTime: startTime,
                        endTime: endTime,
                        location: course.location || '',
                        instructor: course.instructor || '',
                        price: course.price || 0
                      });
                      setShowAddCourseModal(true);
                    }}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            <h3 className="text-xl font-bold mb-2">{course.name}</h3>
            <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-4">{course.id}</p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <User className="w-4 h-4" />
                <span>Instructor: <span className="font-bold">{(() => { 
                   const f = (users || []).find((u: any) => u.id === course.instructor);
                   return f ? `${f.name} ${f.surname}` : (course.instructor || 'Not Assigned').replace('FAC-', '');
                })()}</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                <span>{course.schedule}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="w-4 h-4" />
                <span className="font-bold text-red-600">{course.location?.toLowerCase().startsWith('room') ? course.location : `Room ${course.location}`}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Users className="w-4 h-4" />
                <span>{course.students} Students Enrolled</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button 
                onClick={() => {
                  setSelectedCourse(course);
                  setShowClassList(true);
                }}
                className="py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
              >
                Class List
              </button>
              <button 
                onClick={() => {
                  if (isAdmin) {
                    setGradeEntryFilter(course.id);
                    setView('grades-mgmt');
                  } else {
                    setGradeEntryFilter(course.id);
                    setView('grade-entry');
                  }
                }}
                className="py-4 rounded-2xl border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                {isAdmin ? 'View Grades' : 'Enter Grades'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showAddCourseModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#111111] rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-white/5">
              <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
              
              {/* Course Addition Guidelines */}
              <div className={cn(
                "p-4 rounded-2xl mb-6 text-[11px] leading-relaxed border",
                isDarkMode ? "bg-red-950/20 border-red-900/40 text-red-400" : "bg-red-50 border-red-100 text-red-600"
              )}>
                <p className="font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3" />
                  Course Submission Guidelines
                </p>
                <ul className="list-disc list-inside space-y-1 opacity-80">
                  <li>Ensure Course ID is unique (e.g. CS101, IT202).</li>
                  <li>Provide a descriptive course name.</li>
                  <li>Format days as "Mon/Wed" or "Tue/Thu".</li>
                  <li>Assign a qualified faculty member.</li>
                  <li>Set a valid numeric price (₱).</li>
                </ul>
              </div>

              {formError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-600 text-white rounded-2xl text-[11px] font-bold mb-6 flex items-start gap-3"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-tight">{formError}</p>
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Course ID (e.g. IT101)" 
                    value={newCourse.id || ''}
                    disabled={!!editingCourse}
                    onChange={e => setNewCourse({...newCourse, id: e.target.value.toUpperCase()})}
                    className={cn(
                      "w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-none outline-none focus:ring-2 text-slate-900 dark:text-white transition-all", 
                      editingCourse && "opacity-50 cursor-not-allowed",
                      newCourse.id.length > 0 ? (isIdValid ? "focus:ring-emerald-500 border border-emerald-500/50" : "focus:ring-red-500 border border-red-500/50") : "focus:ring-red-600"
                    )} 
                  />
                  {newCourse.id.length > 0 && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {isIdValid ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Course Name" 
                    value={newCourse.name || ''}
                    onChange={e => setNewCourse({...newCourse, name: e.target.value})}
                    className={cn(
                      "w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-none outline-none focus:ring-2 text-slate-900 dark:text-white transition-all",
                      newCourse.name.length > 0 ? (isNameValid ? "focus:ring-emerald-500 border border-emerald-500/50" : "focus:ring-red-500 border border-red-500/50") : "focus:ring-red-600"
                    )} 
                  />
                  {newCourse.name.length > 0 && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {isNameValid ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Days</label>
                    <input 
                      type="text"
                      placeholder="e.g. Mon/Wed"
                      value={newCourse.days || ''}
                      onChange={e => setNewCourse({...newCourse, days: e.target.value})}
                      className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Room Number</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">Room</div>
                      <input 
                        type="text"
                        placeholder="101"
                        value={(newCourse.location || '').replace(/Room\s+/gi, '')}
                        onChange={e => setNewCourse({...newCourse, location: e.target.value.replace(/room\s?/gi, '').trim()})}
                        className={cn(
                          "w-full p-4 pl-16 bg-slate-50 dark:bg-white/5 rounded-2xl border-none outline-none focus:ring-2 text-slate-900 dark:text-white transition-all font-bold",
                          newCourse.location.length > 0 ? (isLocationValid ? "focus:ring-emerald-500 border border-emerald-500/50" : "focus:ring-red-500 border border-red-500/50") : "focus:ring-red-600"
                        )}
                      />
                      {newCourse.location.length > 0 && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          {isLocationValid ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Start Time</label>
                    <select 
                      value={newCourse.startTime || '08:00 AM'}
                      onChange={e => setNewCourse({...newCourse, startTime: e.target.value})}
                      className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-bold text-slate-900 dark:text-white appearance-none"
                    >
                      {[
                        "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
                        "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
                        "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
                        "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM", "09:00 PM"
                      ].map(t => <option key={t} value={t} className="bg-white dark:bg-[#111111]">{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">End Time</label>
                    <select 
                      value={newCourse.endTime || '09:30 AM'}
                      onChange={e => setNewCourse({...newCourse, endTime: e.target.value})}
                      className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-bold text-slate-900 dark:text-white appearance-none"
                    >
                      {[
                        "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
                        "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
                        "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
                        "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM", "09:00 PM"
                      ].map(t => <option key={t} value={t} className="bg-white dark:bg-[#111111]">{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Course Price (₱)</label>
                    <input 
                      type="number"
                      placeholder="e.g. 5000"
                      value={newCourse.price}
                      onChange={e => setNewCourse({...newCourse, price: e.target.value})}
                      className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Semester</label>
                    <select 
                      value={newCourse.semester}
                      onChange={e => setNewCourse({...newCourse, semester: e.target.value})}
                      className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-bold text-slate-900 dark:text-white appearance-none"
                    >
                      <option className="bg-white dark:bg-[#111111]">1st Semester</option>
                      <option className="bg-white dark:bg-[#111111]">2nd Semester</option>
                      <option className="bg-white dark:bg-[#111111]">Summer</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Assign Faculty Instructor</label>
                    <select 
                      value={newCourse.instructor || ''}
                      onChange={e => setNewCourse({...newCourse, instructor: e.target.value})}
                      className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-bold text-slate-900 dark:text-white"
                    >
                      <option value="" className="bg-white dark:bg-[#111111] text-slate-900 dark:text-white">Select Faculty Member</option>
                      {Array.from(new Map(
                        users
                          .filter(u => u.role === 'faculty' && u.name && u.surname)
                          .sort((a, b) => b.id.length - a.id.length)
                          .map(f => [`${f.name} ${f.surname}`.toLowerCase(), f])
                      ).values()).map(f => (
                        <option key={f.id} value={f.id} className="bg-white dark:bg-[#111111] text-slate-900 dark:text-white">
                          {f.name} {f.surname}
                        </option>
                      ))}
                    </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => {
                    setShowAddCourseModal(false);
                    setEditingCourse(null);
                    setNewCourse({ id: '', name: '', days: 'Mon/Wed', startTime: '08:00 AM', endTime: '09:30 AM', location: '', instructor: '', price: '' as any, semester: '1st Semester' });
                  }} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl font-bold text-slate-600 dark:text-slate-300">Cancel</button>
                  <button 
                    onClick={handleAddCourse} 
                    disabled={isAdding}
                    className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black disabled:opacity-50"
                  >
                    {isAdding ? 'Processing...' : (editingCourse ? 'Update Course' : 'Add Course')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showClassList && selectedCourse && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowClassList(false); setClassListMode('list'); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]",
                isDarkMode ? "bg-[#111111] border border-white/5" : "bg-white border border-slate-200"
              )}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter">
                    {classListMode === 'list' ? `Enrolled Students: ${selectedCourse.id}` : `Enroll Students: ${selectedCourse.id}`}
                  </h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedCourse.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  {isAdmin && (
                    <button 
                      onClick={() => setClassListMode(classListMode === 'list' ? 'enroll' : 'list')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        classListMode === 'list' ? "bg-red-600 text-white" : "bg-slate-900 text-white"
                      )}
                    >
                      {classListMode === 'list' ? 'Add Students' : 'View Roster'}
                    </button>
                  )}
                  <button onClick={() => { setShowClassList(false); setClassListMode('list'); }} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {classListMode === 'list' ? (
                  users.filter(s => s.role === 'student' && (s.schedule || []).some((sch: any) => sch.subject === selectedCourse.id)).length > 0 ? 
                    users.filter(s => s.role === 'student' && (s.schedule || []).some((sch: any) => sch.subject === selectedCourse.id)).map(s => (
                      <div key={s.id} className={cn(
                        "p-4 rounded-2xl border flex items-center justify-between transition-all",
                        isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
                      )}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold">
                            {s.name[0]}
                          </div>
                          <div>
                            <p className="font-bold">{s.name} {s.surname}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isAdmin && (
                            <button 
                              onClick={() => handleRemoveStudentFromCourse(s)}
                              disabled={isAdding}
                              className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all flex items-center gap-1 group"
                              title="Remove from class"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:inline transition-all">Unenroll</span>
                            </button>
                          )}
                          <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Enrolled
                          </div>
                        </div>
                      </div>
                    )) : (
                    <div className="text-center py-12">
                      <p className="text-slate-400 font-bold italic">No students enrolled yet</p>
                    </div>
                  )
                ) : (
                  <div className="space-y-6">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search students to enroll..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={cn(
                          "w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all",
                          isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      {users
                        .filter(s => s.role === 'student' && (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase())))
                        .map(s => {
                          const isEnrolled = (s.schedule || []).some((sch: any) => sch.subject === selectedCourse.id);
                          const isSelected = selectedStudentsForEnroll.includes(s.id);
                          return (
                            <div 
                              key={s.id}
                              onClick={() => {
                                if (isEnrolled) return;
                                if (isSelected) {
                                  setSelectedStudentsForEnroll(selectedStudentsForEnroll.filter(id => id !== s.id));
                                } else {
                                  setSelectedStudentsForEnroll([...selectedStudentsForEnroll, s.id]);
                                }
                              }}
                              className={cn(
                                "p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer",
                                isSelected ? "bg-red-600/10 border-red-600/30" : (isEnrolled ? "opacity-50 grayscale cursor-not-allowed border-none bg-slate-50 dark:bg-white/5" : (isDarkMode ? "bg-white/5 border-white/5 hover:border-white/10" : "bg-slate-50 border-slate-100 hover:border-slate-200"))
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold", isSelected ? "bg-red-600" : "bg-slate-400")}>
                                  {s.name[0]}
                                </div>
                                <p className="text-sm font-bold">{s.name} {s.surname} <span className="text-[9px] text-slate-400 ml-2">{s.id}</span></p>
                              </div>
                              {isEnrolled ? (
                                <span className="text-[10px] font-black text-emerald-500 uppercase">Enrolled</span>
                              ) : (
                                <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all", isSelected ? "bg-red-600 border-red-600" : "border-slate-300")}>
                                  {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                    {selectedStudentsForEnroll.length > 0 && (
                      <button 
                        onClick={handleBulkEnroll}
                        disabled={isAdding}
                        className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-red-600/20 hover:bg-red-500 transition-all active:scale-95"
                      >
                        {isAdding ? 'Enrolling...' : `Enroll ${selectedStudentsForEnroll.length} Students`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </motion.div>
  );
};

const GradeEntryView = ({ users, isDarkMode, facultyUser, fetchUsers, initialFilter, setGradeEntryFilter, courses = [], logActivity }: { users: UserData[], isDarkMode: boolean, facultyUser: UserData, fetchUsers: () => void, initialFilter: string, setGradeEntryFilter: (filter: string) => void, courses?: any[], logActivity: any }) => {
  const [selectedStudent, setSelectedStudent] = useState<UserData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newGrade, setNewGrade] = useState({ 
    subject: initialFilter || '', 
    instructor: facultyUser.id, 
    prelim: '', 
    midterm: '', 
    prefinal: '', 
    finals: '',
    semester: '1st Semester',
    date: new Date().toISOString().split('T')[0]
  });
  const [gradeSuccess, setGradeSuccess] = useState<string | null>(null);
  const [saveAllComplete, setSaveAllComplete] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialFilter || '');

  useEffect(() => {
    if (initialFilter) {
      setSearchTerm(initialFilter);
      setNewGrade(prev => ({ ...prev, subject: initialFilter }));
    }
  }, [initialFilter]);

  // IMPORTANT: Faculty can only search/view students in their assigned courses
  const facultyCoursesList = courses.filter(c => c.instructor === facultyUser.id);
  const facultyCourseIds = facultyCoursesList.map(c => c.id);
  
  const students = users.filter(u => {
    if (u.role !== 'student') return false;
    if (facultyUser.role === 'faculty') {
      return (u.schedule || []).some((s: any) => facultyCourseIds.includes(s.subject));
    }
    return true;
  });

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.schedule || []).some((sch: any) => sch.subject.toLowerCase() === searchTerm.toLowerCase())
  );

  const handleAddGrade = async () => {
    if (!selectedStudent) {
      alert("Please select a student first.");
      return;
    }
    if (!newGrade.subject) {
      alert("Validation Error: Please select a subject before entering grades.");
      return;
    }

    // Strict Authorization Check: Ensure the subject is actually taught by this faculty
    const isAuthorized = facultyCourseIds.includes(newGrade.subject);
    if (!isAuthorized) {
      alert("Security Violation: You are not authorized to input grades for this course.");
      return;
    }

    const updatedGrades = [...(selectedStudent.grades || [])];
    const existingGradeIndex = updatedGrades.findIndex(g => g.subject === newGrade.subject && g.semester === newGrade.semester);
    
    if (existingGradeIndex >= 0) {
      updatedGrades[existingGradeIndex] = { ...updatedGrades[existingGradeIndex], ...newGrade };
    } else {
      updatedGrades.push(newGrade);
    }

    const { error } = await supabase
      .from('users')
      .update({ grades: updatedGrades })
      .eq('id', selectedStudent.id);
    
      if (!error) {
        logActivity('SUBMIT_GRADE', `Faculty submitted grades for student ${selectedStudent.id} in ${newGrade.subject}`, 'Successful');
        // Success feedback
        const isSomeEmpty = !newGrade.prelim || !newGrade.midterm || !newGrade.prefinal || !newGrade.finals;
        const msg = isSomeEmpty 
          ? `Partial grades for ${newGrade.subject} saved. Remember: Prelim: ${newGrade.prelim || 'N/A'}, Midterm: ${newGrade.midterm || 'N/A'}, Pre-final: ${newGrade.prefinal || 'N/A'}, Finals: ${newGrade.finals || 'N/A'}`
          : `Full grades for ${newGrade.subject} successfully updated for ${selectedStudent.name}!`;
        
        setGradeSuccess(msg);
        
        // Check if all students in this course have grades for all 4 periods
        const courseStudents = users.filter(u => u.role === 'student' && u.schedule?.some((s: any) => s.subject === newGrade.subject));
        const allGraded = courseStudents.every(student => {
          const grade = student.grades?.find((g: any) => g.subject === newGrade.subject);
          return grade && grade.prelim && grade.midterm && grade.prefinal && grade.finals;
        });

        if (allGraded && courseStudents.length > 0) {
          setSaveAllComplete(true);
          await supabase.from('notifications').insert({
            userId: facultyUser.id,
            title: "Grading Complete",
            message: `All students in course ${newGrade.subject} have been fully graded.`,
            type: 'success',
            read: false,
            timestamp: new Date().toISOString()
          });
        }

        fetchUsers();
        setTimeout(() => {
          setShowModal(false);
          setGradeSuccess(null);
          setSaveAllComplete(false);
        }, 2500);

      setNewGrade({ 
        subject: '', 
        instructor: facultyUser.id, 
        prelim: '', 
        midterm: '', 
        prefinal: '', 
        finals: '',
        semester: '1st Semester',
        date: new Date().toISOString().split('T')[0]
      });
      setSelectedStudent(null);

      // Check if course grading is complete
      if (newGrade.subject) {
        const courseStudents = users.filter(u => u.role === 'student' && (u.schedule || []).some((s: any) => s.subject === newGrade.subject));
        // We consider it complete if every student in the course has at least one grade entry with all 4 periods filled for the current semester
        // However, technically we just notified "once grading is completed for every student"
        // Let's assume grading is complete if all students have an entry for this subject.
        const allGraded = courseStudents.every(s => (s.grades || []).some((g: any) => g.subject === newGrade.subject && g.prelim && g.midterm && g.prefinal && g.finals));
        
        if (allGraded && courseStudents.length > 0) {
          await supabase.from('notifications').insert({
            userId: facultyUser.id,
            title: 'Grading Completed',
            message: `You have successfully completed the grading for all students in ${newGrade.subject}.`,
            type: 'success',
            timestamp: new Date().toISOString(),
            read: false
          });
          alert(`Great job! Grading for ${newGrade.subject} is now complete.`);
        }
      }
    } else {
      alert("Error submitting grade: " + error.message);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tighter">Grade Entry</h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Submit and manage student grades for your courses.</p>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text"
          placeholder="Search student..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setGradeEntryFilter('');
          }}
          className={cn(
            "w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all",
            isDarkMode ? "bg-white/5 border-white/10 focus:border-red-600/50" : "bg-white border-slate-200 focus:border-red-600"
          )}
        />
      </div>

      <div className={cn(
        "rounded-[2.5rem] border overflow-hidden transition-all",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={isDarkMode ? "bg-white/5" : "bg-slate-50"}>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Course</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", isDarkMode ? "divide-white/5" : "divide-slate-100")}>
              {filteredStudents.map(s => (
                <tr key={s.id} className={cn("transition-colors", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50")}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold">
                        {s.name[0]}
                      </div>
                      <div>
                        <p className="font-bold">{s.name} {s.surname}</p>
                        <p className="text-xs text-slate-400">{s.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold">{s.course}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => {
                        setSelectedStudent(s);
                        setShowModal(true);
                      }}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                      Enter Grade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl",
                isDarkMode ? "bg-[#111111] border border-white/5" : "bg-white border border-slate-200"
              )}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black tracking-tighter">Enter Grade</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {gradeSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={cn(
                        "p-4 rounded-2xl flex items-center gap-3 mb-4",
                        saveAllComplete ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                      )}
                    >
                      {saveAllComplete ? <ShieldCheck className="w-5 h-5 flex-shrink-0" /> : <Info className="w-5 h-5 flex-shrink-0" />}
                      <p className="text-xs font-bold leading-tight">{gradeSuccess}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Student</p>
                  <p className="font-bold text-xl">{selectedStudent.name}</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructor</label>
                    <input 
                      type="text"
                      value={`${facultyUser.name} ${facultyUser.surname}`}
                      disabled
                      className={cn("w-full p-4 rounded-2xl border outline-none font-bold opacity-60", isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</label>
                    <select 
                      value={newGrade.subject || ''}
                      onChange={e => setNewGrade({...newGrade, subject: e.target.value})}
                      className={cn("w-full p-4 rounded-2xl border outline-none font-bold appearance-none", isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900")}
                    >
                      <option value="">Select Assigned Subject</option>
                      {facultyCoursesList.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prelim</label>
                    <input 
                      type="text"
                      value={newGrade.prelim || ''}
                      onChange={e => setNewGrade({...newGrade, prelim: e.target.value})}
                      className={cn("w-full p-4 rounded-2xl border outline-none font-bold", isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}
                      placeholder="1.0 - 5.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Midterm</label>
                    <input 
                      type="text"
                      value={newGrade.midterm || ''}
                      onChange={e => setNewGrade({...newGrade, midterm: e.target.value})}
                      className={cn("w-full p-4 rounded-2xl border outline-none font-bold", isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}
                      placeholder="1.0 - 5.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prefinal</label>
                    <input 
                      type="text"
                      value={newGrade.prefinal || ''}
                      onChange={e => setNewGrade({...newGrade, prefinal: e.target.value})}
                      className={cn("w-full p-4 rounded-2xl border outline-none font-bold", isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}
                      placeholder="1.0 - 5.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Finals</label>
                    <input 
                      type="text"
                      value={newGrade.finals || ''}
                      onChange={e => setNewGrade({...newGrade, finals: e.target.value})}
                      className={cn("w-full p-4 rounded-2xl border outline-none font-bold", isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}
                      placeholder="1.0 - 5.0"
                    />
                  </div>
                </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester</label>
                    <select 
                      value={newGrade.semester || '1st Semester'}
                      onChange={e => setNewGrade({...newGrade, semester: e.target.value})}
                      className={cn("w-full p-4 rounded-2xl border outline-none font-bold appearance-none", isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900")}
                    >
                      <option>1st Semester</option>
                      <option>2nd Semester</option>
                      <option>Summer</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                    <input 
                      type="date"
                      value={newGrade.date || ''}
                      onChange={e => setNewGrade({...newGrade, date: e.target.value})}
                      className={cn("w-full p-4 rounded-2xl border outline-none font-bold", isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}
                    />
                  </div>
                </div>
                <button 
                  onClick={handleAddGrade}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                  Submit Grade
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

function FacultyDashboard({ 
  user, 
  isDarkMode, 
  financialAid = [], 
  scholarships = [], 
  recommendations = [], 
  fetchRecommendations,
  users = [],
  fetchUsers,
  setView,
  selectedStudentForRec,
  setSelectedStudentForRec
}: { 
  user: UserData, 
  isDarkMode?: boolean, 
  financialAid?: any[], 
  scholarships?: any[], 
  recommendations?: any[], 
  fetchRecommendations: () => void,
  users?: UserData[],
  fetchUsers: () => void,
  setView: (view: string) => void,
  selectedStudentForRec: {id: string, name: string} | null,
  setSelectedStudentForRec: (val: {id: string, name: string} | null) => void
}) {
  const [showRecModal, setShowRecModal] = useState(false);
  const [recData, setRecData] = useState({ studentId: '', studentName: '', content: '' });
  const [selectedStudent, setSelectedStudent] = useState<UserData | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [newGrade, setNewGrade] = useState({ subject: '', instructor: user.name, grade: '' });

  const handleAddGrade = async () => {
    if (!selectedStudent) return;
    const updatedGrades = [...(selectedStudent.grades || []), newGrade];
    const { error } = await supabase
      .from('users')
      .update({ grades: updatedGrades })
      .eq('id', selectedStudent.id);
    
    if (!error) {
      fetchUsers();
      setSelectedStudent({ ...selectedStudent, grades: updatedGrades });
      setNewGrade({ subject: '', instructor: user.name, grade: '' });
    }
  };

  const removeGrade = async (index: number) => {
    if (!selectedStudent) return;
    const updatedGrades = (selectedStudent.grades || []).filter((_, i) => i !== index);
    const { error } = await supabase
      .from('users')
      .update({ grades: updatedGrades })
      .eq('id', selectedStudent.id);
    
    if (!error) {
      fetchUsers();
      setSelectedStudent({ ...selectedStudent, grades: updatedGrades });
    }
  };

  useEffect(() => {
    if (selectedStudentForRec) {
      setRecData({ studentId: selectedStudentForRec.id, studentName: selectedStudentForRec.name, content: '' });
      setShowRecModal(true);
      setSelectedStudentForRec(null);
    }
  }, [selectedStudentForRec]);

  const students = (users || []).filter(u => u.role === 'student');

  const handleRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('recommendations')
      .insert({ 
        ...recData, 
        facultyId: user.id, 
        facultyName: user.name,
        date: new Date().toISOString()
      });
    
    if (!error) {
      setShowRecModal(false);
      setRecData({ studentId: '', studentName: '', content: '' });
      fetchRecommendations();
    }
  };

  const handleStudentSelect = (studentName: string) => {
    const selectedStudent = students.find(s => s.name === studentName);
    if (selectedStudent) {
      setRecData({ ...recData, studentName, studentId: selectedStudent.id });
    } else {
      setRecData({ ...recData, studentName, studentId: '' });
    }
  };

  const myRecommendations = (recommendations || []).filter((r: any) => r.facultyId === user.id);

  const assignedApplications = (financialAid || []).filter(app => app.facultyId === user.id || app.status === 'pending').slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 pb-20 pt-4">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-red-600/20">Strategic Faculty</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-mono">Credentialed Professional</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
            Faculty <span className="text-red-600 font-sans italic underline decoration-red-600/30 underline-offset-8">Terminal</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium font-sans">Evaluation Oversight • Mentorship Coordination • Academic Grading</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Appointment review button removed per request */}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<FileText />} label="Eval Queue" value={assignedApplications.length.toString()} trend="Pending Review" trendType="neutral" color="purple" isDarkMode={isDarkMode} />
        <StatCard icon={<Clock />} label="Urgent Items" value={assignedApplications.filter((a: any) => a.status === 'pending').length.toString()} trend="Requires Action" trendType="down" color="red" isDarkMode={isDarkMode} />
        <StatCard icon={<Award />} label="Letters Sent" value={myRecommendations.length.toString()} trend="Verified Scholar" trendType="up" color="emerald" isDarkMode={isDarkMode} />
        <StatCard icon={<Users />} label="Class Roster" value={students.length.toString()} trend="Faculty Assigned" trendType="neutral" color="blue" isDarkMode={isDarkMode} />
      </div>

      <div className={cn(
        "p-10 rounded-[3rem] border transition-all",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
      )}>
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-red-600" />
              Strategic Grading Hub
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 font-mono">Assign academic performance points to active undergraduates</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student, i) => (
            <div key={i} className={cn(
              "p-8 rounded-4xl border relative group transition-all hover:border-red-600/50",
              isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
            )}>
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform">
                    {student.name[0]}
                  </div>
                  <div>
                    <h4 className="font-black text-lg tracking-tighter leading-none flex items-center gap-2">
                      {student.name}
                      {student.grades?.some((g: any) => g.instructor === user.id) && (
                        <div className="group/warn relative">
                          <AlertTriangle className="w-4 h-4 text-amber-500 cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover/warn:opacity-100 transition-opacity pointer-events-none z-10">
                            Grades already input for this student by you.
                          </div>
                        </div>
                      )}
                    </h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 font-mono">S-ID: {student.id?.toString().slice(-6) || '......'}</p>
                  </div>
                </div>
              <button 
                onClick={() => {
                  setSelectedStudent(student);
                  setShowManageModal(true);
                }}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-slate-900 dark:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-black/10"
              >
                <PlusCircle className="w-4 h-4" />
                Assign Performance
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className={cn(
            "p-8 rounded-[2.5rem] border transition-all",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <h3 className="text-xl font-bold mb-8">Applications Assigned to Me</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Program</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {assignedApplications.map((app, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-black">{app.studentName}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{app.studentId}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-500">{app.program}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          app.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                        )}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setView('applications')}
                          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={cn(
            "p-8 rounded-[2.5rem] border transition-all",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <h3 className="text-xl font-bold mb-6">Scholarship Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scholarships.map((s, i) => (
                <div key={i} className={cn(
                  "p-6 rounded-2xl border",
                  isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
                )}>
                  <h4 className="font-black text-red-600 mb-1">{s.name}</h4>
                  <p className="text-xs text-slate-400 mb-4">{s.description}</p>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Coverage: {s.coverage}</span>
                    <span className="text-emerald-500">Deadline: {s.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className={cn(
            "p-8 rounded-[2.5rem] border transition-all",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <h3 className="text-xl font-bold mb-6">My Recommendations</h3>
            <div className="space-y-4">
              {recommendations.map((r, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10">
                  <p className="font-bold text-sm">{r.studentName}</p>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{r.content}</p>
                  <p className="text-[10px] text-slate-500 mt-2">{new Date(r.date).toLocaleDateString()}</p>
                </div>
              ))}
              {recommendations.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-4">No recommendations written yet.</p>
              )}
            </div>
          </div>

          <div className={cn(
            "p-8 rounded-[2.5rem] border transition-all",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setShowRecModal(true)}
                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle className="w-5 h-5" />
                Write Recommendations
              </button>
              <button 
                onClick={() => setView('applications')}
                className="w-full py-4 rounded-2xl border border-slate-200 dark:border-white/10 font-black hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <FileText className="w-5 h-5" />
                View All Assigned
              </button>
            </div>
          </div>
        </div>
      </div>

      {showRecModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "w-full max-w-lg p-8 rounded-[2.5rem] border shadow-2xl",
              isDarkMode ? "bg-[#111111] border-white/10" : "bg-white border-slate-200"
            )}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black tracking-tight">New Recommendation</h3>
              <button onClick={() => setShowRecModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleRecommendation} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Student Name</label>
                <select 
                  value={recData.studentName}
                  onChange={e => handleStudentSelect(e.target.value)}
                  className={cn(
                    "w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold",
                    isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  )}
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Student ID</label>
                <input 
                  type="text" 
                  value={recData.studentId}
                  readOnly
                  className={cn(
                    "w-full p-4 rounded-2xl border outline-none transition-all font-bold opacity-70",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                  placeholder="Student ID"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Recommendation Content</label>
                <textarea 
                  value={recData.content}
                  onChange={e => setRecData({...recData, content: e.target.value})}
                  className={cn(
                    "w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold h-32 resize-none",
                    isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  )}
                  placeholder="Write your recommendation here..."
                  required
                />
              </div>
              <button className="w-full py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
                Submit Recommendation
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Manage Records Modal */}
      <AnimatePresence>
        {showManageModal && selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowManageModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col",
                isDarkMode ? "bg-[#111111] border border-white/5" : "bg-white border border-slate-200"
              )}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter">
                    Manage Grades
                  </h2>
                  <p className={cn("text-sm font-bold", isDarkMode ? "text-slate-500" : "text-slate-400")}>
                    Student: {selectedStudent.name} ({selectedStudent.id})
                  </p>
                </div>
                <button 
                  onClick={() => setShowManageModal(false)}
                  className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
                {/* Add Form */}
                <div className={cn(
                  "p-6 rounded-2xl border",
                  isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
                )}>
                  <h4 className="text-sm font-black uppercase tracking-widest mb-4">Add New Grade</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                      placeholder="Subject"
                      value={newGrade.subject}
                      onChange={e => setNewGrade({...newGrade, subject: e.target.value})}
                      className={cn("p-3 rounded-xl border text-sm font-bold outline-none", isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900")}
                    />
                    <select 
                      value={newGrade.grade}
                      onChange={e => setNewGrade({...newGrade, grade: e.target.value})}
                      className={cn("p-3 rounded-xl border text-sm font-bold outline-none appearance-none", isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900")}
                    >
                      <option value="">Grade</option>
                      <option value="1.0">1.0</option>
                      <option value="1.25">1.25</option>
                      <option value="1.5">1.5</option>
                      <option value="1.75">1.75</option>
                      <option value="2.0">2.0</option>
                      <option value="2.25">2.25</option>
                      <option value="2.5">2.5</option>
                      <option value="2.75">2.75</option>
                      <option value="3.0">3.0</option>
                      <option value="5.0">5.0</option>
                      <option value="INC">INC</option>
                      <option value="W">W</option>
                    </select>
                    <button 
                      onClick={handleAddGrade}
                      className="bg-red-600 text-white font-black rounded-xl py-3 hover:bg-red-700 transition-all"
                    >
                      Add Grade
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-widest">Current Grades</h4>
                  <div className="space-y-2">
                    {(selectedStudent.grades || []).map((g, i) => (
                      <div key={i} className={cn("p-4 rounded-xl border flex items-center justify-between", isDarkMode ? "bg-white/5 border-white/5" : "bg-white border-slate-100")}>
                        <div>
                          <p className="font-bold">{g.subject}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Grade: {g.grade}</p>
                        </div>
                        <button onClick={() => removeGrade(i)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(selectedStudent.grades || []).length === 0 && <p className="text-xs text-slate-500 italic">No grades recorded yet.</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StaffDashboard({ 
  user, 
  isDarkMode, 
  financialAid = [], 
  scholarships = [], 
  announcements = [],
  updateFinancialAidStatus,
  setView
}: { 
  user: UserData, 
  isDarkMode?: boolean, 
  financialAid?: any[], 
  scholarships?: any[], 
  announcements?: any[],
  updateFinancialAidStatus: (id: number, status: string) => void,
  setView: (view: string) => void
}) {
  const recentApplications = (financialAid || []).slice(-5).reverse();
  const pendingApps = (financialAid || []).filter(a => a.status === 'pending').length;
  const reviewApps = (financialAid || []).filter(a => a.status === 'review').length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tighter">Staff Dashboard</h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Financial Aid Office • Document & Application Management</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<FileText />} label="Total Applications" value={financialAid.length.toString()} trend="Active" color="purple" isDarkMode={isDarkMode} />
        <StatCard icon={<Clock />} label="Pending" value={pendingApps.toString()} trend="Action required" color="amber" isDarkMode={isDarkMode} />
        <StatCard icon={<Search />} label="Under Review" value={reviewApps.toString()} trend="In progress" color="indigo" isDarkMode={isDarkMode} />
        <StatCard icon={<XCircle />} label="Incomplete Docs" value="2" trend="Need follow-up" color="red" isDarkMode={isDarkMode} />
      </div>

      <div className={cn(
        "p-8 rounded-[2.5rem] border transition-all overflow-hidden",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
      )}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Recent Applications</h3>
          <button 
            onClick={() => setView('applications')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
            )}
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">App ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Program</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documents</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {recentApplications.map((app, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{app.id?.toString().slice(-8) || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm font-black">{app.studentName || 'Unknown Student'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-500">{app.program || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {app.docs === 'Complete' ? (
                        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                          <CheckCircle className="w-3 h-3" /> Complete
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                          <XCircle className="w-3 h-3" /> Incomplete
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      app.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" :
                      app.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                      app.status === 'review' ? "bg-blue-500/10 text-blue-500" :
                      "bg-red-500/10 text-red-500"
                    )}>
                      {app.status || 'Unknown'}
                    </span>
                  </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => updateFinancialAidStatus(app.id, 'review')}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                        >
                          Review
                        </button>
                        <button 
                          onClick={() => updateFinancialAidStatus(app.id, 'approved')}
                          className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                        >
                          Approve
                        </button>
                      </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={cn(
          "p-8 rounded-[2.5rem] border transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-600" /> Application Summary
          </h3>
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm font-bold italic">
            Chart Visualization Placeholder
          </div>
        </div>
        <div className={cn(
          "p-8 rounded-[2.5rem] border transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-red-600" /> Recent Inquiries
          </h3>
          <div className="space-y-4">
            {[
              { from: 'John Doe', subject: 'Scholarship Status', time: '2h ago' },
              { from: 'Maria Reyes', subject: 'Document Verification', time: '5h ago' },
            ].map((msg, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm">{msg.from}</h4>
                  <p className="text-xs text-slate-400">{msg.subject}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-500">{msg.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Dashboard({ user, announcements, isDarkMode }: { user: UserData, announcements: any[], isDarkMode?: boolean }) {
  const chartData = [
    { name: 'Midterm', value: 3.5 },
    { name: 'Finals', value: 3.8 },
    { name: 'Current', value: 3.9 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Mabuhay, {user.name.split(' ')[0]}! 👋</h1>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Student Portal • {user.course} • {user.yearLevel}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "px-6 py-3 rounded-2xl border flex items-center gap-3",
            isDarkMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-emerald-50 border-emerald-100 text-emerald-600"
          )}>
            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">Officially Enrolled</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Wallet />} 
          label="Remaining Balance" 
          value={`₱${user.balance?.toLocaleString() || '0'}`} 
          trend="Next due: May 15"
          color="red"
          isDarkMode={isDarkMode}
        />
        <StatCard 
          icon={<GraduationCap />} 
          label="Current GPA" 
          value="3.82" 
          trend="Dean's List Candidate"
          color="emerald"
          isDarkMode={isDarkMode}
        />
        <StatCard 
          icon={<Library />} 
          label="Library Books" 
          value="2" 
          trend="Due in 3 days"
          color="amber"
          isDarkMode={isDarkMode}
        />
        <StatCard 
          icon={<FileText />} 
          label="Requirements" 
          value="95%" 
          trend="Profile complete"
          color="blue"
          isDarkMode={isDarkMode}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={cn(
          "lg:col-span-2 p-8 rounded-[2.5rem] border transition-all flex flex-col justify-between overflow-hidden",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              GPA Projection
            </h3>
            <div className="px-3 py-1 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
              Live
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 12 }} />
                <YAxis domain={[0, 4]} hide />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 text-xs font-bold text-slate-400 text-center uppercase tracking-widest italic">Maintain high scores in finals to reach 3.9 GPA</p>
        </div>

        <div className={cn(
          "p-8 rounded-[2.5rem] border transition-all flex flex-col",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-red-600" />
            Campus Feed
          </h3>
          <div className="space-y-6 flex-1">
            {(announcements || []).slice(0, 3).map((a, i) => (
              <div key={i} className="group cursor-pointer border-l-2 border-transparent hover:border-red-600 pl-4 transition-all">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">{a.date}</p>
                <h4 className="font-bold text-sm leading-snug group-hover:text-red-600 transition-colors">{a.title}</h4>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 bg-slate-50 dark:bg-white/5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
            See All Updates
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AdminDashboard({ 
  user, 
  isDarkMode, 
  users = [], 
  financialAid = [], 
  scholarships = [], 
  announcements = [],
  transactions = [],
  updateFinancialAidStatus,
  setView
}: { 
  user: UserData, 
  isDarkMode?: boolean, 
  users?: UserData[], 
  financialAid?: any[], 
  scholarships?: any[], 
  announcements?: any[],
  transactions?: any[],
  updateFinancialAidStatus: (id: number, status: string) => void,
  setView: (view: string) => void
}) {
  // Generate dynamic barData based on actual financial aid applications for current month
  const barData = (() => {
    const days: { [key: string]: number } = {};
    const now = new Date();
    const monthName = now.toLocaleString('default', { month: 'short' });
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    // Initialize days for current month
    for (let i = 1; i <= daysInMonth; i++) {
      days[`${monthName} ${i}`] = 0;
    }

    (financialAid || []).forEach(a => {
      const date = new Date(a.date);
      // Check if it's current month and year
      if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
        const day = `${monthName} ${date.getDate()}`;
        if (days[day] !== undefined) {
          days[day]++;
        }
      }
    });

    return Object.entries(days).map(([name, value]) => ({ name, value }));
  })();

  const recentApplications = (financialAid || []).slice(-5).reverse();
  const pendingApps = (financialAid || []).filter(a => a.status === 'pending').length;
  const totalAid = (financialAid || []).reduce((acc, curr) => acc + (parseInt(curr.amount?.toString().replace(/[^0-9]/g, '') || '0')), 0);

  const studentCount = (users || []).filter(u => u.role === 'student').length;
  const facultyCount = (users || []).filter(u => u.role === 'faculty').length;
  const staffCount = (users || []).filter(u => u.role === 'staff').length;
  const adminCount = (users || []).filter(u => u.role === 'admin').length;
  const totalUsers = (users || []).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tighter">Admin Dashboard</h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>System-wide overview and management</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard icon={<Users />} label="Total Users" value={totalUsers.toString()} trend="+2 this week" color="purple" isDarkMode={isDarkMode} />
        <StatCard icon={<FileText />} label="Applications" value={(financialAid || []).length.toString()} trend={`${pendingApps} pending`} color="blue" isDarkMode={isDarkMode} />
        <StatCard icon={<Award />} label="Programs" value={(scholarships || []).length.toString()} trend="Active" color="amber" isDarkMode={isDarkMode} />
        <StatCard icon={<Clock />} label="Pending Review" value={pendingApps.toString()} trend="Action required" color="indigo" isDarkMode={isDarkMode} />
        <StatCard icon={<CheckCircle />} label="Aid Disbursed" value={`₱${totalAid.toLocaleString()}`} trend="Total this year" color="emerald" isDarkMode={isDarkMode} />
        <StatCard icon={<TrendingUp />} label="System Uptime" value="99.9%" trend="Optimal" color="red" isDarkMode={isDarkMode} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className={cn(
        "p-8 rounded-[2.5rem] border transition-all",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
      )}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black tracking-tight">Application Activity Log</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Daily Breakdown (April 2026)</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Date Range</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Applications</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Growth Status</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {(() => {
                const trends = [
                  { period: 'April 01 - April 07', count: (financialAid || []).filter(a => { const d = new Date(a.date); return d.getDate() <= 7 && d.getMonth() === 3 && d.getFullYear() === 2026; }).length, growth: '+12%', status: 'High Volume' },
                  { period: 'April 08 - April 14', count: (financialAid || []).filter(a => { const d = new Date(a.date); return d.getDate() > 7 && d.getDate() <= 14 && d.getMonth() === 3 && d.getFullYear() === 2026; }).length, growth: '+5%', status: 'Steady' },
                  { period: 'April 15 - April 21', count: (financialAid || []).filter(a => { const d = new Date(a.date); return d.getDate() > 14 && d.getDate() <= 21 && d.getMonth() === 3 && d.getFullYear() === 2026; }).length, growth: '+25%', status: 'Peak' },
                  { period: 'April 22 - April 30', count: (financialAid || []).filter(a => { const d = new Date(a.date); return d.getDate() > 21 && d.getMonth() === 3 && d.getFullYear() === 2026; }).length, growth: '-2%', status: 'Tapering' },
                ];
                return trends.map((t, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-4 font-bold text-sm">{t.period}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" />
                        <span className="font-bold text-xs">{t.count} submissions</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                        t.growth.startsWith('+') ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" : "bg-red-500/10 text-red-500 border-red-500/10"
                      )}>
                        {t.growth}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-500 transition-colors">{t.status}</span>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>

        <div className={cn(
          "p-8 rounded-[2.5rem] border transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-xl font-bold mb-8">User Distribution</h3>
          <div className="space-y-6">
            {[
              { label: 'Students', count: studentCount, color: 'bg-blue-500', percent: totalUsers ? (studentCount / totalUsers) * 100 : 0 },
              { label: 'Faculty', count: facultyCount, color: 'bg-emerald-500', percent: totalUsers ? (facultyCount / totalUsers) * 100 : 0 },
              { label: 'Staff', count: staffCount, color: 'bg-amber-500', percent: totalUsers ? (staffCount / totalUsers) * 100 : 0 },
              { label: 'Admins', count: adminCount, color: 'bg-red-500', percent: totalUsers ? (adminCount / totalUsers) * 100 : 0 },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>{item.label}</span>
                  <span className="text-red-600">{item.count} accounts</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${item.percent}%` }} 
                    className={cn("h-full rounded-full", item.color)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={cn(
            "p-8 rounded-[2.5rem] border transition-all mt-8",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                <Receipt className="w-5 h-5 text-red-600" />
                Financial Logs
              </h3>
              <button 
                onClick={() => setView('transactions')}
                className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors"
              >
                View Hub →
              </button>
            </div>
            <div className="space-y-4">
              {(transactions || []).slice(0, 3).map((t, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl px-2 transition-colors">
                  <div>
                    <p className="font-bold text-sm tracking-tight">{t.userName || 'Unknown'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.details || t.type} • {new Date(t.timestamp || t.date).toLocaleDateString()}</p>
                  </div>
                  <p className={cn(
                    "text-base font-black", 
                    (t.type || '').includes('Payment') ? "text-emerald-500" : "text-blue-500"
                  )}>
                    {(t.type || '').includes('Payment') ? '-' : '+'}₱{t.amount?.toLocaleString()}
                  </p>
                </div>
              ))}
              {(!transactions || transactions.length === 0) && (
                <p className="text-center py-6 text-slate-400 font-bold italic">No logs found.</p>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setView('admin')}
              className={cn(
                "py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
              )}
            >
              Manage Users
            </button>
            <button 
              onClick={() => setView('courses')}
              className={cn(
                "py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
              )}
            >
              Manage Courses
            </button>
            <button 
              onClick={() => setView('programs')}
              className={cn(
                "col-span-full md:col-auto py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
              )}
            >
              Manage Programs
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className={cn(
          "p-8 rounded-[2.5rem] border transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Scholarship Impact Report</h3>
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <Award className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className={cn("p-6 rounded-3xl", isDarkMode ? "bg-white/5" : "bg-slate-50")}>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Programs</p>
              <p className="text-3xl font-black">{(scholarships || []).length}</p>
            </div>
            <div className={cn("p-6 rounded-3xl", isDarkMode ? "bg-white/5" : "bg-slate-50")}>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Disbursement</p>
              <p className="text-3xl font-black">
                ₱{(financialAid || []).filter(a => a.status === 'approved').length > 0 
                  ? Math.round((financialAid || []).filter(a => a.status === 'approved').reduce((acc, curr) => acc + (parseInt(curr.amount?.toString().replace(/[^0-9]/g, '') || '0')), 0) / (financialAid || []).filter(a => a.status === 'approved').length).toLocaleString()
                  : '0'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-500 mb-2">Applications per Program</p>
            {(scholarships || []).map(s => {
              const count = (financialAid || []).filter(a => a.program === s.name).length;
              const total = (financialAid || []).length || 1;
              const percent = (count / total) * 100;
              return (
                <div key={s.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{s.name}</span>
                    <span className="font-bold">{count} apps</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${percent}%` }} 
                      className="h-full bg-amber-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={cn(
          "p-8 rounded-[2.5rem] border transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-xl font-bold mb-8">Recent Activity</h3>
          <div className="space-y-6">
            {recentApplications.map((app, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                    {app.studentName?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{app.studentName || 'Unknown Student'}</p>
                    <p className="text-xs text-slate-500">{app.program}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{app.amount}</p>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    app.status === 'approved' ? "text-emerald-500" : app.status === 'rejected' ? "text-red-500" : "text-amber-500"
                  )}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={cn(
        "p-8 rounded-[2.5rem] border transition-all overflow-hidden",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
      )}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Recent Applications</h3>
          <button 
            onClick={() => setView('applications')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
            )}
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={isDarkMode ? "bg-white/5" : "bg-slate-50"}>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Program</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", isDarkMode ? "divide-white/5" : "divide-slate-100")}>
              {recentApplications.map((app, i) => (
                <tr key={i} className={cn("transition-colors", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50")}>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{app.id?.toString().slice(-8) || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm font-black">{app.studentName || 'Unknown Student'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-500">{app.program}</td>
                  <td className="px-6 py-4 text-sm font-black text-emerald-500">{app.amount}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      app.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" :
                      app.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                      "bg-blue-500/10 text-blue-500"
                    )}>
                      {app.status}
                    </span>
                  </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => updateFinancialAidStatus(app.id, 'approved')}
                          className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => updateFinancialAidStatus(app.id, 'rejected')}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function PoliciesView({ policies, isDarkMode }: { policies: any, isDarkMode: boolean }) {
  if (!policies) return <div className="p-12 text-center font-bold text-slate-400">Loading policies...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-4xl mx-auto"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black tracking-tight mb-4 text-red-600">Policies & User Guide</h1>
        <p className="text-slate-500 font-medium">Everything you need to know about the Student Aid Portal</p>
      </div>

      <div className="grid gap-6">
        <div className={cn(
          "p-8 rounded-[2.5rem] border",
          isDarkMode ? "bg-[#111111] border-white/10" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-50 rounded-2xl">
              <UserPlus className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Registration Policy</h2>
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-500 leading-relaxed whitespace-pre-line">{policies.registration}</p>
          </div>
        </div>

        <div className={cn(
          "p-8 rounded-[2.5rem] border",
          isDarkMode ? "bg-[#111111] border-white/10" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Roles & Permissions</h2>
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-500 leading-relaxed whitespace-pre-line">{policies.roles}</p>
          </div>
        </div>

        <div className={cn(
          "p-8 rounded-[2.5rem] border",
          isDarkMode ? "bg-[#111111] border-white/10" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-50 rounded-2xl">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">User Guide</h2>
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-500 leading-relaxed whitespace-pre-line">{policies.guide}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ForgotPassword({ onBack, isDarkMode, setError }: { onBack: () => void, isDarkMode: boolean, setError: (msg: string) => void }) {
  const [step, setStep] = useState(1);
  const [schoolId, setSchoolId] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [storedPassword, setStoredPassword] = useState('');

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestName, setRequestName] = useState('');

  const handleGetQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('securityQuestion, securityAnswer, password')
        .eq('id', schoolId)
        .single();

      if (error || !data) {
        setError('User not found');
        return;
      }

      setQuestion(data.securityQuestion || 'No security question set');
      setStoredPassword(data.password || '');
      setStep(2);
    } catch (err) {
      setError('Failed to fetch question');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    // Assuming we have the answer from handleGetQuestion fetched or we fetch it now
    // For security, it's better to fetch it and compare.
    // We already fetched it in handleGetQuestion as data.securityAnswer
    // But we need to store it in state or use it.
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check old password
    if (newPassword === storedPassword) {
      setError("New password cannot be the same as your previous password.");
      return;
    }

    const isPasswordStrong = (pw: string) => {
      const length = pw.length >= 8;
      const uppercase = /[A-Z]/.test(pw);
      const lowercase = /[a-z]/.test(pw);
      const number = /\d/.test(pw);
      const special = /[!@#$%^&*(),.?":{}|<>]/.test(pw);
      return length && uppercase && lowercase && number && special;
    };

    if (!isPasswordStrong(newPassword)) {
      setError('Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('securityAnswer')
        .eq('id', schoolId)
        .single();

      if (fetchError || !user) {
        setError('User not found');
        return;
      }

      if (user.securityAnswer !== answer) {
        setError('Incorrect security answer');
        return;
      }

      setIsAnswerCorrect(true);

      const { error: updateError } = await supabase
        .from('users')
        .update({ password: newPassword })
        .eq('id', schoolId);

      if (updateError) {
        setError('Failed to update password');
        return;
      }

      setError('Password reset successful! Please login.');
      onBack();
    } catch (err) {
      setError('Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAdmin = async () => {
    if (!requestName) return;

    try {
      const { error } = await supabase
        .from('reset_requests')
        .insert({ 
          schoolId, 
          name: requestName, 
          status: 'pending',
          timestamp: new Date().toISOString()
        });

      if (error) throw error;

      setError('Request sent to admin. Please wait for approval.');
      setShowRequestModal(false);
      onBack();
    } catch (err) {
      setError('Failed to send request');
    }
  };

  return (
    <div className="space-y-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-sm font-bold"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </button>

      <div className="text-center">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Key className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-[#1a2b4b] dark:text-white">Account Recovery</h1>
        <p className="text-stone-500 mt-3 font-medium">Follow the steps to reset your password</p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleGetQuestion} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-black text-stone-700 dark:text-slate-300 uppercase tracking-widest">School ID Number</label>
            <input 
              type="text" 
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              className={cn(
                "w-full p-4 border-2 border-transparent rounded-2xl outline-none transition-all font-bold text-slate-900 dark:text-white",
                isDarkMode ? "bg-white/5 focus:border-red-600" : "bg-stone-50 focus:border-red-600 focus:bg-white"
              )}
              placeholder="SCC-XX-XXXXXXXX"
              required
            />
          </div>
          <button 
            disabled={loading}
            className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-200 disabled:opacity-50"
          >
            {loading ? 'Searching Account...' : 'Continue Recovery'}
          </button>
          
          <div className="pt-4 border-t border-stone-100">
            <p className="text-sm text-stone-500 text-center mb-4">Forgot your security question?</p>
            <button 
              type="button"
              onClick={() => setShowRequestModal(true)}
              className="w-full py-4 border-2 border-stone-200 text-stone-700 rounded-2xl font-bold hover:bg-stone-50 transition-all"
            >
              Request Admin Reset
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-6">
          <div className={cn(
            "p-6 rounded-[2rem] border-2 relative overflow-hidden",
            isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-100"
          )}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Shield className="w-12 h-12" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Security Question</p>
            <p className="text-xl font-black text-stone-900 dark:text-white leading-tight">{question}</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-black text-stone-700 dark:text-slate-300 uppercase tracking-widest">Your Answer</label>
            <div className="relative">
              <input 
                type={showPasswords ? "text" : "password"}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className={cn(
                  "w-full p-4 border-2 border-transparent rounded-2xl outline-none transition-all font-bold text-slate-900 dark:text-white pr-12",
                  isDarkMode ? "bg-white/5 focus:border-red-600" : "bg-stone-50 focus:border-red-600 focus:bg-white"
                )}
                placeholder="Type your answer here"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-black text-stone-700 dark:text-slate-300 uppercase tracking-widest">New Password</label>
              <div className="relative">
                <input 
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={cn(
                    "w-full p-4 border-2 border-transparent rounded-2xl outline-none transition-all font-bold text-slate-900 dark:text-white pr-12",
                    isDarkMode ? "bg-white/5 focus:border-red-600" : "bg-stone-50 focus:border-red-600 focus:bg-white"
                  )}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-black text-stone-700 dark:text-slate-300 uppercase tracking-widest">Confirm</label>
              <div className="relative">
                <input 
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    "w-full p-4 border-2 border-transparent rounded-2xl outline-none transition-all font-bold text-slate-900 dark:text-white pr-12",
                    isDarkMode ? "bg-white/5 focus:border-red-600" : "bg-stone-50 focus:border-red-600 focus:bg-white"
                  )}
                  required
                />
              </div>
            </div>
          </div>

          <button 
            disabled={loading || !answer || !newPassword || !confirmPassword}
            className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-200 disabled:opacity-50"
          >
            {loading ? 'Resetting Password...' : 'Update Password'}
          </button>
        </form>
      )}

      {/* Request Admin Reset Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={cn(
              "rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border",
              isDarkMode ? "bg-[#111111] border-white/10" : "bg-white border-stone-100"
            )}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-red-600" />
              </div>
              <button 
                onClick={() => setShowRequestModal(false)}
                className="p-2 hover:bg-stone-50 dark:hover:bg-white/5 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-stone-400" />
              </button>
            </div>

            <h3 className="text-2xl font-black text-[#1a2b4b] dark:text-white mb-2">Verification Required</h3>
            <p className="text-stone-500 mb-6 font-medium">Please enter your full name as registered in the system to request a password reset from the administrator.</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-black text-stone-400 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text"
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  placeholder="Enter your full name"
                  className={cn(
                    "w-full p-4 border-2 border-transparent rounded-2xl outline-none transition-all font-bold text-slate-900 dark:text-white",
                    isDarkMode ? "bg-white/5 focus:border-red-600" : "bg-stone-50 focus:border-red-600 focus:bg-white"
                  )}
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRequestAdmin}
                  disabled={!requestName.trim()}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
                >
                  Confirm Request
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function SearchResults({ results, query, isDarkMode }: { results: any, query: string, isDarkMode: boolean }) {
  if (!results) return null;

  const hasResults = results.users.length > 0 || results.announcements.length > 0 || results.applications.length > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tighter">Search Results</h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>
          Showing results for "<span className="text-red-600 font-bold">{query}</span>"
        </p>
      </header>

      {!hasResults ? (
        <div className="py-20 text-center">
          <div className="inline-block p-6 bg-slate-100 dark:bg-white/5 rounded-full mb-6">
            <Search className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No results found</h3>
          <p className="text-slate-500">Try searching for something else or check your spelling.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users Section */}
          <div className={cn(
            "p-6 rounded-[2.5rem] border flex flex-col gap-6",
            isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
          )}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-red-600" />
                Users
              </h3>
              <span className="px-2 py-1 bg-red-600/10 text-red-600 rounded-lg text-[10px] font-black">{results.users.length}</span>
            </div>
            <div className="space-y-3">
              {results.users.length > 0 ? results.users.map((u: any) => (
                <div key={u.id} className={cn(
                  "p-4 rounded-2xl border transition-all hover:scale-[1.02]",
                  isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
                )}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold overflow-hidden">
                      {u.profilePic ? (
                        <img src={u.profilePic} alt={u.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        u.name[0]
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{u.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">{u.role} • {u.id}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-slate-400 italic text-center py-4">No users found</p>
              )}
            </div>
          </div>

          {/* Announcements Section */}
          <div className={cn(
            "p-6 rounded-[2.5rem] border flex flex-col gap-6",
            isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
          )}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-blue-600" />
                Announcements
              </h3>
              <span className="px-2 py-1 bg-blue-600/10 text-blue-600 rounded-lg text-[10px] font-black">{results.announcements.length}</span>
            </div>
            <div className="space-y-3">
              {results.announcements.length > 0 ? results.announcements.map((a: any) => (
                <div key={a.id} className={cn(
                  "p-4 rounded-2xl border transition-all hover:scale-[1.02]",
                  isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
                )}>
                  <h4 className="font-bold text-sm mb-1">{a.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{a.content}</p>
                  <p className="text-[10px] text-red-600 font-bold mt-2 uppercase tracking-widest">{a.date}</p>
                </div>
              )) : (
                <p className="text-xs text-slate-400 italic text-center py-4">No announcements found</p>
              )}
            </div>
          </div>

          {/* Applications Section */}
          <div className={cn(
            "p-6 rounded-[2.5rem] border flex flex-col gap-6",
            isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
          )}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Applications
              </h3>
              <span className="px-2 py-1 bg-emerald-600/10 text-emerald-600 rounded-lg text-[10px] font-black">{results.applications.length}</span>
            </div>
            <div className="space-y-3">
              {results.applications.length > 0 ? results.applications.map((app: any) => (
                <div key={app.id} className={cn(
                  "p-4 rounded-2xl border transition-all hover:scale-[1.02]",
                  isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm">{app.program}</h4>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                      app.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    )}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{app.studentName}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{new Date(app.date).toLocaleDateString()}</p>
                </div>
              )) : (
                <p className="text-xs text-slate-400 italic text-center py-4">No applications found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ icon, label, value, trend, trendType = 'up', color, isDarkMode }: { icon: any, label: string, value: string, trend: string, trendType?: 'up' | 'down' | 'neutral', color: string, isDarkMode?: boolean }) {
  const colors: any = {
    emerald: "bg-emerald-500/10 text-emerald-500",
    red: "bg-red-500/10 text-red-500",
    amber: "bg-amber-500/10 text-amber-500",
    blue: "bg-blue-500/10 text-blue-500",
    purple: "bg-purple-500/10 text-purple-500",
    indigo: "bg-indigo-500/10 text-indigo-500"
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={cn(
        "p-8 rounded-[2.5rem] border transition-all relative overflow-hidden group",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
      )}
    >
      <div className="relative z-10">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", colors[color])}>
          {React.cloneElement(icon as React.ReactElement, { className: "w-7 h-7" })}
        </div>
        <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-2", isDarkMode ? "text-slate-500" : "text-slate-400")}>{label}</p>
        <h4 className="text-3xl font-black tracking-tight mb-3 font-mono">{value}</h4>
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1 rounded-md",
            trendType === 'up' ? "bg-emerald-500/20 text-emerald-500" : 
            trendType === 'down' ? "bg-red-500/20 text-red-500" : "bg-slate-500/10 text-slate-500"
          )}>
            {trendType === 'up' ? <TrendingUp className="w-3 h-3" /> : trendType === 'down' ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          </div>
          <p className={cn(
            "text-[10px] font-bold uppercase",
            trendType === 'up' ? "text-emerald-500" : trendType === 'down' ? "text-red-500" : "text-slate-500"
          )}>{trend}</p>
        </div>
      </div>
      <div className={cn(
        "absolute -right-4 -bottom-4 w-32 h-32 opacity-5 blur-3xl rounded-full transition-all group-hover:opacity-10",
        colors[color].split(' ')[1]
      )} />
    </motion.div>
  );
}

const StatusBadge = ({ status, variant = 'default' }: { status: string, variant?: 'default' | 'success' | 'warning' | 'error' | 'info' }) => {
  const variants = {
    default: "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400",
    success: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    error: "bg-red-500/10 text-red-500 border border-red-500/20",
    info: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  };
  return (
    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", variants[variant])}>
      {status}
    </span>
  );
};

function Profile({ user, setUser, isDarkMode }: { user: UserData, setUser: any, isDarkMode?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    ...user,
    name: user.name || '',
    surname: user.surname || '',
    course: user.course || 'BSIT',
    yearLevel: user.yearLevel || '1st Year'
  });
  const [uploading, setUploading] = useState(false);

  const handleUpdate = async () => {
    const { data, error } = await supabase
      .from('users')
      .update(formData)
      .eq('id', user.id)
      .select()
      .single();
    
    if (!error && data) {
      setUser(data);
      setEditing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const { data, error } = await supabase
          .from('users')
          .update({ profilePic: base64String })
          .eq('id', user.id)
          .select()
          .single();
        
        if (!error && data) {
          setUser(data);
        }
      } catch (err) {
        console.error('Upload failed', err);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <div className={cn(
        "rounded-[3rem] border overflow-hidden transition-all",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
      )}>
        <div className={cn("h-48 relative", isDarkMode ? "bg-red-900/20" : "bg-slate-900")}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
        </div>
        <div className="px-12 pb-12">
          <div className="relative -mt-16 mb-8 flex items-end justify-between gap-6">
            <div className={cn(
              "w-32 h-32 p-1.5 rounded-[2.5rem] shadow-2xl relative z-10 group cursor-pointer",
              isDarkMode ? "bg-[#111111]" : "bg-white"
            )}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
                id="profile-upload"
              />
              <label htmlFor="profile-upload" className="cursor-pointer">
                <div className={cn(
                  "w-full h-full rounded-[2rem] flex items-center justify-center text-4xl font-black overflow-hidden relative",
                  isDarkMode ? "bg-white/5 text-red-500" : "bg-slate-100 text-slate-400"
                )}>
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    user.name?.[0] || '?'
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </label>
            </div>
            <button 
              onClick={() => editing ? handleUpdate() : setEditing(true)}
              className={cn(
                "flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all mb-2",
                isDarkMode ? "bg-white text-slate-900 hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200"
              )}
            >
              <Edit className="w-5 h-5" />
              {editing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>

          <div className="space-y-12">
            <div>
              <h1 className="text-4xl font-black tracking-tighter mb-2">{user.name}</h1>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                  user.role === 'admin' ? "bg-red-500/10 text-red-500" : (user.role === 'faculty' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500")
                )}>
                  {user.role}
                </span>
                <span className={cn("text-xs font-bold", isDarkMode ? "text-slate-500" : "text-slate-400")}>Member since 2024</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-red-500 transition-colors">School ID Number</label>
                  <p className="text-xl font-mono font-bold text-red-600">{user.id}</p>
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-red-500 transition-colors">Full Name</label>
                  {editing ? (
                    <input 
                      value={formData.name || ''} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      className={cn(
                        "w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all",
                        isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                      )}
                    />
                  ) : (
                    <p className="text-xl font-bold">{user.name}</p>
                  )}
                </div>
              </div>
              <div className="space-y-8">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-red-500 transition-colors">Surname</label>
                  {editing ? (
                    <input 
                      value={formData.surname || ''} 
                      onChange={e => setFormData({...formData, surname: e.target.value})} 
                      className={cn(
                        "w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all",
                        isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                      )}
                    />
                  ) : (
                    <p className="text-xl font-bold">{user.surname}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-red-500 transition-colors">Account Status</label>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="font-bold text-emerald-500">Active Account</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Grades({ user, isDarkMode, users = [] }: { user: UserData, isDarkMode?: boolean, users?: UserData[] }) {
  const calculateGPA = (grades: any[]) => {
    if (!grades || grades.length === 0) return "0.00";
    
    let totalGrade = 0;
    let count = 0;
    
    grades.forEach(g => {
      const periods = [g.prelim, g.midterm, g.prefinal, g.finals];
      const validPeriods = periods.filter(p => p && !isNaN(parseFloat(p)));
      
      if (validPeriods.length > 0) {
        const avg = validPeriods.reduce((a, b) => a + parseFloat(b), 0) / validPeriods.length;
        totalGrade += avg;
        count++;
      } else if (g.grade && !isNaN(parseFloat(g.grade))) {
        totalGrade += parseFloat(g.grade);
        count++;
      }
    });
    
    return count > 0 ? (totalGrade / count).toFixed(2) : "0.00";
  };

  const semestersOrder = ['1st Semester', '2nd Semester', 'Summer'];
  
  const groupedGrades = (user.grades || []).reduce((acc: any, grade: any) => {
    const sem = grade.semester || '1st Semester';
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(grade);
    return acc;
  }, {});

  const allSemesters = Object.keys(groupedGrades).sort((a, b) => {
    const aOrder = semestersOrder.findIndex(s => a.includes(s));
    const bOrder = semestersOrder.findIndex(s => b.includes(s));
    return aOrder - bOrder;
  });

  const overallGPA = calculateGPA(user.grades || []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-100 dark:border-white/5">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Academic Records</h1>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Your official grades and academic performance history.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className={cn(
            "p-6 rounded-3xl border flex items-center gap-8",
            isDarkMode ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Overall GPA</p>
              <p className="text-4xl font-black tracking-tighter text-red-600">{overallGPA}</p>
            </div>
            <div className="w-px h-12 bg-slate-200 dark:bg-white/10" />
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest">REGULAR</span>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Year</p>
                <p className="text-sm font-bold uppercase">{user.yearLevel || '1st Year'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {allSemesters.length > 0 ? allSemesters.map(semName => {
        const grades = groupedGrades[semName];
        const semGPA = calculateGPA(grades);
        
        return (
          <div key={semName} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-red-600 rounded-full" />
                <h2 className="text-2xl font-black tracking-tight">{semName}</h2>
              </div>
              <div className={cn(
                "px-6 py-3 rounded-2xl border flex items-center gap-4",
                isDarkMode ? "bg-white/5 border-white/5" : "bg-white border-slate-100"
              )}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester GPA</p>
                <p className="text-xl font-black text-red-600">{semGPA}</p>
              </div>
            </div>

            <div className={cn(
              "rounded-[2.5rem] border overflow-hidden transition-all",
              isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
            )}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={isDarkMode ? "bg-white/5" : "bg-slate-50"}>
                      <th className="px-6 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Subject</th>
                      <th className="px-4 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Prelim</th>
                      <th className="px-4 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Midterm</th>
                      <th className="px-4 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Prefinal</th>
                      <th className="px-4 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Finals</th>
                      <th className="px-6 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className={cn("divide-y", isDarkMode ? "divide-white/5" : "divide-slate-100")}>
                    {grades.map((g: any, i: number) => {
                      const avg = [g.prelim, g.midterm, g.prefinal, g.finals]
                        .filter(v => v && !isNaN(parseFloat(v)))
                        .reduce((a, b, _, arr) => a + parseFloat(b) / arr.length, 0);
                      const displayGrade = avg > 0 ? avg.toFixed(2) : (g.grade || '-');
                      const isPassing = avg > 0 ? avg <= 3.0 : (g.grade ? parseFloat(g.grade) <= 3.0 : true);

                      return (
                        <tr key={i} className={cn("transition-colors", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50")}>
                          <td className="px-6 py-6">
                            <p className="font-bold text-sm uppercase tracking-tight">{g.subject}</p>
                            <p className={cn("text-[10px] font-medium", isDarkMode ? "text-slate-500" : "text-slate-400")}>
                              {(() => {
                                const f = users.find(u => u.id === g.instructor);
                                return f ? `${f.name} ${f.surname}` : (g.instructor || '').replace('FAC-', '');
                              })()}
                            </p>
                          </td>
                          <td className="px-4 py-6 text-center font-mono font-bold">{g.prelim || '-'}</td>
                          <td className="px-4 py-6 text-center font-mono font-bold">{g.midterm || '-'}</td>
                          <td className="px-4 py-6 text-center font-mono font-bold">{g.prefinal || '-'}</td>
                          <td className="px-4 py-6 text-center font-mono font-bold">{g.finals || '-'}</td>
                          <td className="px-6 py-6 text-right">
                            <span className={cn(
                              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                              isPassing ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                            )}>
                              {isPassing ? 'PASSED' : 'FAILED'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }) : (
        <div className="py-32 text-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="w-10 h-10 text-slate-300" />
          </div>
          <p className="text-slate-400 font-bold italic text-lg">No academic records available yet.</p>
        </div>
      )}
    </motion.div>
  );
}

function Schedule({ user, isDarkMode }: { user: UserData, isDarkMode?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tighter">My Schedule</h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Your personalized weekly academic timetable.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {user.schedule?.map((s, i) => (
          <div key={i} className={cn(
            "p-8 rounded-[2.5rem] border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:scale-[1.01]",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <div className="flex items-center gap-8">
              <div className={cn(
                "w-20 h-20 rounded-3xl flex flex-col items-center justify-center shrink-0",
                isDarkMode ? "bg-white/5" : "bg-slate-50"
              )}>
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">{(s.day || '').slice(0, 3)}</span>
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-black text-2xl tracking-tight">{s.subject}</h4>
                  <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest">Lecture</span>
                </div>
                <p className={cn("font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                  {(s.instructor || '').replace('FAC-', '')} • <span className="text-red-600">{s.location}</span>
                </p>
              </div>
            </div>
            <div className="md:text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-0 border-white/5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600" />
                <p className="font-black text-2xl tracking-tight">{s.time}</p>
              </div>
              <p className={cn("text-[10px] font-black uppercase tracking-widest", isDarkMode ? "text-slate-500" : "text-slate-400")}>Live Session</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function AcademicSupport({ user, isDarkMode }: { user: UserData, isDarkMode?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tighter">Academic Support</h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Access tutoring, writing labs, and learning resources.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: "Peer Tutoring", icon: <Users />, desc: "Get help from top-performing students in your subjects." },
          { title: "Writing Center", icon: <FileText />, desc: "Improve your essays and research papers with expert feedback." },
          { title: "Learning Workshops", icon: <Library />, desc: "Join sessions on study skills, time management, and more." },
          { title: "Library Resources", icon: <BookOpen />, desc: "Access digital databases, journals, and physical collections." }
        ].map((item, i) => (
          <div key={i} className={cn(
            "p-8 rounded-[2.5rem] border transition-all hover:scale-[1.02]",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-red-600/20">
              {React.cloneElement(item.icon as React.ReactElement, { className: "w-6 h-6" })}
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-2">{item.title}</h3>
            <p className={cn("text-sm leading-relaxed", isDarkMode ? "text-slate-400" : "text-slate-500")}>{item.desc}</p>
            <button className="mt-6 text-xs font-black uppercase tracking-widest text-red-600 hover:text-red-500 transition-colors">
              Learn More →
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function Payments({ user, setUser, isDarkMode, setConfirmConfig, courses, fetchUsers, fetchTransactions, transactions = [], logActivity }: { user: UserData, setUser: (u: UserData) => void, isDarkMode?: boolean, setConfirmConfig: any, courses: any[], fetchUsers: () => void, fetchTransactions: () => void, transactions?: any[], logActivity: any }) {
  const isAdmin = user.role === 'admin';
  const [selectedMethod, setSelectedMethod] = useState<'gcash' | 'atm' | null>(null);
  const [showStatement, setShowStatement] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isProcessingDelay, setIsProcessingDelay] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [showGCashQR, setShowGCashQR] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(8);

  const enrolledCourses = (courses || []).filter(c => (user.schedule || []).some((s: any) => s.subject === c.id));
  const totalFees = enrolledCourses.reduce((sum, c) => sum + (Number(c.price) || 0), 0);

  const [selectedSemId, setSelectedSemId] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    if (showGCashQR && qrCountdown > 0) {
      timer = setInterval(() => {
        setQrCountdown(prev => prev - 1);
      }, 1000);
    } else if (showGCashQR && qrCountdown === 0) {
      setShowGCashQR(false);
    }
    return () => clearInterval(timer);
  }, [showGCashQR, qrCountdown]);

  const semestralBreakdown = [
    { id: 'SEM-1-2425', name: '1st Semester 2024-2025', total: totalFees, outstanding: user.balance || 0 },
    { id: 'SEM-2-2425', name: '2nd Semester 2024-2025', total: 0, outstanding: 0 }
  ];

  const handlePaySemester = (sem: any) => {
    setSelectedSemId(sem.id);
    setPaymentAmount(sem.outstanding.toString());
  };

  const processTransaction = async () => {
    setIsPaying(true);
    try {
      const amountToPay = parseFloat(paymentAmount);
      const prevBal = user.balance || 0;
      const newBalance = Math.max(0, prevBal - amountToPay);
      
      const { error: userError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (userError) throw userError;

      // Optimistic locally
      setUser({ ...user, balance: newBalance });
      localStorage.setItem('aid_portal_user', JSON.stringify({ ...user, balance: newBalance }));

      const { error: transError } = await supabase
        .from('transactions')
        .insert({
          userId: user.id,
          userName: `${user.name} ${user.surname}`,
          amount: amountToPay,
          type: 'Tuition Payment',
          method: selectedMethod?.toUpperCase(),
          status: 'Successful',
          timestamp: new Date().toISOString(),
          prevBalance: prevBal,
          updatedBalance: newBalance,
          details: selectedMethod === 'gcash' 
            ? `Online payment via GCash QR ${selectedSemId ? `(${selectedSemId})` : ''}` 
            : `ATM Card Payment (Card: ****${cardNumber.slice(-4)})${selectedSemId ? ` for ${selectedSemId}` : ''}`
        });

      if (transError) throw transError;

      logActivity('PAYMENT', `Payment of ₱${amountToPay.toLocaleString()} processed via ${selectedMethod?.toUpperCase()}`, 'Successful');

      setPaymentAmount('');
      setCardNumber('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      fetchUsers(); 
      fetchTransactions();
    } catch (err: any) {
      alert('Payment failed: ' + err.message);
    } finally {
      setIsPaying(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid amount and select a payment method.');
      return;
    }

    if (user.balance <= 0) {
      alert('You do not have an outstanding payable balance.');
      return;
    }

    const amountToPay = parseFloat(paymentAmount);
    if (amountToPay > user.balance) {
      alert(`Payment amount exceeds your current balance of ₱${user.balance.toLocaleString()}.`);
      return;
    }
    
    if (selectedMethod === 'atm' && (!cardNumber || cardNumber.length < 16)) {
      alert('Please enter a valid 16-digit card number.');
      return;
    }

    setIsProcessingDelay(true);

    // Simulation delay requested by user (5 seconds)
    setTimeout(async () => {
      if (selectedMethod === 'gcash') {
        processTransaction(); // Execute transcription in background
        setQrCountdown(10); 
        setShowGCashQR(true);
      } else {
        await processTransaction();
      }
      setIsProcessingDelay(false);
    }, 5000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 pb-20 pt-4">
      <header>
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg">Financial Portal</span>
        </div>
        <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
          Balance & <span className="text-red-600 font-sans italic underline decoration-red-600/30 underline-offset-8">Disbursements</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium font-sans">Manage your tuition architecture, digital receipts, and funding disbursements.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-10">
        <div className={cn(
          "p-10 rounded-[3rem] border transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black tracking-tight">Outstanding Semestral Fees</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Academic Year 2024-2025</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {semestralBreakdown.map((sem, i) => (
              <div key={i} className={cn(
                "p-6 rounded-3xl border flex flex-col justify-between transition-all",
                isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
              )}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Semester</p>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                      sem.outstanding > 0 ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                    )}>
                      {sem.outstanding > 0 ? 'Outstanding' : 'Cleared'}
                    </span>
                  </div>
                  <h4 className="font-black text-lg mb-1">{sem.name}</h4>
                  <p className="text-xs text-slate-500 font-medium mb-4">Total Fee: ₱{sem.total.toLocaleString()}</p>
                </div>
                <div className="flex items-end justify-between border-t border-slate-200 dark:border-white/5 pt-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Balance</p>
                    <p className={cn("text-2xl font-black tracking-tighter", sem.outstanding > 0 ? "text-red-600" : "text-emerald-500")}>
                      ₱{sem.outstanding.toLocaleString()}
                    </p>
                  </div>
                  {sem.outstanding > 0 && (
                    <button 
                      onClick={() => handlePaySemester(sem)}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={cn(
          "lg:col-span-2 p-12 rounded-[3rem] border relative overflow-hidden flex flex-col justify-between group",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
               <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-mono">Real-time Outstanding Liability</p>
            </div>
            <h2 className="text-7xl font-black tracking-tighter mb-6 text-slate-900 dark:text-white">₱{user.balance?.toLocaleString() || '0'}</h2>
            
            <div className="space-y-6 max-w-sm mb-10">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Input Payment Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₱</span>
                  <input 
                    type="number" 
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className={cn(
                      "w-full pl-10 pr-4 py-4 rounded-2xl border font-black text-xl outline-none focus:ring-2 focus:ring-red-600 transition-all",
                      isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200"
                    )}
                  />
                </div>
              </div>

              {selectedMethod === 'atm' && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">ATM Card Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      type="text" 
                      maxLength={16}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="**** **** **** ****"
                      className={cn(
                        "w-full pl-12 pr-4 py-4 rounded-2xl border font-mono font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all",
                        isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200"
                      )}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handlePayment}
                disabled={!selectedMethod || isPaying || isProcessingDelay || !paymentAmount}
                className="px-10 py-5 bg-red-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-red-600/30 hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isProcessingDelay ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    SECURING CONNECTION...
                  </>
                ) : isPaying ? (
                  'PROCESSING...'
                ) : (
                  `AUTHENTICATE VIA ${selectedMethod ? selectedMethod.toUpperCase() : 'SELECT METHOD'}`
                )}
              </button>
              <button 
                onClick={() => setShowStatement(true)}
                className={cn(
                  "px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all border hover:scale-[1.03] active:scale-95",
                  isDarkMode ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-slate-50 border-slate-200 hover:bg-slate-100 shadow-sm"
                )}
              >
                GENERATE AUDIT STATEMENT
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none" />
        </div>
        <div className={cn(
          "p-10 rounded-[3rem] border",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-xl font-black tracking-tight mb-6">Select Payment Method</h3>
          <div className="space-y-4">
            <button 
              onClick={() => setSelectedMethod('gcash')}
              className={cn(
                "w-full p-4 rounded-2xl border flex items-center gap-4 transition-all",
                selectedMethod === 'gcash' ? "border-red-600 bg-red-600/5" : (isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")
              )}
            >
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-black">
                G
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">GCash</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">Online Payment</p>
              </div>
            </button>
            
            <button 
              onClick={() => setSelectedMethod('atm')}
              className={cn(
                "w-full p-4 rounded-2xl border flex items-center gap-4 transition-all",
                selectedMethod === 'atm' ? "border-red-600 bg-red-600/5" : (isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")
              )}
            >
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">ATM Card</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">Debit/Credit Card</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full px-4"
          >
            <div className="bg-emerald-600 text-white p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-emerald-500">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black uppercase tracking-widest text-[10px] opacity-80">Transaction Successful</p>
                <p className="font-bold text-sm">Your payment has been processed and applied to your balance.</p>
              </div>
              <button onClick={() => setShowSuccess(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {showGCashQR && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "relative p-12 rounded-[3.5rem] shadow-2xl text-center max-w-sm w-full overflow-hidden",
                isDarkMode ? "bg-[#111111] border border-white/10" : "bg-white"
              )}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-slate-100 dark:bg-white/5">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 8, ease: 'linear' }}
                  className="h-full bg-red-600"
                />
              </div>

              <div className="mb-8 mt-4 flex justify-center">
                <div className="p-4 bg-white rounded-3xl shadow-xl">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                    alt="GCash Simulation QR"
                    referrerPolicy="no-referrer"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>
              
              <h3 className="text-2xl font-black mb-2 tracking-tight">Simulated GCash QR</h3>
              <p className="text-slate-500 font-bold mb-8 italic">Scan for educational simulation payment of ₱{parseFloat(paymentAmount).toLocaleString()}</p>
              
              <div className="flex items-center justify-center gap-2 text-red-600 font-black">
                <Clock className="w-5 h-5 animate-pulse" />
                <span className="tracking-widest uppercase text-xs">Processing in {qrCountdown}s</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStatement && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowStatement(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl overflow-hidden",
                isDarkMode ? "bg-[#111111] border border-white/5" : "bg-white border border-slate-200"
              )}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter">Statement of Account</h2>
                  <p className={cn("text-sm font-bold", isDarkMode ? "text-slate-500" : "text-slate-400")}>Detailed breakdown per semester</p>
                </div>
                <button onClick={() => setShowStatement(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {semestralBreakdown.map((sem, i) => (
                  <div key={i} className={cn(
                    "p-6 rounded-3xl border flex items-center justify-between transition-all",
                    isDarkMode ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                  )}>
                    <div>
                      <p className="font-black text-lg tracking-tight">{sem.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Tuition & Fees</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black tracking-tighter">₱{sem.total.toLocaleString()}</p>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                        sem.outstanding === 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {sem.outstanding === 0 ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className={cn(
                "mt-8 p-6 rounded-3xl border-t-4 border-red-600 flex items-center justify-between",
                isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
              )}>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Outstanding</p>
                  <p className="text-sm font-bold italic">As of March 2026</p>
                </div>
                <p className="text-4xl font-black tracking-tighter text-red-600">₱{user.balance?.toLocaleString()}</p>
              </div>

              <button 
                onClick={() => window.print()}
                className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF Statement
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div id="transactions-dashboard" className={cn(
        "p-10 rounded-[3rem] border transition-all",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
      )}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
            <Receipt className="w-6 h-6 text-red-600" />
            Transactions History Hub
          </h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Financial Logs</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {transactions.length > 0 ? transactions.map((t, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold">{new Date(t.timestamp || t.date).toLocaleDateString()}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black">{new Date(t.timestamp || t.date).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold">{t.details || t.type}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{t.method}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      t.type.includes('Payment') ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    )}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className={cn(
                      "text-lg font-black tracking-tighter",
                      t.type.includes('Payment') ? "text-emerald-500" : "text-red-500"
                    )}>
                      {t.type.includes('Payment') ? '-' : '+'}₱{t.amount?.toLocaleString()}
                    </p>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold italic">No transaction history found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function Mentorship({ user, isDarkMode, mentors, users, fetchMentors, fetchUsers, fetchNotifications, activeModal, setActiveModal, setView, setSelectedChatUser, setConfirmConfig, setSelectedStudentForRec }: { user: UserData, isDarkMode?: boolean, mentors: any[], users: UserData[], fetchMentors: () => void, fetchUsers: () => void, fetchNotifications: () => void, activeModal?: string | null, setActiveModal?: (val: string | null) => void, setView?: (v: string) => void, setSelectedChatUser?: (u: UserData | null) => void, setConfirmConfig: any, setSelectedStudentForRec?: (id: string) => void }) {
  const isAdmin = user.role === 'admin';
  const isUserAMentor = mentors.some(m => m.id === user.id || m.name === user.name);
  const [activeTab, setActiveTab] = useState<'mentors' | 'counseling' | 'sessions' | 'mentees'>('mentors');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [showCounselingModal, setShowCounselingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
  const [counselingRequests, setCounselingRequests] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [mentorFeedback, setMentorFeedback] = useState<any[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBookingNewSession, setIsBookingNewSession] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [counselingForm, setCounselingForm] = useState({
    type: 'Academic',
    urgency: 'Normal',
    description: ''
  });

  useEffect(() => {
    fetchCounselingData();
    fetchMentorFeedback();
    if (user.role === 'faculty' || isUserAMentor) {
      setActiveTab('mentees');
    }
  }, [user.id, isUserAMentor]);

  const handleSendReply = async (requestId: string) => {
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);

    const { error } = await supabase
      .from('counseling_requests')
      .update({ 
        response: replyText.trim(),
        status: 'completed',
        respondedAt: new Date().toISOString()
      })
      .eq('id', requestId);

    if (!error) {
      alert('Response sent successfully.');
      setReplyText('');
      setActiveReplyId(null);
      fetchCounselingData();
    } else {
      alert('Error sending response: ' + error.message);
    }
    setIsSubmittingReply(false);
  };

  const fetchMentorFeedback = async () => {
    const { data, error } = await supabase
      .from('mentor_feedback')
      .select('*')
      .or(`student_id.eq.${user.id},mentor_id.eq.${user.id}`)
      .order('timestamp', { ascending: false });
    
    if (!error && data) setMentorFeedback(data);
  };

  const fetchCounselingData = async () => {
    // Fetch counseling requests for the user
    const { data: reqs, error: reqError } = await supabase
      .from('counseling_requests')
      .select('*')
      .or(`studentId.eq.${user.id},mentorId.eq.${user.id}`)
      .order('timestamp', { ascending: false });
    
    if (!reqError && reqs) setCounselingRequests(reqs);

    // Fetch sessions
    const { data: sess, error: sessError } = await supabase
      .from('mentorship_sessions')
      .select('*')
      .or(`studentId.eq.${user.id},mentorId.eq.${user.id}`)
      .order('date', { ascending: false });
    
    if (!sessError && sess) setSessions(sess);
  };

  const handleBookSession = async (mentor: any) => {
    if (!bookingDate || !bookingTime) {
      alert('Please select a date and time for your session.');
      return;
    }

    const sessionDateTime = new Date(`${bookingDate}T${bookingTime}`);
    
    const newSession = {
      id: crypto.randomUUID(),
      studentId: user.id,
      studentName: user.name,
      mentorId: mentor.id,
      mentorName: mentor.name,
      date: sessionDateTime.toISOString(),
      status: 'pending',
      type: 'Mentorship'
    };

    console.log('🚀 Booking new session:', newSession);

    // 1. Try to save to Database
    const { error: sessError } = await supabase.from('mentorship_sessions').insert(newSession);

    if (!sessError) {
      // Success path
      setSessions(prev => [newSession, ...prev]);
      
      await supabase.from('notifications').insert({
        userId: user.id,
        title: "Session Booked",
        message: `You have successfully booked a mentorship session with ${mentor.name}.`,
        type: 'success',
        read: false,
        timestamp: new Date().toISOString()
      });

      // Also notify mentor
      await supabase.from('notifications').insert({
        userId: mentor.id,
        title: "New Session Request",
        message: `${user.name} has booked a mentorship session with you.`,
        type: 'info',
        read: false,
        timestamp: new Date().toISOString()
      });
      
      alert(`Session booked with ${mentor.name}! You can now see it in your sessions list.`);
      fetchNotifications();
      fetchCounselingData();
      setActiveTab('sessions');
      setIsBookingNewSession(false);
    } else {
      console.error('❌ Database error booking session, falling back to Local Mode:', sessError);
      
      // 2. Fallback: Add to local state so the user sees it immediately in the table
      setSessions(prev => [newSession, ...prev]);
      
      alert(`Session Booked (Local Mode)! Your session with ${mentor.name} has been added to your table. \n\nNote: To save permanently, please ensure the "mentorship_sessions" table exists in Supabase.`);
      
      setActiveTab('sessions');
      setIsBookingNewSession(false);
    }
  };

  const handleRequestCounseling = async () => {
    if (!counselingForm.description.trim()) {
      alert('Please provide a description for your request.');
      return;
    }

    setIsSubmitting(true);

    const newRequest = {
      id: crypto.randomUUID(),
      studentId: user.id,
      studentName: user.name,
      type: counselingForm.type,
      urgency: counselingForm.urgency,
      description: counselingForm.description.trim(),
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    console.log('🚀 Submitting counseling request:', newRequest);

    try {
      // 1. Try to save to Database
      const { error } = await supabase.from('counseling_requests').insert(newRequest);

      if (!error) {
        alert('Success! Your counseling request has been submitted to the database.');
        setShowCounselingModal(false);
        setCounselingForm({ type: 'Academic', urgency: 'Normal', description: '' });
        fetchCounselingData();
      } else {
        throw error;
      }
    } catch (error: any) {
      console.error('❌ Database error, falling back to Local Mode:', error);
      
      // 2. Fallback: Add to local state so the user sees it immediately
      setCounselingRequests(prev => [newRequest, ...prev]);
      
      alert('Request Submitted! Your request has been added to the list. \n\n(Note: Saved locally as the database table is still being set up).');
      
      setShowCounselingModal(false);
      setCounselingForm({ type: 'Academic', urgency: 'Normal', description: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSessionStatus = async (sessionId: any, status: string, remarks?: string) => {
    // 1. Update local state immediately
    const updateLocal = (prev: any[]) => prev.map(s => s.id === sessionId ? { ...s, status, remarks: remarks || s.remarks } : s);
    
    if (String(sessionId).startsWith('demo-')) {
      const demoSess = demoSessions.find(s => s.id === sessionId);
      if (demoSess && !sessions.find(s => s.id === sessionId)) {
        setSessions(prev => [{ ...demoSess, status, remarks }, ...prev]);
      } else {
        setSessions(prev => updateLocal(prev));
      }
    } else {
      setSessions(prev => updateLocal(prev));
    }

    // 2. Update Database (only for real sessions)
    if (!String(sessionId).startsWith('demo-')) {
      const updatePayload: any = { status };
      if (remarks) updatePayload.remarks = remarks;

      const { error } = await supabase
        .from('mentorship_sessions')
        .update(updatePayload)
        .eq('id', sessionId);
      
      if (!error) {
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
          const notificationTitles: Record<string, string> = {
            'scheduled': 'Session Approved',
            'cancelled': 'Session Cancelled',
            'completed': 'Session Completed'
          };
          
          await supabase.from('notifications').insert({
            userId: session.studentId,
            title: notificationTitles[status] || 'Session Update',
            message: `Your session with ${session.mentorName} on ${new Date(session.date).toLocaleDateString()} has been ${status}. ${remarks ? `Notes: ${remarks}` : ''}`,
            type: 'mentorship',
            timestamp: new Date().toISOString()
          });
        }
        fetchCounselingData();
      }
    }
    
    if (status === 'cancelled') alert('Session declined/cancelled.');
    else if (status === 'completed') alert('Session marked as completed.');
    else if (status === 'scheduled') alert('Session approved!');
  };

  const handleUpdateCounselingStatus = async (requestId: any, status: string) => {
    // Update local state
    setCounselingRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));

    // Update database
    if (!String(requestId).startsWith('demo-')) {
      const { error } = await supabase
        .from('counseling_requests')
        .update({ status })
        .eq('id', requestId);
      
      if (!error) {
        const req = counselingRequests.find(r => r.id === requestId);
        if (req) {
          await supabase.from('notifications').insert({
            userId: req.studentId,
            title: `Counseling Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `Your ${req.type} counseling request has been ${status}.`,
            type: 'mentorship',
            timestamp: new Date().toISOString()
          });
        }
        fetchCounselingData();
      }
    }
    alert(`Counseling request ${status} successfully.`);
  };

  const seedSampleSessions = () => {
    console.log('🎯 Demo Mode Button Clicked!');
    setIsDemoMode(true);
    // Force a small delay to show it's "working"
    setTimeout(() => {
      alert('Demo Mode Activated! I have automatically generated 2 perfect session examples for you to see.');
    }, 100);
  };

  // Mock data for Demo Mode
  const demoMentors = [
    {
      id: 'demo-mentor-1',
      name: 'Mr. Cidric Sanchez',
      role: 'Senior Mentor',
      specialty: 'Physical Education',
      bio: 'Make it yourself proud. Just going to the flow.',
      availability: 'Mon-Fri, 9AM-5PM'
    }
  ];

  const demoSessions = [
    {
      id: 'demo-1',
      studentName: user.name,
      mentorName: 'Mr. Cidric Sanchez',
      date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      status: 'pending',
      type: 'Mentorship'
    },
    {
      id: 'demo-2',
      studentName: user.name,
      mentorName: 'Mr. Cidric Sanchez',
      date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      status: 'completed',
      type: 'Academic'
    }
  ];

  const demoCounselingRequests = [
    {
      id: 'demo-req-1',
      type: 'Academic',
      urgency: 'Normal',
      status: 'pending',
      timestamp: new Date().toISOString(),
      description: 'I need help with my physical education requirements.'
    },
    {
      id: 'demo-req-2',
      type: 'Mental Health',
      urgency: 'High',
      status: 'completed',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      description: 'Feeling overwhelmed with the current semester load.'
    }
  ];

  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean, studentId: string, studentName: string }>({ isOpen: false, studentId: '', studentName: '' });
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handlePostFeedback = async () => {
    if (!feedbackText.trim()) return;
    setIsSubmittingFeedback(true);
    
    // Insert into dedicated feedback table instead of audit logs for better tracking
    const { error } = await supabase.from('mentor_feedback').insert({
      student_id: feedbackModal.studentId,
      mentor_id: user.id,
      content: feedbackText.trim(),
      is_visible_to_student: true,
      timestamp: new Date().toISOString()
    });

    if (!error) {
      alert('Feedback successfully delivered to student.');
      setFeedbackModal({ isOpen: false, studentId: '', studentName: '' });
      setFeedbackText('');
      fetchMentorFeedback();
      
      // Notify student
      await supabase.from('notifications').insert({
        userId: feedbackModal.studentId,
        title: 'New Mentor Feedback',
        message: `${user.name} has posted new feedback on your mentorship profile.`,
        type: 'mentorship',
        timestamp: new Date().toISOString()
      });
    } else {
      alert('Error posting feedback: ' + error.message);
    }
    setIsSubmittingFeedback(false);
  };

  const messageOSLO = () => {
    if (setView && setSelectedChatUser) {
      const osloAdmin = users.find(u => u.role === 'admin' || u.name.toLowerCase().includes('oslo')) || { id: 'ADMIN', name: 'OSLO (Direct Support)', role: 'admin' } as UserData;
      setSelectedChatUser(osloAdmin);
      setView('messages');
    }
  };

  const handleDeleteMentor = async (mentorId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Mentor Profile',
      message: 'Are you sure you want to remove this professional mentor profile? This will not delete the user account, only their status as a mentor.',
      type: 'danger',
      onConfirm: async () => {
        setConfirmConfig(p => ({ ...p, isOpen: false }));
        const { error } = await supabase.from('mentors').delete().eq('id', mentorId);
        if (!error) {
          alert('Mentor profile removed.');
          fetchMentors();
        } else {
          alert('Error: ' + error.message);
        }
      }
    });
  };

  const [activeSessionForNotes, setActiveSessionForNotes] = useState<any>(null);
  const [sessionNotes, setSessionNotes] = useState('');

  const handleCompleteWithNotes = async () => {
    if (!activeSessionForNotes) return;
    await handleUpdateSessionStatus(activeSessionForNotes.id, 'completed', sessionNotes);
    setActiveSessionForNotes(null);
    setSessionNotes('');
  };

  // Automatically use demo data if real data is missing, and merge them for a fuller view
  const displayMentors = mentors.length > 0 ? mentors : demoMentors;

  // Filter sessions and counseling based on role and assignments
  const mentorSessions = [
    ...sessions, 
    ...demoSessions.filter(ds => !sessions.find(s => s.id === ds.id))
  ].filter(s => {
    if (user.role === 'faculty' || isUserAMentor) {
      return s.mentorId === user.id;
    }
    if (user.role === 'student') {
      return s.studentId === user.id;
    }
    return true; // Admin/Staff see all
  });

  const displaySessions = mentorSessions.slice(0, Math.max(mentorSessions.length, 3));
  
  const displayCounselingRequests = [
    ...counselingRequests, 
    ...demoCounselingRequests.filter(dr => !counselingRequests.find(r => r.id === dr.id))
  ].filter(req => {
    if (user.role === 'faculty' || isUserAMentor) {
      // Show counseling requests from their mentees or assigned students
      const mentees = users.filter(u => u.mentorId === user.id).map(u => u.id);
      return mentees.includes(req.studentId || 'demo-req');
    }
    if (user.role === 'student') {
      return req.studentId === user.id || req.id.startsWith('demo-');
    }
    return true;
  }).slice(0, Math.max(counselingRequests.length, 3));

  const handleSelectMentor = async (mentorId: string) => {
    const mentor = displayMentors.find(m => m.id === mentorId);
    setConfirmConfig({
      isOpen: true,
      title: 'Confirm Mental Selection',
      message: `Are you sure you want to select ${mentor?.name || 'this mentor'} as your assigned mentor? This will be sent for administrator approval.`,
      type: 'warning',
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        setIsSelecting(true);
        const { error } = await supabase
          .from('users')
          .update({ mentorId })
          .eq('id', user.id);
        
        if (!error) {
          fetchUsers();
          // Create a notification for the admin (simulated by adding to notifications table for admin)
          await supabase.from('notifications').insert({
            userId: 'ADMIN',
            title: 'Mentor Selection',
            message: `${user.name} has selected ${mentor?.name} as their mentor.`,
            type: 'mentorship',
            timestamp: new Date().toISOString()
          });
          alert('Mentor selected successfully! Waiting for administrator approval.');
        } else {
          alert('Error selecting mentor: ' + error.message);
        }
        setIsSelecting(false);
      }
    });
  };

  const [newMentor, setNewMentor] = useState({ name: '', role: '', specialty: '', bio: '', availabilityStart: '09:00', availabilityEnd: '17:00' });
  const [isAddingMentor, setIsAddingMentor] = useState(false);

  const handleAddMentor = async () => {
    if (!newMentor.role || !newMentor.specialty || !newMentor.name) {
      alert('Please fill in all required fields (Faculty Member, Role, and Specialty).');
      return;
    }

    const facultyUser = users.find(u => `${u.name} ${u.surname}` === newMentor.name);
    if (!facultyUser) {
      alert('Please select a valid Faculty Member.');
      return;
    }

    setIsAddingMentor(true);
    try {
      const mentorToInsert = {
        id: facultyUser.id,
        name: `${facultyUser.name} ${facultyUser.surname}`,
        role: newMentor.role.trim(),
        specialty: newMentor.specialty.trim(),
        bio: newMentor.bio.trim(),
        availability: `${newMentor.availabilityStart} - ${newMentor.availabilityEnd}`
      };

      console.log('🚀 Attempting to add mentor to database:', mentorToInsert);

      const { data, error } = await supabase
        .from('mentors')
        .insert([mentorToInsert])
        .select();
      
      if (error) {
        console.error('❌ Supabase error adding mentor:', error);
        alert(`Database Error: ${error.message}\nCode: ${error.code}`);
        throw error;
      }

      console.log('✅ Mentor added successfully:', data);
      
      // Refresh the list immediately
      await fetchMentors();
      
      // Close modal and reset form
      setShowAddModal(false);
      setNewMentor({ name: '', role: '', specialty: '', bio: '', availabilityStart: '09:00', availabilityEnd: '17:00' });
      
      alert('Success! The new mentor has been added to the system.');
    } catch (err: any) {
      console.error('💥 Critical error in handleAddMentor:', err);
      if (!err.message?.includes('Database Error')) {
        alert('System Error: ' + (err.message || 'An unexpected error occurred. Please try again.'));
      }
    } finally {
      setIsAddingMentor(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter mb-2">Mentorship & Counseling</h1>
          <p className={cn("text-lg font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>
            Professional guidance and emotional support for your academic journey.
          </p>
        </div>
        <div className="flex gap-3">
          {user.role === 'admin' && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Mentor
            </button>
          )}
          {user.role === 'student' && (
            <button 
              onClick={() => setShowCounselingModal(true)}
              className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-600/20 hover:bg-red-500 transition-all flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Request Counseling
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-white/5 rounded-[2rem] w-fit">
        <button 
          onClick={() => setActiveTab('mentors')}
          className={cn(
            "px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all",
            activeTab === 'mentors' ? "bg-white dark:bg-white/10 shadow-sm" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Mentors
        </button>
        <button 
          onClick={() => setActiveTab('counseling')}
          className={cn(
            "px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all",
            activeTab === 'counseling' ? "bg-white dark:bg-white/10 shadow-sm" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Counseling Module
        </button>
        {user.role === 'student' && (
          <button 
            onClick={() => setActiveTab('sessions')}
            className={cn(
              "px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all",
              activeTab === 'sessions' ? "bg-white dark:bg-white/10 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            My Bookings
          </button>
        )}
        {(user.role === 'faculty' || user.role === 'admin') && (
          <button 
            onClick={() => {
              setActiveTab('sessions');
              setIsBookingNewSession(false);
            }}
            className={cn(
              "px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all",
              activeTab === 'sessions' ? "bg-white dark:bg-white/10 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            My Sessions
          </button>
        )}
        {(user.role === 'admin' || user.role === 'faculty' || isUserAMentor) && (
          <button 
            onClick={() => setActiveTab('mentees')}
            className={cn(
              "px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all",
              activeTab === 'mentees' ? "bg-white dark:bg-white/10 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Mentee List
          </button>
        )}
        {user.role === 'admin' && (
          <button 
            onClick={() => setActiveTab('assignments')}
            className={cn(
              "px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all",
              activeTab === 'assignments' ? "bg-white dark:bg-white/10 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Assignments
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'mentees' && (
          <motion.div 
            key="mentees"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className={cn(
              "p-10 rounded-[3rem] border overflow-hidden",
              isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
            )}>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black tracking-tighter">
                  {user.role === 'admin' ? 'Global Mentee List' : 'My Mentees'}
                </h3>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Total Mentees: {user.role === 'admin' ? users.filter(u => u.mentorId).length : users.filter(u => u.mentorId === user.id).length}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/5">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Info</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Program/Year</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Mentor</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {(user.role === 'admin' ? users.filter(u => u.mentorId) : users.filter(u => u.mentorId === user.id)).length > 0 ? (
                      (user.role === 'admin' ? users.filter(u => u.mentorId) : users.filter(u => u.mentorId === user.id)).map((mentee) => (
                        <tr key={mentee.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-red-600/10 flex items-center justify-center text-red-600 font-black text-xl">
                                {mentee.name[0]}
                              </div>
                              <div>
                                <p className="font-black text-sm">{mentee.name} {mentee.surname}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{mentee.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <p className="font-bold text-xs">{mentee.course || 'N/A'}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{mentee.yearLevel || 'N/A'}</p>
                          </td>
                          <td className="px-6 py-6">
                            <span className="font-bold text-xs text-slate-600 dark:text-slate-400">
                              {user.role === 'admin' 
                                ? (mentors.find(m => m.id === mentee.mentorId)?.name || 'Assigned')
                                : 'You'
                              }
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center justify-end gap-2 text-right">
                              <button 
                                onClick={() => {
                                  if (setView && setSelectedChatUser) {
                                    setSelectedChatUser(mentee);
                                    setView('messages');
                                  }
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all"
                              >
                                Message
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-slate-400 italic">No mentees found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'mentors' && (
          <motion.div 
            key="mentors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-10"
          >
            {user.role === 'student' && user.mentorId && (
              <>
                <div className={cn(
                  "p-10 rounded-[3rem] border-2 border-red-600/20 bg-red-600/[0.02]",
                  isDarkMode ? "bg-red-900/10" : "bg-red-50"
                )}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-red-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-red-600/20">
                      {(mentors.find(m => m.id === user.mentorId)?.name || 'M')[0]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight mb-1">My Assigned Mentor</h3>
                      <p className="text-sm font-bold text-red-600 uppercase tracking-widest">{mentors.find(m => m.id === user.mentorId)?.name || 'Loading...'}</p>
                      <button 
                        onClick={() => setActiveTab('sessions')}
                        className="mt-3 text-xs font-black text-slate-400 hover:text-red-600 uppercase tracking-widest flex items-center gap-2 transition-colors"
                      >
                        <Calendar className="w-3 h-3" />
                        Next Meeting: {displaySessions.find(s => s.status === 'scheduled')?.date ? new Date(displaySessions.find(s => s.status === 'scheduled')!.date).toLocaleDateString() : 'None scheduled'}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button 
                       onClick={() => {
                         const mentor = mentors.find(m => m.id === user.mentorId);
                         if (mentor) {
                           setSelectedMentor(mentor);
                           setIsBookingNewSession(true);
                           setActiveTab('sessions');
                         }
                       }}
                       className="flex-1 md:flex-none px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all"
                    >
                      Book Session
                    </button>
                    <button 
                       onClick={() => setView?.('messages')}
                       className="flex-1 md:flex-none px-8 py-4 bg-white dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all"
                    >
                      Private Message
                    </button>
                  </div>
                </div>
              </div>

              {/* Feedback Section for Student */}
                {mentorFeedback.length > 0 && (
                  <div className="mt-10 pt-10 border-t border-red-600/10">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 font-mono">Performance Feedback from Mentor</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mentorFeedback.filter(f => f.student_id === user.id).slice(0, 2).map((feed, idx) => (
                        <div key={idx} className={cn(
                          "p-6 rounded-3xl border transition-all",
                          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200"
                        )}>
                          <div className="flex justify-between items-start mb-4">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded-lg">Performance Report</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(feed.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm font-medium leading-relaxed italic text-slate-600 dark:text-slate-400">"{feed.content}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayMentors.map((mentor, i) => (
              <div key={i} className={cn(
                "group p-8 rounded-[3rem] border transition-all hover:scale-[1.02] flex flex-col",
                isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
              )}>
                <div className="flex items-start justify-between mb-8">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-red-600/10 flex items-center justify-center text-red-600 font-black text-3xl shadow-inner overflow-hidden">
                    {mentor.name[0]}
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Award key={star} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
                
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-3xl font-black tracking-tight">{mentor.name}</h3>
                      {isAdmin && (
                        <button 
                          onClick={() => handleDeleteMentor(mentor.id)}
                          className="p-2 hover:bg-red-100 rounded-full text-red-600 transition-colors"
                          title="Delete Mentor Profile"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm font-bold text-red-600 mb-6 uppercase tracking-widest">{mentor.role}</p>
                  
                  <div className="space-y-4 mb-6">
                    <div className={cn("p-4 rounded-2xl", isDarkMode ? "bg-white/5" : "bg-slate-50")}>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Specialty</p>
                      <p className="text-sm font-bold">{mentor.specialty}</p>
                    </div>
                  </div>

                  <p className={cn("text-sm font-medium mb-6 leading-relaxed", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                    {mentor.bio || "No bio provided."}
                  </p>

                  <div className="flex items-center gap-2 mb-8 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <p className="text-sm font-bold">{mentor.availability || 'Mon-Fri, 9AM-5PM'}</p>
                  </div>

                  <div className="space-y-3">
                  <button 
                    onClick={() => setSelectedMentor(mentor)}
                    className={cn(
                      "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all",
                      isDarkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg"
                    )}
                  >
                    View Profile
                  </button>
                  {user.role === 'student' && (
                    <button 
                      disabled={user.mentorId === mentor.id || isSelecting}
                      onClick={() => handleSelectMentor(mentor.id)}
                      className={cn(
                        "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all",
                        user.mentorId === mentor.id 
                          ? "bg-emerald-500/10 text-emerald-500 cursor-default" 
                          : "bg-red-600 text-white shadow-xl shadow-red-600/20 hover:bg-red-500"
                      )}
                    >
                      {user.mentorId === mentor.id ? (
                        <span className="flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> Your Mentor</span>
                      ) : isSelecting ? 'Selecting...' : 'Select as Mentor'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
        )}

        {activeTab === 'counseling' && (
          <motion.div 
            key="counseling"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className={cn(
              "lg:col-span-1 p-10 rounded-[3rem] border h-fit",
              isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
            )}>
              <div className="w-16 h-16 rounded-2xl bg-red-600/10 flex items-center justify-center text-red-600 mb-8">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black tracking-tight mb-4">Confidential Counseling</h3>
              <p className={cn("font-medium mb-8 leading-relaxed", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                Our professional mentors provide safe space for academic stress and personal challenges.
              </p>
              <ul className="space-y-4 mb-10">
                {["Direct Inquiries", "Academic Pressure", "Career Advice", "Performance Help"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-bold text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              {user.role === 'student' && (
                <button 
                  onClick={() => setShowCounselingModal(true)}
                  className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-red-600/20 hover:bg-red-500 transition-all"
                >
                  Send Inquiry
                </button>
              )}
            </div>

            <div className={cn(
              "lg:col-span-2 p-10 rounded-[3rem] border",
              isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
            )}>
              <h3 className="text-2xl font-black tracking-tight mb-8">Inquiry & Response Log</h3>
              <div className="space-y-6">
                {displayCounselingRequests.length > 0 ? displayCounselingRequests.map((req, i) => (
                  <div key={i} className={cn(
                    "p-8 rounded-[2.5rem] border flex flex-col gap-6",
                    isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100 shadow-sm"
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center",
                          req.urgency === 'High' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                        )}>
                          <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-xl">{req.studentName || 'Student'}'s {req.type} Inquiry</p>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{new Date(req.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        req.status === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/10" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/10"
                      )}>
                        {req.status}
                      </span>
                    </div>
                    
                    <div className="p-6 bg-white dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner">
                      <p className="text-sm font-medium italic text-slate-600 dark:text-slate-300">"{req.description}"</p>
                    </div>

                    {req.response ? (
                      <div className="pl-6 border-l-4 border-red-600/30 space-y-3">
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Mentor Response:</p>
                        <div className="p-6 bg-red-600/5 rounded-2xl border border-red-600/10">
                          <p className="text-sm font-bold text-slate-800 dark:text-red-100 leading-relaxed italic">"{req.response}"</p>
                        </div>
                      </div>
                    ) : (
                      (user.role === 'faculty' || isUserAMentor) && (
                        <div className="space-y-4">
                          {activeReplyId === req.id ? (
                            <div className="space-y-3">
                              <textarea 
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder="Type your professional response here..."
                                className={cn(
                                  "w-full p-4 rounded-xl border focus:ring-2 focus:ring-red-600 font-medium h-24 resize-none",
                                  isDarkMode ? "bg-white/5 border-white/5 text-white" : "bg-white border-slate-200 text-slate-900"
                                )}
                              />
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleSendReply(req.id)}
                                  disabled={isSubmittingReply || !replyText.trim()}
                                  className="px-6 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 disabled:opacity-50 transition-all"
                                >
                                  {isSubmittingReply ? 'Sending...' : 'Send Response'}
                                </button>
                                <button 
                                  onClick={() => { setActiveReplyId(null); setReplyText(''); }}
                                  className="px-6 py-2 bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setActiveReplyId(req.id)}
                              className="px-6 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all"
                            >
                              Write Response
                            </button>
                          )
                        }
                        </div>
                      )
                    )}
                  </div>
                )) : (
                  <div className="text-center py-20 text-slate-400 italic">No inquiries found in the counseling module.</div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'sessions' && (
          <motion.div 
            key="sessions"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Sessions', value: displaySessions.length, icon: <Calendar className="w-5 h-5" />, color: 'blue' },
                { label: 'Pending', value: displaySessions.filter(s => s.status === 'pending').length, icon: <Clock className="w-5 h-5" />, color: 'amber' },
                { label: 'Completed', value: displaySessions.filter(s => s.status === 'completed').length, icon: <CheckCircle className="w-5 h-5" />, color: 'emerald' },
                { label: 'Mentees', value: isUserAMentor ? [...new Set(displaySessions.map(s => s.studentId))].length : 1, icon: <Users className="w-5 h-5" />, color: 'red' }
              ].map((stat, i) => (
                <div key={i} className={cn(
                  "p-8 rounded-[2.5rem] border transition-all hover:shadow-md",
                  isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-100 shadow-sm"
                )}>
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
                    stat.color === 'blue' ? "bg-blue-50 text-blue-600" :
                    stat.color === 'amber' ? "bg-amber-50 text-amber-600" :
                    stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                    "bg-red-50 text-red-600"
                  )}>
                    {stat.icon}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
                  <p className="text-4xl font-black tracking-tighter">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className={cn(
              "p-10 rounded-[3rem] border",
              isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
            )}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h3 className="text-2xl font-black tracking-tight">
                  {isBookingNewSession ? 'Select a Mentor to Book' : 'Upcoming & Past Sessions'}
                </h3>
              <div className="flex items-center gap-4">
                {(user.role === 'faculty' || isUserAMentor) && (
                  <button 
                    onClick={messageOSLO}
                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Message OSLO
                  </button>
                )}
                {user.role === 'student' && !isUserAMentor && (
                  <button 
                    onClick={() => setIsBookingNewSession(!isBookingNewSession)}
                    className={cn(
                      "px-6 py-3 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center gap-2",
                      isBookingNewSession ? "bg-slate-800 hover:bg-slate-700" : "bg-red-600 shadow-red-600/20 hover:bg-red-500"
                    )}
                  >
                    {isBookingNewSession ? (
                      <>
                        <X className="w-3 h-3" />
                        Cancel Booking
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        Book New Session
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Feedback Modal */}
            {feedbackModal.isOpen && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cn("p-10 rounded-[3rem] max-w-lg w-full shadow-2xl", isDarkMode ? "bg-[#111111] text-white" : "bg-white")}>
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-3xl font-black tracking-tighter">Performance Feedback</h3>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Student: {feedbackModal.studentName}</p>
                    </div>
                    <button onClick={() => setFeedbackModal({ isOpen: false, studentId: '', studentName: '' })} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Performance Assessment</label>
                      <textarea 
                        value={feedbackText}
                        onChange={e => setFeedbackText(e.target.value)}
                        className={cn("w-full p-4 rounded-2xl border font-bold h-32 resize-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100")}
                        placeholder="Detail the student's progress, strengths, and areas for improvement..."
                      />
                    </div>
                    <div className="p-6 bg-emerald-500/10 rounded-2xl flex gap-4 items-start border border-emerald-500/20">
                      <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
                      <p className="text-xs font-bold text-emerald-600 leading-relaxed">By posting, you are confirming this student's approved performance in your mentorship program.</p>
                    </div>
                    <button 
                      onClick={handlePostFeedback}
                      disabled={isSubmittingFeedback || !feedbackText.trim()}
                      className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black shadow-xl shadow-red-600/20 hover:bg-red-500 disabled:opacity-50 transition-all uppercase tracking-widest text-xs"
                    >
                      {isSubmittingFeedback ? 'Posting...' : 'Post & Approve Performance'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

              {isBookingNewSession ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayMentors.map((mentor, i) => (
                    <div key={i} className={cn(
                      "p-6 rounded-[2.5rem] border transition-all hover:scale-[1.02]",
                      isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
                    )}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-600/10 flex items-center justify-center text-red-600 font-black text-xl">
                          {mentor.name[0]}
                        </div>
                        <div>
                          <p className="font-black text-sm">{mentor.name}</p>
                          <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{mentor.specialty}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedMentor(mentor)}
                        className="w-full py-3 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-600/20 hover:bg-red-500 transition-all"
                      >
                        Book Now
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                  <thead>
                    <tr className="text-left border-bottom border-slate-100 dark:border-white/5">
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Time</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{isUserAMentor ? 'Student' : 'Mentor'}</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {displaySessions.map((sess, i) => (
                      <tr key={i} className="group">
                        <td className="py-6">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isDarkMode ? "bg-white/5" : "bg-slate-50")}>
                              <Calendar className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-black text-sm">{new Date(sess.date).toLocaleDateString()}</p>
                              <p className="text-[10px] font-bold text-slate-400">{new Date(sess.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black">
                              {(isUserAMentor ? sess.studentName : sess.mentorName)?.[0]}
                            </div>
                            <p className="font-bold text-sm">{isUserAMentor ? sess.studentName : sess.mentorName}</p>
                          </div>
                        </td>
                        <td className="py-6">
                          <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest", isDarkMode ? "bg-white/5" : "bg-slate-100")}>
                            {sess.type}
                          </span>
                        </td>
                        <td className="py-6">
                          <span className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest",
                            sess.status === 'scheduled' ? "bg-blue-500/10 text-blue-500" : 
                            sess.status === 'pending' ? (isDarkMode ? "bg-amber-500/10 text-amber-500" : "bg-amber-50 text-amber-600") : 
                            sess.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" : 
                            sess.status === 'cancelled' ? "bg-red-500/10 text-red-500" : "bg-slate-500/10 text-slate-500"
                          )}>
                            {sess.status}
                          </span>
                        </td>
                        <td className="py-6 text-right">
                          <div className="flex justify-end gap-3">
                            <button 
                              onClick={() => {
                                setConfirmConfig({
                                  isOpen: true,
                                  title: 'Session Summary',
                                  message: `Details of the session on ${new Date(sess.date).toLocaleDateString()}:\n\nStudent: ${sess.studentName}\nMentor: ${sess.mentorName}\nType: ${sess.type}\nStatus: ${sess.status}\n\nThis is a professional record of the mentorship interaction.`,
                                  type: 'info',
                                  onConfirm: () => setConfirmConfig(p => ({ ...p, isOpen: false }))
                                });
                              }}
                              className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                                isDarkMode ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-100 text-slate-400"
                              )}
                              title="View Summary"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            
                            {(user.role === 'faculty' || isUserAMentor) && sess.mentorId === user.id && (
                              <button 
                                onClick={() => setFeedbackModal({ isOpen: true, studentId: sess.studentId, studentName: sess.studentName })}
                                className={cn(
                                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                                  isDarkMode ? "hover:bg-emerald-500/10 text-emerald-500" : "hover:bg-emerald-50 text-emerald-600"
                                )}
                                title="Post Performance Feedback"
                              >
                                <Award className="w-5 h-5" />
                              </button>
                            )}

                            {/* Actions for Admin and Faculty */}
                            {(isAdmin || (isUserAMentor && sess.mentorId === user.id)) && (
                              <>
                                {sess.status === 'pending' && (
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleUpdateSessionStatus(sess.id, 'scheduled')}
                                      className={cn(
                                        "w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                                        isDarkMode ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white" : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                                      )}
                                      title="Approve Session"
                                    >
                                      <Check className="w-5 h-5" />
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateSessionStatus(sess.id, 'cancelled')}
                                      className={cn(
                                        "w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                                        isDarkMode ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" : "bg-red-50 text-red-500 hover:bg-red-600 hover:text-white"
                                      )}
                                      title="Reject Session"
                                    >
                                      <X className="w-5 h-5" />
                                    </button>
                                  </div>
                                )}

                                {sess.status === 'scheduled' && (
                                  <button 
                                    onClick={() => setActiveSessionForNotes(sess)}
                                    className={cn(
                                      "w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                                      isDarkMode ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                                    )}
                                    title="Mark as Completed"
                                  >
                                    <Check className="w-5 h-5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'assignments' && user.role === 'admin' && (
          <motion.div 
            key="assignments"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className={cn(
              "p-10 rounded-[3rem] border",
              isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
            )}>
              <div className="mb-8 text-center md:text-left">
                <h3 className="text-3xl font-black tracking-tight">Mentorship Assignments</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Connect students with relevant professionals</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-100 dark:border-white/5">
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Identity</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Academic Context</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Current Mentor Status</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Assign Authority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {users.filter(u => u.role === 'student').map((student, i) => (
                      <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-6">
                          <p className="font-black text-sm">{student.name} {student.surname}</p>
                          <p className="text-[10px] font-mono text-slate-400 uppercase">ID: {student.id.slice(0, 8)}</p>
                        </td>
                        <td className="py-6">
                          <p className="text-xs font-black">{student.course || 'GENERAL'}</p>
                          <p className="text-[10px] font-bold text-slate-400">{student.yearLevel || '1st Year'}</p>
                        </td>
                        <td className="py-6">
                          <div className={cn(
                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all",
                            student.mentorId ? "bg-red-500/5 border-red-500/20 text-red-600" : "bg-slate-50 border-slate-200 text-slate-400"
                          )}>
                            <div className={cn("w-2 h-2 rounded-full", student.mentorId ? "bg-red-600" : "bg-slate-300")} />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              {mentors.find(m => m.id === student.mentorId)?.name || 'Unassigned'}
                            </span>
                          </div>
                        </td>
                        <td className="py-6 text-right">
                          <select 
                            value={student.mentorId || ''}
                            onChange={async (e) => {
                              const mentorId = e.target.value;
                              const { error } = await supabase.from('users').update({ mentorId }).eq('id', student.id);
                              if (!error) {
                                alert('Assignment confirmed successfully.');
                                fetchUsers();
                              }
                            }}
                            className={cn(
                              "p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border outline-none focus:ring-2 focus:ring-red-600 transition-all",
                              isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
                            )}
                          >
                            <option value="">None / Remove</option>
                            {mentors.map(m => (
                              <option key={m.id} value={m.id}>{m.name} ({m.specialty})</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeSessionForNotes && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cn("p-10 rounded-[3rem] max-w-lg w-full shadow-2xl border", isDarkMode ? "bg-[#111111] border-white/5 text-white" : "bg-white border-slate-200")}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-3xl font-black tracking-tighter">Complete Session</h3>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Session on {new Date(activeSessionForNotes.date).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setActiveSessionForNotes(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Session Notes / Remarks</label>
                <textarea 
                  value={sessionNotes}
                  onChange={e => setSessionNotes(e.target.value)}
                  className={cn("w-full p-6 rounded-3xl border font-medium h-40 resize-none outline-none focus:ring-2 focus:ring-red-600", isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200 shadow-inner")}
                  placeholder="Summarize the session outcomes and professional advice given..."
                />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setActiveSessionForNotes(null)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl font-black uppercase tracking-widest text-[10px]">Back</button>
                <button 
                  onClick={handleCompleteWithNotes}
                  disabled={!sessionNotes.trim()}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Save & Complete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modals */}
      {showCounselingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className={cn(
              "rounded-[3rem] p-10 max-w-lg w-full shadow-2xl border",
              isDarkMode ? "bg-[#111111] border-white/5 text-white" : "bg-white border-slate-200"
            )}
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-black tracking-tighter">Request Counseling</h3>
              <button 
                onClick={() => setShowCounselingModal(false)} 
                className={cn("p-2 rounded-full transition-colors", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-100")}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Session Type</label>
                  <select 
                    value={counselingForm.type}
                    onChange={e => setCounselingForm({...counselingForm, type: e.target.value})}
                    className={cn(
                      "w-full p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-bold",
                      isDarkMode ? "bg-white/5 text-white" : "bg-slate-50 text-slate-900"
                    )}
                  >
                    <option value="Academic">Academic</option>
                    <option value="Personal">Personal</option>
                    <option value="Career">Career</option>
                    <option value="Mental Health">Mental Health</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Urgency</label>
                  <select 
                    value={counselingForm.urgency}
                    onChange={e => setCounselingForm({...counselingForm, urgency: e.target.value})}
                    className={cn(
                      "w-full p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-bold",
                      isDarkMode ? "bg-white/5 text-white" : "bg-slate-50 text-slate-900"
                    )}
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High (Urgent)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">What's on your mind?</label>
                <textarea 
                  placeholder="Tell us briefly how we can help..." 
                  value={counselingForm.description}
                  onChange={e => setCounselingForm({...counselingForm, description: e.target.value})}
                  rows={4}
                  className={cn(
                    "w-full p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-medium resize-none",
                    isDarkMode ? "bg-white/5 text-white placeholder:text-slate-600" : "bg-slate-50 text-slate-900 placeholder:text-slate-400"
                  )}
                />
              </div>
              <div className={cn("p-4 rounded-2xl flex gap-4 items-start", isDarkMode ? "bg-blue-500/10" : "bg-blue-50")}>
                <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
                <p className={cn("text-xs font-medium leading-relaxed", isDarkMode ? "text-blue-400" : "text-blue-700")}>
                  Your privacy is our priority. This request will only be visible to our professional counseling staff.
                </p>
              </div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleRequestCounseling();
                }}
                disabled={isSubmitting}
                className={cn(
                  "w-full py-5 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl transition-all flex items-center justify-center gap-2",
                  isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-red-600 shadow-red-600/20 hover:bg-red-500 active:scale-95"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {selectedMentor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <button onClick={() => setSelectedMentor(null)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors z-10">
              <X className="w-6 h-6" />
            </button>

            <div className="relative z-10">
              <div className="flex items-center gap-8 mb-10">
                <div className="w-32 h-32 rounded-[3rem] bg-red-600/10 flex items-center justify-center text-red-600 font-black text-5xl shadow-inner overflow-hidden">
                  {selectedMentor.name[0]}
                </div>
                <div>
                  <h3 className="text-4xl font-black tracking-tighter mb-1">{selectedMentor.name}</h3>
                  <p className="text-lg font-bold text-red-600 uppercase tracking-widest mb-4">{selectedMentor.role}</p>
                  <div className="flex gap-2">
                    {['Academic', 'Career', 'Leadership'].map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">About Mentor</h4>
                    <p className="text-sm font-medium leading-relaxed text-slate-600">
                      {selectedMentor.bio || `${selectedMentor.name} is a dedicated professional with years of experience in ${selectedMentor.specialty}. They are passionate about helping students achieve their academic and personal goals.`}
                    </p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Schedule Session</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Date</label>
                        <input 
                          type="date" 
                          value={bookingDate}
                          onChange={e => setBookingDate(e.target.value)}
                          className="w-full p-3 bg-white rounded-xl border border-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Time</label>
                        <input 
                          type="time" 
                          value={bookingTime}
                          onChange={e => setBookingTime(e.target.value)}
                          className="w-full p-3 bg-white rounded-xl border border-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Specialty</h4>
                    <p className="text-sm font-bold">{selectedMentor.specialty}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Availability</h4>
                    <p className="text-sm font-bold">{selectedMentor.availability || 'Mon-Fri, 9AM-5PM'}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    if (setView && setSelectedChatUser) {
                      setSelectedChatUser(selectedMentor);
                      setView('messages');
                    }
                  }}
                  className="flex-1 py-5 bg-slate-100 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </button>
                <button 
                  onClick={() => {
                    handleBookSession(selectedMentor);
                    setSelectedMentor(null);
                  }}
                  className="flex-1 py-5 bg-red-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-red-600/20 hover:bg-red-500 transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Book Session
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white rounded-[3rem] p-10 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-3xl font-black tracking-tighter">Add New Mentor</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Create a professional profile</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Form Side */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Faculty Member</label>
                    <select 
                      value={newMentor.name}
                      onChange={e => {
                        const val = e.target.value;
                        const faculty = users.find(u => `${u.name} ${u.surname}` === val);
                        setNewMentor({
                          ...newMentor, 
                          name: val,
                          role: faculty?.role === 'faculty' ? 'Faculty Mentor' : newMentor.role
                        });
                      }}
                      className={cn(
                        "w-full p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-bold",
                        isDarkMode ? "bg-white/5 text-white" : "bg-slate-50 text-slate-900"
                      )}
                    >
                      <option value="">Select a Faculty Member</option>
                      {users.filter(u => u.role === 'faculty').map(u => (
                        <option key={u.id} value={`${u.name} ${u.surname}`}>{u.name} {u.surname}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Professional Role</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Senior Mentor" 
                      value={newMentor.role}
                      onChange={e => setNewMentor({...newMentor, role: e.target.value})}
                      className={cn(
                        "w-full p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-bold",
                        isDarkMode ? "bg-white/5 text-white" : "bg-slate-50 text-slate-900"
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Specialty</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Computer Science" 
                      value={newMentor.specialty}
                      onChange={e => setNewMentor({...newMentor, specialty: e.target.value})}
                      className={cn(
                        "w-full p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-bold",
                        isDarkMode ? "bg-white/5 text-white" : "bg-slate-50 text-slate-900"
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Short Bio / Motto</label>
                    <textarea 
                      placeholder="e.g. Just prove yourself if you want to succeed." 
                      value={newMentor.bio}
                      onChange={e => setNewMentor({...newMentor, bio: e.target.value})}
                      rows={3}
                      className={cn(
                        "w-full p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-medium resize-none",
                        isDarkMode ? "bg-white/5 text-white" : "bg-slate-50 text-slate-900"
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Start Time</label>
                      <input 
                        type="time" 
                        value={newMentor.availabilityStart}
                        onChange={e => setNewMentor({...newMentor, availabilityStart: e.target.value})}
                        className={cn(
                          "w-full p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-bold",
                          isDarkMode ? "bg-white/5 text-white" : "bg-slate-50 text-slate-900"
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">End Time</label>
                      <input 
                        type="time" 
                        value={newMentor.availabilityEnd}
                        onChange={e => setNewMentor({...newMentor, availabilityEnd: e.target.value})}
                        className={cn(
                          "w-full p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-bold",
                          isDarkMode ? "bg-white/5 text-white" : "bg-slate-50 text-slate-900"
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    disabled={isAddingMentor}
                    onClick={() => setShowAddModal(false)} 
                    className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={isAddingMentor}
                    onClick={handleAddMentor} 
                    className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-600/20 hover:bg-red-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAddingMentor ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : 'Add Mentor'}
                  </button>
                </div>
              </div>

              {/* Preview Side */}
              <div className="hidden lg:block">
                <div className="sticky top-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 text-center">Live Card Preview</p>
                  
                  <div className={cn(
                    "p-8 rounded-[3rem] border shadow-2xl scale-90 origin-top",
                    isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200"
                  )}>
                    <div className="flex items-start justify-between mb-8">
                      <div className="w-24 h-24 rounded-[2.5rem] bg-red-600/10 flex items-center justify-center text-red-600 font-black text-3xl shadow-inner overflow-hidden">
                        {newMentor.name ? newMentor.name[0] : '?'}
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Award key={star} className="w-4 h-4 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-3xl font-black tracking-tight mb-1">{newMentor.name || "Mentor Name"}</h3>
                      <p className="text-sm font-bold text-red-600 mb-6 uppercase tracking-widest">{newMentor.role || "Professional Role"}</p>
                      
                      <div className="space-y-4 mb-6">
                        <div className={cn("p-4 rounded-2xl", isDarkMode ? "bg-white/5" : "bg-slate-50")}>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Specialty</p>
                          <p className="text-sm font-bold">{newMentor.specialty || "Specialty Area"}</p>
                        </div>
                      </div>

                      <p className={cn("text-sm font-medium mb-6 leading-relaxed", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                        {newMentor.bio || "Your inspiring bio or motto will appear here..."}
                      </p>

                      <div className="flex items-center gap-2 mb-8 text-slate-400">
                        <Clock className="w-4 h-4" />
                        <p className="text-sm font-bold">{newMentor.availabilityStart && newMentor.availabilityEnd ? `${newMentor.availabilityStart} - ${newMentor.availabilityEnd}` : 'Mon-Fri, 9AM-5PM'}</p>
                      </div>

                      <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg cursor-default opacity-50">
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}


function Resources({ user, isDarkMode, resources, fetchResources, activeModal, setActiveModal }: { user: UserData, isDarkMode?: boolean, resources: any[], fetchResources: () => void, activeModal?: string | null, setActiveModal?: (val: string | null) => void }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (activeModal === 'resource') {
      setShowAddModal(true);
      if (setActiveModal) setActiveModal(null);
    }
  }, [activeModal]);
  const [newResource, setNewResource] = useState({ title: '', type: 'PDF', size: '' });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const extension = file.name.split('.').pop()?.toUpperCase() || 'PDF';
      setNewResource({
        title: file.name.split('.')[0],
        type: extension,
        size: `${sizeMB} MB`
      });
    }
  };

  const handleAddResource = async () => {
    setIsUploading(true);
    const { error } = await supabase.from('resources').insert(newResource);
    if (!error) {
      await fetchResources();
      setShowAddModal(false);
      setNewResource({ title: '', type: 'PDF', size: '' });
    }
    setIsUploading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Resource Library</h1>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Download guides, templates, and academic materials.</p>
        </div>
        {(user.role === 'admin' || user.role === 'faculty') && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-600/20 hover:bg-red-500 transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Resource
          </button>
        )}
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {resources.length > 0 ? resources.map((res, i) => (
          <div key={i} className={cn(
            "p-6 rounded-[2rem] border transition-all hover:scale-[1.02]",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", isDarkMode ? "bg-white/5" : "bg-slate-50")}>
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-black tracking-tight mb-1">{res.title}</h3>
            <div className="flex items-center justify-between mt-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{res.type} • {res.size}</span>
              <button 
                onClick={() => {
                  alert(`Starting download for: ${res.title}`);
                }}
                className="p-2 rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-500 transition-all"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center text-slate-400 font-bold italic">
            No resources available.
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#111111] rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-white/5">
            <h3 className="text-2xl font-black mb-6">Upload New Resource</h3>
            <div className="space-y-6">
              <div className="p-8 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2rem] text-center relative group hover:border-red-600/50 transition-all bg-slate-50 dark:bg-white/5">
                <input 
                  type="file" 
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-600/10 flex items-center justify-center text-red-600 transition-transform group-hover:scale-110">
                    <CloudUpload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Click to select a file</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Automatic detection of name and size</p>
                  </div>
                </div>
              </div>

              {newResource.title && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("p-4 rounded-2xl border", isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-100")}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Detected Details</p>
                  <p className="font-black text-sm line-clamp-1">{newResource.title}</p>
                  <p className="text-[10px] font-bold text-red-600 mt-1 uppercase tracking-widest">{newResource.type} • {newResource.size}</p>
                </motion.div>
              )}

              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl font-black text-slate-600 dark:text-slate-300">Cancel</button>
                <button 
                  onClick={handleAddResource} 
                  disabled={!newResource.title || isUploading}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-600/20 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload Now'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function Community({ user, isDarkMode, events, orgs, fetchCommunityData, activeModal, setActiveModal }: { user: UserData, isDarkMode?: boolean, events: any[], orgs: any[], fetchCommunityData: () => void, activeModal?: string | null, setActiveModal?: (val: string | null) => void }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<any>(null);
  const [addType, setAddType] = useState<'event' | 'org'>('event');
  const [activeTab, setActiveTab] = useState<'all' | 'club' | 'organization' | 'initiative'>('all');
  const [newData, setNewData] = useState({ 
    title: '', 
    date: '', 
    location: '', 
    name: '', 
    description: '', 
    category: 'Club' as any,
    members: [] as string[]
  });

  useEffect(() => {
    if (activeModal === 'community') {
      setShowAddModal(true);
      if (setActiveModal) setActiveModal(null);
    }
  }, [activeModal]);

  const handleAdd = async () => {
    const table = addType === 'event' ? 'community_events' : 'community_orgs';
    const payload = addType === 'event' 
      ? { title: newData.title, date: newData.date, location: newData.location }
      : { name: newData.name, description: newData.description, category: newData.category, members: [] };

    const { error } = await supabase.from(table).insert(payload);
    if (!error) {
      fetchCommunityData();
      setShowAddModal(false);
      resetForm();
    }
  };

  const handleUpdate = async () => {
    if (!editingOrg) return;
    const { error } = await supabase
      .from('community_orgs')
      .update({ 
        name: newData.name, 
        description: newData.description, 
        category: newData.category 
      })
      .eq('id', editingOrg.id);

    if (!error) {
      fetchCommunityData();
      setShowAddModal(false);
      setEditingOrg(null);
      resetForm();
    }
  };

  const handleDelete = async (id: string, type: 'event' | 'org') => {
    const table = type === 'event' ? 'community_events' : 'community_orgs';
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) fetchCommunityData();
  };

  const handleJoinLeave = async (org: any) => {
    const isMember = (org.members || []).includes(user.id);
    let updatedMembers = [];
    
    if (isMember) {
      updatedMembers = (org.members || []).filter((id: string) => id !== user.id);
    } else {
      updatedMembers = [...(org.members || []), user.id];
    }

    const { error } = await supabase
      .from('community_orgs')
      .update({ members: updatedMembers })
      .eq('id', org.id);

    if (!error) fetchCommunityData();
  };

  const resetForm = () => {
    setNewData({ title: '', date: '', location: '', name: '', description: '', category: 'Club', members: [] });
  };

  const filteredOrgs = activeTab === 'all' ? orgs : orgs.filter(o => o.category?.toLowerCase() === activeTab);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">Student Community</h1>
          <p className={cn("text-lg font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>Browse and join clubs, organizations, and focus initiatives.</p>
        </div>
        {user.role === 'admin' && (
          <button 
            onClick={() => { resetForm(); setAddType('org'); setShowAddModal(true); }}
            className="px-8 py-4 bg-red-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-red-600/20 hover:bg-red-500 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Create Community
          </button>
        )}
      </header>

      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-full w-fit">
        {['all', 'club', 'organization', 'initiative'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === tab ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {tab}s
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className={cn(
          "md:col-span-1 p-10 rounded-[3rem] border h-fit",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-2xl font-black tracking-tight mb-8 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-red-600" />
            Upcoming Events
          </h3>
          <div className="space-y-8">
            {events.length > 0 ? events.map((event, i) => (
              <div key={i} className="group relative">
                <div className="flex gap-6">
                  <div className={cn("w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border", isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100")}>
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{event.date?.split(' ')[0]?.slice(0, 3)}</span>
                    <span className="text-xl font-black tracking-tighter">{event.date?.split(' ')[1]?.replace(',', '') || '??'}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-lg tracking-tight leading-none mb-1">{event.title}</p>
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </p>
                  </div>
                  {user.role === 'admin' && (
                    <button onClick={() => handleDelete(event.id, 'event')} className="opacity-0 group-hover:opacity-100 p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )) : (
              <div className="py-12 text-center text-slate-400 italic">
                <Globe className="w-10 h-10 mx-auto mb-4 opacity-20" />
                <p className="font-bold">No active events.</p>
              </div>
            )}
            {user.role === 'admin' && (
              <button 
                onClick={() => { resetForm(); setAddType('event'); setShowAddModal(true); }}
                className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2rem] text-slate-400 font-black uppercase text-[10px] tracking-widest hover:border-red-600 hover:text-red-600 transition-all"
              >
                + Add Event
              </button>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredOrgs.length > 0 ? filteredOrgs.map((org, i) => {
              const isMember = (org.members || []).includes(user.id);
              return (
                <div key={i} className={cn(
                  "p-8 rounded-[3rem] border transition-all hover:shadow-xl group relative overflow-hidden",
                  isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200"
                )}>
                  <div className="absolute top-6 right-6 flex gap-2">
                    {user.role === 'admin' && (
                      <button 
                        onClick={() => {
                          setEditingOrg(org);
                          setNewData({ ...org });
                          setAddType('org');
                          setShowAddModal(true);
                        }}
                        className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {user.role === 'admin' && (
                      <button onClick={() => handleDelete(org.id, 'org')} className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg",
                    org.category === 'Club' ? "bg-red-500 text-white shadow-red-500/20" :
                    org.category === 'Organization' ? "bg-blue-500 text-white shadow-blue-500/20" :
                    "bg-emerald-500 text-white shadow-emerald-500/20"
                  )}>
                    <Users2 className="w-7 h-7" />
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{org.category}</span>
                  <h4 className="text-2xl font-black tracking-tighter mb-4 mt-1">{org.name}</h4>
                  <p className="text-sm font-medium text-slate-500 line-clamp-2 mb-8 leading-relaxed italic">
                    {org.description || 'Dedicated to student growth and creative expression within the aid ecosystem.'}
                  </p>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-6">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-3">
                        {[1, 2, 3].map((_, idx) => (
                          <div key={idx} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 flex items-center justify-center text-[10px] font-black">{idx + 1}</div>
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-slate-400">{(org.members || []).length} Members</span>
                    </div>
                    {user.role === 'student' && (
                      <button 
                        onClick={() => handleJoinLeave(org)}
                        className={cn(
                          "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          isMember 
                            ? "bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-red-600 hover:text-white" 
                            : "bg-red-600 text-white shadow-lg shadow-red-600/20 hover:scale-105 active:scale-95"
                        )}
                      >
                        {isMember ? 'Leave' : 'Join'}
                      </button>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-2 py-20 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[3rem]">
                <PlusCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-400 font-bold italic tracking-widest uppercase text-xs">No active {activeTab}s listed.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowAddModal(false); setEditingOrg(null); }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn("relative rounded-[3rem] p-10 max-w-lg w-full shadow-2xl", isDarkMode ? "bg-[#111111] text-white border border-white/10" : "bg-white")}
            >
              <h3 className="text-4xl font-black tracking-tighter mb-8 leading-none">
                {editingOrg ? 'Update Community' : (addType === 'event' ? 'Schedule Event' : 'Create Community')}
              </h3>

              {!editingOrg && (
                <div className="flex gap-3 mb-8 p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl">
                  {(['event', 'org'] as const).map(type => (
                    <button 
                      key={type}
                      onClick={() => setAddType(type)} 
                      className={cn(
                        "flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                        addType === type ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm" : "text-slate-400"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-6">
                {addType === 'event' ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-2">Event Headline</label>
                      <input 
                        type="text" value={newData.title} onChange={e => setNewData({...newData, title: e.target.value})}
                        className={cn("w-full p-5 rounded-2xl font-bold border-none", isDarkMode ? "bg-white/5 text-white" : "bg-slate-50 text-slate-900")}
                        placeholder="e.g. Annual Aid Expo"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-2">Date</label>
                        <input 
                          type="text" value={newData.date} onChange={e => setNewData({...newData, date: e.target.value})}
                          className={cn("w-full p-5 rounded-2xl font-bold border-none", isDarkMode ? "bg-white/5 text-white" : "bg-slate-50 text-slate-900")}
                          placeholder="April 21, 2026"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-2">Location</label>
                        <input 
                          type="text" value={newData.location} onChange={e => setNewData({...newData, location: e.target.value})}
                          className={cn("w-full p-5 rounded-2xl font-bold border-none", isDarkMode ? "bg-white/5 text-white" : "bg-slate-50 text-slate-900")}
                          placeholder="Main Hall"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-2">Group Name</label>
                      <input 
                        type="text" value={newData.name} onChange={e => setNewData({...newData, name: e.target.value})}
                        className={cn("w-full p-5 rounded-2xl font-bold border-none", isDarkMode ? "bg-white/5 text-white" : "bg-slate-50 text-slate-900")}
                        placeholder="Organization Name"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-2">Category</label>
                      <select 
                        value={newData.category} onChange={e => setNewData({...newData, category: e.target.value as any})}
                        className={cn("w-full p-5 rounded-2xl font-black border-none appearance-none", isDarkMode ? "bg-white/5 text-white" : "bg-slate-50 text-slate-900")}
                      >
                        <option>Club</option>
                        <option>Organization</option>
                        <option>Initiative</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-2">Mandate & Description</label>
                      <textarea 
                        value={newData.description} onChange={e => setNewData({...newData, description: e.target.value})}
                        className={cn("w-full p-5 rounded-2xl font-bold border-none h-32 resize-none leading-relaxed", isDarkMode ? "bg-white/5 text-white" : "bg-slate-50 text-slate-900")}
                        placeholder="Briefly describe the community's goal..."
                      />
                    </div>
                  </>
                )}
                <div className="flex gap-4 pt-6">
                  <button 
                    onClick={() => { setShowAddModal(false); setEditingOrg(null); }}
                    className={cn("flex-1 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px]", isDarkMode ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-600")}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={editingOrg ? handleUpdate : handleAdd}
                    className="flex-1 py-5 bg-red-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/30 hover:bg-red-500 active:scale-95 transition-all"
                  >
                    {editingOrg ? 'Apply Changes' : (addType === 'event' ? 'Post Event' : 'Launch Community')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SettingsView({ 
  user, 
  isDarkMode, 
  setIsDarkMode, 
  accentColor, 
  setAccentColor,
  notificationSettings,
  setNotificationSettings
}: { 
  user: UserData, 
  isDarkMode: boolean, 
  setIsDarkMode: (val: boolean) => void, 
  accentColor: string, 
  setAccentColor: (val: string) => void,
  notificationSettings: any,
  setNotificationSettings: (val: any) => void
}) {
  const [activeSetting, setActiveSetting] = useState<string | null>(null);
  const [tempAccent, setTempAccent] = useState(accentColor);
  const [tempDarkMode, setTempDarkMode] = useState(isDarkMode);
  const [tempNotifications, setTempNotifications] = useState(notificationSettings);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Password Reset State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handlePasswordReset = async () => {
    if (!newPassword || !confirmPassword) {
      alert('Please fill in both password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    setIsResetting(true);
    const { error } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', user.id);
    
    if (!error) {
      setToastMessage('Password updated successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setNewPassword('');
      setConfirmPassword('');
      setActiveSetting(null);
    } else {
      alert('Error resetting password: ' + error.message);
    }
    setIsResetting(false);
  };

  const colors = [
    { id: 'red', bg: 'bg-red-600', text: 'text-red-600' },
    { id: 'blue', bg: 'bg-blue-600', text: 'text-blue-600' },
    { id: 'emerald', bg: 'bg-emerald-600', text: 'text-emerald-600' },
    { id: 'amber', bg: 'bg-amber-600', text: 'text-amber-600' }
  ];

  const settingsItems = [
    { id: 'notifications', title: "Notifications", desc: "Manage how you receive alerts and updates.", icon: <Bell /> },
    { id: 'privacy', title: "Privacy & Security", desc: "Control your data and account protection.", icon: <Shield /> },
    { id: 'display', title: "Display Preferences", desc: "Customize the look and feel of your portal.", icon: <Palette /> },
    ...(user.role === 'faculty' ? [{ id: 'faculty', title: "Faculty Workspace", desc: "Curriculum management and academic load.", icon: <BookOpen /> }] : []),
    ...(user.role === 'student' ? [{ id: 'student', title: "Academic Profile", desc: "Digital identity and enrollment roadmap.", icon: <GraduationCap /> }] : [])
  ];

  const handleSave = () => {
    setAccentColor(tempAccent);
    setIsDarkMode(tempDarkMode);
    setNotificationSettings(tempNotifications);
    
    localStorage.setItem('aid_portal_accent_color', tempAccent);
    localStorage.setItem('aid_portal_dark_mode', String(tempDarkMode));
    localStorage.setItem('aid_portal_notifications', JSON.stringify(tempNotifications));
    
    setToastMessage('Settings saved successfully!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    setActiveSetting(null);
  };

  const handlePrivacyAction = (action: string) => {
    setToastMessage(`${action} feature coming soon!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-5xl font-black tracking-tighter mb-2">Settings</h1>
        <p className={cn("text-lg font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>
          Manage your account preferences and security.
        </p>
      </header>

      <div className="max-w-3xl space-y-4">
        {settingsItems.map((item, i) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setActiveSetting(item.id)}
            className={cn(
              "p-8 rounded-[2.5rem] border flex items-center justify-between group cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]",
              isDarkMode 
                ? "bg-[#111111] border-white/5 hover:border-white/10" 
                : "bg-white border-slate-100 shadow-sm hover:shadow-md"
            )}
          >
            <div className="flex items-center gap-8">
              <div className={cn(
                "w-16 h-16 rounded-3xl flex items-center justify-center transition-all",
                isDarkMode 
                  ? cn(
                      "bg-white/5 text-slate-400 group-hover:bg-white/10",
                      accentColor === 'red' ? "group-hover:text-red-600" :
                      accentColor === 'blue' ? "group-hover:text-blue-600" :
                      accentColor === 'emerald' ? "group-hover:text-emerald-600" :
                      "group-hover:text-amber-600"
                    )
                  : cn(
                      "bg-slate-50 text-slate-500 group-hover:bg-slate-100",
                      accentColor === 'red' ? "group-hover:text-red-600" :
                      accentColor === 'blue' ? "group-hover:text-blue-600" :
                      accentColor === 'emerald' ? "group-hover:text-emerald-600" :
                      "group-hover:text-amber-600"
                    )
              )}>
                {React.cloneElement(item.icon as React.ReactElement, { className: "w-8 h-8" })}
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight mb-1">{item.title}</h3>
                <p className={cn("text-sm font-medium", isDarkMode ? "text-slate-500" : "text-slate-400")}>
                  {item.desc}
                </p>
              </div>
            </div>
            <ChevronRight className={cn(
              "w-6 h-6 transition-transform group-hover:translate-x-1",
              isDarkMode ? "text-slate-700" : "text-slate-300"
            )} />
          </motion.div>
        ))}
      </div>

      {/* Settings Modals */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={cn(
              "fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl shadow-2xl z-[200] font-bold flex items-center gap-3",
              isDarkMode ? "bg-white text-slate-900" : "bg-slate-900 text-white"
            )}
          >
            <CheckCircle className={cn("w-5 h-5", accentColor === 'red' ? "text-red-600" : accentColor === 'blue' ? "text-blue-600" : accentColor === 'emerald' ? "text-emerald-600" : "text-amber-600")} />
            {toastMessage}
          </motion.div>
        )}

        {activeSetting && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSetting(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-xl p-10 rounded-[3rem] border shadow-2xl overflow-hidden",
                isDarkMode ? "bg-[#0A0A0A] border-white/10" : "bg-white border-slate-200"
              )}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white",
                    accentColor === 'red' ? "bg-red-600" :
                    accentColor === 'blue' ? "bg-blue-600" :
                    accentColor === 'emerald' ? "bg-emerald-600" :
                    "bg-amber-600"
                  )}>
                    {settingsItems.find(s => s.id === activeSetting)?.icon}
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter">
                    {settingsItems.find(s => s.id === activeSetting)?.title}
                  </h2>
                </div>
                <button 
                  onClick={() => setActiveSetting(null)}
                  className={cn(
                    "p-3 rounded-2xl transition-colors",
                    isDarkMode ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-100 text-slate-500"
                  )}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {activeSetting === 'notifications' && (
                  <div className="space-y-4">
                    {[
                      { id: 'email', label: 'Email Notifications' },
                      { id: 'push', label: 'Push Notifications' },
                      { id: 'sms', label: 'SMS Alerts' },
                      { id: 'reports', label: 'Weekly Reports' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                        <span className="font-bold">{item.label}</span>
                        <button 
                          onClick={() => setTempNotifications((prev: any) => ({ ...prev, [item.id]: !prev[item.id] }))}
                          className={cn(
                            "w-12 h-6 rounded-full relative transition-all",
                            tempNotifications[item.id] 
                              ? (accentColor === 'red' ? "bg-red-600" : accentColor === 'blue' ? "bg-blue-600" : accentColor === 'emerald' ? "bg-emerald-600" : "bg-amber-600")
                              : "bg-slate-200 dark:bg-white/10"
                          )}
                        >
                          <motion.div 
                            animate={{ x: tempNotifications[item.id] ? 24 : 4 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {activeSetting === 'privacy' && (
                  <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-red-600/5 border border-red-600/10 mb-2">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">Reset Password</h4>
                       <div className="space-y-4">
                         <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                           <input 
                             type="password" 
                             value={newPassword}
                             onChange={e => setNewPassword(e.target.value)}
                             className={cn("w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all", isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100")}
                             placeholder="••••••••"
                           />
                         </div>
                         <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                           <input 
                             type="password" 
                             value={confirmPassword}
                             onChange={e => setConfirmPassword(e.target.value)}
                             className={cn("w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all", isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100")}
                             placeholder="••••••••"
                           />
                         </div>
                         <button 
                           onClick={handlePasswordReset}
                           disabled={isResetting}
                           className="w-full py-4 bg-red-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20 hover:bg-red-500 transition-all"
                         >
                           {isResetting ? 'Updating...' : 'Save New Password'}
                         </button>
                       </div>
                    </div>
                    <div className="space-y-4 opacity-50 contrast-50 pointer-events-none">
                      <button 
                        onClick={() => handlePrivacyAction('Two-Factor Authentication')}
                        className="w-full p-6 rounded-2xl bg-slate-100 dark:bg-white/5 font-black uppercase tracking-widest text-xs hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                      >
                        Two-Factor Authentication (Soon)
                      </button>
                    </div>
                  </div>
                )}

                {activeSetting === 'display' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setTempDarkMode(false)}
                        className={cn(
                          "p-6 rounded-2xl border-2 font-black transition-all",
                          !tempDarkMode 
                            ? cn(
                                "bg-white text-slate-900",
                                accentColor === 'red' ? "border-red-600" :
                                accentColor === 'blue' ? "border-blue-600" :
                                accentColor === 'emerald' ? "border-emerald-600" :
                                "border-amber-600"
                              )
                            : "border-slate-200 bg-slate-50 text-slate-400"
                        )}
                      >
                        Light Mode
                      </button>
                      <button 
                        onClick={() => setTempDarkMode(true)}
                        className={cn(
                          "p-6 rounded-2xl border-2 font-black transition-all",
                          tempDarkMode 
                            ? cn(
                                "bg-slate-900 text-white",
                                accentColor === 'red' ? "border-red-600" :
                                accentColor === 'blue' ? "border-blue-600" :
                                accentColor === 'emerald' ? "border-emerald-600" :
                                "border-amber-600"
                              )
                            : "border-slate-200 bg-slate-800 text-slate-500"
                        )}
                      >
                        Dark Mode
                      </button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Accent Color</p>
                      <div className="flex gap-4">
                        {colors.map(c => (
                          <div 
                            key={c.id} 
                            onClick={() => setTempAccent(c.id)}
                            className={cn(
                              "w-12 h-12 rounded-full cursor-pointer transition-all flex items-center justify-center",
                              c.bg,
                              tempAccent === c.id ? "ring-4 ring-offset-2 ring-slate-200" : "opacity-60 hover:opacity-100"
                            )}
                          >
                            {tempAccent === c.id && <Check className="w-6 h-6 text-white" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-10 pt-6 border-t border-slate-100 dark:border-white/5">
                <button 
                  onClick={handleSave}
                  className={cn(
                    "w-full py-5 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all",
                    accentColor === 'red' ? "bg-red-600 shadow-red-600/20 hover:bg-red-500" :
                    accentColor === 'blue' ? "bg-blue-600 shadow-blue-600/20 hover:bg-blue-500" :
                    accentColor === 'emerald' ? "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-500" :
                    "bg-amber-600 shadow-amber-600/20 hover:bg-amber-500"
                  )}
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FinancialAid({ user, financialAid, fetchFinancialAid, isDarkMode, selectedScholarship, setSelectedScholarship, users, scholarships }: { user: UserData, financialAid: any[], fetchFinancialAid: any, isDarkMode?: boolean, selectedScholarship?: string | null, setSelectedScholarship?: any, users: UserData[], scholarships: any[] }) {
  const [showApply, setShowApply] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    type: 'Scholarship', 
    amount: '', 
    reason: '',
    personalStatement: '',
    hasAcademicRecords: '',
    hasRecommendation: '',
    hasIncomeProof: '',
    hasValidId: '',
    hasRecentPhoto: ''
  });

  const [previewFile, setPreviewFile] = useState<{name: string, data: string} | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const prefillExample = () => {
    setFormData({
      type: 'Scholarship',
      amount: '',
      reason: 'I am a dedicated student with a high GPA but currently facing financial hardships due to family medical expenses. This scholarship will help me continue my education without delay.',
      personalStatement: 'My academic journey has always been driven by a passion for science and community service. I have maintained a 3.8 GPA while volunteering at the local clinic. My goal is to eventually study medicine and serve rural communities. Financial support would be instrumental in achieving this dream.',
      hasAcademicRecords: 'https://picsum.photos/seed/records/800/1200',
      hasRecommendation: 'https://picsum.photos/seed/recommend/800/1200',
      hasIncomeProof: 'https://picsum.photos/seed/income/800/1200',
      hasValidId: 'https://picsum.photos/seed/id/800/1200',
      hasRecentPhoto: 'https://picsum.photos/seed/photo/800/1200'
    });
    setSubmissionStatus('idle');
    setErrorMessage('');
  };

  const resetForm = () => {
    setFormData({ 
      type: 'Scholarship', 
      amount: '', 
      reason: '',
      personalStatement: '',
      hasAcademicRecords: '',
      hasRecommendation: '',
      hasIncomeProof: '',
      hasValidId: '',
      hasRecentPhoto: ''
    });
    setUploading(null);
    setSubmissionStatus('idle');
    setErrorMessage('');
  };

  useEffect(() => {
    if (selectedScholarship) {
      setFormData(prev => ({ ...prev, type: selectedScholarship }));
      setShowApply(true);
    }
  }, [selectedScholarship]);

  const handleCloseForm = () => {
    setShowApply(false);
    resetForm();
    setSelectedScholarship?.(null);
  };

  const handleFileUpload = (field: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        setUploading(field);
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          setFormData(prev => ({ ...prev, [field]: dataUrl }));
          setUploading(null);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmissionStatus('idle');
    setErrorMessage('');
    
    // Check if all required uploads are present
    const requiredFiles = [
      { id: 'hasAcademicRecords', label: 'Academic Records' },
      { id: 'hasValidId', label: 'Valid ID' },
      { id: 'hasRecentPhoto', label: 'Recent Photo' }
    ];
    const missing = requiredFiles.filter(f => !formData[f.id as keyof typeof formData]);
    
    if (missing.length > 0) {
      setSubmissionStatus('error');
      setErrorMessage(`Please upload: ${missing.map(m => m.label).join(', ')}`);
      setSubmitting(false);
      return;
    }

    // Validate textual inputs
    if (formData.reason.trim().length < 20) {
      setSubmissionStatus('error');
      setErrorMessage('Justification reason is too short (min 20 chars)');
      setSubmitting(false);
      return;
    }

    if (formData.personalStatement.trim().length < 50) {
      setSubmissionStatus('error');
      setErrorMessage('Personal statement is too short (min 50 chars)');
      setSubmitting(false);
      return;
    }

    const requestedAmount = formData.type === 'Student Loan' ? parseFloat(formData.amount) : 0;
    if (formData.type === 'Student Loan' && (isNaN(requestedAmount) || requestedAmount <= 0)) {
      setSubmissionStatus('error');
      setErrorMessage('Enter a valid requested amount');
      setSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from('financial_aid')
      .insert({ 
        program: formData.type, 
        amount: requestedAmount, 
        reason: formData.reason, 
        personalStatement: formData.personalStatement,
        attachments: {
          academicRecords: formData.hasAcademicRecords,
          recommendation: formData.hasRecommendation,
          incomeProof: formData.hasIncomeProof,
          validId: formData.hasValidId,
          photo: formData.hasRecentPhoto
        },
        studentId: user.id, 
        studentName: user.name,
        date: new Date().toISOString(),
        status: 'pending'
      });
    
    if (!error) {
      setSubmissionStatus('success');
      
      // Create notification for student
      await supabase.from('notifications').insert({
        userId: user.id,
        title: "Application Received",
        message: `Your application for ${formData.type} has been successfully submitted and is now waiting for approval.`,
        type: 'info',
        read: false,
        timestamp: new Date().toISOString()
      });

      setTimeout(() => {
        handleCloseForm();
      }, 1500);
      fetchFinancialAid();
    } else {
      console.error('Submission error:', error);
      setSubmissionStatus('error');
      
      // Detailed error logic for PostgREST schema cache errors
      if (error.message.includes('attachments') || error.message.includes('schema cache')) {
        setErrorMessage('Database Error: Missing "attachments" column. Please run the SQL fix in your Supabase dashboard to allow file uploads.');
      } else {
        setErrorMessage(error.message);
      }
    }
    setSubmitting(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Financial Aid</h1>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Manage your scholarships, grants, and academic funding.</p>
        </div>
        {(user.role === 'admin' || user.role === 'student') && (
          <button 
            onClick={() => setShowApply(true)}
            className={cn(
              "flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black transition-all",
              isDarkMode ? "bg-white text-slate-900 hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200"
            )}
          >
            <Plus className="w-5 h-5" />
            New Application
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {user.balance > 0 && (
          <div className={cn(
            "lg:col-span-1 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]",
            isDarkMode ? "bg-red-600" : "bg-slate-900"
          )}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative z-10">
              <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">Outstanding Balance</p>
              <h2 className="text-6xl font-black tracking-tighter">₱{user.balance?.toLocaleString()}</h2>
            </div>
            <div className="relative z-10 pt-10 border-t border-white/10 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-white/60 font-bold">Next Payment Due</p>
                <p className="text-sm font-black">April 01, 2024</p>
              </div>
              <button className={cn(
                "w-full py-4 rounded-2xl font-black text-sm transition-all",
                isDarkMode ? "bg-white text-red-600 hover:bg-slate-100" : "bg-white text-slate-900 hover:bg-slate-100"
              )}>Pay Now</button>
            </div>
          </div>
        )}

        <div className={cn(
          "lg:col-span-1 p-10 rounded-[3rem] border transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-2xl font-black tracking-tight mb-8">Available Aid Posts</h3>
          <div className="space-y-4">
            {scholarships.map(s => (
              <div 
                key={s.id}
                className={cn(
                  "p-6 rounded-3xl border transition-all hover:border-red-600 cursor-pointer",
                  isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
                )}
                onClick={() => {
                  setFormData(prev => ({ ...prev, type: s.name }));
                  setShowApply(true);
                }}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-black text-sm">{s.name}</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500">{s.coverage}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{s.description}</p>
                <button className="mt-4 w-full py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={cn(
          "lg:col-span-2 p-10 rounded-[3rem] border transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-2xl font-black tracking-tight mb-8">
            {user.role === 'admin' ? "All Applications" : "Application History"}
          </h3>
          <div className="space-y-4">
              {((user.role === 'admin' ? financialAid : financialAid.filter(f => f.studentId === user.id)) || []).length > 0 ? (
                (user.role === 'admin' ? financialAid : financialAid.filter(f => f.studentId === user.id)).map(f => (
                  <div 
                    key={f.id} 
                    onClick={() => setSelectedApplication(f)}
                    className={cn(
                      "flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl transition-all cursor-pointer group gap-4",
                      isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-lg group-hover:text-red-600 transition-colors">{f.program}</p>
                        <p className={cn("text-xs font-bold", isDarkMode ? "text-slate-500" : "text-slate-400")}>
                          {user.role === 'admin' ? `Applied by ${f.studentName || 'Student'} • ` : ''}
                          ₱{f.amount} • {new Date(f.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        f.status === 'pending' ? "bg-amber-500/10 text-amber-500 shadow-sm shadow-amber-500/10" : 
                        f.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" :
                        "bg-red-500/10 text-red-500"
                      )}>
                        {f.status === 'pending' ? 'Waiting for Approval' : f.status}
                      </span>
                      {user.role === 'admin' && f.status === 'pending' && (
                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                          <button 
                            onClick={async () => {
                              const { error } = await supabase.from('financial_aid').update({ status: 'rejected' }).eq('id', f.id);
                              if (!error) fetchFinancialAid();
                            }}
                            className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={async () => {
                              const { error } = await supabase.from('financial_aid').update({ status: 'approved' }).eq('id', f.id);
                              if (!error) fetchFinancialAid();
                            }}
                            className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-bold">No applications found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showApply && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={cn(
            "p-10 rounded-[3rem] w-full max-w-md shadow-2xl border",
            isDarkMode ? "bg-[#111111] border-white/10 text-white" : "bg-white border-slate-200"
          )}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Apply for Aid</h2>
                <button 
                  type="button"
                  onClick={prefillExample}
                  className="mt-2 text-[10px] font-black uppercase text-red-600 hover:underline"
                >
                  (Click for Example Data)
                </button>
              </div>
              <button onClick={handleCloseForm} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
              <div className="p-6 rounded-3xl bg-red-600/5 border border-red-600/10 space-y-3">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Aid Definitions</h4>
                    <p className="text-[11px] font-bold text-slate-500 leading-tight">
                      <span className="text-slate-900 dark:text-white">Scholarship/Grant:</span> Free financial support with no repayment needed.<br/>
                      <span className="text-slate-900 dark:text-white">Student Loan:</span> Repayable financial assistance (usually with interest).
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Aid Category</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className={cn(
                    "w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all text-slate-900 dark:text-white",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                >
                  <option className="bg-white dark:bg-[#111111] text-slate-900 dark:text-white">Scholarship</option>
                  <option className="bg-white dark:bg-[#111111] text-slate-900 dark:text-white">Grant</option>
                  <option className="bg-white dark:bg-[#111111] text-slate-900 dark:text-white">Student Loan</option>
                </select>
              </div>
              {formData.type === 'Student Loan' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Requested Amount (₱)</label>
                  <input 
                    type="number" 
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    className={cn(
                      "w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all text-slate-900 dark:text-white",
                      isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                    )}
                    placeholder="e.g. 5000"
                    required
                  />
                </motion.div>
              )}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Required Documents</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'hasAcademicRecords', name: 'Academic Records', icon: <BookOpen className="w-4 h-4" /> },
                    { id: 'hasValidId', name: 'Valid ID', icon: <UserCheck className="w-4 h-4" /> },
                    { id: 'hasRecentPhoto', name: 'Recent Photo (ID Pix)', icon: <Camera className="w-4 h-4" /> },
                    { id: 'hasRecommendation', name: 'Recommendation Letter', icon: <FileText className="w-4 h-4" />, optional: true },
                    { id: 'hasIncomeProof', name: 'Proof of Income', icon: <Wallet className="w-4 h-4" />, optional: true },
                  ].map((doc) => (
                    <div 
                      key={doc.id}
                      className={cn(
                        "p-4 rounded-2xl border flex items-center justify-between transition-all",
                        isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-100"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", isDarkMode ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600")}>
                          {doc.icon}
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight">{doc.name}</p>
                          <p className="text-[10px] text-slate-400">{doc.optional ? 'Optional' : 'Mandatory'}</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleFileUpload(doc.id)}
                        disabled={!!uploading}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                          formData[doc.id as keyof typeof formData] 
                            ? "bg-emerald-500/10 text-emerald-500" 
                            : (isDarkMode ? "bg-white/10 text-white hover:bg-white/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200")
                        )}
                      >
                        {uploading === doc.id ? 'Uploading...' : formData[doc.id as keyof typeof formData] ? 'Uploaded' : 'Upload'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Personal Statement / Essay</label>
                <textarea 
                  value={formData.personalStatement}
                  onChange={e => setFormData({...formData, personalStatement: e.target.value})}
                  className={cn(
                    "w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all h-40 resize-none text-slate-900 dark:text-white",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                  placeholder="Type your personal statement here (minimum 200 words recommended)..."
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Justification / Funding Reason</label>
                <textarea 
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  className={cn(
                    "w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all h-32 resize-none text-slate-900 dark:text-white",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                  placeholder="Explain your financial situation..."
                  required
                />
              </div>
              <div className="pt-6 border-t border-slate-100 dark:border-white/5 space-y-4">
                {submissionStatus === 'success' && (
                  <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest animate-bounce">
                    <CheckCircle className="w-4 h-4" />
                    Application Submitted Successfully!
                  </div>
                )}
                {submissionStatus === 'error' && (
                  <div className="p-4 rounded-xl bg-red-50 text-red-600 flex flex-col items-center justify-center gap-1 text-[10px] font-black uppercase tracking-widest animate-pulse border border-red-100">
                    <div className="flex items-center gap-2">
                       <XCircle className="w-4 h-4" />
                       Submission Failed
                    </div>
                    <p className="normal-case font-bold">{errorMessage}</p>
                  </div>
                )}
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={handleCloseForm} 
                    className="flex-1 py-4 font-black text-slate-500 hover:text-red-600 transition-colors uppercase tracking-widest text-[10px]"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className={cn(
                      "flex-1 py-4 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]",
                      submissionStatus === 'success' ? "bg-emerald-500 text-white shadow-emerald-500/20" :
                      submissionStatus === 'error' ? "bg-red-500 text-white shadow-red-500/20" :
                      "bg-red-600 text-white shadow-red-600/20 hover:bg-red-700"
                    )}
                  >
                    {submitting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {selectedApplication && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            className={cn(
              "p-10 rounded-[3rem] w-full max-w-2xl shadow-2xl border flex flex-col gap-8",
              isDarkMode ? "bg-[#111111] border-white/10 text-white" : "bg-white border-slate-200"
            )}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Application Details</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Reviewing #{selectedApplication.id}</p>
              </div>
              <button 
                onClick={() => setSelectedApplication(null)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
              <div className="space-y-6">
                <section>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Student Information</label>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                    <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xl">
                      {selectedApplication.studentName?.[0] || 'S'}
                    </div>
                    <div>
                      <p className="font-black">{selectedApplication.studentName}</p>
                      <p className="text-xs text-slate-500">{selectedApplication.studentId}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Program Details</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-100 dark:border-white/10">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aid Type</p>
                      <p className="font-bold">{selectedApplication.program}</p>
                    </div>
                    <div className="p-4 rounded-2xl border border-slate-100 dark:border-white/10">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount</p>
                      <p className="font-bold">₱{selectedApplication.amount?.toLocaleString()}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Attached Files</label>
                  <div className="space-y-2">
                    {selectedApplication.attachments && Object.entries(selectedApplication.attachments).map(([key, val]: [string, any]) => (
                      <div key={key} className={cn(
                        "p-3 rounded-xl border flex items-center justify-between",
                        isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
                      )}>
                        <div className="flex items-center gap-3">
                          {val ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-300" />}
                          <span className="text-xs font-bold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                        {val && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewFile({ name: key, data: val });
                            }}
                            className="text-[10px] font-black uppercase text-red-600 hover:underline"
                          >
                            View File
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Personal Statement</label>
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 text-sm leading-relaxed italic text-slate-600 dark:text-slate-300">
                    "{selectedApplication.personalStatement || 'No statement provided.'}"
                  </div>
                </section>

                <section>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Justification Reason</label>
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 text-sm leading-relaxed italic text-slate-600 dark:text-slate-300">
                    "{selectedApplication.reason || 'No justification provided.'}"
                  </div>
                </section>

                <section>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Application Status</label>
                  <div className={cn(
                    "p-4 rounded-2xl flex items-center justify-between",
                    selectedApplication.status === 'pending' ? "bg-amber-500 text-white" :
                    selectedApplication.status === 'approved' ? "bg-emerald-500 text-white" :
                    "bg-red-500 text-white"
                  )}>
                    <span className="font-black uppercase tracking-widest text-xs">{selectedApplication.status}</span>
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">
                      {selectedApplication.status === 'pending' ? 'Currently under review' : 'Final decision made'}
                    </span>
                  </div>
                </section>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
              <button 
                onClick={() => setSelectedApplication(null)}
                className="flex-1 py-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-[1.02] transition-transform"
              >
                Close View
              </button>
              {user.role === 'admin' && selectedApplication.status === 'pending' && (
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={async () => {
                      const { error } = await supabase.from('financial_aid').update({ status: 'rejected' }).eq('id', selectedApplication.id);
                      if (!error) {
                        fetchFinancialAid();
                        setSelectedApplication(null);
                      }
                    }}
                    className="px-6 py-4 rounded-2xl bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-colors"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={async () => {
                      const { error } = await supabase.from('financial_aid').update({ status: 'approved' }).eq('id', selectedApplication.id);
                      if (!error) {
                        fetchFinancialAid();
                        setSelectedApplication(null);
                      }
                    }}
                    className="px-6 py-4 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* File Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setPreviewFile(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between border-b border-white/10 bg-slate-900/50 backdrop-blur-md">
                <div>
                  <h4 className="text-white font-black uppercase tracking-widest text-xs">File Preview</h4>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                    {previewFile.name.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>
                <button 
                  onClick={() => setPreviewFile(null)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#000]">
                {typeof previewFile.data === 'string' && (previewFile.data.startsWith('data:application/pdf') || previewFile.data.includes('.pdf')) ? (
                  <iframe 
                    src={previewFile.data} 
                    className="w-full h-[70vh] rounded-xl border-none"
                    title="PDF Preview"
                  />
                ) : typeof previewFile.data === 'string' ? (
                  <img 
                    src={previewFile.data} 
                    alt="Preview" 
                    className="max-w-full max-h-full object-contain shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-white font-bold text-center">
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <p>File content not available for older applications.</p>
                  </div>
                )}
              </div>
              <div className="p-6 bg-slate-900/50 backdrop-blur-md border-t border-white/10 flex justify-end">
                <button 
                  onClick={() => setPreviewFile(null)}
                  className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Messages({ user, messages, fetchMessages, users, isDarkMode, selectedChatUser, setSelectedChatUser, courses = [], mentors = [] }: { user: UserData, messages: any[], fetchMessages: any, users: UserData[], isDarkMode?: boolean, selectedChatUser: UserData | null, setSelectedChatUser: (u: UserData | null) => void, courses?: any[], mentors?: any[] }) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (selectedChatUser) {
      setSelectedChatUser(selectedChatUser);
    }
  }, [selectedChatUser]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = selectedChatUser;
    if (!targetUser || !text) return;
    const { error } = await supabase
      .from('messages')
      .insert({ 
        from: user.id, 
        to: targetUser.id, 
        content: text,
        timestamp: new Date().toISOString()
      });
    
    if (!error) {
      setText('');
      fetchMessages();
    }
  };

  const filteredMessages = messages.filter(m => 
    selectedChatUser && ((m.from === selectedChatUser.id && m.to === user.id) || (m.from === user.id && m.to === selectedChatUser.id))
  );

  // Unified Messaging Restrictions
  const studentCourseIds = (user.schedule || []).map((s: any) => s.subject);
  
  const canMessage = (u: UserData) => {
    // Admin/Staff can always message anyone (or be messaged)
    if (user.role === 'admin' || user.role === 'staff') return true;
    if (u.role === 'admin' || u.role === 'staff') return true;

    if (user.role === 'faculty') {
      const facultyCourseIds = courses.filter(c => c.instructor === user.id).map(c => c.id);
      // Faculty can message students in their courses
      if (u.role === 'student' && (u.schedule || []).some((s: any) => facultyCourseIds.includes(s.subject))) return true;
    }

    if (user.role === 'student') {
        // Teachers of my courses
        const myTeachers = courses.filter(c => studentCourseIds.includes(c.id)).map(c => c.instructor);
        if (u.role === 'faculty' && myTeachers.includes(u.id)) return true;
        
        // Classmates (students in same courses)
        if (u.role === 'student') {
            const classmatesCourseIds = (u.schedule || []).map((s: any) => s.subject);
            if (studentCourseIds.some(id => classmatesCourseIds.includes(id))) return true;
        }
    }
    
    return false;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-12rem)] flex gap-4 md:gap-8">
      <div className={cn(
        "w-full md:w-80 rounded-[2.5rem] border overflow-hidden flex flex-col transition-all",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm",
        selectedChatUser ? "hidden md:flex" : "flex"
      )}>
        <div className={cn("p-6 md:p-8 border-b", isDarkMode ? "border-white/5" : "border-slate-100")}>
          <h3 className="text-xl font-black tracking-tight">Contacts</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {users.filter(u => u.id !== user.id && canMessage(u)).map(u => (
            <button 
              key={u.id}
              onClick={() => setSelectedChatUser(u)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-3xl transition-all group",
                selectedChatUser?.id === u.id 
                  ? (isDarkMode ? "bg-red-600 text-white" : "bg-slate-900 text-white shadow-lg shadow-slate-200") 
                  : (isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50")
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 overflow-hidden",
                selectedChatUser?.id === u.id ? "bg-white/20" : (isDarkMode ? "bg-white/5" : "bg-slate-100")
              )}>
                {u.profilePic ? (
                  <img src={u.profilePic} alt={u.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  u.name[0]
                )}
              </div>
              <div className="text-left overflow-hidden">
                <p className="font-bold truncate">{u.name}</p>
                <p className={cn(
                  "text-[10px] uppercase tracking-widest font-black opacity-60",
                  selectedChatUser?.id === u.id ? "text-white" : (isDarkMode ? "text-slate-400" : "text-slate-500")
                )}>{u.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className={cn(
        "flex-1 rounded-[2.5rem] border overflow-hidden flex flex-col transition-all",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm",
        !selectedChatUser ? "hidden md:flex" : "flex"
      )}>
        {selectedChatUser ? (
          <>
            <div className={cn("p-6 md:p-8 border-b flex items-center gap-4", isDarkMode ? "border-white/5" : "border-slate-100")}>
              <button onClick={() => setSelectedChatUser(null)} className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center font-black text-red-500 text-xl">
                {selectedChatUser.name[0]}
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">{selectedChatUser.name}</h3>
                <p className={cn("text-xs font-bold", isDarkMode ? "text-slate-500" : "text-slate-400")}>Online • {selectedChatUser.role}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              {filteredMessages.map((m, i) => (
                <div key={i} className={cn(
                  "flex flex-col max-w-[85%] md:max-w-[80%]",
                  m.from === user.id ? "ml-auto items-end" : "items-start"
                )}>
                  <div className={cn(
                    "p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] text-sm font-medium",
                    m.from === user.id 
                      ? (isDarkMode ? "bg-red-600 text-white rounded-tr-none" : "bg-slate-900 text-white rounded-tr-none shadow-lg shadow-slate-200") 
                      : (isDarkMode ? "bg-white/5 text-slate-300 rounded-tl-none" : "bg-slate-100 text-slate-700 rounded-tl-none")
                  )}>
                    {m.content}
                  </div>
                  <p className={cn("text-[10px] font-bold mt-2 uppercase tracking-widest", isDarkMode ? "text-slate-600" : "text-slate-400")}>
                    {new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className={cn("p-6 md:p-8 border-t", isDarkMode ? "border-white/5" : "border-slate-100")}>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  value={text}
                  onChange={e => setText(e.target.value)}
                  className={cn(
                    "flex-1 p-4 md:p-5 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                  placeholder="Type a message..."
                />
                <button type="submit" className={cn(
                  "p-4 md:p-5 rounded-2xl font-black transition-all",
                  isDarkMode ? "bg-red-600 text-white hover:bg-red-700" : "bg-slate-900 text-white hover:bg-slate-800"
                )}>
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className={cn("w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6", isDarkMode ? "bg-white/5" : "bg-slate-50")}>
              <MessageSquare className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-2">Select a Contact</h3>
            <p className={cn("max-w-xs", isDarkMode ? "text-slate-500" : "text-slate-400")}>Choose a student or faculty member to start a secure conversation.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Documents({ user, isDarkMode }: { user: UserData, isDarkMode?: boolean }) {
  const [docs, setDocs] = useState([
    { id: 1, name: 'School_ID_2024.pdf', type: 'PDF', size: '1.2 MB', date: '2024-11-10', category: 'Identification' },
    { id: 2, name: 'Report_Card_Q1.pdf', type: 'PDF', size: '2.4 MB', date: '2024-11-10', category: 'Academic' },
    { id: 3, name: 'Income_Tax_Return.pdf', type: 'PDF', size: '3.1 MB', date: '2024-11-10', category: 'Financial' },
  ]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newDoc = {
        id: Date.now(),
        name: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        date: new Date().toISOString().split('T')[0],
        category: 'General'
      };
      setDocs([newDoc, ...docs]);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">My Documents</h1>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Manage and upload your required documents for scholarship applications.</p>
        </div>
        <label className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all flex items-center gap-2 cursor-pointer">
          <Upload className="w-5 h-5" />
          Upload New
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.map(doc => (
          <motion.div 
            key={doc.id}
            whileHover={{ y: -5 }}
            className={cn(
              "p-6 rounded-[2rem] border transition-all group",
              isDarkMode ? "bg-[#111111] border-white/5 hover:border-red-500/30" : "bg-white border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200"
            )}
          >
            <div className="flex items-start justify-between mb-6">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                isDarkMode ? "bg-white/5" : "bg-slate-50"
              )}>
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 rounded-xl text-red-500">
                <Download className="w-5 h-5" />
              </button>
            </div>
            <h3 className="font-black text-lg mb-1 truncate">{doc.name}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{doc.category} • {doc.type}</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
              <span className="text-xs font-bold text-slate-500">{doc.size}</span>
              <span className="text-xs font-bold text-slate-500">{doc.date}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function Announcements({ announcements, user, isDarkMode, fetchAnnouncements, setConfirmConfig, activeModal, setActiveModal, logActivity }: { announcements: any[], user: UserData, isDarkMode?: boolean, fetchAnnouncements: () => void, setConfirmConfig: any, activeModal?: string | null, setActiveModal?: (val: string | null) => void, logActivity: any }) {
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (activeModal === 'announcement') {
      setShowForm(true);
      if (setActiveModal) setActiveModal(null);
    }
  }, [activeModal]);
  const [formData, setFormData] = useState({ title: '', content: '', role: 'all' });

  const handleDelete = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Announcement',
      message: 'Are you sure you want to delete this announcement? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        const { error } = await supabase
          .from('announcements')
          .delete()
          .eq('id', id);
        
        if (!error) {
          logActivity('DELETE_ANNOUNCEMENT', `Announcement #${id} deleted`, 'Successful');
          fetchAnnouncements();
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('announcements')
      .insert({ 
        ...formData, 
        date: new Date().toISOString() 
      })
      .select();
    
    if (!error) {
      logActivity('CREATE_ANNOUNCEMENT', `New announcement created: ${formData.title}`, 'Successful');
      setShowForm(false);
      setFormData({ title: '', content: '', role: 'all' });
      fetchAnnouncements();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Campus Announcements</h1>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Stay updated with the latest news and events from St. Cecilia's College.</p>
        </div>
        {(user.role === 'admin' || user.role === 'faculty') && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {showForm ? 'Close Form' : 'Create New'}
          </button>
        )}
      </header>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={cn(
            "p-10 rounded-[3rem] border",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Announcement Title</label>
                <input 
                  type="text" 
                  value={formData.title || ''}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className={cn(
                    "w-full p-5 rounded-2xl border outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold text-slate-900 dark:text-white",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                  placeholder="e.g., Final Exams Schedule"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Target Audience</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className={cn(
                    "w-full p-5 rounded-2xl border outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold text-slate-900 dark:text-white",
                    isDarkMode ? "bg-[#1A1A1A] border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                >
                  <option value="all" className="bg-white dark:bg-[#111111] text-slate-900 dark:text-white">Everyone</option>
                  <option value="student" className="bg-white dark:bg-[#111111] text-slate-900 dark:text-white">Students Only</option>
                  <option value="faculty" className="bg-white dark:bg-[#111111] text-slate-900 dark:text-white">Faculty Only</option>
                  <option value="staff" className="bg-white dark:bg-[#111111] text-slate-900 dark:text-white">Staff Only</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Content</label>
              <textarea 
                value={formData.content || ''}
                onChange={e => setFormData({...formData, content: e.target.value})}
                className={cn(
                  "w-full p-5 rounded-2xl border outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold h-40 resize-none text-slate-900 dark:text-white",
                  isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                )}
                placeholder="Write the details of your announcement here..."
                required
              />
            </div>
            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 font-black text-slate-500 hover:text-red-600 transition-colors">Cancel</button>
              <button type="submit" className="px-10 py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all">Publish Announcement</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {announcements.filter(a => a.role === 'all' || a.role === user.role).map(a => (
          <motion.div 
            key={a.id} 
            whileHover={{ y: -5 }}
            className={cn(
              "p-10 rounded-[3rem] border transition-all",
              isDarkMode ? "bg-[#111111] border-white/5 hover:border-red-500/30" : "bg-white border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200"
            )}
          >
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                isDarkMode ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-600"
              )}>
                {a.role === 'all' ? 'Everyone' : a.role}
              </span>
              <div className={cn("w-1.5 h-1.5 rounded-full", isDarkMode ? "bg-white/10" : "bg-slate-300")}></div>
              <span className={cn("text-xs font-bold", isDarkMode ? "text-slate-500" : "text-slate-400")}>
                {new Date(a.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h3 className="text-3xl font-black tracking-tight mb-4">{a.title}</h3>
            <p className={cn("text-lg leading-relaxed", isDarkMode ? "text-slate-400" : "text-slate-600")}>{a.content}</p>
            <div className="mt-8 pt-8 border-t border-dashed border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-[10px] font-black">SC</div>
                <span className={cn("text-xs font-black uppercase tracking-widest", isDarkMode ? "text-slate-500" : "text-slate-400")}>Official Administration</span>
              </div>
              {user.role === 'admin' && (
                <button 
                  onClick={() => handleDelete(a.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                  title="Delete Announcement"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

const StudentsView = ({ users, isDarkMode, currentUser, courses = [] }: { users: UserData[], isDarkMode: boolean, currentUser: UserData, courses?: any[] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Faculty filtering: only students in their assigned courses
  const facultyCourseIds = courses.filter(c => c.instructor === currentUser.id).map(c => c.id);
  const students = users.filter(u => {
    if (u.role !== 'student') return false;
    if (currentUser.role === 'faculty') {
      return (u.schedule || []).some((s: any) => facultyCourseIds.includes(s.subject));
    }
    return true;
  });

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.course && s.course.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tighter">Student Directory</h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Search and view student profiles.</p>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text"
          placeholder="Search by name, ID, or course..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={cn(
            "w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all",
            isDarkMode ? "bg-white/5 border-white/10 focus:border-red-600/50" : "bg-white border-slate-200 focus:border-red-600"
          )}
        />
      </div>

      <div className={cn(
        "rounded-[2.5rem] border overflow-hidden transition-all",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={isDarkMode ? "bg-white/5" : "bg-slate-50"}>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Course & Year</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", isDarkMode ? "divide-white/5" : "divide-slate-100")}>
              {filteredStudents.map(s => (
                <tr key={s.id} className={cn("transition-colors", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50")}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center font-black text-red-500 text-xl overflow-hidden">
                        {s.profilePic ? (
                          <img src={s.profilePic} alt={s.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          s.name[0]
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{s.name} {s.surname}</p>
                        <p className={cn("text-xs font-mono", isDarkMode ? "text-red-400" : "text-red-600")}>{s.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold">{s.course}</p>
                    <p className="text-xs text-slate-400">{s.yearLevel}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      s.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    )}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-slate-400">
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

const RolesView = ({ isDarkMode }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    <header>
      <h1 className="text-4xl font-black tracking-tighter uppercase">Roles & Permissions</h1>
      <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Manage system access levels and user permissions.</p>
    </header>
    <div className={cn("p-12 rounded-[3rem] border text-center", isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm")}>
      <ShieldCheck className="w-16 h-16 text-red-600 mx-auto mb-6" />
      <h3 className="text-2xl font-black mb-2">Access Control Management</h3>
      <p className="text-slate-500 max-w-md mx-auto">This module allows administrators to define and assign roles to users, controlling their access to various system features.</p>
    </div>
  </motion.div>
);

const TransactionsView = ({ user, isDarkMode, transactions, fetchTransactions }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const downloadReceipt = (t: any) => {
    const content = `
==========================================
        OFFICIAL ACADEMIC RECEIPT
==========================================
Transaction ID: ${t.id}
Date: ${new Date(t.timestamp).toLocaleString()}
Student Name: ${t.userName}
Student ID: ${t.userId}

Description: ${t.details || 'Tuition Payment'}
Payment Method: ${t.method}
Amount Settled: ₱${t.amount?.toLocaleString()}

------------------------------------------
PREVIOUS BALANCE: ₱${(t.prevBalance || 0).toLocaleString()}
REMAINING LIABILITY: ₱${(t.updatedBalance || 0).toLocaleString()}
------------------------------------------

This is a system-generated document for 
educational purposes only. No real 
currency was exchanged.
==========================================
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${t.id.slice(0, 8)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      fetchTransactions();
    }
  }, []);

  const filteredTransactions = (transactions || []).filter(t => {
    const matchesSearch = t.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.userId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || t.timestamp?.startsWith(dateFilter);
    const matchesType = typeFilter === 'all' || (t.type || '').toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesDate && matchesType;
  });

  const exportToCSV = () => {
    const headers = ["Date", "User ID", "User Name", "Type", "Method", "Amount", "Prev Balance", "New Balance"];
    const rows = filteredTransactions.map(t => [
      new Date(t.timestamp).toLocaleString(),
      t.userId,
      t.userName,
      t.type,
      t.method,
      t.amount,
      t.prevBalance || 'N/A',
      t.updatedBalance || 'N/A'
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Transactions_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none mb-4">Financial Dashboard</h1>
          <p className={cn("text-lg font-medium font-sans", isDarkMode ? "text-slate-400" : "text-slate-500")}>Detailed ledger of educational funding and tuition disbursements.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          {user.role === 'admin' && (
            <button 
              onClick={exportToCSV}
              className="flex-1 md:flex-none px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-slate-800 transition-all"
            >
              <Download className="w-4 h-4" />
              Export Records
            </button>
          )}
          <button 
            onClick={fetchTransactions}
            className="p-4 bg-red-600 text-white rounded-2xl hover:bg-red-500 transition-all shadow-xl shadow-red-600/20"
          >
            <TrendingUp className="w-6 h-6" />
          </button>
        </div>
      </header>

      {(user.role === 'admin' || user.role === 'student') && (
        <div className={cn(
          "p-8 rounded-[2.5rem] border flex flex-col md:flex-row gap-6",
          isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
        )}>
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder={user.role === 'admin' ? "Search student by name or ID..." : "Filter your history..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "w-full pl-14 pr-6 py-4 rounded-2xl font-bold border-none outline-none",
                isDarkMode ? "bg-white/5 text-white" : "bg-white text-slate-900"
              )}
            />
          </div>
          <div className="flex-1">
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={cn(
                "w-full px-6 py-4 rounded-2xl font-bold border-none outline-none",
                isDarkMode ? "bg-white/5 text-white" : "bg-white text-slate-900"
              )}
            />
          </div>
          <div className="flex-1">
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={cn(
                "w-full px-6 py-4 rounded-2xl font-bold border-none outline-none appearance-none",
                isDarkMode ? "bg-white/5 text-white" : "bg-white text-slate-900"
              )}
            >
              <option value="all">Every Transaction Nature</option>
              <option value="Payment">Tuition Payments</option>
              <option value="Aid">Aid Disbursements</option>
              <option value="Charge">System Charges (Enrollment)</option>
            </select>
          </div>
        </div>
      )}

      <div className={cn(
        "rounded-[3rem] border overflow-hidden transition-all",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-xl"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={isDarkMode ? "bg-white/5 text-slate-400" : "bg-slate-50 text-slate-500"}>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Transaction Metadata</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Nature of Charge</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Balance Delta</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right">Settled Amount</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", isDarkMode ? "divide-white/5" : "divide-slate-100")}>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Clock className="w-10 h-10 animate-spin text-red-600" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Ledgers...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length > 0 ? filteredTransactions.map((t, i) => (
                <tr key={i} className={cn("group transition-colors", isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-slate-50")}>
                  <td className="px-8 py-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.id?.slice(-8) || 'SIM-LOG'}</p>
                    <p className="font-black text-lg tracking-tight mb-1">{t.userName}</p>
                    <p className="text-xs font-bold text-slate-500 italic font-sans">{new Date(t.timestamp).toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex flex-col gap-2">
                      <span className={cn(
                        "w-fit px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                        t.type.includes('Payment') 
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" 
                          : "bg-blue-500/10 text-blue-500 border-blue-500/10"
                      )}>
                        {t.type}
                      </span>
                      <p className="text-xs font-medium text-slate-400 max-w-[300px] truncate group-hover:whitespace-normal transition-all">{t.details || 'System synchronization'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-slate-500 flex items-center gap-2 font-mono">
                        <TrendingDown className="w-3 h-3" />
                        ₱{(t.prevBalance || 0).toLocaleString()} <span className="text-slate-300">→</span> ₱{(t.updatedBalance || 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                        Liability State
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <div className="flex flex-col items-end gap-2">
                       <p className="text-3xl font-black tracking-tighter">₱{t.amount?.toLocaleString()}</p>
                       <div className="flex items-center gap-3">
                         <p className="text-[10px] font-black text-red-600 uppercase tracking-widest font-sans">{t.method}</p>
                         {user.role === 'student' && (
                           <button 
                             onClick={() => downloadReceipt(t)}
                             className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-600 transition-all"
                             title="Download Receipt"
                           >
                             <Download className="w-4 h-4" />
                           </button>
                         )}
                       </div>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold italic">No transaction history found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

const EnrollmentView = ({ isDarkMode, users, courses, fetchUsers, fetchCourses, logActivity }: { isDarkMode: boolean, users: UserData[], courses: any[], fetchUsers: () => void, fetchCourses: () => void, logActivity: any }) => {
  const [selectedStudent, setSelectedStudent] = useState<UserData | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const students = users.filter(u => u.role === 'student');
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedCourse) {
      alert('Please select both a student and a course.');
      return;
    }

    setIsProcessing(true);
    
    const newScheduleEntry = {
      subject: selectedCourse.id,
      instructor: selectedCourse.instructor || 'Staff',
      day: selectedCourse.day,
      time: selectedCourse.time,
      location: selectedCourse.location
    };

    // Check if already in schedule
    const alreadyEnrolled = (selectedStudent.schedule || []).some((s: any) => s.subject === selectedCourse.id);
    if (alreadyEnrolled) {
      alert('Student is already enrolled in this subject.');
      setIsProcessing(false);
      return;
    }

    const updatedSchedule = [...(selectedStudent.schedule || []), newScheduleEntry];
    const coursePrice = Number(selectedCourse.price) || 0;
    const newBalance = (selectedStudent.balance || 0) + coursePrice;
    
    const { error } = await supabase
      .from('users')
      .update({ 
        schedule: updatedSchedule,
        balance: newBalance
      })
      .eq('id', selectedStudent.id);
    
    if (!error) {
      logActivity('ENROLLMENT', `Student ${selectedStudent.id} enrolled in ${selectedCourse.id}`, 'Successful');
      // Create transaction record
      const prevBal = selectedStudent.balance || 0;
      const amountToCharge = coursePrice;
      const finalBal = newBalance;

      await supabase.from('transactions').insert({
        userId: selectedStudent.id,
        userName: `${selectedStudent.name} ${selectedStudent.surname}`,
        type: 'Tuition Fee',
        amount: amountToCharge,
        method: 'AUTOMATIC SYSTEM CHARGE',
        status: 'Successful',
        timestamp: new Date().toISOString(),
        prevBalance: prevBal,
        updatedBalance: finalBal,
        details: `Enrollment into ${selectedCourse.id}: ${selectedCourse.name}`
      });

      // Update course student count
      await supabase
        .from('courses')
        .update({ students: (selectedCourse.students || 0) + 1 })
        .eq('id', selectedCourse.id);

      fetchUsers();
      fetchCourses();
      
      alert(`Successfully enrolled ${selectedStudent.name} in ${selectedCourse.id}. Fee of ₱${coursePrice.toLocaleString()} added to balance.`);
      setSelectedCourse(null);
    } else {
      alert('Error enrolling student: ' + error.message);
    }
    setIsProcessing(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tighter uppercase">Course Enrollment</h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Manage student enrollments and course assignments.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Student Selection */}
        <div className={cn("p-8 rounded-[2.5rem] border flex flex-col gap-6", isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm")}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">1. Select Student</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={cn("pl-10 pr-4 py-2 rounded-xl text-xs font-bold outline-none border", isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}
              />
            </div>
          </div>
          
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredStudents.map(student => {
              const isAlreadyEnrolled = selectedCourse && (student.schedule || []).some((s: any) => s.subject === selectedCourse.id);
              return (
                <button 
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={cn(
                    "w-full p-4 rounded-2xl border flex items-center justify-between transition-all",
                    selectedStudent?.id === student.id 
                      ? "bg-red-600 border-red-600 text-white" 
                      : isDarkMode ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold", selectedStudent?.id === student.id ? "bg-white/20" : "bg-red-600 text-white")}>
                      {student.name[0]}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm flex items-center gap-2">
                        {student.name}
                        {isAlreadyEnrolled && (
                          <span className="px-2 py-0.5 bg-amber-500 text-white text-[8px] font-black uppercase rounded-lg">Enrolled</span>
                        )}
                      </p>
                      <p className={cn("text-[10px] uppercase tracking-widest", selectedStudent?.id === student.id ? "text-white/60" : "text-slate-400")}>{student.id}</p>
                    </div>
                  </div>
                  {selectedStudent?.id === student.id && <CheckCircle className="w-5 h-5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Course Selection */}
        <div className={cn("p-8 rounded-[2.5rem] border flex flex-col gap-6", isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm")}>
          <h3 className="text-xl font-bold">2. Select Course</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {courses.map(course => (
              <button 
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={cn(
                  "w-full p-4 rounded-2xl border flex items-center justify-between transition-all",
                  selectedCourse?.id === course.id 
                    ? "bg-slate-900 border-slate-900 text-white" 
                    : isDarkMode ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold", selectedCourse?.id === course.id ? "bg-white/20" : "bg-slate-900 text-white")}>
                    <Book className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm">{course.name}</p>
                    <p className={cn("text-[10px] uppercase tracking-widest", selectedCourse?.id === course.id ? "text-white/60" : "text-slate-400")}>{course.id} • {course.schedule}</p>
                  </div>
                </div>
                {selectedCourse?.id === course.id && <CheckCircle className="w-5 h-5" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary & Action */}
      <div className={cn("p-8 rounded-[2.5rem] border flex flex-col md:flex-row items-center justify-between gap-6", isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm")}>
        <div className="flex items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Student</p>
            <p className="font-bold">{selectedStudent ? selectedStudent.name : 'Not selected'}</p>
          </div>
          <div className="w-px h-10 bg-slate-100 dark:bg-white/5 hidden md:block" />
          <div className="text-center md:text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Course</p>
            <p className="font-bold">{selectedCourse ? `${selectedCourse.name} (${(selectedCourse.instructor || '').replace('FAC-', '')})` : 'Not selected'}</p>
          </div>
        </div>
        <button 
          disabled={!selectedStudent || !selectedCourse || isProcessing}
          onClick={handleEnroll}
          className={cn(
            "px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center gap-2",
            (!selectedStudent || !selectedCourse || isProcessing)
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-500"
          )}
        >
          {isProcessing ? 'Processing...' : 'Confirm Enrollment'}
          <UserPlus className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

const GradesMgmtView = ({ users, isDarkMode, fetchUsers, initialFilter }: { users: UserData[], isDarkMode: boolean, fetchUsers: () => void, initialFilter?: string }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<UserData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGradeIndex, setEditingGradeIndex] = useState<number | null>(null);
  const [gradeForm, setGradeForm] = useState({ 
    subject: initialFilter || '', 
    instructor: '', 
    prelim: '',
    midterm: '',
    prefinal: '',
    finals: '',
    semester: '1st Semester',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (initialFilter) {
      setGradeForm(prev => ({ ...prev, subject: initialFilter }));
    }
  }, [initialFilter]);

  const students = users.filter(u => u.role === 'student');
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.grades || []).some((g: any) => g.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSaveGrade = async () => {
    if (!selectedStudent) return;
    
    let updatedGrades = [...(selectedStudent.grades || [])];
    if (editingGradeIndex !== null) {
      updatedGrades[editingGradeIndex] = gradeForm;
    } else {
      updatedGrades.push(gradeForm);
    }

    const { error } = await supabase
      .from('users')
      .update({ grades: updatedGrades })
      .eq('id', selectedStudent.id);
    
    if (!error) {
      fetchUsers();
      setShowEditModal(false);
      setEditingGradeIndex(null);
      setGradeForm({ subject: '', instructor: '', grade: '', semester: '1st Semester 2024-2025' });
      // Update local selected student to reflect changes
      const updatedStudent = { ...selectedStudent, grades: updatedGrades };
      setSelectedStudent(updatedStudent);
    } else {
      alert('Error saving grade: ' + error.message);
    }
  };

  const handleDeleteGrade = async (index: number) => {
    if (!selectedStudent || !confirm('Are you sure you want to delete this grade?')) return;

    const updatedGrades = (selectedStudent.grades || []).filter((_, i) => i !== index);
    const { error } = await supabase
      .from('users')
      .update({ grades: updatedGrades })
      .eq('id', selectedStudent.id);
    
    if (!error) {
      fetchUsers();
      const updatedStudent = { ...selectedStudent, grades: updatedGrades };
      setSelectedStudent(updatedStudent);
    } else {
      alert('Error deleting grade: ' + error.message);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tighter uppercase">Grades Management</h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>View and manage all student academic records.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all",
                isDarkMode ? "bg-white/5 border-white/10 focus:border-red-600/50" : "bg-white border-slate-200 focus:border-red-600"
              )}
            />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredStudents.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                className={cn(
                  "w-full p-4 rounded-2xl border flex items-center gap-4 transition-all text-left",
                  selectedStudent?.id === s.id 
                    ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20" 
                    : isDarkMode ? "bg-[#111111] border-white/5 hover:bg-white/5" : "bg-white border-slate-200 hover:bg-slate-50 shadow-sm"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
                  selectedStudent?.id === s.id ? "bg-white/20" : "bg-red-600 text-white"
                )}>
                  {s.name[0]}
                </div>
                <div>
                  <p className="font-bold leading-tight">{s.name} {s.surname}</p>
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    selectedStudent?.id === s.id ? "text-white/60" : "text-slate-400"
                  )}>{s.id}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Grades Detail */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className={cn(
              "p-8 rounded-[2.5rem] border",
              isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
            )}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter">Academic Record</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedStudent.name} {selectedStudent.surname}</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingGradeIndex(null);
                    setGradeForm({ subject: '', instructor: '', grade: '', semester: '1st Semester 2024-2025' });
                    setShowEditModal(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-600/20 hover:bg-red-500 transition-all flex items-center gap-2"
                >
                  <Plus className="w-3 h-3" />
                  Add Grade
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-100 dark:border-white/5">
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Instructor</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Semester</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Prelim</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Midterm</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Prefinal</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Finals</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {(selectedStudent.grades || []).map((g: any, i: number) => (
                      <tr key={i} className="group">
                        <td className="py-4 font-bold text-sm">{g.subject}</td>
                        <td className="py-4 text-sm text-slate-500">{g.instructor?.replace('FAC-', '')}</td>
                        <td className="py-4 text-xs text-slate-400">{g.semester}</td>
                        <td className="py-4 text-center">
                          <span className={cn(
                            "px-3 py-1 rounded-lg font-black text-[10px]",
                            parseFloat(g.prelim) <= 3.0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                          )}>
                            {g.prelim || '-'}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span className={cn(
                            "px-3 py-1 rounded-lg font-black text-[10px]",
                            parseFloat(g.midterm) <= 3.0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                          )}>
                            {g.midterm || '-'}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span className={cn(
                            "px-3 py-1 rounded-lg font-black text-[10px]",
                            parseFloat(g.prefinal) <= 3.0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                          )}>
                            {g.prefinal || '-'}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span className={cn(
                            "px-3 py-1 rounded-lg font-black text-[10px]",
                            parseFloat(g.finals) <= 3.0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                          )}>
                            {g.finals || '-'}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => {
                                setEditingGradeIndex(i);
                                setGradeForm(g);
                                setShowEditModal(true);
                              }}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-red-600"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteGrade(i)}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(selectedStudent.grades || []).length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-bold italic">
                          No grades recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className={cn(
              "h-full min-h-[400px] flex flex-col items-center justify-center p-8 rounded-[2.5rem] border border-dashed",
              isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
            )}>
              <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-4">
                <ClipboardList className="w-8 h-8" />
              </div>
              <p className="text-slate-400 font-bold italic">Select a student to view and manage grades</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#111111] rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-white/5">
              <h3 className="text-2xl font-black mb-6 text-slate-900 dark:text-white">{editingGradeIndex !== null ? 'Edit Grade' : 'Add New Grade'}</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructor</label>
                    <select 
                      value={gradeForm.instructor}
                      onChange={e => setGradeForm({...gradeForm, instructor: e.target.value})}
                      className={cn("w-full p-4 rounded-2xl border outline-none font-bold", isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900")}
                    >
                      <option value="">Select Faculty</option>
                      {Array.from(new Map(
                        users
                          .filter(u => u.role === 'faculty' && u.name && u.surname)
                          .sort((a, b) => b.id.length - a.id.length)
                          .map(f => [`${f.name} ${f.surname}`.toLowerCase(), f])
                      ).values()).map(f => (
                        <option key={f.id} value={f.id}>{f.name} {f.surname}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</label>
                    <input 
                      type="text"
                      value={gradeForm.subject || ''}
                      onChange={e => setGradeForm({...gradeForm, subject: e.target.value})}
                      className={cn("w-full p-4 rounded-2xl border outline-none font-bold", isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900")}
                      placeholder="e.g. IT101"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prelim</label>
                    <input 
                      type="text"
                      value={gradeForm.prelim || ''}
                      onChange={e => setGradeForm({...gradeForm, prelim: e.target.value})}
                      className={cn("w-full p-4 rounded-2xl border outline-none font-bold", isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900")}
                      placeholder="e.g. 1.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Midterm</label>
                    <input 
                      type="text"
                      value={gradeForm.midterm || ''}
                      onChange={e => setGradeForm({...gradeForm, midterm: e.target.value})}
                      className={cn("w-full p-4 rounded-2xl border outline-none font-bold", isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900")}
                      placeholder="e.g. 1.0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pre-final</label>
                    <input 
                      type="text"
                      value={gradeForm.prefinal || ''}
                      onChange={e => setGradeForm({...gradeForm, prefinal: e.target.value})}
                      className={cn("w-full p-4 rounded-2xl border outline-none font-bold", isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900")}
                      placeholder="e.g. 1.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Finals</label>
                    <input 
                      type="text"
                      value={gradeForm.finals || ''}
                      onChange={e => setGradeForm({...gradeForm, finals: e.target.value})}
                      className={cn("w-full p-4 rounded-2xl border outline-none font-bold", isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900")}
                      placeholder="e.g. 1.0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                  <input 
                    type="date"
                    value={gradeForm.date}
                    onChange={e => setGradeForm({...gradeForm, date: e.target.value})}
                    className={cn("w-full p-4 rounded-2xl border outline-none font-bold", isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900")}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowEditModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl font-bold text-slate-600 dark:text-slate-300">Cancel</button>
                  <button onClick={handleSaveGrade} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black">Save Grade</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

function AdminPanel({ users, fetchUsers, isDarkMode, setConfirmConfig }: { users: UserData[], fetchUsers: any, isDarkMode?: boolean, setConfirmConfig: any }) {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', surname: '', role: 'student' as Role, password: 'password', securityQuestion: 'What is your favorite color?', securityAnswer: 'blue' });
  const [activeTab, setActiveTab] = useState<'users' | 'approvals' | 'resets' | 'logs'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [resetRequests, setResetRequests] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [approveReset, setApproveReset] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (activeTab === 'resets') {
      fetchResetRequests();
    } else if (activeTab === 'logs') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const handleApproveUser = async (userId: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId);
    
    if (!error) {
      await supabase.from('audit_logs').insert({
        userId: 'ADMIN',
        action: 'USER_APPROVAL',
        details: `${status.toUpperCase()} user ${userId}`,
        timestamp: new Date().toISOString()
      });
      fetchUsers();
    }
  };

  const fetchResetRequests = async () => {
    const { data, error } = await supabase
      .from('reset_requests')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (!error && data) {
      setResetRequests(data);
    }
  };

  const fetchAuditLogs = async () => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (!error && data) {
      setAuditLogs(data);
    }
  };

  const handleApproveReset = async () => {
    if (!newPassword || !approveReset) return;

    const { error } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', approveReset.schoolId);

    if (!error) {
      await supabase.from('audit_logs').insert({
        userId: 'ADMIN',
        action: 'PASSWORD_RESET_ADMIN',
        details: `Reset password for user ${approveReset.schoolId}`,
        timestamp: new Date().toISOString()
      });
      await supabase.from('reset_requests').delete().eq('id', approveReset.id);
      setApproveReset(null);
      setNewPassword('');
      fetchResetRequests();
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    // Generate ID if not provided, enforcing role-specific formats
    let finalId = formData.id;
    if (!finalId) {
      if (formData.role === 'faculty') {
        // Enforce FAC-Firstname Surname format for Faculty
        finalId = `FAC-${formData.name} ${formData.surname}`;
      } else {
        const year = new Date().getFullYear().toString().slice(-2);
        const random = Math.floor(10000000 + Math.random() * 90000000);
        finalId = `SCC-${year}-${random}`;
      }
    } else if (formData.role === 'faculty' && !finalId.startsWith('FAC-')) {
      // Force the prefix if provided manually
      finalId = `FAC-${finalId.startsWith('FAC') ? finalId.split('-')[1] || finalId.slice(3) : finalId}`;
    }

    const { error } = await supabase
      .from('users')
      .insert({ ...formData, id: finalId, status: 'approved', balance: 0, grades: [], schedule: [] });
    
    if (!error) {
      await supabase.from('audit_logs').insert({
        userId: 'ADMIN',
        action: 'USER_CREATED',
        details: `Created ${formData.role} account: ${finalId}`,
        timestamp: new Date().toISOString()
      });
      setShowAdd(false);
      fetchUsers();
    }
  };

  const handleDelete = async (userId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Deactivate User',
      message: `Are you sure you want to deactivate user ${userId}? This action cannot be undone and will remove their access to the system.`,
      type: 'danger',
      onConfirm: async () => {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', userId);
        
        if (!error) {
          await supabase.from('audit_logs').insert({
            userId: 'ADMIN',
            action: 'USER_DELETED',
            details: `Deleted user ${userId}`,
            timestamp: new Date().toISOString()
          });
          fetchUsers();
        }
      }
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Admin Panel</h1>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Manage accounts and system requests.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('users')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold transition-all",
              activeTab === 'users' 
                ? (isDarkMode ? "bg-white text-slate-900" : "bg-slate-900 text-white")
                : (isDarkMode ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500")
            )}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('approvals')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold transition-all relative",
              activeTab === 'approvals' 
                ? (isDarkMode ? "bg-white text-slate-900" : "bg-slate-900 text-white")
                : (isDarkMode ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500")
            )}
          >
            Approvals
            {(users || []).filter(u => u.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white dark:border-[#0A0A0A]">
                {(users || []).filter(u => u.status === 'pending').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('resets')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold transition-all relative",
              activeTab === 'resets' 
                ? (isDarkMode ? "bg-white text-slate-900" : "bg-slate-900 text-white")
                : (isDarkMode ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500")
            )}
          >
            Reset Requests
            {(resetRequests || []).filter(r => r.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white dark:border-[#0A0A0A]">
                {(resetRequests || []).filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold transition-all",
              activeTab === 'logs' 
                ? (isDarkMode ? "bg-white text-slate-900" : "bg-slate-900 text-white")
                : (isDarkMode ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500")
            )}
          >
            Student Activity Log
          </button>
          <button 
            onClick={() => setShowAdd(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200"
          >
            <Plus className="w-5 h-5" />
            Add User
          </button>
        </div>
      </header>

      {(activeTab === 'users' || activeTab === 'approvals') && (
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by name, ID, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all",
              isDarkMode ? "bg-white/5 border-white/10 focus:border-red-600/50" : "bg-white border-slate-200 focus:border-red-600"
            )}
          />
        </div>
      )}

      {activeTab === 'users' ? (
        <div className={cn(
          "rounded-[2.5rem] border overflow-hidden transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={isDarkMode ? "bg-white/5" : "bg-slate-50"}>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", isDarkMode ? "divide-white/5" : "divide-slate-100")}>
                {(users || []).filter(u => 
                  u.status !== 'pending' && 
                  (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   u.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   (u.course && u.course.toLowerCase().includes(searchTerm.toLowerCase())))
                ).map(u => (
                  <tr key={u.id} className={cn("transition-colors", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50")}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center font-black text-red-500 text-xl overflow-hidden">
                          {u.profilePic ? (
                            <img src={u.profilePic} alt={u.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            u.name?.[0] || '?'
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-lg">{u.name}</p>
                            {u.course && (
                              <div className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md text-[8px] font-black uppercase tracking-tighter">
                                Enrolled
                              </div>
                            )}
                          </div>
                          <p className={cn("text-xs font-mono", isDarkMode ? "text-red-400" : "text-red-600")}>{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        u.role === 'admin' ? "bg-red-500/10 text-red-500" : u.role === 'faculty' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                      )}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        u.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {u.status || 'approved'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id)} 
                          className="p-3 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'approvals' ? (
        <div className={cn(
          "rounded-[2.5rem] border overflow-hidden transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={isDarkMode ? "bg-white/5" : "bg-slate-50"}>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", isDarkMode ? "divide-white/5" : "divide-slate-100")}>
                {(users || []).filter(u => 
                  u.status === 'pending' && 
                  (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   u.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   (u.course && u.course.toLowerCase().includes(searchTerm.toLowerCase())))
                ).map(u => (
                  <tr key={u.id} className={cn("transition-colors", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50")}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center font-black text-red-500 text-xl overflow-hidden">
                          {u.name?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-lg">{u.name || 'Unknown'}</p>
                          <p className={cn("text-xs font-mono", isDarkMode ? "text-red-400" : "text-red-600")}>{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        u.role === 'admin' ? "bg-red-500/10 text-red-500" : u.role === 'faculty' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                      )}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => handleApproveUser(u.id, 'rejected')}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleApproveUser(u.id, 'approved')}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                        >
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(users || []).filter(u => u.status === 'pending').length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center text-slate-400">
                      No pending registrations.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'resets' ? (
        <div className={cn(
          "rounded-[2.5rem] border overflow-hidden transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={isDarkMode ? "bg-white/5" : "bg-slate-50"}>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Date Requested</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", isDarkMode ? "divide-white/5" : "divide-slate-100")}>
                {(resetRequests || []).map(r => (
                  <tr key={r.id} className={cn("transition-colors", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50")}>
                    <td className="px-8 py-6">
                      <p className="font-bold">{r.name}</p>
                      <p className="text-xs text-slate-400">{r.schoolId}</p>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-400">
                      {r.date ? new Date(r.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        r.status === 'pending' ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                      )}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {r.status === 'pending' && (
                        <button 
                          onClick={() => setApproveReset(r)}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all"
                        >
                          Reset Password
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {(resetRequests || []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400">
                      No reset requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={cn(
          "rounded-[2.5rem] border overflow-hidden transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={isDarkMode ? "bg-white/5" : "bg-slate-50"}>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">User ID</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Details</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", isDarkMode ? "divide-white/5" : "divide-slate-100")}>
                {(auditLogs || []).map(log => (
                  <tr key={log.id} className={cn("transition-colors", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50")}>
                    <td className="px-8 py-6 text-xs font-mono text-slate-400">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-8 py-6 font-bold text-sm">
                      {log.userId}
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest",
                        log.action === 'LOGIN' ? "bg-blue-500/10 text-blue-500" :
                        log.action === 'REGISTER' ? "bg-emerald-500/10 text-emerald-500" :
                        log.action === 'PASSWORD_RESET' ? "bg-red-500/10 text-red-500" :
                        "bg-slate-500/10 text-slate-500"
                      )}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-xs text-slate-500">
                      {log.details}
                    </td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400">
                      No audit logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={cn(
            "p-10 rounded-[3rem] w-full max-w-md shadow-2xl border",
            isDarkMode ? "bg-[#111111] border-white/10 text-white" : "bg-white border-slate-200"
          )}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Create Account</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ID Number</label>
                  <input 
                    value={formData.id || ''} 
                    onChange={e => setFormData({...formData, id: e.target.value})} 
                    className={cn(
                      "w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all text-slate-900 dark:text-white",
                      isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                    )}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Role</label>
                  <select 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value as Role})} 
                    className={cn(
                      "w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all text-slate-900 dark:text-white",
                      isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                    )}
                  >
                    <option value="student" className="bg-white dark:bg-[#111111] text-slate-900 dark:text-white">Student</option>
                    <option value="faculty" className="bg-white dark:bg-[#111111] text-slate-900 dark:text-white">Faculty</option>
                    <option value="admin" className="bg-white dark:bg-[#111111] text-slate-900 dark:text-white">Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">First Name</label>
                <input 
                  value={formData.name || ''} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className={cn(
                    "w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all text-slate-900 dark:text-white",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                  required 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Surname</label>
                <input 
                  value={formData.surname || ''} 
                  onChange={e => setFormData({...formData, surname: e.target.value})} 
                  className={cn(
                    "w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all text-slate-900 dark:text-white",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                  required 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 font-black text-slate-500 hover:text-red-600 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all">Create User</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {approveReset && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={cn(
            "p-10 rounded-[3rem] w-full max-w-md shadow-2xl border",
            isDarkMode ? "bg-[#111111] border-white/10 text-white" : "bg-white border-slate-200"
          )}>
            <h2 className="text-3xl font-black tracking-tighter mb-4 text-slate-900 dark:text-white">Reset Password</h2>
            <p className={cn("mb-8", isDarkMode ? "text-slate-400" : "text-slate-500")}>
              Enter a new password for <span className="font-bold text-emerald-500">{approveReset.name}</span>.
            </p>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                <input 
                  type="password"
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  className={cn(
                    "w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-slate-900 dark:text-white",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { setApproveReset(null); setNewPassword(''); }}
                  className={cn(
                    "py-4 rounded-2xl font-bold transition-all",
                    isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-100 hover:bg-slate-200"
                  )}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleApproveReset}
                  className="py-4 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all"
                >
                  Approve Reset
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

const ScholarshipsView = ({ scholarships, user, isDarkMode, fetchScholarships, setView, setSelectedScholarship }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newScholarship, setNewScholarship] = useState({ 
    name: '', 
    description: '', 
    criteria: '', 
    amount: '',
    startDate: new Date().toISOString().split('T')[0] + 'T08:00',
    endDate: new Date().toISOString().split('T')[0] + 'T17:00'
  });
  const isAdmin = user.role === 'admin';

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase
          .from('scholarships')
          .update({
            ...newScholarship,
            deadline: newScholarship.endDate
          })
          .eq('id', editingId);
        
        if (!error) {
          setEditingId(null);
          setIsAdding(false);
          setNewScholarship({ 
            name: '', 
            description: '', 
            criteria: '', 
            amount: '',
            startDate: new Date().toISOString().split('T')[0] + 'T08:00',
            endDate: new Date().toISOString().split('T')[0] + 'T17:00'
          });
          fetchScholarships?.();
          alert('Aid program updated successfully!');
        } else {
          console.error('Update error:', error);
          alert('Database Error: ' + error.message);
        }
      } else {
        const { error } = await supabase
          .from('scholarships')
          .insert({
            ...newScholarship,
            deadline: newScholarship.endDate
          });
        
        if (!error) {
          setIsAdding(false);
          setNewScholarship({ 
            name: '', 
            description: '', 
            criteria: '', 
            amount: '',
            startDate: new Date().toISOString().split('T')[0] + 'T08:00',
            endDate: new Date().toISOString().split('T')[0] + 'T17:00'
          });
          fetchScholarships?.();
          alert('Aid program posted successfully!');
        } else {
          console.error('Insert error:', error);
          alert('Database Error: ' + error.message);
        }
      }
    } catch (error: any) {
      console.error('Error adding/updating scholarship:', error);
      alert('System Error: ' + error.message);
    }
  };

  const handleEdit = (s: any) => {
    setNewScholarship({
      name: s.name,
      description: s.description,
      criteria: s.criteria,
      amount: s.amount,
      startDate: s.startDate || (new Date().toISOString().split('T')[0] + 'T08:00'),
      endDate: s.endDate || (new Date().toISOString().split('T')[0] + 'T17:00')
    });
    setEditingId(s.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this program?')) {
      const { error } = await supabase.from('scholarships').delete().eq('id', id);
      if (!error) fetchScholarships?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black tracking-tighter mb-2">Scholarship Programs</h2>
          <p className="text-slate-500">Available financial assistance and academic grants.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-red-600/20"
          >
            <Plus className="w-4 h-4" />
            Post Aid Program
          </button>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "p-10 rounded-[3rem] border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto",
              isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200"
            )}
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-black tracking-tighter">{editingId ? 'Edit Program' : 'Post New Aid Program'}</h3>
              <button 
                onClick={() => { setIsAdding(false); setEditingId(null); }} 
                className={cn("p-2 rounded-full transition-colors", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-100")}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Program Name</label>
                <input
                  required
                  value={newScholarship.name || ''}
                  onChange={e => setNewScholarship({ ...newScholarship, name: e.target.value })}
                  className={cn(
                    "w-full px-6 py-4 rounded-2xl border transition-all outline-none text-slate-900 dark:text-white",
                    isDarkMode ? "bg-white/5 border-white/10 focus:border-white/20" : "bg-slate-50 border-slate-200 focus:border-slate-900"
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Amount/Grant</label>
                <input
                  required
                  value={newScholarship.amount}
                  onChange={e => setNewScholarship({ ...newScholarship, amount: e.target.value })}
                  className={cn(
                    "w-full px-6 py-4 rounded-2xl border transition-all outline-none text-slate-900 dark:text-white",
                    isDarkMode ? "bg-white/5 border-white/10 focus:border-white/20" : "bg-slate-50 border-slate-200 focus:border-slate-900"
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Description</label>
              <textarea
                required
                value={newScholarship.description || ''}
                onChange={e => setNewScholarship({ ...newScholarship, description: e.target.value })}
                className={cn(
                  "w-full px-6 py-4 rounded-2xl border transition-all outline-none min-h-[100px] text-slate-900 dark:text-white",
                  isDarkMode ? "bg-white/5 border-white/10 focus:border-white/20" : "bg-slate-50 border-slate-200 focus:border-slate-900"
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Application Starts</label>
                <input
                  required
                  type="datetime-local"
                  value={newScholarship.startDate}
                  onChange={e => setNewScholarship({ ...newScholarship, startDate: e.target.value })}
                  className={cn(
                    "w-full px-6 py-4 rounded-2xl border transition-all outline-none text-slate-900 dark:text-white",
                    isDarkMode ? "bg-white/5 border-white/10 focus:border-white/20" : "bg-slate-50 border-slate-200 focus:border-slate-900"
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Application Ends</label>
                <input
                  required
                  type="datetime-local"
                  value={newScholarship.endDate}
                  onChange={e => setNewScholarship({ ...newScholarship, endDate: e.target.value })}
                  className={cn(
                    "w-full px-6 py-4 rounded-2xl border transition-all outline-none text-slate-900 dark:text-white",
                    isDarkMode ? "bg-white/5 border-white/10 focus:border-white/20" : "bg-slate-50 border-slate-200 focus:border-slate-900"
                  )}
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => { setIsAdding(false); setEditingId(null); }}
                className="px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-105 transition-all"
              >
                {editingId ? 'Update Program' : 'Save Program'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {scholarships.map((s: any) => (
          <motion.div
            key={s.id}
            whileHover={{ y: -5 }}
            className={cn(
              "p-8 rounded-[2.5rem] border flex flex-col transition-all",
              isDarkMode ? "bg-[#111111] border-white/5 hover:border-white/10" : "bg-white border-slate-200 shadow-sm hover:shadow-xl"
            )}
          >
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-white dark:text-slate-900" />
              </div>
              <h3 className="text-xl font-black tracking-tight mb-2">{s.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-3">{s.description}</p>
            </div>
            
            <div className="mt-auto space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Active From</span>
                <span className="font-bold">{s.startDate ? new Date(s.startDate).toLocaleString() : 'Open'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Ends On</span>
                <span className="font-bold text-red-500">{s.endDate ? new Date(s.endDate).toLocaleString() : new Date(s.deadline).toLocaleString()}</span>
              </div>
              
              {isAdmin && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button 
                    onClick={() => handleEdit(s)}
                    className="py-3 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-xs uppercase tracking-widest"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(s.id)}
                    className="py-3 bg-red-600/10 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all text-xs uppercase tracking-widest"
                  >
                    Delete
                  </button>
                </div>
              )}

              {!isAdmin && user.role === 'student' && (
                <button 
                  onClick={() => {
                    const now = new Date();
                    const start = s.startDate ? new Date(s.startDate) : null;
                    const end = s.endDate ? new Date(s.endDate) : new Date(s.deadline);
                    
                    if (start && now < start) {
                      alert(`Applications open on ${start.toLocaleString()}`);
                      return;
                    }
                    if (now > end) {
                      alert('Applications for this program have closed.');
                      return;
                    }
                    
                    setSelectedScholarship(s.name);
                    setView('finance');
                  }}
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Apply Now
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const ApplicationsView = ({ financialAid, user, isDarkMode, updateFinancialAidStatus, handleUpdateFinancialAid, users = [], assignFaculty, setView, setSelectedStudentForRec, deleteFinancialAid, setSelectedApplicationForSummary, fetchFinancialAid }: any) => {
  const isAdmin = user.role === 'admin';
  const isStaff = user.role === 'staff';

  const [editingApplication, setEditingApplication] = useState<any>(null);
  const [editForm, setEditForm] = useState({ program: '', personalStatement: '', reason: '', amount: '' });

  const filteredApplications = user.role === 'student' 
    ? financialAid.filter((a: any) => a.studentId === user.id)
    : user.role === 'faculty'
    ? financialAid.filter((a: any) => a.facultyId === user.id)
    : financialAid;

  const facultyMembers = users.filter((u: any) => u.role === 'faculty');

  const startEditing = (a: any) => {
    setEditingApplication(a);
    setEditForm({
      program: a.program || '',
      personalStatement: a.personalStatement || '',
      reason: a.reason || '',
      amount: a.amount?.toString() || '0'
    });
  };

  const saveEdit = async () => {
    if (!editingApplication) return;
    await handleUpdateFinancialAid(editingApplication.id, {
      program: editForm.program,
      personalStatement: editForm.personalStatement,
      reason: editForm.reason,
      amount: parseFloat(editForm.amount) || 0
    });
    setEditingApplication(null);
    alert('Application updated successfully');
  };

  const stats = [
    { label: 'Total', value: filteredApplications.length, icon: <FileText className="w-4 h-4" />, color: 'blue' },
    { label: 'Pending', value: filteredApplications.filter((a: any) => a.status === 'pending').length, icon: <Clock className="w-4 h-4" />, color: 'amber' },
    { label: 'Approved', value: filteredApplications.filter((a: any) => a.status === 'approved').length, icon: <CheckCircle className="w-4 h-4" />, color: 'emerald' },
    { label: 'Rejected', value: filteredApplications.filter((a: any) => a.status === 'rejected').length, icon: <XCircle className="w-4 h-4" />, color: 'red' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tighter mb-2">
            {user.role === 'student' ? 'My Applications' : 'Financial Aid Dashboard'}
          </h2>
          <p className="text-slate-500">Track and manage financial aid requests. Click on a row to see the summary.</p>
        </div>
        {(isAdmin || isStaff) && (
          <button 
            onClick={() => setView('programs')}
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Manage Aid Programs
          </button>
        )}
      </div>

      {(isAdmin || isStaff) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className={cn(
              "p-6 rounded-[2rem] border transition-all",
              isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-100 shadow-sm"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center mb-3",
                stat.color === 'blue' ? "bg-blue-500/10 text-blue-500" :
                stat.color === 'amber' ? "bg-amber-500/10 text-amber-500" :
                stat.color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" :
                "bg-red-500/10 text-red-500"
              )}>
                {stat.icon}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-black">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className={cn(
        "rounded-[2.5rem] border overflow-hidden transition-all",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={isDarkMode ? "bg-white/5" : "bg-slate-50"}>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Assigned Faculty</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                {(user.role === 'admin' || user.role === 'staff' || user.role === 'faculty') && (
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className={cn("divide-y", isDarkMode ? "divide-white/5" : "divide-slate-100")}>
              {filteredApplications.map((a: any) => (
                <tr 
                  key={a.id} 
                  className={cn("transition-colors cursor-pointer group", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50")}
                  onClick={() => setSelectedApplicationForSummary(a)}
                >
                  <td className="px-8 py-6">
                    <p className="font-bold">{a.studentName}</p>
                    <p className="text-xs text-slate-400">{a.studentId}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-medium">{a.program}</span>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-400">
                    {new Date(a.date).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6" onClick={(e) => e.stopPropagation()}>
                    {(user.role === 'admin' || user.role === 'staff') ? (
                      <select
                        value={a.facultyId || ''}
                        onChange={(e) => assignFaculty(a.id, e.target.value)}
                        className={cn(
                          "text-xs font-bold p-2 rounded-xl border outline-none",
                          isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                        )}
                      >
                        <option value="">Unassigned</option>
                        {facultyMembers.map((f: any) => (
                          <option key={f.id} value={f.id}>{f.name} {f.surname}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">
                        {(() => {
                           const f = users.find((u: any) => u.id === a.facultyId);
                           return f ? `${f.name} ${f.surname}` : 'Unassigned';
                        })()}
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      a.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                      a.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" :
                      "bg-red-500/10 text-red-500"
                    )}>
                      {a.status}
                    </span>
                  </td>
                  {(user.role === 'admin' || user.role === 'staff' || user.role === 'faculty') && (
                    <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2 text-right">
                        {user.role === 'faculty' && a.facultyId === user.id && (
                          <button
                            onClick={() => {
                              setSelectedStudentForRec({ id: a.studentId, name: a.studentName });
                              setView('dashboard');
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" /> Recommend
                          </button>
                        )}
                        {(user.role === 'admin' || user.role === 'staff') && (
                          <div className="flex gap-2">
                            {a.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateFinancialAidStatus(a.id, 'approved')}
                                  className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => updateFinancialAidStatus(a.id, 'rejected')}
                                  className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => startEditing(a)}
                              className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                              title="Edit Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteFinancialAid(a.id)}
                              className="p-2 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-red-600 rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredApplications.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold italic">
                    No applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingApplication && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl overflow-hidden flex flex-col",
              isDarkMode ? "bg-[#111111] border border-white/5 text-white" : "bg-white border border-slate-200"
            )}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black tracking-tighter">Edit Application</h2>
              <button onClick={() => setEditingApplication(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-6 overflow-y-auto max-h-[60vh] px-1 custom-scrollbar">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Aid Program</label>
                <input 
                  type="text" 
                  value={editForm.program}
                  onChange={e => setEditForm({...editForm, program: e.target.value})}
                  className={cn("w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600", isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Personal Statement / Essay</label>
                <textarea 
                  value={editForm.personalStatement}
                  onChange={e => setEditForm({...editForm, personalStatement: e.target.value})}
                  className={cn("w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 h-40 resize-none", isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Justification / Funding Reason</label>
                <textarea 
                  value={editForm.reason}
                  onChange={e => setEditForm({...editForm, reason: e.target.value})}
                  className={cn("w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 h-32 resize-none", isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount (₱)</label>
                <input 
                  type="number" 
                  value={editForm.amount}
                  onChange={e => setEditForm({...editForm, amount: e.target.value})}
                  className={cn("w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600", isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}
                />
              </div>
            </div>
            <div className="pt-8 flex gap-4">
              <button onClick={() => setEditingApplication(null)} className="flex-1 py-4 font-black text-slate-500 hover:text-red-600 transition-colors">Cancel</button>
              <button onClick={saveEdit} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all">Save Changes</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

const ReportsView = ({ financialAid, scholarships, isDarkMode, user }: any) => {
  const isAdmin = user.role === 'admin';
  const isFaculty = user.role === 'faculty';

  const filteredAid = isFaculty 
    ? financialAid.filter((a: any) => a.facultyId === user.id)
    : financialAid;

  const stats = [
    { label: isAdmin ? 'Total Applications' : 'My Assigned Applications', value: filteredAid.length, icon: <FileText className="w-6 h-6" />, color: 'blue' },
    { label: isAdmin ? 'Approved Aid' : 'My Approved Reviews', value: filteredAid.filter((a: any) => a.status === 'approved').length, icon: <CheckCircle className="w-6 h-6" />, color: 'emerald' },
    { label: 'Active Scholarships', value: scholarships.length, icon: <Award className="w-6 h-6" />, color: 'amber' },
    { label: isAdmin ? 'Pending Reviews' : 'My Pending Reviews', value: filteredAid.filter((a: any) => a.status === 'pending').length, icon: <Clock className="w-6 h-6" />, color: 'indigo' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-4xl font-black tracking-tighter mb-2">
          {isAdmin ? 'Admin Reports & Analytics' : 'Faculty Reports & Analytics'}
        </h2>
        <p className="text-slate-500">
          {isAdmin ? 'Overview of global scholarship and financial aid performance.' : 'Overview of your assigned scholarship and financial aid reviews.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "p-8 rounded-[2.5rem] border transition-all",
              isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-4",
              stat.color === 'blue' ? "bg-blue-500/10 text-blue-500" :
              stat.color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" :
              stat.color === 'amber' ? "bg-amber-500/10 text-amber-500" :
              "bg-indigo-500/10 text-indigo-500"
            )}>
              {stat.icon}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
            <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={cn(
          "p-8 rounded-[2.5rem] border",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-xl font-black tracking-tight mb-6">Application Status Distribution</h3>
          <div className="h-[300px] flex items-end justify-around gap-4 pt-10 px-4">
            {['pending', 'approved', 'rejected'].map((status) => {
              const count = filteredAid.filter((a: any) => a.status === status).length;
              const totalCount = filteredAid.length || 1;
              const percentage = (count / totalCount) * 100;
              return (
                <div key={status} className="h-full flex-1 flex flex-col items-center justify-end gap-4">
                  <div className="w-full relative group flex flex-col justify-end h-full bg-slate-50 dark:bg-white/5 rounded-t-2xl overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(percentage, 2)}%` }}
                      className={cn(
                        "w-full rounded-t-2xl transition-all shadow-lg",
                        status === 'pending' ? "bg-amber-500 shadow-amber-500/20" :
                        status === 'approved' ? "bg-emerald-500 shadow-emerald-500/20" :
                        "bg-red-500 shadow-red-500/20"
                      )}
                    />
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black pointer-events-none z-10 bg-slate-900 text-white px-2 py-1 rounded">
                      {count} ({Math.round(percentage)}%)
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{status}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={cn(
          "p-8 rounded-[2.5rem] border",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-xl font-black tracking-tight mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {(financialAid || []).slice(0, 5).map((a: any) => (
              <div key={a.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  a.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" :
                  a.status === 'rejected' ? "bg-red-500/10 text-red-500" :
                  "bg-amber-500/10 text-amber-500"
                )}>
                  {a.status === 'approved' ? <CheckCircle className="w-5 h-5" /> : a.status === 'rejected' ? <XCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{a.studentName}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">{a.type} - {a.status}</p>
                </div>
                <span className="text-[10px] text-slate-400">{new Date(a.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ActivityView = ({ isDarkMode }: any) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (!error && data) {
      setLogs(data);
    }
    setIsLoading(false);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.userId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || log.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Transaction Logs Dashboard</h1>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Comprehensive system monitoring and accountability ledger.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "pl-10 pr-4 py-3 rounded-2xl border text-xs font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all",
                isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200"
              )}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn(
              "px-4 py-3 rounded-2xl border text-xs font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all",
              isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200"
            )}
          >
            <option value="all">All Status</option>
            <option value="successful">Successful</option>
            <option value="failed">Failed</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </header>

      <div className={cn(
        "p-8 rounded-[3rem] border overflow-hidden",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={cn(
                "border-b transition-colors",
                isDarkMode ? "border-white/5 bg-white/5 text-slate-400" : "border-slate-100 bg-slate-50 text-slate-500"
              )}>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest">Metadata</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest">User Entity</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest">Operation</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest">Status</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-right">Activity Context</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", isDarkMode ? "divide-white/5" : "divide-slate-100")}>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Clock className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-400 italic">Syncing system archives...</p>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? filteredLogs.map((log) => (
                <tr key={log.id} className={cn("group transition-colors", isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-slate-50")}>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black tracking-tight">{new Date(log.timestamp).toLocaleDateString()}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 transition-all group-hover:pl-8">
                    <p className="font-black text-sm">{log.userName || 'System User'}</p>
                    <div className="flex items-center gap-2">
                       <span className={cn(
                         "text-[9px] font-black uppercase tracking-[0.2em]",
                         log.role === 'admin' ? "text-amber-500" : log.role === 'faculty' ? "text-blue-500" : "text-emerald-500"
                       )}>
                         {log.role || 'Guest'}
                       </span>
                       <span className="w-1 h-1 rounded-full bg-slate-300" />
                       <span className="text-[9px] text-slate-400 font-mono">{log.userId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                      log.action.includes('LOGIN') ? "bg-blue-600/10 text-blue-600 border-blue-600/10" :
                      log.action.includes('PAYMENT') || log.action.includes('ENROLL') ? "bg-emerald-600/10 text-emerald-600 border-emerald-600/10" :
                      log.action.includes('DELETE') ? "bg-red-600/10 text-red-600 border-red-600/10" :
                      "bg-slate-600/10 text-slate-600 border-slate-600/10"
                    )}>
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        log.status === 'Successful' ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" :
                        log.status === 'Failed' ? "bg-red-500 shadow-lg shadow-red-500/20" : "bg-amber-500 shadow-lg shadow-amber-500/20"
                      )} />
                      <span className="text-xs font-bold text-slate-500">{log.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-sm text-slate-500 text-right font-medium max-w-[300px] italic">
                    {log.details}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-bold italic">
                    No matching activity logs recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

const RecommendationsView = ({ recommendations, user, isDarkMode, fetchRecommendations, users = [] }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newRec, setNewRec] = useState({
    studentName: '',
    studentId: '',
    content: ''
  });

  const students = users.filter((u: any) => u.role === 'student');

  const handleStudentSelect = (studentName: string) => {
    const selectedStudent = students.find((s: any) => s.name === studentName);
    if (selectedStudent) {
      setNewRec({ ...newRec, studentName, studentId: selectedStudent.id });
    } else {
      setNewRec({ ...newRec, studentName, studentId: '' });
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('recommendations')
        .insert({ 
          ...newRec, 
          facultyId: user.id, 
          facultyName: user.name,
          date: new Date().toISOString()
        });
      
      if (!error) {
        setIsAdding(false);
        setNewRec({ studentName: '', studentId: '', content: '' });
        fetchRecommendations?.();
      }
    } catch (error) {
      console.error('Error adding recommendation:', error);
    }
  };

  const filteredRecs = user.role === 'faculty' 
    ? recommendations.filter((r: any) => r.facultyId === user.id)
    : recommendations;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black tracking-tighter mb-2">Faculty Recommendations</h2>
          <p className="text-slate-500">Manage and submit student scholarship recommendations.</p>
        </div>
        {user.role === 'faculty' && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            New Recommendation
          </button>
        )}
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "p-8 rounded-[2.5rem] border",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-xl"
          )}
        >
          <form onSubmit={handleAdd} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Student Name</label>
                <select
                  required
                  value={newRec.studentName}
                  onChange={e => handleStudentSelect(e.target.value)}
                  className={cn(
                    "w-full px-6 py-4 rounded-2xl border transition-all outline-none font-bold",
                    isDarkMode ? "bg-white/5 border-white/10 focus:border-white/20" : "bg-slate-50 border-slate-200 focus:border-slate-900"
                  )}
                >
                  <option value="">Select Student</option>
                  {students.map((s: any) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Student ID</label>
                <input
                  required
                  value={newRec.studentId}
                  readOnly
                  className={cn(
                    "w-full px-6 py-4 rounded-2xl border transition-all outline-none font-bold opacity-70",
                    isDarkMode ? "bg-white/5 border-white/10 focus:border-white/20" : "bg-slate-50 border-slate-200 focus:border-slate-900"
                  )}
                  placeholder="Student ID"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Recommendation Content</label>
              <textarea
                required
                value={newRec.content}
                onChange={e => setNewRec({ ...newRec, content: e.target.value })}
                className={cn(
                  "w-full px-6 py-4 rounded-2xl border transition-all outline-none min-h-[150px]",
                  isDarkMode ? "bg-white/5 border-white/10 focus:border-white/20" : "bg-slate-50 border-slate-200 focus:border-slate-900"
                )}
                placeholder="Describe why this student deserves the scholarship..."
              />
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-105 transition-all"
              >
                Submit Recommendation
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {filteredRecs.map((r: any) => (
          <motion.div
            key={r.id}
            className={cn(
              "p-8 rounded-[2.5rem] border transition-all",
              isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
            )}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">{r.studentName}</h3>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">Student ID: {r.studentId}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">Recommended by {r.facultyName}</p>
                <p className="text-xs text-slate-400">{new Date(r.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className={cn(
              "p-6 rounded-2xl italic text-slate-500",
              isDarkMode ? "bg-white/5" : "bg-slate-50"
            )}>
              "{r.content}"
            </div>
          </motion.div>
        ))}
        {filteredRecs.length === 0 && (
          <div className="py-20 text-center text-slate-400">
            No recommendations found.
          </div>
        )}
      </div>
    </motion.div>
  );
};

const NotificationsView = ({ notifications, isDarkMode }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-4xl font-black tracking-tighter mb-2">Notifications</h2>
        <p className="text-slate-500">Stay updated with the latest activities and alerts.</p>
      </div>

      <div className="space-y-4">
        {notifications.map((n: any) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "p-6 rounded-3xl border flex items-start gap-6 transition-all",
              isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm",
              !n.read && (isDarkMode ? "border-blue-500/30 bg-blue-500/5" : "border-blue-500/30 bg-blue-50/50")
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
              n.type === 'registration' ? "bg-emerald-500/10 text-emerald-500" :
              n.type === 'message' ? "bg-blue-500/10 text-blue-500" :
              "bg-amber-500/10 text-amber-500"
            )}>
              {n.type === 'registration' ? <User className="w-6 h-6" /> :
               n.type === 'message' ? <MessageSquare className="w-6 h-6" /> :
               <Bell className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-lg">{n.title}</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {new Date(n.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-slate-500">{n.message}</p>
            </div>
            {!n.read && (
              <div className="w-3 h-3 rounded-full bg-blue-500 mt-2 shrink-0" />
            )}
          </motion.div>
        ))}
        {notifications.length === 0 && (
          <div className="py-20 text-center text-slate-400">
            No notifications yet.
          </div>
        )}
      </div>
    </motion.div>
  );
};
