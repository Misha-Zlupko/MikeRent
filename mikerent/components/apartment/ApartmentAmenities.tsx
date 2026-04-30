import { 
  Wifi, 
  Wind, 
  ChefHat, 
  Utensils, 
  Armchair, 
  Tv, 
  Car, 
  Mountain, 
  Waves, 
  Droplets,
  Clock,
  CalendarCheck,
  Vault,
  Ban,
  Smile,
  UserCheck,
  Home,
  Info,
  Flame,
  Trees,
  Bed,
  AirVent,
  Shirt,
  CookingPot,
  Bath,
  Briefcase,
  Dumbbell,
  Coffee,
    Refrigerator,
  Microwave,
  ThermometerSun,
  Fan,
  Sofa,
  Video,
  WashingMachine
} from "lucide-react";

type Props = {
  amenities: string[];
};

const amenityIcons: Record<string, any> = {
  // Існуючі
  wifi: Wifi,
  airConditioner: Wind,
  kitchen: ChefHat,
  dishes: Utensils,
  washingMachine: Armchair,
  tv: Tv,
  parking: Car,
  balcony: Mountain,
  seaView: Waves,
  pool: Droplets,
  
  // Нові зручності
  grill: Flame,
  gazebo: Trees,
  bedLinen: Bed,
  fans: Fan,
  pillows: Sofa,
  elevator: Vault,
  sharedKitchen: CookingPot,
  bathroom: Bath,
  workspace: Briefcase,
  gym: Dumbbell,
  coffeeMachine: Coffee,
  refrigerator: Refrigerator,
  microwave: Microwave,
  heating: ThermometerSun,
  hairDryer: AirVent,
  iron: Shirt,
  conditionerCount: Wind,
  ventilator: Fan,
  smartTV: Video,
  dryer: WashingMachine,
  babyBed: Bed,
  towels: Shirt,
  shampoo: Droplets,
};

const amenityLabels: Record<string, string> = {
  // Існуючі
  wifi: "WiFi",
  airConditioner: "Кондиціонер",
  kitchen: "Кухня",
  dishes: "Посуд",
  washingMachine: "Пральна машина",
  tv: "Телевізор",
  parking: "Парковка",
  balcony: "Балкон",
  seaView: "Вид на море",
  pool: "Басейн",
  
  // Нові зручності
  grill: "Мангал",
  gazebo: "Альтанка",
  bedLinen: "Постільна білизна",
  fans: "Вентилятори",
  pillows: "Пухові подушки",
  elevator: "Ліфт",
  sharedKitchen: "Спільна кухня",
  bathroom: "Окремий санвузол",
  workspace: "Робоче місце",
  gym: "Тренажерний зал",
  coffeeMachine: "Кавомашина",
  refrigerator: "Холодильник",
  microwave: "Мікрохвильовка",
  heating: "Індивідуальне опалення",
  hairDryer: "Фен",
  iron: "Праска",
  conditionerCount: "2 кондиціонери",
  ventilator: "Вентилятор у ванній",
  smartTV: "Smart TV",
  dryer: "Сушарка для білизни",
  babyBed: "Дитяче ліжко",
  towels: "Рушники",
  shampoo: "Шампунь та гель",
};

export const ApartmentAmenities = ({ amenities }: Props) => {
  return (
    <div className="mt-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <Home size={20} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Зручності</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {amenities.map((a) => {
          const Icon = amenityIcons[a];
          const label = amenityLabels[a] || a;
          return (
            <div
              key={a}
              className="group flex items-center gap-3 rounded-xl bg-white p-3 transition-all duration-200 hover:shadow-md hover:border-blue-100 border border-transparent"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                {Icon ? <Icon size={16} /> : <span className="h-2 w-2 rounded-full bg-gray-400" />}
              </div>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};