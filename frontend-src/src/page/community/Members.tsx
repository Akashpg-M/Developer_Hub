import InviteMember from "../../components/community/member/invite-member";
import AllMembers from "../../components/community/member/all-members";
import CommunityHeader from "../../components/community/common/community-header";

export default function Members() {
  return (
    <div className="w-full h-auto pt-2">
      <CommunityHeader />
      <main>
        <div className="w-full max-w-3xl mx-auto pt-3">
          <div>
            <h2 className="text-lg leading-[30px] font-semibold mb-1">
              Community members
            </h2>
            <p className="text-sm text-muted-foreground">
              Community members can view and join all Community project, tasks
              and create new task in the Community.
            </p>
          </div>
          <InviteMember />
          <AllMembers />
        </div>
      </main>
    </div>
  );
}
