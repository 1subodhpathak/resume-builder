# PDFExport

Reusable browser-print utilities for HTML documents that need true A4 PDF export.

## Entry points

- `src/PDFExport/index.js`
  - Shared exports for pagination and print/export.
- `src/PDFExport/paginatedA4Print.js`
  - Active reusable helper used by the resume builder.
- `src/PDFExport/a4-print-export-reference/`
  - Older reference kit and notes kept for reuse and comparison.

## Main API

### `exportPaginatedA4ElementToPdf(options)`

Prints an already-rendered HTML document as a multi-page A4 PDF through the browser print dialog.

Required:

- `sourceElement`

Optional:

- `filename`
- `manualBreaks`
- `blockSelector`
- `onBeforePrint`
- `onAfterPrint`

## Supporting APIs

- `getA4PageHeightPx(width)`
- `waitForEmbeddedAssets(root)`
- `calculatePageBreaks(root, pageHeightPx, options)`
- `buildPaginatedPrintDocument(sourceNode, options)`

## Usage

```js
import { exportPaginatedA4ElementToPdf } from '../PDFExport';

await exportPaginatedA4ElementToPdf({
  sourceElement: printableNode,
  filename: 'Resume PDF',
});
```

## Expectations

- The source node should represent the real printable document content.
- Fonts and styles should already be loaded on the page.
- The helper handles temporary print-root injection and cleanup automatically.
