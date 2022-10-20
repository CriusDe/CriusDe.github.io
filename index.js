import { GLTFLoader } from './libs/GLTFLoader.js'
import * as THREE from './libs/three.js'
import { OrbitControls } from './libs/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.1, 1500 );

let controls, parameters;
const materials = [];

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x020824);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

scene.fog = new THREE.FogExp2( 0x000000, 0.0008 );

camera.position.z = 700;
camera.position.y = 200;


const loader = new GLTFLoader();

loader.load( 'models/untitled.glb', function ( gltf ) {

    scene.add( gltf.scene );

}, undefined, function ( error ) {

    console.error( error );

} );
loader.load( 'models/floor.glb', function ( gltf ) {

    scene.add( gltf.scene );

}, undefined, function ( error ) {

    console.error( error );

} );



// controls

controls = new OrbitControls( camera, renderer.domElement );
controls.listenToKeyEvents( window ); // optional

//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.05;

controls.screenSpacePanning = false;

controls.minDistance = 10;
controls.maxDistance = 1200;

controls.maxPolarAngle = Math.PI / 2;

				const maxRange = 3000, minRange = maxRange / 2;
				const geometry = new THREE.BufferGeometry();
				const vertices = [];
				const velocities = [];
				let particles;

				const textureLoader = new THREE.TextureLoader();

				const sprite1 = textureLoader.load( './textures/Snowflake_big.png' );
				const sprite2 = textureLoader.load( './textures/Snowflake_big_blurr.png' );
				const sprite3 = textureLoader.load( './textures/Snowflake_medium.png' );
				const sprite4 = textureLoader.load( './textures/Snowflake_medium_blurr.png' );
				const sprite5 = textureLoader.load( './textures/Snowflake_small.png' );
				const sprite6 = textureLoader.load( './textures/Snowflake_small_blurr.png' );

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
					[[ 1.0, 0.2, 0.5 ], sprite2, 2 ],
					[[ 0.95, 0.1, 0.5 ], sprite3, 1.5 ],
					[[ 0.90, 0.05, 0.5 ], sprite1, 2 ],
					[[ 0.85, 0, 0.5 ], sprite5, 0.5 ],
					[[ 0.80, 0, 0.5 ], sprite4, 1 ],
					[[ 0.80, 0, 0.5 ], sprite6, 0.5 ]
				];

				for ( let i = 0; i < parameters.length; i ++ ) {

					const color = parameters[ i ][ 0 ];
					const sprite = parameters[ i ][ 1 ];
					const size = parameters[ i ][ 2 ];

					materials[ i ] = new THREE.PointsMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent: true } );
					materials[ i ].color.setHSL( color[ 0 ], color[ 1 ], color[ 2 ] );

					particles = new THREE.Points( geometry, materials[ i ] );

					// particles.rotation.x = Math.random() * 6;
					// particles.rotation.y = Math.random() * 6;
					// particles.rotation.z = Math.random() * 6;

					scene.add( particles );

				}


const light = new THREE.AmbientLight(0xffaaff);
light.position.set(10, 10, 10);
scene.add(light);


function animate() {

    const time = Date.now() * 0.00005;
    requestAnimationFrame( animate );
    updateParticles();
    // for ( let i = 0; i < scene.children.length; i ++ ) {

    //     const object = scene.children[ i ];

    //     if ( object instanceof THREE.Points ) {

    //         object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );

    //     }

    // }

    renderer.render( scene, camera );
};

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