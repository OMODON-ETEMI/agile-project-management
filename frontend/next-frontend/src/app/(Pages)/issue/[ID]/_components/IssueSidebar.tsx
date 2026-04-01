import UserAvatar from "@/src/components/ui/avatar";

export default function IssueSidebar() {
  return (
    <aside className="w-full lg:w-[280px] bg-slate-900 rounded-xl p-6 space-y-6">
      <div>
        <h3 className="text-sm text-slate-400 mb-1">Assigned To</h3>
        <UserAvatar name="Daniel Miller" imgSrc="/avatars/daniel.png" />
      </div>
      <div>
        <h3 className="text-sm text-slate-400 mb-1">Activity</h3>
        <UserAvatar name="John Doe" description="created this issue" imgSrc="/avatars/john.png" />
      </div>
    </aside>
  );
}
