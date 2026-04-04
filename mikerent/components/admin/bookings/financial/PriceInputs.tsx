type Props = {
  ownerPricePerNight: number;
  markupPerNight: number;
  onOwnerPriceChange: (value: number) => void;
  onMarkupChange: (value: number) => void;
};

function round2(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

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
          value={round2(ownerPricePerNight)}
          onChange={(e) => onOwnerPriceChange(round2(Number(e.target.value)))}
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
          value={round2(markupPerNight)}
          onChange={(e) => onMarkupChange(round2(Number(e.target.value)))}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
