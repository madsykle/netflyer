import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Image 
        src="/logo.png" 
        alt="Loading" 
        width={64} 
        height={64} 
        className="animate-pulse drop-shadow-[0_0_15px_rgba(229,9,20,0.5)]" 
        priority
      />
    </div>
  );
}