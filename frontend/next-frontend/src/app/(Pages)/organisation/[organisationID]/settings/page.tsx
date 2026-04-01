'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Settings, Trash2, Shield, Building2, Check } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from '@/components/ui/alert-dialog';
import { Organisation, Workspace } from '@/src/helpers/type';
import { deleteOrganisation, updateOrganisation } from '@/src/lib/api/organisation';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/Authentication/authcontext';
import { deleteWorkspace } from '@/src/lib/api/workspace';
import { CreateWorkspaceModal } from '@/src/features/workspace/createWorkspace';
import WorkspaceRow from './_components/workspace';


interface OrganisationSettingsProps {
  Organisation: Organisation;
  Workspace: Workspace[];
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle }: {
  icon: React.ElementType; title: string; subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-[#0052CC]/8 border border-[#0052CC]/15
        flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-[#0052CC]" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}


// ─── Main Settings Page ───────────────────────────────────────────────────────

const OrganisationSettingsPage = ({ Organisation, Workspace }: OrganisationSettingsProps) => {
  const [orgName, setOrgName]       = useState(Organisation.title);
  const [saving, setSaving]         = useState(false);
  const [deleteOrgOpen, setDeleteOrgOpen] = useState(false);
  const { currentUser }             = useAuth();
  const router                      = useRouter();

  async function update() {
    setSaving(true);
    try {
      await updateOrganisation({
        title: orgName,
        _id: Organisation._id,
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function deleteOrg() {
    try {
      await deleteOrganisation(Organisation._id)
      router.replace('/organisation');
    } catch (e) { console.error(e); }
  }

  async function deleteWorkSpace(workspace_id: string) {
    try {
      await deleteWorkspace({ woorkspace_id: workspace_id });
      router.refresh();
    } catch (e) { console.error(e); }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
          text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl lg:max-w-3xl h-[88vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0052CC] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">
                {Organisation.title.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Organisation Settings
              </DialogTitle>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">{Organisation.title}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

          {/* ── General ── */}
          <section>
            <SectionHeader icon={Building2} title="General" subtitle="Update your organisation name and details" />
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Organisation name
                  </label>
                  <Input
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    className="h-9 text-sm border-border focus:border-[#0052CC] focus:ring-[#0052CC]/20"
                  />
                </div>
              </div>
              <div className="flex justify-end px-4 py-3 border-t border-border bg-muted/30">
                <button
                  onClick={update}
                  disabled={saving || orgName === Organisation.title}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0052CC] text-white
                    hover:bg-[#0065FF] transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                    flex items-center gap-1.5"
                >
                  {saving ? (
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : <Check className="w-3.5 h-3.5" />}
                  Save changes
                </button>
              </div>
            </div>
          </section>

          {/* ── Workspaces ── */}
          <section>
            <div className="flex items-start justify-between mb-4">
              <SectionHeader
                icon={Shield}
                title="Workspaces & Members"
                subtitle="Manage workspaces and invite or remove members"
              />
              <CreateWorkspaceModal organisation={Organisation} />
            </div>
            <div className="space-y-3">
              {Workspace.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border py-10 text-center">
                  <p className="text-sm font-medium text-muted-foreground">No workspaces yet</p>
                  <p className="text-xs font-mono text-muted-foreground/60 mt-1">Create one to get started</p>
                </div>
              ) : (
                Workspace.map(ws => (
                  <WorkspaceRow key={ws._id} workspace={ws} onDelete={deleteWorkSpace} />
                ))
              )}
            </div>
          </section>

          {/* ── Danger Zone ── */}
          <section>
            <SectionHeader icon={Trash2} title="Danger Zone" subtitle="Irreversible actions — proceed with caution" />
            <div className="rounded-2xl border border-red-200 bg-red-50/50 dark:bg-red-500/5 dark:border-red-500/20 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">Delete organisation</p>
                  <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-0.5 max-w-sm">
                    Permanently deletes this organisation and all associated workspaces, boards, and issues.
                  </p>
                </div>
                <AlertDialog open={deleteOrgOpen} onOpenChange={setDeleteOrgOpen}>
                  <AlertDialogTrigger asChild>
                    <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl
                      text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-sm">Delete "{Organisation.title}"?</AlertDialogTitle>
                      <AlertDialogDescription className="text-xs">
                        This will permanently delete your organisation and all data within it. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600 text-white text-xs"
                        onClick={deleteOrg}
                      >
                        Yes, delete everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrganisationSettingsPage;