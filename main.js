import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import WebGL from 'three/addons/capabilities/WebGL.js';

let camera, scene, renderer, light;
let raycaster, pointer;
let loader, fontLoader;

const posXMax = 5;
const posYMax = 5;
const posZMax = 4;

const sceneDonuts = [];

const allAxis = ['x', 'y', 'z'];

const init = () => {
  if ( WebGL.isWebGLAvailable() ) {
    // Set Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color('pink')
    
    // Set Camera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 5000 );
    camera.position.set( 0, 0, 10 );
    camera.lookAt( 0, 0, 0 );
    
    // Set Lighting
    light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 1, 1, 1 ).normalize();
    scene.add( light );
    
    // Set Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild( renderer.domElement );
  
    // Set Controls
    // const controls = new OrbitControls( camera, renderer.domElement );
    // controls.enableDamping = true;
  
    // Set Raycasting
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
  
    // Loaders
    loader = new GLTFLoader();
    fontLoader = new FontLoader();
  
    loadFont();

    // Shoot a raycast
    window.addEventListener('click', onClick);
    window.addEventListener('touchstart', onClick);
  
    // Handles resizing of window
    window.addEventListener('resize', onWindowResize)

  } else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById( 'container' ).appendChild( warning );
  
  };
};

// Update frames
const update = () => {
  // controls.update()

  // Update the picking ray with the camera and pointer position
  raycaster.setFromCamera( pointer, camera );

  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects( scene.children );
  if(intersects.length > 0) {
    for (let i = 0; i < intersects.length; i ++) {
      if(intersects[i].object.name === 'donutText') {
        loadDonut();
      }
    }

    // Reset pointer
    pointer.x = null;
    pointer.y = null;
  }
  if(sceneDonuts.length > 0) {
    for(let i = 0; i < sceneDonuts.length; i++){
      let chosenAxis = allAxis[sceneDonuts[i]['axis']]
      sceneDonuts[i].donut.rotation[chosenAxis] += .01;
    }
  }
  requestAnimationFrame( update );
  renderer.render( scene, camera );
};

const loadFont = () => {
  fontLoader.load( './fonts/droid/droid_sans_bold.typeface.json', function ( font ) {
    const geometry = new TextGeometry( 'Click for donut', {
      font,
      size: 1,
      height: 0.25,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: .01,
      bevelSize: .01,
      bevelOffset: 0,
      bevelSegments: 5
    });
    geometry.center()
    const material = new THREE.MeshPhongMaterial( { color: 0xeb8c34 } );
    const text = new THREE.Mesh( geometry, material );
    text.name = 'donutText'
    scene.add(text)
  });
};

// Donut looks like trash in three.js compared to the blender model
const loadDonut = () => {
  loader.load( './assets/donut.glb', ( gltf ) => {
    const donut = gltf.scene;
    donut.scale.set(10, 10, 10);
    donut.position.x = posRandomizer(posXMax);
    donut.position.y = posRandomizer(posYMax);
    donut.position.z = posRandomizer(posZMax);

    donut.rotation.x = Math.random() * Math.PI;
    sceneDonuts.push({
      'donut': donut,
      'axis': Math.floor(Math.random() * allAxis.length),
    });
    scene.add(donut);
  
  }, undefined, (error) => {
  
    console.error( error );
  
  });
};

const onClick = (e) => {
  
  // calculate pointer position in normalized device coordinates
  // (-1 to +1) for both components
  pointer.x = ( e.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
};

const onWindowResize = (e) => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
};

const posRandomizer = (max) => {
  let num = Math.random() * max;
  num *= Math.round(Math.random()) ? 1 : -1;
  return num;
};

init();
update();
// Code reference dump

// const createCube = () => {
//   const geometry = new THREE.BoxGeometry( 1, 1, 1 );
//   const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
//   const cube = new THREE.Mesh( geometry, material );
//   scene.add(cube);
//   return cube;
// }

// const createLine = () => {
//   const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );

//   const points = [];
//   points.push( new THREE.Vector3( - 10, 0, 0 ) );
//   points.push( new THREE.Vector3( 0, 10, 0 ) );
//   points.push( new THREE.Vector3( 10, 0, 0 ) );

//   const geometry = new THREE.BufferGeometry().setFromPoints( points );
//   const line = new THREE.Line( geometry, material );
//   scene.add( line );
// }

// camera.position.z = 5;

// createLine();
// const cube = createCube();

// const update = () => {
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
// }