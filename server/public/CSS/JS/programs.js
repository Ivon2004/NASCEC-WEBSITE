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
