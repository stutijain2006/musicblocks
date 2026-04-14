window.GuideValidator = {
    check(step) {
        if (!step.action) {
            return true;
        }

        // Get activity with fallbacks
        const activity = this.getActivitySafely();

        switch (step.action) {
            case "palette":
                return this.validatePalette(step.palette);
            case "block":
                return this.validateBlockAdded(step.block);
            case "pitch_inside":
                return this.validatePitchInNote();
            case "connect":
                return this.validateConnection();
            case "octave_change":
                return this.validateOctaveChange();
            case "melody":
                return this.validateMelody();
            case "play":
                return this.validatePlay();
            case "save":
                return window._guideSaved === true;
            case "delete_restore":
                return this.validateDeleteRestore();
            case "load_local":
                return this.validateLoadLocal();
            case "load_planet":
                return this.validateLoadPlanet();
            case "tone_block":
                return this.validateToneBlock();
            case "flow_block":
                return this.validateFlowBlock();
            case "graphics_block":
                return this.validateGraphicsBlock();
            default:
                return false;
        }
    },

    getActivitySafely() {
        // Try window.activity first
        const activity = getRealActivity();
        if (activity && activity.blocks) {
            return activity;
        }
        // Fallback to globalActivity
        if (typeof globalActivity !== "undefined" && globalActivity && globalActivity.blocks) {
            return globalActivity;
        }
        return null;
    },

    validatePalette(paletteName) {
        const initialCounter = LG.initialCounts[LG.step] ?? 0;
        const currentCounter = window._lgPaletteCounter;

        if (window._lgRunningDemo) return false;
        const result = window._lgLastPalette === paletteName && currentCounter > initialCounter;
        return result;
    },

    validateBlockAdded(blockName) {
        const activity = getRealActivity();
        if (!activity || !activity.blocks?.blockList) {
            return false;
        }

        const blockList = activity.blocks.blockList;
        let current = 0;

        for (const id in blockList) {
            const block = blockList[id];
            if (
                block &&
                block.name === blockName &&
                !block.trash &&
                !window._lgDemoBlocks.includes(id) &&
                block.container?.visible !== false
            ) {
                current++;
            }
        }

        const initial = LG.initialCounts[LG.step] || 0;
        const result = current > initial;
        return result;
    },

    validatePitchInNote() {
        const activity = this.getActivitySafely();
        if (!activity) return false;

        const blockList = activity.blocks.blockList || {};
        let current = 0;

        for (const id in blockList) {
            const block = blockList[id];
            if (
                block &&
                block.name === "pitch" &&
                !block.trash &&
                block.container?.visible !== false &&
                !window._lgDemoBlocks.includes(id) &&
                this.isPitchInsideNote(block, blockList)
            ) {
                current++;
            }
        }

        const initial = LG.initialCounts[LG.step] || 0;
        const result = current > initial;
        return result;
    },

    isPitchInsideNote(pitchBlock, blockList) {
        let parent = pitchBlock;
        let depth = 0;

        while (parent && depth < 10) {
            const parentId = parent.connections && parent.connections[0];
            if (!parentId) break;

            parent = blockList[parentId];
            if (!parent) break;

            if (parent.name === "newnote" || parent.name === "note") {
                return true;
            }

            if (parent.name === "vspace") {
                depth++;
                continue;
            }

            depth++;
        }

        return false;
    },
    isBlockInsideNote(block, blockList) {
        let parent = block;
        let depth = 0;

        while (parent && depth < 10) {
            const parentId = parent.connections && parent.connections[0];
            if (!parentId) break;

            parent = blockList[parentId];
            if (!parent) break;

            if (parent.name === "note" || parent.name === "newnote") {
                return true;
            }

            depth++;
        }
        return false;
    },

    validateOctaveChange() {
        if (window._lgRunningDemo) return false;
        const activity = getRealActivity();
        if (!activity) return false;

        const blockList = activity.blocks.blockList || {};
        const currentOctaves = [];

        for (const id in blockList) {
            const block = blockList[id];

            if (
                block &&
                block.name === "number" &&
                typeof block.value === "number" &&
                block.connections
            ) {
                const parentId = block.connections[0];
                const parent = blockList[parentId];

                if (parent && parent.name === "pitch" && !parent.trash) {
                    currentOctaves.push(block.value);
                }
            }
        }

        const initial = LG.initialCounts[LG.step] || [];

        const changed =
            currentOctaves.length !== initial.length ||
            currentOctaves.some((val, i) => val !== initial[i]);
        return changed;
    },

    validateConnection() {
        if (window._lgRunningDemo) return false;
        const activity = this.getActivitySafely();
        if (!activity) return false;

        const blockList = activity.blocks.blockList || {};
        let currentConnection = null;
        let currentStartNoteCount = 0;

        for (const id in blockList) {
            const block = blockList[id];
            if (block && block.name === "start" && block.connections) {
                currentConnection = block.connections[1] || null;
                let currentId = currentConnection;
                let guard = 0;
                while (currentId !== null && currentId !== undefined && guard < 80) {
                    const current = blockList[currentId];
                    if (!current || current.trash) break;
                    if (current.name === "newnote" || current.name === "note") {
                        currentStartNoteCount++;
                    }
                    currentId = current.connections?.[1] ?? null;
                    guard++;
                }
                break;
            }
        }

        const initial = LG.initialCounts[LG.step] || {
            initialConnection: null,
            initialStartNoteCount: 0
        };
        const changedConnection = currentConnection !== initial.initialConnection;
        const extendedStack = currentStartNoteCount > initial.initialStartNoteCount;
        const changed = changedConnection || extendedStack;
        return changed;
    },
    validatePlay() {
        const playState = window._lgPlayState;
        const { started } = playState;
        let { ended } = playState;

        // Allow completion when playback naturally finishes (without Stop click).
        if (started && !ended) {
            const activity = this.getActivitySafely();
            const startedAt = playState.startedAt || 0;
            const elapsed = Date.now() - startedAt;
            if (activity?.turtles && elapsed > 800 && !activity.turtles.running()) {
                ended = true;
                playState.ended = true;
            }
        }

        const result = started && ended;
        return result;
    },

    validateMelody() {
        if (window._lgRunningDemo) return false;
        const activity = this.getActivitySafely();
        if (!activity) return false;

        const blockList = activity.blocks.blockList || {};
        const initialNoteIds = LG.initialCounts[LG.step] || [];
        const initialIdSet = new Set(initialNoteIds.map(id => String(id)));
        const demoIdSet = new Set((window._lgDemoBlocks || []).map(id => String(id)));
        let addedConnectedToStart = 0;

        for (const id in blockList) {
            const block = blockList[id];
            if (
                block &&
                block.name &&
                block.name.toLowerCase().includes("note") &&
                !block.trash &&
                !demoIdSet.has(String(id)) &&
                block.container?.visible !== false &&
                !initialIdSet.has(String(id)) &&
                this.hasStartAncestor(block, blockList)
            ) {
                addedConnectedToStart++;
            }
        }

        const result = addedConnectedToStart >= 3;
        return result;
    },
    hasStartAncestor(block, blockList) {
        let parent = block;
        let depth = 0;

        while (parent && depth < 50) {
            const parentId = parent.connections && parent.connections[0];
            if (parentId === null || parentId === undefined) return false;

            parent = blockList[parentId];
            if (!parent || parent.trash) return false;

            if (parent.name === "start") return true;

            depth++;
        }

        return false;
    },
    validateToneBlock() {
        if (window._lgRunningDemo) return false;
        const activity = this.getActivitySafely();
        if (!activity) return false;

        const blockList = activity.blocks.blockList || {};
        const initialIds = LG.initialCounts[LG.step] || [];

        for (const id in blockList) {
            const block = blockList[id];
            if (
                block &&
                block.name === "voicename" &&
                !block.trash &&
                !initialIds.includes(id) // ✅ NEW block only
            ) {
                // This is a newly added Set Instrument
                if (
                    typeof block.value === "string" &&
                    block.value !== "" &&
                    block.value !== "electronic synth"
                ) {
                    return true;
                }
            }
        }

        return false;
    },

    validateFlowBlock() {
        const activity = this.getActivitySafely();
        if (!activity) return false;

        const blockList = activity.blocks.blockList || {};

        for (const id in blockList) {
            const block = blockList[id];
            if (
                block &&
                block.name === "repeat" &&
                !block.trash &&
                block.connections &&
                block.connections[2] !== null
            ) {
                return true;
            }
        }

        return false;
    },

    validateGraphicsBlock() {
        const activity = this.getActivitySafely();
        if (!activity) return false;

        const blockList = activity.blocks.blockList || {};

        for (const id in blockList) {
            const block = blockList[id];

            if (
                block &&
                block.name === "forward" &&
                !block.trash &&
                this.isBlockInsideNote(block, blockList)
            ) {
                return true;
            }
        }

        return false;
    },
    validateDeleteRestore() {
        if (window._lgRunningDemo) return false;
        const baseline = LG.initialCounts[LG.step] || {
            restoreCounter: 0,
            trashChangeCounter: 0
        };
        const deleted = window._lgTrashChangeCounter > baseline.trashChangeCounter;
        const restoredViaButton = window._lgRestoreCounter > baseline.restoreCounter;
        return deleted && restoredViaButton;
    },
    validateLoadLocal() {
        if (window._lgRunningDemo) return false;
        const initial = LG.initialCounts[LG.step] || 0;
        return window._lgLocalLoadCounter > initial;
    },
    validateLoadPlanet() {
        if (window._lgRunningDemo) return false;
        const initial = LG.initialCounts[LG.step] || 0;
        return window._lgPlanetOpenCounter > initial;
    }
};
