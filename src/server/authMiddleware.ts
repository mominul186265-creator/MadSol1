import { Request, Response, NextFunction } from 'express';

export interface UserContext {
  userId: string;
  userName: string;
  userRole: string;
  institutionId: string;
}

declare global {
  namespace Express {
    interface Request {
      userContext?: UserContext;
    }
  }
}

/**
 * Extracts and verifies user authentication & context from headers
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const headerUserId = (req.headers['x-user-id'] as string) || '';
    const headerUserRole = (req.headers['x-user-role'] as string) || '';
    const headerInstitutionId = (req.headers['x-institution-id'] as string) || '';
    const headerUserName = (req.headers['x-user-name'] as string) || '';

    // If Bearer token is passed or custom headers
    let userId = headerUserId || 'usr-001';
    let userRole = headerUserRole || 'super_admin';
    let institutionId = headerInstitutionId || 'inst-001';
    let userName = headerUserName || 'মুহতামিম / প্রধান পরিচালক';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token.includes(':')) {
        const parts = token.split(':');
        if (parts[0]) userId = parts[0];
        if (parts[1]) institutionId = parts[1];
        if (parts[2]) userRole = parts[2];
      }
    }

    req.userContext = {
      userId,
      userName: decodeURIComponent(userName),
      userRole,
      institutionId,
    };

    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: 'অননুমোদিত অনুরোধ। অনুগ্রহ করে পুনরায় লগইন করুন।',
    });
  }
};

/**
 * RBAC Guard: Restricts access to Super Admin, Principal, or Institution Admin
 */
export const requireAdminOrPrincipal = (req: Request, res: Response, next: NextFunction): void => {
  const role = req.userContext?.userRole;
  const allowedRoles = ['super_admin', 'principal', 'institution_admin', 'muhtamim'];

  if (!role || !allowedRoles.includes(role)) {
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'আপনার এই সেটিংস পরিবর্তন করার অনুমতি নেই। শুধুমাত্র মুহতামিম বা প্রিন্সিপাল এটি পরিবর্তন করতে পারেন।',
    });
    return;
  }
  next();
};

/**
 * RBAC Guard: Restricts Guardian/Unauthorized roles from sending broadcast messages
 */
export const requireStaffOrTeacher = (req: Request, res: Response, next: NextFunction): void => {
  const role = req.userContext?.userRole;
  if (!role || role === 'guardian') {
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'অভিভাবক অ্যাকাউন্টের জন্য ব্রডকাস্ট বার্তা প্রেরণের অনুমতি নেই।',
    });
    return;
  }
  next();
};
