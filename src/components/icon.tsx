import {
  MapPin,
  Phone,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock3,
  Navigation,
  Cake,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Quote,
  Users,
  Zap,
  Mountain,
  Ticket,
  Mail,
  Play,
  Pause,
  LoaderCircle,
} from "lucide-react";

const icons = {
  pin: MapPin,
  phone: Phone,
  menu: Menu,
  close: X,
  down: ChevronDown,
  left: ChevronLeft,
  right: ChevronRight,
  check: Check,
  clock: Clock3,
  navigation: Navigation,
  cake: Cake,
  sparkles: Sparkles,
  shield: ShieldCheck,
  chat: MessageCircle,
  quote: Quote,
  users: Users,
  zap: Zap,
  mountain: Mountain,
  ticket: Ticket,
  mail: Mail,
  play: Play,
  pause: Pause,
  loading: LoaderCircle,
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

export function WhatsAppIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.5 11.6a8.5 8.5 0 0 1-12.7 7.5L3 20.5l1.4-4.6a8.5 8.5 0 1 1 16.1-4.3Z" />
      <path d="m8.5 7.6 1.4 2.2-1.1 1.1a8.4 8.4 0 0 0 4.2 4.2l1.1-1.1 2.2 1.4c-.2 1.2-1 1.8-2.2 1.6-3.9-.7-6.6-3.4-7.3-7.3-.2-1.2.4-2 1.7-2.1Z" />
    </svg>
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
