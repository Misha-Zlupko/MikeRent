import { ApartmentFacts } from "./ApartmentFactsComponent";
import { ApartmentDescription } from "./ApartmentDescriptionComponent";
import { ApartmentAmenities } from "./ApartmentAmenities";
import { ApartmentRules } from "./ApartmentRulesComponent";

type Props = {
  apartment: {
    guests: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
    description: string;
    amenities: string[];
  };
};

export const ApartmentContent = ({ apartment }: Props) => {
  return (
    <div className="space-y-6">
      <section className="">
        <ApartmentFacts
          guests={apartment.guests}
          bedrooms={apartment.bedrooms}
          beds={apartment.beds}
          bathrooms={apartment.bathrooms}
        />
      </section>

      <section className="">
        <ApartmentDescription description={apartment.description} />
      </section>

      <section className="">
        <ApartmentAmenities amenities={apartment.amenities} />
      </section>

      <section className="">
        <ApartmentRules />
      </section>
    </div>
  );
};
