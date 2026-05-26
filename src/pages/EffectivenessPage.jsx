import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  ChevronRight, 
  Sliders, 
  Settings, 
  Info, 
  Target, 
  Zap, 
  Thermometer, 
  Clock, 
  Layers, 
  Eye, 
  RefreshCw, 
  CheckCircle2, 
  Compass, 
  FileText,
  AlertCircle
} from "lucide-react";
import Footer from "../components/Footer";
import FloatingBookingButton from "../components/FloatingBookingButton";
import BookingButton from "../components/BookingForm";

// ═══════════════════════════════════════════════════════════════
// STYLE 1: INTERACTIVE HOLOGRAPHIC DERMAL SCANNER (HUD CONSOLE)
// ═══════════════════════════════════════════════════════════════
function DermalLensScanner({ imageBefore, imageAfter, caseTitle, isSpectralMode }) {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [collagenReadout, setCollagenReadout] = useState(45);

  const handlePointerMove = (clientX, clientY) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    // Constraint boundaries
    const boundedX = Math.max(0, Math.min(100, x));
    const boundedY = Math.max(0, Math.min(100, y));
    
    setMousePos({ x: boundedX, y: boundedY });
    setIsHovered(true);

    // Dynamic collagen calculation: higher collagen in the center/healed areas
    const distanceToCenter = Math.sqrt(Math.pow(boundedX - 50, 2) + Math.pow(boundedY - 50, 2));
    const baseCollagen = 92 - Math.round(distanceToCenter * 0.6);
    setCollagenReadout(Math.max(45, Math.min(98, baseCollagen)));
  };

  const handleMouseMove = (e) => {
    handlePointerMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 0) return;
    handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  return (
    <div className="relative w-full aspect-[4/3] rounded-[24px] overflow-hidden bg-slate-50 border border-slate-200/80 shadow-lg select-none group cursor-none">
      {/* Grid overlay for medical radar effect */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #024244 1px, transparent 1px),
            linear-gradient(to bottom, #024244 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Sweep Scanner line */}
      <div className="absolute inset-x-0 h-[1.5px] bg-[#024244]/25 shadow-[0_0_8px_rgba(2,66,68,0.3)] z-20 pointer-events-none animate-scanline" />

      {/* Base Image (Before - untreated) */}
      <img
        src={imageBefore}
        alt="Clinical Before"
        className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
        style={{
          filter: isSpectralMode 
            ? "brightness(0.85) contrast(1.7) saturate(0.6) sepia(0.2) hue-rotate(150deg) invert(0.05)" 
            : "brightness(0.95) contrast(1.02)"
        }}
      />

      {/* Clipped Overlaid Image (After - healed) */}
      <img
        src={imageAfter}
        alt="Clinical After"
        className="absolute inset-0 w-full h-full object-cover z-25 pointer-events-none transition-all duration-350"
        style={{
          clipPath: isHovered 
            ? `circle(90px at ${mousePos.x}% ${mousePos.y}%)` 
            : `circle(90px at 50% 50%)`
        }}
      />

      {/* Magnifying Lens HUD Overlay (follows pointer) */}
      <div 
        className="absolute w-[180px] h-[180px] rounded-full border-2 border-[#024244] shadow-[0_0_20px_rgba(2,66,68,0.15)] z-30 pointer-events-none flex items-center justify-center transition-all duration-100 ease-out"
        style={{
          left: isHovered ? `${mousePos.x}%` : '50%',
          top: isHovered ? `${mousePos.y}%` : '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Reticle / Crosshair lines */}
        <div className="absolute w-full h-[1px] bg-[#024244]/20" />
        <div className="absolute h-full w-[1px] bg-[#024244]/20" />
        
        {/* Animated outer spinning rings */}
        <div className="absolute w-[166px] h-[166px] rounded-full border border-dashed border-[#024244]/40 animate-spin-slow" />
        <div className="absolute w-[150px] h-[150px] rounded-full border border-dotted border-[#024244]/25 animate-spin-reverse" />

        {/* Dynamic Lens Floating Telemetry Block */}
        <div className="absolute top-[96px] left-[96px] bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg p-2.5 text-[8.5px] font-mono text-[#024244] shadow-lg min-w-[110px] z-45">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-100 pb-1 mb-1 font-semibold">
            <span>PROBE READOUT</span>
            <span className="w-1.5 h-1.5 bg-[#024244] rounded-full animate-ping" />
          </div>
          <div>LOC: X {Math.round(mousePos.x)}% | Y {Math.round(mousePos.y)}%</div>
          <div className="text-slate-800 mt-0.5">COLLAGEN: <span className="text-[#024244] font-bold">{collagenReadout}%</span></div>
          <div className="text-[#024244] mt-0.5 font-bold uppercase tracking-wider">DERMIS: HEALED</div>
        </div>
      </div>

      {/* Top Header Panel inside Simulator */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-30 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-full px-3.5 py-1 text-[9px] font-mono font-bold text-slate-800 flex items-center gap-1.5 shadow-sm">
          <Activity className="w-3.5 h-3.5 text-[#024244] animate-pulse" />
          <span className="uppercase tracking-widest text-[#024244]">
            {isSpectralMode ? "Spectral UV Melanin Scan" : "Dermal Scanner Probe"}
          </span>
        </div>

        <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-full px-3.5 py-1 text-[9px] font-mono font-bold text-[#024244] shadow-sm uppercase tracking-wider">
          Accuracy: 99.8%
        </div>
      </div>

      {/* Bottom Corner Label Badges */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full px-3 py-1 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest z-30">
        Before: Target Anomalies
      </div>

      <div className="absolute bottom-4 right-4 bg-[#ebf9fa]/95 backdrop-blur-md border border-[#024244]/15 rounded-full px-3 py-1 text-[9px] font-mono font-bold text-[#024244] uppercase tracking-widest z-30">
        Inside Lens: Post-Treatment
      </div>
      
      {/* Container events */}
      <div 
        className="absolute inset-0 z-35"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLE 3: BIOLOGICAL HEALING PHASE LAYOUT (CUTAWAY SYSTEM)
// ═══════════════════════════════════════════════════════════════
function DermalLayerGraphic({ phaseIdx }) {
  return (
    <div className="relative w-full aspect-[4/3] rounded-3xl bg-slate-50 border border-slate-200 p-6 flex flex-col justify-between overflow-hidden group shadow-md text-left">
      <div className="absolute inset-0 bg-radial-gradient from-[#024244]/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Scanning laser visualizer */}
      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-[#024244]/5 to-transparent pointer-events-none transition-all duration-500"
           style={{ transform: `translateY(${phaseIdx * 20}px)` }} />

      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-2 z-10">
        <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#024244]" />
          <span>Biochemical Cross-Section Model</span>
        </span>
        <span className="text-[9px] bg-[#ebf9fa] text-[#024244] border border-[#024244]/15 font-mono px-2 py-0.5 rounded uppercase">
          Phase {phaseIdx + 1}
        </span>
      </div>

      {/* Interactive Dermal Layer cutaway block */}
      <div className="flex-1 flex flex-col gap-2 justify-center relative z-10 py-2">
        {/* Layer 1: Epidermis */}
        <div className="h-10 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 relative p-2 flex items-center justify-between group-hover:scale-[1.01] transition-transform">
          <span className="text-[10px] font-bold text-amber-900 font-mono uppercase">Epidermis Layer</span>
          <span className="text-[8.5px] font-mono text-amber-800/80">
            {phaseIdx === 0 && "Micro-ablated pores active"}
            {phaseIdx === 1 && "Dermal re-epithelialization"}
            {phaseIdx === 2 && "Tonal alignment phase"}
            {phaseIdx === 3 && "Fully sealed protective barrier"}
          </span>
        </div>

        {/* Laser Beam projection line (phase specific depth) */}
        {phaseIdx === 0 && (
          <div className="h-[2px] bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse my-0.5" />
        )}
        {phaseIdx === 1 && (
          <div className="h-[2px] bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)] animate-pulse my-0.5" />
        )}

        {/* Layer 2: Dermis (with floating fibroblasts/collagen fibers) */}
        <div className="flex-1 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-100/80 relative p-3 flex flex-col justify-between overflow-hidden">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-[#024244] font-mono uppercase">Dermal Layer</span>
            <span className="text-[8.5px] font-mono text-slate-500">Depth: ~1.5mm</span>
          </div>

          {/* Render cell items based on selected phase */}
          <div className="relative flex-1 flex items-center justify-around gap-2 mt-1">
            {phaseIdx === 0 && (
              <>
                <div className="w-4.5 h-4.5 rounded-full bg-red-100 border border-red-300 flex items-center justify-center text-[7px] text-red-800 font-mono animate-ping">H</div>
                <div className="w-4.5 h-4.5 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center text-[7px] text-orange-850 font-mono">MAC</div>
                <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[7px] text-slate-600 font-mono font-semibold">COAG</div>
              </>
            )}
            {phaseIdx === 1 && (
              <>
                <div className="w-4.5 h-4.5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[7px] text-emerald-850 font-mono animate-pulse">FIB</div>
                <div className="w-4.5 h-4.5 rounded-full bg-orange-100 border border-orange-350 flex items-center justify-center text-[7px] text-orange-800 font-mono animate-bounce">MAC</div>
                <div className="w-3.5 h-3.5 rounded-full bg-teal-100 border border-teal-350/50 flex items-center justify-center text-[7px] text-teal-850 font-mono">CYT</div>
              </>
            )}
            {phaseIdx === 2 && (
              <>
                <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center text-[7.5px] text-emerald-900 font-mono animate-pulse font-bold">FIB</div>
                <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center text-[7px] text-emerald-800 font-mono">COL III</div>
                <div className="w-4.5 h-4.5 rounded-full bg-teal-50 border border-teal-300 flex items-center justify-center text-[7px] text-teal-800 font-mono">NEO</div>
              </>
            )}
            {phaseIdx === 3 && (
              <>
                <div className="w-4.5 h-4.5 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center text-[8px] text-emerald-950 font-mono shadow-sm font-bold">COL I</div>
                <div className="w-4.5 h-4.5 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center text-[8px] text-emerald-950 font-mono shadow-sm font-bold">COL I</div>
                <div className="w-4.5 h-4.5 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center text-[8px] text-emerald-950 font-mono shadow-sm font-bold">COL I</div>
              </>
            )}
          </div>
          
          <div className="text-[8.5px] text-slate-500 leading-normal mt-2 font-mono">
            {phaseIdx === 0 && "» High inflammatory signaling, micro-thermal grid ablation."}
            {phaseIdx === 1 && "» Fibroblast migration activated, capillary growth initialized."}
            {phaseIdx === 2 && "» Rapid collagen type III synthesis & structural matrix rebuilding."}
            {phaseIdx === 3 && "» Cross-linking of mature Collagen I fibers. High tissue resilience."}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-[8.5px] text-slate-400 font-mono">
        <span>THERMAL INTENSITY: {phaseIdx === 0 ? "HIGH (65°C)" : phaseIdx === 1 ? "MODERATE (42°C)" : "HOMEOSTATIC (37°C)"}</span>
        <span>MELANIN STATUS: STABLE</span>
      </div>
    </div>
  );
}

export default function EffectivenessPage() {
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const [isSpectralMode, setIsSpectralMode] = useState(false);
  
  // Fitzpatrick State
  const [activeSkinTypeIdx, setActiveSkinTypeIdx] = useState(2);
  
  // Timeline State
  const [activePhaseIdx, setActivePhaseIdx] = useState(2);

  // FAQ Accordion State
  const [openFaqIdx, setOpenFaqIdx] = useState(0);

  const CLINICAL_CASES = [
    {
      num: "01",
      title: "Post-Acne Scar Revision",
      category: "Laser Surgery",
      outcome: "85% Scar Depth Reduction",
      sessions: "4 Sessions",
      downtime: "3 - 5 Days",
      anesthesia: "Topical Cream",
      laser: "Fractional CO2",
      clinicalNotes: "Patient presented with Type IV deep rolling acne scars. Fractional CO2 thermal micro-beams vaporized fibrotic collagen fields. Four sessions achieved significant depth reduction and dermal volume expansion.",
      imageBefore: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80",
      imageAfter: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80",
      metrics: [
        { label: "Collagen Renewal", val: "+92%" },
        { label: "Depth Clearance", val: "85%" },
        { label: "Downtime Rate", val: "Minimal" }
      ]
    },
    {
      num: "02",
      title: "Dermal Hyperpigmentation & Melasma",
      category: "Dermatological",
      outcome: "90% Pigment Clearance",
      sessions: "3 Sessions",
      downtime: "Zero Downtime",
      anesthesia: "None Required",
      laser: "Picosecond Sweeps",
      clinicalNotes: "Patient presented with epidermal melasma and sun pigmentation. Picosecond sweeps shattered pigment clusters into microscopic elements for natural lymphatic clearance.",
      imageBefore: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
      imageAfter: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80",
      metrics: [
        { label: "Melanin Clearance", val: "90%" },
        { label: "Tone Evenness", val: "+95%" },
        { label: "Thermal Redness", val: "0%" }
      ]
    },
    {
      num: "03",
      title: "Structural Texture Correction",
      category: "Laser Rejuvenation",
      outcome: "95% Smoothness Shift",
      sessions: "2 Sessions",
      downtime: "2 Days",
      anesthesia: "Topical Gel",
      laser: "Erbium:YAG Resurfacing",
      clinicalNotes: "Severe textural anomalies and enlarged pore counts. Erbium:YAG resurfacing vaporized uneven surface layers and contracted pores through precise thermal mapping.",
      imageBefore: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
      imageAfter: "https://images.unsplash.com/photo-1504813184591-01552661c87f?auto=format&fit=crop&w=800&q=80",
      metrics: [
        { label: "Pore Size Reduction", val: "-68%" },
        { label: "Elasticity Boost", val: "+84%" },
        { label: "Recovery Speed", val: "Rapid" }
      ]
    },
  ];

  const FITZPATRICK_TYPES = [
    {
      type: "Type I",
      desc: "Very fair, burns easily, never tans",
      color: "#fbf0e1",
      laserPulse: "High pulse duration, light sweeps",
      absorptionRatio: "15% Melanin absorption",
      coolingProtocol: "Sub-zero continuous air cooling",
      energyRange: "18 J/cm²",
      safetyPercent: 99
    },
    {
      type: "Type II",
      desc: "Fair, burns easily, tans minimally",
      color: "#f5dec2",
      laserPulse: "Standard fractional parameters",
      absorptionRatio: "25% Melanin absorption",
      coolingProtocol: "Standard contact sapphire plate",
      energyRange: "24 J/cm²",
      safetyPercent: 98
    },
    {
      type: "Type III",
      desc: "Light brown, burns moderately, tans gradually",
      color: "#e8c39e",
      laserPulse: "Moderate settings, custom mapping",
      absorptionRatio: "40% Melanin absorption",
      coolingProtocol: "Double pass contact cooling",
      energyRange: "22 J/cm²",
      safetyPercent: 97
    },
    {
      type: "Type IV",
      desc: "Medium brown, burns minimally, tans well",
      color: "#d1a37c",
      laserPulse: "Longer pulse width, relaxation cycles",
      absorptionRatio: "55% Melanin absorption",
      coolingProtocol: "Dual-laser relaxation continuous cooling",
      energyRange: "16 J/cm²",
      safetyPercent: 96
    },
    {
      type: "Type V",
      desc: "Dark brown, rarely burns, tans profusely",
      color: "#ab7a51",
      laserPulse: "Ultra-short picosecond micro-pulses only",
      absorptionRatio: "75% Melanin absorption",
      coolingProtocol: "Continuous air cooling + post-peptides",
      energyRange: "10 J/cm²",
      safetyPercent: 95
    },
    {
      type: "Type VI",
      desc: "Deep brown/black, never burns, tans deeply",
      color: "#5c3d25",
      laserPulse: "Sub-thermal Picosecond sweeps only",
      absorptionRatio: "90% Melanin absorption",
      coolingProtocol: "Advanced safety sub-thermal air cooling",
      energyRange: "8 J/cm²",
      safetyPercent: 95
    },
  ];

  const HEALING_PHASES = [
    {
      day: "Hour 0 - 24",
      name: "Inflammatory Phase",
      title: "Immediate Dermal Response",
      desc: "Vascular responses activate instantly post-treatment. Laser-treated micro-zones initiate thermal coagulation fields, recruiting defensive immune cells (macrophages and neutrophils) to cleanse damaged collagen fragments.",
      cellFocus: "Macrophages, Neutrophils, Heat Shock Proteins",
      recommendation: "Apply sub-zero cold compresses and sterilized hydrating thermal gels. Strictly avoid direct heat exposure.",
      barMetrics: [
        { label: "Cellular Infiltration", val: "95%" },
        { label: "Dermal Coagulation", val: "85%" },
        { label: "Collagen Maturation", val: "2%" }
      ]
    },
    {
      day: "Day 1 - 4",
      name: "Re-epithelialization",
      title: "Epidermal Barrier Rebuilding",
      desc: "Keratinocytes at the wound margins migrate inward across the micro-ablated pathways to reconstruct a fully sealed skin surface. Fibroblast cells begin migrating from surrounding tissue to the core laser treatment zones.",
      cellFocus: "Migrating Keratinocytes, Activated Fibroblasts",
      recommendation: "Apply copper peptide creams and absolute broad-spectrum mineral sunscreens. Do not peel micro-crusts.",
      barMetrics: [
        { label: "Cellular Infiltration", val: "70%" },
        { label: "Dermal Coagulation", val: "20%" },
        { label: "Collagen Maturation", val: "15%" }
      ]
    },
    {
      day: "Day 5 - 14",
      name: "Neocollagenesis",
      title: "Collagen III Synthesis Matrix",
      desc: "Fibroblasts synthesize copious amounts of Collagen Type III, building a fresh extracellular matrix. Skin elasticity values begin ramping up. Minor redness fades as vascular networks normalize.",
      cellFocus: "Fibroblasts, Collagen Type III, Myofibroblasts",
      recommendation: "Incorporate active vitamin C serums (if cleared) and specialized recovery peptide concentrates.",
      barMetrics: [
        { label: "Cellular Infiltration", val: "40%" },
        { label: "Dermal Coagulation", val: "0%" },
        { label: "Collagen Maturation", val: "68%" }
      ]
    },
    {
      day: "Day 28+",
      name: "Matrix Remodeling",
      title: "Collagen Type I Maturation",
      desc: "Immature Collagen Type III is replaced by highly structured, resilient Collagen Type I. Dermal fibers cross-link along structural tension lines, flattening acne scars and correcting stubborn dermal pigment grids permanently.",
      cellFocus: "Collagen Type I, Mature Dermal Elastic Fibers",
      recommendation: "Maintain routine skincare protection. Observe secondary collagen lifting and structural improvements up to 6 months.",
      barMetrics: [
        { label: "Cellular Infiltration", val: "10%" },
        { label: "Dermal Coagulation", val: "0%" },
        { label: "Collagen Maturation", val: "95%" }
      ]
    }
  ];

  const CLINICAL_FAQS = [
    {
      q: "How many laser treatments are standard for scar clearance?",
      a: "Our clinical records indicate most patient charts clear 75% to 85% of acne scar depth in 3 to 4 fractional sessions, spaced 4 to 6 weeks apart. Severe rolling or icepick scars may require subcision or local cross-peel protocols to achieve optimal matrix elevation."
    },
    {
      q: "What is the science behind Picosecond pulse clearance?",
      a: "Picosecond lasers deploy ultra-short bursts of light energy (one trillionth of a second) to shatter deep dermal pigments. Unlike nanosecond lasers, picosecond sweeps rely strictly on mechanical shockwaves rather than thermal heating, making them extremely safe for Fitzpatrick Type IV to VI skin profiles with zero risk of post-inflammatory hyperpigmentation (PIH)."
    },
    {
      q: "Are the before and after outcomes permanent?",
      a: "Yes. Collagen synthesis stimulated by fractional thermal micro-beams structurally re-patterns the dermal matrix. Once scar tissue is elevated to the surrounding skin level or melanin deposits are removed via lymphatic clearance, the structural changes remain permanent."
    },
    {
      q: "Is there any safety testing or regulatory certification?",
      a: "Every laser and light sweeping module deployed at PScar is fully FDA-cleared. We calibrate pulse widths, peak power indices, and continuous sapphire plate contact temperature targets based on medical-grade safety standards."
    }
  ];

  return (
    <div className="bg-[#f8fafb] min-h-screen text-slate-800 font-sans overflow-x-hidden">
      
      {/* 1. HERO SECTION & HUD DIAGNOSTIC MONITOR */}
      <section className="relative bg-gradient-to-b from-[#ebf9fa]/50 via-white to-transparent pt-32 pb-24 px-6 md:px-12 text-left">
        {/* Background grids and glowing fields */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #024244 1px, transparent 1px),
              linear-gradient(to bottom, #024244 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute top-1/4 right-0 w-[450px] h-[450px] bg-[#ebf9fa] rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Typographic Header block */}
          <div className="flex flex-col items-start text-left mb-16 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#024244]/5 border border-[#024244]/10 text-[#024244] text-[10px] font-mono uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Laboratory Diagnostic Dashboard</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-normal tracking-tight text-[#024244] leading-[1.08] mb-6">
              Clinical Efficacy & <br />
              <span className="font-semibold bg-gradient-to-r from-[#024244] to-[#046c6f] bg-clip-text text-transparent">
                Dermal Performance
              </span>
            </h1>

            <p className="text-slate-500 text-sm sm:text-[14.5px] leading-relaxed max-w-2xl font-normal">
              Witness the physics and biology of clinical skin restoration. Explore our multi-spectral simulator console below: toggle ultraviolet filters, drag the dermal probe scanner, and select cases to view live outcomes telemetry.
            </p>
          </div>

          {/* DYNAMIC CONSOLE LAYOUT (STYLE 1) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch bg-white border border-slate-100 rounded-[36px] p-6 md:p-10 shadow-xl">
            
            {/* Left Console Column: Diagnostics Control Desk (5 Columns) */}
            <div className="lg:col-span-5 flex flex-col justify-between text-left">
              <div>
                {/* Console System Info */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#024244] animate-spin-slow" />
                    <span className="text-[10px] font-mono font-bold text-slate-800 uppercase tracking-widest">
                      SYSTEM MONITOR v2.08
                    </span>
                  </div>
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                </div>

                {/* Case Selection Cards */}
                <div className="flex flex-col gap-3.5 mb-8">
                  {CLINICAL_CASES.map((c, idx) => {
                    const isActive = activeCaseIdx === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveCaseIdx(idx)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between group ${
                          isActive
                            ? "bg-[#024244] border-transparent text-white shadow-md shadow-[#024244]/10"
                            : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-655"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-[9.5px] font-mono font-bold ${isActive ? "text-emerald-250" : "text-slate-400"}`}>
                            [{c.num}]
                          </span>
                          <div>
                            <span className={`text-[8.5px] uppercase font-bold tracking-widest block mb-0.5 ${isActive ? "text-[#ebf9fa]/80" : "text-[#024244]"}`}>
                              {c.category}
                            </span>
                            <h4 className="text-xs sm:text-sm font-semibold leading-tight">{c.title}</h4>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? "text-white translate-x-1" : "text-slate-450 group-hover:translate-x-0.5"}`} />
                      </button>
                    );
                  })}
                </div>

                {/* Case Diagnostics Readings */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCaseIdx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-left"
                  >
                    <h5 className="text-[9.5px] font-mono font-bold text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-slate-200/50 pb-2">
                      <Info className="w-3.5 h-3.5 text-[#024244]" />
                      <span>CLINICAL REPORT READOUT</span>
                    </h5>
                    <p className="text-xs text-slate-550 leading-relaxed font-mono">
                      {CLINICAL_CASES[activeCaseIdx].clinicalNotes}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-slate-200/50 text-[10px] font-mono">
                      <div>
                        <span className="text-slate-400 block uppercase">LASER WAVELENGTH</span>
                        <span className="font-semibold text-[#024244] mt-1 block">
                          {CLINICAL_CASES[activeCaseIdx].laser}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block uppercase">COMFORT MODALITY</span>
                        <span className="font-semibold text-[#024244] mt-1 block">
                          {CLINICAL_CASES[activeCaseIdx].anesthesia}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Live Outcome Metrics Matrix */}
              <div className="border-t border-slate-100 pt-6 mt-8">
                <span className="text-[9.5px] font-mono font-bold text-slate-450 uppercase tracking-widest block mb-4">
                  INTEGRITY COEFFICIENT MATRIX
                </span>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {CLINICAL_CASES[activeCaseIdx].metrics.map((m, mIdx) => (
                    <div key={mIdx} className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-left">
                      <span className="text-base font-bold text-[#024244] font-mono block leading-none mb-1">
                        {m.val}
                      </span>
                      <span className="text-[8.5px] text-slate-400 leading-tight uppercase font-mono block">
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Console Column: The Imaging Scanner (7 Columns) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div className="w-full h-full flex flex-col justify-between">
                
                {/* Visualizer Mode Toggles */}
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#024244] rounded-full animate-ping" />
                    <span className="text-[9.5px] font-mono font-semibold text-slate-800 uppercase tracking-widest">
                      ACTIVE SCAN PORT
                    </span>
                  </div>

                  {/* Spectral UV Toggle buttons */}
                  <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-lg p-0.5">
                    <button
                      onClick={() => setIsSpectralMode(false)}
                      className={`px-3 py-1 text-[8.5px] font-mono rounded font-bold uppercase transition-all ${
                        !isSpectralMode 
                          ? "bg-[#024244] text-white" 
                          : "text-slate-450 hover:text-slate-700"
                      }`}
                    >
                      Dermal
                    </button>
                    <button
                      onClick={() => setIsSpectralMode(true)}
                      className={`px-3 py-1 text-[8.5px] font-mono rounded font-bold uppercase transition-all ${
                        isSpectralMode 
                          ? "bg-[#024244] text-white" 
                          : "text-slate-455 hover:text-slate-700"
                      }`}
                    >
                      Spectral UV
                    </button>
                  </div>
                </div>

                {/* Interactive Scanner */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeCaseIdx}-${isSpectralMode}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="w-full flex-1 flex items-center justify-center"
                  >
                    <DermalLensScanner
                      imageBefore={CLINICAL_CASES[activeCaseIdx].imageBefore}
                      imageAfter={CLINICAL_CASES[activeCaseIdx].imageAfter}
                      caseTitle={CLINICAL_CASES[activeCaseIdx].title}
                      isSpectralMode={isSpectralMode}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Booking Trigger below */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-5 text-[10px] font-mono">
                  <div className="text-left">
                    <span className="text-slate-400 block uppercase">EXPECTED OUTCOME INTERVAL</span>
                    <span className="text-slate-800 mt-1 block font-semibold">
                      Complete clearance within {CLINICAL_CASES[activeCaseIdx].sessions}.
                    </span>
                  </div>
                  <BookingButton
                    trigger={
                      <button className="bg-[#024244] hover:bg-[#013537] text-white text-xs font-mono font-bold px-6 py-3 rounded-xl shadow-md transition-all duration-300 transform active:scale-95">
                        [INITIALIZE CASE SCHEDULING]
                      </button>
                    }
                  />
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. STYLE 2: FITZPATRICK DIAL GAUGE CONFIGURATOR */}
      <section className="py-24 px-6 md:px-12 bg-white border-b border-slate-100 text-left">
        <div className="max-w-6xl mx-auto">
          
          {/* Asymmetric Header Block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16 pb-10 border-b border-slate-100">
            <div className="lg:col-span-7 text-left">
              <div className="inline-flex items-center gap-2 mb-4 text-[#024244] font-bold text-xs uppercase tracking-wider bg-[#024244]/5 px-3.5 py-1.5 rounded-full border border-[#024244]/10">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Skin Type Calibration</span>
              </div>
              <h2 className="text-3.5xl sm:text-4xl lg:text-[45px] font-normal text-slate-900 tracking-tight leading-[1.08] mb-2">
                Fitzpatrick Safety <br />
                <span className="font-semibold text-[#024244]">Calibration Console</span>
              </h2>
            </div>
            <div className="lg:col-span-5 text-left border-l-2 border-[#024244]/15 pl-6">
              <p className="text-slate-555 text-sm leading-relaxed font-normal">
                To guarantee absolute protection against hyperpigmentation (PIH), our laser sweeping configurations are calibrated to the Fitzpatrick Skin Scale. Select a type swatch to configure laser dials in real time.
              </p>
            </div>
          </div>

          {/* Interactive Dial Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            
            {/* Left: Swatches Row (7 Columns) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest text-left block mb-4">
                FITZPATRICK SWATCH CONFIGURATOR (I - VI)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {FITZPATRICK_TYPES.map((f, idx) => {
                  const isActive = activeSkinTypeIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveSkinTypeIdx(idx)}
                      className={`p-5 rounded-[22px] border text-left flex flex-col justify-between transition-all duration-300 group ${
                        isActive
                          ? "bg-white border-[#024244] shadow-xl shadow-[#024244]/5 -translate-y-1"
                          : "bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200"
                      }`}
                    >
                      <div>
                        {/* Swatch color panel */}
                        <div 
                          className="w-full aspect-[2/1] rounded-xl mb-4 border border-slate-200/50 shadow-inner transition-transform group-hover:scale-[1.02]"
                          style={{ backgroundColor: f.color }}
                        />
                        <h4 className="text-sm font-bold text-slate-900 mb-1">{f.type}</h4>
                        <p className="text-[10px] text-slate-400 leading-normal font-normal">{f.desc}</p>
                      </div>
                      
                      <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
                        <span className="text-[8.5px] font-bold text-[#024244] uppercase tracking-wider">LOAD CALIBRATIONS</span>
                        <ChevronRight className={`w-3.5 h-3.5 text-[#024244] transition-transform ${isActive ? "translate-x-0.5" : "group-hover:translate-x-0.5"}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: The Instrumentation Dial Indicators (5 Columns) */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-100 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSkinTypeIdx}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col justify-between text-left"
                >
                  <div>
                    {/* Header Dial */}
                    <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
                      <div 
                        className="w-5.5 h-5.5 rounded-full border border-slate-200" 
                        style={{ backgroundColor: FITZPATRICK_TYPES[activeSkinTypeIdx].color }}
                      />
                      <h4 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                        {FITZPATRICK_TYPES[activeSkinTypeIdx].type} Parameters
                      </h4>
                    </div>

                    {/* Calibration readouts */}
                    <div className="space-y-6">
                      {/* Pulse Wavelength */}
                      <div className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center text-[#024244] shadow-sm shrink-0">
                          <Sliders className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Pulse Width Modulation</span>
                          <p className="text-xs font-semibold text-slate-850 mt-1">{FITZPATRICK_TYPES[activeSkinTypeIdx].laserPulse}</p>
                        </div>
                      </div>

                      {/* Absorption Ratio */}
                      <div className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center text-[#024244] shadow-sm shrink-0">
                          <Target className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Melanin Absorption Limit</span>
                          <p className="text-xs font-semibold text-slate-855 mt-1">{FITZPATRICK_TYPES[activeSkinTypeIdx].absorptionRatio}</p>
                        </div>
                      </div>

                      {/* Cooling protocol */}
                      <div className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center text-[#024244] shadow-sm shrink-0">
                          <Thermometer className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Continuous Cooling Spec</span>
                          <p className="text-xs font-semibold text-slate-850 mt-1">{FITZPATRICK_TYPES[activeSkinTypeIdx].coolingProtocol}</p>
                        </div>
                      </div>

                      {/* Safety Score Meter (Rotary Gauge simulation) */}
                      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Target Energy Level</span>
                          <span className="text-lg font-bold text-[#024244]">{FITZPATRICK_TYPES[activeSkinTypeIdx].energyRange}</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Circle progress bar */}
                          <div className="relative w-11 h-11 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="22" cy="22" r="18" className="stroke-slate-200 fill-none" strokeWidth="3" />
                              <circle cx="22" cy="22" r="18" className="stroke-[#024244] fill-none" strokeWidth="3" 
                                      strokeDasharray={113}
                                      strokeDashoffset={113 - (113 * FITZPATRICK_TYPES[activeSkinTypeIdx].safetyPercent) / 100}
                                      strokeLinecap="round" />
                            </svg>
                            <span className="absolute text-[8.5px] font-bold text-slate-800 font-mono">
                              {FITZPATRICK_TYPES[activeSkinTypeIdx].safetyPercent}%
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">SAFETY INDEX</span>
                            <span className="text-[10px] text-emerald-600 font-bold uppercase font-mono">CALIBRATED</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/85 pt-5 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[9.5px] text-slate-400 leading-normal max-w-xs font-normal">
                      Safety scans utilize dual-wave diagnostics before laser sweeps initiate.
                    </p>
                    <BookingButton
                      trigger={
                        <button className="bg-[#024244] hover:bg-[#013537] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all">
                          Schedule Safety Scan
                        </button>
                      }
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

        </div>
      </section>

      {/* 3. STYLE 3: BIOLOGICAL HEALING TIMELINE SECTION (ASYLUM LAYOUT) */}
      <section className="py-24 px-6 md:px-12 bg-slate-50/50 border-b border-slate-100 text-left relative overflow-hidden">
        <div className="absolute inset-0 bg-[#ebf9fa]/20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 mb-4 text-[#024244] font-mono text-[9px] uppercase tracking-widest bg-[#024244]/5 px-3.5 py-1.5 rounded-full border border-[#024244]/10">
              <Clock className="w-3.5 h-3.5" />
              <span>Restorative Biology timeline</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-slate-900 mb-4">
              Biological Wound Healing <br />
              <span className="font-semibold text-[#024244]">& Tissue Regeneration</span>
            </h2>
            <p className="text-slate-500 text-sm max-w-xl font-normal leading-relaxed">
              Track the physiological remodeling stages of the dermis following clinical thermal sweeping.
            </p>
          </div>

          {/* Timeline navigation strip */}
          <div className="flex flex-wrap md:flex-nowrap justify-between gap-2.5 md:gap-4 border-b border-slate-200 pb-6 mb-12">
            {HEALING_PHASES.map((p, idx) => {
              const isActive = activePhaseIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActivePhaseIdx(idx)}
                  className={`flex-1 min-w-[120px] p-4 rounded-2xl text-left border transition-all duration-300 ${
                    isActive
                      ? "bg-[#024244] border-transparent text-white shadow-md shadow-[#024244]/10"
                      : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span className={`text-[8.5px] font-mono block uppercase ${isActive ? "text-[#ebf9fa] font-bold" : "text-slate-400"}`}>
                    {p.day}
                  </span>
                  <h4 className="text-xs font-semibold mt-1 font-mono">{p.name}</h4>
                </button>
              );
            })}
          </div>

          {/* Asymmetric Split Layout: Cellular Visualizer vs Phase details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            
            {/* Left: Interactive Bio-layer Model (6 Columns) */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <DermalLayerGraphic phaseIdx={activePhaseIdx} />
            </div>

            {/* Right: Phase Details Matrix (6 Columns) */}
            <div className="lg:col-span-6 bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl flex flex-col justify-between text-left shadow-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePhaseIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] text-[#024244] font-mono uppercase tracking-widest block mb-1">
                      {HEALING_PHASES[activePhaseIdx].day} Profile
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mb-4">
                      {HEALING_PHASES[activePhaseIdx].title}
                    </h3>
                    
                    <p className="text-slate-550 text-xs sm:text-sm leading-relaxed mb-6 font-mono">
                      {HEALING_PHASES[activePhaseIdx].desc}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Cells in focus */}
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                        <span className="text-[9px] text-slate-450 font-mono block uppercase">Active Cellular Agents</span>
                        <p className="text-xs font-semibold text-[#024244] mt-1 font-mono">
                          {HEALING_PHASES[activePhaseIdx].cellFocus}
                        </p>
                      </div>

                      {/* Healing recommendations */}
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                        <span className="text-[9px] text-[#024244] font-mono block uppercase">POST-OPERATIVE PROTOCOL</span>
                        <p className="text-xs text-slate-600 mt-1 font-mono leading-normal">
                          {HEALING_PHASES[activePhaseIdx].recommendation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Visualizer bars below */}
                  <div className="border-t border-slate-100 pt-6 mt-8">
                    <span className="text-[9.5px] font-mono text-slate-450 uppercase tracking-widest block mb-4">
                      PHYSIOLOGICAL STATUS GAUGES
                    </span>
                    <div className="space-y-3.5">
                      {HEALING_PHASES[activePhaseIdx].barMetrics.map((b, bIdx) => (
                        <div key={bIdx}>
                          <div className="flex justify-between text-[10px] font-mono mb-1">
                            <span className="text-slate-500">{b.label}</span>
                            <span className="text-[#024244] font-bold">{b.val}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-[#024244] to-emerald-500"
                              initial={{ width: 0 }}
                              animate={{ width: b.val }}
                              transition={{ duration: 0.6 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>

          </div>

        </div>
      </section>

      {/* 4. STYLE 4: CLINICAL ACCORDION & FAQ LAYOUT */}
      <section className="py-24 px-6 md:px-12 bg-white text-left">
        <div className="max-w-4xl mx-auto">
          
          <div className="flex flex-col items-start mb-16 max-w-2xl">
            <span className="text-xs text-[#024244] font-bold uppercase tracking-wider bg-[#024244]/5 px-3 py-1 rounded-full border border-[#024244]/10 mb-4">
              Scientific Diagnostics FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal text-slate-900 tracking-tight leading-tight mb-3">
              Understanding Dermal <br />
              <span className="font-semibold text-[#024244]">Surgical Efficacy</span>
            </h2>
            <p className="text-slate-500 text-sm font-normal">
              Scientific clarifications on tissue ablation, skin matching, and cell regeneration parameters.
            </p>
          </div>

          {/* Accordion panel container */}
          <div className="space-y-4">
            {CLINICAL_FAQS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div 
                  key={idx}
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isOpen 
                      ? "border-[#024244]/30 shadow-md bg-slate-50/20" 
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="text-[13.5px] sm:text-[14.5px] font-bold text-slate-800 leading-snug">
                      {faq.q}
                    </span>
                    <span className={`text-[#024244] font-mono text-xs font-semibold ml-4 transition-transform duration-300 ${isOpen ? "rotate-90" : "rotate-0"}`}>
                      {isOpen ? "[ - ]" : "[ + ]"}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-6 pb-6 pt-1 text-slate-500 text-xs sm:text-sm leading-relaxed border-t border-slate-100/50">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. STYLE 5: GLASSMORPHIC CTA BOOKING PANEL */}
      <section className="py-24 px-6 md:px-12 bg-[#024244] text-center relative overflow-hidden">
        {/* Decorative lighting */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#ebf9fa]/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mb-6 animate-pulse">
            <Target className="w-5 h-5 text-emerald-300" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[45px] font-normal text-white tracking-tight leading-tight max-w-xl mb-5">
            Formulate Your Dermal <br />
            <span className="font-semibold text-[#ebf9fa]">Performance Map</span>
          </h2>
          
          <p className="text-white/60 text-xs sm:text-sm max-w-md mb-10 leading-relaxed">
            Register for a high-definition multispectral dermal scan. Our clinical specialists calibrate exact pulse settings for your unique Fitzpatrick profile.
          </p>

          {/* Styled CTA button */}
          <BookingButton
            trigger={
              <button className="bg-white hover:bg-slate-50 text-[#024244] font-bold text-sm px-9 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2">
                <span>Map My Skin Integrity</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            }
          />
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Floating Booking Button */}
      <FloatingBookingButton />

      {/* Embedded style tag for custom HUD animations */}
      <style>{`
        @keyframes scanline {
          0% { top: 0%; opacity: 0.2; }
          50% { top: 100%; opacity: 0.6; }
          100% { top: 0%; opacity: 0.2; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-scanline {
          animation: scanline 5s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }
      `}</style>

    </div>
  );
}
