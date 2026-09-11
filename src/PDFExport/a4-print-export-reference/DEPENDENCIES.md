# Dependencies and Requirements

This reference kit is intentionally lightweight.

## Runtime requirements

- A browser environment
- A rendered HTML node for the A4 document
- Access to `document`, `window`, `iframe`, and browser `print()`

## JavaScript dependencies

The helper itself does not depend on React, Vite, or Tailwind.

It only depends on browser DOM APIs:

- `document.querySelector`
- `cloneNode`
- `iframe.contentWindow`
- `iframe.contentDocument`
- `requestAnimationFrame`
- `document.fonts.ready`
- `window.print`

## CSS expectations

Your project should provide:

- the visual template styling for the A4 document
- any custom fonts used by the template
- any print-specific overrides needed by your design

## Selector expectations

By default, the reference examples assume:

- document node id: `#cover-letter-preview`

You can use another selector if you want. The helper only needs the caller to pass a DOM element.

## When additional project-specific work is needed

You may need extra print overrides if your template uses:

- dark side panels
- gradients
- absolute-position decorations
- image masks
- advanced box shadows
- fixed-position UI elements inside the printable area

