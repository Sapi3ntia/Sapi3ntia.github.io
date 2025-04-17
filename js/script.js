let hue = 0;
let rainbow = false;
const toggleBtn = document.getElementById('rainbow-toggle');

toggleBtn.addEventListener('click', () => {
  rainbow = !rainbow;
  toggleBtn.textContent = `Rainbow: ${rainbow ? 'On' : 'Off'}`;
});

document.body.addEventListener('mousemove', (e) => {
  if (!rainbow) return;
  createTrailSquare(e.clientX, e.clientY);
});

function createTrailSquare(x, y) {
  const square = document.createElement('div');
  square.className = 'trail-square';
  square.style.left = `${x}px`;
  square.style.top = `${y}px`;
  square.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
  hue = (hue + 20) % 360;

  document.body.appendChild(square);

  requestAnimationFrame(() => {
    square.classList.add('fade-out');
  });

  square.addEventListener('transitionend', () => {
    square.remove();
  });
}
