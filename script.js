/* =========================================================
   MEMORIES STUDIO
   PHOTOBOOTH SCRIPT
   No external frame images required
========================================================= */


/* ================= PRELOADER VIDEO ================= */

window.addEventListener('load', function() {
    const preloaderVideo = document.getElementById('preloaderVideo');
    const preloader = document.getElementById('preloader');
    
    if (preloaderVideo) {
        // Hide preloader when video ends
        preloaderVideo.addEventListener('ended', function() {
            if (preloader) {
                preloader.classList.add('hidden');
            }
        });
    } else {
        // Fallback: hide after 3 seconds if video doesn't load
        setTimeout(function() {
            if (preloader) {
                preloader.classList.add('hidden');
            }
        }, 3000);
    }
});

/* ================= ELEMENTS ================= */

const camera = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const startCamera = document.getElementById("startCamera");
const takePhoto = document.getElementById("takePhoto");
const resetPhoto = document.getElementById("resetPhoto");
const deletePhoto = document.getElementById("deletePhoto");
const downloadPhoto = document.getElementById("downloadPhoto");

const countdown = document.getElementById("countdown");
const framePreview = document.getElementById("framePreview");
const cameraMessage = document.getElementById("cameraMessage");

const recentGallery = document.getElementById("recentGallery");

const messageModal = document.getElementById("messageModal");
const closeModal = document.getElementById("closeModal");
const modalOk = document.getElementById("modalOk");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");

const layoutSelect = document.getElementById("layoutSelect");


/* ================= SETTINGS ================= */

const STORAGE_KEY = "memories_gallery_photos";

let stream = null;

let selectedFilter = "normal";
let selectedFrame = "none";
let selectedTimer = 0;
let selectedCount = 1;
let selectedLayout = "single";

let capturedPhotos = [];
let finalPhotoData = null;


/* ================= FILTERS ================= */

const filters = {

    normal: {
        css: "none"
    },

    vintage: {
        css: "sepia(.55) contrast(1.05) saturate(.9)"
    },

    bw: {
        css: "grayscale(1)"
    },

    warm: {
        css: "sepia(.18) saturate(1.25) brightness(1.04)"
    },

    cool: {
        css: "hue-rotate(12deg) saturate(.8)"
    },

    sepia: {
        css: "sepia(1)"
    },

    pink: {
        css: "hue-rotate(325deg) saturate(.9)"
    },

    dreamy: {
        css: "brightness(1.1) saturate(.75) contrast(.92)"
    },

    cinematic: {
        css: "contrast(1.25) saturate(.82)"
    },

    matte: {
        css: "contrast(.82) brightness(1.06) saturate(.85)"
    }
};


/* ================= FRAME SETTINGS ================= */

const frameStyles = {

    none: "",

    flower: "flower-frame",

    gingham: "gingham-frame",

    stars: "stars-frame",

    bunny: "bunny-frame",

    cherry: "cherry-frame",

    heart: "heart-frame",

    lips: "lips-frame",

    pink: "pink-frame",

    redbow: "redbow-frame"
};


/* ================= CAMERA ================= */

async function startCameraFunction() {

    try {

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {

            showMessage(
                "Camera Not Supported",
                "Your browser does not support camera access."
            );

            return;
        }


        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }


        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user"
            },
            audio: false
        });


        camera.srcObject = stream;

        await camera.play();

        takePhoto.disabled = false;

        startCamera.textContent = "✓ Camera Ready";

        cameraMessage.textContent =
            "Your camera is ready. Choose your style and take a photo.";

    }

    catch (error) {

        console.error(error);

        showMessage(
            "Camera Permission Needed",
            "Please allow camera access in your browser and try again."
        );

        cameraMessage.textContent =
            "Camera access was not available.";

    }
}


startCamera.addEventListener(
    "click",
    startCameraFunction
);


/* ================= TAKE PHOTO ================= */

takePhoto.addEventListener(
    "click",
    async () => {

        if (!stream) {

            showMessage(
                "Start Camera",
                "Please start the camera before taking a photo."
            );

            return;
        }


        capturedPhotos = [];


        if (selectedCount === 1) {

            await captureOnePhoto();

        } else {

            await captureMultiplePhotos();

        }

    }
);


/* ================= COUNTDOWN ================= */

function wait(ms) {

    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });

}


async function runCountdown(seconds) {

    if (seconds <= 0) {
        return;
    }


    for (let i = seconds; i > 0; i--) {

        countdown.textContent = i;

        await wait(1000);

    }

    countdown.textContent = "";

}


/* ================= SINGLE PHOTO ================= */

async function captureOnePhoto() {

    await runCountdown(selectedTimer);

    const photo = captureCurrentFrame();

    capturedPhotos.push(photo);

    finalPhotoData = await createFinalImage(
        capturedPhotos,
        selectedLayout
    );

    savePhotoToGallery(finalPhotoData);

    showMessage(
        "Photo Captured! ✨",
        "Your beautiful memory has been saved to your Gallery."
    );

    refreshRecentGallery();

}


/* ================= MULTIPLE PHOTOS ================= */

async function captureMultiplePhotos() {

    for (let i = 0; i < selectedCount; i++) {

        cameraMessage.textContent =
            `Photo ${i + 1} of ${selectedCount}`;

        await runCountdown(
            selectedTimer > 0 ? selectedTimer : 2
        );

        const photo = captureCurrentFrame();

        capturedPhotos.push(photo);

        await wait(400);

    }


    cameraMessage.textContent =
        "All photos captured!";


    finalPhotoData = await createFinalImage(
        capturedPhotos,
        selectedLayout
    );


    savePhotoToGallery(finalPhotoData);

    showMessage(
        "Photos Created! ✨",
        `${selectedCount} photos have been combined and saved to your Gallery.`
    );

    refreshRecentGallery();

}


/* ================= CAPTURE CAMERA FRAME ================= */

function captureCurrentFrame() {

    const width = camera.videoWidth || 1280;
    const height = camera.videoHeight || 960;

    const tempCanvas = document.createElement("canvas");

    tempCanvas.width = width;
    tempCanvas.height = height;

    const ctx = tempCanvas.getContext("2d");

    ctx.save();


    /*
       Mirror the camera so the saved photo
       looks like the preview.
    */

    ctx.translate(width, 0);
    ctx.scale(-1, 1);


    ctx.filter = filters[selectedFilter]
        ? filters[selectedFilter].css
        : "none";


    ctx.drawImage(
        camera,
        0,
        0,
        width,
        height
    );


    ctx.restore();


    return tempCanvas.toDataURL(
        "image/jpeg",
        .94
    );
}


/* ================= FINAL IMAGE ================= */

async function createFinalImage(
    photos,
    layout
) {

    if (!photos.length) {
        return null;
    }


    if (photos.length === 1) {

        const base = await loadImage(photos[0]);

        const output = document.createElement("canvas");

        output.width = base.width;
        output.height = base.height;

        const ctx = output.getContext("2d");

        ctx.drawImage(
            base,
            0,
            0
        );


        drawFrameOnCanvas(
            ctx,
            output.width,
            output.height
        );


        return output.toDataURL(
            "image/png"
        );
    }


    return await createMultiPhotoLayout(
        photos,
        layout
    );

}


/* ================= MULTI LAYOUT ================= */

async function createMultiPhotoLayout(
    photos,
    layout
) {

    const images = [];

    for (const photo of photos) {

        images.push(
            await loadImage(photo)
        );

    }


    let width = 1000;
    let height = 1000;


    if (layout === "vertical") {

        width = 700;
        height = 300 * photos.length + 100;

    }

    else if (layout === "horizontal") {

        width = 300 * photos.length + 100;
        height = 700;

    }

    else if (layout === "film") {

        width = 900;
        height = 250 * photos.length + 100;

    }

    else if (layout === "grid") {

        width = 1000;
        height = 1000;

    }

    else {

        width = 1100;
        height = 900;

    }


    const output = document.createElement("canvas");

    output.width = width;
    output.height = height;

    const ctx = output.getContext("2d");


    /* background */

    ctx.fillStyle = "#fffaf3";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /* layout */

    if (layout === "vertical") {

        drawVertical(
            ctx,
            images,
            width,
            height
        );

    }

    else if (layout === "horizontal") {

        drawHorizontal(
            ctx,
            images,
            width,
            height
        );

    }

    else if (layout === "grid") {

        drawGrid(
            ctx,
            images,
            width,
            height
        );

    }

    else if (layout === "film") {

        drawFilm(
            ctx,
            images,
            width,
            height
        );

    }

    else if (layout === "polaroid") {

        drawPolaroids(
            ctx,
            images,
            width,
            height
        );

    }

    else if (layout === "diamond") {

        drawDiamond(
            ctx,
            images,
            width,
            height
        );

    }

    else if (layout === "large3") {

        drawLargeThree(
            ctx,
            images,
            width,
            height
        );

    }

    else {

        drawCollage(
            ctx,
            images,
            width,
            height
        );

    }


    drawFrameOnCanvas(
        ctx,
        width,
        height
    );


    return output.toDataURL(
        "image/png"
    );
}


/* ================= LAYOUTS ================= */

function drawVertical(
    ctx,
    images,
    width,
    height
) {

    const margin = 50;

    const photoHeight =
        (height - margin * 2) / images.length;


    images.forEach((img, index) => {

        drawCoverImage(
            ctx,
            img,
            margin,
            margin + index * photoHeight,
            width - margin * 2,
            photoHeight - 10
        );

    });

}


function drawHorizontal(
    ctx,
    images,
    width,
    height
) {

    const margin = 50;

    const photoWidth =
        (width - margin * 2) / images.length;


    images.forEach((img, index) => {

        drawCoverImage(
            ctx,
            img,
            margin + index * photoWidth,
            margin,
            photoWidth - 10,
            height - margin * 2
        );

    });

}


function drawGrid(
    ctx,
    images,
    width,
    height
) {

    const margin = 35;

    const cellWidth =
        (width - margin * 3) / 2;

    const cellHeight =
        (height - margin * 3) / 2;


    images.forEach((img, index) => {

        const col = index % 2;
        const row = Math.floor(index / 2);

        drawCoverImage(
            ctx,
            img,
            margin + col * (cellWidth + margin),
            margin + row * (cellHeight + margin),
            cellWidth,
            cellHeight
        );

    });

}


function drawFilm(
    ctx,
    images,
    width,
    height
) {

    ctx.fillStyle = "#20251d";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    const margin = 50;

    const photoHeight =
        (height - margin * 2) / images.length;


    images.forEach((img, index) => {

        drawCoverImage(
            ctx,
            img,
            100,
            margin + index * photoHeight,
            width - 200,
            photoHeight - 20
        );

    });

}


function drawPolaroids(
    ctx,
    images,
    width,
    height
) {

    const positions = [
        [80, 100, -0.08],
        [570, 80, 0.07],
        [120, 500, 0.06],
        [600, 480, -0.06]
    ];


    images.forEach((img, index) => {

        const p =
            positions[index] ||
            positions[0];

        const x = p[0];
        const y = p[1];
        const rotation = p[2];

        ctx.save();

        ctx.translate(
            x + 190,
            y + 220
        );

        ctx.rotate(rotation);

        ctx.fillStyle = "white";

        ctx.shadowColor =
            "rgba(0,0,0,.18)";

        ctx.shadowBlur = 20;

        ctx.fillRect(
            -190,
            -220,
            380,
            440
        );

        ctx.shadowColor =
            "transparent";

        drawCoverImage(
            ctx,
            img,
            -165,
            -195,
            330,
            330
        );

        ctx.restore();

    });

}


function drawDiamond(
    ctx,
    images,
    width,
    height
) {

    const positions = [
        [550, 200],
        [350, 450],
        [750, 450],
        [550, 700]
    ];


    images.forEach((img, index) => {

        const p =
            positions[index] ||
            positions[0];

        ctx.save();

        ctx.translate(
            p[0],
            p[1]
        );

        ctx.rotate(
            Math.PI / 4
        );

        ctx.beginPath();

        ctx.rect(
            -160,
            -160,
            320,
            320
        );

        ctx.clip();

        drawCoverImage(
            ctx,
            img,
            -160,
            -160,
            320,
            320
        );

        ctx.restore();

    });

}


function drawLargeThree(
    ctx,
    images,
    width,
    height
) {

    if (!images[0]) return;


    drawCoverImage(
        ctx,
        images[0],
        40,
        40,
        650,
        820
    );


    images.slice(1, 4).forEach(
        (img, index) => {

            drawCoverImage(
                ctx,
                img,
                720,
                40 + index * 270,
                330,
                250
            );

        }
    );

}


function drawCollage(
    ctx,
    images,
    width,
    height
) {

    const positions = [
        [30, 30, 520, 400],
        [580, 30, 490, 250],
        [580, 320, 230, 480],
        [840, 320, 230, 480]
    ];


    images.forEach((img, index) => {

        const p =
            positions[index] ||
            positions[0];

        drawCoverImage(
            ctx,
            img,
            p[0],
            p[1],
            p[2],
            p[3]
        );

    });

}


/* ================= COVER IMAGE ================= */

function drawCoverImage(
    ctx,
    img,
    x,
    y,
    width,
    height
) {

    const imageRatio =
        img.width / img.height;

    const boxRatio =
        width / height;

    let sx = 0;
    let sy = 0;
    let sw = img.width;
    let sh = img.height;


    if (imageRatio > boxRatio) {

        sw =
            img.height * boxRatio;

        sx =
            (img.width - sw) / 2;

    }

    else {

        sh =
            img.width / boxRatio;

        sy =
            (img.height - sh) / 2;

    }


    ctx.drawImage(
        img,
        sx,
        sy,
        sw,
        sh,
        x,
        y,
        width,
        height
    );
}


/* ================= LOAD IMAGE ================= */

function loadImage(
    src
) {

    return new Promise(
        (resolve, reject) => {

            const img =
                new Image();

            img.onload =
                () => resolve(img);

            img.onerror =
                reject;

            img.src = src;

        }
    );

}


/* =========================================================
   FRAME DRAWING
   Frames are created directly on Canvas.
   No frames folder is required.
========================================================= */

function drawFrameOnCanvas(
    ctx,
    width,
    height
) {

    const frame = selectedFrame;


    if (frame === "none") {
        return;
    }


    ctx.save();


    if (frame === "flower") {

        ctx.fillStyle = "#b9d8df";

        ctx.fillRect(
            0,
            0,
            width,
            35
        );

        ctx.fillRect(
            0,
            height - 35,
            width,
            35
        );

        ctx.fillRect(
            0,
            0,
            35,
            height
        );

        ctx.fillRect(
            width - 35,
            0,
            35,
            height
        );


        drawTextPattern(
            ctx,
            "🌸  🌼  🌸",
            width,
            28,
            22
        );

        drawTextPattern(
            ctx,
            "🌸  🌼  🌸",
            width,
            height - 8,
            22
        );

    }


    else if (frame === "gingham") {

        drawGinghamFrame(
            ctx,
            width,
            height,
            "#b8d5de"
        );

    }


    else if (frame === "stars") {

        ctx.fillStyle = "#88b1c4";

        drawBorder(
            ctx,
            width,
            height,
            38
        );


        drawTextPattern(
            ctx,
            "✦  ✧  ★  ✧  ✦",
            width,
            30,
            25
        );

        drawTextPattern(
            ctx,
            "✦  ✧  ★  ✧  ✦",
            width,
            height - 5,
            25
        );

    }


    else if (frame === "bunny") {

        ctx.fillStyle = "#ead8da";

        drawBorder(
            ctx,
            width,
            height,
            35
        );


        ctx.font =
            `${Math.round(width * .07)}px serif`;

        ctx.textAlign = "center";

        ctx.fillText(
            "🎀",
            width / 2,
            55
        );

    }


    else if (frame === "cherry") {

        ctx.fillStyle = "#f0c7cc";

        drawBorder(
            ctx,
            width,
            height,
            38
        );


        drawTextPattern(
            ctx,
            "🍒  🍒  🍒  🍒",
            width,
            30,
            23
        );

        drawTextPattern(
            ctx,
            "🍒  🍒  🍒  🍒",
            width,
            height - 5,
            23
        );

    }


    else if (frame === "heart") {

        ctx.fillStyle = "#e9b5bd";

        drawBorder(
            ctx,
            width,
            height,
            38
        );


        drawTextPattern(
            ctx,
            "♥  ♡  ♥  ♡  ♥",
            width,
            30,
            24
        );

        drawTextPattern(
            ctx,
            "♥  ♡  ♥  ♡  ♥",
            width,
            height - 5,
            24
        );

    }


    else if (frame === "lips") {

        ctx.fillStyle = "#f0c3ca";

        drawBorder(
            ctx,
            width,
            height,
            38
        );


        drawTextPattern(
            ctx,
            "💋  💋  💋  💋",
            width,
            30,
            23
        );

    }


    else if (frame === "pink") {

        drawGinghamFrame(
            ctx,
            width,
            height,
            "#e6b4bf"
        );

    }


    else if (frame === "redbow") {

        ctx.fillStyle = "#b94a55";

        drawBorder(
            ctx,
            width,
            height,
            38
        );


        ctx.font =
            `${Math.round(width * .07)}px serif`;

        ctx.textAlign = "center";

        ctx.fillText(
            "🎀",
            width / 2,
            55
        );

    }


    ctx.restore();
}


/* ================= FRAME HELPERS ================= */

function drawBorder(
    ctx,
    width,
    height,
    size
) {

    ctx.fillRect(
        0,
        0,
        width,
        size
    );

    ctx.fillRect(
        0,
        height - size,
        width,
        size
    );

    ctx.fillRect(
        0,
        0,
        size,
        height
    );

    ctx.fillRect(
        width - size,
        0,
        size,
        height
    );

}


function drawTextPattern(
    ctx,
    text,
    width,
    y,
    fontSize
) {

    ctx.font =
        `${fontSize}px serif`;

    ctx.textAlign =
        "center";

    ctx.fillText(
        text,
        width / 2,
        y
    );

}


function drawGinghamFrame(
    ctx,
    width,
    height,
    color
) {

    const size = 45;

    ctx.fillStyle = color;


    for (
        let x = 0;
        x < width;
        x += 24
    ) {

        ctx.globalAlpha = .8;

        ctx.fillRect(
            x,
            0,
            12,
            size
        );

        ctx.fillRect(
            x,
            height - size,
            12,
            size
        );

    }


    for (
        let y = 0;
        y < height;
        y += 24
    ) {

        ctx.fillRect(
            0,
            y,
            size,
            12
        );

        ctx.fillRect(
            width - size,
            y,
            size,
            12
        );

    }


    ctx.globalAlpha = 1;

}


/* ================= FRAME PREVIEW ================= */

function updateFramePreview() {

    framePreview.className =
        "frame-preview";


    if (
        selectedFrame &&
        selectedFrame !== "none"
    ) {

        framePreview.classList.add(
            frameStyles[selectedFrame]
        );

    }

}


/* ================= FRAME BUTTONS ================= */

document
    .querySelectorAll(".frame-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".frame-button")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );


                button.classList.add("active");


                selectedFrame =
                    button.dataset.frame;


                updateFramePreview();

            }
        );

    });


/* ================= FILTER BUTTONS ================= */

document
    .querySelectorAll(".filter-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".filter-button")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );


                button.classList.add("active");


                selectedFilter =
                    button.dataset.filter;


                camera.style.filter =
                    filters[selectedFilter].css;

            }
        );

    });


/* ================= PHOTO COUNT ================= */

document
    .querySelectorAll("[data-count]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll("[data-count]")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );


                button.classList.add("active");


                selectedCount =
                    Number(button.dataset.count);

            }
        );

    });


/* ================= TIMER ================= */

document
    .querySelectorAll("[data-timer]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll("[data-timer]")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );


                button.classList.add("active");


                selectedTimer =
                    Number(button.dataset.timer);

            }
        );

    });


/* ================= LAYOUT ================= */

layoutSelect.addEventListener(
    "change",
    () => {

        selectedLayout =
            layoutSelect.value;

    }
);


/* ================= RESET ================= */

resetPhoto.addEventListener(
    "click",
    () => {

        capturedPhotos = [];

        finalPhotoData = null;

        camera.style.filter =
            filters[selectedFilter].css;

        cameraMessage.textContent =
            "Ready to take another photo.";

        countdown.textContent = "";

    }
);


/* ================= DELETE ================= */

deletePhoto.addEventListener(
    "click",
    () => {

        capturedPhotos = [];

        finalPhotoData = null;

        showMessage(
            "Photo Cleared",
            "The current captured photo has been cleared."
        );

    }
);


/* ================= DOWNLOAD ================= */

downloadPhoto.addEventListener(
    "click",
    () => {

        if (!finalPhotoData) {

            showMessage(
                "No Photo Yet",
                "Take a photo first."
            );

            return;
        }


        const link =
            document.createElement("a");

        link.download =
            `memories-studio-${Date.now()}.png`;

        link.href =
            finalPhotoData;

        link.click();

    }
);


/* ================= GALLERY ================= */

function savePhotoToGallery(
    dataUrl
) {

    const gallery =
        getGallery();


    const photo = {

        id:
            "photo_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(16)
                .slice(2),

        dataUrl: dataUrl,

        caption: "",

        notes: "",

        moment: "",

        stickerTop: null,

        stickerBottom: null,

        filter:
            selectedFilter,

        frame:
            selectedFrame,

        layout:
            selectedLayout,

        createdAt:
            new Date().toISOString()

    };


    gallery.unshift(photo);


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(gallery)
    );

}


/* ================= GET GALLERY ================= */

function getGallery() {

    try {

        return JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        ) || [];

    }

    catch (error) {

        console.error(error);

        return [];

    }

}


/* ================= RECENT GALLERY ================= */

function refreshRecentGallery() {

    if (!recentGallery) {
        return;
    }


    const gallery =
        getGallery();


    recentGallery.innerHTML = "";


    if (!gallery.length) {

        recentGallery.innerHTML = `
            <div class="empty-gallery">
                <p>Your memories will appear here after you take your first photo. 📸</p>
            </div>
        `;

        return;
    }


    gallery
        .slice(0, 4)
        .forEach(photo => {

            const item =
                document.createElement("div");

            item.className =
                "recent-item";


            const img =
                document.createElement("img");

            img.src =
                photo.dataUrl;

            img.alt =
                "Memory Studio Photo";


            item.appendChild(img);

            recentGallery.appendChild(item);

        });

}


/* ================= MODAL ================= */

function showMessage(
    title,
    message
) {

    modalTitle.textContent =
        title;

    modalMessage.textContent =
        message;

    messageModal.classList.add(
        "show"
    );

}


function closeMessage() {

    messageModal.classList.remove(
        "show"
    );

}


closeModal.addEventListener(
    "click",
    closeMessage
);

modalOk.addEventListener(
    "click",
    closeMessage
);


messageModal.addEventListener(
    "click",
    event => {

        if (
            event.target === messageModal
        ) {

            closeMessage();

        }

    }
);


/* ================= INITIALIZE ================= */

refreshRecentGallery();

updateFramePreview();


/* ================= STOP CAMERA ================= */

window.addEventListener(
    "beforeunload",
    () => {

        if (stream) {

            stream
                .getTracks()
                .forEach(track =>
                    track.stop()
                );

        }

    }
);