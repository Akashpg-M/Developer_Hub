import { Request, Response } from 'express';
import prisma from '../../../auth_app/lib/prisma';
import cloudinary from '../lib/cloudinary';
import { getReceiverSocketId, io } from '../lib/socket';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    name: string;
    email: string;
    provider: string;
    isEmailVerified: boolean;
    role: string;
  };
}

// Get users (for one-to-one chat selection)
export const getUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { id: { not: req.user.id } },
      select: { id: true, name: true, email: true }
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get one-to-one messages
export const getPrivateMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: otherUserId } = req.params;
    const myId = req.user.id;
    const messages = await prisma.message.findMany({
      where: {
        chatType: 'PRIVATE',
        OR: [
          { senderId: myId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: myId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Send one-to-one message
export const sendPrivateMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user.id;
    const { text, image } = req.body as { text?: string; image?: string };
    let imageUrl: string | undefined;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        text,
        image: imageUrl,
        chatType: 'PRIVATE'
      }
    });
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new-message', newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get group messages
export const getGroupMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { communityId } = req.params;
    const messages = await prisma.message.findMany({
      where: {
        chatType: 'GROUP',
        communityId
      },
      orderBy: { createdAt: 'asc' }
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Send group message
export const sendGroupMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { communityId } = req.params;
    const senderId = req.user.id;
    const { text, image } = req.body as { text?: string; image?: string };
    let imageUrl: string | undefined;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = await prisma.message.create({
      data: {
        senderId,
        communityId,
        text,
        image: imageUrl,
        chatType: 'GROUP'
      }
    });
    io.to(communityId).emit('new-group-message', newMessage);
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}; 