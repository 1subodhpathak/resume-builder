# Integration Checklist

Use this checklist when moving the A4 export system into another project.

## 1. Render a true A4 HTML node

- Create one root element for the printable document
- Set width to `210mm`
- Set minimum height to `297mm`
- Keep `box-sizing: border-box`

## 2. Give the printable node a stable selector

- Recommended id: `cover-letter-preview`
- Or pass the element directly into the helper

## 3. Keep screen preview and print dimensions separate

- Use `.document-scale-frame`
- Use `.document-scale-content`
- Scale visually with `transform: scale(...)`
- Do not change the real A4 dimensions of the inner document

## 4. Make sure all template styles exist in the live page

- Base CSS loaded
- Component CSS loaded
- Utility CSS loaded
- Fonts loaded

The helper clones the current stylesheets into the print iframe, so the page must already have those styles available.

## 5. Keep editor-only UI outside the printable node

- Toolbars
- Floating controls
- Side panels
- Zoom controls
- Resize handles

The printable node should contain only document content.

## 6. If content is editable, strip editing markers during export

- remove `contenteditable`
- remove editor-only attributes if needed
- flatten temporary UI states

## 7. Add print overrides for visual cleanup

- remove shadows
- force white backgrounds where needed
- lock A4 sizing
- verify `@page { size: A4; margin: 0; }`

## 8. Wait for assets before calling print

- stylesheets loaded
- fonts ready
- images loaded
- two animation frames passed

## 9. Test with browser Save as PDF

- Chrome
- Edge
- Safari if relevant

Check for:

- page size
- overflow
- clipped text
- missing fonts
- image shifts
- broken page backgrounds

## 10. Test with long and short content

- very short letter
- dense one-page letter
- image/no-image variants
- templates with sidebars

