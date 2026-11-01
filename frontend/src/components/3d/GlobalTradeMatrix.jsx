import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Convert Lat/Lon to 3D Cartesian coordinates on a sphere of radius R
export function latLonToVector3(lat, lon, radius = 1.0) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Major Global Export Corridors originating from India
export const EXPORT_HUBS = [
  {
    id: 'india',
    name: 'India (JNPT / Mumbai Hub)',
    city: 'Mumbai & Chennai',
    country: 'India',
    lat: 19.0760,
    lon: 72.8777,
    isOrigin: true,
    flag: '🇮🇳',
    code: 'IN-BOM',
    type: 'Origin Port',
    duty: 'ICEGATE EDI Gateway',
    seaTransit: 'Origin',
    airTransit: 'Origin',
    topProducts: 'Textiles, Pharmaceuticals, Engineering Goods, Agro',
    volume: '$450B+ Annual MSME Exports',
    color: '#3B82F6',
  },
  {
    id: 'rotterdam',
    name: 'Port of Rotterdam',
    city: 'Rotterdam',
    country: 'Netherlands / EU',
    lat: 51.9244,
    lon: 4.4777,
    flag: '🇳🇱',
    code: 'NL-RTM',
    type: 'Maritime Sea Port',
    mode: 'sea',
    duty: '0% Duty via EU-GSP Concession',
    seaTransit: '18-22 Days',
    airTransit: '14 Hours (AMS)',
    topProducts: 'Organic Chemicals, Footwear, Mechanical Appliances',
    volume: '€38.4B Trade Lane',
    color: '#06B6D4',
  },
  {
    id: 'dubai',
    name: 'Jebel Ali Port / DXB',
    city: 'Dubai',
    country: 'United Arab Emirates',
    lat: 25.2048,
    lon: 55.2708,
    flag: '🇦🇪',
    code: 'AE-DXB',
    type: 'Multimodal Hub',
    mode: 'both',
    duty: '0% Duty via India-UAE CEPA',
    seaTransit: '3-4 Days',
    airTransit: '3.5 Hours',
    topProducts: 'Gems & Jewellery, Spices, Electrical Machinery',
    volume: '$53.1B Trade Lane',
    color: '#F59E0B',
  },
  {
    id: 'newyork',
    name: 'Port of NY & NJ / JFK',
    city: 'New York',
    country: 'United States',
    lat: 40.7128,
    lon: -74.0060,
    flag: '🇺🇸',
    code: 'US-NYC',
    type: 'Air & Maritime Hub',
    mode: 'both',
    duty: 'MFN Tariff / DCTS Optimized',
    seaTransit: '24-28 Days',
    airTransit: '16 Hours',
    topProducts: 'Apparel, Marine Products, Diamond Cut, Software',
    volume: '$78.5B Trade Lane',
    color: '#10B981',
  },
  {
    id: 'singapore',
    name: 'Port of Singapore / SIN',
    city: 'Singapore',
    country: 'Singapore (ASEAN)',
    lat: 1.3521,
    lon: 103.8198,
    flag: '🇸🇬',
    code: 'SG-SIN',
    type: 'Transshipment Hub',
    mode: 'both',
    duty: '0% Duty via India-Singapore CECA',
    seaTransit: '5-7 Days',
    airTransit: '5.5 Hours',
    topProducts: 'Petroleum Products, Electronics, Organic Spices',
    volume: '$31.2B Trade Lane',
    color: '#8B5CF6',
  },
  {
    id: 'london',
    name: 'London Gateway / LHR',
    city: 'London',
    country: 'United Kingdom',
    lat: 51.5074,
    lon: -0.1278,
    flag: '🇬🇧',
    code: 'GB-LON',
    type: 'Express Air & Sea Hub',
    mode: 'both',
    duty: 'Developing Countries Trading Scheme (DCTS)',
    seaTransit: '20-23 Days',
    airTransit: '9.5 Hours',
    topProducts: 'Textiles, Auto Components, Basmati Rice',
    volume: '$22.8B Trade Lane',
    color: '#EC4899',
  },
  {
    id: 'tokyo',
    name: 'Port of Tokyo / NRT',
    city: 'Tokyo',
    country: 'Japan',
    lat: 35.6762,
    lon: 139.6503,
    flag: '🇯🇵',
    code: 'JP-TYO',
    type: 'High-Tech Corridor',
    mode: 'both',
    duty: 'India-Japan CEPA Preferential',
    seaTransit: '14-18 Days',
    airTransit: '8 Hours',
    topProducts: 'Marine Fish, Marine Shrimp, Pharma, Ferrous Metals',
    volume: '$19.6B Trade Lane',
    color: '#F43F5E',
  },
  {
    id: 'sydney',
    name: 'Port Botany / SYD',
    city: 'Sydney',
    country: 'Australia',
    lat: -33.8688,
    lon: 151.2093,
    flag: '🇦🇺',
    code: 'AU-SYD',
    type: 'Pacific Maritime Hub',
    mode: 'sea',
    duty: '0% Duty on 96% lines via ECTA',
    seaTransit: '16-20 Days',
    airTransit: '12.5 Hours',
    topProducts: 'Refined Petroleum, Meds, Railways, Leather',
    volume: '$24.1B Trade Lane',
    color: '#14B8A6',
  },
  {
    id: 'hamburg',
    name: 'Port of Hamburg',
    city: 'Hamburg',
    country: 'Germany',
    lat: 53.5511,
    lon: 9.9937,
    flag: '🇩🇪',
    code: 'DE-HAM',
    type: 'European Central Port',
    mode: 'sea',
    duty: 'EU Tariff Advantage',
    seaTransit: '21-25 Days',
    airTransit: '11 Hours (FRA)',
    topProducts: 'Turbines, Castings, Electrical Machinery, Tea',
    volume: '$28.9B Trade Lane',
    color: '#6366F1',
  },
  {
    id: 'losangeles',
    name: 'Port of Los Angeles (POLA)',
    city: 'Los Angeles',
    country: 'United States',
    lat: 33.7432,
    lon: -118.2673,
    flag: '🇺🇸',
    code: 'US-LAX',
    type: 'Pacific Gateway',
    mode: 'sea',
    duty: 'US-India Strategic Corridor',
    seaTransit: '26-30 Days',
    airTransit: '18 Hours',
    topProducts: 'Home Furnishings, Ceramics, Metal Hardware',
    volume: '$42.3B Trade Lane',
    color: '#38BDF8',
  },
  {
    id: 'capetown',
    name: 'Port of Cape Town',
    city: 'Cape Town',
    country: 'South Africa',
    lat: -33.9249,
    lon: 18.4241,
    flag: '🇿🇦',
    code: 'ZA-CPT',
    type: 'Southern African Gateway',
    mode: 'sea',
    duty: 'SACU Strategic Trade',
    seaTransit: '15-18 Days',
    airTransit: '11 Hours',
    topProducts: 'Vehicles, Pharma Drugs, Rice, Machinery',
    volume: '$14.2B Trade Lane',
    color: '#EAB308',
  },
];

// Atmospheric glow simulation
function AtmosphereGlow() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[1.025, 64, 64]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.07, 64, 64]} />
        <meshBasicMaterial
          color="#1D4ED8"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// 3D Air Cargo Plane Model
function CargoPlane3D({ color = '#FFFFFF' }) {
  return (
    <group scale={[0.015, 0.015, 0.015]}>
      {/* Fuselage */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.35, 2.2, 8]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Cockpit Cone */}
      <mesh position={[0, 0, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.2, 0.6, 8]} />
        <meshStandardMaterial color="#38BDF8" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Swept Wings */}
      <mesh position={[0, 0.05, 0.1]} rotation={[0, 0, 0]}>
        <boxGeometry args={[3.2, 0.05, 0.6]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Jet Engines */}
      <mesh position={[-0.8, -0.15, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.5, 8]} />
        <meshStandardMaterial color="#60A5FA" emissive="#3B82F6" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.8, -0.15, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.5, 8]} />
        <meshStandardMaterial color="#60A5FA" emissive="#3B82F6" emissiveIntensity={0.8} />
      </mesh>
      {/* Tail Fin */}
      <mesh position={[0, 0.35, -0.9]} rotation={[-Math.PI / 6, 0, 0]}>
        <boxGeometry args={[0.05, 0.7, 0.4]} />
        <meshStandardMaterial color="#EF4444" emissive="#DC2626" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// 3D Cargo Container Vessel
function CargoShip3D({ color = '#F59E0B' }) {
  return (
    <group scale={[0.014, 0.014, 0.014]}>
      {/* Hull */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.7, 0.3, 2.4]} />
        <meshStandardMaterial color="#1E293B" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Bow Cone */}
      <mesh position={[0, 0.1, 1.3]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.35, 0.6, 4]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>
      {/* Colored Container Stacks */}
      <mesh position={[-0.15, 0.35, 0.2]}>
        <boxGeometry args={[0.25, 0.25, 1.1]} />
        <meshStandardMaterial color="#EF4444" />
      </mesh>
      <mesh position={[0.15, 0.35, 0.2]}>
        <boxGeometry args={[0.25, 0.25, 1.1]} />
        <meshStandardMaterial color="#3B82F6" />
      </mesh>
      <mesh position={[0, 0.55, 0.1]}>
        <boxGeometry args={[0.45, 0.2, 0.9]} />
        <meshStandardMaterial color="#10B981" />
      </mesh>
      {/* Bridge / Cabin */}
      <mesh position={[0, 0.5, -0.8]}>
        <boxGeometry args={[0.5, 0.5, 0.4]} />
        <meshStandardMaterial color="#F8FAFC" emissive="#F8FAFC" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

// High-Altitude Parabolic Flight Corridor with Animated Jet
function AirFlightRoute({ from, to, isSelected, activeMode }) {
  const lineRef = useRef();
  const jetRef = useRef();
  const progress = useRef(Math.random());

  const vFrom = useMemo(() => latLonToVector3(from.lat, from.lon, 1.005), [from]);
  const vTo = useMemo(() => latLonToVector3(to.lat, to.lon, 1.005), [to]);

  const { curve, geometry } = useMemo(() => {
    const points = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const v = new THREE.Vector3().lerpVectors(vFrom, vTo, t);
      // Parabolic altitude arc for flight
      const altitude = 1.005 + 0.26 * Math.sin(Math.PI * t);
      points.push(v.normalize().multiplyScalar(altitude));
    }
    const c = new THREE.CatmullRomCurve3(points);
    const g = new THREE.BufferGeometry().setFromPoints(points);
    return { curve: c, geometry: g };
  }, [vFrom, vTo]);

  useFrame((_, delta) => {
    if (!curve) return;
    const speed = isSelected ? 0.22 : 0.14;
    progress.current = (progress.current + delta * speed) % 1;

    const currentPos = curve.getPoint(progress.current);
    const lookAhead = curve.getPoint((progress.current + 0.02) % 1);

    if (jetRef.current) {
      jetRef.current.position.copy(currentPos);
      jetRef.current.lookAt(lookAhead);
    }
  });

  const isVisible = activeMode === 'all' || activeMode === 'air';
  if (!isVisible) return null;

  return (
    <group>
      {/* Glowing Air Trail */}
      <line geometry={geometry} ref={lineRef}>
        <lineBasicMaterial
          color={to.color || '#38BDF8'}
          transparent
          opacity={isSelected ? 0.95 : 0.45}
          linewidth={isSelected ? 2 : 1}
        />
      </line>

      {/* Animated supersonic cargo plane */}
      <group ref={jetRef}>
        <CargoPlane3D color={to.color || '#FFFFFF'} />
        <pointLight color="#60A5FA" intensity={0.4} distance={0.15} />
      </group>
    </group>
  );
}

// Low-Altitude Maritime Shipping Lane with Animated Container Carrier
function SeaShippingLane({ from, to, isSelected, activeMode }) {
  const lineRef = useRef();
  const vesselRef = useRef();
  const progress = useRef((Math.random() + 0.5) % 1);

  const vFrom = useMemo(() => latLonToVector3(from.lat, from.lon, 1.004), [from]);
  const vTo = useMemo(() => latLonToVector3(to.lat, to.lon, 1.004), [to]);

  const { curve, geometry } = useMemo(() => {
    const points = [];
    const segments = 48;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const v = new THREE.Vector3().lerpVectors(vFrom, vTo, t);
      // Low altitude surface hugging arc for oceanic lanes
      const altitude = 1.004 + 0.04 * Math.sin(Math.PI * t);
      points.push(v.normalize().multiplyScalar(altitude));
    }
    const c = new THREE.CatmullRomCurve3(points);
    const g = new THREE.BufferGeometry().setFromPoints(points);
    return { curve: c, geometry: g };
  }, [vFrom, vTo]);

  useFrame((_, delta) => {
    if (!curve) return;
    const speed = isSelected ? 0.12 : 0.07;
    progress.current = (progress.current + delta * speed) % 1;

    const currentPos = curve.getPoint(progress.current);
    const lookAhead = curve.getPoint((progress.current + 0.02) % 1);

    if (vesselRef.current) {
      vesselRef.current.position.copy(currentPos);
      vesselRef.current.lookAt(lookAhead);
    }
  });

  const isVisible = activeMode === 'all' || activeMode === 'sea';
  if (!isVisible) return null;

  return (
    <group>
      {/* Dashed Oceanic Lane */}
      <line geometry={geometry} ref={lineRef}>
        <lineBasicMaterial
          color="#06B6D4"
          transparent
          opacity={isSelected ? 0.85 : 0.35}
        />
      </line>

      {/* Animated Cargo Ship */}
      <group ref={vesselRef}>
        <CargoShip3D color={to.color || '#F59E0B'} />
      </group>
    </group>
  );
}

// Interactive Global Export Port Beacon & Holographic Pillar
function PortBeacon({ hub, isOrigin, isSelected, onHover, onSelect }) {
  const meshRef = useRef();
  const ringRef = useRef();

  const pos = useMemo(
    () => latLonToVector3(hub.lat, hub.lon, 1.012),
    [hub]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      const scale = isOrigin
        ? 1 + 0.28 * Math.sin(t * 3.5)
        : isSelected
        ? 1.5
        : 1 + 0.12 * Math.sin(t * 2 + hub.lon);
      meshRef.current.scale.setScalar(scale);
    }

    if (ringRef.current) {
      const pulse = 1 + 0.45 * Math.sin(t * 2.5);
      ringRef.current.scale.setScalar(pulse);
      if (ringRef.current.material) {
        ringRef.current.material.opacity = 0.7 - 0.35 * Math.sin(t * 2.5);
      }
    }
  });

  const beaconColor = isOrigin ? '#3B82F6' : (isSelected ? '#F59E0B' : (hub.color || '#60A5FA'));

  return (
    <group position={pos}>
      {/* Core Node Ball */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(hub);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(hub);
        }}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[isOrigin ? 0.028 : 0.019, 16, 16]} />
        <meshStandardMaterial
          color={beaconColor}
          emissive={beaconColor}
          emissiveIntensity={isSelected || isOrigin ? 0.8 : 0.35}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Holographic Vertical Light Pillar */}
      <mesh position={[0, isOrigin ? 0.08 : 0.05, 0]}>
        <cylinderGeometry args={[0.003, 0.008, isOrigin ? 0.16 : 0.1, 8]} />
        <meshBasicMaterial
          color={beaconColor}
          transparent
          opacity={isOrigin ? 0.75 : isSelected ? 0.8 : 0.35}
        />
      </mesh>

      {/* Pulsing Radar Ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.028, 0.042, 32]} />
        <meshBasicMaterial
          color={beaconColor}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Starry GPS Constellation & Navigation Grid
function GlobalLogisticsConstellation() {
  const pointsRef = useRef();

  const particles = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 240; i++) {
      const r = 1.15 + Math.random() * 0.45;
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
      pointsRef.current.rotation.y += delta * 0.04;
      pointsRef.current.rotation.x += delta * 0.02;
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
        size={0.009}
        color="#7DD3FC"
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  );
}

// Main Interactive Earth with Satellite & Logistics Overlays
function EarthLogisticsGlobe({
  onHoverHub,
  onSelectHub,
  selectedHub,
  activeMode,
}) {
  const globeGroupRef = useRef();

  const [earthTexture] = useTexture([
    'https://unpkg.com/three-globe/example/img/earth-dark.jpg'
  ]);

  useFrame((_, delta) => {
    if (globeGroupRef.current) {
      // Gentle auto-revolution around polar axis
      globeGroupRef.current.rotation.y += delta * 0.07;
    }
  });

  const originHub = EXPORT_HUBS[0];
  const destinationHubs = EXPORT_HUBS.filter((h) => !h.isOrigin);

  return (
    <group ref={globeGroupRef}>
      {/* 1. Cinematic Textured Globe */}
      <mesh receiveShadow castShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          map={earthTexture}
          specular={new THREE.Color('#1E3A8A')}
          shininess={30}
        />
      </mesh>

      {/* 2. Dual Atmospheric Glow */}
      <AtmosphereGlow />

      {/* 3. High-Speed Air Cargo Corridors with Flying Supersonic Cargo Jets */}
      {destinationHubs.map((dest) => (
        <AirFlightRoute
          key={`air-${dest.id}`}
          from={originHub}
          to={dest}
          isSelected={selectedHub?.id === dest.id}
          activeMode={activeMode}
        />
      ))}

      {/* 4. Maritime Ocean Lanes with Cruising Container Ships */}
      {destinationHubs.map((dest) => (
        <SeaShippingLane
          key={`sea-${dest.id}`}
          from={originHub}
          to={dest}
          isSelected={selectedHub?.id === dest.id}
          activeMode={activeMode}
        />
      ))}

      {/* 5. Global Strategic Port Beacons & Customs Gateways */}
      {EXPORT_HUBS.map((hub) => (
        <PortBeacon
          key={`port-${hub.id}`}
          hub={hub}
          isOrigin={hub.isOrigin}
          isSelected={selectedHub?.id === hub.id}
          onHover={onHoverHub}
          onSelect={onSelectHub}
        />
      ))}
    </group>
  );
}

// Exportable 3D Matrix Component
export default function GlobalTradeMatrix({
  onSelectHub = () => {},
  selectedHub = null,
  activeMode = 'all',
  className = '',
}) {
  const [hoveredHub, setHoveredHub] = useState(null);

  return (
    <div className={`relative w-full h-full select-none ${className}`}>
      {/* Tooltip on Port Hover */}
      {hoveredHub && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-950/85 backdrop-blur-xl border border-cyan-500/40 shadow-xl shadow-cyan-950/50">
            <span className="text-base">{hoveredHub.flag}</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{hoveredHub.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                  {hoveredHub.code}
                </span>
              </div>
              <span className="text-[10px] text-slate-300 font-medium">
                {hoveredHub.duty}
              </span>
            </div>
            {hoveredHub.isOrigin && (
              <span className="text-[9px] font-extrabold uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                Export Origin
              </span>
            )}
          </div>
        </div>
      )}

      {/* 3D Canvas Scene */}
      <Canvas
        camera={{ position: [0, 0.25, 1.7], fov: 46 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 3, 5]} intensity={2.0} color="#ffffff" />
        <directionalLight position={[-4, -1, -3]} intensity={0.5} color="#38bdf8" />
        <pointLight position={[0, 4, 0]} intensity={0.4} color="#60a5fa" />

        <Suspense fallback={null}>
          <EarthLogisticsGlobe
            onHoverHub={setHoveredHub}
            onSelectHub={onSelectHub}
            selectedHub={selectedHub}
            activeMode={activeMode}
          />
          <GlobalLogisticsConstellation />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!hoveredHub && !selectedHub}
          autoRotateSpeed={0.65}
          rotateSpeed={0.5}
          minPolarAngle={Math.PI * 0.28}
          maxPolarAngle={Math.PI * 0.68}
        />
      </Canvas>
    </div>
  );
}
