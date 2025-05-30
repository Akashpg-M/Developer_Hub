import { AppDataSource } from '../config/db';
import { CommunityMember } from '../models/CommunityMember';
import { Like } from 'typeorm';

export class CommunityService {
  private memberRepository = AppDataSource.getRepository(CommunityMember);

  async listMembers(page: number = 1, limit: number = 10) {
    const [members, total] = await this.memberRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        points: 'DESC',
        joinedAt: 'DESC'
      }
    });

    return {
      members,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async searchMembers(query: string, page: number = 1, limit: number = 10) {
    const [members, total] = await this.memberRepository.findAndCount({
      where: [
        { user: { name: Like(`%${query}%`) } },
        { user: { email: Like(`%${query}%`) } }
      ],
      skip: (page - 1) * limit,
      take: limit,
      order: {
        points: 'DESC',
        joinedAt: 'DESC'
      }
    });

    return {
      members,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getMemberRank(userId: string) {
    const member = await this.memberRepository.findOne({
      where: { user: { id: userId } }
    });

    if (!member) {
      throw new Error('Member not found');
    }

    return member.rank;
  }
} 