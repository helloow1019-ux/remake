import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Plus,
  X,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Wrench,
} from 'lucide-react';
import { submitScan, patchScanItems, suggestScanIdeas, getWasteTypes } from '../lib/api';
import { Button } from '../ui/Button';
import { Stamp } from '../ui/Stamp';
import { TapeCard } from '../ui/TapeCard';
import { useToast } from '../ui/Toast';

export const Scan: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgressTipIdx, setScanProgressTipIdx] = useState(0);

  // Scan Results
  const [scanResult, setScanResult] = useState<any>(null);
  const [matchedIdeas, setMatchedIdeas] = useState<any[]>([]);
  const [aiDraftIdeas, setAiDraftIdeas] = useState<any[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [scanError, setScanError] = useState<{ code: string; message: string } | null>(null);

  const tips = [
    t('scan.analysingTip1', 'Examining bottle plastics, labels and cap materials...'),
    t('scan.analysingTip2', 'Checking shape integrity, clean cuts and conditions...'),
    t('scan.analysingTip3', 'Matching against verified ReMake workshop blueprints...'),
  ];

  useEffect(() => {
    let timer: any;
    if (isScanning) {
      timer = setInterval(() => {
        setScanProgressTipIdx((prev) => (prev + 1) % tips.length);
      }, 2400);
    }
    return () => clearInterval(timer);
  }, [isScanning, tips.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 3);
    setSelectedFiles(files);

    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    setScanError(null);
  };

  const executeScan = async (files: File[]) => {
    setIsScanning(true);
    setScanError(null);
    setScanResult(null);
    setMatchedIdeas([]);
    setAiDraftIdeas([]);

    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }

    try {
      const res = await submitScan(formData);
      setScanResult(res.scan);
      setMatchedIdeas(res.matchedIdeas || []);

      // Auto-trigger initial AI draft ideas
      try {
        setIsGeneratingAi(true);
        const draftsRes = await suggestScanIdeas(res.scan.id);
        setAiDraftIdeas(draftsRes.ideas || []);
      } catch (err: any) {
        console.warn('AI suggestions call failed:', err.message);
      } finally {
        setIsGeneratingAi(false);
      }
    } catch (err: any) {
      setScanError({
        code: err.code || 'SCAN_ERROR',
        message: err.message || 'Scan failed. Please try again.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleStartScan = () => {
    if (selectedFiles.length > 0) {
      executeScan(selectedFiles);
    }
  };

  // 1-Click Demo Scanner for reviewers without photos
  const handleDemoScan = async (itemType: 'bottle' | 'cardboard') => {
    try {
      const sampleImagePath = itemType === 'bottle' ? '/seed/waste-plastic-bottle.jpg' : '/seed/waste-cardboard.jpg';
      const resp = await fetch(sampleImagePath);
      const blob = await resp.blob();
      const demoFile = new File([blob], `${itemType}-sample.jpg`, { type: 'image/jpeg' });
      setSelectedFiles([demoFile]);
      setPreviews([sampleImagePath]);
      await executeScan([demoFile]);
    } catch (err: any) {
      showToast('Could not load demo sample: ' + err.message, 'error');
    }
  };

  const handleResetScan = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setScanResult(null);
    setMatchedIdeas([]);
    setAiDraftIdeas([]);
    setScanError(null);
  };

  const handleGenerateMoreAi = async () => {
    if (!scanResult) return;
    setIsGeneratingAi(true);
    try {
      const draftsRes = await suggestScanIdeas(scanResult.id, true);
      setAiDraftIdeas(draftsRes.ideas || []);
      showToast('Generated fresh untested AI suggestions!', 'info');
    } catch (err: any) {
      showToast(err.message || 'Could not generate more suggestions', 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const isUrdu = i18n.language === 'ur';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 space-y-8">
      {/* Title Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-marigold/20 text-[#8F5E00] dark:text-marigold border border-marigold/40 text-xs font-mono font-bold mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ReMake Smart Vision • University Lab</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-ink">
          {isUrdu ? 'کچرے کی تصویر سے پہچان' : 'ReMake Waste Scanner'}
        </h1>
        <p className="text-xs sm:text-sm text-ink/75 font-body mt-2 leading-relaxed">
          {isUrdu
            ? 'بوتل، ڈھکن، گتے یا پرانے کپڑے کی تصویر لیں۔ ری میک فوراً پہچان کر ری سائیکلنگ ترکیب تجویز کرے گا۔'
            : 'Point your camera at bottles, packaging, or fabric. ReMake identifies material polymers and matches them to student recipes.'}
        </p>
      </div>

      {/* Camera / Upload Viewfinder */}
      {!scanResult && !isScanning && (
        <div className="relative rounded-3xl bg-card border-3 border-ink shadow-[0_8px_0_#1B2A22] p-6 sm:p-8 text-center cutting-mat-grid">
          {/* Viewfinder Display Box */}
          <div className="w-full h-64 sm:h-80 rounded-2xl bg-paper/90 border-2 border-dashed border-ink/40 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
            {previews.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 w-full h-full">
                {previews.map((url, i) => (
                  <div key={i} className="relative w-full h-full rounded-xl overflow-hidden border-2 border-ink shadow-sm bg-card">
                    <img
                      src={url}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-marigold/20 border-2 border-ink flex items-center justify-center mx-auto mb-3 shadow-[2px_2px_0_#1B2A22]">
                  <Camera className="w-8 h-8 text-ink" />
                </div>
                <p className="font-display font-bold text-base text-ink">
                  {isUrdu ? 'تصویر کھینچیں یا اپلوڈ کریں' : 'Snap or Upload Waste'}
                </p>
                <p className="text-xs text-ink/60 mt-1 font-mono">
                  PET Bottles • HDPE Caps • Cardboard Boxes • Cloth
                </p>
              </div>
            )}

            {/* Corner Viewfinder Targeting Graphics */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-marigold pointer-events-none" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-marigold pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 border-marigold pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-marigold pointer-events-none" />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 font-display font-bold"
            >
              <Upload className="w-5 h-5" />
              <span>{previews.length > 0 ? (isUrdu ? 'تصویر تبدیل کریں' : 'Change Photos') : (isUrdu ? 'تصویر منتخب کریں' : 'Choose Photo')}</span>
            </Button>

            {previews.length > 0 && (
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartScan}
                className="flex items-center justify-center gap-2 font-display font-bold shadow-[0_4px_0_#1B2A22]"
              >
                <Sparkles className="w-5 h-5" />
                <span>{isUrdu ? 'فضلہ شناخت کریں' : 'Identify Waste Materials'}</span>
              </Button>
            )}
          </div>

          {/* Quick Demo Test Buttons */}
          <div className="mt-8 pt-6 border-t-2 border-dashed border-ink/15 text-center">
            <span className="text-xs font-mono text-ink/60 block mb-2">
              💡 {isUrdu ? 'فوری ڈیمو ٹیسٹ (بغیر کیمرہ):' : 'Instant evaluation presets (one-click test):'}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDemoScan('bottle')}
                className="text-xs"
              >
                🧪 {isUrdu ? 'پلاسٹک بوتل اسکین کریں' : 'Test PET Bottle'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDemoScan('cardboard')}
                className="text-xs"
              >
                🧪 {isUrdu ? 'کارڈ بورڈ اسکین کریں' : 'Test Cardboard Box'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Scanning Animated Laser State */}
      {isScanning && (
        <div className="p-10 rounded-3xl bg-card border-3 border-ink shadow-[0_8px_0_#1B2A22] text-center space-y-6">
          <div className="relative w-32 h-32 mx-auto rounded-3xl bg-paper border-2 border-ink flex items-center justify-center overflow-hidden shadow-inner">
            <Camera className="w-14 h-14 text-ink/80" />
            <div className="absolute inset-x-0 h-1.5 bg-marigold shadow-[0_0_12px_#F59E0B] animate-pulse" />
          </div>

          <div>
            <h3 className="text-2xl font-display font-black text-ink">
              {isUrdu ? 'تصویر کی جانچ جاری ہے...' : 'Analyzing Waste with ReMake Vision...'}
            </h3>
            <p className="text-sm font-mono text-ink/70 mt-2 font-medium">
              {tips[scanProgressTipIdx]}
            </p>
          </div>
        </div>
      )}

      {/* Error / Hazard / Not Waste Banner */}
      {scanError && (
        <div className="p-6 rounded-3xl bg-[#FFF4F2] border-3 border-chili text-ink shadow-[0_6px_0_#D9532F] space-y-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-chili shrink-0" />
            <h3 className="font-display font-black text-base text-chili">
              {scanError.code === 'HAZARDOUS'
                ? isUrdu ? 'خطرناک فضلہ تنبیہ' : 'Hazardous Item Warning'
                : scanError.code === 'NOT_WASTE'
                ? isUrdu ? 'کوئی دوبارہ قابلِ استعمال فضلہ نہیں ملا' : 'No Upcyclable Waste Detected'
                : isUrdu ? 'اسکین نوٹس' : 'Scan Notice'}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-ink/80 leading-relaxed font-body">
            {scanError.message}
          </p>
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={handleResetScan}>
              {isUrdu ? 'دوبارہ کوشش کریں' : 'Try Another Photo'}
            </Button>
          </div>
        </div>
      )}

      {/* Results View */}
      {scanResult && !isScanning && (
        <div className="space-y-10">
          {/* Detected Materials Banner */}
          <div className="bg-card rounded-3xl p-6 sm:p-8 border-3 border-ink shadow-[0_8px_0_#1B2A22]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b-2 border-dashed border-ink/15 pb-4">
              <div>
                <span className="font-mono text-xs font-bold uppercase text-leaf block mb-1">
                  ✓ {isUrdu ? 'کامیاب شناخت' : 'Analysis Complete'}
                </span>
                <h2 className="text-2xl font-display font-black text-ink">
                  {isUrdu ? 'شناخت شدہ فضلے کا مواد' : 'Detected Waste Items'}
                </h2>
              </div>
              <Button variant="outline" size="sm" onClick={handleResetScan}>
                <RefreshCw className="w-4 h-4 mr-1.5" />
                <span>{isUrdu ? 'نیا اسکین' : 'New Scan'}</span>
              </Button>
            </div>

            {/* Chips list */}
            <div className="flex flex-wrap gap-2.5">
              {scanResult.items?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-paper border-2 border-ink shadow-[2px_2px_0_#1B2A22] text-xs font-mono font-bold"
                >
                  <span className="text-base">📦</span>
                  <span>{item.label}</span>
                  <span className="text-leaf">({Math.round(item.confidence * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* 1. Tested ReMake Blueprints */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-display font-black text-ink flex items-center gap-2">
                  <Wrench className="w-6 h-6 text-leaf" />
                  <span>{isUrdu ? 'آزمودہ ورکشاپ ترکیبیں' : 'Verified Tested Blueprints'}</span>
                </h3>
                <p className="text-xs text-ink/70 mt-0.5">
                  {isUrdu
                    ? 'ری میک ٹیم کے ہاتھ سے بنائے گئے اور تصدیق شدہ طریقے'
                    : 'Crafts tested and measured by NUCES students with real time, tools, and carbon savings'}
                </p>
              </div>
            </div>

            {matchedIdeas.length === 0 ? (
              <div className="p-8 rounded-2xl bg-card border-2 border-dashed border-ink/30 text-center">
                <p className="text-xs text-ink/60 font-body">
                  No direct tested recipes for these exact items yet. Check out the AI drafts below!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchedIdeas.map((idea) => (
                  <TapeCard
                    key={idea.id}
                    onClick={() => navigate(`/ideas/${idea.slug}`)}
                    className="cursor-pointer hover:translate-y-[-2px] transition-transform flex flex-col justify-between p-4 pt-5 overflow-hidden"
                  >
                    <div>
                      {idea.coverImage && (
                        <div className="h-40 -mx-4 -mt-5 mb-3 overflow-hidden rounded-t-2xl border-b-2 border-ink relative bg-paper-muted">
                          <img
                            src={idea.coverImage}
                            alt={idea.titleEn}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Stamp variant="tested" size="sm">
                          TESTED
                        </Stamp>
                        <span className="font-mono text-xs text-leaf font-bold">
                          -{Math.round(idea.co2SavedG)}g CO₂
                        </span>
                      </div>
                      <h4 className="font-display font-black text-base text-ink mb-1 line-clamp-1">
                        {isUrdu && idea.titleUr ? idea.titleUr : idea.titleEn}
                      </h4>
                      <p className="text-xs text-ink/75 line-clamp-2">
                        {isUrdu && idea.summaryUr ? idea.summaryUr : idea.summaryEn}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-dashed border-ink/15 flex items-center justify-between text-xs font-mono text-ink/60">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-ink/60" />
                        <span>{idea.timeMinutes}m</span>
                      </span>
                      <span className="text-leaf font-bold">Launch Mode →</span>
                    </div>
                  </TapeCard>
                ))}
              </div>
            )}
          </div>

          {/* 2. Experimental Draft Ideas */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-marigold" />
                  <h3 className="text-2xl font-display font-black text-ink">
                    {isUrdu ? 'ری میک تجرباتی خاکے (غیر آزمودہ)' : 'ReMake Experimental Blueprints (Untested)'}
                  </h3>
                </div>
                <p className="text-xs text-ink/70 mt-0.5">
                  {isUrdu
                    ? 'ری میک لیب کے تازہ مشورے — احتیاط سے بنائیں۔ تخمینی اعداد و شمار کے ساتھ ~ لگایا گیا ہے۔'
                    : 'Experimental blueprints generated for your waste. Not physically tested yet by our university lab. Estimates prefixed with ~.'}
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                disabled={isGeneratingAi}
                onClick={handleGenerateMoreAi}
                className="self-start sm:self-center text-xs font-display font-bold"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                <span>{isGeneratingAi ? (isUrdu ? 'تجاویز تیار ہو رہی ہیں...' : 'Generating...') : (isUrdu ? 'مزید 3 خاکے بنائیں' : 'Generate 3 More Ideas')}</span>
              </Button>
            </div>

            {aiDraftIdeas.length === 0 ? (
              <div className="p-8 rounded-2xl bg-card border-2 border-dashed border-ink/30 text-center font-mono text-xs text-ink/60">
                {isGeneratingAi ? 'Synthesizing novel upcycling drafts...' : 'No experimental drafts generated yet.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiDraftIdeas.map((draft, idx) => (
                  <TapeCard
                    key={draft.id || idx}
                    onClick={() => draft.slug && navigate(`/ideas/${draft.slug}`)}
                    className="cursor-pointer border-dashed border-marigold hover:translate-y-[-2px] transition-transform flex flex-col justify-between p-4 pt-5"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Stamp variant="draft" size="sm">
                          AI DRAFT
                        </Stamp>
                        <span className="font-mono text-xs text-cardboard-amber font-bold">
                          ~{Math.round(draft.co2SavedG || 50)}g CO₂
                        </span>
                      </div>
                      <h4 className="font-display font-black text-base text-ink mb-1 line-clamp-1">
                        {isUrdu && draft.titleUr ? draft.titleUr : draft.titleEn}
                      </h4>
                      <p className="text-xs text-ink/75 line-clamp-2">
                        {isUrdu && draft.summaryUr ? draft.summaryUr : draft.summaryEn}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-dashed border-ink/15 flex items-center justify-between text-xs font-mono text-ink/60">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-ink/60" />
                        <span>~{draft.timeMinutes || 20}m</span>
                      </span>
                      <span className="text-cardboard-amber font-bold">View Steps →</span>
                    </div>
                  </TapeCard>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
