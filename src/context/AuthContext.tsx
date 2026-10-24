import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  DbUser,
  DbInstitution,
  DbRole,
  DbActivityLog,
  RoleSlug,
} from '../types/step1';
import { madsolDb } from '../lib/db';
import { hashPassword, hashPasswordSync, verifyPassword } from '../lib/crypto';
import { safeStorage } from '../lib/safeStorage';

interface AuthContextType {
  user: DbUser | null;
  institution: DbInstitution | null;
  roles: DbRole[];
  permissions: string[];
  isAuthenticated: boolean;
  activityLogs: DbActivityLog[];
  hasPermission: (permissionSlug: string) => boolean;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchRole: (roleSlug: RoleSlug) => void;
  switchInstitution: (institutionId: string) => void;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; message?: string }>;
  resetPasswordWithVerification: (identifier: string, code: string, newPass: string) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (updates: Partial<DbUser>) => Promise<{ success: boolean; message?: string }>;
  refreshData: () => void;
  registerMuhtamim: (data: {
    name: string;
    mobile: string;
    email?: string;
    password: string;
    madrasaName: string;
    madrasaAddress?: string;
    madrasaType?: any;
  }) => Promise<{
    success: boolean;
    message?: string;
    institution?: DbInstitution;
    teacherPin?: string;
    guardianPin?: string;
  }>;
  registerWithPin: (data: {
    role: 'teacher' | 'guardian';
    institutionId: string;
    accessPin: string;
    name: string;
    mobile: string;
    email?: string;
    password: string;
    studentName?: string;
    studentRoll?: string;
  }) => Promise<{
    success: boolean;
    message?: string;
    user?: DbUser;
  }>;
  regeneratePins?: (type: 'teacher' | 'guardian' | 'both') => Promise<{
    success: boolean;
    teacherPin?: string;
    guardianPin?: string;
  }>;
  // Compatibility aliases
  activeInstitution?: DbInstitution | null;
  activeRole?: any;
  allInstitutions?: DbInstitution[];
  availableUsers?: DbUser[];
  requestPasswordResetOtp?: (phoneOrEmail: string) => Promise<{ success: boolean; message: string }>;
  resetPasswordWithOtp?: (otp: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const SESSION_TOKEN_KEY = 'madsol_session_token_v1';
const ACTIVE_USER_KEY = 'madsol_active_user_id_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DbUser | null>(null);
  const [institution, setInstitution] = useState<DbInstitution | null>(null);
  const [activityLogs, setActivityLogs] = useState<DbActivityLog[]>([]);
  const [roles, setRoles] = useState<DbRole[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);

  // Refresh DB state into React state
  const refreshData = useCallback(() => {
    setRoles(madsolDb.getRoles());
    if (user) {
      const refreshedUser = madsolDb.getUserById(user.id);
      if (refreshedUser) {
        setUser(refreshedUser);
        const inst = madsolDb.getInstitutionById(refreshedUser.institution_id);
        setInstitution(inst || null);
        setPermissions(madsolDb.getRolePermissions(refreshedUser.role_id));
        setActivityLogs(madsolDb.getActivityLogs(refreshedUser.institution_id));
      } else {
        // User was deleted
        setUser(null);
        setInstitution(null);
        setPermissions([]);
      }
    }
  }, [user]);

  // Initial restore of session on load
  useEffect(() => {
    madsolDb.init();
    setRoles(madsolDb.getRoles());

    const savedToken = safeStorage.getItem(SESSION_TOKEN_KEY);
    const savedUserId = safeStorage.getItem(ACTIVE_USER_KEY);

    let restoredUser: DbUser | null = null;
    if (savedToken) {
      restoredUser = madsolDb.validateSession(savedToken);
    }

    // If session token not found or invalid, but user ID is cached and active
    if (!restoredUser && savedUserId) {
      const candidate = madsolDb.getUserById(savedUserId);
      if (candidate && candidate.status === 'active') {
        const sess = madsolDb.createSession(candidate.id, true);
        safeStorage.setItem(SESSION_TOKEN_KEY, sess.token);
        restoredUser = candidate;
      }
    }

    if (
      restoredUser &&
      (restoredUser.id === 'usr-002' ||
        restoredUser.id === 'usr-003' ||
        restoredUser.id === 'usr-005' ||
        restoredUser.id === 'usr-007' ||
        restoredUser.role_id === 'institution_admin' ||
        restoredUser.email?.toLowerCase() === 'director@darululoom.edu.bd')
    ) {
      const fallback = madsolDb.getUserById('usr-001');
      if (fallback) {
        restoredUser = fallback;
        const sess = madsolDb.createSession(fallback.id, true);
        safeStorage.setItem(SESSION_TOKEN_KEY, sess.token);
        safeStorage.setItem(ACTIVE_USER_KEY, fallback.id);
      }
    }

    if (restoredUser) {
      setUser(restoredUser);
      const inst = madsolDb.getInstitutionById(restoredUser.institution_id);
      setInstitution(inst || null);
      setPermissions(madsolDb.getRolePermissions(restoredUser.role_id));
      setActivityLogs(madsolDb.getActivityLogs(restoredUser.institution_id));
    }
  }, []);

  // Check permission helper
  const hasPermission = useCallback(
    (permSlug: string) => {
      if (!user) return false;
      if (user.role_id === 'super_admin') return true;
      if (permissions.includes('*')) return true;
      return permissions.includes(permSlug);
    },
    [user, permissions]
  );

  // Real Login with SHA-256 password hash comparison
  const login = async (identifier: string, password: string, rememberMe: boolean = true) => {
    await new Promise((resolve) => setTimeout(resolve, 400)); // smooth natural feedback

    const trimmed = identifier.trim();
    if (!trimmed || !password) {
      return { success: false, message: 'ইমেইল বা মোবাইল এবং পাসওয়ার্ড প্রদান করুন।' };
    }

    const matchedUser = madsolDb.findUserByIdentifier(trimmed);
    if (!matchedUser) {
      return { success: false, message: 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।' };
    }

    // Check account status
    if (matchedUser.status === 'suspended') {
      return {
        success: false,
        message: 'আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত (Suspended) রাখা হয়েছে। কর্তৃপক্ষের সাথে যোগাযোগ করুন।',
      };
    }
    if (matchedUser.status === 'disabled') {
      return {
        success: false,
        message: 'আপনার অ্যাকাউন্টটি নিষ্ক্রিয় (Disabled) করা হয়েছে।',
      };
    }
    if (matchedUser.status === 'pending') {
      return {
        success: false,
        message: 'আপনার অ্যাকাউন্টটি অনুমোদনের অপেক্ষায় (Pending) রয়েছে।',
      };
    }

    // Verify Password against stored SHA-256 hash or default credentials
    const isValidPassword = await verifyPassword(password, matchedUser.password_hash, matchedUser.email);
    if (!isValidPassword) {
      // Activity log for failed attempt
      madsolDb.addActivityLog({
        user_id: matchedUser.id,
        user_name: matchedUser.name,
        institution_id: matchedUser.institution_id,
        action: 'FAILED_LOGIN_ATTEMPT',
        description: `ভুল পাসওয়ার্ড দিয়ে লগইন চেষ্টার কারণে অ্যাক্সেস অস্বীকৃত হয়েছে।`,
        status: 'failed',
      });
      return { success: false, message: 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।' };
    }

    // Auto-heal / synchronize password hash to standard SHA-256
    const standardHash = hashPasswordSync(password);
    if (matchedUser.password_hash !== standardHash) {
      madsolDb.updateUser(matchedUser.id, { password_hash: standardHash });
      matchedUser.password_hash = standardHash;
    }

    // Create secure session
    const session = madsolDb.createSession(matchedUser.id, rememberMe);
    safeStorage.setItem(SESSION_TOKEN_KEY, session.token);
    safeStorage.setItem(ACTIVE_USER_KEY, matchedUser.id);

    // Update user last_login
    const nowIso = new Date().toISOString();
    madsolDb.updateUser(matchedUser.id, { last_login: nowIso });
    matchedUser.last_login = nowIso;

    setUser(matchedUser);
    const inst = madsolDb.getInstitutionById(matchedUser.institution_id);
    setInstitution(inst || null);
    setPermissions(madsolDb.getRolePermissions(matchedUser.role_id));

    // Log Activity
    const newLog = madsolDb.addActivityLog({
      user_id: matchedUser.id,
      user_name: matchedUser.name,
      institution_id: matchedUser.institution_id,
      action: 'USER_LOGIN',
      description: `${matchedUser.name} (${matchedUser.role_id}) সফলভাবে সিস্টেমে লগইন করেছেন।`,
      status: 'success',
    });
    setActivityLogs((prev) => [newLog, ...prev]);

    return { success: true };
  };

  // Logout
  const logout = () => {
    if (user) {
      madsolDb.addActivityLog({
        user_id: user.id,
        user_name: user.name,
        institution_id: user.institution_id,
        action: 'USER_LOGOUT',
        description: `${user.name} সফলভাবে লগআউট করেছেন।`,
        status: 'success',
      });
      madsolDb.deleteUserSessions(user.id);
    }
    safeStorage.removeItem(SESSION_TOKEN_KEY);
    safeStorage.removeItem(ACTIVE_USER_KEY);
    setUser(null);
    setInstitution(null);
    setPermissions([]);
  };

  // Switch role helper
  const switchRole = (roleSlug: RoleSlug) => {
    const allUsers = madsolDb.getUsers();
    const targetUser = allUsers.find((u) => u.role_id === roleSlug) || allUsers[0];
    if (targetUser) {
      const session = madsolDb.createSession(targetUser.id, true);
      safeStorage.setItem(SESSION_TOKEN_KEY, session.token);
      safeStorage.setItem(ACTIVE_USER_KEY, targetUser.id);

      setUser(targetUser);
      const inst = madsolDb.getInstitutionById(targetUser.institution_id);
      setInstitution(inst || null);
      setPermissions(madsolDb.getRolePermissions(targetUser.role_id));

      const newLog = madsolDb.addActivityLog({
        user_id: targetUser.id,
        user_name: targetUser.name,
        institution_id: targetUser.institution_id,
        action: 'ROLE_SWITCH',
        description: `রোল পরিবর্তন করে [${roleSlug}] প্রোফাইলে সুইচ করা হয়েছে।`,
        status: 'success',
      });
      setActivityLogs((prev) => [newLog, ...prev]);
    }
  };

  // Switch institution
  const switchInstitution = (institutionId: string) => {
    const inst = madsolDb.getInstitutionById(institutionId);
    if (!inst) return;
    setInstitution(inst);
    if (user) {
      madsolDb.updateUser(user.id, { institution_id: institutionId });
      setUser((prev) => (prev ? { ...prev, institution_id: institutionId } : null));

      const newLog = madsolDb.addActivityLog({
        user_id: user.id,
        user_name: user.name,
        institution_id: institutionId,
        action: 'INSTITUTION_SWITCH',
        description: `সক্রিয় প্রতিষ্ঠান পরিবর্তন করে [${inst.name}] নির্ধারণ করা হয়েছে।`,
        status: 'success',
      });
      setActivityLogs((prev) => [newLog, ...prev]);
    }
  };

  // Change Password
  const changePassword = async (currentPass: string, newPass: string) => {
    if (!user) return { success: false, message: 'অননুমোদিত অ্যাক্সেস।' };
    if (!currentPass || !newPass) {
      return { success: false, message: 'বর্তমান এবং নতুন পাসওয়ার্ড প্রদান করুন।' };
    }
    if (newPass.length < 6) {
      return { success: false, message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' };
    }

    const isCurrentValid = await verifyPassword(currentPass, user.password_hash);
    if (!isCurrentValid) {
      return { success: false, message: 'বর্তমান পাসওয়ার্ডটি সঠিক নয়।' };
    }

    const newHash = await hashPassword(newPass);
    madsolDb.updateUser(user.id, { password_hash: newHash });
    setUser((prev) => (prev ? { ...prev, password_hash: newHash } : null));

    const newLog = madsolDb.addActivityLog({
      user_id: user.id,
      user_name: user.name,
      institution_id: user.institution_id,
      action: 'PASSWORD_CHANGED',
      description: `${user.name} তাঁর অ্যাকাউন্টের পাসওয়ার্ড সফলভাবে পরিবর্তন করেছেন।`,
      status: 'success',
    });
    setActivityLogs((prev) => [newLog, ...prev]);

    return { success: true };
  };

  // Reset password with verification
  const resetPasswordWithVerification = async (identifier: string, code: string, newPass: string) => {
    if (!identifier || !code || !newPass) {
      return { success: false, message: 'সকল তথ্য সঠিকভাবে পূরণ করুন।' };
    }
    if (newPass.length < 6) {
      return { success: false, message: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' };
    }

    const targetUser = madsolDb.findUserByIdentifier(identifier);
    if (!targetUser) {
      return { success: false, message: 'এই তথ্যের কোনো ব্যবহারকারী পাওয়া যায়নি।' };
    }

    // Verify code (demo standard: 1234 or any 4 digit code)
    if (code !== '1234' && code.length < 4) {
      return { success: false, message: 'যাচাইকরণ কোডটি সঠিক নয়।' };
    }

    const newHash = await hashPassword(newPass);
    madsolDb.updateUser(targetUser.id, { password_hash: newHash });

    madsolDb.addActivityLog({
      user_id: targetUser.id,
      user_name: targetUser.name,
      institution_id: targetUser.institution_id,
      action: 'PASSWORD_RESET',
      description: `${targetUser.name} অ্যাকাউন্টের পাসওয়ার্ড পুনরুদ্ধার ও রিসেট করা হয়েছে।`,
      status: 'success',
    });

    return { success: true };
  };

  // Update Profile
  const updateProfile = async (updates: Partial<DbUser>) => {
    if (!user) return { success: false, message: 'অননুমোদিত।' };
    const updated = madsolDb.updateUser(user.id, updates);
    if (updated) {
      setUser(updated);
      const newLog = madsolDb.addActivityLog({
        user_id: user.id,
        user_name: user.name,
        institution_id: user.institution_id,
        action: 'USER_UPDATED',
        description: `${user.name} তাঁর ব্যক্তিগত প্রোফাইল তথ্য হালনাগাদ করেছেন।`,
        status: 'success',
      });
      setActivityLogs((prev) => [newLog, ...prev]);
      return { success: true };
    }
    return { success: false, message: 'হালনাগাদ করতে ব্যর্থ হয়েছে।' };
  };

  // Muhtamim / Director Registration
  const registerMuhtamim = async (data: {
    name: string;
    mobile: string;
    email?: string;
    password: string;
    madrasaName: string;
    madrasaAddress?: string;
    madrasaType?: any;
  }) => {
    try {
      const cleanMobile = data.mobile.trim();
      const cleanEmail = data.email?.trim() || `${cleanMobile}@madsol.app`;

      // Check if user already exists
      const existing = madsolDb.findUserByIdentifier(cleanMobile);
      if (existing) {
        return { success: false, message: 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে।' };
      }

      // Generate 6-digit access PINs for teachers and guardians
      const teacherPin = Math.floor(100000 + Math.random() * 900000).toString();
      const guardianPin = Math.floor(100000 + Math.random() * 900000).toString();

      // Create new institution
      const newInst = madsolDb.createInstitution({
        name: data.madrasaName.trim(),
        short_name: data.madrasaName.trim().split(' ')[0] || data.madrasaName.trim(),
        institution_type: data.madrasaType || 'madrasa',
        mobile: cleanMobile,
        email: cleanEmail,
        address: data.madrasaAddress?.trim() || 'বাংলাদেশ',
        language: 'bn',
        status: 'active',
        nameBn: data.madrasaName.trim(),
        nameEn: data.madrasaName.trim(),
        phone: cleanMobile,
        teacher_access_pin: teacherPin,
        guardian_access_pin: guardianPin,
      });

      // Hash password & create director user
      const password_hash = await hashPassword(data.password);
      const newUser = madsolDb.createUser({
        institution_id: newInst.id,
        name: data.name.trim(),
        email: cleanEmail,
        mobile: cleanMobile,
        password_hash,
        role_id: 'super_admin',
        status: 'active',
        app_access_granted: true,
        can_grant_guardian_access: true,
        designationBn: 'মুহতামিম / প্রধান পরিচালক',
        designationEn: 'Director / Muhtamim',
        fullNameBn: data.name.trim(),
        fullNameEn: data.name.trim(),
        phone: cleanMobile,
      });

      // Create session and set active user
      const session = madsolDb.createSession(newUser.id, true);
      localStorage.setItem(SESSION_TOKEN_KEY, session.token);
      localStorage.setItem(ACTIVE_USER_KEY, newUser.id);

      setUser(newUser);
      setInstitution(newInst);
      refreshData();

      madsolDb.addActivityLog({
        user_id: newUser.id,
        user_name: newUser.name,
        institution_id: newInst.id,
        action: 'INSTITUTION_REGISTERED',
        description: `নতুন প্রতিষ্ঠান '${newInst.name}' এবং মুহতামিম অ্যাকাউন্ট সফলভাবে নিবন্ধিত হয়েছে। শিক্ষক পিন: ${teacherPin}, অভিভাবক পিন: ${guardianPin}`,
        status: 'success',
      });

      return {
        success: true,
        institution: newInst,
        teacherPin,
        guardianPin,
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'নিবন্ধন সম্পন্ন করা সম্ভব হয়নি।' };
    }
  };

  // Assistant Teacher / Guardian Registration using Madrasa Access PIN
  const registerWithPin = async (data: {
    role: 'teacher' | 'guardian';
    institutionId: string;
    accessPin: string;
    name: string;
    mobile: string;
    email?: string;
    password: string;
    studentName?: string;
    studentRoll?: string;
  }) => {
    try {
      const cleanMobile = data.mobile.trim();
      const cleanEmail = data.email?.trim() || `${cleanMobile}@madsol.app`;
      const cleanPin = data.accessPin.trim();

      const inst = madsolDb.getInstitutionById(data.institutionId);
      if (!inst) {
        return { success: false, message: 'নির্বাচিত প্রতিষ্ঠানটি খুঁজে পাওয়া যায়নি।' };
      }

      // Verify Access PIN
      if (data.role === 'teacher') {
        const expectedPin = inst.teacher_access_pin || '849201';
        if (cleanPin !== expectedPin) {
          return {
            success: false,
            message: 'সহকারী শিক্ষক এক্সেস পিনটি সঠিক নয়! আপনার মুহতামিম পরিচালকের নিকট থেকে ৬ ডিজিটের সঠিক পিন সংগ্রহ করুন।',
          };
        }
      } else if (data.role === 'guardian') {
        const expectedPin = inst.guardian_access_pin || '772109';
        if (cleanPin !== expectedPin) {
          return {
            success: false,
            message: 'অভিভাবক এক্সেস পিনটি সঠিক নয়! আপনার মাদ্রাসা বা সহকারী শিক্ষকের নিকট থেকে ৬ ডিজিটের সঠিক পিন সংগ্রহ করুন।',
          };
        }
      }

      // Check if user already exists
      const existing = madsolDb.findUserByIdentifier(cleanMobile);
      if (existing) {
        return { success: false, message: 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে।' };
      }

      // Hash password & create user
      const password_hash = await hashPassword(data.password);
      const isTeacher = data.role === 'teacher';

      const newUser = madsolDb.createUser({
        institution_id: inst.id,
        name: data.name.trim(),
        email: cleanEmail,
        mobile: cleanMobile,
        password_hash,
        role_id: data.role,
        status: 'active',
        app_access_granted: true,
        access_pin: cleanPin,
        can_grant_guardian_access: isTeacher ? true : false,
        approved_by_name: 'মুহতামিম কর্তৃক পিন যাচাইকৃত',
        approved_by_role: 'মুহতামিম',
        approved_at: new Date().toISOString(),
        approval_notes: `এক্সেস পিন (${cleanPin}) দিয়ে স্বয়ংক্রিয়ভাবে অ্যাকাউন্ট অনুমোদিত হয়েছে।`,
        designationBn: isTeacher ? 'সহকারী শিক্ষক' : 'সম্মানিত অভিভাবক',
        designationEn: isTeacher ? 'Assistant Teacher' : 'Guardian',
        fullNameBn: data.name.trim(),
        fullNameEn: data.name.trim(),
        phone: cleanMobile,
        guardianStudentId: data.studentName?.trim(),
        studentRoll: data.studentRoll?.trim(),
        allowed_modules: isTeacher
          ? ['attendance', 'exams', 'notices', 'guardians', 'messaging']
          : ['attendance', 'exams', 'notices', 'fees', 'diary'],
      });

      // Create session and set active user
      const session = madsolDb.createSession(newUser.id, true);
      localStorage.setItem(SESSION_TOKEN_KEY, session.token);
      localStorage.setItem(ACTIVE_USER_KEY, newUser.id);

      setUser(newUser);
      setInstitution(inst);
      refreshData();

      madsolDb.addActivityLog({
        user_id: newUser.id,
        user_name: newUser.name,
        institution_id: inst.id,
        action: 'USER_REGISTERED_WITH_PIN',
        description: `${newUser.name} (${isTeacher ? 'সহকারী শিক্ষক' : 'অভিভাবক'}) এক্সেস পিন যাচাইয়ের মাধ্যমে সফলভাবে নিবন্ধন করেছেন।`,
        status: 'success',
      });

      return { success: true, user: newUser };
    } catch (err: any) {
      return { success: false, message: err?.message || 'নিবন্ধন সম্পন্ন করা সম্ভব হয়নি।' };
    }
  };

  const regeneratePins = async (type: 'teacher' | 'guardian' | 'both') => {
    if (!institution) return { success: false };
    const updated = madsolDb.regenerateInstitutionPins(institution.id, type);
    if (updated) {
      setInstitution(updated);
      refreshData();
      return {
        success: true,
        teacherPin: updated.teacher_access_pin,
        guardianPin: updated.guardian_access_pin,
      };
    }
    return { success: false };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        institution,
        roles,
        permissions,
        isAuthenticated: !!user,
        activityLogs,
        hasPermission,
        login,
        logout,
        switchRole,
        switchInstitution,
        changePassword,
        resetPasswordWithVerification,
        updateProfile,
        refreshData,
        registerMuhtamim,
        registerWithPin,
        regeneratePins,
        activeInstitution: institution,
        activeRole: user?.role_id,
        allInstitutions: madsolDb.getInstitutions(),
        availableUsers: madsolDb.getUsers(),
        requestPasswordResetOtp: async (phoneOrEmail: string) => {
          const u = madsolDb.findUserByIdentifier(phoneOrEmail);
          if (!u) return { success: false, message: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি' };
          return { success: true, message: 'যাচাইকরণ কোড পাঠানো হয়েছে (টেস্ট কোড: 1234)' };
        },
        resetPasswordWithOtp: async (otp: string, newPass: string) => {
          if (!user) return { success: false, message: 'সেশন পাওয়া যায়নি' };
          return resetPasswordWithVerification(user.email, otp, newPass) as any;
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
