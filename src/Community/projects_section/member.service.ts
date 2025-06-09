import { PrismaClient, CommunityRole } from '@prisma/client';

const prisma = new PrismaClient();

export const getMemberRoleInCommunity = async (
  userId: string,
  communityId: string
) => {
  const member = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: {
        communityId,
        userId
      }
    }
  });

  return { role: member?.role };
};

export const joinCommunityByInviteService = async (
  userId: string,
  inviteCode: string
) => {
  const invite = await prisma.communityInvite.findUnique({
    where: { code: inviteCode },
    include: { community: true }
  });

  if (!invite || invite.expiresAt < new Date()) {
    return null;
  }

  const existingMember = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: {
        communityId: invite.communityId,
        userId
      }
    }
  });

  if (existingMember) {
    return null;
  }

  const newMember = await prisma.communityMember.create({
    data: {
      communityId: invite.communityId,
      userId,
      role: CommunityRole.VIEWER
    }
  });

  return { 
    communityId: invite.communityId, 
    role: newMember.role 
  };
};
