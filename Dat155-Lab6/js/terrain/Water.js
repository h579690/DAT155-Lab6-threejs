import {Vector2, Vector3,MeshPhongMaterial, Object3D, PlaneBufferGeometry, TextureLoader, Mesh, CircleBufferGeometry} from "../lib/three.module.js";

export default class Water extends Object3D {
    constructor() {
        super();

        let loader = new TextureLoader();

        let waterGeometry = new PlaneBufferGeometry(512, 512);

        let waterTexture = loader.load('resources/textures/water02.jpg');
        let waterNormalMap = loader.load('resources/images/normalMap_Water.jpg');

        let waterMaterial = new MeshPhongMaterial({
            map: waterTexture,
            normalMap: waterNormalMap,
            opacity: 3.0,
            normalScale: new Vector2(1.0, 1.0),
            shininess: 0.5,
            //color: 0xfa00dd,
            side: 2,
            reflectivity: 0.2,
            fog: true,
        })

        this.water = new Mesh(waterGeometry, waterMaterial);
        this.water.rotation.x = -Math.PI /2;
        this.water.position.setY(1.0);
        this.add(this.water);

    }

}