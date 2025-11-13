export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-3xl">Security & Access</h1>
        <p className="text-muted-foreground">
          Manage your security settings and active sessions
        </p>
      </div>

      {/* Sessions Section */}
      <div className="space-y-4">
        <div>
          <h2 className="font-medium text-xl">Sessions</h2>
          <p className="text-muted-foreground text-sm">
            Manage your active sessions across different devices
          </p>
        </div>
        {/* Sessions list will be implemented in next task */}
        <div className="rounded-lg border p-4">
          <p className="text-sm">Active sessions will be displayed here</p>
        </div>
      </div>
    </div>
  );
}
