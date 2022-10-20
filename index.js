import { GLTFLoader } from './libs/GLTFLoader.js'
import * as THREE from './libs/three.js'
import { OrbitControls } from './libs/OrbitControls.js';

//Create A Scene which is our viewport
const scene = new THREE.Scene();

//Create A Camera 
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 3000 );
//Initial Camera position
camera.position.z = 1000;
camera.position.y = 400;
camera.position.x = 500;

//Variables we need
let controls, parameters, model3D, particles;
const materials = [];

//For the Snow
const vertices = [];
const velocities = [];
const maxRange = 3000, minRange = maxRange / 2;

//Makes all object visible on screen
const renderer = new THREE.WebGLRenderer();
//Background color
renderer.setClearColor(0x020824);
//whole Browser window
renderer.setSize( window.innerWidth, window.innerHeight );
//add to html
document.body.appendChild( renderer.domElement );
//Add fog to scene
scene.fog = new THREE.FogExp2( 0xCCCCCC, 0.0003 );



// Load 3D Models into the Scene
const loader = new GLTFLoader();
function loadModel(modelPath, scaleFactor, xPos, yPos, zPos){
	loader.load( modelPath, function ( gltf ) {

		model3D = gltf.scene;
		model3D.traverse(function (child) {
			if (child instanceof THREE.Object3D) {
				child.castShadow = true;
			}
		});

	
		model3D.scale.x = model3D.scale.y = model3D.scale.z = scaleFactor;

        model3D.position.x = xPos;
        model3D.position.y = yPos;
        model3D.position.z = zPos;

		scene.add(model3D);
	
	}, undefined, function ( error ) {

    console.error( error );

	} );
}

loadModel('models/shrine.glb', 1, 0,0,0);
loadModel('models/floor.glb', 2, 0, -100, 0);



// controls
controls = new OrbitControls( camera, renderer.domElement );
controls.listenToKeyEvents( window ); // optional
controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.screenSpacePanning = false;

controls.minDistance = 10;
controls.maxDistance = 1500;

controls.maxPolarAngle = Math.PI / 2;

// Create Snowflakes			
const geometry = new THREE.BufferGeometry();
const textureLoader = new THREE.TextureLoader();

//Load Snowflake textures
const sprite1 = textureLoader.load( './textures/Snowflake_big.png' );
const sprite2 = textureLoader.load( './textures/Snowflake_big_blurr.png' );
const sprite3 = textureLoader.load( './textures/Snowflake_medium.png' );
const sprite4 = textureLoader.load( './textures/Snowflake_medium_blurr.png' );
const sprite5 = textureLoader.load( './textures/Snowflake_small.png' );
const sprite6 = textureLoader.load( './textures/Snowflake_small_blurr.png' );

//Spawn Snowflakes at Random positions with random velocity(fallspeed)
for ( let i = 0; i < 10000; i ++ ) {

	const x = Math.floor(Math.random() * maxRange - minRange);
	const y = 0.1*(Math.random() * 12000) ^ 2 + 1000;
	const z = Math.floor(Math.random() * maxRange - minRange);

	vertices.push( x, y, z );

	velocities.push(
		Math.floor(Math.random() * 6 -3) * 0.1,
		Math.floor(Math.random() * 5 + 0.12) * 0.18,
		Math.floor(Math.random() * 6 - 3) * 0.1
	);

}

geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
geometry.setAttribute( 'velocity', new THREE.Float32BufferAttribute( velocities, 3) );


parameters = [
	[[ 1.0, 0.2, 0.5 ], sprite2, 3 ],
	[[ 0.95, 0.1, 0.5 ], sprite3, 2.5 ],
	[[ 0.90, 0.05, 0.5 ], sprite1, 3 ],
	[[ 0.85, 0, 0.5 ], sprite5, 1.5 ],
	[[ 0.80, 0, 0.5 ], sprite4, 2 ],
	[[ 0.80, 0, 0.5 ], sprite6, 1.5 ]
];

//Add all Particles to the Scene
for ( let i = 0; i < parameters.length; i ++ ) {

	const color = parameters[ i ][ 0 ];
	const sprite = parameters[ i ][ 1 ];
	const size = parameters[ i ][ 2 ];

	materials[ i ] = new THREE.PointsMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent: true } );
	materials[ i ].color.setHSL( color[ 0 ], color[ 1 ], color[ 2 ] );

	particles = new THREE.Points( geometry, materials[ i ] );
	scene.add( particles );
}

//Add light to the Scene
const light = new THREE.AmbientLight(0xFFFFFF, 0.7);
light.position.set(100, 100, 100);
scene.add(light);

let directionLight = new THREE.DirectionalLight(0xFFFFFF, 0.2);
directionLight.position.set(10,100,10);
directionLight.target.position.set(0,0,0);

scene.add(directionLight);
scene.add(directionLight.target);

let pointLight = new THREE.PointLight(0xa6350f, 1.0);
pointLight.position.set(0,200,0);

scene.add(pointLight);

//For Updates in the Scene e.g. the falling snow needs to be updated
function animate() {

    requestAnimationFrame( animate );
    updateParticles();
    renderer.render( scene, camera );
};

//Calculates the snowfall for every particle
function updateParticles(){
	for (let i = 0; i < 10000 * 3; i += 3){
		particles.geometry.attributes.position.array[i] -= particles.geometry.attributes.velocity.array[i];
		particles.geometry.attributes.position.array[i+1] -= particles.geometry.attributes.velocity.array[i+1];
		particles.geometry.attributes.position.array[i+2] -= particles.geometry.attributes.velocity.array[i+2];

		if(particles.geometry.attributes.position.array[i+1] < 0){
			particles.geometry.attributes.position.array[i] = Math.floor(Math.random() * maxRange - minRange);
			particles.geometry.attributes.position.array[i+1] = 0.1*(Math.random() * 6000) ^ 2 + 200;
			particles.geometry.attributes.position.array[i+2] = Math.floor(Math.random() * maxRange - minRange);
		}
	}

	particles.geometry.attributes.position.needsUpdate = true;
}

animate();