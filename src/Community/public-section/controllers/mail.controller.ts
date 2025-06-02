import { Request, Response, NextFunction } from 'express';
import { MailService } from '../services/mail.service';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export class MailController {
  private mailService: MailService;

  constructor() {
    this.mailService = new MailService();
  }

  sendMail = [
    upload.array('attachments', 5),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { recipientId, subject, content } = req.body;
        const files = req.files as Express.Multer.File[];

        if (!recipientId || !subject || !content) {
          return res.status(400).json({ message: 'Missing required fields' });
        }

        const mail = await this.mailService.sendMail(
          req.user!,
          recipientId,
          subject,
          content,
          files
        );

        res.status(201).json(mail);
      } catch (error) {
        next(error);
      }
    }
  ];

  getInbox = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.mailService.getInbox(req.user!.id, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getSent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.mailService.getSent(req.user!.id, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { mailId } = req.params;
      const mail = await this.mailService.markAsRead(mailId, req.user!.id);
      res.json(mail);
    } catch (error) {
      next(error);
    }
  };

  deleteMail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { mailId } = req.params;
      await this.mailService.deleteMail(mailId, req.user!.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
} 