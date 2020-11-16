import Utilities from "../lib/Utilities.js";
import {SimplexNoise} from "../lib/SimplexNoise.js";
import TerrainBufferGeometry from "./TerrainBufferGeometry.js";
import {Mesh, Object3D, RepeatWrapping, TextureLoader} from "../lib/three.module.js";
import TextureSplattingMaterial from "../materials/TextureSplattingMaterial.js";
import {GLTFLoader} from "../loaders/GLTFLoader.js";
import Tree from "./Tree.js";

/**
 * Add terrain:
 *
 * We have to wait for the image file to be loaded by the browser.
 * There are many ways to handle asynchronous flow in your application.
 * We are using the async/await language constructs of Javascript:
 *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
 */

export default class SkyDome extends Object3D {
     constructor() {
        super();

        Utilities.loadImage('resources/images/heightmap.png').then((heightmapImage) => {

            const width = 100;

            const simplex = new SimplexNoise();
            const terrainGeometry = new TerrainBufferGeometry({
                width,
                heightmapImage,
                // noiseFn: simplex.noise.bind(simplex),
                numberOfSubdivisions: 128,
                height: 20
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

            this.add(terrain);
            let tree = new Tree(terrainGeometry);
            this.add(tree);

        });
    }
}
