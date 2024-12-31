// components/bisect-logo.tsx
export function BisectLogo({ className = "h-8 w-8" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                {/* <!-- Background circle --> */}
                <circle cx="50" cy="50" r="45" fill="#f8fafc" stroke="#3b82f6" strokeWidth="2" />

                {/* <!-- Bisection lines --> */}
                <line x1="25" y1="50" x2="75" y2="50" stroke="#3b82f6" strokeWidth="3" />
                <line x1="50" y1="25" x2="50" y2="75" stroke="#3b82f6" strokeWidth="3" />

                {/* <!-- Accent circles --> */}
                <circle cx="50" cy="50" r="4" fill="#3b82f6" />
                <circle cx="25" cy="50" r="3" fill="#3b82f6" />
                <circle cx="75" cy="50" r="3" fill="#3b82f6" />
                <circle cx="50" cy="25" r="3" fill="#3b82f6" />
                <circle cx="50" cy="75" r="3" fill="#3b82f6" />

                {/* <!-- Curved connectors --> */}
                <path d="M 28 50 Q 50 35 72 50" fill="none" stroke="#93c5fd" strokeWidth="1.5" />
                <path d="M 50 28 Q 65 50 50 72" fill="none" stroke="#93c5fd" strokeWidth="1.5" />
            </svg>
        </svg>
    );
}