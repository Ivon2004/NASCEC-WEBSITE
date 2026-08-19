let currentProgram = 0;
const programs = document.querySelectorAll(".program");

function showProgram(index) {
  programs.forEach(p => p.classList.remove("active"));
  programs[index].classList.add("active");
}

function nextProgram() {
  currentProgram = (currentProgram + 1) % programs.length;
  showProgram(currentProgram);
}

function prevProgram() {
  currentProgram = (currentProgram - 1 + programs.length) % programs.length;
  showProgram(currentProgram);
}

// --- Dynamic sizing: make the image container match the image aspect ratio ---
function adjustProgramImageContainers() {
  const wraps = document.querySelectorAll('.program-image-wrap');
  wraps.forEach(wrap => {
    const img = wrap.querySelector('img.program-image');
    if (!img) return;

    const applyHeight = () => {
      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;
      if (!naturalW || !naturalH) return;
      const wrapWidth = wrap.getBoundingClientRect().width;
      const targetHeight = Math.round(wrapWidth * (naturalH / naturalW));
      wrap.style.height = targetHeight + 'px';
    };

    if (img.complete && img.naturalWidth) {
      applyHeight();
    } else {
      img.addEventListener('load', applyHeight, { once: true });
      // fallback in case load already happened but complete not set
      setTimeout(applyHeight, 250);
    }
  });
}

// debounce helper
function debounce(fn, wait = 120) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

window.addEventListener('load', () => {
  adjustProgramImageContainers();
});
window.addEventListener('resize', debounce(adjustProgramImageContainers, 120));

