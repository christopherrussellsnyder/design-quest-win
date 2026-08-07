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
            className={`h-9 gap-2 px-3 border border-[hsl(var(--border))] bg-[hsl(var(--muted))] hover:bg-[hsl(var(--card))] text-white ${className}`}
          >
            <Building2 className="h-4 w-4 text-[hsl(var(--primary))]" />
            {!compact && (
              <span className="text-sm font-medium truncate max-w-[160px]">
                {activeWorkspace.name}
              </span>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 bg-[hsl(var(--muted))] border-[hsl(var(--border))]">
          <DropdownMenuLabel className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
            Your Workspaces ({workspaces.length}/{workspaceLimit === 999 ? '∞' : workspaceLimit})
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[hsl(var(--border))]" />
          {workspaces.map((w) => (
            <DropdownMenuItem
              key={w.id}
              onClick={() => switchWorkspace(w.id)}
              className="cursor-pointer text-white hover:bg-[hsl(var(--card))] focus:bg-[hsl(var(--card))]"
            >
              <Building2 className="h-4 w-4 mr-2 text-[hsl(var(--muted-foreground))]" />
              <span className="flex-1 truncate">{w.name}</span>
              {w.id === activeWorkspace.id && <Check className="h-4 w-4 text-[hsl(var(--primary))]" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="bg-[hsl(var(--border))]" />
          {canCreateMore ? (
            <DropdownMenuItem
              onClick={() => setDialogOpen(true)}
              className="cursor-pointer text-white hover:bg-[hsl(var(--card))] focus:bg-[hsl(var(--card))]"
            >
              <Plus className="h-4 w-4 mr-2 text-[hsl(var(--primary))]" />
              New workspace
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => navigate('/pricing')}
              className="cursor-pointer text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--card))] focus:bg-[hsl(var(--card))]"
            >
              <Lock className="h-4 w-4 mr-2" />
              {isAgency ? 'Workspace limit reached' : 'Upgrade to Agency for multiple brands'}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => navigate('/settings?tab=workspaces')}
            className="cursor-pointer text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--card))] focus:bg-[hsl(var(--card))]"
          >
            Manage workspaces
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[hsl(var(--muted))] border-[hsl(var(--border))] text-white">
          <DialogHeader>
            <DialogTitle>New workspace</DialogTitle>
            <DialogDescription className="text-[hsl(var(--muted-foreground))]">
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
              className="bg-[hsl(var(--background))] border-[hsl(var(--border))]"
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
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))]"
            >
              {creating ? 'Creating…' : 'Create workspace'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
