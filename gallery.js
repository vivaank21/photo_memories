/* =========================================
   MEMORIES STUDIO - GALLERY JS
========================================= */


/* -----------------------------------------
   STORAGE KEY

   IMPORTANT:
   Your photobooth JavaScript MUST use
   this same key.
----------------------------------------- */

const STORAGE_KEY = "memories_gallery_photos";


/* -----------------------------------------
   DOM ELEMENTS
----------------------------------------- */

const galleryGrid = document.getElementById("galleryGrid");

const momentInput = document.getElementById("momentInput");

const saveEditsBtn = document.getElementById("saveEditsBtn");

const deleteSelectedBtn =
    document.getElementById("deleteSelectedBtn");

const downloadSelectedBtn =
    document.getElementById("downloadSelectedBtn");

const printImage =
    document.getElementById("printImage");

const stickerOverlay =
    document.getElementById("stickerOverlay");

const stickerOverlayBottom =
    document.getElementById("stickerOverlayBottom");

const printMoment =
    document.getElementById("printMoment");

const stickerRow =
    document.getElementById("stickerRow");


/* -----------------------------------------
   APPLICATION STATE
----------------------------------------- */

let state = {

    photos: [],

    selectedId: null

};


/* -----------------------------------------
   STICKERS
----------------------------------------- */

const stickers = [

    {
        emoji: "✨",
        type: "top"
    },

    {
        emoji: "💖",
        type: "top"
    },

    {
        emoji: "📸",
        type: "top"
    },

    {
        emoji: "🕊️",
        type: "top"
    },

    {
        emoji: "🎉",
        type: "top"
    },

    {
        emoji: "🌸",
        type: "top"
    },

    {
        emoji: "😘",
        type: "top"
    },

    {
        emoji: "🔥",
        type: "top"
    },

    {
        emoji: "❤️",
        type: "bottom"
    },

    {
        emoji: "⭐",
        type: "bottom"
    },

    {
        emoji: "💫",
        type: "bottom"
    }

];


/* -----------------------------------------
   LOAD PHOTOS
----------------------------------------- */

function loadPhotos() {

    try {

        const raw =
            localStorage.getItem(STORAGE_KEY);

        if (!raw) {

            return [];

        }

        const parsed =
            JSON.parse(raw);

        if (!Array.isArray(parsed)) {

            return [];

        }

        return parsed;

    }

    catch (error) {

        console.error(
            "Could not load photos:",
            error
        );

        return [];

    }

}


/* -----------------------------------------
   SAVE PHOTOS
----------------------------------------- */

function savePhotos() {

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(state.photos)

    );

}


/* -----------------------------------------
   GET SELECTED PHOTO
----------------------------------------- */

function getSelectedPhoto() {

    return state.photos.find(

        photo =>
            photo.id === state.selectedId

    ) || null;

}


/* -----------------------------------------
   RENDER GALLERY
----------------------------------------- */

function renderGallery() {

    galleryGrid.innerHTML = "";


    /* No photos */

    if (state.photos.length === 0) {

        galleryGrid.innerHTML = `

            <div class="empty">

                📸 <strong>No photos saved yet.</strong>

                <br>

                Go to the Photobooth page,
                take a photo and save it.

            </div>

        `;

        return;

    }


    /* Create cards */

    state.photos.forEach(photo => {

        const cardWrap =
            document.createElement("div");

        cardWrap.className =
            "card-wrap";


        const active =
            photo.id === state.selectedId
                ? "active"
                : "";


        cardWrap.innerHTML = `

            <div
                class="gallery-card ${active}"
                data-id="${photo.id}"
            >

                <div class="polaroid">

                    <img
                        class="polaroid-img"
                        src="${photo.dataUrl}"
                        alt="Memory photo"
                    >


                    <div class="polaroid-caption">

                        <div class="moment-text">

                            ${
                                escapeHtml(
                                    photo.moment || ""
                                ) ||
                                "No moment yet..."
                            }

                        </div>


                        <div class="sticker-info">

                            Top:
                            ${photo.stickerTop || "—"}

                            &nbsp; | &nbsp;

                            Bottom:
                            ${photo.stickerBottom || "—"}

                        </div>

                    </div>

                </div>


                <div class="mini-actions">

                    ✨ Click to edit this memory

                </div>

            </div>

        `;


        galleryGrid.appendChild(cardWrap);


        const card =
            cardWrap.querySelector(".gallery-card");


        card.addEventListener(
            "click",
            function () {

                selectPhoto(photo.id);

            }
        );

    });

}


/* -----------------------------------------
   SELECT PHOTO
----------------------------------------- */

function selectPhoto(id) {

    state.selectedId = id;

    renderGallery();

    loadSelectedIntoEditor();

    updateButtons();

}


/* -----------------------------------------
   UPDATE BUTTONS
----------------------------------------- */

function updateButtons() {

    const hasSelection =
        state.selectedId !== null;


    deleteSelectedBtn.disabled =
        !hasSelection;

    downloadSelectedBtn.disabled =
        !hasSelection;

}


/* -----------------------------------------
   LOAD PHOTO INTO EDITOR
----------------------------------------- */

function loadSelectedIntoEditor() {

    const photo =
        getSelectedPhoto();


    /* No photo selected */

    if (!photo) {

        momentInput.value = "";

        printImage.style.display =
            "none";

        stickerOverlay.style.display =
            "none";

        stickerOverlayBottom.style.display =
            "none";

        printMoment.textContent =
            "Select a photo from the gallery.";

        return;

    }


    /* Moment */

    momentInput.value =
        photo.moment || "";


    /* Photo */

    printImage.src =
        photo.dataUrl;

    printImage.style.display =
        "block";


    /* Top sticker */

    if (photo.stickerTop) {

        stickerOverlay.textContent =
            photo.stickerTop;

        stickerOverlay.style.display =
            "block";

    }

    else {

        stickerOverlay.textContent =
            "";

        stickerOverlay.style.display =
            "none";

    }


    /* Bottom sticker */

    if (photo.stickerBottom) {

        stickerOverlayBottom.textContent =
            photo.stickerBottom;

        stickerOverlayBottom.style.display =
            "block";

    }

    else {

        stickerOverlayBottom.textContent =
            "";

        stickerOverlayBottom.style.display =
            "none";

    }


    /* Moment preview */

    printMoment.textContent =

        photo.moment &&
        photo.moment.trim()

            ? photo.moment

            : "— No moment yet —";

}


/* -----------------------------------------
   SAVE EDITS
----------------------------------------- */

function saveEdits() {

    const photo =
        getSelectedPhoto();


    if (!photo) {

        alert(
            "Please select a photo first."
        );

        return;

    }


    photo.moment =
        momentInput.value.trim();


    savePhotos();

    renderGallery();

    loadSelectedIntoEditor();

    updateButtons();


    alert(
        "✨ Your memory has been saved!"
    );

}


/* -----------------------------------------
   SET STICKER
----------------------------------------- */

function setSticker(type, emoji) {

    const photo =
        getSelectedPhoto();


    if (!photo) {

        return;

    }


    if (type === "top") {

        photo.stickerTop = emoji;

    }


    if (type === "bottom") {

        photo.stickerBottom = emoji;

    }


    savePhotos();

    loadSelectedIntoEditor();

    renderGallery();

}


/* -----------------------------------------
   CREATE STICKER BUTTONS
----------------------------------------- */

function initStickersUI() {

    stickerRow.innerHTML = "";


    stickers.forEach(sticker => {

        const button =
            document.createElement("button");


        button.type =
            "button";


        button.className =
            "sticker-btn";


        button.textContent =
            sticker.emoji;


        button.title =
            "Add " + sticker.emoji;


        button.addEventListener(
            "click",
            function () {

                setSticker(

                    sticker.type,

                    sticker.emoji

                );

            }
        );


        stickerRow.appendChild(button);

    });

}


/* -----------------------------------------
   DELETE PHOTO
----------------------------------------- */

function deleteSelectedPhoto() {

    const photo =
        getSelectedPhoto();


    if (!photo) {

        return;

    }


    const confirmDelete =
        confirm(
            "Are you sure you want to delete this photo?"
        );


    if (!confirmDelete) {

        return;

    }


    state.photos =
        state.photos.filter(

            item =>
                item.id !== photo.id

        );


    state.selectedId =
        null;


    savePhotos();

    renderGallery();

    loadSelectedIntoEditor();

    updateButtons();

}


/* -----------------------------------------
   DOWNLOAD PRINT
----------------------------------------- */

async function downloadSelectedPrint() {

    const photo =
        getSelectedPhoto();


    if (!photo) {

        return;

    }


    /* -------------------------------------
       MAKE SURE LATEST MOMENT IS SAVED
    ------------------------------------- */

    photo.moment =
        momentInput.value.trim();


    savePhotos();


    /* -------------------------------------
       LOAD IMAGE
    ------------------------------------- */

    const img =
        new Image();


    img.src =
        photo.dataUrl;


    await new Promise(

        (resolve, reject) => {

            img.onload =
                resolve;

            img.onerror =
                reject;

        }

    );


    /* -------------------------------------
       CANVAS SIZE
    ------------------------------------- */

    const W = 900;

    const H = 1150;


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        W;

    canvas.height =
        H;


    const ctx =
        canvas.getContext("2d");


    /* -------------------------------------
       BACKGROUND
    ------------------------------------- */

    ctx.fillStyle =
        "#dec59e";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* -------------------------------------
       PHOTO
    ------------------------------------- */

    const padding =
        60;


    const photoX =
        padding;


    const photoY =
        padding;


    const photoW =
        W - padding * 2;


    const photoH =
        Math.floor(
            photoW * 0.75
        );


    /* Image crop */

    const imgW =
        img.width;

    const imgH =
        img.height;


    const imgAspect =
        imgW / imgH;


    const boxAspect =
        photoW / photoH;


    let sx = 0;

    let sy = 0;

    let sW = imgW;

    let sH = imgH;


    if (imgAspect > boxAspect) {

        sW =
            imgH * boxAspect;

        sx =
            (imgW - sW) / 2;

    }

    else {

        sH =
            imgW / boxAspect;

        sy =
            (imgH - sH) / 2;

    }


    ctx.drawImage(

        img,

        sx,
        sy,
        sW,
        sH,

        photoX,
        photoY,
        photoW,
        photoH

    );


    /* -------------------------------------
       PHOTO BORDER
    ------------------------------------- */

    ctx.strokeStyle =
        "#33452b";

    ctx.lineWidth =
        5;


    roundRect(

        ctx,

        photoX,
        photoY,

        photoW,
        photoH,

        25

    );


    ctx.stroke();


    /* -------------------------------------
       STICKERS
    ------------------------------------- */

    ctx.textAlign =
        "center";


    if (photo.stickerTop) {

        drawStickerText(

            ctx,

            photo.stickerTop,

            W / 2,

            photoY + 70,

            84

        );

    }


    if (photo.stickerBottom) {

        drawStickerText(

            ctx,

            photo.stickerBottom,

            W / 2,

            photoY + photoH - 35,

            84

        );

    }


    /* -------------------------------------
       STUDIO NAME
    ------------------------------------- */

    const captionY =
        photoY + photoH + 65;


    ctx.fillStyle =
        "#33452b";


    ctx.font =
        "600 34px Montserrat, Arial";


    ctx.fillText(

        "MEMORIES STUDIO ✨",

        W / 2,

        captionY

    );


    /* -------------------------------------
       MOMENT
    ------------------------------------- */

    ctx.font =
        "500 28px Montserrat, Arial";


    const moment =
        photo.moment &&
        photo.moment.trim()

            ? photo.moment

            : "— No moment yet —";


    wrapText(

        ctx,

        moment,

        W / 2,

        captionY + 65,

        W - padding * 2,

        38

    );


    /* -------------------------------------
       DOWNLOAD
    ------------------------------------- */

    const link =
        document.createElement("a");


    link.download =
        "memories-studio-" +
        photo.id +
        ".png";


    link.href =
        canvas.toDataURL(
            "image/png"
        );


    link.click();

}


/* -----------------------------------------
   ROUNDED RECTANGLE
----------------------------------------- */

function roundRect(

    ctx,
    x,
    y,
    w,
    h,
    r

) {

    const radius =
        Math.min(
            r,
            w / 2,
            h / 2
        );


    ctx.beginPath();

    ctx.moveTo(
        x + radius,
        y
    );


    ctx.arcTo(
        x + w,
        y,
        x + w,
        y + h,
        radius
    );


    ctx.arcTo(
        x + w,
        y + h,
        x,
        y + h,
        radius
    );


    ctx.arcTo(
        x,
        y + h,
        x,
        y,
        radius
    );


    ctx.arcTo(
        x,
        y,
        x + w,
        y,
        radius
    );


    ctx.closePath();

}


/* -----------------------------------------
   DRAW STICKER
----------------------------------------- */

function drawStickerText(

    ctx,
    text,
    x,
    y,
    size

) {

    ctx.save();


    ctx.font =
        `${size}px Arial`;


    /* Shadow */

    ctx.fillStyle =
        "rgba(0,0,0,0.25)";


    ctx.fillText(

        text,

        x + 5,

        y + 7

    );


    /* Sticker */

    ctx.fillStyle =
        "#ffffff";


    ctx.fillText(

        text,

        x,
        y

    );


    ctx.restore();

}


/* -----------------------------------------
   WRAP TEXT
----------------------------------------- */

function wrapText(

    ctx,
    text,
    centerX,
    startY,
    maxWidth,
    lineHeight

) {

    const words =
        text.split(/\s+/);


    let line = "";

    let y =
        startY;


    ctx.textAlign =
        "center";


    for (
        let i = 0;
        i < words.length;
        i++
    ) {

        const testLine =
            line
                ? line + " " + words[i]
                : words[i];


        const width =
            ctx.measureText(
                testLine
            ).width;


        if (width > maxWidth) {

            if (line) {

                ctx.fillText(
                    line,
                    centerX,
                    y
                );

            }


            line =
                words[i];


            y +=
                lineHeight;

        }

        else {

            line =
                testLine;

        }

    }


    if (line) {

        ctx.fillText(
            line,
            centerX,
            y
        );

    }

}


/* -----------------------------------------
   ESCAPE HTML
----------------------------------------- */

function escapeHtml(str) {

    if (
        str === null ||
        str === undefined
    ) {

        return "";

    }


    return String(str)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================
   EVENTS
========================================= */

saveEditsBtn.addEventListener(

    "click",

    saveEdits

);


deleteSelectedBtn.addEventListener(

    "click",

    deleteSelectedPhoto

);


downloadSelectedBtn.addEventListener(

    "click",

    downloadSelectedPrint

);


/* =========================================
   INITIALIZE
========================================= */

function init() {

    state.photos =
        loadPhotos();


    initStickersUI();


    /* Select latest photo */

    if (state.photos.length > 0) {

        state.selectedId =
            state.photos[
                state.photos.length - 1
            ].id;

    }


    renderGallery();

    loadSelectedIntoEditor();

    updateButtons();

}


init();