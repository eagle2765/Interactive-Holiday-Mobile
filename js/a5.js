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
var text = "Happy Holidays", height = 20, size = 70, hover = -120, curveSegments = 4, bevelThickness = 2, bevelSize = 1.5, bevelSegments = 3, bevelEnabled = true, font = "helvetiker", // helvetiker, optimer, gentilis, droid sans, droid serif
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
scene.fog = new THREE.Fog(0x000000, 250, 1400);
//container for graphics          
container = document.createElement('div');
document.body.appendChild(container);
//camera
camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
//camera.position.set( 0, 400, 700 );
camera.position.set(0, 0, 1000);
//camera.lookAt(new THREE.Vector3( 0, 150, 0 ));
camera.lookAt(scene.position);
scene.add(camera);
//Lights
var dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
dirLight.position.set(0, 0, 1).normalize();
scene.add(dirLight);
var pointLight = new THREE.PointLight(0xffffff, 3);
pointLight.position.set(0, 100, 90);
scene.add(pointLight);
scene.fog = new THREE.Fog(0x000000, 250, 1400);
group = new THREE.Group();
group.position.y = 100;
scene.add(group);
// Renderer
renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);
camera.position.z = 1000;
// event listeners
window.addEventListener('resize', windowResize, false);
document.addEventListener('keypress', onDocumentKeyPress, false);
document.addEventListener('keydown', onDocumentKeyDown, false);
document.addEventListener('mousemove', onMouseMove, false);
document.addEventListener('mousedown', onMouseClick, false);
//mouse clicking on letters
function onMouseClick(event) {
    //update mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    // update the picking ray with the camera and mouse position	
    raycaster.setFromCamera(mouse, camera);
    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects(group.children);
    if (intersects.length != 0) {
        var sound = new Howl({
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
        var fourths = xsize / 4;
        //the letter spinning and the initial velocity
        // outer spin
        if (xintersection < xleft + fourths || xintersection > xleft + 3 * fourths) {
            spinning.push([intersects[i], 34.8]);
        }
        else {
            //normal spin
            spinning.push([intersects[i], 20]);
        }
    }
}
//mouse move background image
function onMouseMove(event) {
    var pagex = event.pageX - window.innerHeight / 2;
    var pagey = event.pageY - window.innerHeight / 2;
    var newx = 25 / window.innerWidth * pagex * -1 - 25;
    var newy = 25 / window.innerHeight * pagey * -1 - 50;
    document.getElementById('top-image').style.backgroundPosition = newx + "px " + newy + "px";
}
// window resize function
function windowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
// delete everything if backspace is pressed
function onDocumentKeyDown(event) {
    if (firstLetter) {
        firstLetter = false;
        text = "";
    }
    var keyCode = event.keyCode;
    // backspace
    if (keyCode == 8) {
        event.preventDefault();
        for (var i = group.children.length - 1; i >= 0; i--) {
            group.remove(group.children[0]);
        }
        return false;
    }
}
//add letter to 3d string
function onDocumentKeyPress(event) {
    var KeyCode = event.which;
    //backspace
    if (KeyCode == 8) {
        event.preventDefault();
    }
    else {
        var ch = String.fromCharCode(KeyCode);
        text = ch;
        createText();
    }
}
var render = function () {
    requestAnimationFrame(render);
    time = clock.getElapsedTime();
    delta = clock.getDelta();
    for (var i = 0; i < spinning.length; i++) {
        if (spinning[i][1] > 0) {
            spinning[i][0].object.rotation.y += spinning[i][1] * Math.PI / 180;
            spinning[i][1] -= 0.57;
        }
    }
    renderer.render(scene, camera);
};
function createText() {
    textGeo = new THREE.TextGeometry(text, {
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
    var centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
    var randomcolor = Math.floor(Math.random() * (6 - 0 + 1)) + 0;
    material = new THREE.MeshFaceMaterial([
        new THREE.MeshPhongMaterial({ color: colorArray[randomcolor], shading: THREE.FlatShading }),
        new THREE.MeshPhongMaterial({ color: 0xffffff, shading: THREE.SmoothShading }) // side
    ]);
    textMesh1 = new THREE.Mesh(textGeo, material);
    textMesh1.position.x = centerOffset;
    textMesh1.position.y = hover - 50 + Math.random() * 100;
    textMesh1.position.z = 100;
    textMesh1.rotation.x = 0;
    textMesh1.rotation.y = 0;
    textMesh1.rotation.z = Math.random() * 0.2 - 0.1;
    group.add(textMesh1);
    // no line if text is space
    if (text != " ") {
        // now add a line to the letter
        var linematerial = new THREE.LineBasicMaterial({
            color: colorArray[randomcolor],
        });
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(textGeo.boundingBox.max.x - textGeo.boundingBox.min.x, 1000, 0), new THREE.Vector3(textGeo.boundingBox.max.x, 0, 0), new THREE.Vector3(textGeo.boundingBox.min.x, 0, 0));
        var line = new THREE.Line(geometry, linematerial);
        textMesh1.add(line);
    }
    if (group.children.length != 1) {
        adjustText();
    }
}
function adjustText() {
    var numletters = group.children.length;
    var temp2;
    //size of new letter
    var temp = group.children[numletters - 1].geometry.boundingBox.max.x - group.children[numletters - 1].geometry.boundingBox.min.x;
    //size of second to last letter
    temp2 = group.children[numletters - 2].geometry.boundingBox.max.x - group.children[numletters - 2].geometry.boundingBox.min.x;
    for (var i = 0; i < numletters - 1; i++) {
        group.children[i].position.x -= temp / 2;
    }
    //tack the most recent letter onto the end
    group.children[numletters - 1].position.x = group.children[numletters - 2].position.x + temp2;
}
render();

//# sourceMappingURL=data:application/json;base64,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QyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUM3SCwrQkFBK0I7SUFDbkMsS0FBSyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFHOUgsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDdEMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLElBQUksR0FBQyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELDBDQUEwQztJQUMxQyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO0FBR2xHLENBQUM7QUFDRCxNQUFNLEVBQUUsQ0FBQyIsImZpbGUiOiJhNS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLzxyZWZlcmVuY2UgcGF0aD0nLi90eXBpbmdzL3RzZC5kLnRzJy8+XHJcbi8qXHJcbiAqIFBvcnRpb25zIG9mIHRoaXMgY29kZSBhcmVcclxuICogQ29weXJpZ2h0IDIwMTUsIEFsbGVuIENoZW4uXHJcbiAqL1xyXG5cclxuXHJcbnZhciBjb250YWluZXIsIHN0YXRzLCBwZXJtYWxpbmssIGhleCwgY29sb3I7XHJcblxyXG52YXIgY29sb3JBcnJheSA9IFtdO1xyXG5jb2xvckFycmF5LnB1c2goMHhmMzEyNTQpO1xyXG5jb2xvckFycmF5LnB1c2goMHhmMDg0MmEpO1xyXG5jb2xvckFycmF5LnB1c2goMHgwZWJiYzIpO1xyXG5jb2xvckFycmF5LnB1c2goMHhhODFlOGIpO1xyXG5jb2xvckFycmF5LnB1c2goMHhiYmQzMjMpO1xyXG5cclxuXHJcblxyXG4vL3JnYiwgbWF5IGJlIHVzZWZ1bCBsYXRlclxyXG4vKlxyXG5jb2xvckFycmF5LnB1c2gobmV3IFRIUkVFLkNvbG9yKDIyNywgMTcsIDc4KSk7XHJcbmNvbG9yQXJyYXkucHVzaChuZXcgVEhSRUUuQ29sb3IoMjQ1LCAxMjUsIDI4KSk7XHJcbmNvbG9yQXJyYXkucHVzaChuZXcgVEhSRUUuQ29sb3IoMTEsIDE4MiwgMTk5KSk7XHJcbmNvbG9yQXJyYXkucHVzaChuZXcgVEhSRUUuQ29sb3IoMTY0LCAyMiwgMTM0KSk7XHJcbmNvbG9yQXJyYXkucHVzaChuZXcgVEhSRUUuQ29sb3IoMTg3LCAyMTEsIDM1KSk7XHJcbiovXHJcblxyXG5cdFx0XHR2YXIgY2FtZXJhLCBjYW1lcmFUYXJnZXQsIHNjZW5lLCByZW5kZXJlcjtcclxuXHJcblx0XHRcdHZhciBjb21wb3NlcjtcclxuXHRcdFx0dmFyIGVmZmVjdEZYQUE7XHJcblxyXG5cdFx0XHR2YXIgZ3JvdXAsIHRleHRNZXNoMSwgdGV4dEdlbywgbWF0ZXJpYWw7XHJcblxyXG5cdFx0XHR2YXIgZmlyc3RMZXR0ZXIgPSB0cnVlO1xyXG5cclxuXHRcdFx0dmFyIHRleHQgPSBcIkhhcHB5IEhvbGlkYXlzXCIsXHJcbiAgICAgICAgICAgIFx0aGVpZ2h0ID0gMjAsXHJcblx0XHRcdFx0c2l6ZSA9IDcwLFxyXG5cdFx0XHRcdGhvdmVyID0gLTEyMCxcclxuXHJcblx0XHRcdFx0Y3VydmVTZWdtZW50cyA9IDQsXHJcblxyXG5cdFx0XHRcdGJldmVsVGhpY2tuZXNzID0gMixcclxuXHRcdFx0XHRiZXZlbFNpemUgPSAxLjUsXHJcblx0XHRcdFx0YmV2ZWxTZWdtZW50cyA9IDMsXHJcblx0XHRcdFx0YmV2ZWxFbmFibGVkID0gdHJ1ZSxcclxuXHJcblx0XHRcdFx0Zm9udCA9IFwiaGVsdmV0aWtlclwiLCAvLyBoZWx2ZXRpa2VyLCBvcHRpbWVyLCBnZW50aWxpcywgZHJvaWQgc2FucywgZHJvaWQgc2VyaWZcclxuXHRcdFx0XHR3ZWlnaHQgPSBcImJvbGRcIiwgLy8gbm9ybWFsIGJvbGRcclxuXHRcdFx0XHRzdHlsZSA9IFwibm9ybWFsXCI7IC8vIG5vcm1hbCBpdGFsaWNcclxuXHJcbi8vZm9yIGNsaWNraW5nIGxldHRlcnNcclxudmFyIHJheWNhc3RlciA9IG5ldyBUSFJFRS5SYXljYXN0ZXIoKTtcclxudmFyIG1vdXNlID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxuXHJcbi8vYXJyYXkgZm9yIGxldHRlcnMgc3Bpbm5pbmdcclxudmFyIHNwaW5uaW5nID0gW107XHJcbi8vIHVzZWQgZm9yIHNwaW5uaW5nIGxldHRlcnNcclxudmFyIGNsb2NrID0gbmV3IFRIUkVFLkNsb2NrKCk7XHJcbnZhciB0aW1lO1xyXG52YXIgZGVsdGE7XHJcblxyXG4vL3NjZW5lXHJcbnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcbnNjZW5lLmZvZyA9IG5ldyBUSFJFRS5Gb2coIDB4MDAwMDAwLCAyNTAsIDE0MDAgKTtcclxuXHJcbi8vY29udGFpbmVyIGZvciBncmFwaGljcyAgICAgICAgICBcclxuY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcclxuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggY29udGFpbmVyICk7XHJcblxyXG4vL2NhbWVyYVxyXG5jYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoIDMwLCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgMC4xLCAxMDAwICk7XHJcbi8vY2FtZXJhLnBvc2l0aW9uLnNldCggMCwgNDAwLCA3MDAgKTtcclxuY2FtZXJhLnBvc2l0aW9uLnNldCAoMCwgMCwgMTAwMCk7XHJcbi8vY2FtZXJhLmxvb2tBdChuZXcgVEhSRUUuVmVjdG9yMyggMCwgMTUwLCAwICkpO1xyXG5jYW1lcmEubG9va0F0KHNjZW5lLnBvc2l0aW9uKTtcclxuXHJcblxyXG5zY2VuZS5hZGQoY2FtZXJhKTtcclxuXHJcbi8vTGlnaHRzXHJcbnZhciBkaXJMaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KCAweGZmZmZmZiwgMC4xMjUgKTtcclxuZGlyTGlnaHQucG9zaXRpb24uc2V0KCAwLCAwLCAxICkubm9ybWFsaXplKCk7XHJcbnNjZW5lLmFkZCggZGlyTGlnaHQgKTtcclxuXHJcbnZhciBwb2ludExpZ2h0ID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoIDB4ZmZmZmZmLCAzICk7XHJcbnBvaW50TGlnaHQucG9zaXRpb24uc2V0KCAwLCAxMDAsIDkwICk7XHJcbnNjZW5lLmFkZCggcG9pbnRMaWdodCApO1xyXG5cclxuc2NlbmUuZm9nID0gbmV3IFRIUkVFLkZvZyggMHgwMDAwMDAsIDI1MCwgMTQwMCApO1xyXG5cclxuXHJcblxyXG5cclxuZ3JvdXAgPSBuZXcgVEhSRUUuR3JvdXAoKTtcclxuZ3JvdXAucG9zaXRpb24ueSA9IDEwMDtcclxuXHJcbnNjZW5lLmFkZCggZ3JvdXAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBcclxuLy8gUmVuZGVyZXJcclxucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigge2FscGhhOiB0cnVlLCBhbnRpYWxpYXM6IHRydWV9ICk7ICAgXHJcbnJlbmRlcmVyLnNldFBpeGVsUmF0aW8oIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvICk7XHJcbnJlbmRlcmVyLnNldFNpemUoIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQgKTtcclxuY29udGFpbmVyLmFwcGVuZENoaWxkKCByZW5kZXJlci5kb21FbGVtZW50ICk7XHJcblxyXG5cclxuY2FtZXJhLnBvc2l0aW9uLnogPSAxMDAwO1xyXG5cclxuLy8gZXZlbnQgbGlzdGVuZXJzXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncmVzaXplJywgd2luZG93UmVzaXplLCBmYWxzZSk7XHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlwcmVzcycsIG9uRG9jdW1lbnRLZXlQcmVzcywgZmFsc2UpO1xyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIG9uRG9jdW1lbnRLZXlEb3duLCBmYWxzZSk7XHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSwgZmFsc2UpO1xyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgb25Nb3VzZUNsaWNrLCBmYWxzZSk7XHJcblxyXG4vL21vdXNlIGNsaWNraW5nIG9uIGxldHRlcnNcclxuZnVuY3Rpb24gb25Nb3VzZUNsaWNrKCBldmVudCApIHtcclxuICAgIC8vdXBkYXRlIG1vdXNlIHBvc2l0aW9uXHJcbiAgICBtb3VzZS54ID0gKCBldmVudC5jbGllbnRYIC8gd2luZG93LmlubmVyV2lkdGggKSAqIDIgIC0gMTtcclxuICAgIG1vdXNlLnkgPSAtICggZXZlbnQuY2xpZW50WSAvIHdpbmRvdy5pbm5lckhlaWdodCApICogMiArIDE7XHJcbiAgICBcclxuICAgIC8vIHVwZGF0ZSB0aGUgcGlja2luZyByYXkgd2l0aCB0aGUgY2FtZXJhIGFuZCBtb3VzZSBwb3NpdGlvblx0XHJcblx0cmF5Y2FzdGVyLnNldEZyb21DYW1lcmEoIG1vdXNlLCBjYW1lcmEgKTtcdFxyXG4gICAgXHJcbiAgICAvLyBjYWxjdWxhdGUgb2JqZWN0cyBpbnRlcnNlY3RpbmcgdGhlIHBpY2tpbmcgcmF5XHJcblx0dmFyIGludGVyc2VjdHMgPSByYXljYXN0ZXIuaW50ZXJzZWN0T2JqZWN0cyggZ3JvdXAuY2hpbGRyZW4gKTtcclxuICAgIFxyXG4gICAgaWYgKGludGVyc2VjdHMubGVuZ3RoICE9IDApIHtcclxuICAgICAgICB2YXIgc291bmQgPSBuZXcgSG93bCgge1xyXG4gICAgICAgIHVybHM6IFsnL211c2ljL2hhZG91a2VuLm1wMyddXHJcbiAgICAgICAgfSkucGxheSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBcclxuXHJcbiAgICAvL2FkZCBpbnRlcnNlY3RlZCBsZXR0ZXJzIHRvIGFuIGFycmF5LiBBbHNvIGFkZCBzcGVlZCBvZiBsZXR0ZXIgc3BpbiB0byB0aGUgc2FtZSBhcnJheVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbnRlcnNlY3RzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHhpbnRlcnNlY3Rpb24gPSBpbnRlcnNlY3RzW2ldLnBvaW50Lng7XHJcbiAgICAgICAgdmFyIHhsZWZ0ID0gaW50ZXJzZWN0c1tpXS5vYmplY3QucG9zaXRpb24ueDtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgaGVscGVyID0gbmV3IFRIUkVFLkJvdW5kaW5nQm94SGVscGVyKGludGVyc2VjdHNbaV0ub2JqZWN0KTtcclxuICAgICAgICBoZWxwZXIudXBkYXRlKCk7XHJcbiAgICAgICAgdmFyIHhzaXplID0gaGVscGVyLmJveC5tYXgueCAtIGhlbHBlci5ib3gubWluLng7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHhyaWdodCA9IHhsZWZ0ICsgeHNpemU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIGZvdXJ0aHMgPSB4c2l6ZSAvNDtcclxuICAgICAgICAvL3RoZSBsZXR0ZXIgc3Bpbm5pbmcgYW5kIHRoZSBpbml0aWFsIHZlbG9jaXR5XHJcbiAgICAgICAgLy8gb3V0ZXIgc3BpblxyXG4gICAgICAgIGlmICh4aW50ZXJzZWN0aW9uIDwgeGxlZnQgKyBmb3VydGhzIHx8IHhpbnRlcnNlY3Rpb24gPiB4bGVmdCArIDMgKiBmb3VydGhzKSB7XHJcbiAgICAgICAgICAgIHNwaW5uaW5nLnB1c2goW2ludGVyc2VjdHNbaV0sIDM0LjhdKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vbm9ybWFsIHNwaW5cclxuICAgICAgICAgICAgc3Bpbm5pbmcucHVzaChbaW50ZXJzZWN0c1tpXSwgMjBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICB9XHJcbn1cclxuXHJcbi8vbW91c2UgbW92ZSBiYWNrZ3JvdW5kIGltYWdlXHJcbmZ1bmN0aW9uIG9uTW91c2VNb3ZlKCBldmVudCApIHtcclxuICAgIHZhciBwYWdleCA9IGV2ZW50LnBhZ2VYIC0gd2luZG93LmlubmVySGVpZ2h0LzI7XHJcbiAgICB2YXIgcGFnZXkgPSBldmVudC5wYWdlWSAtIHdpbmRvdy5pbm5lckhlaWdodC8yO1xyXG4gICAgdmFyIG5ld3ggPSAyNS93aW5kb3cuaW5uZXJXaWR0aCAqIHBhZ2V4ICogLTEgLSAyNTtcclxuICAgIHZhciBuZXd5ID0gMjUvd2luZG93LmlubmVySGVpZ2h0ICogcGFnZXkgKiAtMSAtNTA7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9wLWltYWdlJykuc3R5bGUuYmFja2dyb3VuZFBvc2l0aW9uID0gbmV3eCArIFwicHggXCIgKyBuZXd5ICsgXCJweFwiO1xyXG4gICAgXHJcblxyXG5cclxufVxyXG5cclxuLy8gd2luZG93IHJlc2l6ZSBmdW5jdGlvblxyXG5mdW5jdGlvbiB3aW5kb3dSZXNpemUoKSB7XHJcbiAgICBjYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICBjYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xyXG4gICAgXHJcbiAgICByZW5kZXJlci5zZXRTaXplKCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgIFxyXG59XHJcblxyXG4vLyBkZWxldGUgZXZlcnl0aGluZyBpZiBiYWNrc3BhY2UgaXMgcHJlc3NlZFxyXG5mdW5jdGlvbiBvbkRvY3VtZW50S2V5RG93biggZXZlbnQgKSB7XHJcblxyXG4gICAgaWYgKCBmaXJzdExldHRlciApIHtcclxuXHJcbiAgICAgICAgZmlyc3RMZXR0ZXIgPSBmYWxzZTtcclxuICAgICAgICB0ZXh0ID0gXCJcIjtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGtleUNvZGUgPSBldmVudC5rZXlDb2RlO1xyXG5cclxuICAgIC8vIGJhY2tzcGFjZVxyXG5cclxuICAgIGlmICgga2V5Q29kZSA9PSA4ICkge1xyXG5cclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gZ3JvdXAuY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgZ3JvdXAucmVtb3ZlKGdyb3VwLmNoaWxkcmVuWzBdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG59XHJcbiAgICAgICAgICAgIFxyXG4vL2FkZCBsZXR0ZXIgdG8gM2Qgc3RyaW5nXHJcbmZ1bmN0aW9uIG9uRG9jdW1lbnRLZXlQcmVzcyggZXZlbnQgKSB7XHJcbiAgICB2YXIgS2V5Q29kZSA9IGV2ZW50LndoaWNoO1xyXG4gICAgXHJcbiAgICAvL2JhY2tzcGFjZVxyXG4gICAgaWYgKEtleUNvZGUgPT0gOCkge1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBjaCA9IFN0cmluZy5mcm9tQ2hhckNvZGUoIEtleUNvZGUgKTtcclxuXHRcdHRleHQgPSBjaDtcclxuXHJcblx0ICAgY3JlYXRlVGV4dCgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxudmFyIHJlbmRlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSggcmVuZGVyICk7XHJcbiAgICB0aW1lID0gY2xvY2suZ2V0RWxhcHNlZFRpbWUoKTtcclxuICAgIGRlbHRhID0gY2xvY2suZ2V0RGVsdGEoKTtcclxuXHJcbiAgICBcclxuICAgIGZvciAoIHZhciBpID0gMDsgaSA8IHNwaW5uaW5nLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGlmIChzcGlubmluZ1sgaSBdWzFdID4gMCkge1xyXG4gICAgICAgICAgICBzcGlubmluZ1sgaSBdWzBdLm9iamVjdC5yb3RhdGlvbi55ICs9IHNwaW5uaW5nW2ldWzFdICogTWF0aC5QSSAvIDE4MDtcclxuICAgICAgICAgICAgc3Bpbm5pbmdbaV1bMV0gLT0gMC41NztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcblx0XHJcblx0fVxyXG4gICAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xyXG59O1xyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBjcmVhdGVUZXh0KCkge1xyXG5cclxuXHRcdFx0XHR0ZXh0R2VvID0gbmV3IFRIUkVFLlRleHRHZW9tZXRyeSggdGV4dCwge1xyXG5cclxuXHRcdFx0XHRcdHNpemU6IHNpemUsXHJcblx0XHRcdFx0XHRoZWlnaHQ6IGhlaWdodCxcclxuXHRcdFx0XHRcdGN1cnZlU2VnbWVudHM6IGN1cnZlU2VnbWVudHMsXHJcblxyXG5cdFx0XHRcdFx0Zm9udDogZm9udCxcclxuXHRcdFx0XHRcdHdlaWdodDogd2VpZ2h0LFxyXG5cdFx0XHRcdFx0c3R5bGU6IHN0eWxlLFxyXG5cclxuXHRcdFx0XHRcdGJldmVsVGhpY2tuZXNzOiBiZXZlbFRoaWNrbmVzcyxcclxuXHRcdFx0XHRcdGJldmVsU2l6ZTogYmV2ZWxTaXplLFxyXG5cdFx0XHRcdFx0YmV2ZWxFbmFibGVkOiBiZXZlbEVuYWJsZWQsXHJcblxyXG5cclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0dGV4dEdlby5jb21wdXRlQm91bmRpbmdCb3goKTtcclxuXHRcdFx0XHR0ZXh0R2VvLmNvbXB1dGVWZXJ0ZXhOb3JtYWxzKCk7XHJcblxyXG5cdFx0XHQgICAvLyBnaXZlIHRoZSBzcGFjZSBhIHRleHQgd2lkdGhcclxuXHQgICAgICAgICAgIGlmICh0ZXh0ID09IFwiIFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dEdlby5ib3VuZGluZ0JveC5tYXgueCA9IDQwO1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHRHZW8uYm91bmRpbmdCb3gubWluLnggPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIFxyXG5cdFx0XHRcdHZhciBjZW50ZXJPZmZzZXQgPSAtMC41ICogKCB0ZXh0R2VvLmJvdW5kaW5nQm94Lm1heC54IC0gdGV4dEdlby5ib3VuZGluZ0JveC5taW4ueCApO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgXHJcbiAgICAgICAgICAgICAgICB2YXIgcmFuZG9tY29sb3IgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoNiAtIDAgKyAxKSkgKyAwO1xyXG4gICAgICAgICAgICAgICAgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbCggW1xyXG5cdFx0XHRcdFx0bmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKCB7IGNvbG9yOiBjb2xvckFycmF5W3JhbmRvbWNvbG9yXSwgc2hhZGluZzogVEhSRUUuRmxhdFNoYWRpbmcgfSApLCAvLyBmcm9udFxyXG5cdFx0XHRcdFx0bmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKCB7IGNvbG9yOiAweGZmZmZmZiwgc2hhZGluZzogVEhSRUUuU21vb3RoU2hhZGluZyB9ICkgLy8gc2lkZVxyXG5cdFx0XHRcdF0gKTtcclxuICAgICAgICAgICAgICAgIFxyXG5cdFx0XHRcdHRleHRNZXNoMSA9IG5ldyBUSFJFRS5NZXNoKCB0ZXh0R2VvLCBtYXRlcmlhbCApO1xyXG5cclxuXHRcdFx0XHR0ZXh0TWVzaDEucG9zaXRpb24ueCA9IGNlbnRlck9mZnNldDtcclxuXHRcdFx0XHR0ZXh0TWVzaDEucG9zaXRpb24ueSA9IGhvdmVyIC0gNTAgKyBNYXRoLnJhbmRvbSgpICogMTAwO1xyXG5cdFx0XHRcdHRleHRNZXNoMS5wb3NpdGlvbi56ID0gMTAwO1xyXG5cclxuXHRcdFx0XHR0ZXh0TWVzaDEucm90YXRpb24ueCA9IDA7XHJcblx0XHRcdFx0dGV4dE1lc2gxLnJvdGF0aW9uLnkgPSAwO1xyXG4gICAgICAgICAgICAgICAgdGV4dE1lc2gxLnJvdGF0aW9uLnogPSBNYXRoLnJhbmRvbSgpICogMC4yIC0gMC4xO1xyXG5cclxuXHRcdFx0XHRncm91cC5hZGQoIHRleHRNZXNoMSApO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvLyBubyBsaW5lIGlmIHRleHQgaXMgc3BhY2VcclxuICAgICAgICAgICAgICAgIGlmICh0ZXh0ICE9IFwiIFwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdyBhZGQgYSBsaW5lIHRvIHRoZSBsZXR0ZXJcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGluZW1hdGVyaWFsID0gbmV3IFRIUkVFLkxpbmVCYXNpY01hdGVyaWFsKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBjb2xvckFycmF5W3JhbmRvbWNvbG9yXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnkudmVydGljZXMucHVzaChcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFRIUkVFLlZlY3RvcjMoIHRleHRHZW8uYm91bmRpbmdCb3gubWF4LnggLSB0ZXh0R2VvLmJvdW5kaW5nQm94Lm1pbi54LCAxMDAwLCAwICksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBUSFJFRS5WZWN0b3IzKCB0ZXh0R2VvLmJvdW5kaW5nQm94Lm1heC54LCAwLCAwICksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBUSFJFRS5WZWN0b3IzKCB0ZXh0R2VvLmJvdW5kaW5nQm94Lm1pbi54LCAwLCAwIClcclxuICAgICAgICAgICAgICAgICAgICApOyAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxpbmUgPSBuZXcgVEhSRUUuTGluZSggZ2VvbWV0cnksIGxpbmVtYXRlcmlhbCApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHRNZXNoMS5hZGQoIGxpbmUgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChncm91cC5jaGlsZHJlbi5sZW5ndGggIT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFkanVzdFRleHQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcblx0XHRcdH1cclxuIFxyXG5mdW5jdGlvbiBhZGp1c3RUZXh0KCkge1xyXG4gICAgdmFyIG51bWxldHRlcnMgPSBncm91cC5jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICB2YXIgdGVtcDJcclxuICAgIC8vc2l6ZSBvZiBuZXcgbGV0dGVyXHJcbiAgICB2YXIgdGVtcCA9IGdyb3VwLmNoaWxkcmVuW251bWxldHRlcnMgLSAxXS5nZW9tZXRyeS5ib3VuZGluZ0JveC5tYXgueCAtIGdyb3VwLmNoaWxkcmVuW251bWxldHRlcnMgLSAxXS5nZW9tZXRyeS5ib3VuZGluZ0JveC5taW4ueDtcclxuICAgICAgICAvL3NpemUgb2Ygc2Vjb25kIHRvIGxhc3QgbGV0dGVyXHJcbiAgICB0ZW1wMiA9IGdyb3VwLmNoaWxkcmVuW251bWxldHRlcnMgLSAyXS5nZW9tZXRyeS5ib3VuZGluZ0JveC5tYXgueCAtIGdyb3VwLmNoaWxkcmVuW251bWxldHRlcnMgLSAyXS5nZW9tZXRyeS5ib3VuZGluZ0JveC5taW4ueDtcclxuXHJcbiAgICBcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtbGV0dGVycyAtIDE7IGkrKykge1xyXG4gICAgICAgIGdyb3VwLmNoaWxkcmVuW2ldLnBvc2l0aW9uLnggLT0gdGVtcC8yO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvL3RhY2sgdGhlIG1vc3QgcmVjZW50IGxldHRlciBvbnRvIHRoZSBlbmRcclxuICAgIGdyb3VwLmNoaWxkcmVuW251bWxldHRlcnMgLSAxXS5wb3NpdGlvbi54ID0gZ3JvdXAuY2hpbGRyZW5bbnVtbGV0dGVycyAtIDJdLnBvc2l0aW9uLnggKyB0ZW1wMjsgXHJcbiAgICBcclxuICAgIFxyXG59XHJcbnJlbmRlcigpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==