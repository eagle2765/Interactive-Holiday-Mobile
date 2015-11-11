# Assignment 5: Happy Holidays

## Due: Monday Nov 23rd, 5pm

**Important**: because the Thanksgiving break follows this due date, we're "ignoring" Wednesday and Thursday when computing lateness.  So, Tue 24th at 5pm is one day late, Fri 27th at 5pm is two days late, Sat 28th at 5pm is three days late, and Sun 29th at 5pm is four days late (and the last day you can submit).

## Assignment Details

First, you will note there is no sample code for this assignment.  You can structure the assignment as you wish.  The only requirements are at the end (e.g., you should name the top-level page a5.html, and follow a few simple instructions, so the TAs know how to run it).

You can use WebGL, or use another library on top of WebGL, such as http://threejs.org, http://www.babylonjs.com, etc.   The assignment is design such that you could do it using WebGL alone, with the techniques and tools you already know.  But, if you want to learn a different library, that is fine as well.

For this project, you will make an interactive holiday "mobile", with letters hanging from strings of different lengths from the top of the screen.  The letters should be evenly spaced across the screen, and at random heights between 1/4 and 3/4 the height of the screen (i.e., the middle half of the screen). Each letter should be "connected" to the top of the screen with a line (it's "string"). At a minimum, each letter should be represented by a single quad, but you can make the letters more elaborate if you want.   Each letter should be tilted slighly to the right or left (randomly) so that the pattern is visually interesting.

You are free to render letters in any way you want. For ideas on how to render text, such as using textures, start with the examples in webglfundamentals.org.  But, you are free to also consider other examples, such as https://github.com/mikolalysenko/gl-render-text (which lets you render text items using various web fonts), creating meshes from SVG character (https://css-tricks.com/rendering-svg-paths-in-webgl/), or adapting more complex solutions (https://www.eventbrite.com/engineering/its-2015-and-drawing-text-is-still-hard-webgl-threejs/). You are free to use a library to generate the text images (as in this gl-render-text example), or simply create the textures you want by hand (for example, using photoshop) as done in webglfundamentals.org (the advantage of the latter is that you can create a rectangular texture for each letter that looks exactly like you want, with any additional decorations or styling you care to add).

The key part of this assignment is that the mobile is interactive:

* the message should be taken from the keyboard.  You should have instructions that tell the user that they can type any letters to create a message, how to reset the message, and what the maximum number of characters are. As letters are typed, they are added to the message.  You should accept (at least) letters and spaces, but can also accept other characters if you want.  As characters are typed, they should be added such that the message is centered on the screen.  

* the user should be able to click on the letters.  When they do, the letters should spin, with the speed and (thus) the amount they spin based on how far from the horizontal center they click (click at the end to spin multiple times, click near the middle to spin just once).  You do not have to have the letters end up facing forwards when they spin (but, see below).  You can use either approach to selection we discussed in class (ray casting, which in this case would be a ray-polygon intersection, or the render buffer technique).

* when the user types a letter, a sound should play.  When they click on a letter with the mouse, a different sound should play.  (you might consider using a wrapper library like [howler.js](http://goldfirestudios.com/blog/104/howler.js-Modern-Web-Audio-Javascript-Library) which has a TSD wrapper already built, instead of using the web audio APIs directly).

For input, do not create a text entry box, rather use the keyboard events (e.g., onkeydown) to capture keypresses.  

The basic assignment does not have to adjust the size of the letters based on how much the user types, but can use a fixed size.  However, the letters should be sized and spaced such that the message "Happy Holidays" can be displayed. 

## Grading

This assignment will be graded as follows:
* 2 points for rendering text characters
* 1 point for proper horizontal spacing (that adjusts if the window is resized horizontally)
* 1 point for proper random vertical positioning (we suggest you have your window be fixed sized vertically as in the examples up to now, but if you resize the letters should adjust accordingly)
* 1 point for drawing lines for the "strings"
* 1 point for correct text input
* 2 points for selection and spinning the letters at all
* 1 point for properly adjusting the speed and amount of spin based on where on the letter the user clicks.
* 1 point for overall program and output appearance: reasonable title and instructions, and having the 3D window respond appropriately to window resize. 

## Leveraging code from the internet

If you copy any code from the internet (including from sites we have been using, such as webglfundamentals.org), please document it.  

## Bonus

Unlike previous assignments, you may do additional work for bonus points.  Each of the bonus options can earn up to 2 points (1 point for meeting the requirements, up to 1 more point for particularly aesthetically interesting/pleasing results), and you may do at most 2 of them.

Possible bonus options include:

* Swinging letters. Each of the letters should be swinging very slightly (so they don't look static).  You can do this keeping track of the top point of the string, and the length, and then computing the bottom point of the string (where the letter is) by rotating a line the length of the string around the top point.  Using sin() and time, you should be able to slowly swing the letters.  When the letters are clicked with the mouse, in addition to rotating as described above, the letters should swing more dramatically, settling down to the gentle swings as the rotation stops.  

* Snowflakes.  You should have a large number of snowflakes falling in the background behind the mobile, moving in a convincingly random way as they fall (i.e., by leveraging randomization techniques like Perlin noise), with flakes of different sizes as they recede in the distance.  There are many examples of creating snowflakes in OpenGL, WebGL and three.js on the net that you can learn from, if you want.  Do NOT just copy one into your code without modifying it in some meaningful way.

* Background.  Put a complementary image in the background of the scene, and have it move as the mouse moves over to create a low-key motion effect. One way to do this would be to have the image be larger than the screen, and when the mouse is to the left/below the center, move the image proportionally right/up a small amount (and vice-versa).

* Animated entrance/exit for the letters.  In the basic assignment, the letters can appear and move to new positions immediately when new letters are added, and disappear when the scene is reset.  In this extra credit, the letters would animate into the scene (e.g., perhaps they drop in from the top in their desired position, while the other letters slide to the left;  resetting might have them all slide off screen).  Care must be taken with this extra credit is dealing with overlapping animations (e.g., I type very fast, so the letters are falling and moving;  I clear the letters and start typing, so new letters are coming in while others are leaving).

* 

## Submission

You should submit your entire code directory (WITHOUT the ```node_modules``` or ```typings``` directories generated by npm and tsd) in a clean zip file, as in the first four assignments.  

Make sure you submit any assests, such as image files you load in as textures.

Your web page should be titled ```a4.html``` and your main .ts file should be ```a4.ts```, so the TAs know where to look.    

You should set up your project to build with gulp, as in the fourth assignment, and should let the TAs cd into the directory and type:
1. cd into the directory and run ```npm install``` and ```tsd install```
2. compile and start a server with ```gulp watch```
3. open and view the web page ```localhost:8080/a5.html```

(We are asking you to run the server, even if your solution doesn't need it, so the TAs have a simple and consistent way to build and test each assignment).