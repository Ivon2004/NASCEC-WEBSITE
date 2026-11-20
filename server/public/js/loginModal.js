document.addEventListener('DOMContentLoaded', () => {
  // create modal markup
  const modal = document.createElement('div');
  modal.className = 'login-modal';
  modal.innerHTML = `
    <div class="login-modal-backdrop" data-action="close"></div>
    <div class="login-modal-panel" role="dialog" aria-modal="true" aria-hidden="true">
      <button class="login-modal-close" aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div class="login-modal-content">
        <div class="modal-login-container">
          <h2>Sign In</h2>
          <p>Sign in to access Field Data.</p>
          <form id="modalLoginForm">
            <input type="text" name="username" placeholder="Username" required />
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit">Login</button>
          </form>
          <p id="modalLoginMsg" class="message" aria-live="polite"></p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const openButtons = document.querySelectorAll('.open-login');
  const panel = modal.querySelector('.login-modal-panel');
  const backdrop = modal.querySelector('.login-modal-backdrop');
  const closeBtn = modal.querySelector('.login-modal-close');
  const loginForm = modal.querySelector('#modalLoginForm');
  const loginMsg = modal.querySelector('#modalLoginMsg');

  function openModal(e){
    if (e) e.preventDefault();
    modal.classList.add('open');
    panel.setAttribute('aria-hidden','false');
    // focus first input
    setTimeout(()=> modal.querySelector('input[name="username"]').focus(), 50);
  }

  function closeModal(){
    modal.classList.remove('open');
    panel.setAttribute('aria-hidden','true');
  }

  openButtons.forEach(b => b.addEventListener('click', openModal));
  backdrop.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);

  // close on ESC
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  // submit
  loginForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    loginMsg.textContent = '';
    const formData = new FormData(loginForm);
    const payload = { username: String(formData.get('username')||''), password: String(formData.get('password')||'') };
    try {
      const res = await fetch('/login', {
        method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify(payload)
      });
      const data = await res.json().catch(()=>({}));
      console.log('Login response :', data);
      if (!res.ok || data.success==false) {
        throw new Error(data.message || 'Login failed');
      }
      closeModal();
      // redirect to field_data
      if (data.role === 'admin'){ 
        window.location.href = '/admin_panel.html';
      }else if (data.role === 'user'){
        window.location.href = '/field_data.html';
      }
      //else window.location.href = data.redirectTo || '/field_data.html';
    } catch (err) {
      loginMsg.textContent = err.message || 'Login failed';
      console.log("Error: ",err);
    }
  });
});
