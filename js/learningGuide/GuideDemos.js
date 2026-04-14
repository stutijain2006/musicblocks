window._lgDemoBlocks = [];
window._lgRunningDemo = false;
window.GuideDemos = {
    getActivity() {
        return getRealActivity();
    },

    addDemoBlock(name, x = 300, y = 200) {
        const activity = this.getActivity();
        if (!activity) return null;

        const id = activity.blocks.makeNewBlock(name, x, y);
        if (id !== null && id !== undefined) {
            window._lgDemoBlocks.push(id);
        }
        return id;
    },

    clearDemoBlocks() {
        const activity = this.getActivity();
        if (!activity) return;

        const blocks = activity.blocks;

        window._lgDemoBlocks.forEach(id => {
            const block = blocks.blockList[id];

            if (!block) return;

            block.trash = true;

            if (block.container) {
                block.container.visible = false;
            }

            /* remove all connections */
            if (block.connections) {
                block.connections = block.connections.map(() => null);
            }
        });

        window._lgDemoBlocks = [];

        activity.refreshCanvas();
    },
    resetCurrentStepAfterDemo() {
        if (!window.LG || !window.GuideSteps) return;
        const currentStep = GuideSteps[LG.step];
        if (!currentStep) return;

        // Reset baseline so demo actions never auto-complete the step.
        LG.prepareStep(currentStep);
        if (window.GuideUI && GuideUI.createPanel) {
            GuideUI.createPanel(currentStep);
        }
        document.body.classList.remove("lg-step-done");
        const nextBtn = document.getElementById("lg-next");
        const status = document.getElementById("lg-status");
        if (nextBtn) {
            nextBtn.disabled = true;
            nextBtn.classList.remove("lg-ready");
            nextBtn.style.pointerEvents = "none";
        }
        if (status) {
            status.innerHTML = `
                <span class="lg-status-icon">⏳</span>
                <span>Waiting for you to complete this step…</span>
            `;
        }
    },
    highlightPaletteBlock(blockName) {
        const paletteBody = document.getElementById("PaletteBody");
        if (!paletteBody) return null;

        const blocks = paletteBody.querySelectorAll("canvas, div");

        for (const el of blocks) {
            if (el.innerText && el.innerText.toLowerCase().includes(blockName)) {
                el.classList.add("lg-palette-highlight");

                return el;
            }
        }

        return null;
    },

    openRhythmPalette() {
        const activity = getRealActivity();
        if (!activity) return;

        window._lgRunningDemo = true;
        activity.palettes.showPalette("rhythm");

        setTimeout(() => {
            const palette = activity.palettes.dict["rhythm"];
            if (palette && palette.hideMenu) {
                palette.hideMenu();
            }
            window._lgRunningDemo = false;
            GuideDemos.resetCurrentStepAfterDemo();
        }, 1000);
    },

    openPitchPalette() {
        const activity = getRealActivity();
        if (!activity) return;

        window._lgRunningDemo = true;
        activity.palettes.showPalette("pitch");

        setTimeout(() => {
            const palette = activity.palettes.dict["pitch"];
            if (palette && palette.hideMenu) {
                palette.hideMenu();
            }
            window._lgRunningDemo = false;
            GuideDemos.resetCurrentStepAfterDemo();
        }, 1000);
    },

    showFlowPalette() {
        const activity = getRealActivity();
        if (!activity) return;

        window._lgRunningDemo = true;

        const blocks = activity.blocks;
        const blockList = blocks.blockList;

        activity.palettes.showPalette("flow");

        setTimeout(() => {
            const before = new Set(Object.keys(blockList).map(id => String(id)));

            /* create repeat block */
            blocks.loadNewBlocks([[0, "repeat", 250, 180, [null, null, null]]]);

            let repeatId = null;

            for (const id in blockList) {
                if (!before.has(String(id)) && blockList[id].name === "repeat") {
                    repeatId = id;
                    window._lgDemoBlocks.push(id);
                }
            }

            if (repeatId === null || repeatId === undefined) {
                window._lgRunningDemo = false;
                return;
            }

            const repeat = blockList[repeatId];
            let startId = null;
            for (const id in blockList) {
                const b = blockList[id];
                if (b && b.name === "start" && !b.trash) {
                    startId = id;
                    break;
                }
            }
            if (startId === null || startId === undefined) {
                window._lgRunningDemo = false;
                return;
            }
            const startBlock = blockList[startId];
            const originalStartChildId = startBlock?.connections ? startBlock.connections[1] : null;
            if (originalStartChildId === null || originalStartChildId === undefined) {
                window._lgRunningDemo = false;
                return;
            }

            for (const id in blockList) {
                const b = blockList[id];
                if (b && b.name === "newnote" && !b.trash && b.connections) {
                    // find top of the same start stack so we move the whole original chain
                    if (id === String(originalStartChildId)) break;
                }
            }

            /* animate repeat block entering */

            const startX = repeat.container.x;
            const startY = repeat.container.y;
            const startDock = startBlock?.docks?.[1];
            const targetX = startDock
                ? startBlock.container.x + startDock[0]
                : startBlock.container.x + 140;
            const targetY = startDock
                ? startBlock.container.y + startDock[1] - 30
                : startBlock.container.y + 40;

            const duration = 700;
            const startTime = performance.now();

            function dragRepeat(time) {
                const t = Math.min((time - startTime) / duration, 1);
                const ease = 1 - Math.pow(1 - t, 3);

                repeat.container.x = startX + (targetX - startX) * ease;
                repeat.container.y = startY + (targetY - startY) * ease;

                activity.refreshCanvas();

                if (t < 1) {
                    requestAnimationFrame(dragRepeat);
                } else {
                    connectStackToRepeat();
                }
            }

            requestAnimationFrame(dragRepeat);

            const animateStackToDock = (
                stackTopId,
                parentId,
                dockIndex,
                done,
                moveDuration = 650
            ) => {
                const stackTop = blockList[stackTopId];
                const parent = blockList[parentId];
                if (
                    !stackTop ||
                    !stackTop.container ||
                    !parent ||
                    !parent.container ||
                    !parent.docks ||
                    !parent.docks[dockIndex]
                ) {
                    done();
                    return;
                }

                blocks.findDragGroup(stackTopId);
                const dock = parent.docks[dockIndex];

                const tx = parent.container.x + dock[0];
                const ty = parent.container.y + dock[1];

                const sx = stackTop.container.x;
                const sy = stackTop.container.y;
                const moveStart = performance.now();

                function animate(time) {
                    const t = Math.min((time - moveStart) / moveDuration, 1);
                    const ease = 1 - Math.pow(1 - t, 3);
                    const nx = sx + (tx - sx) * ease;
                    const ny = sy + (ty - sy) * ease;
                    const dx = nx - stackTop.container.x;
                    const dy = ny - stackTop.container.y;

                    for (const blk of blocks.dragGroup) {
                        blocks.moveBlockRelative(blk, dx, dy);
                    }

                    activity.refreshCanvas();
                    if (t < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        blocks.blockMoved(stackTopId);
                        activity.refreshCanvas();
                        done();
                    }
                }
                requestAnimationFrame(animate);
            };

            /* move original start stack inside repeat clamp */
            function connectStackToRepeat() {
                animateStackToDock(originalStartChildId, repeatId, 1, () => {
                    setTimeout(restoreOriginalArrangement, 1200);
                });
            }

            function restoreOriginalArrangement() {
                // move original stack back to start
                animateStackToDock(originalStartChildId, startId, 1, () => {
                    // force reconnect in case snap misses
                    const startNow = blockList[startId];
                    const orig = blockList[originalStartChildId];
                    if (startNow && orig && startNow.connections) {
                        startNow.connections[1] = originalStartChildId;
                        if (orig.connections) orig.connections[0] = startId;
                        blocks.blockMoved(originalStartChildId);
                        activity.refreshCanvas();
                    }
                    finishDemo();
                });
            }

            function finishDemo() {
                GuideDemos.clearDemoBlocks();

                const palette = activity.palettes.dict["flow"];
                if (palette?.hideMenu) palette.hideMenu();

                window._lgRunningDemo = false;
                GuideDemos.resetCurrentStepAfterDemo();
            }
        }, 500);
    },

    showGraphicsPalette() {
        const activity = getRealActivity();
        if (!activity) return;

        window._lgRunningDemo = true;
        const blocks = activity.blocks;
        const blockList = blocks.blockList;
        activity.palettes.showPalette("graphics");

        setTimeout(() => {
            const before = new Set(Object.keys(blockList).map(id => String(id)));
            blocks.loadNewBlocks([[0, "forward", 220, 160, [null, null, null]]]);

            const waitForForward = (attemptsLeft, done) => {
                let forwardId = null;
                for (const id in blockList) {
                    if (
                        !before.has(String(id)) &&
                        blockList[id] &&
                        blockList[id].name === "forward"
                    ) {
                        forwardId = id;
                        break;
                    }
                }
                if (forwardId !== null && forwardId !== undefined) {
                    done(forwardId);
                    return;
                }
                if (attemptsLeft <= 0) {
                    done(null);
                    return;
                }
                setTimeout(() => waitForForward(attemptsLeft - 1, done), 80);
            };

            waitForForward(20, forwardId => {
                if (forwardId === null || forwardId === undefined) {
                    const palette = activity.palettes.dict["graphics"];
                    if (palette?.hideMenu) palette.hideMenu();
                    window._lgRunningDemo = false;
                    GuideDemos.resetCurrentStepAfterDemo();
                    return;
                }

                if (!window._lgDemoBlocks.includes(forwardId)) {
                    window._lgDemoBlocks.push(forwardId);
                }

                let noteId = null;
                let startId = null;
                for (const id in blockList) {
                    const block = blockList[id];
                    if (block && block.name === "start" && !block.trash) {
                        startId = id;
                        break;
                    }
                }

                if (startId !== null && startId !== undefined) {
                    let currentId = blockList[startId]?.connections?.[1] ?? null;
                    let guard = 0;
                    while (currentId !== null && currentId !== undefined && guard < 80) {
                        const current = blockList[currentId];
                        if (!current || current.trash) break;
                        if (current.name === "newnote") {
                            noteId = currentId;
                            break;
                        }
                        currentId = current.connections?.[1] ?? null;
                        guard++;
                    }
                }

                // Fallback to any visible note if start-chain note wasn't found.
                if (noteId === null || noteId === undefined) {
                    for (const id in blockList) {
                        const block = blockList[id];
                        if (block && block.name === "newnote" && !block.trash) {
                            noteId = id;
                            break;
                        }
                    }
                }

                const forward = blockList[forwardId];
                const note = noteId !== null ? blockList[noteId] : null;

                if (!forward || !forward.container || !note || !note.container) {
                    GuideDemos.clearDemoBlocks();
                    const palette = activity.palettes.dict["graphics"];
                    if (palette?.hideMenu) palette.hideMenu();
                    window._lgRunningDemo = false;
                    GuideDemos.resetCurrentStepAfterDemo();
                    return;
                }

                forward.container.scaleX = 1.15;
                forward.container.scaleY = 1.15;
                activity.refreshCanvas();

                const startX = forward.container.x;
                const startY = forward.container.y;
                // Place near the first note's start area (top-left vicinity),
                // instead of lower down the note lane.
                const targetX = note.container.x - 110;
                const targetY = note.container.y + 10;
                const duration = 700;
                const startTime = performance.now();

                function animateForward(time) {
                    const t = Math.min((time - startTime) / duration, 1);
                    const ease = 1 - Math.pow(1 - t, 3);
                    forward.container.x = startX + (targetX - startX) * ease;
                    forward.container.y = startY + (targetY - startY) * ease;
                    activity.refreshCanvas();
                    if (t < 1) {
                        requestAnimationFrame(animateForward);
                    } else {
                        setTimeout(() => {
                            GuideDemos.clearDemoBlocks();
                            const palette = activity.palettes.dict["graphics"];
                            if (palette?.hideMenu) palette.hideMenu();
                            window._lgRunningDemo = false;
                            GuideDemos.resetCurrentStepAfterDemo();
                        }, 900);
                    }
                }

                requestAnimationFrame(animateForward);
            });
        }, 500);
    },

    showTonePalette() {
        const activity = getRealActivity();
        if (!activity) return;

        window._lgRunningDemo = true;

        const blocks = activity.blocks;
        const blockList = blocks.blockList;

        activity.palettes.showPalette("tone");

        setTimeout(() => {
            const before = new Set(Object.keys(blockList).map(id => String(id)));

            /* create Set Instrument block */
            blocks.loadNewBlocks([
                [0, "settimbre", 250, 200, [null, 1, null, 2]],
                [1, ["voicename", { value: "electronic synth" }], 0, 0, [0]],
                [2, "hidden", 0, 0, [0, null]]
            ]);

            const waitForSetInstrument = (attemptsLeft, done) => {
                let instId = null;
                for (const id in blockList) {
                    if (
                        !before.has(String(id)) &&
                        blockList[id] &&
                        blockList[id].name === "settimbre"
                    ) {
                        instId = id;
                        break;
                    }
                }

                if (instId !== null && instId !== undefined) {
                    if (!window._lgDemoBlocks.includes(instId)) {
                        window._lgDemoBlocks.push(instId);
                    }
                    done(instId);
                    return;
                }

                if (attemptsLeft <= 0) {
                    done(null);
                    return;
                }

                setTimeout(() => waitForSetInstrument(attemptsLeft - 1, done), 80);
            };

            waitForSetInstrument(25, instId => {
                if (instId === null || instId === undefined) {
                    window._lgRunningDemo = false;
                    return;
                }

                const instBlock = blockList[instId];
                if (
                    instBlock?.connections?.[1] !== null &&
                    instBlock?.connections?.[1] !== undefined
                ) {
                    const voiceId = instBlock.connections[1];
                    if (!window._lgDemoBlocks.includes(voiceId)) {
                        window._lgDemoBlocks.push(voiceId);
                    }
                }
                if (
                    instBlock?.connections?.[2] !== null &&
                    instBlock?.connections?.[2] !== undefined
                ) {
                    const hiddenId = instBlock.connections[2];
                    if (!window._lgDemoBlocks.includes(hiddenId)) {
                        window._lgDemoBlocks.push(hiddenId);
                    }
                }

                let startId = null;
                for (const id in blockList) {
                    const block = blockList[id];
                    if (block && block.name === "start" && !block.trash) {
                        startId = id;
                        break;
                    }
                }

                if (startId === null || startId === undefined) {
                    window._lgRunningDemo = false;
                    return;
                }

                const startBlock = blockList[startId];
                const originalStartChildId = startBlock?.connections
                    ? startBlock.connections[1]
                    : null;

                /* find an existing note block for animation fallback */
                let noteId = originalStartChildId;
                for (const id in blockList) {
                    const b = blockList[id];
                    if (b && b.name === "newnote" && !b.trash) {
                        noteId = id;
                        if (originalStartChildId !== null && originalStartChildId !== undefined) {
                            break;
                        }
                    }
                }

                if (noteId === null || noteId === undefined) {
                    window._lgRunningDemo = false;
                    return;
                }

                const note = blockList[noteId];

                const animateStackToDock = (
                    stackTopId,
                    parentId,
                    dockIndex,
                    done,
                    duration = 600
                ) => {
                    const stackTop = blockList[stackTopId];
                    const parent = blockList[parentId];
                    if (
                        !stackTop ||
                        !stackTop.container ||
                        !parent ||
                        !parent.container ||
                        !parent.docks ||
                        !parent.docks[dockIndex]
                    ) {
                        done();
                        return;
                    }

                    blocks.findDragGroup(stackTopId);

                    const dock = parent.docks[dockIndex];
                    const targetX = parent.container.x + dock[0];
                    const targetY = parent.container.y + dock[1];
                    const startX = stackTop.container.x;
                    const startY = stackTop.container.y;
                    const startTime = performance.now();

                    function animate(time) {
                        const t = Math.min((time - startTime) / duration, 1);
                        const ease = 1 - Math.pow(1 - t, 3);
                        const nx = startX + (targetX - startX) * ease;
                        const ny = startY + (targetY - startY) * ease;
                        const dx = nx - stackTop.container.x;
                        const dy = ny - stackTop.container.y;

                        for (const blk of blocks.dragGroup) {
                            blocks.moveBlockRelative(blk, dx, dy);
                        }

                        activity.refreshCanvas();

                        if (t < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            blocks.blockMoved(stackTopId);
                            activity.refreshCanvas();
                            done();
                        }
                    }

                    requestAnimationFrame(animate);
                };

                const waitForContainers = (attemptsLeft, done) => {
                    const ready =
                        instBlock &&
                        instBlock.container &&
                        startBlock &&
                        startBlock.container &&
                        note &&
                        note.container;

                    if (ready || attemptsLeft <= 0) {
                        done();
                        return;
                    }

                    setTimeout(() => waitForContainers(attemptsLeft - 1, done), 80);
                };

                waitForContainers(25, () => {
                    animateStackToDock(
                        instId,
                        startId,
                        1,
                        () => {
                            const hasStartChild =
                                originalStartChildId !== null &&
                                originalStartChildId !== undefined &&
                                blockList[originalStartChildId] &&
                                !blockList[originalStartChildId].trash;

                            const attachNotesToInstrument = done => {
                                if (!hasStartChild) {
                                    done();
                                    return;
                                }
                                // For settimbre, dock index 2 is the clamp input for note stack.
                                animateStackToDock(originalStartChildId, instId, 2, done, 650);
                            };

                            const changeInstrument = done => {
                                // In settimbre, connection[1] is the voicename value block.
                                const instrumentId = instBlock.connections[1];
                                if (instrumentId === null || instrumentId === undefined) {
                                    done();
                                    return;
                                }

                                const instValue = blockList[instrumentId];
                                if (!instValue || !instValue.container) {
                                    done();
                                    return;
                                }

                                instValue.container.scaleX = 1.25;
                                instValue.container.scaleY = 1.25;
                                activity.refreshCanvas();

                                setTimeout(() => {
                                    instValue.value = "violin";
                                    instValue.text.text = "violin";
                                    const z = instValue.container.children.length - 1;
                                    instValue.container.setChildIndex(instValue.text, z);
                                    instValue.container.updateCache();
                                    instValue.container.scaleX = 1;
                                    instValue.container.scaleY = 1;
                                    activity.refreshCanvas();
                                    done();
                                }, 700);
                            };

                            const restoreOriginalArrangement = () => {
                                const finish = () => {
                                    GuideDemos.clearDemoBlocks();

                                    const palette = activity.palettes.dict["tone"];
                                    if (palette?.hideMenu) palette.hideMenu();

                                    window._lgRunningDemo = false;
                                    GuideDemos.resetCurrentStepAfterDemo();
                                };

                                if (!hasStartChild) {
                                    setTimeout(finish, 600);
                                    return;
                                }

                                setTimeout(() => {
                                    animateStackToDock(
                                        originalStartChildId,
                                        startId,
                                        1,
                                        () => {
                                            setTimeout(() => {
                                                // Safety: ensure the note stack is truly reattached to start.
                                                const startNow = blockList[startId];
                                                if (
                                                    startNow &&
                                                    startNow.connections &&
                                                    startNow.connections[1] !== originalStartChildId
                                                ) {
                                                    animateStackToDock(
                                                        originalStartChildId,
                                                        startId,
                                                        1,
                                                        finish,
                                                        350
                                                    );
                                                    return;
                                                }
                                                const originalChild =
                                                    blockList[originalStartChildId];
                                                if (startNow && originalChild) {
                                                    startNow.connections[1] = originalStartChildId;
                                                    originalChild.connections[0] = startId;
                                                    blocks.blockMoved(originalStartChildId);
                                                    activity.refreshCanvas();
                                                }
                                                finish();
                                            }, 500);
                                        },
                                        650
                                    );
                                }, 500);
                            };

                            attachNotesToInstrument(() => {
                                setTimeout(() => {
                                    changeInstrument(() => {
                                        restoreOriginalArrangement();
                                    });
                                }, 300);
                            });
                        },
                        700
                    );
                });
            });
        }, 500);
    },

    showNoteBlock() {
        const activity = getRealActivity();
        if (!activity) return;
        window._lgRunningDemo = true;
        activity.palettes.showPalette("rhythm");

        setTimeout(() => {
            const before = Object.keys(activity.blocks.blockList);
            activity.blocks.loadNewBlocks([[0, "newnote", 420, 220, [null, null]]]);
            const blockList = activity.blocks.blockList;
            for (const id in blockList) {
                if (!before.includes(id)) {
                    const block = blockList[id];
                    if (block.name === "newnote") {
                        window._lgDemoBlocks.push(id);
                        if (block.container) {
                            block.container.x = 420;
                            block.container.y = 220;
                            block.container.scaleX = 1.15;
                            block.container.scaleY = 1.15;
                        }
                    }
                }
            }

            activity.refreshCanvas();

            setTimeout(() => {
                this.clearDemoBlocks();
                const palette = activity.palettes.dict["rhythm"];
                if (palette && palette.hideMenu) {
                    palette.hideMenu();
                }
                window._lgRunningDemo = false;
            }, 1500);
        }, 500);
    },

    showPitchBlock() {
        const activity = getRealActivity();
        if (!activity) return;
        window._lgRunningDemo = true;
        const blocks = activity.blocks;
        const blockList = blocks.blockList;
        /* find note block */
        let noteId = null;
        for (const id in blockList) {
            const b = blockList[id];
            if (b.name === "newnote" && !b.trash) {
                noteId = id;
            }
        }
        if (!noteId) {
            window._lgRunningDemo = false;
            return;
        }
        const note = blockList[noteId];

        /* highlight palette */
        const paletteBtn =
            document.getElementById("pitchtabbutton") || document.querySelector('[id*="pitch"]');

        if (paletteBtn) paletteBtn.classList.add("lg-pulse");

        activity.palettes.showPalette("pitch");

        /* highlight pitch block inside palette */

        let palettePitchHighlight = null;

        setTimeout(() => {
            palettePitchHighlight = GuideDemos.highlightPaletteBlock("pitch");
        }, 300);

        setTimeout(() => {
            const before = Object.keys(blockList);
            /* create pitch block */
            blocks.loadNewBlocks([[0, "pitch", 140, 180, [null, null, null]]]);
            let pitchId = null;
            for (const id in blockList) {
                if (!before.includes(id) && blockList[id].name === "pitch") {
                    pitchId = id;
                    window._lgDemoBlocks.push(id);
                }
            }
            if (!pitchId) {
                window._lgRunningDemo = false;
                return;
            }

            /* wait until container exists */

            const waitForContainer = () => {
                const pitch = blockList[pitchId];
                if (!pitch || !pitch.container) {
                    setTimeout(waitForContainer, 50);
                    return;
                }
                startAnimation(pitch);
            };

            const startAnimation = pitch => {
                const dock = note.docks[2];
                const targetX = note.container.x + dock[0];
                const targetY = note.container.y + dock[1];
                const startX = pitch.container.x;
                const startY = pitch.container.y;
                const duration = 800;
                const startTime = performance.now();

                function animate(time) {
                    const t = Math.min((time - startTime) / duration, 1);
                    const ease = 1 - Math.pow(1 - t, 3);
                    const nx = startX + (targetX - startX) * ease;
                    const ny = startY + (targetY - startY) * ease;
                    pitch.container.x = nx;
                    pitch.container.y = ny;
                    activity.refreshCanvas();
                    if (t < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        activity.refreshCanvas();

                        setTimeout(() => {
                            if (paletteBtn) paletteBtn.classList.remove("lg-pulse");
                            if (palettePitchHighlight)
                                palettePitchHighlight.classList.remove("lg-palette-highlight");
                            const palette = activity.palettes.dict["pitch"];
                            if (palette?.hideMenu) palette.hideMenu();
                            window._lgRunningDemo = false;
                            GuideDemos.clearDemoBlocks();
                        }, 1600);
                    }
                }
                requestAnimationFrame(animate);
            };
            waitForContainer();
        }, 500);
    },

    showOctaveChange() {
        const activity = getRealActivity();
        if (!activity) return;
        window._lgRunningDemo = true;
        const blocks = activity.blocks;
        const blockList = blocks.blockList;
        let pitchId = null;
        // find pitch inside note
        for (const id in blockList) {
            const b = blockList[id];
            if (b.name === "pitch" && !b.trash) {
                pitchId = id;
            }
        }
        if (!pitchId) {
            window._lgRunningDemo = false;
            return;
        }
        const octaveId = blockList[pitchId].connections[2];
        if (!octaveId) {
            window._lgRunningDemo = false;
            return;
        }
        const octaveBlock = blockList[octaveId];
        const oldValue = octaveBlock.value;
        octaveBlock.container.scaleX = 1.2;
        octaveBlock.container.scaleY = 1.2;
        activity.refreshCanvas();

        setTimeout(() => {
            const newValue = oldValue + 1;
            octaveBlock.value = newValue;
            octaveBlock.text.text = newValue.toString();
            const z = octaveBlock.container.children.length - 1;
            octaveBlock.container.setChildIndex(octaveBlock.text, z);
            octaveBlock.container.updateCache();
            activity.refreshCanvas();
        }, 500);

        setTimeout(() => {
            octaveBlock.value = oldValue;
            octaveBlock.text.text = oldValue.toString();
            const z = octaveBlock.container.children.length - 1;
            octaveBlock.container.setChildIndex(octaveBlock.text, z);
            octaveBlock.container.updateCache();
            octaveBlock.container.scaleX = 1;
            octaveBlock.container.scaleY = 1;
            activity.refreshCanvas();
            window._lgRunningDemo = false;
        }, 2000);
    },

    showConnection() {
        const activity = getRealActivity();
        if (!activity) return;

        window._lgRunningDemo = true;

        const blocks = activity.blocks;
        const blockList = blocks.blockList;

        let startId = null;
        let noteId = null;

        for (const id in blockList) {
            const block = blockList[id];
            if (block.name === "start") startId = id;
            if (block.name === "newnote" && !block.trash) noteId = id;
        }

        if (!startId || !noteId) {
            window._lgRunningDemo = false;
            return;
        }

        const start = blockList[startId];
        const note = blockList[noteId];

        const dock = start.docks[1];
        const targetX = start.container.x + dock[0];
        const targetY = start.container.y + dock[1];

        const startX = note.container.x;
        const startY = note.container.y;

        const duration = 800;
        const startTime = performance.now();

        blocks.findDragGroup(noteId);

        function animate(time) {
            const t = Math.min((time - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3);

            const nx = startX + (targetX - startX) * ease;
            const ny = startY + (targetY - startY) * ease;

            const dx = nx - note.container.x;
            const dy = ny - note.container.y;

            for (const blk of blocks.dragGroup) {
                blocks.moveBlockRelative(blk, dx, dy);
            }

            activity.refreshCanvas();

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => {
                    const dx = startX - note.container.x;
                    const dy = startY - note.container.y;

                    for (const blk of blocks.dragGroup) {
                        blocks.moveBlockRelative(blk, dx, dy);
                    }

                    activity.refreshCanvas();
                    window._lgRunningDemo = false;
                }, 1200);
            }
        }
        requestAnimationFrame(animate);
    },

    showPlayButton() {
        const playBtn = document.querySelector("#play, .play-button");
        if (playBtn) this.highlight(playBtn);
        setTimeout(() => {
            window._lgRunningDemo = false;
        }, 250);
    },

    showMelodyExample() {
        const activity = getRealActivity();
        if (!activity) return;

        window._lgRunningDemo = true;

        activity.palettes.showPalette("rhythm");

        setTimeout(() => {
            const blocks = activity.blocks;
            const blockList = blocks.blockList;

            const before = new Set(Object.keys(blockList).map(id => String(id)));
            // Create full notes (not blank shells) so users see real blocks.
            blocks.loadNewBlocks([
                [0, "newnote", 420, 220, [null, 1, 4, 7]],
                [1, "divide", 0, 0, [0, 2, 3]],
                [2, ["number", { value: 1 }], 0, 0, [1]],
                [3, ["number", { value: 4 }], 0, 0, [1]],
                [4, "vspace", 0, 0, [0, 5]],
                [5, "pitch", 0, 0, [4, 6, 8, null]],
                [6, ["solfege", { value: "sol" }], 0, 0, [5]],
                [7, "hidden", 0, 0, [0, null]],
                [8, ["number", { value: 4 }], 0, 0, [5]]
            ]);
            blocks.loadNewBlocks([
                [0, "newnote", 420, 300, [null, 1, 4, 7]],
                [1, "divide", 0, 0, [0, 2, 3]],
                [2, ["number", { value: 1 }], 0, 0, [1]],
                [3, ["number", { value: 4 }], 0, 0, [1]],
                [4, "vspace", 0, 0, [0, 5]],
                [5, "pitch", 0, 0, [4, 6, 8, null]],
                [6, ["solfege", { value: "sol" }], 0, 0, [5]],
                [7, "hidden", 0, 0, [0, null]],
                [8, ["number", { value: 4 }], 0, 0, [5]]
            ]);
            blocks.loadNewBlocks([
                [0, "newnote", 420, 380, [null, 1, 4, 7]],
                [1, "divide", 0, 0, [0, 2, 3]],
                [2, ["number", { value: 1 }], 0, 0, [1]],
                [3, ["number", { value: 4 }], 0, 0, [1]],
                [4, "vspace", 0, 0, [0, 5]],
                [5, "pitch", 0, 0, [4, 6, 8, null]],
                [6, ["solfege", { value: "sol" }], 0, 0, [5]],
                [7, "hidden", 0, 0, [0, null]],
                [8, ["number", { value: 4 }], 0, 0, [5]]
            ]);

            const collectNewNoteIds = () => {
                const ids = [];
                for (const id in blockList) {
                    if (before.has(String(id))) continue;
                    const block = blockList[id];
                    if (block && block.name === "newnote" && !block.trash) {
                        ids.push(id);
                    }
                }
                return ids;
            };
            const collectAllNewIds = () => {
                const ids = [];
                for (const id in blockList) {
                    if (!before.has(String(id)) && blockList[id] && !blockList[id].trash) {
                        ids.push(id);
                    }
                }
                return ids;
            };

            const waitForNewNoteContainers = (attemptsLeft, done) => {
                const newNoteIds = collectNewNoteIds();
                const ready =
                    newNoteIds.length >= 3 &&
                    newNoteIds.every(id => {
                        const note = blockList[id];
                        return note && note.container;
                    });
                if (ready || attemptsLeft <= 0) {
                    done(newNoteIds);
                    return;
                }
                setTimeout(() => waitForNewNoteContainers(attemptsLeft - 1, done), 80);
            };

            waitForNewNoteContainers(25, newNoteIds => {
                for (const id of collectAllNewIds()) {
                    if (!window._lgDemoBlocks.includes(id)) {
                        window._lgDemoBlocks.push(id);
                    }
                }
                for (const noteId of newNoteIds) {
                    const note = blockList[noteId];
                    if (note?.container) {
                        note.container.scaleX = 1.15;
                        note.container.scaleY = 1.15;
                    }
                }
                activity.refreshCanvas();

                let startId = null;
                for (const id in blockList) {
                    if (blockList[id] && blockList[id].name === "start" && !blockList[id].trash) {
                        startId = id;
                        break;
                    }
                }

                if (startId === null || startId === undefined || newNoteIds.length < 3) {
                    window._lgRunningDemo = false;
                    return;
                }

                const getTailId = () => {
                    let currentId = startId;
                    let guard = 0;
                    while (guard < 50) {
                        const current = blockList[currentId];
                        if (
                            !current ||
                            !current.connections ||
                            current.connections[1] === null ||
                            current.connections[1] === undefined
                        ) {
                            return currentId;
                        }
                        currentId = current.connections[1];
                        guard++;
                    }
                    return currentId;
                };

                const animateToDock = (noteId, targetParentId, done) => {
                    const note = blockList[noteId];
                    const parent = blockList[targetParentId];
                    if (!note || !note.container || !parent || !parent.container || !parent.docks) {
                        done();
                        return;
                    }

                    blocks.findDragGroup(noteId);

                    // For note stacks, next-chain dock is always index 1.
                    const dock = parent.docks[1];
                    if (!dock) {
                        done();
                        return;
                    }
                    const targetX = parent.container.x + dock[0];
                    const targetY = parent.container.y + dock[1];
                    const startX = note.container.x;
                    const startY = note.container.y;
                    const duration = 450;
                    const startTime = performance.now();

                    function animate(time) {
                        const t = Math.min((time - startTime) / duration, 1);
                        const ease = 1 - Math.pow(1 - t, 3);
                        const nx = startX + (targetX - startX) * ease;
                        const ny = startY + (targetY - startY) * ease;
                        const dx = nx - note.container.x;
                        const dy = ny - note.container.y;

                        for (const blk of blocks.dragGroup) {
                            blocks.moveBlockRelative(blk, dx, dy);
                        }

                        activity.refreshCanvas();

                        if (t < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            blocks.blockMoved(noteId);
                            activity.refreshCanvas();
                            done();
                        }
                    }

                    requestAnimationFrame(animate);
                };

                const connectSequentially = index => {
                    if (index >= newNoteIds.length) {
                        setTimeout(() => {
                            GuideDemos.clearDemoBlocks();

                            const palette = activity.palettes.dict["rhythm"];
                            if (palette && palette.hideMenu) {
                                palette.hideMenu();
                            }

                            window._lgRunningDemo = false;
                            GuideDemos.resetCurrentStepAfterDemo();
                        }, 1200);
                        return;
                    }

                    const tailId = getTailId();
                    animateToDock(newNoteIds[index], tailId, () => {
                        setTimeout(() => connectSequentially(index + 1), 220);
                    });
                };

                connectSequentially(0);
            });
        }, 500);
    },

    showSaveButton() {
        const saveBtn = document.querySelector("#saveButton, .save-button");
        if (saveBtn) this.highlight(saveBtn);
    },
    showDeleteRestoreDemo() {
        const activity = getRealActivity();
        if (!activity) return;
        window._lgRunningDemo = true;

        const blocks = activity.blocks;
        const blockList = blocks.blockList || {};
        let demoTargetId = null;
        let startId = null;

        for (const id in blockList) {
            const b = blockList[id];
            if (b && b.name === "start" && !b.trash) {
                startId = id;
                break;
            }
        }

        if (startId !== null && startId !== undefined) {
            let currentId = blockList[startId]?.connections?.[1] ?? null;
            let guard = 0;
            while (currentId !== null && currentId !== undefined && guard < 80) {
                const current = blockList[currentId];
                if (!current || current.trash) break;
                if (current.name === "newnote") {
                    demoTargetId = currentId;
                    break;
                }
                currentId = current.connections?.[1] ?? null;
                guard++;
            }
        }

        if (demoTargetId === null || demoTargetId === undefined) {
            for (const id in blockList) {
                const b = blockList[id];
                if (b && b.name === "newnote" && !b.trash) {
                    demoTargetId = id;
                    break;
                }
            }
        }

        const restoreBtn = document.querySelector("#restoreIcon");
        if (restoreBtn) restoreBtn.classList.add("lg-pulse");

        if (demoTargetId !== null && demoTargetId !== undefined) {
            const target = blockList[demoTargetId];
            let stackIds = [];
            if (target) {
                blocks.findDragGroup(demoTargetId);
                stackIds = Array.isArray(blocks.dragGroup) ? [...blocks.dragGroup] : [demoTargetId];
            }

            stackIds.forEach(id => {
                const b = blockList[id];
                if (b?.container) {
                    b.container.scaleX = 1.1;
                    b.container.scaleY = 1.1;
                }
            });
            activity.refreshCanvas();

            setTimeout(() => {
                // Keep demo non-destructive: only pulse scale to indicate "delete/restore" flow.
                stackIds.forEach(id => {
                    const b = blockList[id];
                    if (!b) return;
                    if (b.container) {
                        b.container.scaleX = 0.95;
                        b.container.scaleY = 0.95;
                    }
                });
                activity.refreshCanvas();
            }, 650);

            setTimeout(() => {
                stackIds.forEach(id => {
                    const b = blockList[id];
                    if (!b) return;
                    if (b.container) {
                        b.container.scaleX = 1;
                        b.container.scaleY = 1;
                    }
                });
                activity.refreshCanvas();
            }, 1300);
        }

        setTimeout(() => {
            if (restoreBtn) restoreBtn.classList.remove("lg-pulse");
            window._lgRunningDemo = false;
            GuideDemos.resetCurrentStepAfterDemo();
        }, 2200);
    },
    showLoadLocalDemo() {
        window._lgRunningDemo = true;
        const loadBtn = document.querySelector("#load");
        const fileInput = document.querySelector("#myOpenFile");

        if (loadBtn) loadBtn.classList.add("lg-pulse");
        setTimeout(() => {
            if (loadBtn) loadBtn.classList.remove("lg-pulse");
            if (fileInput) fileInput.classList.add("lg-pulse");
        }, 800);

        setTimeout(() => {
            if (fileInput) fileInput.classList.remove("lg-pulse");
            window._lgRunningDemo = false;
            GuideDemos.resetCurrentStepAfterDemo();
        }, 1800);
    },
    showPlanetDemo() {
        const activity = getRealActivity();
        window._lgRunningDemo = true;
        const planetBtn = document.querySelector("#planetIcon");
        if (planetBtn) planetBtn.classList.add("lg-pulse");

        if (planetBtn) {
            setTimeout(() => planetBtn.click(), 350);
        }

        setTimeout(() => {
            if (activity?.planet) {
                activity.planet.closePlanet();
            }
            if (planetBtn) planetBtn.classList.remove("lg-pulse");
            window._lgRunningDemo = false;
            GuideDemos.resetCurrentStepAfterDemo();
        }, 1800);
    },

    highlight(element) {
        if (!element) return;

        element.classList.add("lg-demo-highlight");

        setTimeout(() => {
            element.classList.remove("lg-demo-highlight");
        }, 4000);
    }
};
