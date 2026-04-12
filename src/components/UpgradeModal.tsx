import { Link } from 'react-router-dom';
import { Check, X, Zap, BarChart3, MessageSquare, Users, FileText, Headphones } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

const starterFeatures = [
  '2 strategy generations',
  'Basic analytics upload',
  'Limited AI insights',
];

const proFeatures = [
  'Unlimited strategy generation',
  'Full analytics suite',
  'Unlimited AI Strategist chat',
  'Audience intelligence',
  'Content AI',
  'Priority support',
];

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#16171A] border border-[#2A2B2E] rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#CC0000]/10 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-[#CC0000]" />
          </div>
          <h2 className="text-2xl font-black mb-2" style={{ fontFamily: 'Arial Black, sans-serif' }}>
            You've Used Your Free Strategies
          </h2>
          <p className="text-[#A0A0A8]">
            Upgrade to Korex Pro for unlimited strategy generation and full platform access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Starter */}
          <div className="bg-[#0A0A0A] border border-[#2A2B2E] rounded-xl p-6">
            <h3 className="font-bold text-[#6B6B73] mb-4">Starter (Free)</h3>
            <ul className="space-y-3">
              {starterFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#6B6B73]">
                  <Check className="w-4 h-4 shrink-0 mt-0.5" />{f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="bg-[#0A0A0A] border border-[#CC0000]/30 rounded-xl p-6">
            <h3 className="font-bold text-[#CC0000] mb-4">Pro ($49/mo)</h3>
            <ul className="space-y-3">
              {proFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#A0A0A8]">
                  <Check className="w-4 h-4 text-[#CC0000] shrink-0 mt-0.5" />{f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Link to="/pricing"
          className="block w-full text-center py-4 bg-gradient-to-r from-[#CC0000] to-[#990000] text-white font-bold rounded-lg hover:shadow-[0_0_20px_rgba(204,0,0,0.3)] transition-all text-lg">
          Upgrade to Pro →
        </Link>

        <button onClick={onClose} className="block w-full text-center mt-4 text-[#6B6B73] hover:text-[#A0A0A8] transition-colors text-sm py-2">
          Maybe later
        </button>
      </div>
    </div>
  );
}
