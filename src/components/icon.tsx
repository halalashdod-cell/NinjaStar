import {
  MapPin,
  Phone,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  Check,
  Clock3,
  Navigation,
  Cake,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Plus,
  Users,
  Zap,
  Mountain,
  Ticket,
  Mail,
} from "lucide-react";

const icons = {
  pin: MapPin,
  phone: Phone,
  menu: Menu,
  close: X,
  down: ChevronDown,
  left: ChevronLeft,
  check: Check,
  clock: Clock3,
  navigation: Navigation,
  cake: Cake,
  sparkles: Sparkles,
  shield: ShieldCheck,
  chat: MessageCircle,
  plus: Plus,
  users: Users,
  zap: Zap,
  mountain: Mountain,
  ticket: Ticket,
  mail: Mail,
};
export function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: keyof typeof icons;
  size?: number;
  className?: string;
}) {
  const Component = icons[name];
  return (
    <Component
      size={size}
      strokeWidth={1.7}
      className={className}
      aria-hidden="true"
    />
  );
}

export function NinjaStar({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M50 0 60 31 88 12 69 40 100 50 69 60 88 88 60 69 50 100 40 69 12 88 31 60 0 50 31 40 12 12 40 31Z" />
    </svg>
  );
}
