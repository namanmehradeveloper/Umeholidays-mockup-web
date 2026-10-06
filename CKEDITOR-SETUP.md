# CKEditor 5 integration

UME Holidays uses one shared CKEditor 5 implementation at `components/common/RichTextEditor.tsx`.
Admin resource forms and organizer event descriptions reuse this component so toolbar behavior and styling stay consistent.

## Packages

- `@ckeditor/ckeditor5-react` 11.x
- `ckeditor5` 48.x
- `isomorphic-dompurify` 4.x

Use a Node.js version allowed by the root `package.json` engines field (currently Node 22.22.2+ on the Node 22 line).

```bash
npm ci
npm run build
```

## Licensing

The editor reads `NEXT_PUBLIC_CKEDITOR_LICENSE_KEY` when supplied. When it is absent, it uses CKEditor GPL mode. A proprietary/commercial deployment must use licensing appropriate for that deployment.

## Editor features

The shared configuration lives in `components/common/richTextEditorConfig.ts` (`createRichTextEditorConfig`). Every plugin is imported from the single `ckeditor5` package, so all `@ckeditor/*` modules stay on one version and `ckeditor-duplicated-modules` cannot occur. Do not add separate `@ckeditor/ckeditor5-*` packages or predefined builds.

Toolbar: headings (H2–H4), bold, italic, underline, strikethrough, inline code, font family, font size, text color, background color, link, image (upload or URL), table, block quote, code block, horizontal line, alignment, bulleted/numbered lists and undo/redo.

Images are uploaded through the existing authenticated `POST /api/uploads/image` Cloudinary endpoint (admin token on `/admin` pages, user token elsewhere). Pass `uploadFolder` to `RichTextEditor` to target one of the backend's allowed folders.

## Rich-text safety

Public rendering goes through `lib/rich-text.ts` and `components/common/RichText.tsx`. Only the tags CKEditor produces for the enabled features are retained. `style` is reduced to color, background-color, font-size, font-family, text-align, width, height and aspect-ratio with validated values; `class` is limited to CKEditor's image, table and code-block classes; image sources must be http(s) or site-relative. Public styling for this markup is in the `.rich-text` rules in `app/globals.css`.
