import { SearchForm } from "@/components/search/SearchFormComponent";
import { ButtonFilterApartments } from "@/components/buttons/ButtonFilterComponent";
import { ApartmentsGrid } from "@/components/apartments/ApartmentsGridComponent";
import { apartments } from "@/data/ApartmentsData";

export default function Home() {
  return (
    <main>
      <section className="mt-8 mb-8 container">
        <SearchForm />
      </section>

      <section className="container mb-8">
        <ButtonFilterApartments />
      </section>

      <section className="container">
        <ApartmentsGrid apartments={apartments} />
      </section>
    </main>
  );
}
