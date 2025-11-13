export default function PreferencesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-3xl">Preferences</h1>
        <p className="text-muted-foreground">
          Manage your personal preferences and settings
        </p>
      </div>

      {/* Theme Section */}
      <div className="space-y-4">
        <div>
          <h2 className="font-medium text-xl">Theme</h2>
          <p className="text-muted-foreground text-sm">
            Customize the appearance of the application
          </p>
        </div>
        {/* Theme controls will be implemented in next task */}
        <div className="rounded-lg border p-4">
          <p className="text-sm">Theme selection will be implemented here</p>
        </div>
      </div>
    </div>
  );
}
