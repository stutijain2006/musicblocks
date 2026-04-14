function getRealActivity() {
    if (typeof globalActivity !== "undefined" && globalActivity?.blocks) {
        return globalActivity;
    }
    return null;
}
window._lgLastPalette = null;
window._lgPaletteCounter = 0;
window._lgPlayState = {
    started: false,
    ended: false,
    startedAt: 0
};
window._lgRestoreCounter = 0;
window._lgLocalLoadCounter = 0;
window._lgPlanetOpenCounter = 0;
window._lgTrashChangeCounter = 0;
window._lgLastTrashStackLen = -1;

function hookPlayStopButtons() {
    const playBtn = document.querySelector("#play, .play-button");
    const stopBtn = document.querySelector("#stop, .stop-button");

    if (playBtn && !playBtn._lgHooked) {
        playBtn._lgHooked = true;
        playBtn.addEventListener("click", () => {
            window._lgPlayState.started = true;
            window._lgPlayState.ended = false;
            window._lgPlayState.startedAt = Date.now();
        });
    }

    if (stopBtn && !stopBtn._lgHooked) {
        stopBtn._lgHooked = true;
        stopBtn.addEventListener("click", () => {
            window._lgPlayState.ended = true;
        });
    }
}

function hookGuideActionButtons() {
    const restoreBtn = document.querySelector("#restoreIcon");
    if (restoreBtn && !restoreBtn._lgHooked) {
        restoreBtn._lgHooked = true;
        restoreBtn.addEventListener("click", () => {
            if (!window._lgRunningDemo) {
                window._lgRestoreCounter++;
            }
        });
    }

    const fileInput = document.querySelector("#myOpenFile");
    if (fileInput && !fileInput._lgHooked) {
        fileInput._lgHooked = true;
        fileInput.addEventListener("change", () => {
            if (!window._lgRunningDemo) {
                window._lgLocalLoadCounter++;
            }
        });
    }

    const planetBtn = document.querySelector("#planetIcon");
    if (planetBtn && !planetBtn._lgHooked) {
        planetBtn._lgHooked = true;
        planetBtn.addEventListener("click", () => {
            if (!window._lgRunningDemo) {
                window._lgPlanetOpenCounter++;
            }
        });
    }

    const activity = getRealActivity();
    const trashLen = activity?.blocks?.trashStacks?.length;
    if (typeof trashLen === "number") {
        if (window._lgLastTrashStackLen === -1) {
            window._lgLastTrashStackLen = trashLen;
        } else {
            if (trashLen > window._lgLastTrashStackLen && !window._lgRunningDemo) {
                window._lgTrashChangeCounter++;
            }
            window._lgLastTrashStackLen = trashLen;
        }
    }
}

let LG = {
    step: 0,
    active: false,
    interval: null,
    initialCounts: {},
    maxWaitTime: 30000, // 30 seconds max wait
    waitStartTime: null,

    init() {
        const wait = setInterval(() => {
            const activity = getRealActivity();

            if (
                activity &&
                activity.blocks &&
                activity.blocks.blockList &&
                Object.keys(activity.blocks.blockList).length > 0
            ) {
                clearInterval(wait);
                this.start();
            }
        }, 300);

        const waitPlayHook = setInterval(() => {
            hookPlayStopButtons();
            hookGuideActionButtons();
        }, 500);
    },

    tryMultipleDetectionMethods() {
        const methods = [
            () => this.detectViaWindowActivity(),
            () => this.detectViaCanvas(),
            () => this.detectViaPalettes(),
            () => this.detectViaBlocksContainer()
        ];

        let methodIndex = 0;

        const tryNextMethod = () => {
            if (methodIndex >= methods.length) {
                // If all methods fail, try a more aggressive approach
                setTimeout(() => this.forceStartAfterDelay(), 2000);
                return;
            }

            const currentMethod = methods[methodIndex];

            if (currentMethod()) {
                this.start();
                return;
            }

            methodIndex++;
            setTimeout(tryNextMethod, 1000); // Wait 1 second between methods
        };

        tryNextMethod();
    },

    // Method 1: Original approach
    detectViaWindowActivity() {
        const activity = getRealActivity();
        if (activity && activity.blocks && activity.blocks.blockList) {
            return true;
        }
        return false;
    },

    // Manual palette opening fallback
    openPaletteManually(paletteName) {
        const button = this.findPaletteButton(paletteName);
        if (button) {
            button.click();
            return true;
        }

        // Try alternative selectors
        const alternatives = [
            `#${paletteName}tabbutton`,
            `#${paletteName.charAt(0).toUpperCase()}${paletteName.slice(1)}tabbutton`,
            `[data-palette="${paletteName}"]`,
            `[title*="${paletteName}"]`
        ];

        for (const selector of alternatives) {
            const btn = document.querySelector(selector);
            if (btn) {
                btn.click();
                return true;
            }
        }

        return false;
    },

    findPaletteButton(paletteName) {
        // Multiple strategies to find palette buttons
        const strategies = [
            () => document.getElementById(`${paletteName}tabbutton`),
            () =>
                document.getElementById(
                    `${paletteName.charAt(0).toUpperCase()}${paletteName.slice(1)}tabbutton`
                ),
            () => document.querySelector(`[id*="${paletteName}"][id*="tab"]`),
            () => document.querySelector(`[data-palette="${paletteName}"]`),
            () => {
                // Look for buttons containing the palette name
                const buttons = document.querySelectorAll('button, [role="button"]');
                for (const btn of buttons) {
                    if (
                        btn.textContent &&
                        btn.textContent.toLowerCase().includes(paletteName.toLowerCase())
                    ) {
                        return btn;
                    }
                }
                return null;
            }
        ];

        for (const strategy of strategies) {
            const result = strategy();
            if (result) return result;
        }

        return null;
    },

    showErrorMessage() {
        const errorDiv = document.createElement("div");
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff5722;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        errorDiv.innerHTML = `
            <strong>⚠️ Learning Guide Error</strong><br>
            Music Blocks is not fully loaded yet.<br>
            <button onclick="LG.retryInitialization(); this.parentElement.remove();" 
                    style="margin-top: 10px; padding: 5px 15px; background: white; color: #ff5722; border: none; border-radius: 5px; cursor: pointer;">
                Retry
            </button>
            <button onclick="this.parentElement.remove()" 
                    style="margin: 10px 0 0 10px; padding: 5px 15px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 5px; cursor: pointer;">
                Close
            </button>
        `;
        document.body.appendChild(errorDiv);
    },

    retryInitialization() {
        this.waitStartTime = Date.now();
        this.tryMultipleDetectionMethods();
    },

    prepareStep(step) {
        const activity = getRealActivity();
        let octave = null;

        if (!activity || !activity.blocks?.blockList) {
            this.initialCounts[this.step] = 0;
            return;
        }

        const blockList = activity.blocks.blockList;

        if (step.action === "palette") {
            this.initialCounts[this.step] = window._lgPaletteCounter;
            return;
        }
        // 👇 SPECIAL CASE: pitch_inside step
        if (step.action === "pitch_inside") {
            let count = 0;

            for (const id in blockList) {
                const block = blockList[id];
                if (
                    block &&
                    block.name === "pitch" &&
                    !block.trash &&
                    block.container?.visible !== false &&
                    GuideValidator.isPitchInsideNote(block, blockList)
                ) {
                    count++;
                }
            }

            this.initialCounts[this.step] = count;
            return;
        }

        if (step.action === "octave_change") {
            const activity = getRealActivity();
            const blockList = activity?.blocks?.blockList || {};

            const octaves = [];

            for (const id in blockList) {
                const block = blockList[id];

                // Number blocks connected to pitch blocks
                if (
                    block &&
                    block.name === "number" &&
                    typeof block.value === "number" &&
                    block.connections
                ) {
                    // Check if parent is pitch
                    const parentId = block.connections[0];
                    const parent = blockList[parentId];

                    if (parent && parent.name === "pitch" && !parent.trash) {
                        octaves.push(block.value);
                    }
                }
            }

            this.initialCounts[this.step] = octaves;
            return;
        }

        if (step.action === "connect") {
            const activity = getRealActivity();
            const blockList = activity?.blocks?.blockList || {};

            let initialConnection = null;
            let initialStartNoteCount = 0;

            for (const id in blockList) {
                const block = blockList[id];
                if (block && block.name === "start" && block.connections) {
                    initialConnection = block.connections[1] || null;
                    let currentId = initialConnection;
                    let guard = 0;
                    while (currentId !== null && currentId !== undefined && guard < 80) {
                        const current = blockList[currentId];
                        if (!current || current.trash) break;
                        if (current.name === "newnote" || current.name === "note") {
                            initialStartNoteCount++;
                        }
                        currentId = current.connections?.[1] ?? null;
                        guard++;
                    }
                    break;
                }
            }

            this.initialCounts[this.step] = {
                initialConnection,
                initialStartNoteCount
            };
            return;
        }

        if (step.action === "play") {
            window._lgPlayState.started = false;
            window._lgPlayState.ended = false;
            window._lgPlayState.startedAt = 0;
            return;
        }

        if (step.action === "melody") {
            const activity = getRealActivity();
            const blockList = activity?.blocks?.blockList || {};

            const noteIds = [];

            for (const id in blockList) {
                const block = blockList[id];
                if (
                    block &&
                    block.name &&
                    block.name.toLowerCase().includes("note") &&
                    !block.trash &&
                    block.container?.visible !== false
                ) {
                    noteIds.push(id);
                }
            }

            this.initialCounts[this.step] = noteIds;
            return;
        }

        if (step.action === "tone_block") {
            const activity = getRealActivity();
            const blockList = activity?.blocks?.blockList || {};

            // store IDs, not just count
            const existingIds = [];

            for (const id in blockList) {
                if (blockList[id]?.name === "voicename" && !blockList[id].trash) {
                    existingIds.push(id);
                }
            }

            this.initialCounts[this.step] = existingIds;
            return;
        }

        if (step.action === "delete_restore") {
            this.initialCounts[this.step] = {
                restoreCounter: window._lgRestoreCounter,
                trashChangeCounter: window._lgTrashChangeCounter
            };
            return;
        }

        if (step.action === "load_local") {
            this.initialCounts[this.step] = window._lgLocalLoadCounter;
            return;
        }

        if (step.action === "load_planet") {
            this.initialCounts[this.step] = window._lgPlanetOpenCounter;
            return;
        }

        const blockName = step.block;

        let count = 0;
        for (const id in blockList) {
            const block = blockList[id];
            if (block && block.name === blockName && !block.trash) {
                count++;
            }
        }

        this.initialCounts[this.step] = count;
    },

    getBlockList() {
        // Try window.activity first
        let activity = getRealActivity();

        // Fallback to globalActivity if available
        if (!activity && typeof globalActivity !== "undefined") {
            activity = globalActivity;
        }

        if (!activity) {
            return {};
        }
        if (!activity.blocks) {
            return {};
        }
        if (!activity.blocks.blockList) {
            return {};
        }

        const blockList = activity.blocks.blockList;
        const isArray = Array.isArray(blockList);
        const length = isArray ? blockList.length : Object.keys(blockList).length;
        // Also check if there are any blocks at all
        if (length > 0) {
            let sampleNames = [];
            for (const id in blockList) {
                if (isArray && isNaN(parseInt(id))) continue;
                const block = blockList[id];
                if (block && block.name) {
                    sampleNames.push(block.name);
                    if (sampleNames.length >= 5) break;
                }
            }
        }

        return blockList;
    },

    countBlocksByName(blockList, blockName) {
        if (!blockList) {
            return 0;
        }

        // Debug: Check blockList structure
        const isArray = Array.isArray(blockList);
        const length = isArray ? blockList.length : Object.keys(blockList).length;

        // Use for...in loop - works for both arrays and objects
        let count = 0;
        const blockNames = [];
        const allBlocks = [];
        let nullCount = 0;

        for (const blockId in blockList) {
            // Skip non-numeric indices for arrays (like methods/properties)
            if (isArray && isNaN(parseInt(blockId))) {
                continue;
            }

            const block = blockList[blockId];
            if (!block) {
                nullCount++;
                continue;
            }

            allBlocks.push({ id: blockId, name: block.name || "no-name" });
            const blockNameValue = block.name;

            if (blockNameValue) {
                blockNames.push(blockNameValue);
                if (blockNameValue === blockName) {
                    count++;
                }
            }
        }
        return count;
    },

    start() {
        if (this.active) {
            return;
        }
        this.active = true;
        this.step = 0;
        this.prepareStep(GuideSteps[this.step]);
        GuideUI.show(GuideSteps[this.step]);
        this.watch();
    },

    watch() {
        clearInterval(this.interval);
        const step = GuideSteps[this.step];

        // Handle different step types
        if (step.action === "palette") {
            this.watchPaletteStep(step);
        } else {
            this.watchRegularStep(step);
        }
    },

    watchPaletteStep(step) {
        let attempts = 0;
        const maxAttempts = 60; // 30 seconds max (60 * 500ms)

        const checkPalette = () => {
            attempts++;

            const isComplete = GuideValidator.check(step);
            if (isComplete) {
                clearInterval(this.interval);
                GuideUI.unlock();
                return;
            }

            if (attempts >= maxAttempts) {
                clearInterval(this.interval);
                // Don't auto-unlock - let user complete the step manually
                return;
            }
        };

        // Use setInterval for consistency with regular steps
        clearInterval(this.interval);
        this.interval = setInterval(checkPalette, 500);
    },

    watchRegularStep(step) {
        clearInterval(this.interval);
        this.interval = setInterval(() => {
            const isComplete = GuideValidator.check(step);
            if (isComplete) {
                clearInterval(this.interval);
                GuideUI.unlock();
            }
        }, 500);
    },

    next() {
        const currentStep = GuideSteps[this.step];
        const isComplete = GuideValidator.check(currentStep);

        if (!isComplete) {
            // Re-enable watching in case validation was missed
            this.watch();
            return;
        }

        // Clear any intervals before moving
        clearInterval(this.interval);

        this.step++;
        if (this.step >= GuideSteps.length) {
            GuideUI.finish();
            return;
        }

        const nextStep = GuideSteps[this.step];

        // Prepare step first to capture initial state
        this.prepareStep(nextStep);

        // Then show the step UI (which may trigger actions like opening palettes)
        GuideUI.show(nextStep);

        // Start watching for completion
        this.watch();
    },

    prev() {
        if (this.step === 0) return;

        this.step--;
        this.prepareStep(GuideSteps[this.step]);
        GuideUI.show(GuideSteps[this.step]);
        this.watch();
    },

    stop() {
        this.active = false;
        clearInterval(this.interval);
        GuideUI.close();
    }
};

function addLearningGuideTopButton() {
    const menuBtn = document.getElementById("toggleAuxBtn");
    if (!menuBtn) {
        return;
    }

    if (document.getElementById("learning-guide-top-btn")) return;

    // Get correct insertion point
    const menuLi = menuBtn.closest("li");
    const ul = menuLi.parentElement;

    const li = document.createElement("li");

    const btn = document.createElement("a");
    btn.id = "learning-guide-top-btn";
    btn.className = "tooltipped"; // ✅ Materialize tooltip class

    // ✅ Materialize tooltip attributes
    btn.setAttribute("data-position", "bottom");
    btn.setAttribute("data-delay", "10");
    btn.setAttribute("data-tooltip", "Replay Learning Guide");

    btn.style.cursor = "pointer";

    btn.innerHTML = `<i class="material-icons md-48">school</i>`;

    btn.onclick = () => {
        window.startLearningGuide();
    };

    li.appendChild(btn);

    // Insert after menu button
    ul.insertBefore(li, menuLi.nextSibling);

    // ✅ IMPORTANT: re-initialize Materialize tooltips
    if (window.M && M.Tooltip) {
        M.Tooltip.init(btn);
    }
}

// Enhanced initialization
document.addEventListener("DOMContentLoaded", () => {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        const waitPaletteHook = setInterval(() => {
            const activity = getRealActivity();
            if (activity?.blocks?.palettes?.showPalette) {
                clearInterval(waitPaletteHook);

                const original = activity.blocks.palettes.showPalette;
                activity.blocks.palettes.showPalette = function (name) {
                    if (!window._lgRunningDemo) {
                        window._lgLastPalette = name;
                        window._lgPaletteCounter++;
                    }
                    return original.call(this, name);
                };
            }
        }, 300);
        addLearningGuideTopButton();
        if (!sessionStorage.getItem("learningGuidePlayed")) {
            sessionStorage.setItem("learningGuidePlayed", "true");
            LG.init();
        }
    }, 2000); // Wait 2 seconds after DOM ready
});

// Also try after window load as fallback
window.addEventListener("load", () => {
    setTimeout(() => {
        if (!LG.active) {
            LG.init();
        }
    }, 1000);
});

window.startLearningGuide = function () {
    // Hard reset
    LG.stop();
    LG.active = false;
    LG.step = 0;
    LG.initialCounts = {};
    clearInterval(LG.interval);

    // Start fresh
    LG.start();
};
