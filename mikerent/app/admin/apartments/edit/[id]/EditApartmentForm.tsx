"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { ArrowLeft, X, Calendar, Plus } from "lucide-react";
import { ApartmentImagesField } from "@/components/admin/ApartmentImagesField";
import { isValidUkrainianPhone, normalizePhone } from "@/lib/phone";
import { seasonMonthKeys } from "@/lib/monthlyPricing";
import { getInvalidImageMessage } from "@/lib/validateApartmentImages";
import { resolveCoverImageUrl } from "@/lib/apartmentCoverImage";
import { BOOKING_RECORD_TYPE_LABELS } from "@/lib/bookingRecordType";

type ExternalOccupancyPeriod = {
  from: string;
  to: string;
  recordType: "OWNER" | "EXTERNAL";
};

type ApartmentData = {
  id: string;
  title: string;
  type: string;
  category?: string;
  city: string;
  address: string;
  pricePerNight: number;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  description: string;
  images: string[];
  coverImageUrl?: string | null;
  amenities: string[];
  mapUrl: string;
  ownerName?: string | null;
  ownerPhone?: string | null;
  seaDistanceMin?: number | null;
  seaDistanceMax?: number | null;
  floor?: number | null;
  totalFloors?: number | null;
  videoTourUrl?: string | null;
  seasonFrom: string;
  seasonTo: string;
  externalOccupancy: ExternalOccupancyPeriod[];
  monthlyOwnerPrices?: Record<string, number>;
  monthlyMarkups?: Record<string, number>;
  monthlyPrices?: Record<string, number>;
};

function buildMonthlyMapsForEdit(apartment: ApartmentData) {
  const y =
    Number(apartment.seasonFrom?.slice(0, 4)) || new Date().getFullYear();
  const keys = seasonMonthKeys(y);
  const oDb = apartment.monthlyOwnerPrices ?? {};
  const mDb = apartment.monthlyMarkups ?? {};
  const gDb = apartment.monthlyPrices ?? {};

  const owner: Record<string, number> = {};
  const markup: Record<string, number> = {};
  for (const k of keys) {
    owner[k] = Math.max(0, Math.round(Number(oDb[k] ?? 0)));
    markup[k] = Math.max(0, Math.round(Number(mDb[k] ?? 0)));
  }

  const hasAnySplit = keys.some((k) => oDb[k] != null || mDb[k] != null);

  if (!hasAnySplit) {
    for (const k of keys) {
      const g = Math.max(0, Math.round(Number(gDb[k] ?? 0)));
      if (g > 0) markup[k] = g;
    }
  }

  if (
    keys.every((k) => (owner[k] ?? 0) + (markup[k] ?? 0) === 0) &&
    apartment.pricePerNight > 0
  ) {
    for (const k of keys) {
      markup[k] = apartment.pricePerNight;
    }
  }

  return { owner, markup };
}

export default function EditApartmentForm({
  apartment,
}: {
  apartment: ApartmentData;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(apartment.images || []);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    () =>
      resolveCoverImageUrl(apartment.coverImageUrl, apartment.images || []) ??
      null,
  );
  const [amenities, setAmenities] = useState<string[]>(
    apartment.amenities || [],
  );
  const [monthlyOwnerPrices, setMonthlyOwnerPrices] = useState<
    Record<string, number>
  >(() => buildMonthlyMapsForEdit(apartment).owner);
  const [monthlyMarkups, setMonthlyMarkups] = useState<Record<string, number>>(
    () => buildMonthlyMapsForEdit(apartment).markup,
  );

  const [externalOccupancy, setExternalOccupancy] = useState<
    ExternalOccupancyPeriod[]
  >(apartment.externalOccupancy || []);
  const [seasonFrom, setSeasonFrom] = useState(apartment.seasonFrom);
  const [seasonTo, setSeasonTo] = useState(apartment.seasonTo);
  const [seaDistanceMin, setSeaDistanceMin] = useState<number>(
    apartment.seaDistanceMin ?? 5,
  );
  const [seaDistanceMax, setSeaDistanceMax] = useState<number>(
    apartment.seaDistanceMax ?? 7,
  );

  const priceYear =
    Number(String(seasonFrom).slice(0, 4)) || new Date().getFullYear();
  const monthPriceKeys = useMemo(
    () => seasonMonthKeys(priceYear),
    [priceYear],
  );

  useEffect(() => {
    setMonthlyOwnerPrices((prev) => {
      const next = { ...prev };
      for (const k of monthPriceKeys) {
        if (next[k] === undefined) next[k] = 0;
      }
      return next;
    });
    setMonthlyMarkups((prev) => {
      const next = { ...prev };
      for (const k of monthPriceKeys) {
        if (next[k] === undefined) next[k] = 0;
      }
      return next;
    });
  }, [monthPriceKeys.join(",")]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const ownerName = formData.get("ownerName")?.toString().trim() || "";
    const ownerPhone = formData.get("ownerPhone")?.toString().trim() || "";

    if (!ownerName) {
      alert("Ім'я власника не може бути порожнім");
      setLoading(false);
      return;
    }
    if (!ownerPhone) {
      alert("Номер телефону власника не може бути порожнім");
      setLoading(false);
      return;
    }
    if (!isValidUkrainianPhone(ownerPhone)) {
      alert(
        "Некоректний номер телефону власника (наприклад: 0981234567 або +380981234567)",
      );
      setLoading(false);
      return;
    }
    const hasAnyMonthPrice = monthPriceKeys.some(
      (k) =>
        (Number(monthlyOwnerPrices[k] ?? 0) || 0) +
          (Number(monthlyMarkups[k] ?? 0) || 0) >
        0,
    );
    if (!hasAnyMonthPrice) {
      alert(
        "Вкажіть хоча б для одного місяця ціну власника та/або націнку (сума більше 0)",
      );
      setLoading(false);
      return;
    }
    if (seaDistanceMin > seaDistanceMax) {
      alert("Відстань до моря: мінімум не може бути більшим за максимум");
      setLoading(false);
      return;
    }

    const floorRaw = formData.get("floor")?.toString().trim();
    const totalFloorsRaw = formData.get("totalFloors")?.toString().trim();
    const videoTourUrlRaw =
      formData.get("videoTourUrl")?.toString().trim() || "";
    const floor =
      floorRaw && floorRaw.length > 0 ? Number(floorRaw) : null;
    const totalFloors =
      totalFloorsRaw && totalFloorsRaw.length > 0
        ? Number(totalFloorsRaw)
        : null;
    if (floor !== null && (!Number.isInteger(floor) || floor < 1)) {
      alert("Поверх квартири має бути цілим числом від 1");
      setLoading(false);
      return;
    }
    if (
      totalFloors !== null &&
      (!Number.isInteger(totalFloors) || totalFloors < 1)
    ) {
      alert("Кількість поверхів у будинку має бути цілим числом від 1");
      setLoading(false);
      return;
    }
    if (
      floor !== null &&
      totalFloors !== null &&
      floor > totalFloors
    ) {
      alert("Поверх квартири не може бути більшим за кількість поверхів у будинку");
      setLoading(false);
      return;
    }

    const invalidImages = getInvalidImageMessage(images);
    if (invalidImages) {
      alert(invalidImages);
      setLoading(false);
      return;
    }

    const data = {
      title: formData.get("title"),
      type: formData.get("type")?.toString().toUpperCase(),
      category: formData.get("category")?.toString().toUpperCase(),
      city: formData.get("city"),
      address: formData.get("address"),
      seaDistanceMin,
      seaDistanceMax,
      floor,
      totalFloors,
      videoTourUrl: videoTourUrlRaw.length > 0 ? videoTourUrlRaw : null,
      ownerName,
      ownerPhone: normalizePhone(ownerPhone),
      monthlyOwnerPrices,
      monthlyMarkups,
      guests: Number(formData.get("guests")),
      bedrooms: Number(formData.get("bedrooms")),
      beds: Number(formData.get("beds")),
      bathrooms: Number(formData.get("bathrooms")),
      description: formData.get("description"),
      images: images,
      coverImageUrl,
      amenities: amenities,
      mapUrl: formData.get("mapUrl"),
      seasonFrom: seasonFrom ? new Date(seasonFrom) : null,
      seasonTo: seasonTo ? new Date(seasonTo) : null,
    };

    try {
      const res = await fetch(`/api/admin/apartments/${apartment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        await fetch(
          `/api/admin/bookings?apartmentId=${apartment.id}&externalOnly=true`,
          { method: "DELETE" },
        );
        for (const period of externalOccupancy) {
          if (period.from && period.to) {
            await fetch("/api/admin/bookings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                apartmentId: apartment.id,
                dateFrom: period.from,
                dateTo: period.to,
                recordType: period.recordType,
                status: "CONFIRMED",
              }),
            });
          }
        }

        router.push("/admin/apartments");
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || "Помилка оновлення");
      }
    } catch (error) {
      alert("Помилка сервера");
    } finally {
      setLoading(false);
    }
  }

  // Додати новий період бронювання
  const addExternalPeriod = () => {
    setExternalOccupancy([
      ...externalOccupancy,
      { from: "", to: "", recordType: "OWNER" },
    ]);
  };

  const updateExternalPeriod = (
    index: number,
    field: "from" | "to" | "recordType",
    value: string,
  ) => {
    const updated = [...externalOccupancy];
    if (field === "recordType") {
      updated[index].recordType = value as "OWNER" | "EXTERNAL";
    } else {
      updated[index][field] = value;
    }
    setExternalOccupancy(updated);
  };

  const removeExternalPeriod = (index: number) => {
    setExternalOccupancy(externalOccupancy.filter((_, i) => i !== index));
  };

  const monthNames: Record<string, string> = {
    "05": "Травень",
    "06": "Червень",
    "07": "Липень",
    "08": "Серпень",
    "09": "Вересень",
  };

  const amenitiesList = [
    { id: "wifi", label: "WiFi" },
    { id: "airConditioner", label: "Кондиціонер" },
    { id: "kitchen", label: "Кухня" },
    { id: "dishes", label: "Посуд" },
    { id: "washingMachine", label: "Пральна машина" },
    { id: "tv", label: "Телевізор" },
    { id: "parking", label: "Парковка" },
    { id: "balcony", label: "Балкон" },
    { id: "seaView", label: "Вид на море" },
    { id: "pool", label: "Басейн" },
    { id: "grill", label: "Мангал" },
    { id: "gazebo", label: "Альтанка" },
    { id: "bedLinen", label: "Постільна білизна" },
    { id: "fans", label: "Вентилятори" },
    { id: "pillows", label: "Пухові подушки" },
    { id: "elevator", label: "Ліфт" },
    { id: "sharedKitchen", label: "Спільна кухня" },
    { id: "bathroom", label: "Окремий санвузол" },
    { id: "workspace", label: "Робоче місце" },
    { id: "gym", label: "Тренажерний зал" },
    { id: "coffeeMachine", label: "Кавомашина" },
    { id: "refrigerator", label: "Холодильник" },
    { id: "microwave", label: "Мікрохвильовка" },
    { id: "heating", label: "Індивідуальне опалення" },
    { id: "hairDryer", label: "Фен" },
    { id: "iron", label: "Праска" },
    { id: "conditionerCount", label: "2 кондиціонери" },
    { id: "ventilator", label: "Вентилятор у ванній" },
    { id: "smartTV", label: "Smart TV" },
    { id: "dryer", label: "Сушарка для білизни" },
    { id: "babyBed", label: "Дитяче ліжко" },
    { id: "towels", label: "Рушники" },
    { id: "shampoo", label: "Шампунь та гель" },
    { id: "robotVacuum", label: "Робот-пилосос" },
  ];
  const amenityPresets: { label: string; ids: string[] }[] = [
    {
      label: "База",
      ids: ["wifi", "airConditioner", "kitchen", "dishes", "tv", "refrigerator"],
    },
    {
      label: "Сімейна",
      ids: [
        "wifi",
        "airConditioner",
        "kitchen",
        "washingMachine",
        "babyBed",
        "towels",
      ],
    },
    {
      label: "Комфорт+",
      ids: [
        "wifi",
        "airConditioner",
        "kitchen",
        "washingMachine",
        "smartTV",
        "coffeeMachine",
        "robotVacuum",
      ],
    },
  ];
  const seaDistancePresets = [
    { label: "5-7 хв", min: 5, max: 7 },
    { label: "7-10 хв", min: 7, max: 10 },
    { label: "10-15 хв", min: 10, max: 15 },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/apartments"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-bold">Редагувати квартиру</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основна інформація */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Основна інформація</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Назва *
                </label>
                <input
                  name="title"
                  defaultValue={apartment.title}
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Наприклад: Затишна квартира в центрі"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Тип *</label>
                <select
                  name="type"
                  defaultValue={apartment.type.toLowerCase()}
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="apartment">Квартира</option>
                  <option value="house">Будинок</option>
                  <option value="room">Кімната</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Група квартири *
                </label>
                <select
                  name="category"
                  defaultValue={apartment.category || "EXCLUSIVE"}
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EXCLUSIVE">
                    Ексклюзивна (заселяє тільки Mikerent)
                  </option>
                  <option value="SHARED">
                    Спільна (потрібен щоденний прозвон)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Місто *
                </label>
                <select
                  name="city"
                  defaultValue={apartment.city || "Черноморск"}
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Черноморск">Черноморск</option>
                  <option value="Санжейка">Санжейка</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Адреса</label>
                <input
                  name="address"
                  defaultValue={apartment.address}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="вул. Коперника, 10"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Відстань до моря (хвилини)
                </label>
                <div className="mb-2 flex flex-wrap gap-2">
                  {seaDistancePresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setSeaDistanceMin(preset.min);
                        setSeaDistanceMax(preset.max);
                      }}
                      className="rounded-full border border-blue-200 px-3 py-1 text-sm text-blue-700 hover:bg-blue-50"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min={1}
                    value={seaDistanceMin}
                    onChange={(e) => setSeaDistanceMin(Number(e.target.value) || 1)}
                    className="w-full rounded border p-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Від"
                  />
                  <input
                    type="number"
                    min={1}
                    value={seaDistanceMax}
                    onChange={(e) => setSeaDistanceMax(Number(e.target.value) || 1)}
                    className="w-full rounded border p-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="До"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  На фото буде плашка: {seaDistanceMin}-{seaDistanceMax} хв до моря
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Ім'я власника *
                </label>
                <input
                  name="ownerName"
                  defaultValue={apartment.ownerName ?? ""}
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Наприклад: Олександр"
                  autoComplete="name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Телефон хазяїна *
                </label>
                <input
                  name="ownerPhone"
                  type="tel"
                  defaultValue={apartment.ownerPhone ?? ""}
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="+380971234567"
                  autoComplete="tel"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Не показується на сайті для гостей.
                </p>
              </div>
            </div>
          </div>

          {/* Ціна та місткість */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Ціна та місткість</h2>

            <div className="mb-6 space-y-4">
              <p className="text-sm text-gray-600">
                Для кожного місяця вкажіть ціну власника за ніч і свою націнку. Для
                гостя на сайті показується сума.
              </p>
              {monthPriceKeys.map((monthKey) => {
                const month = monthKey.slice(-2);
                const owner = monthlyOwnerPrices[monthKey] ?? 0;
                const mark = monthlyMarkups[monthKey] ?? 0;
                return (
                  <div
                    key={monthKey}
                    className="grid grid-cols-1 gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3 sm:grid-cols-12 sm:items-end"
                  >
                    <div className="sm:col-span-3">
                      <span className="text-sm font-medium text-gray-800">
                        {monthNames[month]} {priceYear}
                      </span>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="mb-1 block text-xs text-gray-600">
                        Ціна власника / ніч
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={owner}
                        onChange={(e) =>
                          setMonthlyOwnerPrices((prev) => ({
                            ...prev,
                            [monthKey]: Number(e.target.value),
                          }))
                        }
                        className="w-full rounded border p-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="mb-1 block text-xs text-gray-600">
                        Моя націнка / ніч
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={mark}
                        onChange={(e) =>
                          setMonthlyMarkups((prev) => ({
                            ...prev,
                            [monthKey]: Number(e.target.value),
                          }))
                        }
                        className="w-full rounded border p-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-3 pb-2 text-sm text-gray-700">
                      Разом для гостя:{" "}
                      <span className="font-semibold">{owner + mark} ₴</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Гостей</label>
                <input
                  name="guests"
                  type="number"
                  defaultValue={apartment.guests}
                  min="1"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Спалень
                </label>
                <input
                  name="bedrooms"
                  type="number"
                  defaultValue={apartment.bedrooms}
                  min="1"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Ліжок *
                </label>
                <input
                  name="beds"
                  type="number"
                  defaultValue={apartment.beds}
                  required
                  min="1"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ванних</label>
                <input
                  name="bathrooms"
                  type="number"
                  defaultValue={apartment.bathrooms}
                  min="1"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Поверх квартири (опційно)
                </label>
                <input
                  name="floor"
                  type="number"
                  min={1}
                  defaultValue={apartment.floor ?? ""}
                  placeholder="Напр. 3"
                  className="w-full rounded border p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Поверхів у будинку (опційно)
                </label>
                <input
                  name="totalFloors"
                  type="number"
                  min={1}
                  defaultValue={apartment.totalFloors ?? ""}
                  placeholder="Напр. 9"
                  className="w-full rounded border p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Відеоогляд — посилання (опційно)
                </label>
                <input
                  name="videoTourUrl"
                  type="url"
                  defaultValue={apartment.videoTourUrl ?? ""}
                  placeholder="https://www.youtube.com/watch?v=…"
                  className="w-full rounded border p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Фото */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Фотографії</h2>
            <ApartmentImagesField
              images={images}
              onChange={setImages}
              coverImageUrl={coverImageUrl}
              onCoverChange={setCoverImageUrl}
            />
          </div>

          {/* Доступність */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-blue-600" size={24} />
              <h2 className="text-lg font-semibold">Доступність квартири</h2>
            </div>

            {/* Сезон */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Сезон</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Початок сезону
                  </label>
                  <input
                    type="date"
                    value={seasonFrom}
                    onChange={(e) => setSeasonFrom(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Кінець сезону
                  </label>
                  <input
                    type="date"
                    value={seasonTo}
                    onChange={(e) => setSeasonTo(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Зайнятість не вашими клієнтами */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Зайнятість (не мої клієнти)</h3>
                <button
                  type="button"
                  onClick={addExternalPeriod}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                >
                  <Plus size={16} />
                  Додати період
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Хазяїн сам заселив або інший рієлтор. Дати закриваються на сайті,
                у розділі «Бронювання» не показуються. Ваші клієнти — через
                «Додати бронювання».
              </p>

              {externalOccupancy.length === 0 ? (
                <p className="text-sm text-gray-400 bg-gray-50 rounded p-3">
                  Немає записів
                </p>
              ) : (
                externalOccupancy.map((period, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-center gap-2 bg-amber-50/80 border border-amber-100 p-3 rounded mb-2"
                  >
                    <select
                      value={period.recordType}
                      onChange={(e) =>
                        updateExternalPeriod(
                          index,
                          "recordType",
                          e.target.value,
                        )
                      }
                      className="p-2 border rounded text-sm min-w-[140px] focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="OWNER">
                        {BOOKING_RECORD_TYPE_LABELS.OWNER}
                      </option>
                      <option value="EXTERNAL">
                        {BOOKING_RECORD_TYPE_LABELS.EXTERNAL}
                      </option>
                    </select>
                    <input
                      type="date"
                      value={period.from}
                      onChange={(e) =>
                        updateExternalPeriod(index, "from", e.target.value)
                      }
                      className="flex-1 min-w-[120px] p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-500">—</span>
                    <input
                      type="date"
                      value={period.to}
                      onChange={(e) =>
                        updateExternalPeriod(index, "to", e.target.value)
                      }
                      className="flex-1 min-w-[120px] p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeExternalPeriod(index)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Зручності */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Зручності</h2>
            <div className="mb-4 flex flex-wrap gap-2">
              {amenityPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setAmenities(preset.ids)}
                  className="rounded-full border border-blue-200 px-3 py-1 text-sm text-blue-700 hover:bg-blue-50"
                >
                  Генератор: {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmenities([])}
                className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
              >
                Очистити
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {amenitiesList.map((amenity) => (
                <label key={amenity.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={amenity.id}
                    checked={amenities.includes(amenity.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAmenities([...amenities, amenity.id]);
                      } else {
                        setAmenities(amenities.filter((a) => a !== amenity.id));
                      }
                    }}
                    className="rounded text-blue-600"
                  />
                  {amenity.label}
                </label>
              ))}
            </div>
          </div>

          {/* Опис */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Опис</h2>
            <textarea
              name="description"
              defaultValue={apartment.description}
              rows={6}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Детальний опис квартири..."
            />
          </div>

          {/* Карта */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Google Maps URL</h2>
            <input
              name="mapUrl"
              defaultValue={apartment.mapUrl}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="https://maps.google.com/?q=..."
            />
          </div>

          {/* Кнопки */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Збереження..." : "Зберегти зміни"}
            </button>

            <Link
              href="/admin/apartments"
              className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600"
            >
              Скасувати
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
