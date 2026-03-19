# Tailwind CSS Best Practices — AI Editor Rules

> These rules are intended to guide an AI editor (Cursor, Copilot, Windsurf, etc.) in enforcing
> Tailwind CSS best practices across a Next.js project. Apply these rules to all component and
> page files.

---

## 1. Class Ordering

Always order utility classes following this sequence:

```
Layout → Flexbox/Grid → Spacing → Sizing → Typography → Background → Border → Effects → Transitions → Responsive/State Variants
```

- **Responsive variants** (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) always come **after** base classes
- **State variants** (`hover:`, `focus:`, `active:`, `disabled:`) come **after** base and responsive classes

✅ Correct:
```jsx
<div className="flex items-center gap-4 p-4 w-full text-sm bg-white border rounded shadow hover:shadow-md sm:flex-row" />
```

❌ Incorrect:
```jsx
<div className="hover:shadow-md sm:flex-row flex text-sm border p-4 rounded bg-white items-center shadow gap-4 w-full" />
```

---

## 2. Avoid Common Mistakes

### Use Design Tokens Over Arbitrary Values
Prefer built-in scale values. Only use arbitrary values when a design token genuinely doesn't exist.

```jsx
// ✅ Good
<div className="p-4 text-lg rounded-xl" />

// ❌ Avoid
<div className="p-[16px] text-[18px] rounded-[12px]" />
```

### Combine Shorthands
Use shorthand utilities instead of separate directional ones.

| ❌ Avoid | ✅ Prefer |
|---------|---------|
| `pl-4 pr-4` | `px-4` |
| `pt-2 pb-2` | `py-2` |
| `w-8 h-8` | `size-8` *(v3.4+)* |
| `mt-4 mb-4` | `my-4` |

### No Mixed Styling
Never mix Tailwind utilities and inline styles for the same CSS property.

```jsx
// ❌ Avoid
<div className="text-lg" style={{ fontSize: '18px' }} />

// ✅ Good — pick one
<div className="text-lg" />
```

### Avoid the `!important` Modifier
Only use `!` (e.g., `!text-red-500`) as a last resort when overriding third-party styles.

---

## 3. Dynamic Classes — CRITICAL RULE ⚠️

**Never construct class names dynamically using string interpolation.** Tailwind's JIT engine scans
source files statically — interpolated class names are invisible to it and will not be included in
the final CSS output.

```jsx
// ✅ Correct — full class names in conditionals
<div className={isActive ? 'bg-blue-500' : 'bg-gray-200'} />

// ❌ Broken — Tailwind cannot detect these classes
<div className={`bg-${isActive ? 'blue' : 'gray'}-500`} />
<div className={`text-${size}`} />
```

This is the most impactful rule — **violations cause silent runtime failures** where styles simply do not apply.

---

## 4. Conditional & Merged Classes

Use `cn()` (shadcn/ui) or `clsx()` + `tailwind-merge` for all conditional class logic. Never use
raw template literals or manual string concatenation.

```jsx
// ✅ Correct
import { cn } from '@/lib/utils';

<div className={cn('base-class', isActive && 'bg-blue-500', className)} />

// ❌ Avoid
<div className={`base-class ${isActive ? 'bg-blue-500' : ''} ${className}`} />
```

---

## 5. Readability & Extraction

### Long Class Strings
If a `className` value exceeds **5–6 utilities**, break it into multiple lines or extract it.

```jsx
// ✅ Multiline with cn()
<div
  className={cn(
    'flex items-center gap-4',
    'p-4 rounded-xl border',
    'bg-white shadow hover:shadow-md',
    'transition-shadow duration-200'
  )}
/>
```

### Repeated Patterns
Extract repeated class combinations into a shared constant or component — never copy-paste
the same class string across multiple files.

```jsx
// ✅ Extract shared styles
const cardStyles = 'rounded-xl border bg-white p-6 shadow-sm';

<div className={cardStyles} />
<div className={cardStyles} />
```

---

## 6. Responsive Design

- Always write **mobile-first**: base classes target mobile, breakpoint prefixes override upward
- Avoid `max-*` breakpoints (`max-sm:`, `max-md:`) unless there is a specific, justified reason

```jsx
// ✅ Mobile-first
<div className="flex-col gap-2 sm:flex-row sm:gap-4" />

// ❌ Desktop-first (avoid)
<div className="flex-row gap-4 max-sm:flex-col max-sm:gap-2" />
```

---

## 7. Spacing Between Children

- Prefer `gap-*` for **flex and grid** children
- Use `space-x-*` / `space-y-*` only for **simple static lists** without wrapping
- Avoid manual margins (`mr-4`, `mb-2`) between sibling elements when a parent layout utility works

```jsx
// ✅ Use gap in flex/grid
<div className="flex gap-4">
  <Item />
  <Item />
</div>

// ❌ Avoid manual sibling margins
<div className="flex">
  <Item className="mr-4" />
  <Item />
</div>
```

---

## 8. Tailwind v4 Specific Rules

> Apply these rules if the project uses **Tailwind CSS v4**.

- **CSS-based config**: Do not create or reference `tailwind.config.js` unless explicitly required.
  Theme customization is done via CSS variables in the global stylesheet.

- **Avoid `@apply`** in component styles. Use utility classes directly in JSX, or abstract into a
  component if reuse is needed.

```css
/* ❌ Avoid in component CSS */
.card {
  @apply rounded-xl border bg-white p-6;
}
```

```jsx
{/* ✅ Prefer utility classes directly in JSX */}
<div className="rounded-xl border bg-white p-6" />
```

- **CSS variables for tokens**: Define custom design tokens as CSS variables in the global CSS file,
  not as JS config values.

```css
/* ✅ v4 approach */
@theme {
  --color-brand: #6366f1;
  --radius-card: 0.75rem;
}
```

---

## 9. What NOT to Do — Quick Reference

| Rule | ❌ Don't | ✅ Do |
|------|---------|------|
| Dynamic classes | `` `bg-${color}-500` `` | `isRed ? 'bg-red-500' : 'bg-blue-500'` |
| Arbitrary values | `p-[16px]` | `p-4` |
| Duplicate directional | `pl-4 pr-4` | `px-4` |
| Same-size width/height | `w-8 h-8` | `size-8` |
| Conditional strings | `` `base ${active}` `` | `cn('base', active && 'active-class')` |
| Desktop-first responsive | `max-sm:flex-col` | `flex-col sm:flex-row` |
| Inline + Tailwind mix | `className="text-lg" style={{fontSize}}` | Pick one |
| `@apply` in components | `.btn { @apply px-4 py-2 }` | `<button className="px-4 py-2" />` |

---

*Last updated: for Tailwind CSS v4 + Next.js monorepo projects.*
