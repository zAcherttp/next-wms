import {
  Setting,
  SettingHeader,
  SettingSection,
} from "@/components/settings/setting";

export default function PreferencesPage() {
  return (
    <Setting>
      <SettingHeader
        title="Preferences"
        description="Manage your personal preferences and settings"
      />

      <SettingSection
        title="Theme"
        description="Customize the appearance of the application"
      >
        <div className="rounded-lg border p-4">
          <p className="text-sm">Theme selection will be implemented here</p>
        </div>
      </SettingSection>
    </Setting>
  );
}
