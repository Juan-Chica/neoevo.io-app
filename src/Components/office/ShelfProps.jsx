import { officeProfile } from './officeAssets';

// Shelf-local coordinates. The existing cabinet and baked decor remain untouched.
const targets = [
  { id: 'headset', position: [-.29, .605, .15], size: [.19, .14] },
  { id: 'car', position: [.23, -.355, .15], size: [.25, .15] },
  { id: 'book', position: [.19, .51, .15], size: [.20, .23] },
  { id: 'logo', position: [.245, .056, .15], size: [.19, .18] },
];

const ignoreRay = () => null;

function Part({ position, size, color, metalness = .1 }) {
  return (
    <mesh position={position} raycast={ignoreRay}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={.52} metalness={metalness} />
    </mesh>
  );
}

function RoundPart({ position, radius, depth, segments, rotate, color }) {
  return (
    <mesh position={position} rotation={rotate} raycast={ignoreRay}>
      <cylinderGeometry args={[radius, radius, depth, segments]} />
      <meshStandardMaterial color={color} roughness={.62} />
    </mesh>
  );
}

export default function ShelfProps({ active, selected, onSelect }) {
  const segments = officeProfile() === 'mobile' ? 8 : 12;
  return (
    <>
      <group name="Shelf VR headset" position={[-.29, .58, .066]}>
        <Part size={[.15, .062, .064]} color="#435563" />
        <Part position={[0, 0, .036]} size={[.12, .035, .012]} color="#142934" />
        <Part position={[0, -.023, .041]} size={[.115, .006, .008]} color="#70c9d8" />
      </group>
      <group name="Shelf model car" position={[.23, -.383, .077]}>
        <Part position={[0, -.012, 0]} size={[.229, .012, .075]} color="#1e2d35" />
        <Part position={[0, .018, 0]} size={[.207, .033, .064]} color="#5f7784" metalness={.48} />
        <Part position={[-.018, .047, 0]} size={[.109, .026, .052]} color="#243844" metalness={.3} />
        {[-.067, .067].flatMap(x => [-.035, .035].map(z => (
          <RoundPart key={`${x}:${z}`} position={[x, .011, z]} radius={.019}
            depth={.013} segments={segments} rotate={[Math.PI / 2, 0, 0]} color="#172128" />
        )))}
      </group>
      {active && targets.map(({ id, position, size }) => (
        <mesh key={id} name={`Shelf target ${id}`} position={position}
          onClick={event => { event.stopPropagation(); onSelect(id); }}
          onPointerOver={event => { event.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'default'; }}>
          <planeGeometry args={size} />
          <meshBasicMaterial color="#8de7f6" transparent opacity={selected === id ? .25 : 0}
            colorWrite={selected === id} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}
