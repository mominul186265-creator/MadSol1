import { Router, Request, Response } from 'express';
import { authMiddleware, requireAdminOrPrincipal, requireStaffOrTeacher } from '../authMiddleware';
import { CommunicationManager } from './services/CommunicationManager';

export const communicationRouter = Router();

// Apply auth middleware to all communication routes
communicationRouter.use(authMiddleware);

const manager = CommunicationManager.getInstance();

/**
 * GET /api/communication/status
 * Returns masked provider configuration and connection state
 */
communicationRouter.get('/status', (req: Request, res: Response) => {
  try {
    const institutionId = req.userContext?.institutionId || 'inst-001';
    const config = manager.getMaskedConfig(institutionId);
    res.json({
      success: true,
      data: config,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to fetch status',
    });
  }
});

/**
 * POST /api/communication/config
 * Updates provider configuration (Restricted to Super Admin / Principal / Muhtamim)
 */
communicationRouter.post('/config', requireAdminOrPrincipal, (req: Request, res: Response) => {
  try {
    const institutionId = req.userContext?.institutionId || 'inst-001';
    const updated = manager.updateConfig(institutionId, req.body, req.userContext!);
    res.json({
      success: true,
      message: 'প্রোভাইডার কনফিগারেশন সফলভাবে হালনাগাদ করা হয়েছে।',
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to update config',
    });
  }
});

/**
 * POST /api/communication/test-connection
 * Tests provider gateway connectivity and balance
 */
communicationRouter.post('/test-connection', async (req: Request, res: Response) => {
  try {
    const institutionId = req.userContext?.institutionId || 'inst-001';
    const testResult = await manager.testConnection(institutionId);
    res.json(testResult);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Connection test failed',
    });
  }
});

/**
 * GET /api/communication/messages
 * Retrieves communication message history with institution isolation
 */
communicationRouter.get('/messages', (req: Request, res: Response) => {
  try {
    const institutionId = req.userContext?.institutionId || 'inst-001';
    const messages = manager.getMessages(institutionId);
    res.json({
      success: true,
      data: messages,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to fetch messages',
    });
  }
});

/**
 * GET /api/communication/messages/:id
 * Retrieves detail of a single communication message
 */
communicationRouter.get('/messages/:id', (req: Request, res: Response) => {
  try {
    const institutionId = req.userContext?.institutionId || 'inst-001';
    const message = manager.getMessageById(institutionId, req.params.id);
    if (!message) {
      res.status(404).json({
        success: false,
        error: 'Message not found',
        message: 'বার্তাটি পাওয়া যায়নি।',
      });
      return;
    }
    res.json({
      success: true,
      data: message,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to fetch message details',
    });
  }
});

/**
 * POST /api/communication/send-sms
 * Sends or schedules SMS broadcast (Guarded by Teacher/Staff permission)
 */
communicationRouter.post('/send-sms', requireStaffOrTeacher, async (req: Request, res: Response) => {
  try {
    const institutionId = req.userContext?.institutionId || 'inst-001';
    const result = await manager.sendSms(institutionId, req.body, req.userContext!);
    if (!result.success && result.error === 'INSUFFICIENT_BALANCE') {
      res.status(402).json(result);
      return;
    }
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Internal error sending SMS',
      message: 'এসএমএস প্রেরণ করার সময় সার্ভারে ত্রুটি ঘটেছে।',
    });
  }
});

/**
 * POST /api/communication/send-voice
 * Sends or schedules Voice Call broadcast (Guarded by Teacher/Staff permission)
 */
communicationRouter.post('/send-voice', requireStaffOrTeacher, async (req: Request, res: Response) => {
  try {
    const institutionId = req.userContext?.institutionId || 'inst-001';
    const result = await manager.sendVoiceCall(institutionId, req.body, req.userContext!);
    if (!result.success && result.error === 'INSUFFICIENT_BALANCE') {
      res.status(402).json(result);
      return;
    }
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Internal error sending Voice broadcast',
      message: 'ভয়েস কল ব্রডকাস্ট করার সময় সার্ভারে ত্রুটি ঘটেছে।',
    });
  }
});

/**
 * POST /api/communication/send-now/:id
 * Immediately dispatches a scheduled message without waiting for schedule timer
 */
communicationRouter.post('/send-now/:id', requireStaffOrTeacher, async (req: Request, res: Response) => {
  try {
    const institutionId = req.userContext?.institutionId || 'inst-001';
    const result = await manager.sendNow(institutionId, req.params.id, req.userContext!);
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to dispatch scheduled message now',
      message: 'বার্তাটি তাৎক্ষণিক প্রেরণ করতে সমস্যা হয়েছে।',
    });
  }
});

/**
 * POST /api/communication/resend-failed/:id
 * Resends to failed recipients of a broadcast message with duplicate-protection & retry limits
 */
communicationRouter.post('/resend-failed/:id', requireStaffOrTeacher, async (req: Request, res: Response) => {
  try {
    const institutionId = req.userContext?.institutionId || 'inst-001';
    const result = await manager.resendFailed(institutionId, req.params.id, req.userContext!);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to resend message',
    });
  }
});

/**
 * POST /api/communication/cancel-scheduled/:id
 * Cancels a scheduled message
 */
communicationRouter.post('/cancel-scheduled/:id', requireStaffOrTeacher, (req: Request, res: Response) => {
  try {
    const institutionId = req.userContext?.institutionId || 'inst-001';
    const success = manager.cancelScheduledMessage(institutionId, req.params.id, req.userContext!);
    if (!success) {
      res.status(400).json({
        success: false,
        message: 'শিডিউল বার্তা বাতিল করা সম্ভব হয়নি বা বার্তাটি ইতিমধ্যে প্রক্রিয়াধীন।',
      });
      return;
    }
    res.json({
      success: true,
      message: 'শিডিউল বার্তা সফলভাবে বাতিল করা হয়েছে।',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to cancel scheduled message',
    });
  }
});

/**
 * GET /api/communication/logs
 * Retrieves execution audit logs for institution or specific message
 */
communicationRouter.get('/logs', (req: Request, res: Response) => {
  try {
    const institutionId = req.userContext?.institutionId || 'inst-001';
    const messageId = req.query.messageId as string | undefined;
    const logs = manager.getExecutionLogs(institutionId, messageId);
    res.json({
      success: true,
      data: logs,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to fetch execution logs',
    });
  }
});

/**
 * GET /api/communication/templates
 * Lists communication templates
 */
communicationRouter.get('/templates', (req: Request, res: Response) => {
  try {
    const institutionId = req.userContext?.institutionId || 'inst-001';
    const templates = manager.getTemplates(institutionId);
    res.json({
      success: true,
      data: templates,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to fetch templates',
    });
  }
});

/**
 * POST /api/communication/templates
 * Creates or updates a communication template
 */
communicationRouter.post('/templates', requireStaffOrTeacher, (req: Request, res: Response) => {
  try {
    const institutionId = req.userContext?.institutionId || 'inst-001';
    const template = manager.saveTemplate(institutionId, req.body);
    res.json({
      success: true,
      message: 'টেমপ্লেট সফলভাবে সংরক্ষিত হয়েছে।',
      data: template,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to save template',
    });
  }
});

/**
 * DELETE /api/communication/templates/:id
 * Deletes a communication template
 */
communicationRouter.delete('/templates/:id', requireStaffOrTeacher, (req: Request, res: Response) => {
  try {
    const institutionId = req.userContext?.institutionId || 'inst-001';
    const deleted = manager.deleteTemplate(institutionId, req.params.id);
    res.json({
      success: deleted,
      message: deleted ? 'টেমপ্লেট মুছে ফেলা হয়েছে।' : 'টেমপ্লেট খুঁজে পাওয়া যায়নি।',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to delete template',
    });
  }
});

/**
 * GET /api/communication/statistics
 * Returns real aggregated statistics
 */
communicationRouter.get('/statistics', (req: Request, res: Response) => {
  try {
    const institutionId = req.userContext?.institutionId || 'inst-001';
    const stats = manager.getStatistics(institutionId);
    res.json({
      success: true,
      data: stats,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to calculate statistics',
    });
  }
});
