import React from "react";
import {
  Wallet,
  Gift,
  Utensils,
  Car,
  ShoppingCart,
  Receipt,
  Briefcase,
  Heart,
  GraduationCap,
  Coffee,
  Home,
  Smartphone,
  TrendingUp,
  PiggyBank,
  CreditCard,
  Film,
  Tag,
  type LucideProps,
} from "lucide-react";

export const AVAILABLE_ICONS: { name: string; label: string; component: React.ComponentType<LucideProps> }[] = [
  { name: "wallet", label: "Dompet", component: Wallet },
  { name: "piggy-bank", label: "Tabungan", component: PiggyBank },
  { name: "trending-up", label: "Investasi", component: TrendingUp },
  { name: "gift", label: "Hadiah/Bonus", component: Gift },
  { name: "briefcase", label: "Pekerjaan", component: Briefcase },
  { name: "credit-card", label: "Kartu/Gaji", component: CreditCard },
  { name: "utensils", label: "Makanan", component: Utensils },
  { name: "coffee", label: "Kopi/Nongkrong", component: Coffee },
  { name: "shopping-cart", label: "Belanja", component: ShoppingCart },
  { name: "car", label: "Transportasi", component: Car },
  { name: "home", label: "Tempat Tinggal", component: Home },
  { name: "receipt", label: "Tagihan", component: Receipt },
  { name: "smartphone", label: "Pulsa/Internet", component: Smartphone },
  { name: "heart", label: "Kesehatan", component: Heart },
  { name: "graduation-cap", label: "Pendidikan", component: GraduationCap },
  { name: "film", label: "Hiburan", component: Film },
  { name: "tag", label: "Lainnya", component: Tag },
];

export const PRESET_COLORS = [
  "#16a34a", // emerald
  "#059669", // teal
  "#0284c7", // light blue
  "#2563eb", // blue
  "#4f46e5", // indigo
  "#7c3aed", // violet
  "#c026d3", // fuchsia
  "#db2777", // pink
  "#dc2626", // red
  "#ea580c", // orange
  "#d97706", // amber
  "#64748b", // slate
];

interface Props extends LucideProps {
  name?: string;
}

export function CategoryIcon({ name, ...props }: Props) {
  const found = AVAILABLE_ICONS.find((i) => i.name === name);
  const IconComponent = found ? found.component : Tag;
  return <IconComponent {...props} />;
}
