import { useState, useEffect } from "react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsFading(true);
            setTimeout(onComplete, 1000); // Wait for fade animation
        }, 2500);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-1000 ${isFading ? "opacity-0" : "opacity-100"}`}>
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <h1 className="text-8xl md:text-9xl font-playfair text-charcoal animate-breath tracking-tighter">
                        Elite
                    </h1>
                    <div className="absolute -inset-4 border border-gold/20 rounded-full animate-pulse" />
                </div>

                <div className="flex flex-col items-center gap-2">
                    <p className="text-sm md:text-base font-inter tracking-[0.4em] text-charcoal/60 uppercase ml-[0.4em]">
                        Academic Manager
                    </p>
                    <div className="h-[1px] w-12 bg-gold/40" />
                    <p className="text-xs italic font-playfair text-gold/80 mt-2">
                        Refining the Student Experience
                    </p>
                </div>
            </div>
        </div>
    );
}
