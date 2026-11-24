import { WORKFLOW_STATUSES } from "../workflow.js";

// Shows the 4 workflow steps: done ones ticked, the current one highlighted.
export default function StatusStepper({ current }) {
  const currentIndex = WORKFLOW_STATUSES.indexOf(current);
  return (
    <ol className="stepper">
      {WORKFLOW_STATUSES.map((s, i) => {
        const state = i < currentIndex ? "done" : i === currentIndex ? "current" : "todo";
        return (
          <li key={s} className={`step ${state}`}>
            <span className="dot">{state === "done" ? "✓" : i + 1}</span>
            <span className="label">{s}</span>
          </li>
        );
      })}
    </ol>
  );
}
