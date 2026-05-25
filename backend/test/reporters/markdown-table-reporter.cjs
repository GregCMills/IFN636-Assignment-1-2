'use strict';

const { Spec } = require('mocha').reporters;
const fs = require('fs');
const path = require('path');

function getSuitePrefix(title) {
  const cleaned = title.replace(/\s*\([^)]*\)/g, '');
  const split = cleaned.replace(/([a-z])([A-Z])/g, '$1 $2');
  const words = split.split(/\s+/).filter(Boolean);
  const initials = words.map(w => w[0]).join('').toUpperCase();
  return initials.substring(0, 4);
}

function getTopLevelSuite(test) {
  let suite = test.parent;
  while (suite.parent && suite.parent.title) {
    suite = suite.parent;
  }
  return suite;
}

class MarkdownTableReporter extends Spec {
  constructor(runner, options) {
    super(runner, options);

    this.results = [];
    this.prefixCounters = {};

    runner.on('pass', (test) => {
      this.addResult(test, 'Pass');
    });

    runner.on('fail', (test, err) => {
      const msg = err.message.replace(/\n/g, ' ').substring(0, 200);
      this.addResult(test, `Fail — ${msg}`);
    });

    runner.on('end', () => {
      this.printTable();
    });
  }

  addResult(test, actual) {
    const topLevel = getTopLevelSuite(test);
    const prefix = getSuitePrefix(topLevel.title);

    if (!this.prefixCounters[prefix]) {
      this.prefixCounters[prefix] = 0;
    }
    this.prefixCounters[prefix]++;
    const num = String(this.prefixCounters[prefix]).padStart(2, '0');

    this.results.push({
      id: `TC-${prefix}-${num}`,
      expected: test.title,
      actual: actual,
    });
  }

  printTable() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.actual === 'Pass').length;
    const failed = total - passed;

    let md = '';
    md += `## Test Case Results\n\n`;
    md += `**Total:** ${total} | **Passed:** ${passed} | **Failed:** ${failed}\n\n`;
    md += `| Test Case ID | Expected Output | Actual Output |\n`;
    md += `|---|---|---|\n`;

    for (const r of this.results) {
      const expected = r.expected.replace(/\|/g, '\\|');
      const actual = r.actual.replace(/\|/g, '\\|');
      md += `| ${r.id} | ${expected} | ${actual} |\n`;
    }

    md += '\n';

    console.log('\n');
    console.log(md);

    const outputPath = path.resolve(__dirname, '..', '..', 'test-results.md');
    fs.writeFileSync(outputPath, md, 'utf8');
    console.log(`\nResults written to ${outputPath}\n`);
  }
}

module.exports = MarkdownTableReporter;
