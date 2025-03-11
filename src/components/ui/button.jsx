export function Button({ children, variant = "default", onClick }) {
    const baseClass = "px-4 py-2 rounded-lg transition";
    const variantClass =
      variant === "ghost" ? "text-gray-600 hover:bg-gray-200" : "bg-blue-500 text-white hover:bg-blue-600";
  
    return (
      <button className={`${baseClass} ${variantClass}`} onClick={onClick}>
        {children}
      </button>
    );
  }
  