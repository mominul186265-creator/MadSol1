import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  AlertCircle,
  Clock,
  Check,
  X,
  Copy,
  Smartphone,
  Shield,
  ArrowRight,
  UserPlus,
  Info,
  Sparkles,
  Send,
  CheckSquare,
  Square,
  RefreshCw,
  Share2,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { madsolDb, isDemoUser } from '../../lib/db';
import { DbUser, RoleSlug, UserStatus } from '../../types/step1';
import { hashPasswordSync } from '../../lib/crypto';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';

type RoleCategoryTab = 'all' | 'teacher' | 'guardian' | 'pending';

export const UserManagementView: React.FC = () => {
  const { user: currentUser, institution, refreshData, regeneratePins } = useAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();

  const [usersList, setUsersList] = useState<DbUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<RoleCategoryTab>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // PIN Management states
  const [copiedTeacherPin, setCopiedTeacherPin] = useState(false);
  const [copiedGuardianPin, setCopiedGuardianPin] = useState(false);
  const [copiedInviteMessage, setCopiedInviteMessage] = useState(false);
  const [isRegeneratingPin, setIsRegeneratingPin] = useState<'teacher' | 'guardian' | null>(null);

  // Hierarchy Role Checks
  const isSuperAdmin = currentUser?.role_id === 'super_admin';
  const isMuhtamimOrDirector =
    isSuperAdmin ||
    currentUser?.role_id === 'institution_admin' ||
    currentUser?.role_id === 'principal';
  const isAssistantTeacher = currentUser?.role_id === 'teacher';
  const isGuardian = currentUser?.role_id === 'guardian';

  // PIN Operations
  const handleRegeneratePin = async (type: 'teacher' | 'guardian') => {
    if (!regeneratePins) return;
    setIsRegeneratingPin(type);
    const res = await regeneratePins(type);
    setIsRegeneratingPin(null);
    if (res.success) {
      showToast(
        language === 'bn'
          ? `নতুন ${type === 'teacher' ? 'সহকারী শিক্ষক' : 'অভিভাবক'} এক্সেস পিন সফলভাবে তৈরি হয়েছে!`
          : `New ${type} access PIN generated successfully!`,
        'success'
      );
    } else {
      showToast(language === 'bn' ? 'পিন পরিবর্তন করা যায়নি।' : 'Failed to regenerate PIN.', 'error');
    }
  };

  const copyPin = (pin: string, type: 'teacher' | 'guardian') => {
    navigator.clipboard.writeText(pin);
    if (type === 'teacher') {
      setCopiedTeacherPin(true);
      setTimeout(() => setCopiedTeacherPin(false), 2000);
    } else {
      setCopiedGuardianPin(true);
      setTimeout(() => setCopiedGuardianPin(false), 2000);
    }
    showToast(language === 'bn' ? 'পিন কপি হয়েছে!' : 'PIN copied!', 'success');
  };

  const copyInviteMessage = () => {
    const madrasa = institution?.name || 'আমাদের মাদ্রাসা';
    const tPin = institution?.teacher_access_pin || '849201';
    const gPin = institution?.guardian_access_pin || '772109';
    const msg = `আসসালামু আলাইকুম।\n${madrasa}-এর MadSol অ্যাপে সাইন আপ করার এক্সেস পিন:\n👨‍🏫 সহকারী শিক্ষক এক্সেস পিন: ${tPin}\n👨‍👩‍👦 অভিভাবক এক্সেস পিন: ${gPin}\nঅ্যাপে সাইন আপ করার সময় নির্ধারিত পিন দিয়ে একাউন্ট খুলুন। ধন্যবাদ।`;
    navigator.clipboard.writeText(msg);
    setCopiedInviteMessage(true);
    setTimeout(() => setCopiedInviteMessage(false), 2000);
    showToast(language === 'bn' ? 'সম্পূর্ণ আমন্ত্রণ বার্তা কপি হয়েছে!' : 'Invite message copied!', 'success');
  };

  // Can current user grant permission to a specific target user
  const canGrantPermissionTo = (target: DbUser) => {
    if (isMuhtamimOrDirector) {
      // Muhtamim can grant permission to Teachers and Guardians (and others except superadmin if not superadmin)
      return target.role_id === 'teacher' || target.role_id === 'guardian' || (isSuperAdmin && target.id !== currentUser?.id);
    }
    if (isAssistantTeacher) {
      // Assistant Teacher can ONLY grant permission to Guardians
      return target.role_id === 'guardian';
    }
    return false;
  };

  // Can current user edit/delete a target user
  const canManageUser = (target: DbUser) => {
    if (isMuhtamimOrDirector) return target.id !== currentUser?.id;
    if (isAssistantTeacher) return target.role_id === 'guardian';
    return false;
  };

  // Create/Edit User Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<DbUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<RoleSlug>('teacher');
  const [status, setStatus] = useState<UserStatus>('active');
  const [grantAppAccessImmediately, setGrantAppAccessImmediately] = useState(true);
  const [teacherCanGrantGuardian, setTeacherCanGrantGuardian] = useState(true);
  const [targetInstitutionId, setTargetInstitutionId] = useState('');

  // Password Reset Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [targetResetUser, setTargetResetUser] = useState<DbUser | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Detailed Permission Configuration Modal
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [targetPermUser, setTargetPermUser] = useState<DbUser | null>(null);
  const [permAppAccessGranted, setPermAppAccessGranted] = useState(true);
  const [permCanGrantGuardians, setPermCanGrantGuardians] = useState(true);
  const [permSelectedModules, setPermSelectedModules] = useState<string[]>([]);
  const [permAccessPin, setPermAccessPin] = useState('');
  const [permNotes, setPermNotes] = useState('');
  const [isCopiedPin, setIsCopiedPin] = useState(false);
  const [isCopiedSms, setIsCopiedSms] = useState(false);

  // Delete Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [targetDeleteUser, setTargetDeleteUser] = useState<DbUser | null>(null);

  // Load Users
  const loadUsers = () => {
    let list: DbUser[] = [];
    if (isSuperAdmin) {
      list = madsolDb.getUsers();
    } else if (currentUser?.institution_id) {
      list = madsolDb.getUsers(currentUser.institution_id);
    }
    const cleaned = list.filter((u) => !isDemoUser(u));
    setUsersList(cleaned);
  };

  useEffect(() => {
    loadUsers();
  }, [currentUser]);

  // Open Create User Modal
  const handleOpenCreate = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setMobile('');
    setPassword('123456'); // Standard easy password
    // If assistant teacher is creating, default to guardian
    setRoleId(isAssistantTeacher ? 'guardian' : 'teacher');
    setStatus('active');
    setGrantAppAccessImmediately(true);
    setTeacherCanGrantGuardian(true);
    setTargetInstitutionId(currentUser?.institution_id || 'inst-001');
    setIsModalOpen(true);
  };

  // Open Edit User Modal
  const handleOpenEdit = (target: DbUser) => {
    setEditingUser(target);
    setName(target.name);
    setEmail(target.email);
    setMobile(target.mobile);
    setPassword('');
    setRoleId(target.role_id);
    setStatus(target.status);
    setGrantAppAccessImmediately(target.app_access_granted ?? (target.status === 'active'));
    setTeacherCanGrantGuardian(target.can_grant_guardian_access ?? true);
    setTargetInstitutionId(target.institution_id);
    setIsModalOpen(true);
  };

  // Save User (Create or Update)
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast(language === 'bn' ? 'ব্যবহারকারীর নাম লিখুন।' : 'Name is required.', 'error');
      return;
    }

    if (!mobile.trim()) {
      showToast(language === 'bn' ? 'মোবাইল নম্বর লিখুন।' : 'Mobile number is required.', 'error');
      return;
    }

    if (!editingUser && password.length < 6) {
      showToast(
        language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.',
        'error'
      );
      return;
    }

    // Role boundary validation: Assistant teachers can only create guardians
    if (isAssistantTeacher && roleId !== 'guardian') {
      showToast(
        language === 'bn'
          ? 'সহকারী শিক্ষক শুধুমাত্র অভিভাবক অ্যাকাউন্ট তৈরি ও অনুমতি দিতে পারবেন।'
          : 'Assistant Teachers can only create Guardian accounts.',
        'error'
      );
      return;
    }

    try {
      const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
      const approverRoleName = isMuhtamimOrDirector
        ? language === 'bn' ? 'মুহতামিম / পরিচালক' : 'Muhtamim / Director'
        : language === 'bn' ? 'সহকারী শিক্ষক' : 'Assistant Teacher';

      if (editingUser) {
        // Update user
        madsolDb.updateUser(editingUser.id, {
          name,
          email: email || `${mobile}@madsol.app`,
          mobile,
          role_id: roleId,
          status: grantAppAccessImmediately ? 'active' : status,
          app_access_granted: grantAppAccessImmediately,
          can_grant_guardian_access: roleId === 'teacher' ? teacherCanGrantGuardian : undefined,
          institution_id: targetInstitutionId,
          ...(grantAppAccessImmediately && !editingUser.app_access_granted
            ? {
                approved_by_id: currentUser?.id,
                approved_by_name: currentUser?.name || 'Admin',
                approved_by_role: approverRoleName,
                approved_at: new Date().toISOString(),
              }
            : {}),
        });

        madsolDb.addActivityLog({
          user_id: currentUser?.id || 'sys',
          user_name: currentUser?.name || 'Admin',
          institution_id: targetInstitutionId,
          action: 'USER_UPDATED',
          description: `ব্যবহারকারী [${name}]-এর তথ্য ও অনুমতি হালনাগাদ করা হয়েছে।`,
          status: 'success',
        });

        showToast(language === 'bn' ? 'ব্যবহারকারী সফলভাবে হালনাগাদ করা হয়েছে।' : 'User updated successfully.', 'success');
      } else {
        // Create user
        const hashedPass = hashPasswordSync(password);
        const newUser = madsolDb.createUser({
          name,
          email: email.trim() ? email : `usr-${Date.now().toString(36)}@darululoom.edu.bd`,
          mobile,
          password_hash: hashedPass,
          role_id: roleId,
          status: grantAppAccessImmediately ? 'active' : 'pending',
          institution_id: targetInstitutionId,
          app_access_granted: grantAppAccessImmediately,
          approved_by_id: grantAppAccessImmediately ? currentUser?.id : undefined,
          approved_by_name: grantAppAccessImmediately ? (currentUser?.name || 'Admin') : undefined,
          approved_by_role: grantAppAccessImmediately ? approverRoleName : undefined,
          approved_at: grantAppAccessImmediately ? new Date().toISOString() : undefined,
          can_grant_guardian_access: roleId === 'teacher' ? teacherCanGrantGuardian : undefined,
          access_pin: generatedPin,
          allowed_modules:
            roleId === 'teacher'
              ? ['attendance', 'exams', 'notices', 'guardians', 'messaging']
              : ['attendance', 'exams', 'notices', 'fees', 'diary'],
        });

        madsolDb.addActivityLog({
          user_id: currentUser?.id || 'sys',
          user_name: currentUser?.name || 'Admin',
          institution_id: targetInstitutionId,
          action: 'USER_CREATED',
          description: `নতুন ব্যবহারকারী [${newUser.name}] (${getRoleLabel(newUser.role_id)}) তৈরি হয়েছে এবং অ্যাপ অনুমতি ${grantAppAccessImmediately ? 'অনুমোদিত' : 'অপেক্ষমাণ'} রয়েছে।`,
          status: 'success',
        });

        showToast(
          language === 'bn'
            ? grantAppAccessImmediately
              ? `নতুন ব্যবহারকারী তৈরি হয়েছে এবং অ্যাপ চালানোর অনুমতি দেওয়া হয়েছে (লগইন পিন: ${generatedPin})`
              : 'নতুন ব্যবহারকারী তৈরি হয়েছে (অনুমতির অপেক্ষায় সংরক্ষিত)।'
            : 'New user created successfully.',
          'success'
        );
      }

      loadUsers();
      refreshData();
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Error saving user', 'error');
    }
  };

  // Direct 1-Click App Access Toggle (Grant or Revoke)
  const handleToggleAppAccess = (target: DbUser) => {
    if (!canGrantPermissionTo(target)) {
      showToast(
        language === 'bn'
          ? 'এই ব্যবহারকারীর অ্যাপ ব্যবহারের অনুমতি পরিবর্তন করার অধিকার আপনার নেই।'
          : 'You do not have permission to modify access for this user.',
        'error'
      );
      return;
    }

    const willGrant = !(target.app_access_granted && target.status === 'active');
    const approverRoleName = isMuhtamimOrDirector
      ? language === 'bn' ? 'মুহতামিম / পরিচালক' : 'Muhtamim / Director'
      : language === 'bn' ? 'সহকারী শিক্ষক' : 'Assistant Teacher';

    madsolDb.updateUser(target.id, {
      app_access_granted: willGrant,
      status: willGrant ? 'active' : 'suspended',
      approved_by_id: willGrant ? currentUser?.id : target.approved_by_id,
      approved_by_name: willGrant ? (currentUser?.name || 'Admin') : target.approved_by_name,
      approved_by_role: willGrant ? approverRoleName : target.approved_by_role,
      approved_at: willGrant ? new Date().toISOString() : target.approved_at,
    });

    madsolDb.addActivityLog({
      user_id: currentUser?.id || 'sys',
      user_name: currentUser?.name || 'Admin',
      institution_id: target.institution_id,
      action: willGrant ? 'APP_ACCESS_GRANTED' : 'APP_ACCESS_REVOKED',
      description: willGrant
        ? `${approverRoleName} কর্তৃক [${target.name}]-কে অ্যাপ ব্যবহারের অনুমতি দেওয়া হয়েছে।`
        : `${approverRoleName} কর্তৃক [${target.name}]-এর অ্যাপ ব্যবহারের অনুমতি স্থগিত করা হয়েছে।`,
      status: willGrant ? 'success' : 'warning',
    });

    showToast(
      language === 'bn'
        ? willGrant
          ? `[${target.name}]-কে অ্যাপ চালানোর অনুমতি প্রদান করা হয়েছে।`
          : `[${target.name}]-এর অ্যাপ ব্যবহারের অনুমতি স্থগিত করা হয়েছে।`
        : willGrant
        ? `App access granted to ${target.name}.`
        : `App access revoked for ${target.name}.`,
      willGrant ? 'success' : 'info'
    );

    loadUsers();
    refreshData();
  };

  // Open Detailed Permission Configuration Modal
  const handleOpenPermissionModal = (target: DbUser) => {
    setTargetPermUser(target);
    setPermAppAccessGranted(target.app_access_granted ?? (target.status === 'active'));
    setPermCanGrantGuardians(target.can_grant_guardian_access ?? true);
    setPermSelectedModules(
      target.allowed_modules ||
        (target.role_id === 'teacher'
          ? ['attendance', 'exams', 'notices', 'guardians', 'messaging']
          : ['attendance', 'exams', 'notices', 'fees', 'diary'])
    );
    setPermAccessPin(target.access_pin || Math.floor(100000 + Math.random() * 900000).toString());
    setPermNotes(target.approval_notes || '');
    setIsCopiedPin(false);
    setIsCopiedSms(false);
    setIsPermModalOpen(true);
  };

  // Save Detailed Permissions
  const handleSaveDetailedPermissions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPermUser) return;

    if (!canGrantPermissionTo(targetPermUser)) {
      showToast(
        language === 'bn'
          ? 'আপনার এই অনুমতি সংরক্ষণ করার অধিকার নেই।'
          : 'You do not have permission to save these settings.',
        'error'
      );
      return;
    }

    const approverRoleName = isMuhtamimOrDirector
      ? language === 'bn' ? 'মুহতামিম / পরিচালক' : 'Muhtamim / Director'
      : language === 'bn' ? 'সহকারী শিক্ষক' : 'Assistant Teacher';

    madsolDb.updateUser(targetPermUser.id, {
      app_access_granted: permAppAccessGranted,
      status: permAppAccessGranted ? 'active' : 'suspended',
      can_grant_guardian_access: targetPermUser.role_id === 'teacher' ? permCanGrantGuardians : undefined,
      allowed_modules: permSelectedModules,
      access_pin: permAccessPin,
      approval_notes: permNotes,
      approved_by_id: currentUser?.id,
      approved_by_name: currentUser?.name || 'Admin',
      approved_by_role: approverRoleName,
      approved_at: new Date().toISOString(),
    });

    madsolDb.addActivityLog({
      user_id: currentUser?.id || 'sys',
      user_name: currentUser?.name || 'Admin',
      institution_id: targetPermUser.institution_id,
      action: 'PERMISSION_CONFIG_UPDATED',
      description: `[${targetPermUser.name}]-এর মডিউল ও অ্যাপ ব্যবহারের অনুমতি কনফিগারেশন আপডেট করা হয়েছে।`,
      status: 'success',
    });

    showToast(
      language === 'bn' ? 'অ্যাপ ব্যবহারের অনুমতি ও কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে।' : 'Permissions configured successfully.',
      'success'
    );

    loadUsers();
    refreshData();
    setIsPermModalOpen(false);
  };

  // Generate New Access PIN
  const handleGenerateNewPin = () => {
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    setPermAccessPin(newPin);
    showToast(language === 'bn' ? `নতুন পিন তৈরি হয়েছে: ${newPin}` : `Generated PIN: ${newPin}`, 'info');
  };

  // Copy PIN
  const handleCopyPin = () => {
    if (!permAccessPin) return;
    navigator.clipboard.writeText(permAccessPin);
    setIsCopiedPin(true);
    setTimeout(() => setIsCopiedPin(false), 2000);
    showToast(language === 'bn' ? 'পিন কোড কপি করা হয়েছে!' : 'PIN copied to clipboard!', 'success');
  };

  // Copy SMS Invitation Message
  const handleCopySms = () => {
    if (!targetPermUser) return;
    const instName = institution?.name || (language === 'bn' ? 'দারুল উলুম মাদরাসা' : 'Madrasa');
    const smsMessage =
      language === 'bn'
        ? `আসসালামু আলাইকুম। ${instName}-এর পক্ষ থেকে আপনাকে মাদসোল অ্যাপ ব্যবহারের অনুমতি দেওয়া হয়েছে। আপনার মোবাইল: ${targetPermUser.mobile}, লগইন পিন: ${permAccessPin}। অ্যাপ লিংক: https://madsol.app/login`
        : `Assalamu Alaikum. You have been granted app access for ${instName}. Mobile: ${targetPermUser.mobile}, Login PIN: ${permAccessPin}. App: https://madsol.app/login`;

    navigator.clipboard.writeText(smsMessage);
    setIsCopiedSms(true);
    setTimeout(() => setIsCopiedSms(false), 2500);
    showToast(
      language === 'bn' ? 'অভিভাবকের জন্য অনুমতির এসএমএস মেসেজ কপি করা হয়েছে!' : 'SMS invitation text copied!',
      'success'
    );
  };

  // Direct Password Reset
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetResetUser) return;
    if (newPassword.length < 6) {
      showToast(
        language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.',
        'error'
      );
      return;
    }

    const hashed = hashPasswordSync(newPassword);
    madsolDb.updateUser(targetResetUser.id, { password_hash: hashed });
    madsolDb.deleteUserSessions(targetResetUser.id);

    madsolDb.addActivityLog({
      user_id: currentUser?.id || 'sys',
      user_name: currentUser?.name || 'Admin',
      institution_id: targetResetUser.institution_id,
      action: 'ADMIN_PASSWORD_RESET',
      description: `[${targetResetUser.name}]-এর পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে।`,
      status: 'success',
    });

    showToast(language === 'bn' ? 'পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে।' : 'Password reset successfully.', 'success');
    setIsResetModalOpen(false);
    setTargetResetUser(null);
    setNewPassword('');
  };

  // Delete User Confirmation
  const handleConfirmDelete = () => {
    if (!targetDeleteUser) return;
    madsolDb.deleteUser(targetDeleteUser.id);
    madsolDb.deleteUserSessions(targetDeleteUser.id);

    madsolDb.addActivityLog({
      user_id: currentUser?.id || 'sys',
      user_name: currentUser?.name || 'Admin',
      institution_id: targetDeleteUser.institution_id,
      action: 'USER_DELETED',
      description: `ব্যবহারকারী [${targetDeleteUser.name}] মুছে ফেলা হয়েছে।`,
      status: 'warning',
    });

    showToast(language === 'bn' ? 'ব্যবহারকারী মুছে ফেলা হয়েছে।' : 'User deleted successfully.', 'success');
    loadUsers();
    refreshData();
    setIsDeleteDialogOpen(false);
    setTargetDeleteUser(null);
  };

  // Role label mapping focused on the 3 core roles
  const getRoleLabel = (slug: RoleSlug) => {
    switch (slug) {
      case 'institution_admin':
      case 'principal':
      case 'super_admin':
        return language === 'bn' ? 'মুহতামিম / পরিচালক' : 'Muhtamim / Director';
      case 'teacher':
        return language === 'bn' ? 'সহকারী শিক্ষক' : 'Assistant Teacher';
      case 'guardian':
        return language === 'bn' ? 'অভিভাবক' : 'Guardian';
      case 'accountant':
        return language === 'bn' ? 'হিসাবরক্ষক' : 'Accountant';
      case 'student':
        return language === 'bn' ? 'শিক্ষার্থী' : 'Student';
      default:
        return slug;
    }
  };

  const getRoleBadgeStyle = (slug: RoleSlug) => {
    switch (slug) {
      case 'institution_admin':
      case 'principal':
      case 'super_admin':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'teacher':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
      case 'guardian':
        return 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  // Filter users based on query, tabs, role and status
  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.mobile.includes(q) ||
      (u.access_pin && u.access_pin.includes(q));

    // Role Tab Filter
    let matchesTab = true;
    if (activeTab === 'teacher') {
      matchesTab = u.role_id === 'teacher';
    } else if (activeTab === 'guardian') {
      matchesTab = u.role_id === 'guardian';
    } else if (activeTab === 'pending') {
      matchesTab = u.status === 'pending' || u.app_access_granted === false;
    }

    // Secondary filters
    let matchesRole = true;
    if (roleFilter !== 'all') {
      if (roleFilter === 'muhtamim') {
        matchesRole = u.role_id === 'principal' || u.role_id === 'institution_admin' || u.role_id === 'super_admin';
      } else {
        matchesRole = u.role_id === roleFilter;
      }
    }

    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesTab && matchesRole && matchesStatus;
  });

  // Calculate quick stats
  const totalCount = usersList.length;
  const teacherCount = usersList.filter((u) => u.role_id === 'teacher').length;
  const guardianCount = usersList.filter((u) => u.role_id === 'guardian').length;
  const pendingCount = usersList.filter((u) => u.status === 'pending' || u.app_access_granted === false).length;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'অ্যাপ ব্যবহার ও রোল অনুমতি নিয়ন্ত্রণ' : 'App Access & Role Permissions'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>{language === 'bn' ? 'ব্যবহারকারী ও রোল ব্যবস্থাপনা' : 'User & Role Management'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn'
              ? 'মুহতামিম/পরিচালক, সহকারী শিক্ষক ও অভিভাবকের অ্যাপ ব্যবহারের অনুমতি এবং অনুমোদন ব্যবস্থা'
              : 'Permission delegation for Muhtamim, Assistant Teacher, and Guardian'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Can add new user: Muhtamim can add teachers/guardians, Assistant teacher can add guardians */}
          {(isMuhtamimOrDirector || isAssistantTeacher) && (
            <Button
              id="add-user-btn"
              variant="primary"
              onClick={handleOpenCreate}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              {language === 'bn'
                ? isAssistantTeacher ? 'নতুন অভিভাবক যোগ করুন' : 'নতুন ব্যবহারকারী যোগ করুন'
                : isAssistantTeacher ? 'Add New Guardian' : 'Add New User'}
            </Button>
          )}
        </div>
      </div>

      {/* 2. Permission Hierarchy & System Diagram Guide */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white p-4 sm:p-5 rounded-3xl border border-slate-700/80 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-700/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{language === 'bn' ? 'অ্যাপ ব্যবহারের ৩-স্তরীয় অনুমতি নীতিমালা' : '3-Tier App Authorization Policy'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">
                    {language === 'bn' ? 'সিস্টেম অ্যাক্টিভ' : 'System Active'}
                  </span>
                </h2>
                <p className="text-[11px] text-slate-300">
                  {language === 'bn'
                    ? 'অ্যাপে শুধু ৩ ধরণের ব্যক্তি কাজ করতে পারবে এবং অনুমতি দেওয়ার পদ্ধতি নিচে সক্রিয় রয়েছে'
                    : 'Only 3 roles can access the app with cascading authorization rights'}
                </p>
              </div>
            </div>

            {/* Current user role banner */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
              <span className="text-slate-400">{language === 'bn' ? 'আপনার বর্তমান ভূমিকা:' : 'Your Role:'}</span>
              <span className="font-bold text-emerald-400">
                {isMuhtamimOrDirector
                  ? language === 'bn' ? '👑 মুহতামিম / পরিচালক' : '👑 Muhtamim / Director'
                  : isAssistantTeacher
                  ? language === 'bn' ? '👨‍🏫 সহকারী শিক্ষক' : '👨‍🏫 Assistant Teacher'
                  : language === 'bn' ? '👨‍👩‍👦 অভিভাবক' : '👨‍👩‍👦 Guardian'}
              </span>
            </div>
          </div>

          {/* 3 Roles Hierarchy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3.5">
            {/* 1. Muhtamim / Director */}
            <div className="bg-slate-800/60 hover:bg-slate-800/90 transition-colors p-3.5 rounded-2xl border border-emerald-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[11px]">১</span>
                    {language === 'bn' ? 'মুহতামিম / পরিচালক' : 'Muhtamim / Director'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                    {language === 'bn' ? 'সর্বোচ্চ ক্ষমতা' : 'Full Authority'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'bn'
                    ? 'সহকারী শিক্ষক ও অভিভাবক—উভয়কেই অ্যাপ চালানোর অনুমতি দিতে এবং যে কোনো সময় স্থগিত করতে পারেন।'
                    : 'Grants app access to both Assistant Teachers and Guardians.'}
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-700/60 text-[11px] text-emerald-300 flex items-center gap-1">
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                <span>{language === 'bn' ? 'অনুমতি দেন: শিক্ষক ও অভিভাবক' : 'Authorizes: Teacher & Guardian'}</span>
              </div>
            </div>

            {/* 2. Assistant Teacher */}
            <div className="bg-slate-800/60 hover:bg-slate-800/90 transition-colors p-3.5 rounded-2xl border border-indigo-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[11px]">২</span>
                    {language === 'bn' ? 'সহকারী শিক্ষক' : 'Assistant Teacher'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                    {language === 'bn' ? 'অনুমতি প্রাপ্ত' : 'Authorized'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'bn'
                    ? 'মুহতামিম দ্বারা অনুমোদিত হন এবং নিজে সরাসরি অভিভাবকদের অ্যাপ চালানোর অনুমতি প্রদান ও নিয়ন্ত্রণ করতে পারেন।'
                    : 'Authorized by Muhtamim; has authority to grant app access to Guardians.'}
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-700/60 text-[11px] text-indigo-300 flex items-center gap-1">
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                <span>{language === 'bn' ? 'অনুমতি দেন: অভিভাবকবৃন্দকে' : 'Authorizes: Guardians'}</span>
              </div>
            </div>

            {/* 3. Guardian */}
            <div className="bg-slate-800/60 hover:bg-slate-800/90 transition-colors p-3.5 rounded-2xl border border-amber-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[11px]">৩</span>
                    {language === 'bn' ? 'অভিভাবক' : 'Guardian'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/50">
                    {language === 'bn' ? 'ব্যবহারকারী' : 'End User'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'bn'
                    ? 'মুহতামিম বা সহকারী শিক্ষক কর্তৃক অনুমতি পেলে অ্যাপের মাধ্যমে সন্তানের হাজিরা, রেজাল্ট, ও নোটিশ দেখতে পারেন।'
                    : 'Uses the app once approved by Muhtamim or Assistant Teacher.'}
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-700/60 text-[11px] text-amber-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{language === 'bn' ? 'অনুমোদনকারী: মুহতামিম বা শিক্ষক' : 'Approved By: Muhtamim or Teacher'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 Institution Access PINs Section (Director generated PINs for Assistant Teachers and Guardians) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  {language === 'bn' ? 'মাদ্রাসার এক্সেস পিন (সাইন আপ অনুমোদন ব্যবস্থা)' : 'Institution Access PINs (Sign Up Authorization)'}
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                  {institution?.name || 'দারুল উলুম মাদ্রাসা'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn'
                  ? 'মুহতামিম পরিচালক সাইন আপ করলে এই পিন স্বয়ংক্রিয়ভাবে তৈরি হয়। সহকারী শিক্ষক ও অভিভাবকরা সাইন আপ করার সময় এই পিন বসিয়ে একাউন্ট খুলবেন।'
                  : 'Muhtamim generates these PINs; assistant teachers and guardians use them to open their accounts.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={copyInviteMessage}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            {copiedInviteMessage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>
              {copiedInviteMessage
                ? language === 'bn' ? 'বার্তা কপি হয়েছে!' : 'Message Copied!'
                : language === 'bn' ? 'নোটিশ বার্তা কপি করুন' : 'Copy Notice Message'}
            </span>
          </button>
        </div>

        {/* PIN Display Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Assistant Teacher PIN Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/80 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  {language === 'bn' ? '👨‍🏫 সহকারী শিক্ষক এক্সেস পিন' : 'Assistant Teacher Access PIN'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                  {language === 'bn' ? 'শিক্ষকদের রেজিস্ট্রেশন' : 'Teacher Registration'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                {language === 'bn'
                  ? 'সহকারী শিক্ষকরা সাইন আপ করার সময় এই পিনটি দিয়ে নিজেদের অ্যাকাউন্ট নিবন্ধন করবেন।'
                  : 'Assistant teachers provide this PIN during sign-up to register.'}
              </p>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-800/80">
              <span className="text-xl font-mono font-extrabold tracking-widest text-indigo-700 dark:text-indigo-300">
                {institution?.teacher_access_pin || '849201'}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => copyPin(institution?.teacher_access_pin || '849201', 'teacher')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/60 dark:hover:bg-indigo-900 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer"
                >
                  {copiedTeacherPin ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTeacherPin ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি' : 'Copy')}</span>
                </button>

                {isMuhtamimOrDirector && (
                  <button
                    type="button"
                    disabled={isRegeneratingPin === 'teacher'}
                    onClick={() => handleRegeneratePin('teacher')}
                    title={language === 'bn' ? 'নতুন শিক্ষক পিন তৈরি করুন' : 'Regenerate Teacher PIN'}
                    className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingPin === 'teacher' ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Guardian PIN Card */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/80 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  {language === 'bn' ? '👨‍👩‍👦 অভিভাবক এক্সেস পিন' : 'Guardian Access PIN'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                  {language === 'bn' ? 'অভিভাবক রেজিস্ট্রেশন' : 'Guardian Registration'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                {language === 'bn'
                  ? 'অভিভাবকরা সাইন আপ করার সময় এই পিনটি দিয়ে সন্তানের তথ্য দেখার অ্যাকাউন্ট তৈরি করবেন।'
                  : 'Guardians provide this PIN during sign-up to monitor student progress.'}
              </p>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800/80">
              <span className="text-xl font-mono font-extrabold tracking-widest text-amber-700 dark:text-amber-300">
                {institution?.guardian_access_pin || '772109'}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => copyPin(institution?.guardian_access_pin || '772109', 'guardian')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/60 dark:hover:bg-amber-900 text-xs font-semibold text-amber-700 dark:text-amber-300 transition-colors cursor-pointer"
                >
                  {copiedGuardianPin ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedGuardianPin ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি' : 'Copy')}</span>
                </button>

                {isMuhtamimOrDirector && (
                  <button
                    type="button"
                    disabled={isRegeneratingPin === 'guardian'}
                    onClick={() => handleRegeneratePin('guardian')}
                    title={language === 'bn' ? 'নতুন অভিভাবক পিন তৈরি করুন' : 'Regenerate Guardian PIN'}
                    className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/60 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingPin === 'guardian' ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Role Filter Tabs & Pending Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {language === 'bn' ? `সকল ব্যবহারকারী (${totalCount})` : `All Users (${totalCount})`}
          </button>

          <button
            onClick={() => setActiveTab('teacher')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'teacher'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300'
            }`}
          >
            <span>{language === 'bn' ? 'সহকারী শিক্ষক' : 'Assistant Teachers'}</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-md bg-white/20">{teacherCount}</span>
          </button>

          <button
            onClick={() => setActiveTab('guardian')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'guardian'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300'
            }`}
          >
            <span>{language === 'bn' ? 'অভিভাবকবৃন্দ' : 'Guardians'}</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-md bg-white/20">{guardianCount}</span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'অনুমোদনের অপেক্ষায়' : 'Pending Approval'}</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-rose-500 text-white font-bold animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 sm:max-w-xs min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="user-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? 'নাম, মোবাইল বা পিন দিয়ে খুঁজুন...' : 'Search by name, mobile, PIN...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* 4. Users Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="text-[11px] uppercase bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">{language === 'bn' ? 'ব্যবহারকারী' : 'User'}</th>
                <th className="py-3.5 px-4">{language === 'bn' ? 'ভূমিকা (Role)' : 'Role'}</th>
                <th className="py-3.5 px-4">{language === 'bn' ? 'মোবাইল ও পিন' : 'Contact & PIN'}</th>
                <th className="py-3.5 px-4">{language === 'bn' ? 'অ্যাপ ব্যবহারের অনুমতি' : 'App Access Permission'}</th>
                <th className="py-3.5 px-4">{language === 'bn' ? 'অনুমোদনের বিবরণ' : 'Approval Audit'}</th>
                <th className="py-3.5 px-4 text-right">{language === 'bn' ? 'অনুমতি অ্যাকশন' : 'Permission Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p>{language === 'bn' ? 'কোনো ব্যবহারকারী পাওয়া যায়নি।' : 'No users found.'}</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  const isAccessGranted = u.app_access_granted && u.status === 'active';
                  const isPending = u.status === 'pending' || u.app_access_granted === false;
                  const canGrant = canGrantPermissionTo(u);
                  const canManage = canManageUser(u);

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isPending ? 'bg-amber-50/40 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      {/* User Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800/60 overflow-hidden">
                            {u.avatarUrl || u.photo ? (
                              <img src={u.avatarUrl || u.photo} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              u.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-800">
                                  {language === 'bn' ? 'আপনি' : 'You'}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              ID: {u.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getRoleBadgeStyle(
                              u.role_id
                            )}`}
                          >
                            {getRoleLabel(u.role_id)}
                          </span>

                          {/* Extra permission badge for teacher */}
                          {u.role_id === 'teacher' && u.can_grant_guardian_access && (
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-medium">
                              <Check className="w-3 h-3" />
                              {language === 'bn' ? 'অভিভাবক অনুমোদনের ক্ষমতাপ্রাপ্ত' : 'Can grant guardian access'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Contact & PIN */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{u.mobile}</div>
                        {u.access_pin ? (
                          <div className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <KeyRound className="w-3 h-3 text-amber-500" />
                            <span>PIN: {u.access_pin}</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400">{u.email}</div>
                        )}
                      </td>

                      {/* App Access Permission Status */}
                      <td className="py-3.5 px-4">
                        {isAccessGranted ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {language === 'bn' ? 'অনুমোদিত ও সক্রিয়' : 'Access Granted'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {language === 'bn' ? 'অ্যাপে প্রবেশাধিকার চালু' : 'Active user'}
                            </span>
                          </div>
                        ) : isPending ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              <Clock className="w-3 h-3" />
                              {language === 'bn' ? 'অনুমোদনের অপেক্ষায়' : 'Pending Approval'}
                            </span>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400">
                              {language === 'bn' ? 'অনুমতি দেওয়া প্রয়োজন' : 'Action needed'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-start gap-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                              <X className="w-3 h-3" />
                              {language === 'bn' ? 'অনুমতি স্থগিত' : 'Access Suspended'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {language === 'bn' ? 'লগইন বন্ধ' : 'Login disabled'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Approval Audit Column */}
                      <td className="py-3.5 px-4 text-[11px]">
                        {u.approved_by_name ? (
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {u.approved_by_name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {u.approved_by_role || (language === 'bn' ? 'কর্তৃপক্ষ' : 'Authority')}
                              {u.approved_at && ` • ${new Date(u.approved_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}`}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 italic">
                            {language === 'bn' ? 'এখনো অনুমোদিত হয়নি' : 'Not yet approved'}
                          </div>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. Direct One-Click Permission Grant / Suspend Button */}
                          {canGrant ? (
                            <button
                              id={`grant-toggle-btn-${u.id}`}
                              onClick={() => handleToggleAppAccess(u)}
                              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer ${
                                isAccessGranted
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                              }`}
                              title={
                                isAccessGranted
                                  ? language === 'bn' ? 'অ্যাপ অনুমতি স্থগিত করুন' : 'Suspend app access'
                                  : language === 'bn' ? 'অ্যাপ চালানোর অনুমতি দিন' : 'Grant app access'
                              }
                            >
                              {isAccessGranted ? (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>{language === 'bn' ? 'স্থগিত' : 'Suspend'}</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{language === 'bn' ? 'অনুমতি দিন' : 'Grant Access'}</span>
                                </>
                              )}
                            </button>
                          ) : (
                            !isCurrent && (
                              <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700/80">
                                {isAssistantTeacher
                                  ? language === 'bn' ? 'মুহতামিম নিয়ন্ত্রণযোগ্য' : 'Managed by Muhtamim'
                                  : language === 'bn' ? 'ভিউ অনলি' : 'View only'}
                              </span>
                            )
                          )}

                          {/* 2. Detailed Permission Configuration Modal Button */}
                          {canGrant && (
                            <button
                              id={`perm-config-btn-${u.id}`}
                              onClick={() => handleOpenPermissionModal(u)}
                              className="p-1.5 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors border border-slate-200 dark:border-slate-800"
                              title={language === 'bn' ? 'বিস্তারিত অনুমতি ও মডিউল নির্ধারণ' : 'Configure Permissions & PIN'}
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                          )}

                          {/* 3. Password Reset */}
                          {canManage && (
                            <button
                              onClick={() => {
                                setTargetResetUser(u);
                                setNewPassword('');
                                setIsResetModalOpen(true);
                              }}
                              className="p-1.5 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60 transition-colors border border-slate-200 dark:border-slate-800"
                              title={language === 'bn' ? 'পাসওয়ার্ড রিসেট' : 'Reset Password'}
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                          )}

                          {/* 4. Edit User */}
                          {canManage && (
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors border border-slate-200 dark:border-slate-800"
                              title={language === 'bn' ? 'তথ্য পরিবর্তন' : 'Edit User'}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* 5. Delete User */}
                          {canManage && (
                            <button
                              onClick={() => {
                                setTargetDeleteUser(u);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="p-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors border border-slate-200 dark:border-slate-800"
                              title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete User'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Detailed Permission & Module Access Configuration Modal */}
      <Modal
        id="permission-config-modal"
        isOpen={isPermModalOpen}
        onClose={() => setIsPermModalOpen(false)}
        title={
          language === 'bn'
            ? `অ্যাপ অনুমতি ও অ্যাক্সেস কনফিগারেশন: ${targetPermUser?.name}`
            : `Permission & App Access Config: ${targetPermUser?.name}`
        }
        maxWidth="lg"
      >
        {targetPermUser && (
          <form onSubmit={handleSaveDetailedPermissions} className="space-y-4 text-xs">
            {/* Target User Info Header */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                  {targetPermUser.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{targetPermUser.name}</div>
                  <div className="text-slate-500 flex items-center gap-2">
                    <span>{getRoleLabel(targetPermUser.role_id)}</span>
                    <span>•</span>
                    <span>{targetPermUser.mobile}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                    permAppAccessGranted
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {permAppAccessGranted
                    ? language === 'bn' ? 'অনুমোদিত' : 'Access Granted'
                    : language === 'bn' ? 'স্থগিত' : 'Access Suspended'}
                </span>
              </div>
            </div>

            {/* Section A: Master App Access Toggle */}
            <div className="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'bn' ? 'অ্যাপে প্রবেশের সার্বিক অনুমতি (Master Access)' : 'Master App Access'}</span>
                </h4>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'bn'
                    ? 'এটি বন্ধ থাকলে ব্যবহারকারী অ্যাপে লগইন করতে পারবেন না।'
                    : 'Disabling this will prevent the user from logging in.'}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={permAppAccessGranted}
                  onChange={(e) => setPermAppAccessGranted(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Section B: For Assistant Teachers - Delegation to approve guardians */}
            {targetPermUser.role_id === 'teacher' && isMuhtamimOrDirector && (
              <div className="p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>{language === 'bn' ? 'অভিভাবকদের অ্যাপ ব্যবহারের অনুমতি দেওয়ার ক্ষমতা' : 'Guardian Permission Authority'}</span>
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    {language === 'bn'
                      ? 'চালু থাকলে এই সহকারী শিক্ষক নতুন অভিভাবক যোগ করতে পারবেন ও অ্যাপ চালানোর অনুমতি দিতে পারবেন।'
                      : 'Allows this teacher to grant and manage app access for Guardians.'}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permCanGrantGuardians}
                    onChange={(e) => setPermCanGrantGuardians(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            )}

            {/* Section C: Module / Feature Checklist */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                {language === 'bn' ? 'অনুমোদিত অ্যাপ মডিউলসমূহ (Modules Allowed)' : 'Permitted App Modules'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(targetPermUser.role_id === 'teacher'
                  ? [
                      { id: 'attendance', labelBn: 'ছাত্রদের দৈনিক হাজিরা গ্রহণ ও রিপোর্ট', labelEn: 'Daily Attendance' },
                      { id: 'exams', labelBn: 'পরীক্ষার নম্বর ইনপুট ও রেজাল্ট শিট', labelEn: 'Exam Results' },
                      { id: 'notices', labelBn: 'নোটিশ বোর্ড ও প্রাতিষ্ঠানিক ঘোষণা', labelEn: 'Notices & Announcements' },
                      { id: 'guardians', labelBn: 'অভিভাবক ডাটাবেজ ও অনুমতি প্রদান', labelEn: 'Guardian Approvals' },
                      { id: 'messaging', labelBn: 'অভিভাবকদের এসএমএস / বার্তা প্রেরণ', labelEn: 'SMS & Messaging' },
                    ]
                  : [
                      { id: 'attendance', labelBn: 'সন্তানের দৈনিক হাজিরা ও উপস্থিতি দেখা', labelEn: 'Child Attendance View' },
                      { id: 'exams', labelBn: 'পরীক্ষার রেজাল্ট ও গ্রেড শিট দেখা', labelEn: 'Exam Results View' },
                      { id: 'notices', labelBn: 'মাদরাসার নোটিশ ও ছুটির নোটিফিকেশন', labelEn: 'Notices View' },
                      { id: 'fees', labelBn: 'মাদরাসার ফি, বেতন ও পরিশোধ রসিদ', labelEn: 'Fees & Receipts' },
                      { id: 'diary', labelBn: 'শিক্ষকের ডায়েরি ও বাড়ির পড়া (হোমওয়ার্ক)', labelEn: 'Daily Homework Diary' },
                    ]
                ).map((mod) => {
                  const isChecked = permSelectedModules.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setPermSelectedModules(permSelectedModules.filter((m) => m !== mod.id));
                        } else {
                          setPermSelectedModules([...permSelectedModules, mod.id]);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="text-xs">{language === 'bn' ? mod.labelBn : mod.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section D: Instant 6-Digit Access PIN & SMS Invite Generator */}
            <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  {language === 'bn' ? 'অ্যাপ অ্যাক্সেস পিন কোড (৬-ডিজিট)' : 'App Access PIN Code (6-Digit)'}
                </span>

                <button
                  type="button"
                  onClick={handleGenerateNewPin}
                  className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400 underline cursor-pointer"
                >
                  {language === 'bn' ? 'নতুন পিন জেনারেট' : 'Regenerate PIN'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={permAccessPin}
                  onChange={(e) => setPermAccessPin(e.target.value)}
                  className="w-32 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-center font-mono font-bold tracking-widest text-sm text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-amber-500"
                />

                <button
                  type="button"
                  onClick={handleCopyPin}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-semibold flex items-center gap-1 hover:bg-amber-700 transition-colors cursor-pointer"
                >
                  {isCopiedPin ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopiedPin ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'পিন কপি' : 'Copy PIN')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySms}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold flex items-center gap-1 hover:bg-indigo-700 transition-colors cursor-pointer ml-auto"
                >
                  {isCopiedSms ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isCopiedSms ? (language === 'bn' ? 'এসএমএস কপি হয়েছে' : 'Copied SMS') : (language === 'bn' ? 'অনুমতির এসএমএস কপি' : 'Copy SMS Invite')}</span>
                </button>
              </div>

              <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-snug">
                {language === 'bn'
                  ? 'এই পিন কোডটি অভিভাবক বা শিক্ষককে মেসেজে পাঠালে তারা পাসওয়ার্ড মনে না থাকলেও এক ক্লিকে সরাসরি অ্যাপে প্রবেশ করতে পারবেন।'
                  : 'Share this PIN with the user for instant, passwordless mobile access.'}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button variant="outline" type="button" onClick={() => setIsPermModalOpen(false)}>
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button id="save-permissions-modal-btn" variant="primary" type="submit" leftIcon={<ShieldCheck className="w-4 h-4" />}>
                {language === 'bn' ? 'অনুমতি সংরক্ষণ করুন' : 'Save Permissions'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 6. Create / Edit User Modal */}
      <Modal
        id="user-modal"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingUser
            ? (language === 'bn' ? 'ব্যবহারকারী তথ্য হালনাগাদ' : 'Edit User')
            : (language === 'bn'
                ? isAssistantTeacher ? 'নতুন অভিভাবক নিবন্ধন ও অনুমতি' : 'নতুন ব্যবহারকারী তৈরি ও অনুমতি প্রদান'
                : isAssistantTeacher ? 'Register Guardian & Grant Access' : 'Create User & Grant App Access')
        }
        maxWidth="md"
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <Input
            id="modal-user-name"
            label={language === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}
            placeholder={
              roleId === 'teacher'
                ? 'মাওলানা আব্দুর রহমান'
                : 'আলহাজ্ব মোঃ কামরুল ইসলাম'
            }
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="modal-user-mobile"
              label={language === 'bn' ? 'মোবাইল নম্বর (লগইন আইডি)' : 'Mobile Number (Login ID)'}
              placeholder="01711000222"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
            <Input
              id="modal-user-email"
              type="email"
              label={language === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
              placeholder="user@darululoom.edu.bd"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'নির্ধারিত ভূমিকা (Role)' : 'Assigned Role'}
              </label>
              <select
                id="modal-user-role"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value as RoleSlug)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500"
              >
                {/* Assistant teacher can ONLY select guardian */}
                {isAssistantTeacher ? (
                  <option value="guardian">{language === 'bn' ? '👨‍👩‍👦 অভিভাবক (Guardian)' : 'Guardian'}</option>
                ) : (
                  <>
                    <option value="teacher">{language === 'bn' ? '👨‍🏫 সহকারী শিক্ষক (Assistant Teacher)' : 'Assistant Teacher'}</option>
                    <option value="guardian">{language === 'bn' ? '👨‍👩‍👦 অভিভাবক (Guardian)' : 'Guardian'}</option>
                    {isSuperAdmin && (
                      <option value="principal">{language === 'bn' ? '👑 মুহতামিম / পরিচালক (Principal / Director)' : 'Principal / Director'}</option>
                    )}
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'অ্যাকাউন্ট অবস্থা' : 'Account Status'}
              </label>
              <select
                id="modal-user-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="active">{language === 'bn' ? 'সক্রিয় (Active)' : 'Active'}</option>
                <option value="pending">{language === 'bn' ? 'অনুমোদনাধীন (Pending)' : 'Pending'}</option>
                <option value="suspended">{language === 'bn' ? 'স্থগিত (Suspended)' : 'Suspended'}</option>
              </select>
            </div>
          </div>

          {/* App Access Permission Checkbox */}
          <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/80 space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={grantAppAccessImmediately}
                onChange={(e) => setGrantAppAccessImmediately(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                {language === 'bn'
                  ? 'তৈরি করার সাথে সাথেই অ্যাপ চালানোর অনুমতি প্রদান করুন'
                  : 'Grant App Access Immediately upon creation'}
              </span>
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6.5">
              {language === 'bn'
                ? isAssistantTeacher
                  ? 'সহকারী শিক্ষক হিসেবে আপনি এই অভিভাবককে অ্যাপে লগইন করার সরাসরি অনুমতি দিচ্ছেন।'
                  : 'মুহতামিম/পরিচালক হিসেবে আপনি এই ব্যবহারকারীকে অ্যাপে প্রবেশের পূর্ণ অনুমোদন দিচ্ছেন।'
                : 'Grants access directly into the institution portal.'}
            </p>

            {/* Extra checkbox for teachers: Can grant guardian access */}
            {roleId === 'teacher' && isMuhtamimOrDirector && (
              <label className="flex items-center gap-2.5 cursor-pointer pt-1 pl-6.5">
                <input
                  type="checkbox"
                  checked={teacherCanGrantGuardian}
                  onChange={(e) => setTeacherCanGrantGuardian(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                  {language === 'bn'
                    ? 'এই সহকারী শিক্ষককে অভিভাবকদের অ্যাপ ব্যবহারের অনুমতি দেওয়ার ক্ষমতা দিন'
                    : 'Authorize this Assistant Teacher to grant app access to Guardians'}
                </span>
              </label>
            )}
          </div>

          {!editingUser && (
            <div className="relative">
              <Input
                id="modal-user-password"
                type={showPassword ? 'text' : 'password'}
                label={language === 'bn' ? 'প্রাথমিক পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'Initial Password (min 6 chars)'}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button id="modal-user-save-btn" variant="primary" type="submit">
              {language === 'bn' ? 'সংরক্ষণ ও অনুমতি প্রদান' : 'Save & Authorize'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 7. Reset Password Modal */}
      <Modal
        id="reset-pass-modal"
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title={language === 'bn' ? `পাসওয়ার্ড রিসেট: ${targetResetUser?.name}` : `Reset Password: ${targetResetUser?.name}`}
        maxWidth="sm"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-xs text-slate-500">
            {language === 'bn'
              ? 'নতুন পাসওয়ার্ড লিখুন। সংরক্ষণের সাথে সাথে সল্টেড SHA-256 দিয়ে এনক্রিপ্ট হয়ে ডাটাবেজে সংরক্ষিত হবে।'
              : 'Enter a new password. It will be hashed using salted SHA-256.'}
          </p>

          <Input
            id="admin-new-password-input"
            type="password"
            label={language === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}
            placeholder="কমপক্ষে ৬ অক্ষর"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoFocus
          />

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsResetModalOpen(false)}>
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button id="confirm-admin-reset-btn" variant="primary" type="submit">
              {language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 8. Delete User Confirmation */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={language === 'bn' ? 'ব্যবহারকারী মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Delete User'}
        message={
          language === 'bn'
            ? `আপনি কি নিশ্চিত যে [${targetDeleteUser?.name}] ব্যবহারকারীকে ডাটাবেজ থেকে মুছে ফেলতে চান?`
            : `Are you sure you want to delete user [${targetDeleteUser?.name}]?`
        }
        confirmText={language === 'bn' ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete'}
        variant="danger"
      />
    </div>
  );
};
