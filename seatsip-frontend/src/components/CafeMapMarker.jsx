import { useState, useRef, useEffect } from "react";

const CIRCUMFERENCE = 2 * Math.PI * 21;

const cafes = [
  { id: 1, name: "Kapi Kafe", x: 130, y: 275, size: 42, active: true },
  { id: 2, name: "Dyu Art Café", x: 220, y: 120, size: 34, active: false },
  { id: 3, name: "Third Wave Coffee", x: 290, y: 145, size: 34, active: false },
  { id: 4, name: "Roast Lane", x: 80, y: 160, size: 34, active: false },
];

const galleryImages = [
  { src: require("../assets/images/home_hero.jpg"), alt: "Cafe interior", ar: "4/3" },
  { src: require("../assets/images/brew_banner.png"), alt: "Latte art", ar: "3/4" },
  { src: require("../assets/images/dessert_banner.png"), alt: "Pastries", ar: "2/3" },
  { src: require("../assets/images/food_banner.png"), alt: "Outdoor seating", ar: "1/1" },
  { src: require("../assets/images/matcha_banner.png"), alt: "Coffee beans", ar: "2/3" },
];

function MapSVG() {
  return (
    <svg width="390" height="560" viewBox="0 0 390 560" xmlns="http://www.w3.org/2000/svg">
      <rect width="390" height="560" fill="#e5ddd2" />
      <rect x="160" y="0" width="60" height="560" fill="#f0ede8" />
      <rect x="0" y="200" width="390" height="55" fill="#f0ede8" />
      <rect x="0" y="380" width="390" height="55" fill="#f0ede8" />
      <rect x="280" y="0" width="50" height="560" fill="#f0ede8" />
      <rect x="20" y="80" width="100" height="70" fill="#ddd6cc" rx="4" />
      <rect x="20" y="170" width="60" height="50" fill="#ddd6cc" rx="4" />
      <rect x="90" y="160" width="50" height="60" fill="#ddd6cc" rx="4" />
      <rect x="35" y="280" width="80" height="60" fill="#ddd6cc" rx="4" />
      <rect x="35" y="360" width="60" height="50" fill="#ddd6cc" rx="4" />
      <rect x="35" y="460" width="100" height="60" fill="#ddd6cc" rx="4" />
      <rect x="250" y="80" width="110" height="80" fill="#ddd6cc" rx="4" />
      <rect x="250" y="260" width="110" height="80" fill="#ddd6cc" rx="4" />
      <rect x="180" y="260" width="50" height="80" fill="#ddd6cc" rx="4" />
      <rect x="180" y="80" width="50" height="80" fill="#ddd6cc" rx="4" />
      <rect x="250" y="460" width="110" height="80" fill="#ddd6cc" rx="4" />
      <rect x="250" y="360" width="110" height="80" fill="#ddd6cc" rx="4" />
      <rect x="35" y="148" width="10" height="10" fill="#c44" rx="2" />
      <text x="50" y="158" fontSize="9" fill="#b33" fontWeight="600">Sunayana Eye Hospital</text>
      <text x="225" y="320" fontSize="9" fill="#888" transform="rotate(-90,225,320)">26th A Main road</text>
      <text x="158" y="430" fontSize="9" fill="#888" transform="rotate(-90,158,430)">26th Main Road</text>
      <rect x="355" y="340" width="26" height="66" fill="rgba(0,0,0,0.06)" rx="4" />
      <rect x="358" y="344" width="20" height="18" rx="3" fill="#fff" stroke="#ccc" strokeWidth="0.5" />
      <text x="368" y="356" fontSize="14" fill="#333" textAnchor="middle" dominantBaseline="middle">+</text>
      <rect x="358" y="364" width="20" height="18" rx="3" fill="#fff" stroke="#ccc" strokeWidth="0.5" />
      <text x="368" y="373" fontSize="14" fill="#333" textAnchor="middle" dominantBaseline="middle">−</text>
      <rect x="358" y="385" width="20" height="18" rx="3" fill="#fff" stroke="#ccc" strokeWidth="0.5" />
      <text x="368" y="393" fontSize="10" fill="#333" textAnchor="middle" dominantBaseline="middle">▲</text>
      <rect x="240" y="530" width="60" height="16" rx="3" fill="rgba(255,255,255,0.85)" stroke="#ccc" strokeWidth="0.5" />
      <text x="270" y="541" fontSize="9" fill="#333" textAnchor="middle">50 m</text>
      <rect x="358" y="250" width="24" height="80" fill="rgba(200,230,200,0.5)" rx="3" />
      <text x="370" y="295" fontSize="8" fill="#5a8a5a" textAnchor="middle">🌳</text>
      <text x="370" y="306" fontSize="7" fill="#5a8a5a" textAnchor="middle">Park</text>
    </svg>
  );
}

function CafeMarker({ cafe, onTap }) {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const animRef = useRef(null);

  const handleClick = () => {
    if (isLoading) return;
    setIsLoading(true);
    setProgress(0);

    const startTime = performance.now();
    const duration = 1400;

    const animate = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      setProgress(p);
      if (p < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          onTap(cafe);
          setProgress(0);
          setIsLoading(false);
        }, 80);
      }
    };
    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const offset = CIRCUMFERENCE * (1 - progress);
  const isActive = cafe.active;

  return (
    <div
      onClick={handleClick}
      style={{
        position: "absolute",
        left: cafe.x,
        top: cafe.y,
        width: cafe.size,
        height: cafe.size,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {isActive && (
        <svg
          style={{
            position: "absolute",
            top: -6,
            left: -6,
            width: cafe.size + 12,
            height: cafe.size + 12,
            opacity: isLoading ? 1 : 0,
            transition: "opacity 0.2s",
            pointerEvents: "none",
          }}
          viewBox="0 0 54 54"
        >
          <circle
            cx="27" cy="27" r="21"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="4"
          />
          <circle
            cx="27" cy="27" r="21"
            fill="none"
            stroke="#ff7a3d"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{
              transformOrigin: "center",
              transform: "rotate(-90deg)",
            }}
          />
        </svg>
      )}
      <div
        style={{
          width: cafe.size,
          height: cafe.size,
          borderRadius: "50%",
          background: "#ff7a3d",
          border: `${isActive ? 3 : 2}px solid #fff`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: isActive ? 14 : 12,
          color: "#fff",
          boxShadow: isActive
            ? "0 10px 24px rgba(0,0,0,0.32)"
            : "0 6px 16px rgba(0,0,0,0.24)",
          transform: isLoading ? "scale(0.95)" : "scale(1)",
          transition: "transform 0.15s",
          position: "relative",
          zIndex: 2,
        }}
      >
        C
      </div>
    </div>
  );
}

function GalleryView({ onClose }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#fff8f5",
        overflowY: "auto",
        zIndex: 50,
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(255,248,245,0.92)",
          backdropFilter: "blur(8px)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "0.5px solid rgba(0,0,0,0.06)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#fff",
            border: "1px solid #e8ddd5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span style={{ fontSize: 16, fontWeight: 800, color: "#1a0e0a" }}>
          The Cozy Bean Cafe
        </span>
        <button
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#fff",
            border: "1px solid #e8ddd5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e23744" strokeWidth="2" strokeLinecap="round">
            <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      {/* Universal Card Grid */}
      <div
        style={{
          padding: '8px 12px 32px',
        }}
      >
        {galleryImages.map((item, i) => (
          <div
            key={i}
            style={{
              flexDirection: "row",
              backgroundColor: "#fff",
              borderRadius: 24,
              padding: 16,
              marginBottom: 16,
              marginHorizontal: 16,
              alignItems: "flex-start",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {/* Left Image */}
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: 20,
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <img
                src={item.src}
                alt={item.alt}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {/* Center Content */}
            <div
              style={{
                flex: 1,
                marginLeft: 14,
                justifyContent: "space-between",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Popular Badge */}
              <div
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "#F6E9DD",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 20,
                  marginBottom: 6,
                }}
              >
                <span style={{ color: "#6B3F1A", fontSize: 13, fontWeight: "700" }}>
                  ★ Popular
                </span>
              </div>

              {/* Title */}
              <div
                style={{
                  fontSize: 30,
                  fontWeight: "700",
                  color: "#111",
                  marginBottom: 4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.alt}
              </div>

              {/* Description */}
              <div
                style={{
                  fontSize: 18,
                  color: "#666",
                  lineHeight: "22px",
                  marginBottom: 10,
                  width: "95%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {item.alt}
              </div>

              {/* Tags */}
              <div
                style={{
                  flexDirection: "row",
                  flexWrap: "nowrap",
                  alignItems: "center",
                  display: "flex",
                }}
              >
                {["Espresso", "with Milk"].slice(0, 3).map((tag, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: "#F1ECE6",
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 12,
                      marginRight: 6,
                      maxWidth: 80,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color: "#555",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                      }}
                    >
                      {tag}
                    </span>
                  </div>
                ))}

                {/* Calories */}
                <div
                  style={{
                    backgroundColor: "#DDF3DD",
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 12,
                  }}
                >
                  <span style={{ color: "#2E7D32", fontSize: 13, fontWeight: "600" }}>
                    120 cal
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div
              style={{
                justifyContent: "space-between",
                alignItems: "flex-end",
                height: 110,
                marginLeft: 10,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Favorite */}
              <button
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: "#FDEEEE",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 18 }}>♡</span>
              </button>

              {/* Price */}
              <div
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: "#111",
                  marginTop: 8,
                }}
              >
                ₹180
              </div>

              {/* Add Button */}
              <button
                style={{
                  backgroundColor: "#7B4A1E",
                  color: "#fff",
                  border: "none",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 18,
                  marginTop: 8,
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                Add +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CafeMap() {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedCafe, setSelectedCafe] = useState(null);

  const handleMarkerTap = (cafe) => {
    setSelectedCafe(cafe);
    setGalleryOpen(true);
  };

  return (
    <div
      style={{
        width: 390,
        height: 700,
        position: "relative",
        overflow: "hidden",
        background: "#f5f0e8",
        borderRadius: 20,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Map Layer */}
      <div style={{ position: "absolute", inset: 0 }}>
        {/* Top Header */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            zIndex: 10,
            padding: "12px 16px",
            display: "flex",
            gap: 10,
          }}
        >
          <button
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#2a1f1a", borderRadius: 40, padding: "10px 14px",
              border: "none", cursor: "pointer",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2" strokeLinecap="round">
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ fontSize: 9, letterSpacing: "0.08em", color: "#e63946", textTransform: "uppercase", fontWeight: 700 }}>FoodMap</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#f5edd6" }}>Bengaluru ▾</span>
            </div>
          </button>
          <div
            style={{
              flex: 1, background: "#f5edd6", borderRadius: 40,
              padding: "10px 16px", fontSize: 14, color: "#8e7f70",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e7f70" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.34-4.34" />
            </svg>
            Search food places
          </div>
        </div>

        {/* Filter Pills */}
        <div
          style={{
            position: "absolute", top: 68, left: 0, right: 0,
            zIndex: 10, display: "flex", gap: 8, padding: "8px 16px",
          }}
        >
          {["All", "Cafes", "Restaurants"].map((label, i) => (
            <button
              key={label}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 40,
                fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer",
                background: i === 0 ? "#e63946" : "#f5edd6",
                color: i === 0 ? "#fff" : "#2a1a0e",
                ...(i !== 0 && { border: "1.5px solid #ddd0c4" }),
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Map Canvas */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 70 }}>
          <MapSVG />
          {cafes.map((cafe) => (
            <CafeMarker key={cafe.id} cafe={cafe} onTap={handleMarkerTap} />
          ))}
        </div>

        {/* Bottom Nav */}
        <div
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 70,
            background: "#2a1f1a", display: "flex", alignItems: "center",
            justifyContent: "space-around", padding: "0 16px 8px",
            borderRadius: "0 0 20px 20px", zIndex: 10,
          }}
        >
          {[
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,237,214,0.6)" strokeWidth="1.5" strokeLinecap="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>,
            "MAP_PILL",
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,237,214,0.6)" strokeWidth="1.5" strokeLinecap="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>,
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,237,214,0.6)" strokeWidth="1.5" strokeLinecap="round"><path d="M12 7v14" /><path d="M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" /><path d="M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5" /><rect x="3" y="7" width="18" height="4" rx="1" /></svg>,
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,237,214,0.6)" strokeWidth="1.5" strokeLinecap="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
          ].map((item, i) =>
            item === "MAP_PILL" ? (
              <div key={i} style={{ background: "#f5edd6", borderRadius: 40, padding: "8px 20px", display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2a1a0e" strokeWidth="2" strokeLinecap="round">
                  <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
                  <path d="M15 5.764v15M9 3.236v15" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#2a1a0e" }}>Map</span>
              </div>
            ) : (
              <div key={i}>{item}</div>
            )
          )}
        </div>
      </div>

      {/* Gallery Slide-in */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 50,
          transform: galleryOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {galleryOpen && (
          <GalleryView onClose={() => setGalleryOpen(false)} />
        )}
      </div>
    </div>
  );
}
