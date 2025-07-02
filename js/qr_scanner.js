window.onload = () => {
    const video = document.getElementById('qr-video');
    const canvas = document.createElement('canvas'); // Create canvas dynamically
    const context = canvas.getContext('2d');
    const loadingMessage = document.getElementById('loading-message');
    const statusMessage = document.getElementById('status-message');

    let qrCodeFound = false; // Flag to prevent multiple redirects

    // Function to start the camera and scanning loop
    function startScanner() {
        // Request camera access
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }) // "environment" for rear camera
            .then(function(stream) {
                video.srcObject = stream;
                video.setAttribute('playsinline', true); // Required for iOS
                video.play();
                loadingMessage.hidden = true;
                requestAnimationFrame(tick); // Start scanning loop after video plays
            })
            .catch(function(err) {
                console.error("Error accessing camera:", err);
                loadingMessage.innerText = "Error: Could not access camera. Please ensure camera permissions are granted.";
                statusMessage.hidden = true;
            });
    }

    // Scanning loop
    function tick() {
        if (video.readyState === video.HAVE_ENOUGH_DATA && !qrCodeFound) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert", // Improve performance by not trying to invert colors
            });

            if (code) {
                console.log("QR Code detected:", code.data);
                // Assuming the QR code data is the URL to your AR experience (index.html)
                // You can add validation here if needed, e.g., check if code.data starts with your domain.
                if (code.data) {
                    qrCodeFound = true; // Set flag to stop further scanning and prevent multiple redirects
                    statusMessage.innerText = "QR Code found! Redirecting...";
                    window.location.href = code.data; // Redirect to the scanned URL
                    return; // Stop animation frame request
                }
            }
        }
        requestAnimationFrame(tick); // Continue scanning
    }

    // Start the scanner when the window loads
    startScanner();
};
