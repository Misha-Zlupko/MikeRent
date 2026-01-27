import { ApartmentFacts } from "./ApartmentFacts";
import { ApartmentDescription } from "./ApartmentDescription";
import { ApartmentAmenities } from "./ApartmentAmenities";
import { ApartmentRules } from "./ApartmentRules";

type Props = {
  id: string;
};

export const ApartmentContent = ({ id }: Props) => {
  return (
    <div className="lg:col-span-2">
      <ApartmentFacts id={id} />
      <ApartmentDescription />
      <ApartmentAmenities id={id}/>
      <ApartmentRules />
    </div>
  );
};
