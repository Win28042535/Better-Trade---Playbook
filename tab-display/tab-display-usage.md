# Tab Display Component Usage Guide

This guide explains how to reuse the standalone tab component from `tab-display.html` in another HTML project. It is written for AI agents and developers who need to adapt the component without using React.

## Source File

Use this file as the reference implementation:

```text
tab-display.html
```

The component is intentionally standalone. It contains HTML, CSS, and JavaScript in one file and does not require React, Tailwind, npm packages, or external assets.

## What The Component Includes

- Primary tab style with underline active state
- Secondary tab style with pill-like active state
- Disabled whole tab groups
- Disabled individual tabs
- Tooltip support through `data-tooltip`
- Icon support through inline SVG
- ARIA roles for tab accessibility
- Keyboard navigation with `ArrowLeft`, `ArrowRight`, `Home`, and `End`
- Light and dark theme support
- Responsive layout for small screens

## How To Reuse In Another HTML Project

For a quick test, copy `tab-display.html` into the target project and open it directly in a browser.

For integration into an existing page, copy these three parts:

1. The tab HTML block inside `<body>`
2. The CSS inside `<style>`
3. The JavaScript inside `<script>`

If the project already has a CSS or JS pipeline, move the CSS into a stylesheet and the JavaScript into a script file, then include them from the target page.

Example:

```html
<link rel="stylesheet" href="tabs.css">
<script src="tabs.js" defer></script>
```

## Required HTML Structure

Each tab demo or tab instance should use this structure:

```html
<section data-tab-demo>
  <div class="tabs tabs--primary" role="tablist" aria-label="Example tabs">
    <button class="tab" type="button" role="tab" aria-selected="true" data-value="apple">
      <span class="tab-label">Apple</span>
    </button>
    <button class="tab" type="button" role="tab" aria-selected="false" data-value="orange">
      <span class="tab-label">Orange</span>
    </button>
  </div>
  <div class="tab-panel" role="tabpanel">Selected: <strong>Apple</strong></div>
</section>
```

Important requirements:

- Wrap each independent tab set with `[data-tab-demo]`
- Use `role="tablist"` on the tab container
- Use `role="tab"` on each tab button
- Use `aria-selected="true"` for the initial active tab
- Use `aria-selected="false"` for inactive tabs
- Add `role="tabpanel"` to the panel that should update
- Add `disabled` to tabs that cannot be selected
- Add `data-disabled="true"` to `.tabs` if the whole group should be inactive

## Style Variants

Use primary tabs:

```html
<div class="tabs tabs--primary" role="tablist" aria-label="Primary tabs">
```

Use secondary tabs:

```html
<div class="tabs tabs--secondary" role="tablist" aria-label="Secondary tabs">
```

## Icons

Icons can be added directly inside a tab. Keep the SVG decorative unless it is the only visible label.

```html
<button class="tab" type="button" role="tab" aria-selected="false" data-value="orange" aria-label="Orange">
  <svg class="tab-icon" viewBox="0 0 24 24" aria-hidden="true">...</svg>
  <span class="tab-label"></span>
</button>
```

If the tab has no visible text, add an `aria-label`.

## Tooltips

Add a tooltip with `data-tooltip`:

```html
<button class="tab" type="button" role="tab" aria-selected="false" data-tooltip="Disabled tooltip" disabled>
  <span class="tab-label">Disabled</span>
</button>
```

The tooltip is CSS-only and works on hover and keyboard focus.

## JavaScript Behavior

The script automatically finds all `[data-tab-demo]` groups on the page and initializes them.

It handles:

- Assigning unique tab and panel IDs
- Updating `aria-selected`
- Updating `tabIndex`
- Updating the panel text
- Skipping disabled tabs
- Keyboard navigation
- Theme toggle

If the target project already has its own panel content logic, replace this line:

```js
panel.innerHTML = `Selected: <strong>${labelFor(nextTab)}</strong>`;
```

with project-specific behavior, such as showing and hiding separate tab panels.

## Avoiding CSS Conflicts

If this component is used in a larger project, rename the generic classes to a project-specific prefix.

Recommended example:

```text
.tabs        -> .bt-tabs
.tab         -> .bt-tab
.tab-panel   -> .bt-tab-panel
.tab-icon    -> .bt-tab-icon
.tab-label   -> .bt-tab-label
```

After renaming CSS classes, update the JavaScript selectors to match the new names.

## Customization Points

Change colors through CSS variables in `:root`:

```css
:root {
  --page: #f7f7f7;
  --surface: #ffffff;
  --text: #171717;
  --muted: #666666;
  --line: #eaeaea;
  --focus: #0070f3;
}
```

Change labels and values through the tab buttons:

```html
data-value="overview"
<span class="tab-label">Overview</span>
```

Change the initial active tab by setting only one tab to `aria-selected="true"`.

## Validation Checklist

After adapting the component, verify:

- Clicking each enabled tab updates the selected state
- Disabled tabs cannot be clicked or selected by keyboard
- Arrow keys move between enabled tabs only
- `Home` selects the first enabled tab
- `End` selects the last enabled tab
- Focus outline is visible
- Tooltip is visible on hover and focus
- Layout does not horizontally overflow on mobile
- No browser console errors appear

## Implementation Notes For AI

When adapting this component:

- Keep the output as plain HTML, CSS, and JavaScript unless the user requests a framework
- Do not add external dependencies unless necessary
- Preserve ARIA roles and keyboard behavior
- Keep disabled state behavior intact
- Keep the component usable without a build step
- Prefer inline SVG icons if the destination project has no icon library
- If the destination project has an existing design system, map CSS variables to that system rather than hardcoding a new theme
