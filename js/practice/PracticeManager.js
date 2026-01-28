import { PracticeValidator } from "./PracticeValidator.js";
import { BadgeManager } from "../badges/BadgeManager.js";

const STORAGE_KEY = "mb_practice_progress";

export const PracticeManager = {
    progress: JSON.parse(localStorage.getItem(STORAGE_KEY)) || {},

    complete(problem, level) {
        this.progress[problem.id] = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));

        // Check if whole level is done
        if (this.isLevelComplete(level)) {
            BadgeManager.unlock(level);
        }
    },

    isDone(problemId) {
        return !!this.progress[problemId];
    },

    isLevelComplete(level) {
        const problems = window.PracticeProblems[level];
        return problems.every(p => this.isDone(p.id));
    }
};
