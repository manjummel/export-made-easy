import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Convert Lat/Lon to 3D Cartesian coordinates on a sphere of radius R
function latLonToVector3(lat, lon, radius = 1.0) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Color palette for high-tech supply trade corridors
const ROUTE_COLORS = {
  primary:   { line: '#38BDF8', glow: '#7DD3FC', node: '#0284C7' },   // Luminous Cyan / Sea Freight
  express:   { line: '#F59E0B', glow: '#FDE68A', node: '#D97706' },   // Amber / Express Air Cargo
  cepa:      { line: '#10B981', glow: '#6EE7B7', node: '#059669' },   // Emerald / 0% Concession Corridor
  highVol:   { line: '#EC4899', glow: '#F472B6', node: '#DB2777' },   // Pink / Heavy Industrial
  strategic: { line: '#8B5CF6', glow: '#C4B5FD', node: '#7C3AED' },   // Purple / Tech & Pharma
};

// Global Trade Hubs Network (Origin & 30+ Global Strategic Destinations)
export const TRADE_DESTINATIONS = [
  // Primary Indian Export Origin Clusters
  { id: 'india_jnpt', name: 'India (JNPT / Mumbai)', lat: 18.9496, lon: 72.9515, isOrigin: true, flag: '🇮🇳', role: 'Main Export Hub & ICEGATE Gateway' },

  // Key Global Supply Corridors
  { id: 'rotterdam', name: 'Rotterdam (EU Gateway)', lat: 51.9244, lon: 4.4777, flag: '🇳🇱', role: 'EU GSP 0% Duty Corridor', type: 'primary' },
  { id: 'dubai', name: 'Dubai / Jebel Ali', lat: 25.0069, lon: 55.0641, flag: '🇦🇪', role: 'CEPA 0% Preferential Lane', type: 'cepa' },
  { id: 'newyork', name: 'New York / JFK', lat: 40.7128, lon: -74.0060, flag: '🇺🇸', role: 'North America Trans-Atlantic Route', type: 'express' },
  { id: 'singapore', name: 'Singapore Port', lat: 1.29027, lon: 103.851959, flag: '🇸🇬', role: 'ASEAN Multimodal Gateway', type: 'primary' },
  { id: 'london', name: 'London Gateway / LHR', lat: 51.5074, lon: -0.1278, flag: '🇬🇧', role: 'Developing Countries Trading Scheme (DCTS)', type: 'strategic' },
  { id: 'tokyo', name: 'Tokyo / Yokohama', lat: 35.6762, lon: 139.6503, flag: '🇯🇵', role: 'India-Japan CEPA Route', type: 'strategic' },
  { id: 'sydney', name: 'Sydney Port Botany', lat: -33.8688, lon: 151.2093, flag: '🇦🇺', role: 'ECTA Trade Agreement 0% Duty', type: 'cepa' },
  { id: 'hamburg', name: 'Hamburg Port', lat: 53.5511, lon: 9.9937, flag: '🇩🇪', role: 'Central Europe Industrial Hub', type: 'primary' },
  { id: 'losangeles', name: 'Port of Los Angeles', lat: 33.7432, lon: -118.2673, flag: '🇺🇸', role: 'Trans-Pacific Freight Corridor', type: 'primary' },
  { id: 'jeddah', name: 'Jeddah Islamic Port', lat: 21.4858, lon: 39.1925, flag: '🇸🇦', role: 'Middle East & Red Sea Route', type: 'cepa' },
  { id: 'capetown', name: 'Cape Town Port', lat: -33.9249, lon: 18.4241, flag: '🇿🇦', role: 'SACU Strategic Trade Gateway', type: 'primary' },
  { id: 'santos', name: 'Santos (São Paulo)', lat: -23.9618, lon: -46.3322, flag: '🇧🇷', role: 'MERCOSUR Trade Lane', type: 'highVol' },
  { id: 'antwerp', name: 'Port of Antwerp', lat: 51.2194, lon: 4.4025, flag: '🇧🇪', role: 'European Petrochemical & Agro Corridor', type: 'primary' },
  { id: 'busan', name: 'Busan Port', lat: 35.1796, lon: 129.0756, flag: '🇰🇷', role: 'East Asia High-Tech Supply Route', type: 'strategic' },
  { id: 'shanghai', name: 'Shanghai Port', lat: 31.2304, lon: 121.4737, flag: '🇨🇳', role: 'East Asia Supply Chain', type: 'primary' },
  { id: 'lehavre', name: 'Le Havre Port', lat: 49.4944, lon: 0.1079, flag: '🇫🇷', role: 'French Maritime Gateway', type: 'primary' },
  { id: 'toronto', name: 'Toronto / Vancouver', lat: 43.6532, lon: -79.3832, flag: '🇨🇦', role: 'North America Trade Lane', type: 'express' },
  { id: 'mombasa', name: 'Port of Mombasa', lat: -4.0435, lon: 39.6682, flag: '🇰🇪', role: 'East Africa Trade Corridor', type: 'cepa' },
  { id: 'lagos', name: 'Lagos / Apapa Port', lat: 6.5244, lon: 3.3792, flag: '🇳🇬', role: 'West Africa Commercial Hub', type: 'primary' },
  { id: 'cairo', name: 'Alexandria / Cairo', lat: 31.2001, lon: 29.9187, flag: '🇪🇬', role: 'Suez Maritime Corridor', type: 'primary' },
  { id: 'istanbul', name: 'Istanbul Gateway', lat: 41.0082, lon: 28.9784, flag: '🇹🇷', role: 'Eurasian Commercial Transit', type: 'strategic' },
  { id: 'genoa', name: 'Port of Genoa', lat: 44.4056, lon: 8.9463, flag: '🇮🇹', role: 'Mediterranean Hub', type: 'primary' },
  { id: 'valencia', name: 'Port of Valencia', lat: 39.4699, lon: -0.3763, flag: '🇪🇸', role: 'Iberian Peninsula Trade Lane', type: 'primary' },
  { id: 'auckland', name: 'Port of Auckland', lat: -36.8485, lon: 174.7633, flag: '🇳🇿', role: 'Oceania Trade Network', type: 'strategic' },
  { id: 'bangkok', name: 'Bangkok / Laem Chabang', lat: 13.7563, lon: 100.5018, flag: '🇹🇭', role: 'Southeast Asia Supply Chain', type: 'primary' },
  { id: 'jakarta', name: 'Tanjung Priok (Jakarta)', lat: -6.2088, lon: 106.8456, flag: '🇮🇩', role: 'Indonesia Trade Hub', type: 'primary' },
  { id: 'buenosaires', name: 'Buenos Aires Port', lat: -34.6037, lon: -58.3816, flag: '🇦🇷', role: 'South America Atlantic Route', type: 'highVol' },
  { id: 'veracruz', name: 'Port of Veracruz', lat: 19.1738, lon: -96.1342, flag: '🇲🇽', role: 'Latin America North Connector', type: 'primary' },
  { id: 'valparaiso', name: 'Valparaíso Port', lat: -33.0472, lon: -71.6127, flag: '🇨🇱', role: 'Pacific Coast Trade Link', type: 'highVol' },
];

// Rich Dual-layer Atmospheric Glow (Planetary blue Rayleigh scattering)
function RealisticAtmosphereGlow() {
  return (
    <group>
      {/* Inner Rayleigh haze */}
      <mesh>
        <sphereGeometry args={[1.018, 64, 64]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Outer atmosphere halo */}
      <mesh>
        <sphereGeometry args={[1.06, 64, 64]} />
        <meshBasicMaterial
          color="#1D4ED8"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// 3D Parabolic Supply Trade Line with Traveling Pulse Particles
function SupplyTradeArc({ from, to, type = 'primary', isActive }) {
  const lineRef = useRef();
  const pulse1 = useRef(Math.random());
  const pulse2 = useRef((Math.random() + 0.5) % 1);
  const p1Ref = useRef();
  const p2Ref = useRef();

  const colors = ROUTE_COLORS[type] || ROUTE_COLORS.primary;

  const vFrom = useMemo(() => latLonToVector3(from.lat, from.lon, 1.004), [from]);
  const vTo = useMemo(() => latLonToVector3(to.lat, to.lon, 1.004), [to]);

  const { curve, geometry } = useMemo(() => {
    const points = [];
    const segments = 48;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const v = new THREE.Vector3().lerpVectors(vFrom, vTo, t);
      // Realistic parabolic altitude arc
      const altitude = 1.004 + 0.18 * Math.sin(Math.PI * t);
      points.push(v.normalize().multiplyScalar(altitude));
    }
    const c = new THREE.CatmullRomCurve3(points);
    const g = new THREE.BufferGeometry().setFromPoints(points);
    return { curve: c, geometry: g };
  }, [vFrom, vTo]);

  useFrame((_, delta) => {
    const speed = isActive ? 0.32 : 0.18;
    pulse1.current = (pulse1.current + delta * speed) % 1;
    pulse2.current = (pulse2.current + delta * (speed * 0.85)) % 1;

    if (p1Ref.current && curve) {
      p1Ref.current.position.copy(curve.getPoint(pulse1.current));
    }
    if (p2Ref.current && curve) {
      p2Ref.current.position.copy(curve.getPoint(pulse2.current));
    }
  });

  return (
    <group>
      {/* Route Arc Line */}
      <line geometry={geometry} ref={lineRef}>
        <lineBasicMaterial
          color={colors.line}
          transparent
          opacity={isActive ? 0.95 : 0.55}
          linewidth={isActive ? 2 : 1}
        />
      </line>

      {/* Primary Luminous Flow Particle */}
      <mesh ref={p1Ref}>
        <sphereGeometry args={[isActive ? 0.014 : 0.011, 12, 12]} />
        <meshBasicMaterial color={colors.glow} />
      </mesh>

      {/* Secondary Trailing Flow Particle */}
      <mesh ref={p2Ref}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshBasicMaterial color={colors.line} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

// Interactive Global Trade Node Pin on Earth
function TradeNodeMarker({ destination, isOrigin, isSelected, onHover, onSelect }) {
  const meshRef = useRef();
  const ringRef = useRef();
  const pos = useMemo(
    () => latLonToVector3(destination.lat, destination.lon, 1.01),
    [destination]
  );

  const colors = ROUTE_COLORS[destination.type] || ROUTE_COLORS.primary;
  const nodeColor = isOrigin ? '#38BDF8' : colors.line;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      const s = isOrigin
        ? 1 + 0.25 * Math.sin(t * 3)
        : isSelected
        ? 1.45
        : 1 + 0.1 * Math.sin(t * 2 + destination.lon);
      meshRef.current.scale.setScalar(s);
    }
    if (ringRef.current && (isOrigin || isSelected)) {
      const pulse = 1 + 0.35 * Math.sin(t * 2.5);
      ringRef.current.scale.setScalar(pulse);
      ringRef.current.material.opacity = 0.65 - 0.3 * Math.sin(t * 2.5);
    }
  });

  return (
    <group position={pos}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(destination);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(destination);
        }}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[isOrigin ? 0.024 : 0.015, 16, 16]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={isOrigin || isSelected ? 0.75 : 0.3}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {(isOrigin || isSelected) && (
        <mesh ref={ringRef}>
          <ringGeometry args={[0.026, 0.038, 32]} />
          <meshBasicMaterial
            color={nodeColor}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

// Realistic Blue-Marble Earth Globe
function RealisticEarthGlobe({ onHoverCountry, onSelectCountry, selectedCountry }) {
  const globeRef = useRef();

  // High-fidelity Realistic Blue Marble Satellite Texture with Natural Earth Colors
  const [blueMarbleMap] = useTexture([
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  ]);

  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.065;
    }
  });

  const originHub = TRADE_DESTINATIONS[0];
  const destinations = TRADE_DESTINATIONS.filter((d) => !d.isOrigin);

  return (
    <group ref={globeRef} scale={[0.72, 0.72, 0.72]} position={[0, -0.05, 0]}>
      {/* 1. Realistic Blue Marble Earth Sphere */}
      <mesh receiveShadow castShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          map={blueMarbleMap}
          specular={new THREE.Color('#1e4976')}
          shininess={18}
        />
      </mesh>

      {/* 2. Realistic Rayleigh Atmospheric Glow */}
      <RealisticAtmosphereGlow />

      {/* 3. Dense Network of Global Supply Trade Lines */}
      {destinations.map((dest) => (
        <SupplyTradeArc
          key={`arc-${dest.id}`}
          from={originHub}
          to={dest}
          type={dest.type}
          isActive={selectedCountry?.id === dest.id}
        />
      ))}

      {/* 4. Strategic Destination Node Markers */}
      {TRADE_DESTINATIONS.map((dest) => (
        <TradeNodeMarker
          key={`node-${dest.id}`}
          destination={dest}
          isOrigin={dest.isOrigin}
          isSelected={selectedCountry?.id === dest.id}
          onHover={onHoverCountry}
          onSelect={onSelectCountry}
        />
      ))}
    </group>
  );
}

// Starry Ambient Particles
function AmbientStarryDust() {
  const pointsRef = useRef();

  const particles = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 200; i++) {
      const r = 1.15 + Math.random() * 0.4;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      pts.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
    }
    return new Float32Array(pts);
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.03;
      pointsRef.current.rotation.x += delta * 0.015;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.008}
        color="#BAE6FD"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

export default function GlobeScene({
  onSelectCountry = () => {},
  selectedCountry = null,
  className = '',
}) {
  const [hoveredCountry, setHoveredCountry] = useState(null);

  return (
    <div className={`relative w-full h-full select-none ${className}`}>
      {/* Tooltip on Port Hover */}
      {hoveredCountry && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all">
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[var(--color-surface-card)] backdrop-blur-md border border-[var(--color-border-base)] shadow-md">
            <span className="text-sm">{hoveredCountry.flag}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-bold text-[var(--color-primary)]">{hoveredCountry.name}</span>
              <span className="text-[10px] text-[var(--color-muted)] font-medium">· {hoveredCountry.role}</span>
            </div>
            {hoveredCountry.isOrigin && (
              <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-800">
                Origin
              </span>
            )}
          </div>
        </div>
      )}

      {/* Subtle India Origin Badge at Bottom */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface-card)] backdrop-blur-md border border-[var(--color-border-base)] shadow-xs text-xs">
          <span>🇮🇳</span>
          <span className="font-bold text-[var(--color-primary)] text-[11px]">India (JNPT / Mundra Hub)</span>
          <span className="text-muted">·</span>
          <span className="text-[var(--color-muted)] text-[10px] font-medium">30+ Global Supply Lines Active</span>
        </div>
      </div>

      <Canvas
        camera={{ position: [0, 0.12, 2.05], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Realistic Sunlight Lighting */}
        <ambientLight intensity={0.65} color="#e0f2fe" />
        <directionalLight position={[4, 3, 5]} intensity={1.8} color="#fffcf0" />
        <directionalLight position={[-4, -1, -3]} intensity={0.45} color="#38bdf8" />
        <pointLight position={[0, 3, 0]} intensity={0.3} color="#ffffff" />

        <Suspense fallback={null}>
          <RealisticEarthGlobe
            onHoverCountry={setHoveredCountry}
            onSelectCountry={onSelectCountry}
            selectedCountry={selectedCountry}
          />
          <group scale={[0.75, 0.75, 0.75]}>
            <AmbientStarryDust />
          </group>
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!hoveredCountry}
          autoRotateSpeed={0.7}
          rotateSpeed={0.5}
          minPolarAngle={Math.PI * 0.28}
          maxPolarAngle={Math.PI * 0.68}
        />
      </Canvas>
    </div>
  );
}
