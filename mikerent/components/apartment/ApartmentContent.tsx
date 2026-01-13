import { ApartmentFacts } from "./ApartmentFacts";
import { ApartmentDescription } from "./ApartmentDescription";
import { ApartmentAmenities } from "./ApartmentAmenities";
import { ApartmentRules } from "./ApartmentRules";

export const ApartmentContent = () => {
  return (
    <div className="lg:col-span-2">
      <ApartmentFacts />
      <ApartmentDescription />
      <ApartmentAmenities />
      <ApartmentRules />
    </div>
  );
};
