let tooltipEl: HTMLElement | null = null;

function getTooltip(): HTMLElement {
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'chatnest-tooltip';
    document.body.appendChild(tooltipEl);
  }
  return tooltipEl;
}

export function showTooltip(text: string, x: number, y: number): void {
  const tooltip = getTooltip();
  tooltip.textContent = text;

  requestAnimationFrame(() => {
    const rect = tooltip.getBoundingClientRect();
    let left = x - rect.width - 12;
    let top = y - rect.height / 2;

    if (left < 8) {
      left = x + 12;
      tooltip.classList.add('left-arrow');
    } else {
      tooltip.classList.remove('left-arrow');
    }

    top = Math.max(8, Math.min(top, window.innerHeight - rect.height - 8));

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.classList.add('visible');
  });
}

export function hideTooltip(): void {
  if (tooltipEl) {
    tooltipEl.classList.remove('visible');
  }
}
