import { create } from 'zustand';

let timer1 = null;
let timer2 = null;
let timer3 = null;
let timer4 = null;

export const useReportStore = create((set, get) => ({
  isGenerating: false,
  isMinimized: false,
  progressPct: 0,
  progressStepText: '',
  isGenerationComplete: false,
  isReportViewerOpen: false,

  startGeneration: () => {
    // Clear any existing timers
    clearTimeout(timer1);
    clearTimeout(timer2);
    clearTimeout(timer3);
    clearTimeout(timer4);

    set({
      isGenerating: true,
      isMinimized: false,
      progressPct: 0,
      progressStepText: 'Step 1/4: Aggregating MoSPI Cadre Competency Matrix...',
      isGenerationComplete: false,
    });

    timer1 = setTimeout(() => {
      if (get().isGenerating) {
        set({ progressPct: 28, progressStepText: 'Step 2/4: Processing iGOT & NSSTA TPAC Training Allocation...' });
      }
    }, 700);

    timer2 = setTimeout(() => {
      if (get().isGenerating) {
        set({ progressPct: 64, progressStepText: 'Step 3/4: Compiling Official Executive ACBP Brief 2026-27...' });
      }
    }, 1500);

    timer3 = setTimeout(() => {
      if (get().isGenerating) {
        set({ progressPct: 88, progressStepText: 'Step 4/4: Formatting Government Seals & Executive Signatures...' });
      }
    }, 2300);

    timer4 = setTimeout(() => {
      if (get().isGenerating) {
        set({
          progressPct: 100,
          progressStepText: 'Annual Capacity Building Plan Generated Successfully!',
          isGenerationComplete: true,
          isMinimized: false, // Auto pops back up on completion!
        });
      }
    }, 3100);
  },

  minimizeModal: () => set({ isMinimized: true }),
  expandModal: () => set({ isMinimized: false }),
  closeGeneratingModal: () => set({ isGenerating: false, isMinimized: false, isGenerationComplete: false }),
  openViewer: () => set({ isReportViewerOpen: true, isGenerating: false, isMinimized: false }),
  closeViewer: () => set({ isReportViewerOpen: false }),
}));
