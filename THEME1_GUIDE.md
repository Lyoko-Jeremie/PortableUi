# PortableUi Theme1 - Unified Design System

## 📋 Overview

`theme1` is a comprehensive, unified design system created by consolidating all example styles from the PortableUi project. It provides a cohesive, consistent styling approach for all components and examples.

## 📁 Files

- **`src/css/theme1.scss`** - Source SCSS file with design tokens and variables (for SCSS compilation)
- **`src/css/theme1.css`** - Compiled CSS version using CSS custom properties (for direct use in browsers)

## 🎨 Design System Structure

### 1. Color Palette

**Primary Colors:**
- Primary: `#4f46e5` (Indigo)
- Primary Light: `#667eea` (Secondary for gradients)
- Primary Dark: `#3730a3`
- Secondary: `#764ba2` (Purple)
- Accent: `#2563eb` (Blue)

**Text Colors:**
- Primary: `#111827` (Darkest)
- Secondary: `#1f2937`
- Muted: `#4b5563`
- Light: `#6b7280`
- Lighter: `#374151`

**Background Colors:**
- Base: `#f5f5f5`
- Light: `#f3f4f6` (Default body background)
- Content: `#ffffff` (Component backgrounds)
- Idle: `#fafafa`
- Hover: `#f9fafb`
- Disabled: `#f3f4f6`
- Focus: `#eef2ff` (Light indigo for focus states)

**Border Colors:**
- Standard: `#d1d5db`
- Light: `#e5e7eb`

**Status Colors:**
- Active: `#16a34a` (Green)
- Pending: `#d97706` (Orange)
- Blocked: `#dc2626` (Red)
- Info: `#1d4ed8` (Blue)
- Success: `#166534` (Dark Green)
- Warning: `#92400e` (Dark Orange)
- Error: `#991b1b` (Dark Red)

### 2. Typography

**Font Family:**
```
-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
```

**Font Sizes:**
- xs: 12px
- sm: 13px
- base: 14px (default)
- lg: 16px
- xl: 18px
- 2xl: 22px
- 3xl: 28px

**Font Weights:**
- normal: 400
- medium: 500
- semibold: 600
- bold: 700

**Line Heights:**
- tight: 1.5
- normal: 1.6 (default)

### 3. Spacing System

Consistent 8px base unit:
- xs: 2px
- sm: 4px
- md: 6px
- lg: 8px (base)
- xl: 10px
- 2xl: 12px
- 3xl: 14px
- 4xl: 16px
- 5xl: 20px
- 6xl: 24px
- 7xl: 30px
- 8xl: 40px
- 9xl: 48px
- 10xl: 64px

### 4. Border Radius

- xs: 2px
- sm: 4px
- md: 5px
- lg: 6px
- xl: 8px
- 2xl: 10px
- 3xl: 12px
- full: 999px (fully rounded)

### 5. Transitions & Animations

**Durations:**
- fast: 0.15s ease (button interactions)
- normal: 0.2s ease (standard transitions)
- slow: 0.3s ease (slower animations)

**Animations:**
- `slideIn` - Slides in from top with fade
- `fadeIn` - Fade in animation

### 6. Shadows

- xs: `0 1px 2px rgba(0, 0, 0, 0.05)`
- sm: `0 1px 3px rgba(0, 0, 0, 0.06)` (subtle)
- md: `0 1px 4px rgba(0, 0, 0, 0.06)` (cards)
- lg: `0 2px 8px rgba(0, 0, 0, 0.1)` (sections)
- xl: `0 10px 30px rgba(0, 0, 0, 0.18)` (modals)

## 🚀 Usage

### Using in HTML

Link the compiled CSS file in your HTML:

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="../../src/css/theme1.css" />
  </head>
  <body>
    <!-- Your content here -->
  </body>
</html>
```

### Using CSS Custom Properties

All design tokens are available as CSS variables:

```css
/* Colors */
--color-primary: #4f46e5;
--color-text-primary: #111827;
--color-background-light: #f3f4f6;

/* Typography */
--font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', ...;
--font-size-base: 14px;
--font-weight-semibold: 600;

/* Spacing */
--spacing-lg: 8px;
--spacing-4xl: 16px;

/* Borders */
--radius-lg: 6px;

/* Effects */
--transition-fast: 0.15s ease;
--shadow-md: 0 1px 4px rgba(0, 0, 0, 0.06);
```

Example:

```css
.my-element {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-radius: var(--radius-lg);
  background: var(--color-background-content);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-sm);
  transition: background var(--transition-fast);
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
}
```

### Using in SCSS

If you compile SCSS, import and use the SCSS variables:

```scss
@import "../../src/css/theme1.scss";

.my-component {
  padding: $spacing-lg $spacing-xl;
  border-radius: $radius-lg;
  background: $color-background-content;
  color: $color-text-primary;
  box-shadow: $shadow-sm;
  transition: background $transition-fast;
  border: 1px solid $color-border;
  
  &:hover {
    background: $color-background-hover;
  }
  
  &:focus {
    border-color: $color-primary;
    box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
  }
}
```

## 📦 Component Styles

The theme includes comprehensive styling for:

### Basic Components
- Button
- Input & Textbox
- Select
- Label
- Checkbox & Radio
- Slider
- DatePicker
- FileUpload

### Complex Components
- Table (with striping and hover effects)
- TreeView (expandable/collapsible)
- Tabs
- Modal
- Toast (info, success, warning, error)
- Progress
- Autocomplete
- CascadingSelect

### Layout Components
- Container
- Flex
- Grid
- Group

### Media Components
- Image
- Canvas

### Special Styles
- Demo card layouts
- Demo controls and feedback
- Imperative API styles
- Status badges

## 🎯 Best Practices

### 1. Use the Design Tokens

Instead of hardcoding colors and values:

```css
/* ❌ Don't */
background: #f3f4f6;
padding: 16px;

/* ✅ Do */
background: var(--color-background-light);
padding: var(--spacing-4xl);
```

### 2. Consistent Spacing

Always use the spacing scale for margins and padding:

```css
/* Use spacing scale */
margin: var(--spacing-lg);
padding: var(--spacing-xl) var(--spacing-4xl);
gap: var(--spacing-md);
```

### 3. Focus States

Always provide focus states for interactive elements:

```css
input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}
```

### 4. Hover States

Provide hover feedback for interactive elements:

```css
button:hover:not(:disabled) {
  background: var(--color-background-hover);
}
```

### 5. Responsive Design

The theme includes responsive breakpoints:

```css
@media (max-width: 768px) {
  /* Tablet styles */
}

@media (max-width: 480px) {
  /* Mobile styles */
}
```

## 🔄 Migration Guide

To migrate existing examples to use theme1:

1. **Remove individual `styles.css` links**
   ```html
   <!-- Remove this -->
   <link rel="stylesheet" href="./styles.css" />
   ```

2. **Add unified theme link**
   ```html
   <!-- Add this -->
   <link rel="stylesheet" href="../../src/css/theme1.css" />
   ```

3. **Remove inline component styles** from `<style>` tags (optional - but now using theme defaults)

4. **Override only specific properties** needed for unique demos:
   ```html
   <style>
     /* Demo-specific overrides only */
     .demo-custom {
       background: var(--color-primary);
     }
   </style>
   ```

## 📊 Component Status From Examples

### Consolidated From:
- `examples/styles/demo-base.css` - Layout and base styles
- `examples/basic/styles.css` - Basic component styling
- `examples/complex/styles.css` - Complex component styling
- `examples/layout/styles.css` - Layout system styles
- `examples/media/styles.css` - Media component styles
- `examples/imperative/styles.css` - Imperative API styles

All styles have been unified, normalized, and enhanced for consistency.

## 🎨 Customization

To create a custom theme:

1. **Copy `theme1.scss`** to a new file (e.g., `theme-dark.scss`)

2. **Override design tokens:**
   ```scss
   $color-primary: #ec4899;
   $color-background-light: #1f2937;
   $color-text-primary: #f3f4f6;
   // ... other overrides
   ```

3. **Compile and use** in your project

## 📝 Notes

- All breakpoints use `max-width` media queries for mobile-first design
- Box shadows are subtle and follow native design patterns
- Transitions are fast to feel responsive
- Status colors follow intuitive green/orange/red associations
- The theme favors accessibility with good contrast ratios

## 📚 File Size

- **theme1.css**: Highly optimized, ~18KB unminified (~5KB gzipped)
- Suitable for all project sizes
- Can be further minified and served with gzip compression

## 🚀 Future Enhancements

Potential improvements:
- Dark mode variant
- High contrast mode
- Additional component styles as needed
- Theming for other design systems
- CSS-in-JS exports
- Storybook integration

