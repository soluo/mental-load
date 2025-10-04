export type MemberColor =
  | "orange"
  | "blue"
  | "pink"
  | "green"
  | "purple"
  | "red"
  | "yellow"
  | "indigo";

export const MEMBER_COLORS: MemberColor[] = [
  "orange",
  "blue",
  "pink",
  "green",
  "purple",
  "red",
  "yellow",
  "indigo",
];

interface ColorClasses {
  bg: string;
  text: string;
  border: string;
}

export function getMemberColorClasses(color?: string | null): ColorClasses {
  if (!color) {
    return {
      bg: "bg-muted",
      text: "text-muted-foreground",
      border: "border-muted-foreground/20",
    };
  }

  const colorMap: Record<MemberColor, ColorClasses> = {
    orange: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-700/20" },
    blue: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-700/20" },
    pink: { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-700/20" },
    green: { bg: "bg-green-100", text: "text-green-700", border: "border-green-700/20" },
    purple: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-700/20" },
    red: { bg: "bg-red-100", text: "text-red-700", border: "border-red-700/20" },
    yellow: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-700/20" },
    indigo: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-700/20" },
  };

  return (
    colorMap[color as MemberColor] || {
      bg: "bg-muted",
      text: "text-muted-foreground",
      border: "border-muted-foreground/20",
    }
  );
}
