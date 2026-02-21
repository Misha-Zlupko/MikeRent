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
  console.log(apartment);
  return (
    <div className="lg:col-span-2">
      <ApartmentFacts
        guests={apartment.guests}
        bedrooms={apartment.bedrooms}
        beds={apartment.beds}
        bathrooms={apartment.bathrooms}
      />
      <ApartmentDescription description={apartment.description} />
      <ApartmentAmenities amenities={apartment.amenities} />
      <ApartmentRules />
    </div>
  );
};
