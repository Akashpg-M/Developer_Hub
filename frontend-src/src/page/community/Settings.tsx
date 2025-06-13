import CommunityHeader from "@/components/community/common/community-header";
import EditCommunityForm from "@/components/community/edit-community-form";
import DeleteCommunityCard from "@/components/community/settings/delete-community-card";
import { Permissions } from "@/constant";
import withPermission from "@/hoc/with-permission";

const Settings = () => {
  return (
    <div className="w-full h-auto py-2">
      <CommunityHeader />
      <main>
        <div className="w-full max-w-3xl mx-auto py-3">
          <h2 className="text-[20px] leading-[30px] font-semibold mb-3">
            Community settings
          </h2>

          <div className="flex flex-col pt-0.5 px-0 ">
            <div className="pt-2">
              <EditCommunityForm />
            </div>
            <div className="pt-2">
              <DeleteCommunityCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const SettingsWithPermission = withPermission(
  Settings,
  Permissions.MANAGE_WORKSPACE_SETTINGS
);

export default SettingsWithPermission;
