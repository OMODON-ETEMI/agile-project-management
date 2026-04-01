import Tag from "@/src/components/ui/tag";

export default function IssueDescription() {
  return (
    <div className="flex-1 bg-slate-900 rounded-xl p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Add authentication</h2>
        <div className="flex flex-wrap gap-2">
          <Tag text="Feature" variant="blue" />
          <Tag text="High" variant="red" />
          <Tag text="Open" variant="green" />
          <Tag text="2 hours ago" variant="slate" />
        </div>
      </div>
      <p className="text-slate-300">
        Implement authentication to secure the application, including user registration,
        login, and logout functionality.
      </p>
    </div>
  );
}
