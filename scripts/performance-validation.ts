/**
 * Performance Validation Script
 * Validates performance metrics and generates reports
 */

import fs from 'fs';
import path from 'path';

interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
}

interface PerformanceReport {
  timestamp: string;
  metrics: PerformanceMetric[];
  summary: {
    passed: number;
    failed: number;
    warnings: number;
  };
}

class PerformanceValidator {
  private metrics: PerformanceMetric[] = [];

  addMetric(name: string, value: number, target: number, unit: string): void {
    const status = value <= target ? 'PASS' : value <= target * 1.2 ? 'WARNING' : 'FAIL';
    this.metrics.push({ name, value, target, unit, status });
  }

  async validatePerformance(): Promise<void> {
    console.log('⚡ Starting Performance Validation\n');
    console.log('='.repeat(60));

    await this.checkBuildSize();
    await this.checkLighthouseConfig();
    await this.checkCodeSplitting();
    await this.checkImageOptimization();
    await this.checkCachingStrategy();

    this.generateReport();
  }

  async checkBuildSize(): Promise<void> {
    console.log('\n📦 Checking Build Size...');

    const nextDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextDir)) {
      console.log('✅ Build directory exists');
      
      // Check if build has been run
      const buildManifest = path.join(nextDir, 'build-manifest.json');
      if (fs.existsSync(buildManifest)) {
        console.log('✅ Build manifest found');
        
        // Estimate bundle size (simplified)
        const staticDir = path.join(nextDir, 'static');
        if (fs.existsSync(staticDir)) {
          const totalSize = this.getDirectorySize(staticDir);
          const sizeMB = totalSize / (1024 * 1024);
          
          // Target: < 5MB for initial bundle
          this.addMetric('Total Bundle Size', sizeMB, 5, 'MB');
          console.log(`📊 Total static size: ${sizeMB.toFixed(2)} MB`);
        }
      } else {
        console.log('⚠️  Build not found - run "npm run build" first');
      }
    } else {
      console.log('⚠️  .next directory not found - build required');
    }
  }

  getDirectorySize(dirPath: string): number {
    let totalSize = 0;
    
    try {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          totalSize += this.getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    return totalSize;
  }

  async checkLighthouseConfig(): Promise<void> {
    console.log('\n🔦 Checking Lighthouse Configuration...');

    const lighthouseConfig = path.join(process.cwd(), 'lighthouserc.json');
    if (fs.existsSync(lighthouseConfig)) {
      const config = JSON.parse(fs.readFileSync(lighthouseConfig, 'utf-8'));
      console.log('✅ Lighthouse configuration found');
      
      if (config.ci?.assert?.assertions) {
        const assertions = config.ci.assert.assertions;
        
        // Check performance targets
        if (assertions['first-contentful-paint']) {
          const fcpTarget = assertions['first-contentful-paint'][1]?.maxNumericValue || 1000;
          console.log(`📊 FCP Target: ${fcpTarget}ms`);
          this.addMetric('FCP Target', fcpTarget, 1000, 'ms');
        }
        
        if (assertions['largest-contentful-paint']) {
          const lcpTarget = assertions['largest-contentful-paint'][1]?.maxNumericValue || 2000;
          console.log(`📊 LCP Target: ${lcpTarget}ms`);
          this.addMetric('LCP Target', lcpTarget, 2000, 'ms');
        }
        
        if (assertions['interactive']) {
          const ttiTarget = assertions['interactive'][1]?.maxNumericValue || 3000;
          console.log(`📊 TTI Target: ${ttiTarget}ms`);
          this.addMetric('TTI Target', ttiTarget, 3000, 'ms');
        }
        
        if (assertions['cumulative-layout-shift']) {
          const clsTarget = assertions['cumulative-layout-shift'][1]?.maxNumericValue || 0.1;
          console.log(`📊 CLS Target: ${clsTarget}`);
          this.addMetric('CLS Target', clsTarget, 0.1, 'score');
        }
      }
    } else {
      console.log('⚠️  Lighthouse configuration not found');
    }
  }

  async checkCodeSplitting(): Promise<void> {
    console.log('\n✂️  Checking Code Splitting...');

    // Check for dynamic imports
    const componentsDir = path.join(process.cwd(), 'components');
    const appDir = path.join(process.cwd(), 'app');
    
    let dynamicImports = 0;
    
    const checkDirectory = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir, { recursive: true }) as string[];
      
      for (const file of files) {
        if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          const filePath = path.join(dir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          
          if (content.includes('dynamic(') || content.includes('lazy(')) {
            dynamicImports++;
          }
        }
      }
    };
    
    checkDirectory(componentsDir);
    checkDirectory(appDir);
    
    console.log(`📊 Dynamic imports found: ${dynamicImports}`);
    
    if (dynamicImports > 0) {
      console.log('✅ Code splitting implemented');
    } else {
      console.log('⚠️  No dynamic imports detected');
    }
  }

  async checkImageOptimization(): Promise<void> {
    console.log('\n🖼️  Checking Image Optimization...');

    // Check for Next.js Image component usage
    const componentsDir = path.join(process.cwd(), 'components');
    const appDir = path.join(process.cwd(), 'app');
    
    let nextImageUsage = 0;
    let regularImgUsage = 0;
    
    const checkDirectory = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir, { recursive: true }) as string[];
      
      for (const file of files) {
        if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
          const filePath = path.join(dir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          
          if (content.includes('next/image') || content.includes('<Image')) {
            nextImageUsage++;
          }
          
          if (content.includes('<img')) {
            regularImgUsage++;
          }
        }
      }
    };
    
    checkDirectory(componentsDir);
    checkDirectory(appDir);
    
    console.log(`📊 Next.js Image usage: ${nextImageUsage} files`);
    console.log(`📊 Regular img tags: ${regularImgUsage} files`);
    
    if (nextImageUsage > 0) {
      console.log('✅ Image optimization implemented');
    }
    
    if (regularImgUsage > 0) {
      console.log('⚠️  Consider using Next.js Image component for all images');
    }
  }

  async checkCachingStrategy(): Promise<void> {
    console.log('\n💾 Checking Caching Strategy...');

    // Check for React Query configuration
    const queryProviderPath = path.join(process.cwd(), 'components', 'QueryProvider.tsx');
    if (fs.existsSync(queryProviderPath)) {
      const content = fs.readFileSync(queryProviderPath, 'utf-8');
      
      if (content.includes('staleTime') || content.includes('cacheTime')) {
        console.log('✅ React Query caching configured');
      } else {
        console.log('⚠️  React Query caching configuration not found');
      }
    }

    // Check for SWR or other caching
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      if (pkg.dependencies['@tanstack/react-query']) {
        console.log('✅ React Query installed');
      }
    }
  }

  generateReport(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PERFORMANCE VALIDATION SUMMARY');
    console.log('='.repeat(60));

    const passed = this.metrics.filter(m => m.status === 'PASS').length;
    const failed = this.metrics.filter(m => m.status === 'FAIL').length;
    const warnings = this.metrics.filter(m => m.status === 'WARNING').length;

    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`📊 Total Metrics: ${this.metrics.length}`);

    if (this.metrics.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('METRICS DETAILS');
      console.log('='.repeat(60));

      this.metrics.forEach(metric => {
        const icon = metric.status === 'PASS' ? '✅' : metric.status === 'FAIL' ? '❌' : '⚠️';
        console.log(`${icon} ${metric.name}: ${metric.value.toFixed(2)}${metric.unit} (target: ${metric.target}${metric.unit})`);
      });
    }

    // Save report
    const reportsDir = path.join(process.cwd(), 'test-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const report: PerformanceReport = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      summary: { passed, failed, warnings },
    };

    const reportPath = path.join(reportsDir, `performance-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Full report saved to: ${reportPath}`);

    // Generate markdown report
    const mdReport = this.generateMarkdownReport(report);
    const mdPath = path.join(reportsDir, `performance-report-${Date.now()}.md`);
    fs.writeFileSync(mdPath, mdReport);
    console.log(`📄 Markdown report saved to: ${mdPath}`);
  }

  generateMarkdownReport(report: PerformanceReport): string {
    let md = `# Performance Validation Report\n\n`;
    md += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`;
    
    md += `## Summary\n\n`;
    md += `| Status | Count |\n`;
    md += `|--------|-------|\n`;
    md += `| ✅ Passed | ${report.summary.passed} |\n`;
    md += `| ❌ Failed | ${report.summary.failed} |\n`;
    md += `| ⚠️ Warnings | ${report.summary.warnings} |\n`;
    md += `| **Total** | **${report.metrics.length}** |\n\n`;

    if (report.metrics.length > 0) {
      md += `## Performance Metrics\n\n`;
      md += `| Metric | Value | Target | Status |\n`;
      md += `|--------|-------|--------|--------|\n`;
      
      report.metrics.forEach(metric => {
        const icon = metric.status === 'PASS' ? '✅' : metric.status === 'FAIL' ? '❌' : '⚠️';
        md += `| ${metric.name} | ${metric.value.toFixed(2)}${metric.unit} | ${metric.target}${metric.unit} | ${icon} ${metric.status} |\n`;
      });
    }

    md += `\n## Recommendations\n\n`;
    
    const failedMetrics = report.metrics.filter(m => m.status === 'FAIL');
    if (failedMetrics.length > 0) {
      md += `### Critical Issues\n\n`;
      failedMetrics.forEach(metric => {
        md += `- **${metric.name}**: Current value (${metric.value.toFixed(2)}${metric.unit}) exceeds target (${metric.target}${metric.unit})\n`;
      });
      md += `\n`;
    }

    const warningMetrics = report.metrics.filter(m => m.status === 'WARNING');
    if (warningMetrics.length > 0) {
      md += `### Warnings\n\n`;
      warningMetrics.forEach(metric => {
        md += `- **${metric.name}**: Close to target threshold\n`;
      });
    }

    return md;
  }
}

// Run the validation
async function main() {
  const validator = new PerformanceValidator();
  await validator.validatePerformance();
}

main().catch(console.error);
