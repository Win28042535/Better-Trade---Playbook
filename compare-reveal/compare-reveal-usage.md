# Compare Reveal Component Usage Guide

This guide explains how to reuse the standalone before/after comparison component from `compare-reveal.html` in another HTML project. It is written for AI agents and developers who need to adapt the component without React.

## Source File

Use this file as the reference implementation:

```text
compare-reveal.html
```

The component is standalone. It contains HTML, CSS, JavaScript, and demo SVG artwork in one file. It does not require React, Tailwind, npm packages, a build step, or external image assets.

## What The Component Includes

- Before/after comparison reveal
- Draggable vertical divider
- Circular slider handle
- Keyboard control through the handle
- One-time intro sweep animation
- Double-click reset to the configured snap position
- Before and after label chips
- Light and dark theme support
- Responsive layout
- Reduced-motion support
- Inline SVG demo artwork

## How To Reuse In Another HTML Project

For a quick test, copy `compare-reveal.html` into the target project and open it directly in a browser.

For integration into an existing page, copy these three parts:

1. The component HTML block inside `<section class="demo-shell">`
2. The component CSS from the `<style>` block
3. The JavaScript from the `<script>` block

If the target project already has CSS and JS files, move the CSS into a stylesheet and the JavaScript into a script file.

Example:

```html
<link rel="stylesheet" href="compare-reveal.css">
<script src="compare-reveal.js" defer></script>
```

## Required HTML Structure

Each independent compare reveal instance should use this structure:

```html
<div
  class="compare-reveal"
  data-compare-reveal
  data-before-label="Before"
  data-after-label="After"
  data-default-position="50"
  data-snap-position="50"
  role="group"
  aria-label="Comparison: Before versus After"
>
  <div class="compare-side compare-after" aria-hidden="true">
    <!-- after image, SVG, or HTML content -->
  </div>

  <div class="compare-side compare-before" aria-hidden="true">
    <!-- before image, SVG, or HTML content -->
  </div>

  <span class="compare-chip compare-chip--before" data-compare-before-chip aria-hidden="true">Before</span>
  <span class="compare-chip compare-chip--after" data-compare-after-chip aria-hidden="true">After</span>

  <div class="compare-divider" data-compare-divider>
    <button
      class="compare-handle"
      type="button"
      role="slider"
      aria-label="Reveal divider, Before to After"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow="50"
      aria-valuetext="50% Before"
      data-compare-handle
    >
      <!-- handle icon -->
    </button>
  </div>
</div>
```

Important requirements:

- Keep `data-compare-reveal` on the root component
- Keep `.compare-before` as the clipped top layer
- Keep `.compare-after` as the full background layer
- Keep `[data-compare-divider]` for the divider
- Keep `[data-compare-handle]` for the keyboard-accessible slider
- Keep `role="slider"` on the handle
- Keep `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-valuetext`
- Use `data-before-label` and `data-after-label` to control labels and accessible text
- Use `data-default-position` to set the initial divider position
- Use `data-snap-position` to set the double-click reset position

## Replacing The Demo Artwork

The current file uses inline SVG scenes so the demo works without remote assets. In a real project, either side can be replaced with:

- Inline SVG
- An `<img>` tag
- A `<picture>` tag
- A div with custom HTML/CSS content
- A canvas or generated visual, if the project needs it

Example with images:

```html
<div class="compare-side compare-after" aria-hidden="true">
  <img src="after.jpg" alt="" draggable="false">
</div>

<div class="compare-side compare-before" aria-hidden="true">
  <img src="before.jpg" alt="" draggable="false">
</div>
```

If using images, add this CSS if it is not already present:

```css
.compare-side img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  pointer-events: none;
}
```

## JavaScript Behavior

The script automatically finds every `[data-compare-reveal]` element and initializes it.

It handles:

- Pointer drag
- Slider keyboard controls
- Spring-style divider movement
- Intro sweep animation
- Double-click reset
- Label chip fade near the edges
- `aria-valuenow` updates
- `aria-valuetext` updates
- Theme toggle
- Reduced-motion behavior

Keyboard controls:

- `ArrowRight` or `ArrowUp`: move divider right by 2%
- `ArrowLeft` or `ArrowDown`: move divider left by 2%
- `Shift` + arrow key: move by 10%
- `Home`: move to 0%
- `End`: move to 100%

## Customization Points

Change labels:

```html
data-before-label="Wireframe"
data-after-label="Render"
```

Change starting position:

```html
data-default-position="35"
```

Change double-click reset position:

```html
data-snap-position="50"
```

Change colors through CSS variables:

```css
:root {
  --cr-page: #f7f9fc;
  --cr-surface: #ffffff;
  --cr-text: #101828;
  --cr-border: #dce4ef;
  --cr-accent: #315fea;
  --cr-signature: #e9564a;
}
```

Change the aspect ratio:

```css
.compare-reveal {
  aspect-ratio: 16 / 10;
}
```

## Avoiding CSS Conflicts

If this component is used in a larger project, rename the generic classes with a project-specific prefix.

Recommended example:

```text
.compare-reveal    -> .bt-compare-reveal
.compare-side      -> .bt-compare-side
.compare-before    -> .bt-compare-before
.compare-after     -> .bt-compare-after
.compare-divider   -> .bt-compare-divider
.compare-handle    -> .bt-compare-handle
.compare-chip      -> .bt-compare-chip
```

After renaming CSS classes, update the JavaScript selectors to match the new names.

The `data-*` attributes can stay the same because they are less likely to conflict and make initialization clearer.

## Validation Checklist

After adapting the component, verify:

- Dragging the divider updates the before reveal area
- Double-click resets the divider to `data-snap-position`
- Keyboard arrows move the divider when the handle has focus
- `Home` moves to 0%
- `End` moves to 100%
- `aria-valuenow` changes with the divider position
- Label chips fade near the edges
- Reduced-motion users do not get the intro sweep
- The component does not horizontally overflow on mobile
- There are no browser console errors
- The before and after visuals align correctly

## Implementation Notes For AI

When adapting this component:

- Keep the output as plain HTML, CSS, and JavaScript unless the user requests a framework
- Do not add React, Tailwind, shadcn, TypeScript, npm packages, or build tooling unless the target project already requires them
- Preserve slider accessibility
- Preserve pointer and keyboard behavior
- Preserve reduced-motion behavior
- Keep the component usable by opening the HTML file directly in a browser
- Replace demo SVG artwork with project-specific images or content only when requested
- Map CSS variables to the destination project's design system when possible
- If class names are renamed, update CSS and JavaScript selectors together
