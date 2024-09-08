import { Debug, Physics, useBox, useContactMaterial } from '@react-three/cannon';
import { OrbitControls, PerspectiveCamera, Sky, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber'
import './App.css'
import { Suspense } from 'react';
import { usePointerLock } from './customHooks/usePointerLock.js';
import StartScreen from './components/startScreen/StartScreen.jsx';
import Model from './components/player/Model.jsx';
import GameScreen from './components/gameScreen/GameScreen.jsx';
import ComplexGround from './development/App.jsx';
import { useUiContext } from './providers/ui/uiProvider.jsx';
import TouchDetect from './modules/TouchDetect.jsx';

const Plane = (props) => {
    const [ref] = useBox(() => ({ args: [100, 0.1, 100], material: 'ground', type: "static", rotation: [0, 0, 0], ...props }));
    return (
        <mesh ref={ref} receiveShadow rotation={[0, 0, 0]}>
            <boxGeometry args={[100, 0.1, 100]} />
            <meshStandardMaterial color={"grey"} />
        </mesh>
    )
};

const Box = (props) => {

    const [ref] = useBox(() => ({ args: [2, 1, 2], type: "static", material: 'ground', ...props }));
    return (
        <mesh ref={ref} receiveShadow rotation={[0, 0, 0]} castShadow>
            <boxGeometry args={[2, 1, 2]} />
            <meshStandardMaterial color={"green"} />
        </mesh>
    )
};

const ContactMaterialBox = () => {
    useContactMaterial('ground', 'player', {
        friction: 0.2,
        restitution: 0,
        contactEquationStiffness: 1e6
    })
};



const App = () => {
    usePointerLock();
    const { startScreenOpen } = useUiContext();

    return (
        <div
            className='relative w-full h-full'
        >
            <StartScreen />
            <GameScreen />
            <TouchDetect/>
            <Canvas shadows id='canvas'>
                <Sky
                    distance={4500} // Camera distance (default=450000)
                    sunPosition={[100, 20, 100]} // Sun position
                    inclination={0.59} // Sun elevation angle (0 = horizon, 1 = zenith)
                    azimuth={0.25} // Sun azimuth angle (0 = north, 0.5 = east, 1 = south)
                    turbidity={10} // Atmospheric turbidity (default=10)
                    rayleigh={2} // Rayleigh scattering (default=2)
                    mieCoefficient={0.005} // Mie scattering coefficient (default=0.005)
                    mieDirectionalG={0.8} // Mie scattering directional g (default=0.8)
                />
                <Stats />
                <axesHelper args={[10]} position={[0, 0.2, 0]} />
                <Physics gravity={[0, -9.8, 0]}>
                    {/* <Debug scale={1} color={"white"}> */}
                    <ContactMaterialBox />
                    {
                        !startScreenOpen &&
                        <>
                            <Suspense fallback={null}>
                                <Model />
                            </Suspense>
                            <Suspense fallback={null}>
                                <ComplexGround />
                            </Suspense>
                        </>
                    }
                    {/* </Debug> */}
                </Physics>
                {/* <PerspectiveCamera makeDefault position={[-2, 12, 2]} args={[75, window.innerWidth / window.innerHeight, 0.1, 1000]}/>
                <OrbitControls target={[0,10.5,0]}/> */}
                <directionalLight
                    intensity={5}
                    castShadow
                    position={[100, 100, 100]}
                    shadow-mapSize={[4096, 4096]}
                    shadow-bias={-0.0001}
                    shadow-radius={1} // Adjust this for sharpness
                >
                    <orthographicCamera attach="shadow-camera" args={[-250, 250, 250, -250, 0.5, 1000]} castShadow />
                </directionalLight>
            </Canvas>
        </div>
    )
}

export default App
