import ProjectAnalytics from "../../components/community/project/project-analytics";
import ProjectHeader from "../../components/community/project/project-header";
import TaskTable from "../../components/community/task/task-table";

const ProjectDetails = () => {
  return (
    <div className="w-full space-y-6 py-4 md:pt-3">
      <ProjectHeader />
      <div className="space-y-5">
        <ProjectAnalytics />
        <TaskTable />
      </div>
    </div>
  );
};

export default ProjectDetails;
