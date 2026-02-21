"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Link as LinkIcon, X, Calendar, Plus } from "lucide-react";

// Тип для періоду бронювання
type BookedPeriod = {
  from: string;
  to: string;
};

export default function NewApartmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Стан для заброньованих дат
  const [bookedPeriods, setBookedPeriods] = useState<BookedPeriod[]>([]);

  // 👇 ДЕФОЛТНИЙ СЕЗОН: червень - вересень поточного року
  const currentYear = new Date().getFullYear();
  const [seasonFrom, setSeasonFrom] = useState(`${currentYear}-06-01`);
  const [seasonTo, setSeasonTo] = useState(`${currentYear}-09-30`);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const data = {
      title: formData.get("title"),
      type: formData.get("type")?.toString().toUpperCase(),
      city: formData.get("city"),
      address: formData.get("address"),
      pricePerNight: Number(formData.get("pricePerNight")),
      guests: Number(formData.get("guests")),
      bedrooms: Number(formData.get("bedrooms")),
      beds: Number(formData.get("beds")),
      bathrooms: Number(formData.get("bathrooms")),
      description: formData.get("description"),
      images: images,
      amenities: amenities,
      mapUrl: formData.get("mapUrl"),

      // 👇 Сезон (вже має значення завдяки дефолтному useState)
      seasonFrom: seasonFrom ? new Date(seasonFrom) : null,
      seasonTo: seasonTo ? new Date(seasonTo) : null,

      rating: 0,
      reviewsCount: 0,
    };

    try {
      const res = await fetch("/api/admin/apartments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const apartment = await res.json();

        // Створюємо бронювання для кожного періоду
        for (const period of bookedPeriods) {
          if (period.from && period.to) {
            await fetch("/api/admin/bookings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                apartmentId: apartment.id,
                dateFrom: period.from,
                dateTo: period.to,
              }),
            });
          }
        }

        router.push("/admin/apartments");
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || "Помилка створення");
      }
    } catch (error) {
      alert("Помилка сервера");
    } finally {
      setLoading(false);
    }
  }

  // Додати посилання на фото
  const addImageUrl = () => {
    if (imageUrlInput.trim() && !images.includes(imageUrlInput.trim())) {
      setImages([...images, imageUrlInput.trim()]);
      setImageUrlInput("");
    }
  };

  // Видалити посилання
  const removeImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  // Додати новий період бронювання
  const addBookedPeriod = () => {
    setBookedPeriods([...bookedPeriods, { from: "", to: "" }]);
  };

  // Оновити період бронювання
  const updateBookedPeriod = (
    index: number,
    field: "from" | "to",
    value: string,
  ) => {
    const updated = [...bookedPeriods];
    updated[index][field] = value;
    setBookedPeriods(updated);
  };

  // Видалити період бронювання
  const removeBookedPeriod = (index: number) => {
    setBookedPeriods(bookedPeriods.filter((_, i) => i !== index));
  };

  // Список доступних зручностей
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
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-bold">Додати нову квартиру</h1>
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
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Наприклад: Затишна квартира в центрі"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Тип *</label>
                <select
                  name="type"
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
                  Місто *
                </label>
                <input
                  name="city"
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Львів"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Адреса</label>
                <input
                  name="address"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="вул. Коперника, 10"
                />
              </div>
            </div>
          </div>

          {/* Ціна та місткість */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Ціна та місткість</h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ціна/ніч *
                </label>
                <input
                  name="pricePerNight"
                  type="number"
                  required
                  min="0"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Гостей</label>
                <input
                  name="guests"
                  type="number"
                  min="1"
                  defaultValue="2"
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
                  min="1"
                  defaultValue="1"
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
                  required
                  min="1"
                  defaultValue="1"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ванних</label>
                <input
                  name="bathrooms"
                  type="number"
                  min="1"
                  defaultValue="1"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Фото - через посилання */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Фотографії</h2>

            <div className="space-y-4">
              {/* Поле для введення посилання */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Вставте посилання на фото (https://...)"
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  disabled={!imageUrlInput.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <LinkIcon size={20} />
                  Додати
                </button>
              </div>

              {/* Прев'ю доданих фото */}
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={img}
                        alt={`Фото ${i + 1}`}
                        className="w-full h-24 object-cover rounded"
                        onError={(e) => {
                          // Якщо фото не завантажилось
                          (e.target as HTMLImageElement).src =
                            "/placeholder.jpg";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {images.length === 0 && (
                <p className="text-gray-500 text-center py-8 border-2 border-dashed rounded-lg">
                  Поки немає доданих фото. Вставте посилання вище.
                </p>
              )}
            </div>
          </div>

          {/* Доступність та бронювання */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-blue-600" size={24} />
              <h2 className="text-lg font-semibold">Доступність квартири</h2>
            </div>

            {/* Сезон */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">
                Сезон (період, коли квартира здається)
              </h3>
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

            {/* Заброньовані дати */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Заброньовані дати</h3>
                <button
                  type="button"
                  onClick={addBookedPeriod}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                >
                  <Plus size={16} />
                  Додати період
                </button>
              </div>

              {bookedPeriods.length === 0 ? (
                <p className="text-gray-500 text-center py-4 border border-dashed rounded">
                  Немає заброньованих дат. Додайте періоди, коли квартира
                  зайнята.
                </p>
              ) : (
                <div className="space-y-3">
                  {bookedPeriods.map((period, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-50 p-3 rounded"
                    >
                      <input
                        type="date"
                        value={period.from}
                        onChange={(e) =>
                          updateBookedPeriod(index, "from", e.target.value)
                        }
                        className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Початок"
                      />
                      <span className="text-gray-500">—</span>
                      <input
                        type="date"
                        value={period.to}
                        onChange={(e) =>
                          updateBookedPeriod(index, "to", e.target.value)
                        }
                        className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Кінець"
                      />
                      <button
                        type="button"
                        onClick={() => removeBookedPeriod(index)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Підказка */}
            <p className="text-xs text-gray-500 mt-4">
              * Якщо сезон не вказано, квартира вважається доступною цілий рік.
              Заброньовані дати будуть заблоковані для нових замовлень.
            </p>
          </div>

          {/* Зручності */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Зручності</h2>

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
              {loading ? "Збереження..." : "Створити квартиру"}
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
