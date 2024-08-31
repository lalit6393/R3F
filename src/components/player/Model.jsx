import React, { useEffect, useRef, useState } from 'react'
import { useGLTF, useAnimations, PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { useAction } from '../../customHooks/useAction'
import { useFrame, useThree } from '@react-three/fiber'
import { useCompoundBody, useHingeConstraint, useLockConstraint, usePointToPointConstraint, useSphere } from '@react-three/cannon'
import { CameraHelper, Euler, MathUtils, Quaternion, Raycaster, Vector3 } from 'three'
import { useInput } from '../../customHooks/useInput'
import { usePointerMove } from '../../customHooks/usePointerMove'
import * as THREE from 'three';

export function Model(props) {

    const refB = useRef();
    const [speed, setSpeed] = useState(0);
    const { nodes, materials, animations } = useGLTF('/model/playerModel.glb');
    const { actions } = useAnimations(animations, refB);
    const currentAction = useAction();
    const previousAction = useRef();
    const { KeyW, KeyS, KeyA, KeyD, ShiftLeft, Space } = useInput(setSpeed);
    let { theta, phi } = usePointerMove();

    const position = useRef([0, 0, 0]);
    const velocity = useRef([0, 0, 0]);
    const isInAir = useRef(false);
    const DOWN_VECTOR = new Vector3(0, -1, 0);
    const euler = new Euler();
    const quaternion = useRef(new Quaternion());
    const movementEuler = new Euler();
    const movementQuaternion = useRef(new Quaternion());
    const cameraEuler = new Euler();
    const cameraQuaternion = useRef(new Quaternion());
    const raycaster = useRef(new Raycaster());

    const bodyApi = useRef(null);
    const jumpAction = useRef(null);

    // Create the upper body with low friction
    const [ref, bodyB] = useCompoundBody(() => ({
        mass: 10,
        shapes: [
            { args: [0.30, 0.29, 1.2, 32], position: [0, 0.9, 0], type: 'Cylinder' },
            { args: [0.32], position: [0, 1.5, 0], type: 'Sphere' }
        ],
        material: 'frictionLess',
        position: [0, 60, 0],
        linearDamping: 0.2,
        angularDamping: 1,  // Reduce angular damping
        friction: 0
    }), refB);


    // Create the bottom body with high friction
    const [refA, bodyA] = useSphere(() => ({
        mass: 10,
        args: [0.30],
        position: [0, 60, 0],
        material: '',
        onCollide: handleCollision,
        linearDamping: 0.1,
        friction: 0.2
    }), useRef());

    const playerBall = useHingeConstraint(refA, refB, {
        pivotA: [0, 0, 0], // Adjust based on actual positions
        pivotB: [0, -0.6, 0], // Adjust based on actual positions
        axisA:[0,1,0],
        maxForce: 1e6,
        collideConnected: false
    });

    useEffect(() => {
        if (playerBall && speed !== undefined) {    
            playerBall[2].setMotorMaxForce(1e5)
            playerBall[2].enableMotor()
        }
    }, [playerBall])


    bodyApi.current = bodyA;

    const handleCollision = (e) => {
        if (!bodyApi.current) return;
        if (e.contact.bi.id !== e.body.id) {
            const impactForce = new Vector3(...e.contact.ni).multiplyScalar(-5);
            bodyApi.current.applyImpulse([impactForce.x, 0, impactForce.z], [0, 0, 0]);
        }
    }

    useEffect(() => {
        if (!isInAir.current && Space) {
            isInAir.current = true;
            bodyA.applyImpulse([0, 100, 0], [0, 0, 0]);
        }
    }, [Space])

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
        const unsubscribePos = bodyA.position.subscribe((p) => (position.current = p));
        const unsubscribeVel = bodyA.velocity.subscribe((p) => (velocity.current = p));

        return () => {
            unsubscribePos();
            unsubscribeVel();
        }
    }, [bodyA]);
    // const cameraRef = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const positionRef = useRef();
    const lowerPbodyRef = useRef();

    useFrame(({ scene, camera }, delta) => {
        euler.set(0, theta, 0, 'YXZ');
        cameraEuler.set(phi, 0, 0, 'YXZ');
        movementEuler.set(0, 0, 0, 'YXZ');

        
        quaternion.current.setFromEuler(euler);
        cameraQuaternion.current.setFromEuler(cameraEuler);

        if (!isInAir.current) {
            if (KeyW) {
               
                if (ShiftLeft) playerBall[2].setMotorSpeed(-100)
                else{
                    console.log(KeyW);
            playerBall[2].setMotorSpeed(-50)}
            } else if (KeyS) {
                playerBall[2].setMotorSpeed(50)
            }

            if (KeyA) {
                // bodyA.angularVelocity.set(5,0,0);
                bodyB.velocity.set(8 * Math.sin(theta - Math.PI / 2), 0, 8 * Math.cos(theta - Math.PI / 2));
            } else if (KeyD) {
                bodyB.velocity.set(8 * Math.sin(theta + Math.PI / 2), 0, 8 * Math.cos(theta + Math.PI / 2));
            } else {
                // movementEuler.set(0, 0, 0, 'YXZ');
            }

        }
        if (!KeyA && !KeyD && !KeyS && !KeyW) playerBall[2].setMotorSpeed(0)

        bodyB.quaternion.copy(quaternion.current);
        positionRef.current.quaternion.copy(cameraQuaternion.current);
        positionRef.current.position.y = (phi + 1.28) / 0.64;
        positionRef.current.position.z = (phi - 1.28) / 2.56;

        if (raycaster?.current) {
            raycaster.current.set(new Vector3(position.current[0], position.current[1], position.current[2]), new Vector3(0, -1, 0));
            const intersects = raycaster.current.intersectObjects(scene.children, true);
            intersects[0]?.distance > 0.6 ? isInAir.current = true:isInAir.current = false;
        }
    })

    return (
        <>
            <group ref={refB} {...props} dispose={null} castShadow>
                <mesh ref={refA}>
                </mesh>
                <group name="Scene" castShadow>
                    <group name="Armature" rotation={[Math.PI / 2, 0, -3.088]} scale={0.01} castShadow>
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
                    <group position={[0, 2, -1]} ref={positionRef}>
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

useGLTF.preload('/playerModel.glb')