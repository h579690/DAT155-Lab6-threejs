import {
    PerspectiveCamera,
    WebGLRenderer,
    PCFSoftShadowMap,
    Scene,
    Mesh,
    TextureLoader,
    RepeatWrapping,
    DirectionalLight,
    Vector3,
    AxesHelper,
    SphereGeometry,
    DoubleSide,
    MeshBasicMaterial,
    ShaderMaterial,
    ImageUtils, SpriteMaterial, Sprite
} from './lib/three.module.js';

import * as THREE from './lib/three.module.js';

import Utilities from './lib/Utilities.js';
import MouseLookController from './controls/MouseLookController.js';

import TextureSplattingMaterial from './materials/TextureSplattingMaterial.js';
import TerrainBufferGeometry from './terrain/TerrainBufferGeometry.js';

import { GLTFLoader } from './loaders/GLTFLoader.js';
import { SimplexNoise } from './lib/SimplexNoise.js';
import { Water } from "./terrain/Water.js";

import SkyDome from './terrain/SkyDome.js';
import Terrain from "./terrain/Terrain.js";

import Lava from "./terrain/Lava.js";
import Cloud from "./terrain/Cloud.js";
import SkyBox from "./terrain/SkyBox.js";

//import Fog from "./terrain/Fog.js";


async function main() {

    const scene = new Scene();

    const axesHelper = new AxesHelper(15);
    scene.add(axesHelper);

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;

    /**
     * Handle window resize:
     *  - update aspect ratio.
     *  - update projection matrix
     *  - update renderer size
     */
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    /**
     * Add canvas element to DOM.
     */
    document.body.appendChild(renderer.domElement);


    /**
     * Add light
     */
    const directionalLight = new DirectionalLight(0xffffff);
    directionalLight.position.set(300, 400, 0);

    directionalLight.castShadow = true;

    //Set up shadow properties for the light
    directionalLight.shadow.mapSize.width = 512;
    directionalLight.shadow.mapSize.height = 512;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 2000;

    scene.add(directionalLight);

    // Set direction
    directionalLight.target.position.set(0, 15, 0);
    scene.add(directionalLight.target);

    camera.position.z = 70;
    camera.position.y = 55;
    camera.rotation.x -= Math.PI * 0.25;


    /**
     * Add terrain:
     *
     * We have to wait for the image file to be loaded by the browser.
     * There are many ways to handle asynchronous flow in your application.
     * We are using the async/await language constructs of Javascript:
     *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
     */
    const heightmapImage = await Utilities.loadImage('resources/images/volcano1.jpg');
    const width = 300;

    const simplex = new SimplexNoise();
    const terrainGeometry = new TerrainBufferGeometry({
        width,
        heightmapImage,
        // noiseFn: simplex.noise.bind(simplex),
        numberOfSubdivisions: 128,
        height: 40
    });

    const grassTexture = new TextureLoader().load('resources/textures/grass_02.png');
    grassTexture.wrapS = RepeatWrapping;
    grassTexture.wrapT = RepeatWrapping;
    grassTexture.repeat.set(5000 / width, 5000 / width);

    const snowyRockTexture = new TextureLoader().load('resources/textures/snowy_rock_01.png');
    snowyRockTexture.wrapS = RepeatWrapping;
    snowyRockTexture.wrapT = RepeatWrapping;
    snowyRockTexture.repeat.set(1500 / width, 1500 / width);


    const splatMap = new TextureLoader().load('resources/images/splatmap_01.png');

    const terrainMaterial = new TextureSplattingMaterial({
        color: 0xffffff,
        shininess: 0,
        textures: [snowyRockTexture, grassTexture],
        splatMaps: [splatMap]
    });

    const terrain = new Mesh(terrainGeometry, terrainMaterial);

    terrain.castShadow = true;
    terrain.receiveShadow = true;

    scene.add(terrain);



    /**
     * Add trees
     */

        // instantiate a GLTFLoader:
    const loader = new GLTFLoader();

    loader.load(
        // resource URL
        'resources/models/kenney_nature_kit/tree_thin.glb',
        // called when resource is loaded
        (object) => {
            for (let x = -75; x < 150; x += 12) {
                for (let z = -75; z < 150; z += 12) {

                    const px = x + 1 + (6 * Math.random()) - 3;
                    const pz = z + 1 + (6 * Math.random()) - 3;

                    const height = terrainGeometry.getHeightAt(px, pz);

                    if (height < 20 && height > 10) {
                        const tree = object.scene.children[0].clone();

                        tree.traverse((child) => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                            }
                        });

                        tree.position.x = px;
                        tree.position.y = height - 0.01;
                        tree.position.z = pz;

                        tree.rotation.y = Math.random() * (2 * Math.PI);

                        tree.scale.multiplyScalar(1.5 + Math.random() * 1);


                        scene.add(tree);
                    }

                }
            }
        },
        (xhr) => {
            console.log(((xhr.loaded / xhr.total) * 100) + '% loaded');
        },
        (error) => {
            console.error('Error loading model.', error);
        }
    );

    /**
     * Adding a skyDome
     */
    //let skyDome = new SkyDome();
    //scene.add(skyDome);

    let skyBox = new SkyBox();
    scene.add(skyBox);

    /**
     * Add clouds
     */
    //let cloud = new Cloud();
    //scene.add(cloud);
    function generateBillboardClouds() {
        let loader = new TextureLoader();
        for (let i = 0; i < 20; i++) {
            let cloudTextures = [
                loader.load('resources/cloud/cloud1.png'), //Laster inn noen skyteksturer
                loader.load('resources/cloud/cloud2.png'),
                loader.load('resources/cloud/cloud3.png'),
                loader.load('resources/cloud/cloud4.png')
            ];


            //let random = Math.floor(Math.random() * 4);
            let material = new SpriteMaterial({
                map: cloudTextures[3],
                color: 0xffffff,
                transparent: true,
                opacity: 3.0,
                side: DoubleSide
            });

            let skyPlane = new Sprite(material);

            //Positions- plasser litt tilfeldig
            let pX = Math.random() * 1000 - 500;
            let pZ = Math.random() * 1000 - 500;
            let pY = Math.random() * 50 + 100;

            let s1 = 50;
            let s2 = 50;

            //Set positions and scale
            skyPlane.position.set(pX, pY, pZ);
            skyPlane.scale.set(s1, s2, 1);
            skyPlane.rotation.z = Math.PI / 2;

            scene.add(skyPlane);
        }
    }
    generateBillboardClouds();


    /**
     * Add water
     */
    const waterGeometry = new THREE.PlaneBufferGeometry( 1000, 1000 );

    let water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load( 'resources/images/waternormals.jpg', function ( texture ) {

                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

            } ),
            alpha: 1.0,
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );

    water.rotation.x = - Math.PI / 2;
    water.translateZ(2);
    scene.add( water );

    /**
     * Add lava
     */
    let lava = new Lava();
    scene.add(lava);

    /**
     * Add fog
     */
    //let fog = new Fog();
    //scene.add(fog);

    /**
     * Set up camera controller:
     */

    const mouseLookController = new MouseLookController(camera);

    // We attach a click lister to the canvas-element so that we can request a pointer lock.
    // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
    const canvas = renderer.domElement;

    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    let yaw = 0;
    let pitch = 0;
    const mouseSensitivity = 0.001;

    function updateCamRotation(event) {
        yaw += event.movementX * mouseSensitivity;
        pitch += event.movementY * mouseSensitivity;
    }

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            canvas.addEventListener('mousemove', updateCamRotation, false);
        } else {
            canvas.removeEventListener('mousemove', updateCamRotation, false);
        }
    });

    let move = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        up: false,
        speed: 0.01
    };

    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyW') {
            move.forward = true;
            e.preventDefault();
        } else if (e.code === 'KeyS') {
            move.backward = true;
            e.preventDefault();
        } else if (e.code === 'KeyA') {
            move.left = true;
            e.preventDefault();
        } else if (e.code === 'KeyD') {
            move.right = true;
            e.preventDefault();
        } else if (e.code === 'Space') {
            move.up = true;
            e.preventDefault();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'KeyW') {
            move.forward = false;
            e.preventDefault();
        } else if (e.code === 'KeyS') {
            move.backward = false;
            e.preventDefault();
        } else if (e.code === 'KeyA') {
            move.left = false;
            e.preventDefault();
        } else if (e.code === 'KeyD') {
            move.right = false;
            e.preventDefault();
        } else if (e.code === 'Space') {
            move.up = false;
            e.preventDefault();
        }
    });

    const velocity = new Vector3(0.0, 0.0, 0.0);

    let then = performance.now();
    function loop(now) {

        const delta = now - then;
        then = now;

        const moveSpeed = move.speed * delta * 5;

        velocity.set(0.0, 0.0, 0.0);

        if (move.left) {
            velocity.x -= moveSpeed;
        }

        if (move.right) {
            velocity.x += moveSpeed;
        }

        if (move.forward) {
            velocity.z -= moveSpeed;
        }

        if (move.backward) {
            velocity.z += moveSpeed;
        }

        if (move.up) {
            velocity.y += moveSpeed;
        }

        // update controller rotation.
        mouseLookController.update(pitch, yaw);
        yaw = 0;
        pitch = 0;

        // apply rotation to velocity vector, and translate moveNode with it.
        velocity.applyQuaternion(camera.quaternion);
        camera.position.add(velocity);

        // render scene:
        renderer.render(scene, camera);

        requestAnimationFrame(loop);

    };

    loop(performance.now());

}

main(); // Start application