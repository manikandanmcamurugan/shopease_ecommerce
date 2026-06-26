export const flyToIcon = (e, targetId) => {
  if (!e || !e.target) return;
  
  // Find the target icon in the navbar
  const targetEl = document.getElementById(targetId);
  if (!targetEl) return;

  // Use the closest button (like 'add to cart' btn) or the target itself
  const sourceEl = e.target.closest('button') || e.target;
  const sourceRect = sourceEl.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();

  // Create the flying element
  const flyEl = document.createElement('div');
  
  // Basic styling for the flying element (a small floating circle)
  flyEl.style.position = 'fixed';
  flyEl.style.zIndex = '9999';
  flyEl.style.width = '24px';
  flyEl.style.height = '24px';
  flyEl.style.backgroundColor = targetId.includes('cart') ? 'var(--primary)' : 'var(--error, #ef4444)';
  flyEl.style.borderRadius = '50%';
  flyEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
  flyEl.style.pointerEvents = 'none'; // Don't block clicks
  
  // Start position (centered over the clicked button)
  const startX = sourceRect.left + sourceRect.width / 2 - 12;
  const startY = sourceRect.top + sourceRect.height / 2 - 12;
  
  flyEl.style.left = `${startX}px`;
  flyEl.style.top = `${startY}px`;
  
  // The transition
  flyEl.style.transition = 'all 0.8s cubic-bezier(0.2, 1, 0.3, 1)'; // smooth curve
  
  document.body.appendChild(flyEl);
  
  // Animate it on the next frame
  requestAnimationFrame(() => {
    // End position (centered over the target navbar icon)
    const endX = targetRect.left + targetRect.width / 2 - 12;
    const endY = targetRect.top + targetRect.height / 2 - 12;
    
    flyEl.style.left = `${endX}px`;
    flyEl.style.top = `${endY}px`;
    flyEl.style.transform = 'scale(0.3)';
    flyEl.style.opacity = '0.3';
  });

  // Clean up and pulse target
  setTimeout(() => {
    if (document.body.contains(flyEl)) {
      document.body.removeChild(flyEl);
    }
    
    // Add pulse animation to the target
    targetEl.classList.add('icon-pulse-anim');
    setTimeout(() => {
      targetEl.classList.remove('icon-pulse-anim');
    }, 400); // 400ms pulse
  }, 800); // matches the 0.8s transition
};
