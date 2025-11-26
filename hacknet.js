/* Global hacking console injected into every page */
(function(){
  if (window.__hackConsoleLoaded) return;
  window.__hackConsoleLoaded = true;

  const targets = {
    'police.sub': { user: 'officer_id_12345', pass: 'securepass123', code: 'CODE-ALPHA' },
    'leviathan.cult': { user: 'agent_leviathan', pass: 'leviathan', code: '' },
    'pitevna': { user: 'dr_mortis', pass: 'autopsy2025', code: '' },
    'mainblack.gov': { user: 'agent_k_001', pass: 'blackops', code: 'CLEARANCE-7' }
  };

  let gameActive = false;
  let modalEl = null;
  let consoleEl = null;
  let inputEl = null;

  function openHackConsole() {
    if (gameActive) return;
    gameActive = true;

    modalEl = document.createElement('div');
    modalEl.id = '__hackModal';
    modalEl.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:999999;display:flex;align-items:center;justify-content:center;';

    const panel = document.createElement('div');
    panel.style.cssText = 'background:#000;border:2px solid #0f0;border-radius:10px;width:90%;max-width:800px;padding:20px;color:#0f0;font-family:Consolas,monospace;';

    const title = document.createElement('h2');
    title.textContent = '*** HACKNET CONSOLE v2.5 ***';
    title.style.cssText = 'margin:0 0 10px;text-align:center;color:#0f0;';

    consoleEl = document.createElement('div');
    consoleEl.style.cssText = 'height:400px;overflow-y:auto;white-space:pre-wrap;background:#001100;padding:10px;border:1px solid #0f0;border-radius:5px;margin-bottom:10px;';

    inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.placeholder = 'Enter command...';
    inputEl.style.cssText = 'width:100%;background:#001100;color:#0f0;border:1px solid #0f0;border-radius:5px;padding:8px;font-family:Consolas,monospace;outline:none;';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'CLOSE [ESC]';
    closeBtn.style.cssText = 'margin-top:10px;background:#0f0;color:#000;border:none;padding:8px 16px;border-radius:5px;cursor:pointer;font-weight:bold;';
    closeBtn.onclick = closeHackConsole;

    panel.appendChild(title);
    panel.appendChild(consoleEl);
    panel.appendChild(inputEl);
    panel.appendChild(closeBtn);
    modalEl.appendChild(panel);
    document.body.appendChild(modalEl);

    inputEl.focus();
    print('HACKNET CONSOLE ACTIVE\nType "help" for commands.\n');

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = inputEl.value.trim();
        inputEl.value = '';
        handleCommand(cmd);
      }
    });

    document.addEventListener('keydown', escHandler);
  }

  function escHandler(e) {
    if (e.key === 'Escape') closeHackConsole();
  }

  function closeHackConsole() {
    if (!gameActive) return;
    gameActive = false;
    if (modalEl) {
      document.body.removeChild(modalEl);
      modalEl = null;
    }
    document.removeEventListener('keydown', escHandler);
  }

  function print(text) {
    if (!consoleEl) return;
    consoleEl.innerHTML += text + '\n';
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }

  function handleCommand(cmd) {
    print('> ' + cmd);
    if (!cmd) return;

    if (cmd === 'help') {
      print('AVAILABLE COMMANDS:');
      print('  targets       - list secured sites');
      print('  hack <site>   - initiate breach');
      print('  clear         - clear console');
      print('  close         - exit hacknet');
      return;
    }

    if (cmd === 'clear') {
      consoleEl.innerHTML = '';
      return;
    }

    if (cmd === 'close') {
      closeHackConsole();
      return;
    }

    if (cmd === 'targets') {
      print('SECURED TARGETS:');
      for (const t of Object.keys(targets)) {
        print(' - ' + t);
      }
      return;
    }

    if (cmd.startsWith('hack ')) {
      const site = cmd.split(' ')[1];
      if (!targets[site]) {
        print('[ERROR] Unknown target.');
        return;
      }
      hackAnimation(site);
      return;
    }

    print('[ERROR] Unknown command. Type "help".');
  }

  function hackAnimation(site) {
    let dots = '';
    let steps = 0;
    const interval = setInterval(() => {
      dots += '.';
      print(`BREACHING ${site}${dots}`);
      steps++;
      if (steps >= 4) {
        clearInterval(interval);
        const info = targets[site];
        print('*** ACCESS GRANTED ***');
        print('USERNAME: ' + info.user);
        print('PASSWORD: ' + info.pass);
        if (info.code) print('CLEARANCE CODE: ' + info.code);
        print('*** BREACH COMPLETE ***\n');
      }
    }, 500);
  }

  // Expose global hack() function
  window.hack = function() {
    console.log('%c[HACKNET] Initiating console...', 'color:#0f0;font-weight:bold;');
    openHackConsole();
  };

  console.log('%c*** HIDDEN CONSOLE AVAILABLE ***', 'color:#0f0;font-weight:bold;font-size:14px;');
  console.log('%cType hack() to access HACKNET', 'color:#0f0;');
})();
