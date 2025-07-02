let moveMode = false; // This will remain false as there's no UI to toggle it.
let rotateMode = true; // Set to true by default, as there's no UI to toggle it now.
                        // This makes rotation always active.

// All overlay and log related variables are now removed from here.

let entity = undefined;

const rotationSensitivity = 0.5;
const positionSensitivity = 0.03; // This will no longer be used as moveMode is false by default.
const scaleSensitivity = 0.01;

let prevTouchX = 0;
let prevTouchY = 0;
let isDragging = false;


window.onload = () =>
{
    console.log("AR-Cam: window.onload fired.");

    // Removed document.getElementById calls for logs and buttons.
    // positionLog = document.getElementById('positionLog');
    // rotationLog = document.getElementById('rotationLog');
    // zoomLog = document.getElementById('zoomLog');

    entity = document.getElementById("theModel");
    // Removed button element assignments.
    // moveButton = document.getElementById('move-button');
    // rotateButton = document.getElementById('rotate-button');

    console.log("AR-Cam: entity (theModel):", entity);
    // console.log("AR-Cam: moveButton:", moveButton); // Removed
    // console.log("AR-Cam: rotateButton:", rotateButton); // Removed

    // No event listeners for photo capture or fullscreen/orientation overlays.

    entity.addEventListener("model-loaded", () => {
        console.log("AR-Cam: Model loaded successfully.");
        // If there was a loading overlay, it would be hidden here.
    });

    // The resize listener is largely redundant now that the scene is set to 100% height/width
    // and no specific overlay elements need their height adjusted.
    // Keeping it for now as a general resize handler.
    // window.addEventListener('resize', () =>
    // {
    //     console.log("AR-Cam: Window resized.");
    // });

    let activeRegion = ZingTouch.Region(document.body, false, false);
    let containerElement = document.getElementsByTagName('a-scene')[0];

    console.log("AR-Cam: containerElement (a-scene):", containerElement);

    let pinch = new ZingTouch.Distance();
    activeRegion.bind(containerElement, pinch, function (event)
    {
        console.log("AR-Cam: Pinch gesture detected.");
        let factor = event.detail.change * scaleSensitivity;
        let scale = entity.getAttribute('scale').x;
        scale += factor;
        entity.object3D.scale.set(scale, scale, scale);

        // Removed zoomLog update.
    });

    let swipe = new ZingTouch.Pan({
        numInputs: 1,
        threshold: 5 // You can try reducing this to 2 or 3 if small movements aren't registering
    });

    // touchstart event listener for initializing drag
    containerElement.addEventListener('touchstart', (e) => {
        // Since rotateMode is always true and moveMode is false, we simplify the condition.
        if (e.touches.length === 1) { // Only listen for single finger for rotation/dragging
            isDragging = true;
            prevTouchX = e.touches[0].clientX;
            prevTouchY = e.touches[0].clientY;
            console.log("AR-Cam: Touchstart - Initializing drag. PrevX:", prevTouchX, "PrevY:", prevTouchY);
        } else {
            isDragging = false; // Disable dragging if multiple touches
            console.log("AR-Cam: Touchstart - Multiple touches, disabling drag.");
        }
    });

    // Pan gesture binding for rotation
    activeRegion.bind(containerElement, swipe, function (event)
    {
        // This logic is now always active for a single-finger pan/swipe.
        // We only proceed if isDragging is true (i.e., a single finger started the touch).
        if (isDragging)
        {
            const currentTouchX = event.detail.data[0].current.x;
            const currentTouchY = event.detail.data[0].current.y;

            const deltaX = currentTouchX - prevTouchX;
            const deltaY = currentTouchY - prevTouchY;

            // Log deltas to see if movement is detected
            console.log("AR-Cam: Pan - DeltaX:", deltaX, "DeltaY:", deltaY);

            prevTouchX = currentTouchX;
            prevTouchY = currentTouchY;

            let currentRotation = entity.object3D.rotation; // Get Three.js rotation object

            // Apply rotation based on finger movement
            // Horizontal drag (deltaX) rotates around the Y-axis (vertical)
            // Vertical drag (deltaY) rotates around the X-axis (horizontal)
            currentRotation.y += THREE.Math.degToRad(deltaX * rotationSensitivity);
            currentRotation.x += THREE.Math.degToRad(-deltaY * rotationSensitivity); // Negative for intuitive vertical drag

            // Log current rotation (in degrees)
            console.log("AR-Cam: Current Rotation (deg) - X:", THREE.Math.radToDeg(currentRotation.x).toFixed(2),
                        "Y:", THREE.Math.radToDeg(currentRotation.y).toFixed(2));

            // Removed rotationLog update.
        } else {
            console.log("AR-Cam: Pan detected, but not dragging (multiple fingers or touchstart failed).");
        }
    });

    // touchend event listener for ending drag
    containerElement.addEventListener('touchend', () => {
        console.log("AR-Cam: Touchend - Ending drag.");
        isDragging = false;
        prevTouchX = 0; // Reset for next drag
        prevTouchY = 0; // Reset for next drag
    });
};
