import {Object3D, Sprite, SpriteMaterial, DoubleSide, TextureLoader} from "../lib/three.module.js";

export default class Cloud extends Object3D {
    constructor() {
        super();

        this.add(generateBillboardClouds());
    }
}

function generateBillboardClouds() {
    let loader = new TextureLoader();
    for (let i = 0; i < 20; i++) {
        /*var cloudtextures = [
            loader.load('resources/cloud/c1.jpg'), //Laster inn noen skyteksturer
            loader.load('resources/cloud/c2.jpg'),
            loader.load('resources/cloud/c3.jpg'),
            loader.load('resources/cloud/c4.jpg'),
            loader.load('resources/cloud/c5.jpg')
        ];*/

        let cloudTexture = loader.load('resources/cloud/cloud.png');

        //let randomTexture = Math.floor(Math.random() * 4);
        let material = new SpriteMaterial({
            map: cloudTexture,
            color: 0xffffff,
            fog: true,
            transparent: true,
            opacity: 3.0,
            side: DoubleSide
        });
        let skyPlane = new Sprite(material);

        //Positions- plasser litt tilfeldig
        let pX = Math.random() * 1000 - 500;
        let pZ = Math.random() * 1000 - 500;
        let pY = Math.random() * 50 + 100;
        if (i < 2) {
            pX = 185;
            pY = 100;
            pZ = 185;
        }
        let s1 = 50;
        let s2 = 50;

        //Set positions and scale
        skyPlane.position.set(pX, pY, pZ);
        skyPlane.scale.set(s1, s2, 1);
        skyPlane.rotation.z = Math.PI / 2;

    }
}