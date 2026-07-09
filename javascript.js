document.addEventListener("DOMContentLoaded", () => {
    const viewport = document.getElementById("atlas-viewport");
    const mapContent = document.getElementById("map-content");

    const zoomMin = 1;
    const zoomMax = 120;
    let zoom = 1;

    let isPanning = false;
    let startX = 0;
    let startY = 0;

    let panX = 0;
    let panY = 0;

    const baseOffsetX = -12;
    const FEET_PER_PIXEL = 250;

    function updateTransform() {
        mapContent.style.transform =
            `translate(${panX + baseOffsetX}px, ${panY}px) scale(${zoom})`;
    }

    /* -------------------------
       ZOOM DISPLAY + SCALE BAR
    ------------------------- */
    function updateZoomUI() {
        document.getElementById("zoom-display").textContent =
            `Zoom: ${zoom.toFixed(2)}x`;
    }

    function updateScaleBar() {
        const cmInPixels = 37.8; // browser standard
        const feetPerCm = (cmInPixels / zoom) * FEET_PER_PIXEL;

        document.getElementById("scale-bar-label").textContent =
            `${feetPerCm.toFixed(0)} ft`;
    }

    /* -------------------------
       ISLAND COUNT
    ------------------------- */
    function updateIslandCount() {
        const wraps = document.querySelectorAll(".island-wrap");
        document.getElementById("island-count").textContent =
            `Islands loaded: ${wraps.length}`;
    }

    /* -------------------------
       FPS COUNTER
    ------------------------- */
    let lastFrame = performance.now();
    function updateFPS() {
        const now = performance.now();
        const fps = 1000 / (now - lastFrame);
        lastFrame = now;

        document.getElementById("fps-display").textContent =
            `FPS: ${fps.toFixed(0)}`;

        requestAnimationFrame(updateFPS);
    }

    /* -------------------------
       ALWAYS-ON MOUSE TRACKING
    ------------------------- */
    viewport.addEventListener("mousemove", (e) => {
        const rect = viewport.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const mapX = (mouseX - panX) / zoom;
        const mapY = (mouseY - panY) / zoom;

        document.getElementById("mouse-display").textContent =
            `Mouse: X=${mapX.toFixed(3)}, Y=${mapY.toFixed(3)}`;

        document.getElementById("feet-display").textContent =
            `Feet: X=${(mapX * FEET_PER_PIXEL).toFixed(1)}ft, `
          + `Y=${(mapY * FEET_PER_PIXEL).toFixed(1)}ft`;
    });

    /* -------------------------
       TRUE ZOOM TOWARD MOUSE
    ------------------------- */
    viewport.addEventListener("wheel", (e) => {
        e.preventDefault();

        const rect = viewport.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const direction = e.deltaY > 0 ? -1 : 1;
        const step = zoom * 0.05;
        const newZoom = Math.min(zoomMax, Math.max(zoomMin, zoom + direction * step));

        const mapMouseX = (mouseX - panX) / zoom;
        const mapMouseY = (mouseY - panY) / zoom;

        zoom = newZoom;

        panX = mouseX - mapMouseX * zoom;
        panY = mouseY - mapMouseY * zoom;

        updateZoomUI();
        updateScaleBar();
        updateTransform();
    });

    /* -------------------------
       PANNING
    ------------------------- */
    viewport.addEventListener("mousedown", (e) => {
        isPanning = true;
        startX = e.clientX;
        startY = e.clientY;
    });

    viewport.addEventListener("mousemove", (e) => {
        if (!isPanning) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        const panFactor = zoom ** 0.01;

        panX += dx / panFactor;
        panY += dy / panFactor;

        startX = e.clientX;
        startY = e.clientY;

        updateTransform();
    });

    viewport.addEventListener("mouseup", () => isPanning = false);
    viewport.addEventListener("mouseleave", () => isPanning = false);

    document.addEventListener("dragstart", (e) => e.preventDefault());

    /* -------------------------
       INITIAL UPDATES
    ------------------------- */
    updateTransform();
    updateZoomUI();
    updateIslandCount();
    updateScaleBar();
    updateFPS();
});
