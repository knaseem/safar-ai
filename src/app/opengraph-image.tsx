import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "SafarAI - Your AI Travel Concierge";
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 128,
                    background: "black",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontFamily: "sans-serif", // We can use custom fonts if loaded, but sans-serif is safe
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 40,
                    }}
                >
                    {/* Emerald Accent Circle */}
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: '#10b981', // emerald-500
                        marginRight: 20,
                    }} />
                    <span style={{ fontWeight: 800, letterSpacing: '-0.05em' }}>SafarAI</span>
                </div>
                <div
                    style={{
                        fontSize: 40,
                        background: "linear-gradient(90deg, #34d399, #10b981)",
                        backgroundClip: "text",
                        color: "transparent",
                        fontWeight: 600,
                        marginTop: 20,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                    }}
                >
                    Your AI Travel Concierge
                </div>

                {/* Subtle grid background pattern simulation */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'radial-gradient(circle at 25px 25px, #333 2%, transparent 0%), radial-gradient(circle at 75px 75px, #333 2%, transparent 0%)',
                    backgroundSize: '100px 100px',
                    opacity: 0.2,
                    zIndex: -1,
                }} />
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
