function getActivity() {
    if (window.activity?.blocks) return window.activity;
    if (window.globalActivity?.blocks) return window.globalActivity;
    return null;
}

export const PracticeValidator = {
    validate(problem) {
        const activity = getActivity();
        if (!activity) return false;

        const blockList = activity.blocks.blockList || {};

        // 1. Block presence validation
        if (problem.expected.blocks) {
            for (const name of problem.expected.blocks) {
                if (!this.hasBlock(blockList, name)) return false;
            }
        }

        // 2. Minimum notes
        if (problem.expected.minNotes) {
            const count = this.countNotes(blockList);
            if (count < problem.expected.minNotes) return false;
        }

        // 3. Graphics inside note
        if (problem.expected.graphicsInsideNote) {
            if (!this.hasGraphicsInsideNote(blockList)) return false;
        }

        return true;
    },

    hasBlock(blockList, name) {
        return Object.values(blockList).some(
            b => b && b.name === name && !b.trash
        );
    },

    countNotes(blockList) {
        return Object.values(blockList).filter(
            b => b?.name?.includes("note") && !b.trash
        ).length;
    },

    hasGraphicsInsideNote(blockList) {
        for (const block of Object.values(blockList)) {
            if (block?.name === "forward" && this.isInsideNote(block, blockList)) {
                return true;
            }
        }
        return false;
    },

    isInsideNote(block, blockList) {
        let parent = block;
        let depth = 0;

        while (parent && depth < 10) {
            const parentId = parent.connections?.[0];
            parent = blockList[parentId];
            if (!parent) break;
            if (parent.name === "note" || parent.name === "newnote") return true;
            depth++;
        }
        return false;
    }
};
