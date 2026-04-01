export default function IssueHeader() {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <h1 className="text-2xl font-semibold">Issue Detail</h1>
      <div className="flex flex-wrap gap-2">
        <select className="bg-slate-800 px-3 py-1 rounded text-sm">
          <option>Status: Open</option>
        </select>
        <select className="bg-slate-800 px-3 py-1 rounded text-sm">
          <option>Priority: High</option>
        </select>
        <select className="bg-slate-800 px-3 py-1 rounded text-sm">
          <option>Assignee</option>
        </select>
      </div>
    </div>
  );
}
