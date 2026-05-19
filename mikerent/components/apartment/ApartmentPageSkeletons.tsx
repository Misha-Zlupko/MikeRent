export function GallerySkeleton() {
  return (
    <div className="mb-8 animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
      <div className="aspect-[4/3] rounded-xl bg-slate-200 md:aspect-[16/9]" />
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="sticky top-6 animate-pulse rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="mb-6 h-8 w-32 rounded bg-slate-200" />
      <div className="mb-4 h-24 rounded-xl bg-slate-100" />
      <div className="h-12 rounded-xl bg-slate-200" />
    </div>
  );
}
