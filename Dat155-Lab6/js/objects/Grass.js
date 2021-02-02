import {SpriteMaterial, Sprite} from "../lib/three.module.js";
export default class Grass {

    constructor ({texture}){
        // make the billboard
        const objMaterial = new SpriteMaterial({
            transparent: true,
            map: texture,
            opacity: 0.7
        });
        objMaterial.transparent = true;
        objMaterial.depthTest = true;
        objMaterial.fog =true;
        const sprite = new Sprite(objMaterial);
        sprite.name = "Billboard";

        return(sprite);
    }
}