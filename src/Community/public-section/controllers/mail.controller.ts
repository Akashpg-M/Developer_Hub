import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        provider: string;
        isEmailVerified: boolean;
      };
    }
  }
}

export class MailController {
  sendMail = [
    upload.array('attachments', 5),
    async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
      try {
        const { recipientId, subject, content } = req.body;
        const files = req.files as Express.Multer.File[];

        if (!recipientId || !subject || !content) {
          return res.status(400).json({ message: 'Missing required fields' });
        }

        const recipient = await prisma.user.findUnique({
          where: { id: recipientId }
        });

        if (!recipient) {
          return res.status(404).json({ message: 'Recipient not found' });
        }

        const attachmentPaths = files?.map(file => {
          const fileName = `${Date.now()}-${file.originalname}`;
          const filePath = path.join(uploadDir, fileName);
          fs.writeFileSync(filePath, file.buffer);
          return fileName;
        });

        const mail = await prisma.communityMail.create({
          data: {
            senderId: req.user!.id,
            recipientId,
            subject,
            content,
            attachments: attachmentPaths || []
          }
        });

        return res.status(201).json(mail);
      } catch (error) {
        return next(error);
      }
    }
  ];

  async getInbox(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const [mails, total] = await Promise.all([
        prisma.communityMail.findMany({
          where: { recipientId: req.user!.id },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.communityMail.count({
          where: { recipientId: req.user!.id }
        })
      ]);

      return res.json({
        mails,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      return next(error);
    }
  }

  async getSent(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const [mails, total] = await Promise.all([
        prisma.communityMail.findMany({
          where: { senderId: req.user!.id },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.communityMail.count({
          where: { senderId: req.user!.id }
        })
      ]);

      return res.json({
        mails,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      return next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { mailId } = req.params;
      const mail = await prisma.communityMail.findFirst({
        where: { id: mailId, recipientId: req.user!.id }
      });

      if (!mail) {
        return res.status(404).json({ message: 'Mail not found' });
      }

      const updatedMail = await prisma.communityMail.update({
        where: { id: mailId },
        data: { isRead: true }
      });

      return res.json(updatedMail);
    } catch (error) {
      return next(error);
    }
  }

  async deleteMail(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { mailId } = req.params;
      const mail = await prisma.communityMail.findFirst({
        where: {
          OR: [
            { id: mailId, senderId: req.user!.id },
            { id: mailId, recipientId: req.user!.id }
          ]
        }
      });

      if (!mail) {
        return res.status(404).json({ message: 'Mail not found' });
      }

      // Delete attachments if they exist
      if (mail.attachments?.length) {
        mail.attachments.forEach((fileName: string) => {
          const filePath = path.join(uploadDir, fileName);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }

      await prisma.communityMail.delete({
        where: { id: mailId }
      });

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
} 