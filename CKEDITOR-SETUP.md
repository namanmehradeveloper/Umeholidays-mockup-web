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

## Rich-text safety

Public rendering goes through `lib/rich-text.ts` and `components/common/RichText.tsx`. Only the supported headings, paragraphs, emphasis, links, lists and blockquotes are retained; arbitrary style/class/id attributes are stripped.

Image upload is intentionally separate from CKEditor and continues to use the existing authenticated Cloudinary upload flow.
