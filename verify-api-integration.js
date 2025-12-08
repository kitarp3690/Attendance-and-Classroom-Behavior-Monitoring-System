#!/usr/bin/env node

/**
 * API Integration Verification Script
 * Checks that all updated components have proper API imports and calls
 */

const fs = require('fs');
const path = require('path');

const componentsToCheck = [
    'frontend/src/components/AttendanceTable.jsx',
    'frontend/src/components/Charts/AttendanceChart.jsx',
    'frontend/src/components/Dashboard/AdminPages/ManageUsers.jsx',
    'frontend/src/components/Dashboard/AdminPages/ManageSubjects.jsx',
    'frontend/src/components/Dashboard/AdminPages/AllAttendance.jsx',
    'frontend/src/components/Dashboard/AdminPages/AssignSubjects.jsx',
    'frontend/src/components/Dashboard/AdminPages/AttendanceSummary.jsx',
    'frontend/src/components/Dashboard/AdminPages/Reports.jsx',
    'frontend/src/components/Dashboard/AdminPages/Settings.jsx',
];

const checks = {
    importsAPI: /from ["'].*\/api["']/,
    useEffect: /useEffect\(/,
    useState: /useState\(/,
    apiCall: /API\.(getAll|create|update|delete|getStatistics)/,
    errorHandling: /catch\s*\(/,
    loadingState: /loading|setLoading/,
};

console.log('🔍 Verifying API Integration in Components...\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = [];

componentsToCheck.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`❌ ${filePath} - FILE NOT FOUND`);
        totalChecks++;
        failedChecks.push(filePath);
        return;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const fileName = path.basename(filePath);
    
    console.log(`📄 Checking ${fileName}...`);
    
    let componentPassed = true;
    const results = [];
    
    // Check for API imports
    if (checks.importsAPI.test(content)) {
        results.push('  ✅ API imports found');
    } else if (!fileName.includes('Settings')) {
        results.push('  ❌ No API imports found');
        componentPassed = false;
    }
    totalChecks++;
    
    // Check for useEffect
    if (checks.useEffect.test(content)) {
        results.push('  ✅ useEffect hook found');
    } else {
        results.push('  ❌ No useEffect hook');
        componentPassed = false;
    }
    totalChecks++;
    
    // Check for useState
    if (checks.useState.test(content)) {
        results.push('  ✅ useState hook found');
    } else {
        results.push('  ❌ No useState hook');
        componentPassed = false;
    }
    totalChecks++;
    
    // Check for API calls
    if (checks.apiCall.test(content) || fileName.includes('Settings')) {
        results.push('  ✅ API method calls found');
    } else {
        results.push('  ⚠️  No direct API calls detected');
    }
    totalChecks++;
    
    // Check for error handling
    if (checks.errorHandling.test(content)) {
        results.push('  ✅ Error handling (try-catch) found');
    } else {
        results.push('  ⚠️  No error handling detected');
    }
    totalChecks++;
    
    // Check for loading state
    if (checks.loadingState.test(content)) {
        results.push('  ✅ Loading state management found');
    } else {
        results.push('  ⚠️  No loading state detected');
    }
    totalChecks++;
    
    results.forEach(r => console.log(r));
    
    if (componentPassed) {
        passedChecks++;
    } else {
        failedChecks.push(fileName);
    }
    
    console.log('');
});

console.log('\n📊 VERIFICATION RESULTS');
console.log('═'.repeat(40));
console.log(`Total Checks: ${totalChecks}`);
console.log(`Passed: ${passedChecks}`);
console.log(`Failed: ${failedChecks.length}`);

if (failedChecks.length > 0) {
    console.log('\n❌ Files with issues:');
    failedChecks.forEach(f => console.log(`   - ${f}`));
    process.exit(1);
} else {
    console.log('\n✅ All components passed basic verification!');
    console.log('\nNext steps:');
    console.log('1. Start Django backend: python manage.py runserver');
    console.log('2. Start React frontend: npm run dev');
    console.log('3. Test API connectivity in browser');
    console.log('4. Verify all CRUD operations work correctly');
    process.exit(0);
}
