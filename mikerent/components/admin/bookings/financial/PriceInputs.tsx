type Props = {
  ownerPricePerNight: number;
  markupPerNight: number;
  onOwnerPriceChange: (value: number) => void;
  onMarkupChange: (value: number) => void;
};

export default function PriceInputs({
  ownerPricePerNight,
  markupPerNight,
  onOwnerPriceChange,
  onMarkupChange,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Ціна хазяїна за сутку (грн)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={ownerPricePerNight}
          onChange={(e) => onOwnerPriceChange(Number(e.target.value))}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Моя націнка за сутку (грн)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={markupPerNight}
          onChange={(e) => onMarkupChange(Number(e.target.value))}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
