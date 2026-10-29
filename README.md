# Resort Rooms Management (Standalone)

Standalone extraction of the Rooms Management feature from the supplied resort booking system. Features: list rooms, add, edit, delete, image upload, room type, room number, price, discount, guest capacity, bed type/count, amenities, featured flag, and availability.

## Run locally
1. Install Node.js 20.9 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add your Firebase Web App API key, project ID, and app ID.
4. In Firebase Console, enable Google under Authentication → Sign-in method, and enable Cloud Firestore.
5. Add `localhost` to Authentication authorized domains if needed.
6. Run `npm run dev`, then open http://localhost:3000.

## Suggested Firestore rules
Review and adapt these rules for your project before deployment:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read: if request.auth != null && resource.data.ownerUid == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.ownerUid == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.ownerUid == request.auth.uid;
    }
  }
}
```

## Notes
- Rooms are stored in Firestore `rooms` collection with `ownerUid` matching the signed-in user.
- Existing room documents without `ownerUid` will not appear in this isolated app until assigned to the correct owner.
- Image data URLs are stored inside Firestore documents, as in the original modal flow. Optimize images because Firestore documents have a size limit.
- This extraction intentionally excludes bookings, payments, customer pages, and unrelated admin features.
- Do not commit `.env.local` or Firebase service-account secrets.
