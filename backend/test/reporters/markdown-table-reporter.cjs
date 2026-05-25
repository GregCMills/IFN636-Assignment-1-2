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

function escapePipe(str) {
  return str.replace(/\|/g, '\\|');
}

class MarkdownTableReporter extends Spec {
  constructor(runner, options) {
    super(runner, options);

    this.results = [];
    this.prefixCounters = {};
    this.prefixTitles = {};

    runner.on('pass', (test) => {
      const fullTitle = test.fullTitle();
      const log = (global._assertionLog && global._assertionLog.get(fullTitle)) || [];
      const expected = log.length > 0 ? log.map(e => e.expected).join(', ') : '';
      const actual = log.length > 0 ? log.map(e => e.actual).join(', ') : 'Pass';
      this.addResult(test, expected, actual, true);
    });

    runner.on('fail', (test, err) => {
      const fullTitle = test.fullTitle();
      const log = (global._assertionLog && global._assertionLog.get(fullTitle)) || [];
      const expected = log.length > 0 ? log.map(e => e.expected).join(', ') : '';
      const msg = err.message.replace(/\n/g, ' ').substring(0, 200);
      const actual = log.length > 0
        ? log.map(e => e.actual).join(', ') + ` — Fail: ${msg}`
        : `Fail — ${msg}`;
      this.addResult(test, expected, actual, false);
    });

    runner.on('end', () => {
      this.printTable();
    });
  }

  addResult(test, expected, actual, passed) {
    const topLevel = getTopLevelSuite(test);
    const prefix = getSuitePrefix(topLevel.title);

    if (!this.prefixCounters[prefix]) {
      this.prefixCounters[prefix] = 0;
      this.prefixTitles[prefix] = topLevel.title;
    }
    this.prefixCounters[prefix]++;
    const num = String(this.prefixCounters[prefix]).padStart(2, '0');

    this.results.push({
      id: `TC-${prefix}-${num}`,
      prefix: prefix,
      description: test.title,
      expected: expected,
      actual: actual,
      passed: passed,
    });
  }

  printTable() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;

    let md = '';
    md += `# Test Case Results\n\n`;
    md += `**Total:** ${total} | **Passed:** ${passed} | **Failed:** ${failed}\n\n`;
    md += '---\n\n';

    const groups = {};
    for (const r of this.results) {
      if (!groups[r.prefix]) {
        groups[r.prefix] = [];
      }
      groups[r.prefix].push(r);
    }

    const groupOrder = Object.keys(this.prefixTitles);

    for (const prefix of groupOrder) {
      const suiteTitle = this.prefixTitles[prefix];
      const tests = groups[prefix] || [];
      const groupPassed = tests.filter(r => r.passed).length;
      const groupFailed = tests.length - groupPassed;

      md += `## ${suiteTitle}\n\n`;
      md += `${tests.length} tests (${groupPassed} passed, ${groupFailed} failed)\n\n`;
      md += `| Test Case ID | Description | Expected Output | Actual Output |\n`;
      md += `|---|---|---|---|\n`;

      for (const r of tests) {
        md += `| ${r.id} | ${escapePipe(r.description)} | ${escapePipe(r.expected)} | ${escapePipe(r.actual)} |\n`;
      }

      md += '\n---\n\n';
    }

    console.log('\n');
    console.log(md);

    const outputPath = path.resolve(__dirname, '..', '..', 'test-results.md');
    fs.writeFileSync(outputPath, md, 'utf8');
    console.log(`\nResults written to ${outputPath}\n`);
  }
}

module.exports = MarkdownTableReporter;
