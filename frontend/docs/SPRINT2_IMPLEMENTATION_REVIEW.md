# Sprint F2 — Implementation Review

## الحالة

هذه النسخة **Implementation Candidate** وليست Sprint Complete. تم تنفيذ إعادة البناء ومراجعة الاستيرادات المحلية، لكن أوامر `lint` و`type` و`test` و`build` ومراجعة المتصفح ما زالت بوابة المالك.

## المشكلة التي أخفت صفحة المنشورات

المعاينة في الرئيسية تطلب آخر ثلاثة منشورات، بينما `/posts` تطلب حتى عشرة. البيانات المنشورة حاليًا تحتوي سجلًا قديمًا بصور مثل:

```text
/uploads/posts/...
```

الـFrontend كان يطبّق `z.string().url()` على كل صورة. لذلك فشل عنصر واحد في التحقق وأسقط `PublicPostsResult` كاملًا، رغم أن المنشورات نفسها صالحة. ملفات `/uploads` القديمة غير موجودة حاليًا على Render، فلا يجوز تحويل المسار أو الادعاء أن الصورة قابلة للعرض.

الحل الحالي:

1. يطابق Schema شكل النقل الحقيقي `images: string[]`.
2. يبقى النص والمنشور قابلين للعرض.
3. تمر الصور عبر Media boundary مستقل.
4. لا يدخل `next/image` إلا HTTPS Cloudinary URL مدعوم.
5. يبقى تنظيف السجلات القديمة مهمة Backend/Data منفصلة.

## ملكية الحالة بعد إعادة البناء

| الحالة | المالك |
|---|---|
| Post/Comment API data | TanStack Query |
| Query keys/freshness/retry | Query factory داخل Feature |
| Search/sort/page | URL search params |
| First public fetch | Server prefetch wrapper |
| Browser cache/refetch/loading | Hydrated Client list |
| HTTP/envelope/errors | Shared API client |
| Runtime response contract | Feature Zod schema |
| Supported image origin | Shared media boundary |
| Hero animation | Landing-only Motion island |
| Theme preference | next-themes |

## تدفق المنشورات

```text
GET /posts URL
→ app/(public)/posts/page.tsx
→ PublicPostsPage parses URL state
→ PublicFeed creates request-scoped QueryClient
→ publicPostsQueryOptions builds key + queryFn + retry policy
→ getPublicPosts
→ shared apiRequest
→ Express GET /api/v1/posts
→ validation → controller → service → MongoDB
→ envelope + runtime schema
→ server Query cache
→ dehydrate → HydrationBoundary
→ browser Query cache
→ PublicFeedClient
→ loading / error / empty / success / background refresh
```

## حدود المجلدات

- `app/**/page.tsx`: route entry وmetadata export فقط.
- `features/landing`: تركيب الصفحة وأقسامها وحركتها.
- `features/posts/api`: طلبات Posts والتحقق من response.
- `features/posts/queries`: Query Keys وOptions.
- `features/posts/components`: server prefetch wrappers وclient states وPost UI.
- `features/comments`: نفس الحدود المستقلة للتعليقات.
- `lib/api`: HTTP فقط؛ لا يعرف Posts أو Comments.
- `lib/query`: إنشاء QueryClient وسياسة retry المشتركة الضيقة.
- `lib/media`: قبول مصدر الصورة المدعوم، دون منطق Post.
- `components/ui`: primitives مرئية قابلة لإعادة الاستخدام.
- `components/layout`: Header/Footer/navigation composition.

## الحركة والأداء

- `motion` موجود في Landing Hero وReveal فقط.
- الحركة تعتمد `opacity` و`transform` ولا تغيّر أبعاد layout الأساسية.
- `useReducedMotion` يلغي الحركة غير الضرورية.
- Header وFooter والـRoute pages وserver prefetch wrappers لا تتحول إلى Client Components.
- Hover/focus البسيط يبقى CSS ولا يحتاج Motion.

## أوامر الإغلاق المطلوبة

شغّل من مجلد `frontend` وأرسل نتيجة كل أمر منفصلة:

```powershell
npm install
npm run lint
npm run type
npm test
npm run build
```

ثم راجع في المتصفح:

1. `/` في Light/Dark و320px وDesktop.
2. `/posts` ويجب أن تظهر المنشورات الثمانية الحالية.
3. منشور Cloudinary وتظهر صورته.
4. منشور Legacy ويظهر نصه دون صورة مكسورة.
5. البحث والترتيب والصفحة داخل URL.
6. Retry عند قطع الشبكة وإعادتها.
7. فتح Post comments وتبديل ترتيبها.
8. Keyboard focus وTheme menu وMobile navigation.
9. نظام التشغيل مع Reduced Motion.

## أسئلة بوابة التعلم

1. لماذا Query cache لا تملك `search` و`sort` و`page` رغم أنها موجودة داخل Query Key؟
2. ماذا يحدث من أول request على السيرفر حتى `useQuery` في المتصفح؟
3. لماذا لم نضع Zod schema داخل `api-client.ts`؟
4. لماذا نقبل `images: string[]` ثم نفلترها عند Media boundary؟
5. ماذا سيحدث إذا استخدم Server وClient مفتاحي Query مختلفين لنفس الطلب؟
6. لماذا Retry مسموح مرة لقراءة Network/5xx، لكنه غير مفعّل تلقائيًا لكل الأخطاء؟
7. ما الضرر لو جعلنا Landing page كلها Client Component لتسهيل الحركة؟

## تعديل تدريبي مقترح

بعد نجاح الفحوصات، غيّر `staleTime` لمنشورات المعاينة فقط من 45 ثانية إلى 30 ثانية دون التأثير على Full Feed. قبل التعديل، اشرح لماذا Query factory الحالية تطبق نفس القيمة على الاثنين، وحدد أبسط تصميم يسمح بسياسة مختلفة دون تكرار Query Key أو API function.
