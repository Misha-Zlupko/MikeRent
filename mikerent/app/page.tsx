import { SearchForm } from "@/components/search/SearchFormComponent";
import { ApartmentsGrid } from "@/components/apartments/ApartmentsGridComponent";
import { apartments } from "@/data/ApartmentsData";
import { CustomerComments } from "@/components/СustomerСommentsComponent";

export default function Home() {
  return (
    <main>
      <section className="mt-8 mb-8 container">
        <SearchForm />
      </section>
      <section className="container mb-8">
        <ApartmentsGrid apartments={apartments} />
      </section>
      <section className="inset-0 bg-gradient-to-br from-indigo-50 via-white to-pink-50">
        <CustomerComments />
      </section>
    </main>
  );
}
