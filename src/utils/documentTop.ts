// A section's scroll destination must not move with its camera transform or pin.
export function documentTop(element: HTMLElement): number {
  let top = 0;
  for (let node: HTMLElement | null = element; node; node = node.offsetParent as HTMLElement | null) {
    // Sticky offsetTop includes its current displacement. This viewport's
    // logical origin is always the beginning of its surrounding sequence.
    if (node.classList.contains('tm-camera-viewport') && node.parentElement?.dataset.cameraMode === 'pan') continue;
    top += node.offsetTop;
  }
  return top;
}
