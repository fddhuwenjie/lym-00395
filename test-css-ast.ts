import { parseContainerCSS, stringifyContainerCSS } from './src/cssUtils';
import { LayoutProps } from './src/types';

const testCases = [
  {
    name: 'Basic Grid',
    css: `.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}`,
  },
  {
    name: 'Flex with justify-content',
    css: `.container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 16px;
}`,
  },
  {
    name: 'Holy Grail',
    css: `.container {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  gap: 12px;
  height: 100%;
  min-height: 300px;
}`,
  },
];

console.log('=== Testing CSS AST Parse & Stringify ===\n');

testCases.forEach((tc, idx) => {
  console.log(`Test ${idx + 1}: ${tc.name}`);
  console.log('-'.repeat(50));
  
  console.log('Input CSS:');
  console.log(tc.css);
  console.log();
  
  const parsed = parseContainerCSS(tc.css);
  console.log('Parsed LayoutProps:');
  console.log(JSON.stringify(parsed, null, 2));
  console.log();
  
  const output = stringifyContainerCSS(parsed, tc.css);
  console.log('Output CSS:');
  console.log(output);
  console.log();
  
  const reparsed = parseContainerCSS(output);
  console.log('Re-parsed LayoutProps:');
  console.log(JSON.stringify(reparsed, null, 2));
  console.log();
  
  const propsMatch = JSON.stringify(parsed) === JSON.stringify(reparsed);
  console.log(`Props match after round-trip: ${propsMatch ? '✅ PASS' : '❌ FAIL'}`);
  console.log('\n' + '='.repeat(50) + '\n');
});

console.log('=== Testing Form -> CSS Update ===\n');

const baseCSS = `.container {
  display: flex;
  flex-direction: row;
  gap: 16px;
  height: 100%;
}`;

console.log('Base CSS:');
console.log(baseCSS);
console.log();

const updatedProps: LayoutProps = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridTemplateRows: 'auto 1fr',
  gap: '20px',
};

console.log('Updated LayoutProps:');
console.log(JSON.stringify(updatedProps, null, 2));
console.log();

const updatedCSS = stringifyContainerCSS(updatedProps, baseCSS);
console.log('Updated CSS:');
console.log(updatedCSS);
console.log();

const reparsedUpdated = parseContainerCSS(updatedCSS);
const hasGridTemplateColumns = reparsedUpdated.gridTemplateColumns === 'repeat(3, 1fr)';
const hasGridTemplateRows = reparsedUpdated.gridTemplateRows === 'auto 1fr';
const hasDisplayGrid = reparsedUpdated.display === 'grid';
const hasGap = reparsedUpdated.gap === '20px';

console.log('Verification:');
console.log(`  - display: grid → ${hasDisplayGrid ? '✅' : '❌'}`);
console.log(`  - grid-template-columns → ${hasGridTemplateColumns ? '✅' : '❌'} (got: ${reparsedUpdated.gridTemplateColumns})`);
console.log(`  - grid-template-rows → ${hasGridTemplateRows ? '✅' : '❌'} (got: ${reparsedUpdated.gridTemplateRows})`);
console.log(`  - gap → ${hasGap ? '✅' : '❌'} (got: ${reparsedUpdated.gap})`);
console.log();

const allPass = hasGridTemplateColumns && hasGridTemplateRows && hasDisplayGrid && hasGap;
console.log(`Form update test: ${allPass ? '✅ ALL PASS' : '❌ SOME FAILURES'}`);
