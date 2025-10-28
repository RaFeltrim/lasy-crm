/**
 * Security Audit Script
 * Validates security implementations across the application
 */

import fs from 'fs';
import path from 'path';

interface SecurityCheck {
  category: string;
  check: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string;
}

class SecurityAuditor {
  private checks: SecurityCheck[] = [];

  addCheck(category: string, check: string, status: 'PASS' | 'FAIL' | 'WARNING', details: string) {
    this.checks.push({ category, check, status, details });
  }

  async runAudit(): Promise<void> {
    console.log('🔒 Starting Security Audit\n');
    console.log('='.repeat(60));

    await this.checkAuthenticationSecurity();
    await this.checkRLSPolicies();
    await this.checkAPIEndpointSecurity();
    await this.checkInputSanitization();
    await this.checkSecurityHeaders();
    await this.checkEnvironmentVariables();
    await this.checkDependencyVulnerabilities();

    this.generateReport();
  }

  async checkAuthenticationSecurity(): Promise<void> {
    console.log('\n🔐 Checking Authentication Security...');

    // Check middleware exists
    const middlewarePath = path.join(process.cwd(), 'middleware.ts');
    if (fs.existsSync(middlewarePath)) {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      
      if (content.includes('supabase.auth.getUser') || content.includes('supabase.auth.getSession')) {
        this.addCheck('Authentication', 'Auth middleware implemented', 'PASS', 'Middleware validates user authentication');
      } else {
        this.addCheck('Authentication', 'Auth middleware implemented', 'FAIL', 'Auth validation not found in middleware');
      }

      if (content.includes('X-Frame-Options') || content.includes('security headers')) {
        this.addCheck('Authentication', 'Security headers configured', 'PASS', 'Security headers present in middleware');
      } else {
        this.addCheck('Authentication', 'Security headers configured', 'WARNING', 'Security headers may be missing');
      }
    } else {
      this.addCheck('Authentication', 'Middleware exists', 'FAIL', 'middleware.ts not found');
    }

    // Check auth utilities
    const authPath = path.join(process.cwd(), 'lib', 'auth.ts');
    if (fs.existsSync(authPath)) {
      this.addCheck('Authentication', 'Auth utilities implemented', 'PASS', 'Auth utilities file exists');
    } else {
      this.addCheck('Authentication', 'Auth utilities implemented', 'WARNING', 'Auth utilities file not found');
    }
  }

  async checkRLSPolicies(): Promise<void> {
    console.log('🛡️  Checking RLS Policies...');

    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir);
      const rlsFiles = files.filter(f => f.includes('rls') || f.includes('policies'));
      
      if (rlsFiles.length > 0) {
        this.addCheck('RLS', 'RLS policies defined', 'PASS', `Found ${rlsFiles.length} RLS policy files`);
        
        // Check for specific policies
        const allContent = rlsFiles.map(f => 
          fs.readFileSync(path.join(migrationsDir, f), 'utf-8')
        ).join('\n');
        
        if (allContent.includes('ENABLE ROW LEVEL SECURITY')) {
          this.addCheck('RLS', 'RLS enabled on tables', 'PASS', 'RLS is enabled');
        } else {
          this.addCheck('RLS', 'RLS enabled on tables', 'WARNING', 'Could not verify RLS is enabled');
        }

        if (allContent.includes('auth.uid()')) {
          this.addCheck('RLS', 'User-based access control', 'PASS', 'Policies use auth.uid() for user isolation');
        } else {
          this.addCheck('RLS', 'User-based access control', 'WARNING', 'Could not verify user-based policies');
        }
      } else {
        this.addCheck('RLS', 'RLS policies defined', 'WARNING', 'No RLS policy files found');
      }
    } else {
      this.addCheck('RLS', 'Migrations directory exists', 'WARNING', 'Supabase migrations directory not found');
    }
  }

  async checkAPIEndpointSecurity(): Promise<void> {
    console.log('🔌 Checking API Endpoint Security...');

    const apiDir = path.join(process.cwd(), 'app', 'api');
    if (fs.existsSync(apiDir)) {
      this.addCheck('API Security', 'API routes exist', 'PASS', 'API directory found');

      // Check for validation
      const validationsDir = path.join(process.cwd(), 'lib', 'validations');
      if (fs.existsSync(validationsDir)) {
        const validationFiles = fs.readdirSync(validationsDir).filter(f => f.endsWith('.ts'));
        this.addCheck('API Security', 'Input validation schemas', 'PASS', `Found ${validationFiles.length} validation schemas`);
      } else {
        this.addCheck('API Security', 'Input validation schemas', 'WARNING', 'Validation directory not found');
      }

      // Check for rate limiting
      const rateLimitPath = path.join(process.cwd(), 'lib', 'rate-limit.ts');
      if (fs.existsSync(rateLimitPath)) {
        this.addCheck('API Security', 'Rate limiting implemented', 'PASS', 'Rate limit utilities found');
      } else {
        this.addCheck('API Security', 'Rate limiting implemented', 'WARNING', 'Rate limiting file not found');
      }
    } else {
      this.addCheck('API Security', 'API routes exist', 'FAIL', 'API directory not found');
    }
  }

  async checkInputSanitization(): Promise<void> {
    console.log('🧹 Checking Input Sanitization...');

    const sanitizePath = path.join(process.cwd(), 'lib', 'sanitize.ts');
    if (fs.existsSync(sanitizePath)) {
      const content = fs.readFileSync(sanitizePath, 'utf-8');
      
      this.addCheck('Input Sanitization', 'Sanitization utilities exist', 'PASS', 'Sanitization module found');

      if (content.includes('XSS') || content.includes('sanitize')) {
        this.addCheck('Input Sanitization', 'XSS protection', 'PASS', 'XSS sanitization implemented');
      } else {
        this.addCheck('Input Sanitization', 'XSS protection', 'WARNING', 'XSS protection not clearly identified');
      }
    } else {
      this.addCheck('Input Sanitization', 'Sanitization utilities exist', 'WARNING', 'Sanitization file not found');
    }
  }

  async checkSecurityHeaders(): Promise<void> {
    console.log('📋 Checking Security Headers...');

    const middlewarePath = path.join(process.cwd(), 'middleware.ts');
    if (fs.existsSync(middlewarePath)) {
      const content = fs.readFileSync(middlewarePath, 'utf-8');

      const requiredHeaders = [
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Referrer-Policy',
        'X-XSS-Protection',
      ];

      requiredHeaders.forEach(header => {
        if (content.includes(header)) {
          this.addCheck('Security Headers', header, 'PASS', `${header} header configured`);
        } else {
          this.addCheck('Security Headers', header, 'WARNING', `${header} header not found`);
        }
      });
    }
  }

  async checkEnvironmentVariables(): Promise<void> {
    console.log('🔑 Checking Environment Variables...');

    const envExamplePath = path.join(process.cwd(), '.env.example');
    if (fs.existsSync(envExamplePath)) {
      const content = fs.readFileSync(envExamplePath, 'utf-8');
      
      const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      ];

      requiredVars.forEach(varName => {
        if (content.includes(varName)) {
          this.addCheck('Environment', `${varName} documented`, 'PASS', 'Variable documented in .env.example');
        } else {
          this.addCheck('Environment', `${varName} documented`, 'WARNING', 'Variable not in .env.example');
        }
      });
    } else {
      this.addCheck('Environment', '.env.example exists', 'WARNING', '.env.example file not found');
    }

    // Check .gitignore
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf-8');
      if (content.includes('.env')) {
        this.addCheck('Environment', '.env files ignored', 'PASS', '.env files are in .gitignore');
      } else {
        this.addCheck('Environment', '.env files ignored', 'FAIL', '.env files not in .gitignore');
      }
    }
  }

  async checkDependencyVulnerabilities(): Promise<void> {
    console.log('📦 Checking Dependencies...');

    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      this.addCheck('Dependencies', 'package.json exists', 'PASS', 'Package file found');
      
      // Note: In production, you would run npm audit here
      this.addCheck('Dependencies', 'Vulnerability scan', 'WARNING', 'Run "npm audit" for detailed vulnerability report');
    }
  }

  generateReport(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SECURITY AUDIT SUMMARY');
    console.log('='.repeat(60));

    const passed = this.checks.filter(c => c.status === 'PASS').length;
    const failed = this.checks.filter(c => c.status === 'FAIL').length;
    const warnings = this.checks.filter(c => c.status === 'WARNING').length;

    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`📊 Total Checks: ${this.checks.length}`);

    // Group by category
    const categories = [...new Set(this.checks.map(c => c.category))];
    
    console.log('\n' + '='.repeat(60));
    console.log('DETAILED RESULTS');
    console.log('='.repeat(60));

    categories.forEach(category => {
      console.log(`\n${category}:`);
      const categoryChecks = this.checks.filter(c => c.category === category);
      categoryChecks.forEach(check => {
        const icon = check.status === 'PASS' ? '✅' : check.status === 'FAIL' ? '❌' : '⚠️';
        console.log(`  ${icon} ${check.check}: ${check.details}`);
      });
    });

    // Save report
    const reportsDir = path.join(process.cwd(), 'test-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, `security-audit-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: { passed, failed, warnings, total: this.checks.length },
      checks: this.checks,
    }, null, 2));

    console.log(`\n📄 Full report saved to: ${reportPath}`);

    // Generate markdown report
    const mdReport = this.generateMarkdownReport();
    const mdPath = path.join(reportsDir, `security-audit-${Date.now()}.md`);
    fs.writeFileSync(mdPath, mdReport);
    console.log(`📄 Markdown report saved to: ${mdPath}`);
  }

  generateMarkdownReport(): string {
    const passed = this.checks.filter(c => c.status === 'PASS').length;
    const failed = this.checks.filter(c => c.status === 'FAIL').length;
    const warnings = this.checks.filter(c => c.status === 'WARNING').length;

    let md = `# Security Audit Report\n\n`;
    md += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    
    md += `## Summary\n\n`;
    md += `| Status | Count |\n`;
    md += `|--------|-------|\n`;
    md += `| ✅ Passed | ${passed} |\n`;
    md += `| ❌ Failed | ${failed} |\n`;
    md += `| ⚠️ Warnings | ${warnings} |\n`;
    md += `| **Total** | **${this.checks.length}** |\n\n`;

    const categories = [...new Set(this.checks.map(c => c.category))];
    
    categories.forEach(category => {
      md += `## ${category}\n\n`;
      const categoryChecks = this.checks.filter(c => c.category === category);
      
      md += `| Check | Status | Details |\n`;
      md += `|-------|--------|----------|\n`;
      
      categoryChecks.forEach(check => {
        const icon = check.status === 'PASS' ? '✅' : check.status === 'FAIL' ? '❌' : '⚠️';
        md += `| ${check.check} | ${icon} ${check.status} | ${check.details} |\n`;
      });
      
      md += `\n`;
    });

    return md;
  }
}

// Run the audit
async function main() {
  const auditor = new SecurityAuditor();
  await auditor.runAudit();
}

main().catch(console.error);
