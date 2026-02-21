type Props = {
  nights: number;
  ownerTotalPrice: number;
  markupTotal: number;
  clientTotal: number;
};

export default function PriceSummary({
  nights,
  ownerTotalPrice,
  markupTotal,
  clientTotal,
}: Props) {
  return (
    <div className="space-y-3 mb-6">
      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
        <span className="text-gray-700">Хазяїну за {nights} ночей:</span>
        <span className="font-semibold">{ownerTotalPrice.toFixed(2)} грн</span>
      </div>
      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
        <span className="text-gray-700">Моя націнка за {nights} ночей:</span>
        <span className="font-semibold text-green-600">
          {markupTotal.toFixed(2)} грн
        </span>
      </div>
      <div className="flex justify-between items-center p-4 bg-blue-100 rounded-lg">
        <span className="font-medium text-blue-800">
          ЗАГАЛЬНА СУМА ДО СПЛАТИ:
        </span>
        <span className="text-2xl font-bold text-blue-800">
          {clientTotal.toFixed(2)} грн
        </span>
      </div>
    </div>
  );
}
