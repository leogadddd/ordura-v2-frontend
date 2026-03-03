import { Card, Page, PageHeader } from "@/components/layout/Page";

function SettingsPage() {
  return (
    <Page className="gap-4 overflow-y-auto">
      <PageHeader
        title="Settings"
        subtitle="Configuration options will appear here."
      />
      <Card className="border-dashed">
        <div className="p-6 text-gray-500">
          This page is intentionally left blank for now.
        </div>
      </Card>
    </Page>
  );
}

export default SettingsPage;
