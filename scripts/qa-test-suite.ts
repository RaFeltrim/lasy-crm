/**
 * Comprehensive QA Test Suite Runner
 * Executes all tests and generates detailed reports
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  details: string;
  timestamp: string;
}

interface QAReport {
  timestamp: string;
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    duration: number;
  };
  results: TestResult[];
  coverage?: any;
  performance?: any;
  security?: any;
}

class QATestRunner {
  private results: TestResult[] = [];
  private startTime: number = Date.now();

  async runTest(name: string, command: string): Promise<TestResult> {
    console.log(`\n🧪 Running: ${name}...`);
    const testStart = Date.now();
    
    try {
      const output = execSync(command, {
        encoding: 'utf-8',
        stdio: 'pipe',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });
      
      const duration = Date.now() - testStart;
      const result: TestResult = {
        name,
        passed: true,
        duration,
        details: output,
        timestamp: new Date().toISOString(),
      };
      
      console.log(`✅ ${name} - PASSED (${duration}ms)`);
      this.results.push(result);
      return result;
    } catch (error: any) {
      const duration = Date.now() - testStart;
      const result: TestResult = {
        name,
        passed: false,
        duration,
        details: error.stdout || error.stderr || error.message,
        timestamp: new Date().toISOString(),
      };
      
      console.log(`❌ ${name} - FAILED (${duration}ms)`);
      this.results.push(result);
      return result;
    }
  }

  async runAllTests(): Promise<QAReport> {
    console.log('🚀 Starting Comprehensive QA Test Suite\n');
    console.log('=' .repeat(60));

    // 1. Unit Tests
    await this.runTest('Unit Tests', 'npm run test');

    // 2. Linting
    await this.runTest('ESLint', 'npm run lint');

    // 3. Type Checking
    await this.runTest('TypeScript Check', 'npx tsc --noEmit');

    // 4. Build Test
    await this.runTest('Production Build', 'npm run build');

    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;

    const report: QAReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.length,
        passed,
        failed,
        duration: totalDuration,
      },
      results: this.results,
    };

    return report;
  }

  generateReport(report: QAReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 QA TEST SUITE SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`⏱️  Duration: ${(report.summary.duration / 1000).toFixed(2)}s`);
    console.log(`📅 Timestamp: ${report.timestamp}`);
    console.log('='.repeat(60));

    // Save report to file
    const reportsDir = path.join(process.cwd(), 'test-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(
      reportsDir,
      `qa-report-${Date.now()}.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Full report saved to: ${reportPath}`);

    // Generate markdown summary
    const mdReport = this.generateMarkdownReport(report);
    const mdPath = path.join(reportsDir, `qa-report-${Date.now()}.md`);
    fs.writeFileSync(mdPath, mdReport);
    console.log(`📄 Markdown report saved to: ${mdPath}`);
  }

  generateMarkdownReport(report: QAReport): string {
    const { summary, results } = report;
    
    let md = `# QA Test Suite Report\n\n`;
    md += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`;
    
    md += `## Summary\n\n`;
    md += `| Metric | Value |\n`;
    md += `|--------|-------|\n`;
    md += `| Total Tests | ${summary.totalTests} |\n`;
    md += `| Passed | ✅ ${summary.passed} |\n`;
    md += `| Failed | ❌ ${summary.failed} |\n`;
    md += `| Duration | ${(summary.duration / 1000).toFixed(2)}s |\n`;
    md += `| Success Rate | ${((summary.passed / summary.totalTests) * 100).toFixed(1)}% |\n\n`;
    
    md += `## Test Results\n\n`;
    
    results.forEach((result, index) => {
      const status = result.passed ? '✅ PASSED' : '❌ FAILED';
      md += `### ${index + 1}. ${result.name} - ${status}\n\n`;
      md += `- **Duration:** ${result.duration}ms\n`;
      md += `- **Timestamp:** ${new Date(result.timestamp).toLocaleString()}\n\n`;
      
      if (!result.passed) {
        md += `**Error Details:**\n\`\`\`\n${result.details.substring(0, 500)}\n\`\`\`\n\n`;
      }
    });
    
    return md;
  }
}

// Run the test suite
async function main() {
  const runner = new QATestRunner();
  const report = await runner.runAllTests();
  runner.generateReport(report);
  
  // Exit with error code if any tests failed
  if (report.summary.failed > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
