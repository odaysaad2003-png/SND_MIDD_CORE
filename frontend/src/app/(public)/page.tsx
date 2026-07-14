export default function HomePage() {
  return (
      <main className="min-h-dvh px-4 py-12">
          <section aria-labelledby="foundation-heading" className="mx-auto flex max-w-2xl flex-col gap-4">
              <p className="text-sm font-semibold">سند · SND</p>
              <h1 id="foundation-heading" className="text-3xl font-bold">
                  بدأنا بناء أساس الواجهة
              </h1>
              <p className="text-base leading-8">
                  هذه صفحة مؤقتة للتحقق من Next.js وTypeScript والاتجاه العربي قبل اعتماد الهوية البصرية وتنفيذ صفحات
                  المنتج.
              </p>
          </section>
          <ul className="list-disc space-y-2 pe-5">
              <li>اول قائمة مني</li>
              <li>ثاني قائمة مني</li>
              <li>ثالث قائمة مني</li>
          </ul>
      </main>
  );
}
