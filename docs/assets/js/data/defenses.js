import { adversarialDefenses } from "./defenses/adversarial.js";
import { jailbreakDefenses } from "./defenses/jailbreak.js";
import { backdoorDefenses } from "./defenses/backdoor.js";
import { modelExtractionDefenses } from "./defenses/model-extraction.js";
import { otherDefenses } from "./defenses/other.js";

export const defenseCategoryMeta = {
  adversarial: {
    title: "Adversarial Defenses",
    shortTitle: "Adversarial",
    description:
      "Defenses designed to improve robustness against adversarial perturbations and fragile visual manipulations."
  },
  jailbreak: {
    title: "Jailbreak Defenses",
    shortTitle: "Jailbreak",
    description:
      "Methods that preserve refusal behavior and safety alignment under malicious multimodal prompts."
  },
  backdoor: {
    title: "Backdoor Defenses",
    shortTitle: "Backdoor",
    description:
      "Detection and mitigation strategies for hidden malicious behaviors injected during training or fine-tuning."
  },
  modelExtraction: {
    title: "Model Extraction Defenses",
    shortTitle: "Extraction",
    description:
      "Protective methods that limit leakage, copying, or reconstruction of target model behavior."
  },
  other: {
    title: "Other Defenses",
    shortTitle: "Other",
    description:
      "Safety defenses that do not fit neatly into the three core groups above."
  }
};

export const defenseGroups = [
  {
    key: "adversarial",
    ...defenseCategoryMeta.adversarial,
    papers: adversarialDefenses
  },
  {
    key: "jailbreak",
    ...defenseCategoryMeta.jailbreak,
    papers: jailbreakDefenses
  },
  {
    key: "backdoor",
    ...defenseCategoryMeta.backdoor,
    papers: backdoorDefenses
  },
  {
    key: "modelExtraction",
    ...defenseCategoryMeta.modelExtraction,
    papers: modelExtractionDefenses
  },
  {
    key: "other",
    ...defenseCategoryMeta.other,
    papers: otherDefenses
  }
];

export const defenses = defenseGroups.flatMap((group) =>
  group.papers.map((paper) => ({
    ...paper,
    category: group.key,
    categoryLabel: group.shortTitle
  }))
);
