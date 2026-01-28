import { ApartmentFacts } from "./ApartmentFactsComponent";
import { ApartmentDescription } from "./ApartmentDescriptionComponent";
import { ApartmentAmenities } from "./ApartmentAmenities";
import { ApartmentRules } from "./ApartmentRulesComponent";

type Props = {
  id: string;
};

export const ApartmentContent = ({ id }: Props) => {
  return (
    <div className="lg:col-span-2">
      <ApartmentFacts id={id} />
      <ApartmentDescription id={id} />
      <ApartmentAmenities id={id}/>
      <ApartmentRules />
    </div>
  );
};
