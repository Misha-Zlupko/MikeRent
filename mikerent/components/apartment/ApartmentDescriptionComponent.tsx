export const ApartmentDescription = ({ description }: { description: string }) => {
  return (
    <div className="mt-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Опис</h2>
      </div>
      
      <div className="prose prose-blue max-w-none">
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
      
      {/* Декоративний елемент */}
      <div className="mt-6 flex justify-end">
        <div className="flex gap-1">
          <div className="h-1 w-8 rounded-full bg-blue-200" />
          <div className="h-1 w-4 rounded-full bg-blue-300" />
          <div className="h-1 w-2 rounded-full bg-blue-400" />
        </div>
      </div>
    </div>
  );
};
