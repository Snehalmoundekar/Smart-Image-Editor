//These lines select various DOM elements used in the interface, such as the file upload box, image preview, input fields for width, height, and quality, buttons for cropping, resizing, and downloading, and panels for cropping and resizing.
const uploadBox = document.querySelector(".upload-box"),
    previewImg = uploadBox.querySelector("img"),
    fileInput = uploadBox.querySelector("input"),
    validationMessage = document.querySelector(".validation-message"),
    Message = document.querySelector(".message"),
    widthInput = document.querySelector(".width input"),
    heightInput = document.querySelector(".height input"),
    ratioInput = document.querySelector(".ratio input"),
    qualityInput = document.querySelector(".quality input"),
    downloadBtn = document.querySelector(".download-btn"),
    cropBtn = document.querySelector(".crop-btn"),
    resizeBtn = document.querySelector(".resize-btn"),
    cropPanel = document.querySelector(".crop-panel"),
    resizePanel = document.querySelector(".resize-panel"),
    applyCropBtn = document.querySelector(".apply-crop-btn"),
    compressionPanel = document.querySelector(".compression-panel"),
    compressionQualityInput = document.querySelector("#compression-quality"),
    compressionValue = document.querySelector("#compression-value"),
    compressBtn = document.querySelector(".compress-btn"),
    compressDownloadBtn = document.querySelector(".compress-download-btn"),
    subheading = document.querySelector(".sub-heading"),
    convertBtn = document.querySelector(".convert-btn"),
    conversionPanel = document.querySelector(".conversion-panel"),
    conversionFormatSelect = document.querySelector("#conversion-format"),
    convertDownloadBtn = document.querySelector(".convert-download-btn");


let ogImageRatio;
let cropper;
let imageToCompress;


// Load the image 
// This function handles the image file input. It validates the file type (only images are allowed), clears the preview if the file type is invalid, and sets up the preview and other inputs for the image (e.g., width, height, aspect ratio).

// Show Compression Panel
compressBtn.addEventListener("click", () => {
    subheading.textContent = "Compress Image";
    compressionPanel.style.display = "block";
    resizePanel.style.display = "none";
    resizeBtn.style.display = "none";
    cropBtn.style.display = "none";
    compressBtn.style.display = "block";
    cropPanel.style.display = "none";
    conversionPanel.style.display = "none";
    convertBtn.style.display = "none";
});

// Update Compression Quality Display
compressionQualityInput.addEventListener("input", (e) => {
    compressionValue.textContent = `${e.target.value}%`;
});
const loadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Validate file type
    if (!file.type.startsWith("image/")) {
        validationMessage.style.display = "block"; // Show error message
        Message.style.display = "none"; // hide broweser message
        previewImg.src = ""; // Clear the preview
        const imgElement = uploadBox.querySelector("img");
        imgElement.src = "delete.png";
        return;
    }

    validationMessage.style.display = "none"; // Hide error message
    previewImg.src = URL.createObjectURL(file);
    imageToCompress = file; // Save the image for compression
    previewImg.addEventListener("load", () => {
        widthInput.value = previewImg.naturalWidth;
        heightInput.value = previewImg.naturalHeight;
        ogImageRatio = previewImg.naturalWidth / previewImg.naturalHeight;
        document.querySelector(".wrapper").classList.add("active");
    });
};

// Prevent click propagation on the image during cropping
previewImg.addEventListener("click", (e) => {
    if (cropper) e.stopPropagation(); // Prevent opening the file dialog
});

// Handle crop button click
cropBtn.addEventListener("click", () => {
    subheading.textContent = "Crop Image";
    resizePanel.style.display = "none";
    cropPanel.style.display = "block";
    resizeBtn.style.display = "none";
    cropBtn.style.display = "block";
    compressionPanel.style.display = "none";
    compressBtn.style.display = "none";
    conversionPanel.style.display = "none";
    convertBtn.style.display = "none";

    if (cropper) cropper.destroy();
    cropper = new Cropper(previewImg, {
        // aspectRatio: 16 / 9,
        viewMode: 1,
    });
});

// Handle resize button click
resizeBtn.addEventListener("click", () => {
    subheading.textContent = "Resize Image";
    cropPanel.style.display = "none";
    resizePanel.style.display = "block";
    resizeBtn.style.display = "none";
    cropBtn.style.display = "block";
    compressionPanel.style.display = "none";
    compressBtn.style.display = "block";
    conversionPanel.style.display = "none";
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
});

// Apply the crop
applyCropBtn.addEventListener("click", () => {
    if (!cropper) return;

    const croppedCanvas = cropper.getCroppedCanvas();
    previewImg.src = croppedCanvas.toDataURL();

    widthInput.value = croppedCanvas.width;
    heightInput.value = croppedCanvas.height;

    cropper.destroy();
    cropper = null;
    cropPanel.style.display = "none";
    resizePanel.style.display = "none";
    resizeBtn.style.display = "none";
    cropBtn.style.display = "block";
    compressionPanel.style.display = "none";
    // Download cropped image
    const a = document.createElement("a");
    a.href = croppedCanvas.toDataURL("image/jpeg");
    a.download = `cropped_image_${Date.now()}.jpg`;
    a.click();

});
// Hide the resize button by default
resizeBtn.style.display = "none";

// Handle resizing inputs
widthInput.addEventListener("keyup", () => {
    const height = ratioInput.checked ? widthInput.value / ogImageRatio : heightInput.value;
    heightInput.value = Math.floor(height);
});

heightInput.addEventListener("keyup", () => {
    const width = ratioInput.checked ? heightInput.value * ogImageRatio : widthInput.value;
    widthInput.value = Math.floor(width);
});

// Resize and download the image
const resizeAndDownload = () => {
    const canvas = document.createElement("canvas");
    const a = document.createElement("a");
    const ctx = canvas.getContext("2d");

    const imgQuality = qualityInput.checked ? 0.7 : 1.0;
    canvas.width = widthInput.value;
    canvas.height = heightInput.value;

    ctx.drawImage(previewImg, 0, 0, canvas.width, canvas.height);

    a.href = canvas.toDataURL("image/jpeg", imgQuality);
    a.download = `resized_image_${Date.now()}.jpg`;
    a.click();
};
// Compress and Download Image
compressDownloadBtn.addEventListener("click", () => {
    if (!imageToCompress) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const quality = compressionQualityInput.value / 100;

    const img = new Image();
    img.src = previewImg.src;

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedData = canvas.toDataURL("image/jpeg", quality);

        const a = document.createElement("a");
        a.href = compressedData;
        a.download = `compressed_image_${Date.now()}.jpg`;
        a.click();
    };
});
// Show Conversion Panel when Convert Button is Clicked
convertBtn.addEventListener("click", () => {
    conversionPanel.style.display = "block"; // Show the conversion panel
    subheading.textContent = "Convert Image Format";
    compressionPanel.style.display = "none";
    resizePanel.style.display = "none";
    cropPanel.style.display = "none";
    resizeBtn.style.display = "none";
    compressBtn.style.display = "none";
    cropBtn.style.display = "none";


});

// Handle Conversion and Download
convertDownloadBtn.addEventListener("click", () => {
    const format = conversionFormatSelect.value;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = previewImg.src;

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        let convertedDataUrl;

        // Convert based on selected format
        if (format === "jpg") {
            convertedDataUrl = canvas.toDataURL("image/jpg");
        }
        else if (format === "png") {
            convertedDataUrl = canvas.toDataURL("image/png");
        }
        else if (format === "jpeg") {
            convertedDataUrl = canvas.toDataURL("image/jpeg");
        }
        else if (format === "gif") {
            convertedDataUrl = canvas.toDataURL("image/gif");
        }
        else if (format === "svg") {
            // Convert to SVG (rasterize image as base64 in an SVG container)
            const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}">
                                <image href="${canvas.toDataURL('image/png')}" width="${img.width}" height="${img.height}" />
                              </svg>`;
            convertedDataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
        }

        // Trigger download
        const a = document.createElement("a");
        a.href = convertedDataUrl;
        a.download = `converted_image_${Date.now()}.${format}`;
        a.click();
    };
});

// Trigger file upload
fileInput.addEventListener("change", loadFile);
uploadBox.addEventListener("click", (e) => {
    if (!cropper) fileInput.click(); // Only open the file dialog if not cropping
});
downloadBtn.addEventListener("click", resizeAndDownload);
