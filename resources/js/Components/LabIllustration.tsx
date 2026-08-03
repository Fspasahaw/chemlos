export function LabIllustration({ className = '' }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 400 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="flaskGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                </linearGradient>
                <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                </linearGradient>
            </defs>

            {/* Atom / molecule background */}
            <circle cx="320" cy="70" r="22" fill="url(#flaskGrad)" />
            <circle cx="360" cy="90" r="14" fill="url(#flaskGrad)" />
            <circle cx="300" cy="100" r="10" fill="url(#flaskGrad)" />
            <path d="M320 70 L360 90 M360 90 L300 100 M300 100 L320 70" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

            {/* Stand and test tubes */}
            <rect x="40" y="160" width="8" height="140" rx="4" fill="rgba(255,255,255,0.25)" />
            <rect x="20" y="160" width="100" height="8" rx="4" fill="rgba(255,255,255,0.25)" />

            <path d="M52 165 L52 110" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
            <path d="M52 110 L42 110 L42 155" stroke="rgba(255,255,255,0.25)" strokeWidth="2" fill="none" />
            <rect x="38" y="155" width="14" height="40" rx="7" fill="url(#liquidGrad)" />

            <path d="M80 165 L80 110" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
            <path d="M80 110 L70 110 L70 155" stroke="rgba(255,255,255,0.25)" strokeWidth="2" fill="none" />
            <rect x="66" y="145" width="14" height="50" rx="7" fill="url(#liquidGrad)" />

            <path d="M108 165 L108 110" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
            <path d="M108 110 L98 110 L98 155" stroke="rgba(255,255,255,0.25)" strokeWidth="2" fill="none" />
            <rect x="94" y="150" width="14" height="45" rx="7" fill="url(#liquidGrad)" />

            {/* Erlenmeyer flask */}
            <path
                d="M160 280 L200 120 L240 280 Z"
                fill="url(#flaskGrad)"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
            />
            <path
                d="M170 260 L190 160 L230 260 Z"
                fill="url(#liquidGrad)"
            />
            <rect x="190" y="100" width="20" height="25" rx="2" fill="rgba(255,255,255,0.25)" />

            {/* Bubbles */}
            <circle cx="200" cy="230" r="4" fill="rgba(255,255,255,0.35)">
                <animate attributeName="cy" values="230;190;230" dur="4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.35;0;0.35" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="210" cy="240" r="3" fill="rgba(255,255,255,0.3)">
                <animate attributeName="cy" values="240;170;240" dur="5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="5s" repeatCount="indefinite" />
            </circle>
            <circle cx="195" cy="250" r="2" fill="rgba(255,255,255,0.25)">
                <animate attributeName="cy" values="250;180;250" dur="6s" repeatCount="indefinite" />
            </circle>

            {/* Beaker */}
            <path
                d="M260 120 H340 V260 C340 275 330 285 315 285 H285 C270 285 260 275 260 260 V120 Z"
                fill="url(#flaskGrad)"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
            />
            <rect x="262" y="220" width="76" height="62" fill="url(#liquidGrad)" />
            <line x1="280" y1="140" x2="280" y2="260" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="6 4" />
            <line x1="320" y1="140" x2="320" y2="260" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="6 4" />
        </svg>
    );
}
