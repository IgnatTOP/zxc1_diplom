/**
 * Responsive Design Diagnostics Tool
 * Helps identify non-responsive elements and potential issues
 */

(function() {
  'use strict';
  
  // Only run in development/debug mode
  const DEBUG_MODE = localStorage.getItem('responsive-debug') === 'true';
  
  if (!DEBUG_MODE) return;
  
  const issues = [];
  
  function checkElement(el, path = '') {
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Check for fixed widths that might cause overflow
    if (style.width && !style.width.includes('%') && !style.width.includes('vw') && 
        parseFloat(style.width) > viewportWidth * 0.9) {
      issues.push({
        type: 'fixed-width-overflow',
        element: el,
        path: path + el.tagName.toLowerCase(),
        issue: `Fixed width ${style.width} may overflow on mobile (viewport: ${viewportWidth}px)`,
        severity: 'high'
      });
    }
    
    // Check for large padding on mobile
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;
    if (viewportWidth < 768 && (paddingTop > 60 || paddingBottom > 60)) {
      issues.push({
        type: 'large-padding-mobile',
        element: el,
        path: path + el.tagName.toLowerCase(),
        issue: `Large padding (top: ${style.paddingTop}, bottom: ${style.paddingBottom}) on mobile viewport`,
        severity: 'medium'
      });
    }
    
    // Check for font sizes that don't scale
    if (style.fontSize && !style.fontSize.includes('rem') && !style.fontSize.includes('em') && 
        !style.fontSize.includes('vw') && !style.fontSize.includes('clamp')) {
      const fontSize = parseFloat(style.fontSize);
      if (fontSize > 20 && viewportWidth < 768) {
        issues.push({
          type: 'fixed-font-size',
          element: el,
          path: path + el.tagName.toLowerCase(),
          issue: `Fixed font size ${style.fontSize} may be too large on mobile`,
          severity: 'low'
        });
      }
    }
    
    // Check for tables without horizontal scroll
    if (el.tagName === 'TABLE' && !el.style.overflowX && 
        rect.width > viewportWidth * 0.95) {
      issues.push({
        type: 'table-overflow',
        element: el,
        path: path + 'table',
        issue: `Table width (${rect.width}px) exceeds viewport without scroll`,
        severity: 'high'
      });
    }
    
    // Check for elements with fixed max-width that might be too wide
    if (style.maxWidth && !style.maxWidth.includes('%') && !style.maxWidth.includes('vw')) {
      const maxWidth = parseFloat(style.maxWidth);
      if (maxWidth > viewportWidth * 0.95 && viewportWidth < 768) {
        issues.push({
          type: 'max-width-issue',
          element: el,
          path: path + el.tagName.toLowerCase(),
          issue: `max-width ${style.maxWidth} is close to viewport width on mobile`,
          severity: 'medium'
        });
      }
    }
    
    // Recursively check children (limit depth)
    if (path.split('>').length < 5) {
      Array.from(el.children).forEach((child, idx) => {
        checkElement(child, path + el.tagName.toLowerCase() + ' > ');
      });
    }
  }
  
  function generateReport() {
    console.group('📱 Responsive Design Diagnostics Report');
    console.log(`Viewport: ${window.innerWidth}x${window.innerHeight}px`);
    console.log(`User Agent: ${navigator.userAgent}`);
    console.log(`Total issues found: ${issues.length}`);
    
    const bySeverity = {
      high: issues.filter(i => i.severity === 'high'),
      medium: issues.filter(i => i.severity === 'medium'),
      low: issues.filter(i => i.severity === 'low')
    };
    
    console.group('🔴 High Priority Issues');
    bySeverity.high.forEach(issue => {
      console.warn(`[${issue.type}]`, issue.issue, issue.element);
    });
    console.groupEnd();
    
    console.group('🟡 Medium Priority Issues');
    bySeverity.medium.forEach(issue => {
      console.warn(`[${issue.type}]`, issue.issue, issue.element);
    });
    console.groupEnd();
    
    console.group('🟢 Low Priority Issues');
    bySeverity.low.forEach(issue => {
      console.log(`[${issue.type}]`, issue.issue);
    });
    console.groupEnd();
    
    console.groupEnd();
    
    // Return summary
    return {
      total: issues.length,
      high: bySeverity.high.length,
      medium: bySeverity.medium.length,
      low: bySeverity.low.length,
      issues: issues
    };
  }
  
  // Run diagnostics when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        document.body && checkElement(document.body);
        const report = generateReport();
        window.responsiveDiagnostics = report;
      }, 1000);
    });
  } else {
    setTimeout(() => {
      document.body && checkElement(document.body);
      const report = generateReport();
      window.responsiveDiagnostics = report;
    }, 1000);
  }
  
  // Re-run on resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      issues.length = 0;
      document.body && checkElement(document.body);
      generateReport();
    }, 500);
  });
})();


