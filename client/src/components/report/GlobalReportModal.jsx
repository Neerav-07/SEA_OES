import React from 'react';
import {
  Sparkles,
  X,
  Eye,
  Download,
  Check,
  Printer,
  FileText,
  Award,
  ShieldCheck,
  Maximize2,
  CheckCircle2,
  Building2,
  Landmark,
  QrCode,
  FileSpreadsheet,
} from 'lucide-react';
import { useReportStore } from '../../store/report.store.js';
import toast from 'react-hot-toast';

export default function GlobalReportModal() {
  const {
    isGenerating,
    isMinimized,
    progressPct,
    progressStepText,
    isGenerationComplete,
    isReportViewerOpen,
    minimizeModal,
    expandModal,
    closeGeneratingModal,
    openViewer,
    closeViewer,
  } = useReportStore();

  if (!isGenerating && !isReportViewerOpen) return null;

  // ── Direct File Downloader (No Print Dialog Triggered) ──────────────────────
  const downloadDirectFile = () => {
    const reportHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>MoSPI_ACBP_Executive_Report_2026-27</title>
    <style>
      @page { size: A4 portrait; margin: 12mm 15mm; }
      * { box-sizing: border-box; }
      body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 24px; background: #ffffff; color: #0f172a; line-height: 1.5; }
      .gov-header { border-bottom: 2.5px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
      .emblem-title { font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #1e3a8a; text-transform: uppercase; }
      .ministry-title { font-size: 16px; font-weight: 900; color: #0f172a; margin: 2px 0 0 0; text-transform: uppercase; }
      .academy-title { font-size: 11px; font-weight: 800; color: #1e3a8a; margin: 2px 0 0 0; text-transform: uppercase; }
      .doc-meta { text-align: right; font-family: monospace; font-size: 9.5px; color: #475569; }
      .badge-restricted { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px; }
      .report-title-box { bg-color: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; text-align: center; margin-bottom: 16px; }
      .grid-chips { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; text-align: center; }
      .chip { padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; }
      .chip-val { font-size: 15px; font-weight: 900; color: #0f172a; margin-top: 2px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px; }
      th { background: #f1f5f9; text-align: left; padding: 8px; font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; }
      td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600; }
      .sig-block { margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 16px; display: flex; justify-content: space-between; align-items: center; text-align: center; font-size: 10px; }
      .sig-box { width: 180px; border-top: 1px solid #94a3b8; padding-top: 4px; }
      .seal-stamp { border: 1px dashed #1e3a8a; background: #eff6ff; color: #1e3a8a; padding: 6px 12px; border-radius: 8px; font-weight: 800; text-transform: uppercase; font-size: 9px; }
    </style>
  </head>
  <body>
    <div className="gov-header">
      <div>
        <div class="emblem-title">🏛️ सत्यमेव जयते • GOVERNMENT OF INDIA • भारत सरकार</div>
        <div class="ministry-title">MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION</div>
        <div class="academy-title">NATIONAL STATISTICAL SYSTEMS TRAINING ACADEMY (NSSTA)</div>
        <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">Plot No. 22, Knowledge Park II, Greater Noida, Uttar Pradesh 201310</div>
      </div>
      <div class="doc-meta">
        <div style="font-weight: 800; color: #0f172a;">DOC NO: MoSPI/DIID/ACBP/2026-27/004</div>
        <div>DATE: August 26, 2026</div>
        <div class="badge-restricted">CONFIDENTIAL • OFFICIAL GOVT RECORD</div>
      </div>
    </div>

    <div class="report-title-box">
      <div style="font-size: 13px; font-weight: 900; color: #1e3a8a; letter-spacing: 0.5px; text-transform: uppercase;">ANNUAL CAPACITY BUILDING PLAN (ACBP) 2026–2027 • EXECUTIVE REPORT</div>
      <div style="font-size: 10.5px; color: #475569; font-weight: 600; margin-top: 2px;">Evidence-Driven FRAC Framework Allocation for Indian Statistical Service (ISS) & SSS Cadres</div>
    </div>

    <div class="grid-chips">
      <div class="chip"><div style="font-size:9px; font-weight:700; color:#64748b;">WORKFORCE COVERED</div><div class="chip-val">248 Officials</div></div>
      <div class="chip" style="background:#eff6ff; border-color:#bfdbfe;"><div style="font-size:9px; font-weight:700; color:#1e3a8a;">FRAC COMPLIANCE</div><div class="chip-val" style="color:#1e3a8a;">94.2% Rate</div></div>
      <div class="chip" style="background:#fffbeb; border-color:#fde68a;"><div style="font-size:9px; font-weight:700; color:#b45309;">CRITICAL DEFICITS</div><div class="chip-val" style="color:#b45309;">4 Core Areas</div></div>
      <div class="chip" style="background:#ecfdf5; border-color:#a7f3d0;"><div style="font-size:9px; font-weight:700; color:#047857;">CAPACITY HOURS</div><div class="chip-val" style="color:#047857;">12,400 Hours</div></div>
    </div>

    <div style="margin-bottom: 14px;">
      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-bottom: 6px;">Priority Skill Deficits & TPAC Allocations</div>
      <table>
        <thead>
          <tr>
            <th>Competency Domain</th>
            <th>Category</th>
            <th>Officers Affected</th>
            <th style="text-align: right;">Mandated TPAC Course</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight: 800; color: #0f172a;">Python for Data Analytics (NSS Microdata)</td>
            <td style="color: #64748b;">Technical</td>
            <td style="font-weight: 700;">94 Officials</td>
            <td style="text-align: right; font-family: monospace; font-weight: 800; color: #1e3a8a;">IGOT-PYTHON-302</td>
          </tr>
          <tr>
            <td style="font-weight: 800; color: #0f172a;">Metadata Standards & SDMX Governance</td>
            <td style="color: #64748b;">Digital Governance</td>
            <td style="font-weight: 700;">88 Officials</td>
            <td style="text-align: right; font-family: monospace; font-weight: 800; color: #1e3a8a;">NSSTA-TPAC-208</td>
          </tr>
          <tr>
            <td style="font-weight: 800; color: #0f172a;">PostgreSQL Survey Data Warehousing</td>
            <td style="color: #64748b;">Technical</td>
            <td style="font-weight: 700;">64 Officials</td>
            <td style="text-align: right; font-family: monospace; font-weight: 800; color: #1e3a8a;">IGOT-SQL-401</td>
          </tr>
          <tr>
            <td style="font-weight: 800; color: #0f172a;">National Accounts Statistics (SNA 2008)</td>
            <td style="color: #64748b;">Statistical</td>
            <td style="font-weight: 700;">42 Officials</td>
            <td style="text-align: right; font-family: monospace; font-weight: 800; color: #1e3a8a;">NSSTA-TPAC-104</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="font-size: 10.5px; color: #334155; margin-bottom: 24px;">
      <div style="font-weight: 800; text-transform: uppercase; color: #0f172a; margin-bottom: 4px;">Executive Capacity Mandate:</div>
      <ul style="margin: 0; padding-left: 16px; line-height: 1.6; font-weight: 500;">
        <li>Mandate IGOT-PYTHON-302 completion for all 94 DIID Officials prior to NSS 80th Round survey rollout.</li>
        <li>Organize NSSTA 5-Day Residential Workshop on SDMX Data Structure Definitions for Metadata Officers.</li>
        <li>Sync official iGOT Karmayogi completion webhooks with MoSPI DIID Capacity Dashboard in real-time.</li>
      </ul>
    </div>

    <div class="sig-block">
      <div class="sig-box">
        <div style="font-weight: 800; color: #0f172a;">Dr. Sunita Rao</div>
        <div style="color: #64748b;">Director (Capacity Building), NSSTA</div>
      </div>
      <div class="seal-stamp">NSSTA ACADEMIC GOVERNANCE SEATED</div>
      <div class="sig-box">
        <div style="font-weight: 800; color: #0f172a;">Additional Director General</div>
        <div style="color: #64748b;">DIID, MoSPI, Govt. of India</div>
      </div>
    </div>
  </body>
</html>`;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'MoSPI_ACBP_Executive_Report_2026-27.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded official MoSPI ACBP Executive Report file!');
  };

  // ── Isolated Print Engine (Only when user explicitly clicks Print) ────────
  const triggerIsolatedPrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>MoSPI_ACBP_Executive_Report_2026-27.pdf</title>
          <style>
            @page { size: A4 portrait; margin: 10mm 12mm; }
            * { box-sizing: border-box; }
            body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; background: #ffffff; color: #0f172a; line-height: 1.4; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .header-border { border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; }
            .title-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; border-radius: 8px; text-align: center; margin-bottom: 14px; }
            .grid-chips { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 14px; text-align: center; }
            .chip { padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0; background: #f8fafc; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11px; }
            th { background: #f1f5f9; text-align: left; padding: 6px 8px; font-weight: 800; border-bottom: 1px solid #cbd5e1; }
            td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600; }
            .sig-block { margin-top: 24px; border-top: 1px solid #cbd5e1; padding-top: 12px; display: flex; justify-content: space-between; align-items: center; text-align: center; font-size: 9.5px; }
          </style>
        </head>
        <body>
          <div className="header-border">
            <div>
              <div style="font-size: 9px; font-weight: 800; color: #1e3a8a;">🏛️ सत्यमेव जयते • GOVERNMENT OF INDIA • भारत सरकार</div>
              <h1 style="font-size: 15px; font-weight: 900; margin: 2px 0 0 0;">MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION</h1>
              <h2 style="font-size: 10.5px; font-weight: 800; color: #1e3a8a; margin: 2px 0 0 0;">NATIONAL STATISTICAL SYSTEMS TRAINING ACADEMY (NSSTA)</h2>
            </div>
            <div style="text-align: right; font-family: monospace; font-size: 9px;">
              <b>DOC NO: MoSPI/DIID/ACBP/2026-27/004</b><br>
              DATE: August 26, 2026<br>
              <span style="background: #fef3c7; color: #92400e; font-weight: 800; padding: 1px 4px; border-radius: 3px;">CONFIDENTIAL / OFFICIAL GOVT RECORD</span>
            </div>
          </div>

          <div class="title-box">
            <div style="font-size: 12px; font-weight: 900; color: #1e3a8a;">ANNUAL CAPACITY BUILDING PLAN (ACBP) 2026–2027 • EXECUTIVE REPORT</div>
            <div style="font-size: 10px; color: #475569; font-weight: 600; margin-top: 2px;">Evidence-Driven FRAC Framework Allocation for ISS & SSS Cadres</div>
          </div>

          <div class="grid-chips">
            <div class="chip"><div style="font-size:8.5px; font-weight:700; color:#64748b;">WORKFORCE COVERED</div><div style="font-size:14px; font-weight:900;">248 Officials</div></div>
            <div class="chip" style="background:#eff6ff;"><div style="font-size:8.5px; font-weight:700; color:#1e3a8a;">FRAC COMPLIANCE</div><div style="font-size:14px; font-weight:900; color:#1e3a8a;">94.2% Rate</div></div>
            <div class="chip" style="background:#fffbeb;"><div style="font-size:8.5px; font-weight:700; color:#b45309;">CRITICAL DEFICITS</div><div style="font-size:14px; font-weight:900; color:#b45309;">4 Core Areas</div></div>
            <div class="chip" style="background:#ecfdf5;"><div style="font-size:8.5px; font-weight:700; color:#047857;">CAPACITY HOURS</div><div style="font-size:14px; font-weight:900; color:#047857;">12,400 Hours</div></div>
          </div>

          <table>
            <thead>
              <tr><th>Competency Domain</th><th>Category</th><th>Officers Affected</th><th style="text-align: right;">Mandated TPAC Course</th></tr>
            </thead>
            <tbody>
              <tr><td style="font-weight: 800;">Python for Data Analytics (NSS Microdata)</td><td>Technical</td><td>94 Officials</td><td style="text-align: right; font-family: monospace; font-weight: 800; color: #1e3a8a;">IGOT-PYTHON-302</td></tr>
              <tr><td style="font-weight: 800;">Metadata Standards & SDMX Governance</td><td>Digital Governance</td><td>88 Officials</td><td style="text-align: right; font-family: monospace; font-weight: 800; color: #1e3a8a;">NSSTA-TPAC-208</td></tr>
              <tr><td style="font-weight: 800;">PostgreSQL Survey Data Warehousing</td><td>Technical</td><td>64 Officials</td><td style="text-align: right; font-family: monospace; font-weight: 800; color: #1e3a8a;">IGOT-SQL-401</td></tr>
              <tr><td style="font-weight: 800;">National Accounts Statistics (SNA 2008)</td><td>Statistical</td><td>42 Officials</td><td style="text-align: right; font-family: monospace; font-weight: 800; color: #1e3a8a;">NSSTA-TPAC-104</td></tr>
            </tbody>
          </table>

          <div style="font-size: 10px; color: #334155; margin-bottom: 20px;">
            <div style="font-weight: 800; text-transform: uppercase; color: #0f172a; margin-bottom: 3px;">Executive Capacity Mandate:</div>
            <ul style="margin: 0; padding-left: 14px; line-height: 1.5; font-weight: 500;">
              <li>Mandate IGOT-PYTHON-302 completion for all DIID Officials prior to NSS 80th Round survey rollout.</li>
              <li>Organize NSSTA 5-Day Residential Workshop on SDMX Data Structure Definitions for Metadata Officers.</li>
              <li>Sync official iGOT Karmayogi completion webhooks with MoSPI DIID Capacity Dashboard in real-time.</li>
            </ul>
          </div>

          <div class="sig-block">
            <div><b>Dr. Sunita Rao</b><br><span style="color:#64748b;">Director (Capacity Building), NSSTA</span></div>
            <div style="border: 1px dashed #1e3a8a; background: #eff6ff; padding: 4px 8px; font-weight: 800; color: #1e3a8a; border-radius: 6px;">NSSTA ACADEMIC GOVERNANCE SEATED</div>
            <div><b>Additional Director General</b><br><span style="color:#64748b;">DIID, MoSPI, Govt. of India</span></div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 800);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <>
      {/* ── MINIMIZED FLOATING BACKGROUND BADGE ── */}
      {isGenerating && isMinimized && (
        <div
          onClick={expandModal}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 text-white p-3.5 shadow-2xl border border-slate-700 cursor-pointer hover:bg-slate-800 transition-all animate-in slide-in-from-bottom-4"
        >
          <div className="p-2 rounded-xl bg-[#1E3A8A] text-white">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">ACBP Report Compilation</span>
              <span className="text-[10px] font-extrabold text-blue-300 font-mono">{progressPct}%</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium line-clamp-1">{progressStepText}</p>
          </div>
          <Maximize2 size={14} className="text-slate-400 ml-2" />
        </div>
      )}

      {/* ── 1. GENERATION POPUP MODAL ── */}
      {isGenerating && !isMinimized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 lg:p-8 shadow-2xl relative border border-slate-200 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-[#1E3A8A] border border-blue-100">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">ACBP Report Generation</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Mission Karmayogi FRAC Engine</p>
                </div>
              </div>
              <button
                onClick={minimizeModal}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                title="Continue in Background"
              >
                <X size={18} />
              </button>
            </div>

            {/* Circular Progress or Google Pay Style Completed Checkmark */}
            <div className="space-y-4 text-center py-2 flex flex-col items-center justify-center">
              {isGenerationComplete ? (
                /* Google Pay style bold filled deep navy blue circle with white checkmark */
                <div className="h-20 w-20 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center shadow-xl animate-in zoom-in-75 duration-300">
                  <Check size={40} className="text-white stroke-[3.5]" />
                </div>
              ) : (
                /* Progressing SVG Circular Ring */
                <div className="relative flex items-center justify-center h-24 w-24">
                  <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="7"
                      className="text-blue-50"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="#1E3A8A"
                      strokeWidth="7"
                      strokeLinecap="round"
                      fill="transparent"
                      strokeDasharray={263.89}
                      strokeDashoffset={263.89 - (progressPct / 100) * 263.89}
                      className="transition-all duration-300 ease-out"
                    />
                  </svg>
                  <span className="absolute text-xl font-black text-[#1E3A8A] font-mono tracking-tight">
                    {progressPct}%
                  </span>
                </div>
              )}

              <p className="text-xs font-bold text-slate-800 transition-all">{progressStepText}</p>
            </div>

            {/* Action Buttons on Completion */}
            {isGenerationComplete ? (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 animate-in slide-in-from-bottom-2 duration-300">
                <button
                  type="button"
                  onClick={openViewer}
                  className="flex items-center gap-1.5 rounded-2xl bg-slate-100 hover:bg-blue-50 border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 transition-colors"
                >
                  <Eye size={15} className="text-[#1E3A8A]" /> View Report
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeGeneratingModal();
                    downloadDirectFile();
                  }}
                  className="flex items-center gap-1.5 rounded-2xl bg-[#1E3A8A] hover:bg-[#1e40af] px-5 py-2.5 text-xs font-bold text-white shadow-sm active:scale-95 transition-all"
                >
                  <Download size={15} className="text-blue-200" /> Download Report (.PDF)
                </button>
              </div>
            ) : (
              <div className="pt-2 text-center">
                <span className="text-[11px] text-slate-400 font-medium">
                  Click <X size={12} className="inline mx-0.5 text-slate-500" /> to run task in background
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 2. ULTRA-REALISTIC OFFICIAL MOSPI GOVERNMENT ACBP REPORT VIEWER MODAL ── */}
      {isReportViewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            {/* Navigation Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Landmark size={20} className="text-blue-300" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Official MoSPI Executive ACBP Report Preview (A4 Format)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={triggerIsolatedPrint}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 text-xs font-bold text-slate-200 transition-colors"
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  onClick={downloadDirectFile}
                  className="flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af] px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-colors"
                >
                  <Download size={14} /> Download (.PDF)
                </button>
                <button
                  onClick={closeViewer}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-800 text-white ml-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Ultra-Realistic Official MoSPI Government Document Container */}
            <div className="p-8 lg:p-10 space-y-5 bg-white text-slate-900 font-sans border-t border-slate-200 relative overflow-hidden">
              {/* Top Hindi / English Government Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-blue-50 text-[#1E3A8A] border border-blue-100 shrink-0">
                    <Landmark size={28} />
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold tracking-widest uppercase text-[#1E3A8A]">
                      🏛️ सत्यमेव जयते • GOVERNMENT OF INDIA • भारत सरकार
                    </div>
                    <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight mt-0.5">
                      Ministry of Statistics & Programme Implementation
                    </h1>
                    <h2 className="text-xs font-extrabold text-[#1E3A8A] uppercase tracking-wider">
                      National Statistical Systems Training Academy (NSSTA)
                    </h2>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                      Plot No. 22, Knowledge Park II, Greater Noida, Uttar Pradesh 201310 • Web: nssta.mospi.gov.in
                    </p>
                  </div>
                </div>

                <div className="text-right text-[10px] font-mono text-slate-600 space-y-0.5 shrink-0">
                  <div className="font-bold text-slate-900">DOC NO: MoSPI/DIID/ACBP/2026-27/004</div>
                  <div>DATE: August 26, 2026</div>
                  <div className="inline-block bg-amber-50 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-200 text-[9px] uppercase tracking-wider">
                    CONFIDENTIAL • OFFICIAL GOVT RECORD
                  </div>
                </div>
              </div>

              {/* Title Block */}
              <div className="text-center bg-slate-50 py-3 rounded-2xl border border-slate-200/90 shadow-2xs space-y-0.5">
                <h3 className="text-sm font-black uppercase text-[#1E3A8A] tracking-wider">
                  ANNUAL CAPACITY BUILDING PLAN (ACBP) 2026–2027 • EXECUTIVE REPORT
                </h3>
                <p className="text-[11px] text-slate-600 font-semibold">
                  Evidence-Driven FRAC Framework Allocation for Indian Statistical Service (ISS) & Subordinate Statistical Service (SSS) Cadres
                </p>
              </div>

              {/* 4 Key Summary Chips */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Workforce Covered</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">248 Officials</div>
                </div>
                <div className="p-3 rounded-2xl border border-blue-200 bg-blue-50/60">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A]">FRAC Compliance</div>
                  <div className="text-base font-black text-[#1E3A8A] mt-0.5">94.2% Rate</div>
                </div>
                <div className="p-3 rounded-2xl border border-amber-200 bg-amber-50/60">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Critical Deficits</div>
                  <div className="text-base font-black text-amber-800 mt-0.5">4 Core Areas</div>
                </div>
                <div className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/60">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Capacity Hours</div>
                  <div className="text-base font-black text-emerald-800 mt-0.5">12,400 Hours</div>
                </div>
              </div>

              {/* Priority Skill Deficits & Mandated Courses */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Award size={15} className="text-[#1E3A8A]" /> Priority Skill Deficits & TPAC Allocations
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">FRAC Taxonomy v2.4</span>
                </div>
                <table className="w-full text-left text-[11px] border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-2.5 border-b border-slate-200">Competency Domain</th>
                      <th className="p-2.5 border-b border-slate-200">Category</th>
                      <th className="p-2.5 border-b border-slate-200">Officers Affected</th>
                      <th className="p-2.5 border-b border-slate-200 text-right">Mandated TPAC Course</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">Python for Data Analytics (NSS Microdata)</td>
                      <td className="p-2.5 text-slate-600">Technical</td>
                      <td className="p-2.5 text-slate-900 font-bold">94 Officials</td>
                      <td className="p-2.5 text-right font-mono font-bold text-[#1E3A8A]">IGOT-PYTHON-302</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">Metadata Standards & SDMX Governance</td>
                      <td className="p-2.5 text-slate-600">Digital Governance</td>
                      <td className="p-2.5 text-slate-900 font-bold">88 Officials</td>
                      <td className="p-2.5 text-right font-mono font-bold text-[#1E3A8A]">NSSTA-TPAC-208</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">PostgreSQL Survey Data Warehousing</td>
                      <td className="p-2.5 text-slate-600">Technical</td>
                      <td className="p-2.5 text-slate-900 font-bold">64 Officials</td>
                      <td className="p-2.5 text-right font-mono font-bold text-[#1E3A8A]">IGOT-SQL-401</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">National Accounts Statistics (SNA 2008)</td>
                      <td className="p-2.5 text-slate-600">Statistical</td>
                      <td className="p-2.5 text-slate-900 font-bold">42 Officials</td>
                      <td className="p-2.5 text-right font-mono font-bold text-[#1E3A8A]">NSSTA-TPAC-104</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Plan */}
              <div className="space-y-1.5 text-[11px] text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" /> Executive Capacity Mandate:
                </div>
                <ul className="list-disc pl-5 space-y-1 font-medium text-slate-700">
                  <li>Mandate IGOT-PYTHON-302 completion for all 94 DIID Officials prior to NSS 80th Round CAPI survey rollout.</li>
                  <li>Organize NSSTA 5-Day Residential Workshop on SDMX Data Structure Definitions for Metadata Officers.</li>
                  <li>Sync official iGOT Karmayogi completion webhooks with MoSPI DIID Capacity Dashboard in real-time.</li>
                </ul>
              </div>

              {/* Signatures, Digital e-Sign & Official Seal */}
              <div className="pt-6 border-t border-slate-300 flex items-center justify-between text-[10px]">
                <div className="text-center relative w-52">
                  {/* Cursive Digital Signature Render */}
                  <div className="font-serif italic text-lg font-extrabold text-[#1E3A8A] leading-tight select-none -mb-1">
                    {localStorage.getItem('kshamata_dsig_name') || 'Dr. Sunita Rao'}
                  </div>
                  {localStorage.getItem('kshamata_dsig_seal') !== 'false' && (
                    <div className="text-[8px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mb-1">
                      ✓ NIC e-SIGN [{localStorage.getItem('kshamata_dsig_hash') || 'DSC-NIC-8F9A2B1C4E7D'}]
                    </div>
                  )}
                  <div className="border-t border-slate-400 pt-1">
                    <div className="font-bold text-slate-900">{localStorage.getItem('kshamata_dsig_name') || 'Dr. Sunita Rao'}</div>
                    <div className="text-slate-600 font-medium text-[9.5px]">{localStorage.getItem('kshamata_dsig_title') || 'Director (Capacity Building), NSSTA'}</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl border border-dashed border-[#1E3A8A] bg-blue-50/70 text-center font-bold text-[#1E3A8A] text-[9px] uppercase tracking-wider space-y-0.5 shadow-2xs">
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle2 size={12} className="text-[#1E3A8A]" /> NSSTA GOVERNANCE SEATED
                  </div>
                  <div className="text-[8px] font-mono text-slate-500 font-normal">CERT HASH: {localStorage.getItem('kshamata_dsig_hash') || 'DSC-NIC-8F9A2B1C4E7D'}</div>
                </div>

                <div className="text-center relative w-52">
                  <div className="font-serif italic text-lg font-extrabold text-[#1E3A8A] leading-tight select-none -mb-1">
                    A.K. Sharma
                  </div>
                  {localStorage.getItem('kshamata_dsig_seal') !== 'false' && (
                    <div className="text-[8px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mb-1">
                      ✓ NIC e-SIGN [DSC-NIC-77291A]
                    </div>
                  )}
                  <div className="border-t border-slate-400 pt-1">
                    <div className="font-bold text-slate-900">Additional Director General</div>
                    <div className="text-slate-600 font-medium text-[9.5px]">DIID, MoSPI, Govt. of India</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
