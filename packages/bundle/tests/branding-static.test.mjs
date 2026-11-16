import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('brand slots and scoped preview badge rule are present', async () => {
  const client = await readFile(new URL('../src/client/harness/client.ts', import.meta.url), 'utf8');
  const brand = await readFile(new URL('../src/client/components/Brand.tsx', import.meta.url), 'utf8');
  const appearance = await readFile(new URL('../src/client/components/ShellAppearance.tsx', import.meta.url), 'utf8');
  assert.match(brand, /AI专家办事大厅|academyBrand/);
  assert.match(client, /conversation\.hero\.brand\.mark/);
  assert.match(appearance, /pXSMma_root/);
  assert.match(appearance, /pXSMma_previewBadge/);
  assert.match(appearance, /visibility:\s*hidden/);
  assert.match(appearance, /pointer-events:\s*none/);
  assert.doesNotMatch(appearance, /display:\s*none/);
});
