// v1.6 升级 FinishLine：
// - 普通终点：拱门 + 黑白格 + 顶部"FINISH"色块 + 两侧旗杆
// - 停车终点：3D 立体 P 框 + 大字 P + 黄边线 + 引导箭头

interface FinishLineProps {
  z: number;
  parking?: boolean;
}

function FinishArch({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      {/* 左立柱 */}
      <mesh position={[-3.95, 1.7, 0]}>
        <boxGeometry args={[0.32, 3.4, 0.32]} />
        <meshStandardMaterial color="#e63946" emissive="#a8000a" emissiveIntensity={0.1} roughness={0.4} />
      </mesh>
      {/* 右立柱 */}
      <mesh position={[3.95, 1.7, 0]}>
        <boxGeometry args={[0.32, 3.4, 0.32]} />
        <meshStandardMaterial color="#e63946" emissive="#a8000a" emissiveIntensity={0.1} roughness={0.4} />
      </mesh>
      {/* 顶横梁 */}
      <mesh position={[0, 3.35, 0]}>
        <boxGeometry args={[8.2, 0.5, 0.34]} />
        <meshStandardMaterial color="#e63946" emissive="#ff2222" emissiveIntensity={0.18} roughness={0.4} />
      </mesh>
      {/* FINISH 牌 */}
      <mesh position={[0, 3.4, 0.18]}>
        <boxGeometry args={[3.0, 0.32, 0.04]} />
        <meshStandardMaterial color="#fff7cf" emissive="#fff0a0" emissiveIntensity={0.5} roughness={0.3} />
      </mesh>
      {/* 黑白格条（横梁前面贴一行） */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={`top-flag-${i}`} position={[-3.6 + i * 0.55, 3.05, 0.18]}>
          <boxGeometry args={[0.5, 0.18, 0.04]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#ffffff' : '#1a1a1a'} roughness={0.4} />
        </mesh>
      ))}
      {/* 左右旗杆 */}
      <mesh position={[-4.6, 2.1, 0.0]}>
        <cylinderGeometry args={[0.04, 0.04, 4.2, 8]} />
        <meshStandardMaterial color="#a4abb0" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[4.6, 2.1, 0.0]}>
        <cylinderGeometry args={[0.04, 0.04, 4.2, 8]} />
        <meshStandardMaterial color="#a4abb0" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* 旗 */}
      <mesh position={[-4.4, 3.7, 0]}>
        <boxGeometry args={[0.42, 0.32, 0.02]} />
        <meshStandardMaterial color="#ffd166" emissive="#ffaa00" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[4.4, 3.7, 0]}>
        <boxGeometry args={[0.42, 0.32, 0.02]} />
        <meshStandardMaterial color="#06d6a0" emissive="#00a371" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

export default function FinishLine({ z, parking }: FinishLineProps) {
  if (parking) {
    return (
      <group position={[0, 0.04, z]}>
        {/* 假阴影 */}
        <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[3.2, 24]} />
          <meshBasicMaterial color="black" transparent opacity={0.25} depthWrite={false} />
        </mesh>
        {/* 黄色车位框（外层） */}
        <mesh>
          <boxGeometry args={[3.8, 0.04, 4.85]} />
          <meshStandardMaterial color="#ffd54a" emissive="#ffb900" emissiveIntensity={0.45} roughness={0.4} />
        </mesh>
        {/* 内层深色 */}
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[3.4, 0.06, 4.45]} />
          <meshStandardMaterial color="#23282d" roughness={0.6} />
        </mesh>
        {/* 中心大 P 字（用 box 拼） */}
        <mesh position={[-0.32, 0.1, -0.12]}>
          <boxGeometry args={[0.18, 0.04, 1.6]} />
          <meshStandardMaterial color="#ffffff" emissive="#fff" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0.18, 0.1, -0.62]}>
          <boxGeometry args={[0.86, 0.04, 0.18]} />
          <meshStandardMaterial color="#ffffff" emissive="#fff" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0.18, 0.1, 0.0]}>
          <boxGeometry args={[0.86, 0.04, 0.18]} />
          <meshStandardMaterial color="#ffffff" emissive="#fff" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0.55, 0.1, -0.31]}>
          <boxGeometry args={[0.18, 0.04, 0.62]} />
          <meshStandardMaterial color="#ffffff" emissive="#fff" emissiveIntensity={0.6} />
        </mesh>
        {/* 引导箭头（指向停车位） */}
        <mesh position={[0, 0.1, 1.55]}>
          <boxGeometry args={[0.18, 0.04, 0.8]} />
          <meshStandardMaterial color="#ffd54a" emissive="#ffb900" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[-0.22, 0.1, 1.95]} rotation={[0, 0.6, 0]}>
          <boxGeometry args={[0.42, 0.04, 0.18]} />
          <meshStandardMaterial color="#ffd54a" emissive="#ffb900" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0.22, 0.1, 1.95]} rotation={[0, -0.6, 0]}>
          <boxGeometry args={[0.42, 0.04, 0.18]} />
          <meshStandardMaterial color="#ffd54a" emissive="#ffb900" emissiveIntensity={0.6} />
        </mesh>
        {/* 立体边线小柱（4 角） */}
        {[
          { x: -1.85, z: -2.3 },
          { x: 1.85, z: -2.3 },
          { x: -1.85, z: 2.3 },
          { x: 1.85, z: 2.3 },
        ].map((p, i) => (
          <mesh key={i} position={[p.x, 0.2, p.z]}>
            <cylinderGeometry args={[0.06, 0.06, 0.45, 8]} />
            <meshStandardMaterial color="#ffd54a" emissive="#ffd54a" emissiveIntensity={0.6} />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <group>
      {/* 黑白棋盘格地面（更密更整齐） */}
      <group position={[0, 0.06, z]}>
        {Array.from({ length: 14 }).map((_, index) => (
          <mesh key={index} position={[-3.9 + index * 0.6, 0, -0.32]}>
            <boxGeometry args={[0.58, 0.08, 0.62]} />
            <meshStandardMaterial color={index % 2 === 0 ? '#ffffff' : '#1a1a1a'} roughness={0.4} />
          </mesh>
        ))}
        {Array.from({ length: 14 }).map((_, index) => (
          <mesh key={`b-${index}`} position={[-3.9 + index * 0.6, 0, 0.32]}>
            <boxGeometry args={[0.58, 0.08, 0.62]} />
            <meshStandardMaterial color={index % 2 === 0 ? '#1a1a1a' : '#ffffff'} roughness={0.4} />
          </mesh>
        ))}
      </group>
      <FinishArch z={z} />
    </group>
  );
}
