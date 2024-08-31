import { useHeightfield } from "@react-three/cannon";
import { useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { PlaneGeometry, TextureLoader } from "three";


function createBump(origin, radius, alpha, height) {
    return function (point) {
        const distance = Math.sqrt(
            Math.pow(point[0] - origin[0], 2) +
            Math.pow(point[1] - origin[1], 2) +
            Math.pow(point[2] - origin[2], 2)
        );

        if (distance > radius) {
            return 0;
        }

        const t = distance / radius;
        const smoothStep = Math.pow(1 - t * t, alpha);

        return height * smoothStep;
    };
}

const bumpData = [
    {
        alpha: 1,
        radius: 30,
        origin: [0, 0, 0],
        height: 10
    },
    {
        alpha: 1,
        radius: 30,
        origin: [100, 100, 0],
        height: 30
    }
]

export default function ComplexGround() {

    const colorMap = useLoader(TextureLoader, '/textures/ground/color.jpg');
    // const roughnessMap = useLoader(TextureLoader, '/textures/ground/normal2.jpg');
    const normalMap = useLoader(TextureLoader, '/textures/ground/normal5.jpeg');

    const ground = useRef();
    const geometry = useMemo(() => {
        return new PlaneGeometry(500, 500, 100, 100);
    }, []);
    const [positions, setPositions] = useState(new Array(101).fill([]).map(() => new Array(101).fill(0)));
    const [updateHeightfield, setUpdateHeightfield] = useState();

    useEffect(() => {
        if (!geometry) return;
        const data = geometry.attributes?.position?.array;
        const temp2 = [...positions];
        bumpData.forEach((vals, index) => {
            const bump = createBump(vals.origin, vals.radius, vals.alpha, vals.height);
            let c = 101;
            for (let i = 0, j = 0; i < data?.length; i += 3, j++) {
                const x = data[i];
                const y = data[i + 1];
                const z = data[i + 2];

                let h = bump([x, y, z]);

                data[i + 2] += h;
                if (j % 101 === 0) {
                    c--;
                }
                temp2[c][j % 101] += h;
            }
        })

        setPositions(temp2);
        setUpdateHeightfield(true);

        // Update geometry
        geometry.attributes.position.needsUpdate = true;
    }, []);

    useHeightfield(() => ({
        args: [positions, { elementSize: 5 }],
        position: [-250, 0, 250],
        rotation: [-Math.PI / 2, 0, 0],
        mass: 0
    }), null, [updateHeightfield])

    return (
        <mesh rotation-x={-Math.PI / 2} receiveShadow castShadow position={[0, 0, 0]}>
            <bufferGeometry {...geometry} attach={"geometry"} />
            <meshStandardMaterial
                map={colorMap}
                // roughnessMap={roughnessMap}
                normalMap={normalMap}
                roughness={1}  // High roughness for a matte appearance
                metalness={0}    // No metallic reflection
            />
        </mesh>
    )
}