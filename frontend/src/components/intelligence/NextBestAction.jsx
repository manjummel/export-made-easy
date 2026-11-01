import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { useEvidence } from '../../context/EvidenceContext';
import { cn } from '../../lib/cn';

export default function NextBestAction({
  title = 'Review destination certification requirement',
  description = 'Germany import regulations require GOTS chemical compliance & Form A origin certification before vessel dispatch from Chennai port.',
  urgency = 'Immediate Action Required',
  actionLabel = 'Review Requirement',
  onAction = () => {},
  evidence,
  className,
}) {
  const { openEvidence } = useEvidence();

  return (
    <Card
      variant="default"
      className={cn(
        'relative p-5 border-[var(--color-border-medium)] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] before:absolute before:inset-0 before:bg-gradient-to-br before:from-[var(--brand-accent)]/10 before:to-transparent before:pointer-events-none',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="p-2.5 rounded-xl bg-[var(--brand-primary)] text-white shrink-0 shadow-lg shadow-[var(--brand-primary)]/20">
            <Sparkles size={20} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-accent)]">
                Next Best Action
              </span>
              <Badge variant="warning" size="xs">{urgency}</Badge>
            </div>
            <h3 className="text-sm font-bold text-[var(--color-primary)] leading-snug">{title}</h3>
            <p className="text-xs text-[var(--color-muted)] leading-relaxed max-w-2xl">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 sm:self-center">
          {evidence && (
            <Button
              variant="outline"
              size="sm"
              icon={ShieldCheck}
              onClick={() => openEvidence(evidence)}
            >
              Evidence
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            iconRight={ArrowRight}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
}
