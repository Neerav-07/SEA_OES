import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateNoticeChecksum,
  OFFICIAL_NSSTA_CIRCULARS,
} from './nsstaScraper.service.js';

test('nsstaScraper: generateNoticeChecksum is deterministic and case-insensitive', () => {
  const hash1 = generateNoticeChecksum('NSSTA/TRG/2026/04', 'Python Data Analytics');
  const hash2 = generateNoticeChecksum('nssta/trg/2026/04', 'PYTHON DATA ANALYTICS');
  const hashDiff = generateNoticeChecksum('NSSTA/TRG/2026/05', 'Python Data Analytics');

  assert.equal(hash1, hash2, 'Identical notice text should yield exact same checksum');
  assert.notEqual(hash1, hashDiff, 'Different OM numbers must yield different checksums');
  assert.equal(hash1.length, 64, 'SHA-256 hex string should be 64 characters long');
});

test('nsstaScraper: official circulars have required metadata and valid URLs', () => {
  assert.ok(OFFICIAL_NSSTA_CIRCULARS.length >= 5, 'Should have at least 5 authentic MoSPI circulars in baseline');

  for (const notice of OFFICIAL_NSSTA_CIRCULARS) {
    assert.ok(notice.omNumber.startsWith('NSSTA/TRG/'), 'OM number should follow standard MoSPI format');
    assert.ok(notice.documentUrl.startsWith('https://mospi.gov.in'), 'Document URL should point to MoSPI domain');
    assert.ok(notice.targetAudience.length > 0, 'Target audience must be specified');
    assert.ok(notice.matchedCompetencyCodes.length > 0, 'Competencies must be mapped');
  }
});
