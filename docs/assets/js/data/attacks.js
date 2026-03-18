import { adversarialAttacks } from "./attacks/adversarial.js";
import { jailbreakAttacks } from "./attacks/jailbreak.js";
import { backdoorAttacks } from "./attacks/backdoor.js";
import { otherAttacks } from "./attacks/other.js";

export const attackCategoryMeta = {
  adversarial: {
    title: "Adversarial Attacks",
    shortTitle: "Adversarial",
    description:
      "Perturbation-based attacks that exploit fragile multimodal decision boundaries."
  },
  jailbreak: {
    title: "Jailbreak Attacks",
    shortTitle: "Jailbreak",
    description:
      "Prompting and input-crafting attacks that break safety alignment and refusal policies."
  },
  backdoor: {
    title: "Backdoor Attacks",
    shortTitle: "Backdoor",
    description:
      "Training-time or fine-tuning-time attacks that implant hidden malicious behaviors."
  },
  other: {
    title: "Other Attacks",
    shortTitle: "Other",
    description:
      "Attack directions that do not fit neatly into the three core groups above."
  }
};

export const attackGroups = [
  {
    key: "adversarial",
    ...attackCategoryMeta.adversarial,
    papers: adversarialAttacks
  },
  {
    key: "jailbreak",
    ...attackCategoryMeta.jailbreak,
    papers: jailbreakAttacks
  },
  {
    key: "backdoor",
    ...attackCategoryMeta.backdoor,
    papers: backdoorAttacks
  },
  {
    key: "other",
    ...attackCategoryMeta.other,
    papers: otherAttacks
  }
];

export const attacks = attackGroups.flatMap((group) =>
  group.papers.map((paper) => ({
    ...paper,
    category: group.key,
    categoryLabel: group.shortTitle
  }))
);
