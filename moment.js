// =========================================
// MEMORIES STUDIO - MOMENTS JAVASCRIPT
// =========================================


const STORAGE_KEY =
    "memories_gallery_photos";


// =========================================
// ELEMENTS
// =========================================

const photoBook =
    document.getElementById("photoBook");

const modal =
    document.getElementById("momentModal");

const closeModal =
    document.getElementById("closeModal");

const modalImage =
    document.getElementById("modalImage");

const momentInput =
    document.getElementById("momentInput");

const saveMoment =
    document.getElementById("saveMoment");

const deletePhoto =
    document.getElementById("deletePhoto");

const stickerButtons =
    document.querySelectorAll(
        "#stickerButtons button"
    );


// =========================================
// VARIABLES
// =========================================

let photos = [];

let selectedPhotoId = null;

let selectedSticker = "";


// =========================================
// LOAD PHOTOS
// =========================================

function loadPhotos() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!saved) {

            photos = [];

        } else {

            photos =
                JSON.parse(saved);

        }


        if (!Array.isArray(photos)) {

            photos = [];

        }

    }

    catch (error) {

        console.error(error);

        photos = [];

    }


    renderPhotos();

}


// =========================================
// SAVE PHOTOS
// =========================================

function savePhotos() {

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(photos)

    );

}


// =========================================
// RENDER PHOTO BOOK
// =========================================

function renderPhotos() {

    photoBook.innerHTML = "";


    // No photos
    if (photos.length === 0) {

        photoBook.innerHTML = `

            <div class="empty">

                <h3>
                    Your photo book is empty ♡
                </h3>

                <p>
                    Go to the Photobooth,
                    take a photo and download it.
                    It will appear here automatically.
                </p>

            </div>

        `;

        return;

    }


    // Display photos
    photos.forEach(
        (photo, index) => {

            const card =
                document.createElement("div");


            card.className =
                "photo-card";


            const moment =
                photo.moment &&
                photo.moment.trim()
                    ? escapeHTML(photo.moment)
                    : "Write a moment about this memory...";


            const sticker =
                photo.stickerTop ||
                photo.stickerBottom ||
                "";


            card.innerHTML = `

                <img
                    src="${photo.dataUrl}"
                    alt="Memory ${index + 1}"
                >


                <div class="photo-info">

                    <h3>
                        Memory ${index + 1}
                    </h3>


                    <div class="moment">

                        ${moment}

                    </div>


                    <div class="sticker">

                        ${sticker}

                    </div>


                    <button
                        class="edit-btn"
                        data-id="${photo.id}">

                        ✍️ Add Moment

                    </button>

                </div>

            `;


            photoBook.appendChild(card);

        }
    );


    // Add click events
    const editButtons =
        document.querySelectorAll(
            ".edit-btn"
        );


    editButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    openEditor(
                        button.dataset.id
                    );

                }
            );

        }
    );

}


// =========================================
// OPEN EDITOR
// =========================================

function openEditor(id) {

    const photo =
        photos.find(
            item => item.id === id
        );


    if (!photo) return;


    selectedPhotoId = id;


    // Show image
    modalImage.src =
        photo.dataUrl;


    // Load existing moment
    momentInput.value =
        photo.moment || "";


    // Load existing sticker
    selectedSticker =
        photo.stickerTop ||
        photo.stickerBottom ||
        "";


    modal.classList.add(
        "show"
    );


    momentInput.focus();

}


// =========================================
// CLOSE EDITOR
// =========================================

function closeEditor() {

    modal.classList.remove(
        "show"
    );


    selectedPhotoId =
        null;


    selectedSticker =
        "";

}


// =========================================
// SELECT STICKER
// =========================================

stickerButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                selectedSticker =
                    button.dataset.sticker;


                // Remove active
                stickerButtons.forEach(
                    btn => {

                        btn.style.transform =
                            "scale(1)";

                    }
                );


                // Highlight selected
                button.style.transform =
                    "scale(1.2)";

            }
        );

    }
);


// =========================================
// SAVE MOMENT
// =========================================

saveMoment.addEventListener(
    "click",
    () => {

        if (!selectedPhotoId) {

            return;

        }


        const photo =
            photos.find(
                item =>
                    item.id ===
                    selectedPhotoId
            );


        if (!photo) return;


        // Save moment
        photo.moment =
            momentInput.value;


        // Save sticker
        if (selectedSticker) {

            photo.stickerTop =
                selectedSticker;

            photo.stickerBottom =
                null;

        }


        savePhotos();


        renderPhotos();


        closeEditor();


        alert(
            "♡ Your moment has been saved!"
        );

    }
);


// =========================================
// DELETE PHOTO
// =========================================

deletePhoto.addEventListener(
    "click",
    () => {

        if (!selectedPhotoId) {

            return;

        }


        const confirmation =
            confirm(
                "Are you sure you want to delete this memory?"
            );


        if (!confirmation) {

            return;

        }


        photos =
            photos.filter(
                photo =>
                    photo.id !==
                    selectedPhotoId
            );


        savePhotos();


        renderPhotos();


        closeEditor();

    }
);


// =========================================
// CLOSE BUTTON
// =========================================

closeModal.addEventListener(
    "click",
    closeEditor
);


// =========================================
// CLICK OUTSIDE MODAL
// =========================================

modal.addEventListener(
    "click",
    event => {

        if (
            event.target === modal
        ) {

            closeEditor();

        }

    }
);


// =========================================
// ESCAPE HTML
// =========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


// =========================================
// START
// =========================================

loadPhotos();