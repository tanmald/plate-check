// Re-export from AlignmentScore for backward compatibility.
// Use AlignmentScore directly in new code.
export {
  AlignmentScore as AdherenceScore,
  getScoreStatus,
  getScoreColor,
  getScoreLabel,
} from "./AlignmentScore";
