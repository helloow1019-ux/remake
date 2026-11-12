import React, { useState } from 'react';
import { useParams, useNavigate, NavLink, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Check,
  Bookmark,
  Share2,
  Hammer,
  Sparkles,
  MessageSquare,
  Wand2,
  X,
  Send,
  Lightbulb,
} from 'lucide-react';
import {
  getIdeaBySlug,
  saveIdea,
  unsaveIdea,
  askIdeaAssistant,
  adaptIdeaMaterials,
} from '../lib/api';
import { Stamp } from '../ui/Stamp';
import { Button } from '../ui/Button';
import { TicketStat } from '../ui/TicketStat';
import { TapeCard } from '../ui/TapeCard';
import { useToast } from '../ui/Toast';

export const IdeaDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [tickedMaterials, setTickedMaterials] = useState<Record<string, boolean>>({});
  const [showAskDrawer, setShowAskDrawer] = useState(false);
  const [askMessage, setAskMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isAsking, setIsAsking] = useState(false);

  const [showAdaptModal, setShowAdaptModal] = useState(false);
  const [userSuppliesInput, setUserSuppliesInput] = useState('');
  const [adaptResult, setAdaptResult] = useState<any>(null);
  const [isAdapting, setIsAdapting] = useState(false);

  const { data: idea, isLoading, error } = useQuery({
    queryKey: ['idea', slug],
    queryFn: () => getIdeaBySlug(slug!),
    enabled: !!slug,
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      idea?.viewerState?.saved ? unsaveIdea(idea.id) : saveIdea(idea!.id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['idea', slug] });
      queryClient.invalidateQueries({ queryKey: ['saved-ideas'] });
      showToast(data.saved ? 'Saved to your workbench!' : 'Removed from saved ideas', 'success');
    },
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: idea?.titleEn || 'ReMake Idea',
          text: idea?.summaryEn || 'Check out this craft idea on ReMake!',
          url: window.location.href,
        });
      } catch {
        // ignore share cancellation
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'info');
    }
  };

  const toggleMaterial = (index: number) => {
    setTickedMaterials((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askMessage.trim() || !idea || isAsking) return;

    const userText = askMessage.trim();
    setAskMessage('');
    setChatHistory((prev) => [...prev, { role: 'user', content: userText }]);
    setIsAsking(true);

    try {
      const res = await askIdeaAssistant(idea.id, userText, chatHistory);
      setChatHistory((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (err: any) {
      showToast(err.message || 'Could not get AI response', 'error');
    } finally {
      setIsAsking(false);
    }
  };

  const handleAdaptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSuppliesInput.trim() || !idea || isAdapting) return;

    const supplies = userSuppliesInput.split(',').map((s) => s.trim()).filter(Boolean);
    setIsAdapting(true);

    try {
      const res = await adaptIdeaMaterials(idea.id, supplies);
      setAdaptResult(res);
    } catch (err: any) {
      showToast(err.message || 'Could not adapt materials', 'error');
    } finally {
      setIsAdapting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-10 space-y-6">
        <div className="h-64 rounded-3xl bg-ink/10 animate-pulse border-2 border-dashed border-ink/20" />
        <div className="h-10 w-3/4 bg-ink/10 animate-pulse rounded-xl" />
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-ink/10 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-display font-black text-ink">Idea Not Found</h2>
        <Button variant="primary" size="md" onClick={() => navigate('/explore')} className="mt-4">
          Browse All Ideas
        </Button>
      </div>
    );
  }

  const isUrdu = i18n.language === 'ur';
  const totalMaterials = idea.materials.length;
  const checkedMaterialsCount = Object.values(tickedMaterials).filter(Boolean).length;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-28 pt-2">
      {/* Hero Media Container */}
      <div className="relative rounded-3xl overflow-hidden border-3 border-ink shadow-[0_6px_0_#1B2A22] bg-paper-muted">
        <img
          src={idea.coverImage || `/seed/waste-${idea.waste[0]?.slug || 'other'}.jpg`}
          alt={idea.titleEn}
          className="w-full h-72 md:h-96 object-cover"
        />
        {/* Status Stamp Top Right */}
        <div className="absolute top-4 right-4 z-10">
          <Stamp status={idea.status} className="shadow-lg" />
        </div>
        {/* Sample data marker */}
        {idea.isSampleData && (
          <div className="absolute bottom-3 left-4 bg-ink/75 text-paper px-2.5 py-1 rounded-md text-[10px] font-bold">
            {t('idea.sampleDataNotice', 'Sample data • Replace with measured measurements')}
          </div>
        )}
      </div>

      {/* Title & Summary */}
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-black text-ink leading-tight">
          {isUrdu && idea.titleUr ? idea.titleUr : idea.titleEn}
        </h1>
        <p className="text-base text-ink/80 mt-2 leading-relaxed font-body">
          {isUrdu && idea.summaryUr ? idea.summaryUr : idea.summaryEn}
        </p>
      </div>

      {/* Ticket Stubs Stat Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <TicketStat
          label={t('idea.time', 'Time')}
          value={idea.timeMinutes}
          unit="mins"
          icon={<Clock className="w-3.5 h-3.5" />}
        />
        <TicketStat
          label={t('idea.cost', 'Cost')}
          value={`Rs ${idea.costPkr}`}
          icon={<DollarSign className="w-3.5 h-3.5" />}
        />
        <TicketStat
          label={t('idea.sellPrice', 'Sells For')}
          value={idea.sellPricePkr ? `Rs ${idea.sellPricePkr}` : '—'}
          highlight={!!idea.sellPricePkr}
          icon={<TrendingUp className="w-3.5 h-3.5" />}
        />
        <TicketStat
          label={t('idea.profitPerHour', 'Profit/hr')}
          value={idea.profitPerHourPkr ? `Rs ${idea.profitPerHourPkr}` : '0'}
          unit="/hr"
        />
      </div>

      {/* Impact Banner Card */}
      <div className="p-5 rounded-2xl bg-leaf/15 border-2 border-leaf shadow-[0_4px_0_#2E7D4F] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-leaf text-white flex items-center justify-center -rotate-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-ink">
              Impact of this project:
            </h4>
            <p className="text-xs text-ink/75">
              +{idea.wasteGrams}g waste kept out of landfills • ≈ {idea.co2SavedG}g CO2 avoided
            </p>
          </div>
        </div>
        <NavLink
          to="/method"
          className="text-xs font-display font-bold text-leaf hover:underline shrink-0"
        >
          How we calculate →
        </NavLink>
      </div>

      {/* Safety Callout (Caution Tape Banner) */}
      <div className="relative p-5 rounded-2xl bg-[#FFF6E5] text-ink border-3 border-ink shadow-[0_4px_0_#1B2A22]">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-chili text-white shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="font-display font-black text-sm uppercase tracking-wider text-chili mb-1">
              {t('idea.safety', 'Safety First')}
            </h4>
            <p className="text-xs md:text-sm font-body text-ink/90 leading-relaxed">
              {isUrdu && idea.safetyNoteUr ? idea.safetyNoteUr : idea.safetyNoteEn}
            </p>
          </div>
        </div>
      </div>

      {/* Materials Checklist */}
      <TapeCard className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-display font-bold text-xl text-ink">
              {t('idea.materials', 'Materials Needed')}
            </h3>
            <p className="text-xs text-ink/65">
              Tick what you have ({checkedMaterialsCount}/{totalMaterials})
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdaptModal(true)}
            className="flex items-center gap-1.5"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>{t('idea.adaptMaterials', 'Adapt to what I have')}</span>
          </Button>
        </div>

        <ul className="space-y-2.5 divide-y divide-ink/10">
          {idea.materials.map((m, idx) => (
            <li
              key={idx}
              onClick={() => toggleMaterial(idx)}
              className="pt-2.5 flex items-center justify-between gap-3 cursor-pointer group select-none"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-lg border-2 border-ink flex items-center justify-center transition-colors ${
                    tickedMaterials[idx] ? 'bg-leaf text-white' : 'bg-paper group-hover:border-leaf'
                  }`}
                >
                  {tickedMaterials[idx] && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
                <span
                  className={`text-sm font-body ${
                    tickedMaterials[idx] ? 'line-through text-ink/40' : 'text-ink font-medium'
                  }`}
                >
                  {isUrdu && m.nameUr ? m.nameUr : m.nameEn}
                </span>
              </div>
              {m.quantity && (
                <span className="text-xs font-bold text-ink/60 bg-ink/5 px-2 py-0.5 rounded-full">
                  {m.quantity}
                </span>
              )}
            </li>
          ))}
        </ul>

        {/* Tools Section */}
        {idea.tools.length > 0 && (
          <div className="mt-6 pt-5 border-t-2 border-dashed border-ink/20">
            <h4 className="font-display font-bold text-sm text-ink mb-2.5">
              {t('idea.tools', 'Tools Required')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {idea.tools.map((t, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-paper border-2 border-ink/40 text-xs font-display font-bold text-ink"
                >
                  {isUrdu && t.nameUr ? t.nameUr : t.nameEn}
                </span>
              ))}
            </div>
          </div>
        )}
      </TapeCard>

      {/* Steps Preview */}
      <div className="space-y-3">
        <h3 className="font-display font-bold text-xl text-ink">
          {t('idea.steps', 'Steps Overview')}
        </h3>

        <div className="space-y-3">
          {idea.steps.map((s) => (
            <div
              key={s.position}
              className="p-4 rounded-2xl bg-card border-2 border-ink shadow-[0_2px_0_rgba(27,42,34,0.1)] flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-marigold border-2 border-ink text-ink font-display font-black flex items-center justify-center shrink-0">
                {s.position}
              </div>
              <div className="flex-1 text-sm font-body text-ink">
                <p className="font-medium leading-relaxed">
                  {isUrdu && s.textUr ? s.textUr : s.textEn}
                </p>
                {s.tipEn && (
                  <p className="mt-2 text-xs font-hand text-leaf bg-leaf/10 p-2 rounded-lg border border-leaf/30 inline-flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                    <span>Tip: {s.tipEn}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Strip */}
      {idea.stats.makes > 0 && (
        <div className="p-4 rounded-2xl bg-paper border-2 border-dashed border-ink/30 text-center text-xs font-display font-bold text-ink">
          {t('idea.communityStats', {
            count: idea.stats.makes,
            pct: idea.stats.workedPct,
          })}
        </div>
      )}

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-card border-t-2 border-ink z-40 p-3 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={() => saveMutation.mutate()}
            className="p-2.5"
            title="Save idea"
          >
            <Bookmark
              className={`w-5 h-5 ${idea.viewerState?.saved ? 'fill-marigold text-marigold' : ''}`}
            />
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={handleShare}
            className="p-2.5"
            title="Share idea"
          >
            <Share2 className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => setShowAskDrawer(true)}
            className="flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4 text-sky" />
            <span className="hidden sm:inline">Ask ReMake</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(`/ideas/${idea.slug}/make`)}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Hammer className="w-4 h-4" />
            <span>{t('idea.startMaking', 'Start Making')}</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate(`/ideas/${idea.slug}/made-this`)}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{t('idea.iMadeThis', 'I Made This!')}</span>
          </Button>
        </div>
      </div>

      {/* Ask ReMake AI Drawer */}
      {showAskDrawer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-card h-full p-5 border-l-2 border-ink flex flex-col justify-between shadow-2xl animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between pb-3 border-b-2 border-ink">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky/20 border-2 border-sky text-sky flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-black text-lg text-ink">Ask ReMake</h3>
                </div>
                <button
                  onClick={() => setShowAskDrawer(false)}
                  className="p-1 rounded-lg hover:bg-black/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {chatHistory.length === 0 ? (
                  <p className="text-xs text-ink/60 bg-paper p-4 rounded-xl border border-dashed border-ink/20">
                    Ask questions about this craft, e.g. "Can I use white glue instead of hot glue?", "How do I cut the plastic without cracking it?", or "Explain step 2 in simple terms."
                  </p>
                ) : (
                  chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl text-xs font-body leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-marigold/20 border border-marigold text-ink ml-6'
                          : 'bg-paper border border-ink/30 text-ink mr-6'
                      }`}
                    >
                      <p>{msg.content}</p>
                    </div>
                  ))
                )}
                {isAsking && (
                  <div className="p-3 rounded-xl bg-paper border border-ink/20 text-xs italic text-ink/60">
                    ReMake AI is thinking...
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleAskSubmit} className="pt-4 border-t-2 border-ink flex gap-2">
              <input
                type="text"
                value={askMessage}
                onChange={(e) => setAskMessage(e.target.value)}
                placeholder="Ask about this craft..."
                className="flex-1 px-3 py-2 rounded-xl bg-paper border-2 border-ink text-xs text-ink focus:outline-none"
              />
              <Button variant="primary" size="sm" type="submit" disabled={isAsking}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Adapt Materials Modal */}
      {showAdaptModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-card rounded-3xl border-3 border-ink shadow-[0_8px_0_#1B2A22] p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b-2 border-ink mb-4">
              <h3 className="font-display font-black text-lg text-ink flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-marigold" />
                <span>Adapt to What I Have</span>
              </h3>
              <button
                onClick={() => {
                  setShowAdaptModal(false);
                  setAdaptResult(null);
                }}
                className="p-1 rounded-lg hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdaptSubmit} className="space-y-4">
              <p className="text-xs text-ink/75">
                Missing some materials or tools? List what you do have at home (e.g. tape, twine, flour paste, cardboard), and AI will suggest safe substitutions.
              </p>

              <div>
                <label className="block text-xs font-display font-bold text-ink mb-1">
                  What household items do you have available?
                </label>
                <textarea
                  value={userSuppliesInput}
                  onChange={(e) => setUserSuppliesInput(e.target.value)}
                  placeholder="e.g. Scotch tape, school glue, needle and thread, yarn..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-paper border-2 border-ink text-xs text-ink focus:outline-none"
                />
              </div>

              <Button variant="primary" size="md" fullWidth type="submit" disabled={isAdapting}>
                {isAdapting ? 'Finding Substitutions...' : 'Find Safe Substitutions'}
              </Button>
            </form>

            {adaptResult && (
              <div className="mt-6 pt-4 border-t-2 border-dashed border-ink/20 space-y-3">
                <h4 className="text-xs font-display font-bold text-ink uppercase tracking-wider">
                  Suggested Substitutions:
                </h4>
                <div className="space-y-2">
                  {adaptResult.materialsMap.map((sub: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-paper border border-ink/30 text-xs">
                      <p className="font-bold text-ink">
                        Instead of <span className="text-chili">{sub.need}</span>, use{' '}
                        <span className="text-leaf">{sub.use}</span>
                      </p>
                      {sub.note && <p className="text-[11px] text-ink/70 mt-1">{sub.note}</p>}
                    </div>
                  ))}
                </div>
                {adaptResult.notes && (
                  <p className="text-xs italic text-ink/80 bg-marigold/15 p-2.5 rounded-xl border border-marigold/40">
                    {adaptResult.notes}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
