import { Router, raw } from 'express';
import { PDFParse } from 'pdf-parse';
import { verifyToken, requireRole } from '../middlewares/verifyToken.js';
import { parseQuestionBankText } from '../services/questionBankImport.js';

const router = Router();

router.post('/import-pdf', verifyToken, requireRole('ADMIN'), raw({ type: 'application/pdf', limit: '10mb' }), async (req, res) => {
  const bytes = req.body;
  if (!Buffer.isBuffer(bytes) || bytes.length < 5 || bytes.subarray(0, 5).toString() !== '%PDF-') {
    return res.status(400).json({ message: 'Upload a valid PDF file (maximum 10 MB).' });
  }

  let parser;
  try {
    parser = new PDFParse({ data: bytes });
    const extracted = await parser.getText();
    if (extracted.text.length > 1_000_000) {
      return res.status(413).json({ message: 'This PDF contains too much text. Split it into smaller question banks.' });
    }
    const result = parseQuestionBankText(extracted.text);
    if (result.detected > 200) {
      return res.status(413).json({ message: 'Import up to 200 questions at a time. Split this PDF into smaller files.' });
    }
    if (!result.detected) {
      return res.status(422).json({ message: 'No numbered questions were found. Use a text-based PDF with Q1., A), B), and Answer: A lines.' });
    }
    return res.json(result);
  } catch {
    return res.status(422).json({ message: 'The PDF could not be read. Use an unencrypted, text-based PDF.' });
  } finally {
    await parser?.destroy().catch(() => {});
  }
});

export default router;
