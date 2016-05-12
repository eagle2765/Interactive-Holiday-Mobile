I used THREE.js to render the letters on the screen. To create the 3d letters, I created a text geometry, a material, and passed that into a 3d mesh to be added to the scene. 

Event handlers were added to handle various key presses and button clicks. In the end, each letter had it's own mesh and a child that was the line that connected it to the top of the screen.

I created a recenter function to recenter the letters based off the size of the new 3d letter that was made. 

Sound was done through howler.js.

Spinning the letters was coded based on ray casting to figure out whether or not there was an intersection. If there was an intersection, then the amount of spin was based off
of how close you were to the edges. 1/4th of the way on either side gave you twice the spin, while anything else gave you normal spin. 

Color was done through making a color array and picking a random color out of that every time you make a letter.

Background image was given a z-index of -1 so it would always be in the background. The image was larger than the screen and moves according to the mouse.

Reset message was done by deleting all the letters in the scene.