import { useCompoundBody, useHingeConstraint, useSphere } from '@react-three/cannon';
import { PerspectiveCamera, useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react';
import { Euler, Quaternion, Raycaster, Vector3 } from 'three'
import { useInput } from '../../customHooks/useInput.js';
import { usePointerMove } from '../../customHooks/usePointerMove.js';
import { useAction } from '../../customHooks/useAction.js';
import { useJoyStick } from '../../customHooks/useJoyStick.js';

const Model = () => {

    const refA = useRef();
    const refC = useRef();
    const { nodes, materials, animations } = useGLTF('/model/playerModel.glb');
    const { actions } = useAnimations(animations, refC);
    const currentAction = useAction();
    const previousAction = useRef();
    let { theta, phi } = usePointerMove();
    const {deltaX, deltaY} = useJoyStick();
    const raycaster = useRef(new Raycaster());
    const euler = new Euler();
    const quaternion = useRef(new Quaternion());
    const cameraQuaternion = useRef(new Quaternion());
    const cameraEuler = new Euler();
    const positionRef = useRef();
    const { KeyW, KeyS, KeyA, KeyD, ShiftLeft, Space } = useInput();
    const Velo = useRef([0, 0, 0]);
    const isInAir = useRef(false);


    const [ref1, bodyA] = useSphere(() => ({
        mass: 10,
        args: [0.3],
        position: [0, 0.3, 0],
        material: 'player',
        linearDamping: 0.1,
        onCollide: handleCollision,
        angularDamping: 0.1,  // Reduce angular damping
        friction: 0.2
    }), refA);

    const handleCollision = (e) => {
        if (!bodyA) return;
        if (e.contact.bi.id !== e.body.id) {
            const impactForce = new Vector3(...e.contact.ni).multiplyScalar(-5);
            bodyA.applyImpulse([impactForce.x, 0, impactForce.z], [0, 0, 0]);
        }
    }

    const [ref2, bodyC] = useCompoundBody(() => ({
        mass: 10,
        shapes: [
            { args: [0.30, 0.29, 1.2, 32], position: [0, 0.9, 0], type: 'Cylinder' },
            { args: [0.32], position: [0, 1.5, 0], type: 'Sphere' }
        ],
        material: 'frictionLess',
        position: [0, 40, 0],
        linearDamping: 0.2,
        angularDamping: 1,  // Reduce angular damping
        friction: 0
    }), refC);

    const [a, b, hinge1] = useHingeConstraint(refA, refC, {
        pivotA: [0, 0, 0], // Adjust based on actual positions
        pivotB: [0, 0.3, 0], // Adjust based on actual positions
        maxForce: 1e9,
        axisA: [1, 0, 0],
        axisB: [1, 0, 0],
        collideConnected: false
    });

    // player animation
    useEffect(() => {
        if (previousAction.current !== currentAction) {
            const nextToPlay = actions[currentAction];
            const currentPlay = actions[previousAction.current];
            currentPlay?.fadeOut(0.2);
            nextToPlay?.reset()?.fadeIn(0.2).play();
            previousAction.current = currentAction;
        }
    }, [actions, currentAction]);

    useEffect(() => {
        if (bodyC) bodyC.velocity.subscribe((p) => Velo.current = p);
    }, [bodyC])

    useEffect(() => {
        if (hinge1) {
            hinge1.setMotorMaxForce(1e6);
            hinge1.enableMotor();
        }
    }, [hinge1])

    useEffect(() => {
        if (!isInAir.current && Space) {
            isInAir.current = true;
            bodyA.applyImpulse([0, 100, 0], [0, 0, 0]);
        }
    }, [Space])

    useFrame(({ scene, camera }, state) => {
        euler.set(0, theta, 0, 'YXZ');
        cameraEuler.set(phi, 0, 0, 'YXZ');

        quaternion.current.setFromEuler(euler);
        cameraQuaternion.current.setFromEuler(cameraEuler);
        // console.log("move", direction.forward);
        if (hinge1 && !isInAir.current) {
            if (KeyW || (deltaY < -40)) {
                
                if (ShiftLeft) hinge1.setMotorSpeed(-30);
                else hinge1.setMotorSpeed(-15);
            } else if (KeyS || (deltaY > 40)) {
                hinge1.setMotorSpeed(10);
            }

            if (KeyA || (deltaX < -40)) {
                bodyC.velocity.set(10 * Math.sin(theta - Math.PI / 2), Velo.current[1], 10 * Math.cos(theta - Math.PI / 2));
            } else if (KeyD || (deltaX > 40)) {
                bodyC.velocity.set(-10 * Math.sin(theta - Math.PI / 2), Velo.current[1], -10 * Math.cos(theta - Math.PI / 2));
            }
        }
        if (!KeyS && !KeyW && (deltaY > -40 && deltaY < 40)) {
            hinge1.setMotorSpeed(0);
        }
        bodyC.quaternion.copy(quaternion.current);
        bodyA.quaternion.copy(quaternion.current);
        positionRef.current.quaternion.copy(cameraQuaternion.current);
        positionRef.current.position.y = (phi + 1.28) / 0.64;
        positionRef.current.position.z = (phi - 1.28) / 2.56;

        if (raycaster?.current) {
            raycaster.current.set(new Vector3(refA.current.position.x, refA.current.position.y, refA.current.position.z), new Vector3(0, -1, 0));
            const intersects = raycaster.current.intersectObjects(scene.children, true);
            intersects[0]?.distance > 0.6 ? isInAir.current = true : isInAir.current = false;
        }
    })

    return (
        <>
            <group ref={refC} dispose={null}>
                <mesh ref={refA}>
                </mesh>
                <group name="Scene" position={[0, 0, 0]} castShadow>
                    <group name="Armature" position={[0, 0, 0]} rotation={[Math.PI / 2, 0, -3.088]} scale={0.01} castShadow>
                        <skinnedMesh
                            name="Boy01_Body_Geo"
                            geometry={nodes.Boy01_Body_Geo.geometry}
                            material={materials.Boy01_Body_MAT1}
                            skeleton={nodes.Boy01_Body_Geo.skeleton}
                            castShadow
                        />
                        <skinnedMesh
                            name="Boy01_Brows_Geo"
                            geometry={nodes.Boy01_Brows_Geo.geometry}
                            material={materials.Boy01_Brows_MAT2}
                            skeleton={nodes.Boy01_Brows_Geo.skeleton}
                            castShadow
                        />
                        <skinnedMesh
                            name="Boy01_Eyes_Geo"
                            geometry={nodes.Boy01_Eyes_Geo.geometry}
                            material={materials.Boy01_Eyes_MAT2}
                            skeleton={nodes.Boy01_Eyes_Geo.skeleton}
                            castShadow
                        />
                        <skinnedMesh
                            name="h_Geo"
                            geometry={nodes.h_Geo.geometry}
                            material={materials.Boy01_Mouth_MAT2}
                            skeleton={nodes.h_Geo.skeleton}
                            castShadow
                        />
                        <primitive object={nodes.mixamorigHips} />
                    </group>
                    <group position={[0, 0, -1]} ref={positionRef}>
                        <PerspectiveCamera makeDefault position={[0, 0, 3.5]} args={[75, window.innerWidth / window.innerHeight, 0.1, 1000]} />
                        {/* <group position={[0, 0, 3.5]}>
                        <cameraHelper args={[cameraRef]} />
                    </group> */}
                    </group>
                </group>
            </group >
        </>

    )
}

export default Model;

useGLTF.preload('/playerModel.glb')