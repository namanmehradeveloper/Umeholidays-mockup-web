# UME HOLIDAYS — Cloudinary image uploads

The admin image flow is now:

`Admin -> FormData -> Multer memory storage -> signed Cloudinary upload -> Cloudinary secure_url -> MongoDB -> frontend`

## Backend environment

Copy the values from your Cloudinary dashboard into `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Do not put `CLOUDINARY_API_SECRET` in any `NEXT_PUBLIC_*` variable and never expose it to the browser.

## Upload endpoint

`POST /api/uploads/image`

Required:
- Bearer admin/organizer JWT
- multipart field: `image`
- optional `folder`

Allowed image types:
- JPG
- PNG
- WEBP
- GIF

Maximum file size: 5 MB.

The response contains `data.url`, which is the Cloudinary HTTPS URL. Admin forms save that URL in their existing content fields.

## Admin CMS forms

Structured forms are provided for:
- Banners
- FAQs
- Testimonials
- Destinations
- Tours
- Experiences
- Events
- Stories

Banners and testimonial photos use the same Cloudinary uploader. FAQ has question/answer fields instead of JSON editing.
