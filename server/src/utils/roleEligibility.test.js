import test from 'node:test';
import assert from 'node:assert/strict';
import { getEligibleRoles, isEligibleTargetRole } from './roleEligibility.js';

const roles = [{ id: 'a', code: 'A', department: 'DIID' }, { id: 'b', code: 'B', department: 'NAD' }];
test('returns current and same-department roles deterministically', () => {
  assert.deepEqual(getEligibleRoles({ official: { roleId: 'a', department: 'DIID' }, roles }).map((x) => x.id), ['a']);
});
test('does not admit another department without an explicit mapping', () => assert.equal(isEligibleTargetRole({ official: { roleId: 'a', department: 'DIID' }, roles, targetRoleId: 'b' }), false));
test('handles missing context and empty roles', () => {
  assert.deepEqual(getEligibleRoles({ roles }), []);
  assert.deepEqual(getEligibleRoles({ official: { department: 'DIID' }, roles: [] }), []);
});
