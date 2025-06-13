import { Plus } from "lucide-react";

import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import RecentProjects from "@/components/community/project/recent-projects";
import RecentTasks from "@/components/community/task/recent-tasks";
import RecentMembers from "@/components/community/member/recent-members";

const CommunityDashboard = () => {
  const { onOpen } = useCreateProjectDialog();

  return (
    <main className="flex flex-1 flex-col py-4 md:pt-3">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Workspace Overview
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s an overview for this workspace!
          </p>
        </div>
        <button onClick={onOpen}>
          <Plus />
          New Project
        </button>
      </div>

      <div className="mt-4">
        Recent Projects
        Recent Tasks
        Recent Members
        <RecentProjects />
        <RecentTasks />
        <RecentMembers />
      </div>
    </main>
  );
};

export default CommunityDashboard;
