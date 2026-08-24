import Modal from './Modal.jsx';
import Button from './Button.jsx';

export default function ReportGenerationModal({ isOpen, onClose, onGenerate }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Official Competency Report">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Select format to export official competency estimates, evidence provenance, and iGOT learning gap analysis:
        </p>
        <div className="flex gap-3 pt-2">
          <Button variant="primary" onClick={() => { onGenerate?.('PDF'); onClose(); }}>
            Export PDF Report
          </Button>
          <Button variant="outline" onClick={() => { onGenerate?.('CSV'); onClose(); }}>
            Export CSV Dataset
          </Button>
        </div>
      </div>
    </Modal>
  );
}
