import { Request, Response } from "express";

import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  changeRoleSchema,
  createCommunitySchema,
  communityIdSchema,
} from "../validation/community.validation";
import { HTTPSTATUS } from "../config/http.config";
import {
  changeMemberRoleService,
  createCommunityService,
  deleteCommunityService,
  getAllCommunitysUserIsMemberService,
  getCommunityAnalyticsService,
  getCommunityByIdService,
  getCommunityMembersService,
  updateCommunityByIdService,
} from "../services/community.service";
import { getMemberRoleInCommunity } from "../services/member.service";
import { Permissions } from "../enums/role.enum";
import { roleGuard } from "../utils/roleGuard";
import { updateCommunitySchema } from "../validation/community.validation";

export const createCommunityController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = createCommunitySchema.parse(req.body);

    const userId = req.user?.id;
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const { community } = await createCommunityService(userId, body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "community created successfully",
      community,
    });
  }
);

// Controller: Get all Communitys the user is part of

export const getAllCommunitysUserIsMemberController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if(!userId){
      throw new Error("User not authorized");
    }
    
    const { Communitys } = await getAllCommunitysUserIsMemberService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User Communitys fetched successfully",
      Communitys,
    });
  }
);

export const getCommunityByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const CommunityId = communityIdSchema.parse(req.params.id);
    const userId = req.user?.id;
    if (!userId) {
      throw new Error("User not authenticated");
    }
    await getMemberRoleInCommunity(userId, CommunityId);

    const { community } = await getCommunityByIdService(CommunityId);

    return res.status(HTTPSTATUS.OK).json({
      message: "community fetched successfully",
      community,
    });
  }
);

export const getCommunityMembersController = asyncHandler(
  async (req: Request, res: Response) => {
    const CommunityId = communityIdSchema.parse(req.params.id);
    const userId = req.user?.id;
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const { role } = await getMemberRoleInCommunity(userId, CommunityId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { members, roles } = await getCommunityMembersService(CommunityId);

    return res.status(HTTPSTATUS.OK).json({
      message: "community members retrieved successfully",
      members,
      roles,
    });
  }
);

export const getCommunityAnalyticsController = asyncHandler(
  async (req: Request, res: Response) => {
    const CommunityId = communityIdSchema.parse(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { role } = await getMemberRoleInCommunity(userId, CommunityId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { analytics } = await getCommunityAnalyticsService(CommunityId);

    return res.status(HTTPSTATUS.OK).json({
      message: "community analytics retrieved successfully",
      analytics,
    });
  }
);

export const changeCommunityMemberRoleController = asyncHandler(
  async (req: Request, res: Response) => {
    const CommunityId = communityIdSchema.parse(req.params.id);
    const { memberId, roleId } = changeRoleSchema.parse(req.body);

    const userId = req.user?.id;
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const { role } = await getMemberRoleInCommunity(userId, CommunityId);
    roleGuard(role, [Permissions.CHANGE_MEMBER_ROLE]);

    const { member } = await changeMemberRoleService(
      CommunityId,
      memberId,
      roleId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Member Role changed successfully",
      member,
    });
  }
);

export const updateCommunityByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const CommunityId = communityIdSchema.parse(req.params.id);
    const { name, description } = updateCommunitySchema.parse(req.body);

    const userId = req.user?.id;
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const { role } = await getMemberRoleInCommunity(userId, CommunityId);
    roleGuard(role, [Permissions.EDIT_COMMUNITY]);
    const { community } = await updateCommunityByIdService(
      CommunityId,
      name,
      description
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "community updated successfully",
      community,
    });
  }
);

export const deleteCommunityByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const CommunityId = communityIdSchema.parse(req.params.id);

    const userId = req.user?.id;
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const { role } = await getMemberRoleInCommunity(userId, CommunityId);
    roleGuard(role, [Permissions.DELETE_COMMUNITY]);

    const { currentCommunity } = await deleteCommunityService(
      CommunityId,
      userId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "community deleted successfully",
      currentCommunity,
    });
  }
);
