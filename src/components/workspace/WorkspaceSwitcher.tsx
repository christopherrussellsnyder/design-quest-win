import React, { useState } from 'react';
import { Check, ChevronDown, Plus, Building2, Lock } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

interface Props {
  compact?: boolean;
  className?: string;
}

export function WorkspaceSwitcher({ compact = false, className = '' }: Props) {
  const {
    workspaces,
    activeWorkspace,
    switchWorkspace,
    createWorkspace,
    canCreateMore,
    workspaceLimit,
  } = useWorkspace();
  const { tier, subscribed } = useSubscription();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const isAgency = subscribed && tier === 'agency';

  if (!activeWorkspace) return null;

  const handleCreate = async () => {
    setCreating(true);
    const ws = await createWorkspace(newName);
    setCreating(false);
    if (ws) {
      setNewName('');
      setDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`h-9 gap-2 px-3 border border-[#2A2B30] bg-[#0F1013] hover:bg-[#16171A] text-white ${className}`}
          >
            <Building2 className="h-4 w-4 text-[#CC0000]" />
            {!compact && (
              <span className="text-sm font-medium truncate max-w-[160px]">
                {activeWorkspace.name}
              </span>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-[#A0A0A8]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 bg-[#0F1013] border-[#2A2B30]">
          <DropdownMenuLabel className="text-xs text-[#A0A0A8] uppercase tracking-wider">
            Your Workspaces ({workspaces.length}/{workspaceLimit === 999 ? '∞' : workspaceLimit})
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[#2A2B30]" />
          {workspaces.map((w) => (
            <DropdownMenuItem
              key={w.id}
              onClick={() => switchWorkspace(w.id)}
              className="cursor-pointer text-white hover:bg-[#16171A] focus:bg-[#16171A]"
            >
              <Building2 className="h-4 w-4 mr-2 text-[#A0A0A8]" />
              <span className="flex-1 truncate">{w.name}</span>
              {w.id === activeWorkspace.id && <Check className="h-4 w-4 text-[#CC0000]" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="bg-[#2A2B30]" />
          {canCreateMore ? (
            <DropdownMenuItem
              onClick={() => setDialogOpen(true)}
              className="cursor-pointer text-white hover:bg-[#16171A] focus:bg-[#16171A]"
            >
              <Plus className="h-4 w-4 mr-2 text-[#CC0000]" />
              New workspace
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => navigate('/pricing')}
              className="cursor-pointer text-[#A0A0A8] hover:bg-[#16171A] focus:bg-[#16171A]"
            >
              <Lock className="h-4 w-4 mr-2" />
              {isAgency ? 'Workspace limit reached' : 'Upgrade to Agency for multiple brands'}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => navigate('/settings?tab=workspaces')}
            className="cursor-pointer text-[#A0A0A8] hover:bg-[#16171A] focus:bg-[#16171A]"
          >
            Manage workspaces
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0F1013] border-[#2A2B30] text-white">
          <DialogHeader>
            <DialogTitle>New workspace</DialogTitle>
            <DialogDescription className="text-[#A0A0A8]">
              Each workspace has its own business context, strategies, and content library.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="ws-name">Workspace name</Label>
            <Input
              id="ws-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Client Coffee Shop"
              className="bg-[#0A0A0C] border-[#2A2B30]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newName.trim()) handleCreate();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="bg-[#CC0000] hover:bg-[#A30000]"
            >
              {creating ? 'Creating…' : 'Create workspace'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
