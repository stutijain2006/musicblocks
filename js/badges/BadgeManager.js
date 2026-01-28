import { Badges } from "./BadgeDefinitions.js";

const KEY = "mb_badges";

export const BadgeManager = {
  unlock(id) {
    const earned = JSON.parse(localStorage.getItem(KEY)) || {};
    if (earned[id]) return;

    earned[id] = true;
    localStorage.setItem(KEY, JSON.stringify(earned));

    alert(`🏅 Badge unlocked: ${Badges[id].name}`);
  }
};
