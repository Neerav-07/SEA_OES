import React from 'react';
import AssessmentPlayerModal from '../../pages/dashboard/assessments/AssessmentPlayerModal.jsx';

/**
 * DiagnosticQuizModal Wrapper
 * Redirects to the Enterprise Full-Screen Assessment Engine (AssessmentPlayerModal)
 */
export default function DiagnosticQuizModal({ isOpen, onClose, onSubmitted }) {
  if (!isOpen) return null;

  return (
    <AssessmentPlayerModal
      assessmentId="asm-diagnostic-01"
      onClose={onClose}
      onComplete={(result) => {
        if (onSubmitted) {
          onSubmitted(result.responses || [], result.correctCount || 5, result.totalQuestions || 5);
        }
      }}
    />
  );
}
