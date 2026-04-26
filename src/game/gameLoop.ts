export function startGameLoop(tick: () => void): () => void {
  let frame = 0;
  const run = () => {
    tick();
    frame = window.requestAnimationFrame(run);
  };
  frame = window.requestAnimationFrame(run);
  return () => window.cancelAnimationFrame(frame);
}
