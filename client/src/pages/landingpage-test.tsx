import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Shield, ShieldCheck, Search, Database, Lock, Layers, Eye,
  Upload, FileText, Trash2, ArrowRight, ArrowDown, CheckCircle2,
  Loader2, AlertTriangle, Zap, Globe, Hash, Ban, BarChart3,
  Leaf, Scale, Receipt, TrendingUp, Network, Award, Building2,
  Plane, Briefcase, ChevronRight, User, LogIn
} from "lucide-react";

interface FileDetail {
  originalName: string;
  size: number;
  format: string;
  sha256: string;
}

interface AuditEnvelope {
  envelopeId: string;
  type: string;
  inputs: {
    files: FileDetail[];
    description: string;
    descriptionHash: string;
  };
  processing: {
    model: string;
    startedAt: string;
    completedAt: string;
  };
  output: {
    reportHash: string;
  };
  envelopeSha256: string;
}

interface TrialStatus {
  used: number;
  remaining: number;
  limit: number;
}

interface AnalysisResult {
  report: string;
  envelope: AuditEnvelope;
  files: FileDetail[];
  trialStatus?: TrialStatus;
}

const CORE_INFRASTRUCTURE = [
  {
    id: "trust",
    name: "AuraTRUST",
    tagline: "Certification & Validation Layer",
    description: "Transversal layer that certifies, validates, and monitors every process across the ecosystem. SHA-256 chained custody, real-time seal monitoring, and automated certificate issuance.",
    icon: ShieldCheck,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    features: ["Chain of custody (Lei 13.964/2019)", "Trust Seal with active monitoring", "Period certificates on revocation", "Public validation endpoint"],
  },
  {
    id: "data",
    name: "AuraDATA",
    tagline: "Data Governance Hub",
    description: "Centralized data ingestion, normalization, and cross-referencing engine. Multi-source reconciliation with cryptographic integrity at every stage.",
    icon: Database,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    features: ["Multi-source data ingestion", "Schema normalization engine", "Cross-reference matching", "Cryptographic data integrity"],
  },
];

const VERIFICATION_MODULES = [
  {
    id: "due",
    name: "AuraDUE",
    tagline: "Digital Due Diligence",
    description: "Automated evidence collection and verification for corporate transactions, partnerships, and regulatory submissions.",
    icon: Search,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
  },
  {
    id: "audit",
    name: "AuraAUDIT",
    tagline: "Corporate Expense Review",
    description: "Forensic analysis of corporate travel and event expenses. Multi-system reconciliation, anomaly detection, and overcharge recovery.",
    icon: Receipt,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
  },
  {
    id: "risk",
    name: "AuraRISK",
    tagline: "Compliance Score Analysis",
    description: "Continuous compliance monitoring with dynamic risk scoring. Policy adherence tracking and automated alert escalation.",
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
  },
];

const SPECIALIZED_MODULES = [
  {
    id: "carbo",
    name: "AuraCARBO",
    tagline: "Carbon Project Validation",
    description: "Independent verification of carbon credit projects — additionality, permanence, and registry integrity.",
    icon: Leaf,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    id: "loa",
    name: "AuraLOA",
    tagline: "Precatory Research Validation",
    description: "Automated due diligence for judicial precatories — origin verification, debtor analysis, and transfer chain validation.",
    icon: Scale,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    id: "tax",
    name: "AuraTAX",
    tagline: "Tax Credit Recovery",
    description: "Identification and validation of recoverable tax credits across complex corporate structures and jurisdictions.",
    icon: Receipt,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "market",
    name: "AuraMARKET",
    tagline: "Verified Asset Exchange",
    description: "Trust-scored marketplace for verified assets — certificates, credits, and validated instruments with full provenance.",
    icon: TrendingUp,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
];

const TRUST_INDEX_LEVELS = [
  { level: "AAA", label: "Maximum Trust", range: "95–100", color: "bg-emerald-500", textColor: "text-emerald-500" },
  { level: "AA", label: "High Trust", range: "80–94", color: "bg-green-500", textColor: "text-green-500" },
  { level: "A", label: "Adequate Trust", range: "65–79", color: "bg-blue-500", textColor: "text-blue-500" },
  { level: "B", label: "Under Review", range: "40–64", color: "bg-amber-500", textColor: "text-amber-500" },
  { level: "C", label: "Insufficient", range: "0–39", color: "bg-red-500", textColor: "text-red-500" },
];

export default function LandingPageTest() {
  const [, navigate] = useLocation();
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const trialRef = useRef<HTMLDivElement>(null);

  const { data: trialStatus, refetch: refetchStatus } = useQuery<TrialStatus>({
    queryKey: ["/api/trial/status"],
  });

  const remaining = trialStatus?.remaining ?? 3;
  const used = trialStatus?.used ?? 0;
  const limit = trialStatus?.limit ?? 3;
  const isBlocked = remaining <= 0;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const total = files.length + selected.length;
    if (total > 3) {
      setError("Maximo de 3 arquivos permitidos no teste gratuito.");
      return;
    }
    setFiles((prev) => [...prev, ...selected].slice(0, 3));
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError("Envie pelo menos 1 arquivo.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Descreva o que deseja analisar (minimo 10 caracteres).");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      formData.append("description", description);

      const response = await fetch("/api/trial/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        if (response.status === 429) {
          refetchStatus();
        }
        throw new Error(errData.error || "Erro ao processar.");
      }

      const data = await response.json();
      setResult(data);
      refetchStatus();
    } catch (err: any) {
      setError(err.message || "Erro ao processar analise.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const scrollToTrial = () => {
    trialRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="flex items-center justify-center w-8 h-8 rounded bg-emerald-600">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight text-zinc-100">AuraTECH</span>
              <span className="text-[10px] text-zinc-500 ml-2">Trust Infrastructure</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-zinc-400 hover:text-zinc-100"
              onClick={scrollToTrial}
              data-testid="button-nav-trial"
            >
              Free Diagnostic
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              onClick={() => navigate("/login")}
              data-testid="button-nav-login"
            >
              <LogIn className="w-3 h-3 mr-1" />
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <section className="relative py-24 px-6" data-testid="section-hero">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="outline" className="border-emerald-700/50 text-emerald-400 text-[10px] tracking-wider uppercase px-3 py-1">
            Trust Infrastructure
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-50 leading-tight" data-testid="text-hero-title">
            Aura<span className="text-emerald-400">TECH</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Infrastructure for evidence-based verification.
            <br />
            <span className="text-zinc-500">Modular platform that certifies, validates, and scores trust across industries.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={scrollToTrial}
              data-testid="button-hero-explore"
            >
              Explore the Platform
              <ArrowDown className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              onClick={() => navigate("/login")}
              data-testid="button-hero-signin"
            >
              Access Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)]" />
      </section>

      <Separator className="bg-zinc-800/50" />

      <section className="py-20 px-6" data-testid="section-platform">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center space-y-3">
            <p className="text-xs text-emerald-500 tracking-widest uppercase font-medium">The Platform</p>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-100">
              Modular trust architecture
            </h2>
            <p className="text-sm text-zinc-500 max-w-xl mx-auto">
              A transversal certification layer connects specialized verification modules.
              Each module operates independently but shares a common evidence standard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-8 items-center">
            <div className="md:col-span-1 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-xs font-medium text-emerald-400">AuraTRUST</p>
              <p className="text-[10px] text-zinc-600">Certification Layer</p>
            </div>
            <div className="md:col-span-1 flex items-center justify-center">
              <Network className="w-5 h-5 text-zinc-700" />
            </div>
            <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: "AuraDUE", icon: Search, color: "text-violet-500" },
                { name: "AuraAUDIT", icon: Receipt, color: "text-amber-500" },
                { name: "AuraRISK", icon: AlertTriangle, color: "text-red-500" },
                { name: "AuraCARBO", icon: Leaf, color: "text-green-500" },
                { name: "AuraLOA", icon: Scale, color: "text-indigo-500" },
                { name: "AuraTAX", icon: Receipt, color: "text-orange-500" },
              ].map((mod) => (
                <div key={mod.name} className="flex items-center gap-2 bg-zinc-900/50 rounded-lg px-3 py-2 border border-zinc-800/50">
                  <mod.icon className={`w-3.5 h-3.5 ${mod.color}`} />
                  <span className="text-xs text-zinc-400">{mod.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Separator className="bg-zinc-800/50" />

      <section className="py-20 px-6" data-testid="section-core">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <p className="text-xs text-emerald-500 tracking-widest uppercase font-medium">Core Infrastructure</p>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-100">
              Foundation components
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CORE_INFRASTRUCTURE.map((infra) => (
              <Card key={infra.id} className={`bg-zinc-900/50 border ${infra.borderColor} hover:bg-zinc-900/80 transition-colors`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${infra.bgColor} flex items-center justify-center shrink-0`}>
                      <infra.icon className={`w-5 h-5 ${infra.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base text-zinc-100">{infra.name}</CardTitle>
                      <CardDescription className="text-xs text-zinc-500">{infra.tagline}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-zinc-400 leading-relaxed">{infra.description}</p>
                  <div className="space-y-2">
                    {infra.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="text-xs text-zinc-500">{feat}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator className="bg-zinc-800/50" />

      <section className="py-20 px-6" data-testid="section-verification">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <p className="text-xs text-emerald-500 tracking-widest uppercase font-medium">Verification & Analysis</p>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-100">
              Primary modules
            </h2>
            <p className="text-sm text-zinc-500 max-w-lg mx-auto">
              Evidence-based verification engines, each addressing a distinct compliance domain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VERIFICATION_MODULES.map((mod) => (
              <Card key={mod.id} className={`bg-zinc-900/50 border ${mod.borderColor} hover:bg-zinc-900/80 transition-colors`}>
                <CardHeader className="pb-3">
                  <div className={`w-10 h-10 rounded-lg ${mod.bgColor} flex items-center justify-center mb-3`}>
                    <mod.icon className={`w-5 h-5 ${mod.color}`} />
                  </div>
                  <CardTitle className="text-base text-zinc-100">{mod.name}</CardTitle>
                  <CardDescription className="text-xs text-zinc-500">{mod.tagline}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-400 leading-relaxed">{mod.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator className="bg-zinc-800/50" />

      <section className="py-20 px-6" data-testid="section-specialized">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <p className="text-xs text-emerald-500 tracking-widest uppercase font-medium">Specialized Validation</p>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-100">
              Industry-specific modules
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SPECIALIZED_MODULES.map((mod) => (
              <div key={mod.id} className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-5 hover:bg-zinc-900/80 transition-colors space-y-3">
                <div className={`w-9 h-9 rounded-lg ${mod.bgColor} flex items-center justify-center`}>
                  <mod.icon className={`w-4 h-4 ${mod.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">{mod.name}</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{mod.tagline}</p>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">{mod.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="bg-zinc-800/50" />

      <section className="py-20 px-6" data-testid="section-trust-index">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <p className="text-xs text-emerald-500 tracking-widest uppercase font-medium">Dynamic Trust Model</p>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-100">
              Aura Trust Index™
            </h2>
            <p className="text-sm text-zinc-500 max-w-lg mx-auto">
              Composite score derived from certification status, evidence completeness, compliance history, and anomaly patterns.
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-5 gap-3">
              {TRUST_INDEX_LEVELS.map((lvl) => (
                <div key={lvl.level} className="text-center space-y-2">
                  <div className={`w-full h-2 rounded-full ${lvl.color}`} />
                  <p className={`text-lg font-bold ${lvl.textColor}`}>{lvl.level}</p>
                  <p className="text-[10px] text-zinc-500">{lvl.label}</p>
                  <p className="text-[10px] text-zinc-600">{lvl.range}</p>
                </div>
              ))}
            </div>
            <Separator className="bg-zinc-800/50" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <Award className="w-4 h-4 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">Certification Status</p>
                <p className="text-[10px] text-zinc-600">Active seals, valid certificates</p>
              </div>
              <div className="space-y-1">
                <Eye className="w-4 h-4 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">Evidence Completeness</p>
                <p className="text-[10px] text-zinc-600">Data coverage, source diversity</p>
              </div>
              <div className="space-y-1">
                <Layers className="w-4 h-4 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">Compliance History</p>
                <p className="text-[10px] text-zinc-600">Anomaly rate, resolution speed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator className="bg-zinc-800/50" />

      <section className="py-20 px-6" data-testid="section-market">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <p className="text-xs text-emerald-500 tracking-widest uppercase font-medium">Market Application</p>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-100">
              Initial deployment
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-zinc-900/50 border border-amber-500/20 hover:bg-zinc-900/80 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Plane className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-zinc-100">Corporate Travel & Events</CardTitle>
                    <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400 mt-1">Active</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-zinc-400 leading-relaxed">
                  R$ 51M+ in analyzed volume. Multi-system reconciliation (OBT, GDS, BSP, VCN), forensic expense analysis, and overcharge recovery for corporate travel programs.
                </p>
                <div className="space-y-1.5">
                  {[
                    "4-way reconciliation pipeline",
                    "Anomaly detection with AI",
                    "Chain of custody (Lei 13.964/2019)",
                    "Evidence-based overcharge recovery",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className="text-xs text-zinc-500">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-900/80 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-zinc-100">Expanding Sectors</CardTitle>
                    <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-500 mt-1">Roadmap</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-zinc-400 leading-relaxed">
                  The same trust infrastructure applies wherever evidence-based verification is required — from carbon markets to judicial assets.
                </p>
                <div className="space-y-1.5">
                  {[
                    "Carbon credit validation (AuraCARBO)",
                    "Precatory due diligence (AuraLOA)",
                    "Tax credit recovery (AuraTAX)",
                    "Verified asset exchange (AuraMARKET)",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />
                      <span className="text-xs text-zinc-500">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator className="bg-zinc-800/50" />

      <section ref={trialRef} className="py-20 px-6" data-testid="section-trial">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-3">
            <p className="text-xs text-emerald-500 tracking-widest uppercase font-medium">Free Diagnostic</p>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-100">
              Experience the platform
            </h2>
            <p className="text-sm text-zinc-500 max-w-lg mx-auto">
              Upload up to 3 files and describe what you want analyzed. Our AI generates a diagnostic report with full chain of custody — SHA-256, timestamps, and complete traceability.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-zinc-600">
              <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Data not stored</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Chain of custody included</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Results in seconds</span>
            </div>
          </div>

          {isBlocked && !result ? (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <Ban className="w-12 h-12 text-zinc-600 mx-auto" />
                <h3 className="text-lg font-bold text-zinc-200" data-testid="text-trial-blocked">Free diagnostics exhausted</h3>
                <p className="text-sm text-zinc-500 max-w-md mx-auto">
                  You have used all {limit} free diagnostics available. Activate the full platform to continue.
                </p>
              </div>
              <Card className="bg-emerald-950/20 border-emerald-500/20">
                <CardContent className="pt-6 space-y-4">
                  <h3 className="text-base font-semibold text-center text-zinc-200">Continue with AuraTECH Platform</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <Globe className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-zinc-300">Real-Time API Integration</p>
                        <p className="text-[10px] text-zinc-600">OBT, Backoffice, GDS, BSP, corporate cards</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-zinc-300">Interactive Dashboard</p>
                        <p className="text-[10px] text-zinc-600">KPIs, alerts, and real-time controls</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-zinc-300">Multi-Way Reconciliation</p>
                        <p className="text-[10px] text-zinc-600">PNR/TKT/EMD + invoice + card + expense</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-zinc-300">Certified Chain of Custody</p>
                        <p className="text-[10px] text-zinc-600">SHA-256, Lei 13.964/2019</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => navigate("/subscription")} data-testid="button-blocked-subscribe">
                      Full Platform — US$ 99/month
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" onClick={() => navigate("/login")} data-testid="button-blocked-login">
                      Already have an account — Sign In
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : !result ? (
            <div className="space-y-4">
              {trialStatus && (
                <div className={`rounded-lg px-4 py-3 ${remaining === 1 ? "bg-amber-950/20 border border-amber-500/20" : "bg-zinc-900/50 border border-zinc-800/50"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-zinc-400" data-testid="text-trial-counter">
                      {remaining === 1
                        ? "Last free diagnostic available"
                        : `${remaining} of ${limit} diagnostics remaining`}
                    </span>
                    <Badge variant={remaining === 1 ? "destructive" : "secondary"} className="text-[10px]">
                      {used}/{limit} used
                    </Badge>
                  </div>
                  <Progress value={(used / limit) * 100} className="h-1.5" />
                  {remaining === 1 && (
                    <p className="text-[10px] text-amber-500 mt-2">
                      After this diagnostic, continue with the full AuraTECH platform.
                    </p>
                  )}
                </div>
              )}

              <Card className="bg-zinc-900/50 border border-zinc-800/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-zinc-200">
                    <Upload className="w-4 h-4" />
                    1. Upload your files
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500">
                    Up to 3 files (CSV, XLSX, PDF, TXT, JSON, XML) — max 10 MB each
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div
                    className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="dropzone-files"
                  >
                    <Upload className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                    <p className="text-sm text-zinc-400">Click to select files</p>
                    <p className="text-xs text-zinc-600 mt-1">or drag and drop here</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".csv,.xlsx,.xls,.pdf,.txt,.json,.xml"
                      onChange={handleFileSelect}
                      className="hidden"
                      data-testid="input-files"
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-zinc-800/50 rounded-md px-3 py-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-medium text-zinc-300" data-testid={`text-filename-${i}`}>{f.name}</span>
                            <span className="text-xs text-zinc-600">({formatFileSize(f.size)})</span>
                          </div>
                          <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-300" onClick={() => removeFile(i)} data-testid={`button-remove-file-${i}`}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                      <p className="text-xs text-zinc-600">{files.length}/3 files selected</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border border-zinc-800/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-zinc-200">
                    <FileText className="w-4 h-4" />
                    2. Describe your intent
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500">
                    Explain what you want to analyze, reconcile, or verify with these files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Ex: I want to reconcile airline tickets issued by the agency with corporate card invoices to identify value discrepancies and potential duplicate charges from October to December 2025..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="text-sm bg-zinc-900 border-zinc-700 text-zinc-300 placeholder:text-zinc-700"
                    data-testid="input-description"
                  />
                  <p className="text-xs text-zinc-600 mt-1">{description.length} characters</p>
                </CardContent>
              </Card>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/20 border border-red-500/20 rounded-md px-3 py-2" data-testid="text-error">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                size="lg"
                onClick={handleAnalyze}
                disabled={isAnalyzing || files.length === 0 || description.trim().length < 10}
                data-testid="button-analyze"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing with AI... please wait
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Free Diagnostic
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {result.trialStatus && (
                <div className={`rounded-lg px-4 py-3 ${result.trialStatus.remaining === 0 ? "bg-amber-950/20 border border-amber-500/20" : "bg-zinc-900/50 border border-zinc-800/50"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-zinc-400" data-testid="text-trial-result-counter">
                      {result.trialStatus.remaining === 0
                        ? "All free diagnostics used"
                        : result.trialStatus.remaining === 1
                          ? "1 free diagnostic remaining"
                          : `${result.trialStatus.remaining} free diagnostics remaining`}
                    </span>
                    <Badge variant={result.trialStatus.remaining === 0 ? "destructive" : "secondary"} className="text-[10px]">
                      {result.trialStatus.used}/{result.trialStatus.limit}
                    </Badge>
                  </div>
                  <Progress value={(result.trialStatus.used / result.trialStatus.limit) * 100} className="h-1.5" />
                </div>
              )}

              <Card className="bg-zinc-900/50 border border-emerald-500/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2 text-zinc-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      Diagnostic Report
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">Free Diagnostic</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm prose-invert max-w-none text-sm text-zinc-300"
                    data-testid="text-report"
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(result.report) }}
                  />
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border border-zinc-800/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-zinc-200">
                    <Lock className="w-4 h-4" />
                    Digital Chain of Custody
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500">
                    Full traceability per Lei 13.964/2019 (Anti-Crime Package)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-zinc-800/50 rounded-md p-3 space-y-1">
                      <p className="text-xs font-medium text-zinc-500">Envelope ID</p>
                      <p className="text-xs font-mono text-zinc-400" data-testid="text-envelope-id">{result.envelope.envelopeId}</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-md p-3 space-y-1">
                      <p className="text-xs font-medium text-zinc-500">AI Model</p>
                      <p className="text-xs font-mono text-zinc-400">{result.envelope.processing.model}</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-md p-3 space-y-1">
                      <p className="text-xs font-medium text-zinc-500">Started</p>
                      <p className="text-xs font-mono text-zinc-400">{result.envelope.processing.startedAt}</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-md p-3 space-y-1">
                      <p className="text-xs font-medium text-zinc-500">Completed</p>
                      <p className="text-xs font-mono text-zinc-400">{result.envelope.processing.completedAt}</p>
                    </div>
                  </div>

                  <Separator className="bg-zinc-800/50" />

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-zinc-400">Analyzed files (SHA-256)</p>
                    {result.files.map((f, i) => (
                      <div key={i} className="bg-zinc-800/50 rounded-md p-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3 h-3 text-emerald-500" />
                          <span className="text-xs font-medium text-zinc-300">{f.originalName}</span>
                          <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-500">{f.format.toUpperCase()}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3 text-zinc-600" />
                          <code className="text-[10px] text-zinc-600 font-mono break-all" data-testid={`text-file-hash-${i}`}>
                            {f.sha256}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-zinc-800/50" />

                  <div className="space-y-2">
                    <div className="bg-zinc-800/50 rounded-md p-2 space-y-1">
                      <p className="text-xs font-medium text-zinc-500">Report Hash (SHA-256)</p>
                      <code className="text-[10px] text-zinc-600 font-mono break-all" data-testid="text-report-hash">
                        {result.envelope.output.reportHash}
                      </code>
                    </div>
                    <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-md p-2 space-y-1">
                      <p className="text-xs font-medium text-emerald-400">Envelope SHA-256</p>
                      <code className="text-[10px] font-mono break-all text-emerald-300/70" data-testid="text-envelope-hash">
                        {result.envelope.envelopeSha256}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-emerald-950/20 border-emerald-500/20">
                <CardContent className="pt-6 space-y-4">
                  <h3 className="text-base font-semibold text-center text-zinc-200">
                    {result.trialStatus?.remaining === 0
                      ? "Free diagnostics exhausted — continue with full platform"
                      : "Ready for more?"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <Globe className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-zinc-300">Real-Time API Integration</p>
                        <p className="text-[10px] text-zinc-600">Connect OBT, Backoffice, GDS, BSP and corporate cards</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-zinc-300">Interactive Dashboard</p>
                        <p className="text-[10px] text-zinc-600">KPIs, alerts, audit timeline and real-time controls</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-zinc-300">Multi-Way Reconciliation</p>
                        <p className="text-[10px] text-zinc-600">PNR/TKT/EMD + invoice + card/VCN + expense — AI automated</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-zinc-300">Certified Chain of Custody</p>
                        <p className="text-[10px] text-zinc-600">SHA-256, immutable trail, Lei 13.964/2019</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => navigate("/subscription")} data-testid="button-trial-subscribe">
                      Full Platform — US$ 99/month
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" onClick={() => navigate("/login")} data-testid="button-trial-login">
                      Access Platform
                    </Button>
                    {result.trialStatus && result.trialStatus.remaining > 0 && (
                      <Button variant="ghost" className="text-zinc-400 hover:text-zinc-200" onClick={() => { setResult(null); setFiles([]); setDescription(""); }} data-testid="button-trial-new">
                        New Diagnostic ({result.trialStatus.remaining} remaining)
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      <Separator className="bg-zinc-800/50" />

      <footer className="py-16 px-6" data-testid="section-footer">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-zinc-200">AuraTECH</span>
          </div>
          <p className="text-sm text-zinc-500">
            Infrastructure for Evidence-Based Trust
          </p>
          <p className="text-[10px] text-zinc-700">
            AuraTECH™ · AuraTRUST™ · AuraAUDIT™ · AuraDUE™ · AuraRISK™ · AuraCARBO™ · AuraLOA™ · AuraTAX™ · AuraMARKET™ · Aura Trust Index™
          </p>
          <p className="text-[10px] text-zinc-800">
            © {new Date().getFullYear()} AuraTECH. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function formatMarkdown(text: string): string {
  return text
    .replace(/^### (.*$)/gm, '<h3 class="text-sm font-semibold mt-4 mb-2 text-zinc-200">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-base font-semibold mt-5 mb-2 text-zinc-200">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-lg font-bold mt-6 mb-3 text-zinc-100">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-zinc-200">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gm, '<li class="ml-4 text-sm text-zinc-400">$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 text-sm text-zinc-400">$1. $2</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}
