import { SearchForm } from "@/components/SearchForm";

export default function Home() {
  return (
    <main>
      <section className="p-[32px]">
        <div className="mx-auto max-w-3xl px-4">
          <SearchForm />
        </div>
      </section>
    </main>
  );
}
