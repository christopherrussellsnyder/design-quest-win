import { useState } from 'react';
import { Check, X, AlertCircle, Clock } from 'lucide-react';

interface TestCase {
  id: string;
  category: string;
  name: string;
  status: 'passed' | 'failed' | 'pending' | 'skipped';
  priority: 'critical' | 'high' | 'medium' | 'low';
  notes?: string;
}

export default function TestingDashboard() {
  const [testCases, setTestCases] = useState<TestCase[]>([
    // Authentication Tests
    { id: 'auth-1', category: 'Authentication', name: 'User can sign up with email', status: 'pending', priority: 'critical' },
    { id: 'auth-2', category: 'Authentication', name: 'User can log in with email', status: 'pending', priority: 'critical' },
    { id: 'auth-3', category: 'Authentication', name: 'User can reset password', status: 'pending', priority: 'high' },
    { id: 'auth-4', category: 'Authentication', name: 'User can enable 2FA', status: 'pending', priority: 'high' },
    { id: 'auth-5', category: 'Authentication', name: '2FA login challenge works', status: 'pending', priority: 'high' },
    { id: 'auth-6', category: 'Authentication', name: 'Email verification works', status: 'pending', priority: 'medium' },
    { id: 'auth-7', category: 'Authentication', name: 'Session management works', status: 'pending', priority: 'medium' },
    { id: 'auth-8', category: 'Authentication', name: 'Can sign out', status: 'pending', priority: 'high' },
    
    // Content AI Tests
    { id: 'ai-1', category: 'Content AI', name: 'AI generates content successfully', status: 'pending', priority: 'critical' },
    { id: 'ai-2', category: 'Content AI', name: 'AI respects tone settings', status: 'pending', priority: 'medium' },
    { id: 'ai-3', category: 'Content AI', name: 'AI respects length settings', status: 'pending', priority: 'medium' },
    { id: 'ai-4', category: 'Content AI', name: 'Usage tracking works', status: 'pending', priority: 'high' },
    { id: 'ai-5', category: 'Content AI', name: 'Quota limits enforced', status: 'pending', priority: 'critical' },
    { id: 'ai-6', category: 'Content AI', name: 'Caching reduces costs', status: 'pending', priority: 'medium' },
    { id: 'ai-7', category: 'Content AI', name: 'Error handling works', status: 'pending', priority: 'high' },
    
    // Scheduler Tests
    { id: 'sched-1', category: 'Scheduler', name: 'Can create new post', status: 'pending', priority: 'critical' },
    { id: 'sched-2', category: 'Scheduler', name: 'Can schedule post', status: 'pending', priority: 'critical' },
    { id: 'sched-3', category: 'Scheduler', name: 'Can publish immediately', status: 'pending', priority: 'critical' },
    { id: 'sched-4', category: 'Scheduler', name: 'Calendar view displays correctly', status: 'pending', priority: 'high' },
    { id: 'sched-5', category: 'Scheduler', name: 'List view displays correctly', status: 'pending', priority: 'high' },
    { id: 'sched-6', category: 'Scheduler', name: 'Queue view works', status: 'pending', priority: 'medium' },
    { id: 'sched-7', category: 'Scheduler', name: 'Drag and drop works', status: 'pending', priority: 'medium' },
    { id: 'sched-8', category: 'Scheduler', name: 'Best times suggestions work', status: 'pending', priority: 'medium' },
    { id: 'sched-9', category: 'Scheduler', name: 'Bulk scheduling works', status: 'pending', priority: 'high' },
    { id: 'sched-10', category: 'Scheduler', name: 'Recurring posts work', status: 'pending', priority: 'high' },
    { id: 'sched-11', category: 'Scheduler', name: 'Platform previews accurate', status: 'pending', priority: 'medium' },
    { id: 'sched-12', category: 'Scheduler', name: 'Can edit scheduled post', status: 'pending', priority: 'high' },
    { id: 'sched-13', category: 'Scheduler', name: 'Can delete scheduled post', status: 'pending', priority: 'high' },
    
    // Analytics Tests
    { id: 'ana-1', category: 'Analytics', name: 'Dashboard loads correctly', status: 'pending', priority: 'critical' },
    { id: 'ana-2', category: 'Analytics', name: 'Key metrics display', status: 'pending', priority: 'critical' },
    { id: 'ana-3', category: 'Analytics', name: 'Charts render correctly', status: 'pending', priority: 'high' },
    { id: 'ana-4', category: 'Analytics', name: 'Date range filter works', status: 'pending', priority: 'high' },
    { id: 'ana-5', category: 'Analytics', name: 'Platform filter works', status: 'pending', priority: 'high' },
    { id: 'ana-6', category: 'Analytics', name: 'Export reports work', status: 'pending', priority: 'medium' },
    { id: 'ana-7', category: 'Analytics', name: 'Top posts display', status: 'pending', priority: 'medium' },
    
    // Campaign Tests
    { id: 'camp-1', category: 'Campaigns', name: 'Can create campaign', status: 'pending', priority: 'critical' },
    { id: 'camp-2', category: 'Campaigns', name: 'Campaign templates work', status: 'pending', priority: 'high' },
    { id: 'camp-3', category: 'Campaigns', name: 'Campaign dashboard displays', status: 'pending', priority: 'high' },
    { id: 'camp-4', category: 'Campaigns', name: 'Can edit campaign', status: 'pending', priority: 'high' },
    { id: 'camp-5', category: 'Campaigns', name: 'Can delete campaign', status: 'pending', priority: 'high' },
    { id: 'camp-6', category: 'Campaigns', name: 'KPI tracking works', status: 'pending', priority: 'medium' },
    { id: 'camp-7', category: 'Campaigns', name: 'Campaign analytics accurate', status: 'pending', priority: 'high' },
    
    // Media Library Tests
    { id: 'media-1', category: 'Media Library', name: 'Can upload images', status: 'pending', priority: 'critical' },
    { id: 'media-2', category: 'Media Library', name: 'Can upload videos', status: 'pending', priority: 'high' },
    { id: 'media-3', category: 'Media Library', name: 'Grid view displays', status: 'pending', priority: 'high' },
    { id: 'media-4', category: 'Media Library', name: 'List view displays', status: 'pending', priority: 'high' },
    { id: 'media-5', category: 'Media Library', name: 'Image editor works', status: 'pending', priority: 'medium' },
    { id: 'media-6', category: 'Media Library', name: 'Can create folders', status: 'pending', priority: 'medium' },
    { id: 'media-7', category: 'Media Library', name: 'Can organize media', status: 'pending', priority: 'medium' },
    { id: 'media-8', category: 'Media Library', name: 'Search works', status: 'pending', priority: 'high' },
    { id: 'media-9', category: 'Media Library', name: 'Can delete media', status: 'pending', priority: 'high' },
    
    // Audience Tests
    { id: 'aud-1', category: 'Audience', name: 'Can create audience segment', status: 'pending', priority: 'high' },
    { id: 'aud-2', category: 'Audience', name: 'Demographic targeting works', status: 'pending', priority: 'medium' },
    { id: 'aud-3', category: 'Audience', name: 'Interest targeting works', status: 'pending', priority: 'medium' },
    { id: 'aud-4', category: 'Audience', name: 'Behavioral targeting works', status: 'pending', priority: 'medium' },
    { id: 'aud-5', category: 'Audience', name: 'Custom segments work', status: 'pending', priority: 'medium' },
    { id: 'aud-6', category: 'Audience', name: 'Can edit segments', status: 'pending', priority: 'high' },
    { id: 'aud-7', category: 'Audience', name: 'Can delete segments', status: 'pending', priority: 'high' },
    
    // Settings Tests
    { id: 'set-1', category: 'Settings', name: 'Profile settings save', status: 'pending', priority: 'high' },
    { id: 'set-2', category: 'Settings', name: 'Brand settings save', status: 'pending', priority: 'medium' },
    { id: 'set-3', category: 'Settings', name: 'Notification preferences save', status: 'pending', priority: 'medium' },
    { id: 'set-4', category: 'Settings', name: 'Connected accounts display', status: 'pending', priority: 'critical' },
    { id: 'set-5', category: 'Settings', name: 'Can change password', status: 'pending', priority: 'high' },
    { id: 'set-6', category: 'Settings', name: 'Team management works', status: 'pending', priority: 'medium' },
    
    // Performance Tests
    { id: 'perf-1', category: 'Performance', name: 'Page load < 3 seconds', status: 'pending', priority: 'critical' },
    { id: 'perf-2', category: 'Performance', name: 'Lighthouse score > 80', status: 'pending', priority: 'high' },
    { id: 'perf-3', category: 'Performance', name: 'Images optimized', status: 'pending', priority: 'medium' },
    { id: 'perf-4', category: 'Performance', name: 'No console errors', status: 'pending', priority: 'critical' },
    { id: 'perf-5', category: 'Performance', name: 'Smooth animations (60fps)', status: 'pending', priority: 'medium' },
    
    // Security Tests
    { id: 'sec-1', category: 'Security', name: 'HTTPS enforced', status: 'pending', priority: 'critical' },
    { id: 'sec-2', category: 'Security', name: 'RLS policies active', status: 'pending', priority: 'critical' },
    { id: 'sec-3', category: 'Security', name: 'XSS protection works', status: 'pending', priority: 'critical' },
    { id: 'sec-4', category: 'Security', name: 'CSRF protection works', status: 'pending', priority: 'critical' },
    { id: 'sec-5', category: 'Security', name: 'Environment vars secure', status: 'pending', priority: 'critical' },
    { id: 'sec-6', category: 'Security', name: 'Password requirements enforced', status: 'pending', priority: 'high' },
    
    // Mobile Tests
    { id: 'mob-1', category: 'Mobile', name: 'Responsive on iPhone', status: 'pending', priority: 'critical' },
    { id: 'mob-2', category: 'Mobile', name: 'Responsive on Android', status: 'pending', priority: 'critical' },
    { id: 'mob-3', category: 'Mobile', name: 'Responsive on iPad', status: 'pending', priority: 'high' },
    { id: 'mob-4', category: 'Mobile', name: 'Touch gestures work', status: 'pending', priority: 'high' },
    { id: 'mob-5', category: 'Mobile', name: 'Mobile navigation works', status: 'pending', priority: 'critical' },
    
    // Browser Tests
    { id: 'brow-1', category: 'Browser', name: 'Works in Chrome', status: 'pending', priority: 'critical' },
    { id: 'brow-2', category: 'Browser', name: 'Works in Firefox', status: 'pending', priority: 'high' },
    { id: 'brow-3', category: 'Browser', name: 'Works in Safari', status: 'pending', priority: 'high' },
    { id: 'brow-4', category: 'Browser', name: 'Works in Edge', status: 'pending', priority: 'medium' },
  ]);
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  
  const categories = ['All', ...Array.from(new Set(testCases.map(t => t.category)))];
  const priorities = ['All', 'critical', 'high', 'medium', 'low'];
  
  const filteredTests = testCases.filter(test => {
    if (selectedCategory !== 'All' && test.category !== selectedCategory) return false;
    if (selectedPriority !== 'All' && test.priority !== selectedPriority) return false;
    return true;
  });
  
  const stats = {
    total: testCases.length,
    passed: testCases.filter(t => t.status === 'passed').length,
    failed: testCases.filter(t => t.status === 'failed').length,
    pending: testCases.filter(t => t.status === 'pending').length,
    skipped: testCases.filter(t => t.status === 'skipped').length,
  };
  
  const passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0;
  
  const updateTestStatus = (id: string, status: TestCase['status'], notes?: string) => {
    setTestCases(prev => prev.map(test => 
      test.id === id ? { ...test, status, notes } : test
    ));
  };

  const generateCSVReport = (tests: TestCase[]): string => {
    const headers = ['Category', 'Test Name', 'Status', 'Priority', 'Notes'];
    const rows = tests.map(t => [
      t.category,
      t.name,
      t.status,
      t.priority,
      t.notes || ''
    ]);
    
    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">QA Testing Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive testing checklist for MarketAI</p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Tests" value={stats.total} color="text-foreground" />
          <StatCard label="Passed" value={stats.passed} color="text-green-400" />
          <StatCard label="Failed" value={stats.failed} color="text-red-400" />
          <StatCard label="Pending" value={stats.pending} color="text-yellow-400" />
          <StatCard label="Pass Rate" value={`${passRate}%`} color="text-primary" />
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-card text-foreground px-4 py-2 rounded border border-border"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-card text-foreground px-4 py-2 rounded border border-border"
          >
            {priorities.map(pri => (
              <option key={pri} value={pri}>
                {pri === 'All' ? 'All Priorities' : `${pri.charAt(0).toUpperCase()}${pri.slice(1)} Priority`}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => {
              const csv = generateCSVReport(testCases);
              downloadCSV(csv, 'test-report.csv');
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Export Report
          </button>
        </div>
        
        {/* Test Cases by Category */}
        {categories.filter(c => c !== 'All').map(category => {
          const categoryTests = filteredTests.filter(t => t.category === category);
          if (categoryTests.length === 0) return null;
          
          const categoryPassed = categoryTests.filter(t => t.status === 'passed').length;
          const categoryRate = ((categoryPassed / categoryTests.length) * 100).toFixed(0);
          
          return (
            <div key={category} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">{category}</h2>
                <span className="text-sm text-muted-foreground">
                  {categoryPassed}/{categoryTests.length} passed ({categoryRate}%)
                </span>
              </div>
              
              <div className="space-y-2">
                {categoryTests.map(test => (
                  <TestCaseRow key={test.id} test={test} onUpdate={updateTestStatus} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="bg-card p-4 rounded-lg border border-border">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function TestCaseRow({ 
  test, 
  onUpdate 
}: { 
  test: TestCase; 
  onUpdate: (id: string, status: TestCase['status'], notes?: string) => void;
}) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(test.notes || '');
  
  const getStatusIcon = () => {
    switch (test.status) {
      case 'passed': return <Check className="w-5 h-5 text-green-400" />;
      case 'failed': return <X className="w-5 h-5 text-red-400" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'skipped': return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };
  
  const getPriorityColor = () => {
    switch (test.priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-muted-foreground';
    }
  };
  
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>{getStatusIcon()}</span>
          <div>
            <p className="text-foreground font-medium">{test.name}</p>
            <span className={`text-xs ${getPriorityColor()}`}>
              {test.priority.toUpperCase()} PRIORITY
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate(test.id, 'passed')}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Pass
          </button>
          <button
            onClick={() => onUpdate(test.id, 'failed')}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Fail
          </button>
          <button
            onClick={() => onUpdate(test.id, 'skipped')}
            className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded hover:bg-muted/80"
          >
            Skip
          </button>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90"
          >
            Notes
          </button>
        </div>
      </div>
      
      {showNotes && (
        <div className="mt-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => onUpdate(test.id, test.status, notes)}
            placeholder="Add testing notes..."
            className="w-full bg-muted text-foreground p-2 rounded text-sm border border-border"
            rows={2}
          />
        </div>
      )}
    </div>
  );
}
