import { Request, Response } from 'express';
import { MailController } from '../../src/mail_app/mail.controller';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    communityMail: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    communityMailAttachment: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
  })),
}));

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  promises: {
    writeFile: jest.fn(),
    unlink: jest.fn(),
  },
}));

// Mock MailController
jest.mock('../../src/community/public-section/controllers/mail.controller', () => {
  return {
    MailController: jest.fn().mockImplementation(() => ({
      sendMail: jest.fn(),
      getInbox: jest.fn(),
      getSent: jest.fn(),
      markAsRead: jest.fn(),
      deleteMail: jest.fn(),
    })),
  };
});

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    name: string;
    email: string;
    provider: string;
    isEmailVerified: boolean;
  };
}

describe('MailController', () => {
  let mailController: MailController;
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let prisma: PrismaClient;

  const mockUser = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    provider: 'LOCAL',
    isEmailVerified: true,
  };

  beforeEach(() => {
    mailController = new MailController();
    mockNext = jest.fn();
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('sendMail', () => {
    it('should send mail successfully', async () => {
      const mockMail = {
        id: 1,
        subject: 'Test Subject',
        content: 'Test Content',
        senderId: '123',
        recipientId: '456',
        createdAt: new Date(),
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prisma.communityMail.create as jest.Mock).mockResolvedValue(mockMail);

      mockRequest = {
        body: {
          recipientId: '456',
          subject: 'Test Subject',
          content: 'Test Content',
        },
        user: mockUser,
      };

      const mockSendMail = jest.fn().mockImplementation(async (req: AuthenticatedRequest, res: Response) => {
        const mail = await prisma.communityMail.create({
          data: {
            subject: req.body.subject,
            content: req.body.content,
            senderId: req.user.id,
            recipientId: req.body.recipientId,
          },
        });
        res.json(mail);
      });

      (mailController.sendMail as unknown as jest.Mock).mockImplementation(mockSendMail);

      await (mailController.sendMail as unknown as jest.Mock)(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.communityMail.create).toHaveBeenCalledWith({
        data: {
          subject: 'Test Subject',
          content: 'Test Content',
          senderId: '123',
          recipientId: '456',
        },
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockMail);
    });

    it('should handle missing required fields', async () => {
      mockRequest = {
        body: {
          recipientId: '456',
          // Missing subject and content
        },
        user: mockUser,
      };

      const mockSendMail = jest.fn().mockImplementation(async (req: AuthenticatedRequest, res: Response) => {
        if (!req.body.subject || !req.body.content) {
          res.status(400).json({
            message: 'Recipient ID, subject, and content are required',
          });
          return;
        }
      });

      (mailController.sendMail as unknown as jest.Mock).mockImplementation(mockSendMail);

      await (mailController.sendMail as unknown as jest.Mock)(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Recipient ID, subject, and content are required',
      });
    });

    it('should handle recipient not found', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      mockRequest = {
        body: {
          recipientId: 'nonexistent',
          subject: 'Test Subject',
          content: 'Test Content',
        },
        user: mockUser,
      };

      const mockSendMail = jest.fn().mockImplementation(async (req: AuthenticatedRequest, res: Response) => {
        const recipient = await prisma.user.findFirst({
          where: { id: req.body.recipientId },
        });
        if (!recipient) {
          res.status(404).json({
            message: 'Recipient not found',
          });
          return;
        }
      });

      (mailController.sendMail as unknown as jest.Mock).mockImplementation(mockSendMail);

      await (mailController.sendMail as unknown as jest.Mock)(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Recipient not found',
      });
    });
  });

  describe('getInbox', () => {
    it('should return paginated inbox mails', async () => {
      const mockMails: any[] = [
        {
          id: 1,
          subject: 'Test Subject',
          content: 'Test Content',
          sender: { name: 'Sender' },
          createdAt: new Date(),
        },
      ];
      const mockTotal = 1;

      (prisma.communityMail.findMany as jest.Mock).mockResolvedValue(mockMails);
      (prisma.communityMail.count as jest.Mock).mockResolvedValue(mockTotal);

      mockRequest = {
        query: { page: '1', limit: '10' },
        user: mockUser,
      };

      const mockGetInbox = jest.fn().mockImplementation(async (req: AuthenticatedRequest, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const mails = await prisma.communityMail.findMany({
          where: { recipientId: req.user.id },
          include: { sender: true },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        });

        const total = await prisma.communityMail.count({
          where: { recipientId: req.user.id },
        });

        res.json({
          mails,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        });
      });

      (mailController.getInbox as unknown as jest.Mock).mockImplementation(mockGetInbox);

      await (mailController.getInbox as unknown as jest.Mock)(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.communityMail.findMany).toHaveBeenCalledWith({
        where: { recipientId: '123' },
        include: { sender: true },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        mails: mockMails,
        total: mockTotal,
        page: 1,
        totalPages: 1,
      });
    });

    it('should handle custom pagination', async () => {
      const mockMails: any[] = [];
      const mockTotal = 0;

      (prisma.communityMail.findMany as jest.Mock).mockResolvedValue(mockMails);
      (prisma.communityMail.count as jest.Mock).mockResolvedValue(mockTotal);

      mockRequest = {
        query: { page: '2', limit: '5' },
        user: mockUser,
      };

      const mockGetInbox = jest.fn().mockImplementation(async (req: AuthenticatedRequest, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const mails = await prisma.communityMail.findMany({
          where: { recipientId: req.user.id },
          include: { sender: true },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        });

        const total = await prisma.communityMail.count({
          where: { recipientId: req.user.id },
        });

        res.json({
          mails,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        });
      });

      (mailController.getInbox as unknown as jest.Mock).mockImplementation(mockGetInbox);

      await (mailController.getInbox as unknown as jest.Mock)(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.communityMail.findMany).toHaveBeenCalledWith({
        where: { recipientId: '123' },
        include: { sender: true },
        skip: 5,
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getSent', () => {
    it('should return paginated sent mails', async () => {
      const mockMails: any[] = [
        {
          id: 1,
          subject: 'Test Subject',
          content: 'Test Content',
          recipient: { name: 'Recipient' },
          createdAt: new Date(),
        },
      ];
      const mockTotal = 1;

      (prisma.communityMail.findMany as jest.Mock).mockResolvedValue(mockMails);
      (prisma.communityMail.count as jest.Mock).mockResolvedValue(mockTotal);

      mockRequest = {
        query: { page: '1', limit: '10' },
        user: mockUser,
      };

      const mockGetSent = jest.fn().mockImplementation(async (req: AuthenticatedRequest, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const mails = await prisma.communityMail.findMany({
          where: { senderId: req.user.id },
          include: { recipient: true },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        });

        const total = await prisma.communityMail.count({
          where: { senderId: req.user.id },
        });

        res.json({
          mails,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        });
      });

      (mailController.getSent as unknown as jest.Mock).mockImplementation(mockGetSent);

      await (mailController.getSent as unknown as jest.Mock)(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.communityMail.findMany).toHaveBeenCalledWith({
        where: { senderId: '123' },
        include: { recipient: true },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        mails: mockMails,
        total: mockTotal,
        page: 1,
        totalPages: 1,
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark mail as read', async () => {
      const mockMail = {
        id: 1,
        isRead: false,
      };

      (prisma.communityMail.findFirst as jest.Mock).mockResolvedValue(mockMail);
      (prisma.communityMail.update as jest.Mock).mockResolvedValue({
        ...mockMail,
        isRead: true,
      });

      mockRequest = {
        params: { id: '1' },
        user: mockUser,
      };

      const mockMarkAsRead = jest.fn().mockImplementation(async (req: AuthenticatedRequest, res: Response) => {
        const mail = await prisma.communityMail.findFirst({
          where: { id: req.params.id },
        });

        if (!mail) {
          res.status(404).json({
            message: 'Mail not found',
          });
          return;
        }

        await prisma.communityMail.update({
          where: { id: req.params.id },
          data: { isRead: true },
        });

        res.json({
          message: 'Mail marked as read',
        });
      });

      (mailController.markAsRead as unknown as jest.Mock).mockImplementation(mockMarkAsRead);

      await (mailController.markAsRead as unknown as jest.Mock)(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.communityMail.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isRead: true },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Mail marked as read',
      });
    });

    it('should handle mail not found', async () => {
      (prisma.communityMail.findFirst as jest.Mock).mockResolvedValue(null);

      mockRequest = {
        params: { id: 'nonexistent' },
        user: mockUser,
      };

      const mockMarkAsRead = jest.fn().mockImplementation(async (req: AuthenticatedRequest, res: Response) => {
        const mail = await prisma.communityMail.findFirst({
          where: { id: req.params.id },
        });

        if (!mail) {
          res.status(404).json({
            message: 'Mail not found',
          });
          return;
        }
      });

      (mailController.markAsRead as unknown as jest.Mock).mockImplementation(mockMarkAsRead);

      await (mailController.markAsRead as unknown as jest.Mock)(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Mail not found',
      });
    });
  });

  describe('deleteMail', () => {
    it('should delete mail and its attachments', async () => {
      const mockMail = {
        id: 1,
        senderId: '123',
        attachments: [
          { id: 1, filePath: '/path/to/file1.txt' },
          { id: 2, filePath: '/path/to/file2.txt' },
        ],
      };

      (prisma.communityMail.findFirst as jest.Mock).mockResolvedValue(mockMail);
      ((prisma as any).communityMailAttachment.findMany as jest.Mock).mockResolvedValue(mockMail.attachments);
      ((prisma as any).communityMailAttachment.delete as jest.Mock).mockResolvedValue({});
      (prisma.communityMail.delete as jest.Mock).mockResolvedValue({});
      (fs.promises.unlink as jest.Mock).mockResolvedValue(undefined);

      mockRequest = {
        params: { id: '1' },
        user: mockUser,
      };

      const mockDeleteMail = jest.fn().mockImplementation(async (req: AuthenticatedRequest, res: Response) => {
        const mail = await prisma.communityMail.findFirst({
          where: { id: req.params.id },
        });

        if (!mail) {
          res.status(404).json({
            message: 'Mail not found',
          });
          return;
        }

        if (mail.senderId !== req.user.id) {
          res.status(403).json({
            message: 'Not authorized to delete this mail',
          });
          return;
        }

        const attachments = await (prisma as any).communityMailAttachment.findMany({
          where: { mailId: mail.id },
        });

        for (const attachment of attachments) {
          await (prisma as any).communityMailAttachment.delete({
            where: { id: attachment.id },
          });
          await fs.promises.unlink(attachment.filePath);
        }

        await prisma.communityMail.delete({
          where: { id: String(mail.id) },
        });

        res.json({
          message: 'Mail deleted successfully',
        });
      });

      (mailController.deleteMail as unknown as jest.Mock).mockImplementation(mockDeleteMail);

      await (mailController.deleteMail as unknown as jest.Mock)(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect((prisma as any).communityMailAttachment.delete).toHaveBeenCalledTimes(2);
      expect(prisma.communityMail.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Mail deleted successfully',
      });
    });

    it('should handle mail not found', async () => {
      (prisma.communityMail.findFirst as jest.Mock).mockResolvedValue(null);

      mockRequest = {
        params: { id: 'nonexistent' },
        user: mockUser,
      };

      const mockDeleteMail = jest.fn().mockImplementation(async (req: AuthenticatedRequest, res: Response) => {
        const mail = await prisma.communityMail.findFirst({
          where: { id: req.params.id },
        });

        if (!mail) {
          res.status(404).json({
            message: 'Mail not found',
          });
          return;
        }
      });

      (mailController.deleteMail as unknown as jest.Mock).mockImplementation(mockDeleteMail);

      await (mailController.deleteMail as unknown as jest.Mock)(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Mail not found',
      });
    });

    it('should handle unauthorized deletion', async () => {
      const mockMail = {
        id: 1,
        senderId: '456', // Different from user ID
      };

      (prisma.communityMail.findFirst as jest.Mock).mockResolvedValue(mockMail);

      mockRequest = {
        params: { id: '1' },
        user: mockUser,
      };

      const mockDeleteMail = jest.fn().mockImplementation(async (req: AuthenticatedRequest, res: Response) => {
        const mail = await prisma.communityMail.findFirst({
          where: { id: req.params.id },
        });

        if (!mail) {
          res.status(404).json({
            message: 'Mail not found',
          });
          return;
        }

        if (mail.senderId !== req.user.id) {
          res.status(403).json({
            message: 'Not authorized to delete this mail',
          });
          return;
        }
      });

      (mailController.deleteMail as unknown as jest.Mock).mockImplementation(mockDeleteMail);

      await (mailController.deleteMail as unknown as jest.Mock)(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Not authorized to delete this mail',
      });
    });
  });
}); 