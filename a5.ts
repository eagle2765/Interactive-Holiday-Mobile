///<reference path='./typings/tsd.d.ts'/>
/*
 * Portions of this code are
 * Copyright 2015, Allen Chen.
 */


var container, stats, permalink, hex, color;

var colorArray = [];
colorArray.push(0xf31254);
colorArray.push(0xf0842a);
colorArray.push(0x0ebbc2);
colorArray.push(0xa81e8b);
colorArray.push(0xbbd323);



//rgb, may be useful later
/*
colorArray.push(new THREE.Color(227, 17, 78));
colorArray.push(new THREE.Color(245, 125, 28));
colorArray.push(new THREE.Color(11, 182, 199));
colorArray.push(new THREE.Color(164, 22, 134));
colorArray.push(new THREE.Color(187, 211, 35));
*/

			var camera, cameraTarget, scene, renderer;

			var composer;
			var effectFXAA;

			var group, textMesh1, textGeo, material;

			var firstLetter = true;

			var text = "Happy Holidays",
            	height = 20,
				size = 70,
				hover = -120,

				curveSegments = 4,

				bevelThickness = 2,
				bevelSize = 1.5,
				bevelSegments = 3,
				bevelEnabled = true,

				font = "helvetiker", // helvetiker, optimer, gentilis, droid sans, droid serif
				weight = "bold", // normal bold
				style = "normal"; // normal italic

//for clicking letters
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

//array for letters spinning
var spinning = [];
// used for spinning letters
var clock = new THREE.Clock();
var time;
var delta;

//scene
scene = new THREE.Scene();
scene.fog = new THREE.Fog( 0x000000, 250, 1400 );

//container for graphics          
container = document.createElement( 'div' );
document.body.appendChild( container );

//camera
camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.1, 1000 );
//camera.position.set( 0, 400, 700 );
camera.position.set (0, 0, 1000);
//camera.lookAt(new THREE.Vector3( 0, 150, 0 ));
camera.lookAt(scene.position);


scene.add(camera);

//Lights
var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
dirLight.position.set( 0, 0, 1 ).normalize();
scene.add( dirLight );

var pointLight = new THREE.PointLight( 0xffffff, 3 );
pointLight.position.set( 0, 100, 90 );
scene.add( pointLight );

scene.fog = new THREE.Fog( 0x000000, 250, 1400 );




group = new THREE.Group();
group.position.y = 100;

scene.add( group );

                
// Renderer
renderer = new THREE.WebGLRenderer( {alpha: true, antialias: true} );   
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );


camera.position.z = 1000;

// event listeners
window.addEventListener( 'resize', windowResize, false);
document.addEventListener( 'keypress', onDocumentKeyPress, false);
document.addEventListener( 'keydown', onDocumentKeyDown, false);
document.addEventListener( 'mousemove', onMouseMove, false);
document.addEventListener( 'mousedown', onMouseClick, false);

//mouse clicking on letters
function onMouseClick( event ) {
    //update mouse position
    mouse.x = ( event.clientX / window.innerWidth ) * 2  - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    // update the picking ray with the camera and mouse position	
	raycaster.setFromCamera( mouse, camera );	
    
    // calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( group.children );
    
    if (intersects.length != 0) {
        var sound = new Howl( {
        urls: ['/music/hadouken.mp3']
        }).play();
    }
    
    

    //add intersected letters to an array. Also add speed of letter spin to the same array
    for (var i = 0; i < intersects.length; i++) {
        var xintersection = intersects[i].point.x;
        var xleft = intersects[i].object.position.x;
        
        var helper = new THREE.BoundingBoxHelper(intersects[i].object);
        helper.update();
        var xsize = helper.box.max.x - helper.box.min.x;
        
        var xright = xleft + xsize;
        
        var fourths = xsize /4;
        //the letter spinning and the initial velocity
        // outer spin
        if (xintersection < xleft + fourths || xintersection > xleft + 3 * fourths) {
            spinning.push([intersects[i], 34.8]);
        } else {
        //normal spin
            spinning.push([intersects[i], 20]);
        }
        
        
    }
}

//mouse move background image
function onMouseMove( event ) {
    var pagex = event.pageX - window.innerHeight/2;
    var pagey = event.pageY - window.innerHeight/2;
    var newx = 25/window.innerWidth * pagex * -1 - 25;
    var newy = 25/window.innerHeight * pagey * -1 -50;
    document.getElementById('top-image').style.backgroundPosition = newx + "px " + newy + "px";
    


}

// window resize function
function windowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize( window.innerWidth, window.innerHeight);
    
}

// delete everything if backspace is pressed
function onDocumentKeyDown( event ) {

    if ( firstLetter ) {

        firstLetter = false;
        text = "";

    }

    var keyCode = event.keyCode;

    // backspace

    if ( keyCode == 8 ) {

        event.preventDefault();

        for (var i = group.children.length - 1; i >= 0; i--) {
            group.remove(group.children[0]);
        }

        return false;

    }

}
            
//add letter to 3d string
function onDocumentKeyPress( event ) {
    var KeyCode = event.which;
    
    //backspace
    if (KeyCode == 8) {
        event.preventDefault();
    } else {
        var ch = String.fromCharCode( KeyCode );
		text = ch;

	   createText();
    }
}


var render = function () {
    requestAnimationFrame( render );
    time = clock.getElapsedTime();
    delta = clock.getDelta();

    
    for ( var i = 0; i < spinning.length; i++ ) {
        if (spinning[ i ][1] > 0) {
            spinning[ i ][0].object.rotation.y += spinning[i][1] * Math.PI / 180;
            spinning[i][1] -= 0.57;
        }
        
	
	}
    renderer.render(scene, camera);
};



function createText() {

				textGeo = new THREE.TextGeometry( text, {

					size: size,
					height: height,
					curveSegments: curveSegments,

					font: font,
					weight: weight,
					style: style,

					bevelThickness: bevelThickness,
					bevelSize: bevelSize,
					bevelEnabled: bevelEnabled,


				});

				textGeo.computeBoundingBox();
				textGeo.computeVertexNormals();

			   // give the space a text width
	           if (text == " ") {
                    textGeo.boundingBox.max.x = 40;
                    textGeo.boundingBox.min.x = 0;
                }

                
				var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
                
     
                var randomcolor = Math.floor(Math.random() * (6 - 0 + 1)) + 0;
                material = new THREE.MeshFaceMaterial( [
					new THREE.MeshPhongMaterial( { color: colorArray[randomcolor], shading: THREE.FlatShading } ), // front
					new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.SmoothShading } ) // side
				] );
                
				textMesh1 = new THREE.Mesh( textGeo, material );

				textMesh1.position.x = centerOffset;
				textMesh1.position.y = hover - 50 + Math.random() * 100;
				textMesh1.position.z = 100;

				textMesh1.rotation.x = 0;
				textMesh1.rotation.y = 0;
                textMesh1.rotation.z = Math.random() * 0.2 - 0.1;

				group.add( textMesh1 );
                
                // no line if text is space
                if (text != " ") {

                    // now add a line to the letter
                    var linematerial = new THREE.LineBasicMaterial({
                            color: colorArray[randomcolor],
                            });
                            
                    var geometry = new THREE.Geometry();
                    geometry.vertices.push(
                        new THREE.Vector3( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x, 1000, 0 ),
                        new THREE.Vector3( textGeo.boundingBox.max.x, 0, 0 ),
                        new THREE.Vector3( textGeo.boundingBox.min.x, 0, 0 )
                    );     
                    var line = new THREE.Line( geometry, linematerial );
                    textMesh1.add( line );
                }
                if (group.children.length != 1) {
                    adjustText();
                }

			}
 
function adjustText() {
    var numletters = group.children.length;
    var temp2
    //size of new letter
    var temp = group.children[numletters - 1].geometry.boundingBox.max.x - group.children[numletters - 1].geometry.boundingBox.min.x;
        //size of second to last letter
    temp2 = group.children[numletters - 2].geometry.boundingBox.max.x - group.children[numletters - 2].geometry.boundingBox.min.x;

    
    for (var i = 0; i < numletters - 1; i++) {
        group.children[i].position.x -= temp/2;
    }
    
    //tack the most recent letter onto the end
    group.children[numletters - 1].position.x = group.children[numletters - 2].position.x + temp2; 
    
    
}
render();