import { attacks } from "./attacks.js";
import { defenses } from "./defenses.js";
import { evaluations } from "./evaluations.js";
import { surveys } from "./surveys.js";

export const collections = {
  attacks,
  defenses,
  evaluations,
  surveys
};

export const allPapers = Object.entries(collections).flatMap(([section, papers]) =>
  papers.map((paper) => ({
    ...paper,
    section
  }))
);
