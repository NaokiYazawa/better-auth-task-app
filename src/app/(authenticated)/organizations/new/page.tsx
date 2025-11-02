import { OrganizationForm } from "./_components/organization-form";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <OrganizationForm />
      </main>
    </div>
  );
}
