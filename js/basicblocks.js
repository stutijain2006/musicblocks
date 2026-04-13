// Copyright (c) 2014-21 Walter Bender
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the The GNU Affero General Public
// License as published by the Free Software Foundation; either
// version 3 of the License, or (at your option) any later version.
//
// You should have received a copy of the GNU Affero General Public
// License along with this library; if not, write to the Free Software
// Foundation, 51 Franklin Street, Suite 500 Boston, MA 02110-1335 USA

// Definition of basic blocks common to all branches

// Some names changed between the Python version and the
// JS version so look up name in the conversion dictionary.

/*
   global

   setupRhythmBlockPaletteBlocks, setupRhythmBlocks, setupMeterBlocks,
   setupPitchBlocks, setupIntervalsBlocks, setupToneBlocks,
   setupOrnamentBlocks, setupVolumeBlocks, setupDrumBlocks,
   setupWidgetBlocks, setupFlowBlocks, setupNumberBlocks,
   setupActionBlocks, setupBoxesBlocks, setupBooleanBlocks,
   setupHeapBlocks, setupDictBlocks, setupExtrasBlocks,
   setupProgramBlocks, setupGraphicsBlocks setupPenBlocks,
   setupMediaBlocks, setupSensorsBlocks, setupEnsembleBlocks
 */

/*
   exported

   initBasicProtoBlocks, initAdvancedProtoBlocksAsync, BACKWARDCOMPATIBILITYDICT
 */

/**
 * Dictionary mapping old block names to their corresponding new block names for backward compatibility.
 * @constant {Object<string, string>}
 */
const BACKWARDCOMPATIBILITYDICT = {
    fullscreen: "vspace",
    fillscreen2: "fillscreen",
    sandwichclampcollapsed: "clamp",
    ifelse: "ifthenelse",
    xcor: "x",
    ycor: "y",
    seth: "setheading",
    remainder2: "mod",
    plus2: "plus",
    product2: "multiply",
    division2: "divide",
    minus2: "minus",
    stack: "do",
    hat: "action",
    stopstack: "break",
    clean: "clear",
    setxy2: "setxy",
    greater2: "greater",
    less2: "less",
    equal2: "equal",
    random2: "random",
    setvalue: "setshade",
    setchroma: "setgrey",
    setgray: "setgrey",
    gray: "grey",
    chroma: "grey",
    value: "shade",
    hue: "color",
    startfill: "beginfill",
    stopfill: "endfill",
    string: "text",
    shell: "turtleshell"
};

// Define blocks here. Note: The blocks are placed on the palettes
// from bottom to top, i.e., the block at the top of a palette will be
// the last block added to a palette.
/**
 * @public
 * @param  {Object} palettes
 * @param  {Object} blocks
 * @returns {void}
 */
const initCoreProtoBlocks = activity => {
    activity.blocks.palettes = activity.palettes;
    setupFlowBlocks(activity);
    setupNumberBlocks(activity);
    setupActionBlocks(activity);
    setupBoxesBlocks(activity);
    setupBooleanBlocks(activity);

    // Push protoblocks onto their palettes.
    for (const protoblock in activity.blocks.protoBlockDict) {
        if (activity.blocks.protoBlockDict[protoblock].palette != null) {
            activity.blocks.protoBlockDict[protoblock].palette.add(
                activity.blocks.protoBlockDict[protoblock]
            );
        }
    }
};

/**
 * Setup functions for advanced protos (resolved at call time so all block modules are loaded).
 * @returns {Array<function(Object): void>}
 */
const getAdvancedProtoSetupFns = () => [
    setupRhythmBlockPaletteBlocks,
    setupRhythmBlocks,
    setupMeterBlocks,
    setupPitchBlocks,
    setupIntervalsBlocks,
    setupToneBlocks,
    setupOrnamentBlocks,
    setupVolumeBlocks,
    setupDrumBlocks,
    setupWidgetBlocks,
    setupHeapBlocks,
    setupDictBlocks,
    setupExtrasBlocks,
    setupProgramBlocks,
    setupGraphicsBlocks,
    setupPenBlocks,
    setupMediaBlocks,
    setupSensorsBlocks,
    setupEnsembleBlocks
];

const pushAdvancedProtosToPalettes = activity => {
    for (const protoblock in activity.blocks.protoBlockDict) {
        if (activity.blocks.protoBlockDict[protoblock].palette != null) {
            activity.blocks.protoBlockDict[protoblock].palette.add(
                activity.blocks.protoBlockDict[protoblock]
            );
        }
    }
};

/**
 * Initialize advanced / heavy blocks (deferred).
 */
const initAdvancedProtoBlocks = activity => {
    if (activity._advancedProtoBlocksInitialized) {
        return;
    }

    for (const fn of getAdvancedProtoSetupFns()) {
        fn(activity);
    }

    pushAdvancedProtosToPalettes(activity);
    activity._advancedProtoBlocksInitialized = true;
};

/**
 * Same end state as initAdvancedProtoBlocks, but spreads work across idle slices
 * to reduce long main-thread tasks (Lighthouse TBT variance).
 * @param {Object} activity
 * @param {function(): void} [onComplete]
 */
const initAdvancedProtoBlocksAsync = (activity, onComplete) => {
    if (activity._advancedProtoBlocksInitialized) {
        if (typeof onComplete === "function") {
            setTimeout(onComplete, 0);
        }
        return;
    }

    const fns = getAdvancedProtoSetupFns();
    let i = 0;
    const BATCH = 2;

    const scheduleYield = next => {
        if (typeof requestIdleCallback !== "undefined") {
            requestIdleCallback(next, { timeout: 48 });
        } else {
            setTimeout(next, 0);
        }
    };

    const finish = () => {
        pushAdvancedProtosToPalettes(activity);
        activity._advancedProtoBlocksInitialized = true;
        if (typeof onComplete === "function") {
            onComplete();
        }
    };

    const step = () => {
        const end = Math.min(i + BATCH, fns.length);
        for (; i < end; i++) {
            fns[i](activity);
        }
        if (i < fns.length) {
            scheduleYield(step);
        } else {
            finish();
        }
    };

    step();
};

if (typeof globalThis !== "undefined") {
    globalThis.initAdvancedProtoBlocksAsync = initAdvancedProtoBlocksAsync;
}

const initBasicProtoBlocks = activity => {
    initCoreProtoBlocks(activity);
    initAdvancedProtoBlocks(activity);
};

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        initBasicProtoBlocks,
        initCoreProtoBlocks,
        initAdvancedProtoBlocks,
        initAdvancedProtoBlocksAsync,
        BACKWARDCOMPATIBILITYDICT
    };
}
