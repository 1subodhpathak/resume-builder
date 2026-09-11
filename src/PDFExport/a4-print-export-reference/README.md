# A4 HTML to PDF Export Reference

This folder is a documentation-only copy of the current CoverLetter A4 print pipeline.

It does **not** change the live app behavior.
Nothing in this folder is imported by the application. These files exist so we can reuse the same export approach in future projects without reverse-engineering the code again.

## What is included

- `index.js`
  - Small portable entrypoint for the reference helper.
- `exportA4ElementToPdf.js`
  - A standalone copy of the current print/export logic used by the editor.
- `a4PreviewScale.css`
  - A copy of the responsive preview-scaling system used to display a real A4 page inside the editor UI.
- `example-a4-template.html`
  - A minimal example showing the expected A4 HTML structure and how to call the helper.
- `DEPENDENCIES.md`
  - Notes about what this helper assumes and what it does not depend on.
- `INTEGRATION_CHECKLIST.md`
  - A practical handoff checklist for using this flow in another project.

## What problem this solves

We have an HTML-based A4 template rendered in the browser. We want the user to:

1. See a scaled preview on screen
2. Keep the document editable inside the app
3. Export the same layout as a proper A4 printout / PDF

The tricky part is that screen preview CSS and print CSS are not the same thing.
This system solves that by cloning the final rendered template, cleaning it for print, mounting it into an isolated iframe, injecting all active styles, and then printing the iframe as a true A4 page.

## Current live source

The active production logic currently lives in:

- `src/components/editor/Editor.jsx`

The files in this folder are copied from that logic so they can be studied and reused safely.

## How the current export system works

### 1. Render a real A4 DOM node in the app

The editor renders a live preview element with:

- `width: 210mm`
- `min-height: 297mm`
- template-specific HTML/CSS

That preview node is the real source of truth for print.

In the app, the target node is:

- `#cover-letter-preview`

### 2. Show the preview at a scaled size on screen

The live app does not shrink the template itself.
Instead, it wraps the A4 content in:

- `.document-scale-frame`
- `.document-scale-content`

The outer frame has a pixel-sized box.
The inner content keeps true A4 dimensions and is visually scaled using `transform: scale(...)`.

This is important because:

- the user sees a compact preview
- the DOM still preserves real print dimensions
- export can use the original A4 content without rasterizing it

### 3. Clone the rendered template for export

When the user clicks `Print / Save PDF`, the system does **not** print the live editor DOM directly.
Instead, it:

1. finds `#cover-letter-preview`
2. clones it
3. removes editing behavior
4. forces print-safe sizing and background values

Why clone?

- avoids editor UI leaking into print
- avoids live state mutations
- allows one-off print fixes
- keeps the visible app untouched during export

### 4. Normalize the clone for print

Before printing, the clone is adjusted to:

- `width: 210mm`
- `min-height: 297mm`
- `height: auto`
- `max-height: none`
- `margin: 0`
- `overflow: hidden`
- white background
- no box shadows
- no contenteditable behavior

This step matters because some templates are designed for polished on-screen preview, while print needs a flatter, exact page output.

### 5. Create an off-screen iframe

The export uses a hidden iframe instead of printing the main window.

This is one of the strongest parts of the system.

Why the iframe approach is powerful:

- print CSS is isolated
- editor chrome is excluded automatically
- only the final document is mounted
- the browser print dialog sees a clean A4 page
- it is safer than trying to print the whole app window

### 6. Copy all active styles into the iframe

The print document clones:

- all `<style>` tags
- all `<link rel="stylesheet">` tags

This ensures the exported document keeps the same template styling, typography, spacing, colors, borders, and utility classes as the live app.

Without this step, the iframe would lose the project CSS context.

### 7. Inject print-only CSS

The export then appends a dedicated print stylesheet that sets:

- `@page { size: A4; margin: 0; }`
- exact color printing
- white page background
- no shadows
- strict A4 sizing on `#cover-letter-preview`
- template-specific cleanup rules

This layer is what converts a styled HTML template into a browser-printable A4 document.

### 8. Wait for assets before printing

Before calling `print()`, the system waits for:

- stylesheet loading
- font readiness via `document.fonts.ready`
- image loading
- two animation frames

This prevents:

- missing fonts
- late-loading logos/photos
- layout shifts during print
- incorrect page geometry

### 9. Print the iframe

Finally, the iframe window receives:

- `focus()`
- `print()`

The browser then lets the user save as PDF or send to a printer.

After printing, the iframe is cleaned up.

## Why this approach is better than screenshot-based PDF export

This system is better than converting HTML into a canvas or image in many cases because:

- text stays selectable in the print pipeline
- layout stays CSS-driven
- browser print engines handle pagination better
- fonts and spacing stay closer to the real design
- A4 dimensions remain explicit instead of inferred from pixels

This is especially useful for resume and cover-letter builders where typography and page fit matter a lot.

## Reuse recipe for another project

If we want to reuse this in another app, the minimum requirements are:

1. Render the document as a real A4-sized HTML node
   - `width: 210mm`
   - `min-height: 297mm`
2. Give that node a stable selector like `#cover-letter-preview`
3. Use the same clone-and-iframe print flow
4. Copy over any template-specific print cleanup rules
5. Wait for fonts and images before printing

## Example usage

```js
import { exportA4ElementToPdf } from './exportA4ElementToPdf';

const sourceElement = document.querySelector('#cover-letter-preview');

await exportA4ElementToPdf({
  sourceElement,
  filename: 'Cover_Letter_John_Doe.pdf',
  templateId: 'modern-block',
});
```

## Notes for future adaptation

- If another project has different template IDs, update the template-specific print overrides.
- If the preview node uses a different selector, update the caller, not the helper.
- If a project uses custom fonts, make sure they are already available to the page so the iframe can inherit them.
- If a template uses dark sidebars or tinted backgrounds, keep dedicated print override rules where needed.

## Important safety note

This folder is intentionally a **copy**, not a refactor.

That means:

- current app behavior remains unchanged
- there is no risk of breaking the live PDF export flow
- future teams can study or port the logic safely before deciding whether to centralize it

## Recommended sharing scope

For reuse or handoff, share the full folder:

- `docs/a4-print-export-reference`

That gives the receiving team:

- the helper code
- the preview CSS
- a working example structure
- dependency notes
- an integration checklist
