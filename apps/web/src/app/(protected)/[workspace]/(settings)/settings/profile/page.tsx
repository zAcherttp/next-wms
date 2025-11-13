export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-3xl">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account settings
        </p>
      </div>

      {/* Profile Information Section */}
      <div className="space-y-4">
        <div>
          <h2 className="font-medium text-xl">Profile Information</h2>
          <p className="text-muted-foreground text-sm">
            Update your profile picture and personal details
          </p>
        </div>
        {/* Profile fields will be implemented in next task */}
        <div className="rounded-lg border p-4">
          <p className="text-sm">Profile information will be displayed here</p>
        </div>
      </div>

      {/* Workspace Access Section */}
      <div className="space-y-4">
        <div>
          <h2 className="font-medium text-xl">Workspace Access</h2>
          <p className="text-muted-foreground text-sm">
            Manage your workspace membership
          </p>
        </div>
        {/* Workspace access controls will be implemented in next task */}
        <div className="rounded-lg border p-4">
          <p className="text-sm">
            Workspace access controls will be displayed here
          </p>
        </div>
      </div>
    </div>
  );
}
