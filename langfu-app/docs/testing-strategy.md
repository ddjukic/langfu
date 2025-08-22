# LangFu Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the LangFu language learning application. Our testing approach ensures quality, accessibility, and performance across all platforms and devices.

## Testing Philosophy

- **Test Early, Test Often**: Integrate testing into the development workflow
- **User-Centric Testing**: Focus on real user scenarios and experiences
- **Comprehensive Coverage**: Balance unit, integration, and E2E tests
- **Accessibility First**: Ensure WCAG 2.1 AA compliance
- **Mobile First**: Prioritize mobile experience testing
- **Performance Matters**: Monitor and test performance metrics

## Test Coverage Goals

| Test Type         | Target Coverage | Current Coverage | Priority |
| ----------------- | --------------- | ---------------- | -------- |
| Unit Tests        | 80%             | 60%              | High     |
| Integration Tests | 70%             | -                | Medium   |
| E2E Tests         | Critical Paths  | 100%             | Critical |
| Accessibility     | WCAG 2.1 AA     | 100%             | Critical |
| Mobile Tests      | All Viewports   | 100%             | Critical |
| Performance       | Core Web Vitals | Monitored        | High     |

## Testing Pyramid

```
         /\
        /E2E\      (10%) - Critical user journeys
       /------\
      /  Int.  \   (20%) - API and component integration
     /----------\
    /   Unit     \ (70%) - Components, utilities, hooks
   /--------------\
```

## Test Types and Strategies

### 1. Unit Tests

**Location**: `src/**/__tests__/`, `src/**/*.test.{ts,tsx}`

**Framework**: Jest + React Testing Library

**What to Test**:

- Component rendering and behavior
- Utility functions and helpers
- Custom hooks
- State management
- Data transformations
- Error handling

**Key Files**:

- `src/components/__tests__/theme-provider.test.tsx`
- `src/components/__tests__/theme-toggle.test.tsx`
- `src/lib/__tests__/auth.test.ts`

**Running Unit Tests**:

```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage report
```

### 2. End-to-End Tests

**Location**: `tests/e2e/`

**Framework**: Playwright

**What to Test**:

- Complete user workflows
- Cross-browser compatibility
- Authentication flows
- Learning sessions
- Data persistence
- Theme switching
- Mobile interactions

**Key Test Suites**:

#### Dark Mode Tests (`tests/e2e/dark-mode.spec.ts`)

- Theme toggle functionality
- Theme persistence across sessions
- Contrast ratios in both themes
- No flash of incorrect theme
- System preference respect

#### Mobile Tests (`tests/e2e/mobile.spec.ts`)

- Responsive layouts (320px - 768px)
- Touch target sizes (min 44px)
- Mobile navigation
- Keyboard interactions
- Orientation changes
- Performance on slow networks

**Running E2E Tests**:

```bash
pnpm test:e2e             # Run all E2E tests
pnpm test:e2e:ui          # With UI mode
pnpm test:e2e:debug       # Debug mode
pnpm test:e2e:mobile      # Mobile tests only
pnpm test:e2e:dark        # Dark mode tests only
```

### 3. Accessibility Tests

**Location**: `tests/a11y/`

**Framework**: Playwright + Axe-core

**What to Test**:

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast ratios
- Focus management
- ARIA attributes
- Form labels and errors

**Key Requirements**:

- Contrast ratio: 4.5:1 (normal text), 3:1 (large text)
- Touch targets: minimum 44x44px
- Focus indicators: visible and clear
- Keyboard navigation: all interactive elements reachable
- Screen readers: proper announcements

**Running Accessibility Tests**:

```bash
pnpm test:a11y            # Run accessibility tests
```

### 4. Performance Tests

**Framework**: Lighthouse CI

**Metrics Monitored**:

- First Contentful Paint (FCP) < 2s
- Largest Contentful Paint (LCP) < 2.5s
- Cumulative Layout Shift (CLS) < 0.1
- Total Blocking Time (TBT) < 300ms
- Time to Interactive (TTI) < 3.8s

**Performance Budgets**:

```json
{
  "performance": 80,
  "accessibility": 90,
  "best-practices": 90,
  "seo": 90
}
```

## Test Utilities

### Test Data Factory (`tests/utils/test-data-factory.ts`)

- Consistent test data generation
- User, word, and progress factories
- Mobile viewport configurations
- Accessibility scenarios

### Mock API (`tests/utils/mock-api.ts`)

- Simulated API responses
- Network delay simulation
- Error response testing
- Rate limiting scenarios

### Custom Test Renderer (`tests/utils/test-renderer.tsx`)

- Provider wrapping
- Theme testing utilities
- Viewport simulation
- Network condition mocking

## Mobile Testing Strategy

### Tested Viewports

- **Small Mobile**: 320x568 (iPhone SE)
- **Standard Mobile**: 375x667 (iPhone 8)
- **Large Mobile**: 393x851 (Pixel 5)
- **Tablet**: 768x1024 (iPad)
- **Desktop**: 1920x1080

### Mobile-Specific Tests

- Touch interactions and gestures
- Mobile navigation menus
- Keyboard handling with viewport changes
- Image optimization for mobile
- Performance on 3G networks
- Orientation changes

## Dark Mode Testing Strategy

### Key Test Scenarios

1. **Theme Switching**: Verify toggle functionality
2. **Persistence**: Theme saved across sessions
3. **No Flash**: Prevent theme flash on load
4. **Contrast**: Maintain WCAG AA in both themes
5. **System Preference**: Respect OS dark mode
6. **Component Styling**: All components support both themes

### Implementation Checklist

- [ ] Use CSS variables for theme colors
- [ ] Test contrast ratios in both themes
- [ ] Implement theme transition animations
- [ ] Store preference in localStorage
- [ ] Apply theme before first paint

## CI/CD Integration

### GitHub Actions Workflows

**Test Pipeline** (`.github/workflows/test.yml`):

1. **Unit Tests**: Run on Node 18.x and 20.x
2. **E2E Tests**: Full browser suite
3. **Mobile Tests**: All mobile viewports
4. **Accessibility Tests**: WCAG compliance
5. **Lighthouse CI**: Performance monitoring
6. **Lint & Type Check**: Code quality

### Test Execution Order

```
Parallel Execution:
├── Unit Tests (Node 18)
├── Unit Tests (Node 20)
├── Lint & Type Check
└── After build:
    ├── E2E Tests
    ├── Mobile Tests
    ├── Accessibility Tests
    └── Lighthouse CI
```

## Running Tests Locally

### Quick Start

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
pnpm playwright:install

# Run all tests
pnpm test:all
```

### Test Commands

```bash
# Unit tests
pnpm test                 # Run once
pnpm test:watch          # Watch mode
pnpm test:coverage       # Coverage report

# E2E tests
pnpm test:e2e            # All E2E tests
pnpm test:e2e:ui         # Interactive UI
pnpm test:e2e:debug      # Debug mode
pnpm test:e2e:mobile     # Mobile only
pnpm test:e2e:dark       # Dark mode only

# Accessibility
pnpm test:a11y           # WCAG compliance

# All tests
pnpm test:all            # Unit + E2E
```

## Test Development Guidelines

### Writing Unit Tests

```typescript
import { render, screen } from '@/tests/utils/test-renderer';
import { ComponentName } from '@/components/component-name';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('...')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const { user } = render(<ComponentName />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('...')).toBeVisible();
  });
});
```

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should complete user workflow', async ({ page }) => {
    await page.goto('/');
    await page.click('button[aria-label="..."]');
    await expect(page.locator('...')).toBeVisible();
  });
});
```

### Writing Accessibility Tests

```typescript
import { AxeBuilder } from '@axe-core/playwright';

test('should be accessible', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations).toHaveLength(0);
});
```

## Debugging Tests

### Unit Tests

```bash
# Debug in VS Code
# Add breakpoint and run "Jest: Debug" from command palette

# Debug in terminal
node --inspect-brk ./node_modules/.bin/jest --runInBand
```

### E2E Tests

```bash
# Debug mode with inspector
pnpm test:e2e:debug

# Headed mode (see browser)
pnpm playwright test --headed

# Slow motion
pnpm playwright test --headed --slow-mo=1000
```

## Test Maintenance

### Regular Tasks

- **Weekly**: Review and update failing tests
- **Sprint**: Add tests for new features
- **Monthly**: Review test coverage metrics
- **Quarterly**: Performance baseline updates

### Test Quality Checklist

- [ ] Tests are deterministic (no flakiness)
- [ ] Tests are isolated (no dependencies)
- [ ] Tests are fast (< 100ms for unit tests)
- [ ] Tests have clear descriptions
- [ ] Tests cover edge cases
- [ ] Tests are maintainable

## Troubleshooting

### Common Issues

**Issue**: Tests fail in CI but pass locally

- Check environment variables
- Verify database setup
- Check timezone differences
- Review network timeouts

**Issue**: Flaky E2E tests

- Add explicit waits
- Use data-testid attributes
- Increase timeout values
- Check for race conditions

**Issue**: Low test coverage

- Focus on critical paths first
- Add tests for error cases
- Test edge conditions
- Cover all exported functions

## Best Practices

### Do's

- Write tests alongside feature development
- Keep tests simple and focused
- Use descriptive test names
- Test behavior, not implementation
- Mock external dependencies
- Use test data factories

### Don'ts

- Don't test framework code
- Don't test trivial code
- Don't use production data
- Don't skip error cases
- Don't ignore flaky tests
- Don't test private methods

## Resources

### Documentation

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools

- [Axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WAVE](https://wave.webaim.org/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Contact

For questions about testing strategy or help with test implementation, please contact the development team or refer to the project documentation.
