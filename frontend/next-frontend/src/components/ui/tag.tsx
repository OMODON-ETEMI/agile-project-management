interface TagProps {
  text: string;
  variant?: "blue" | "green" | "red" | "slate";
}

const variantClasses = {
  blue: "bg-blue-900 text-blue-300",
  green: "bg-green-900 text-green-300",
  red: "bg-red-900 text-red-300",
  slate: "bg-slate-800 text-slate-300",
};

export default function Tag({ text, variant = "slate" }: TagProps) {
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${variantClasses[variant]}`}>
      {text}
    </span>
  );
}
