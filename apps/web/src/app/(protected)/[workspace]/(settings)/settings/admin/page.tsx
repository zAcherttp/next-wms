export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-3xl">Administration</h1>
        <p className="text-muted-foreground">
          Manage workspace settings, members, and organization
        </p>
      </div>

      {/* Workspace Section */}
      <div className="space-y-4">
        <div>
          <h2 className="font-medium text-xl">Workspace</h2>
          <p className="text-muted-foreground text-sm">
            Configure workspace logo, name, and URL
          </p>
        </div>
        {/* Workspace settings will be implemented in next task */}
        <div className="rounded-lg border p-4">
          <p className="text-sm">Workspace settings will be displayed here</p>
        </div>
      </div>

      {/* Members Section */}
      <div className="space-y-4">
        <div>
          <h2 className="font-medium text-xl">Members</h2>
          <p className="text-muted-foreground text-sm">
            Invite members, manage roles, and view team activity
          </p>
        </div>
        {/* Members management will be implemented in next task */}
        <div className="rounded-lg border p-4">
          <p className="text-sm">Members management will be displayed here</p>
        </div>
      </div>

      {/* Dangerzone Section */}
      <div className="space-y-4">
        <div>
          <h2 className="font-medium text-xl">Dangerzone</h2>
          <p className="text-muted-foreground text-sm">
            Irreversible and destructive actions
          </p>
        </div>
        {/* Dangerzone actions will be implemented in next task */}
        <div className="rounded-lg border border-destructive/50 p-4">
          <p className="text-sm">Dangerous actions will be displayed here</p>
        </div>
      </div>
    </div>
  );
}
