/* Global hacking console injected into every page */
(function(){
  if (window.__hackConsoleLoaded) return;
  window.__hackConsoleLoaded = true;

  const targets = {
    'police.sub': { 
      user: 'officer_id_12345', 
      pass: 'securepass123', 
      code: 'CODE-ALPHA',
      ip: '192.168.42.10',
      difficulty: 3,
      ports: [22, 80, 443, 8080]
    },
    'leviathan.cult': { 
      user: 'agent_leviathan', 
      pass: 'leviathan', 
      code: '',
      ip: '10.0.13.37',
      difficulty: 2,
      ports: [443, 3000, 8443]
    },
    'pitevna': { 
      user: 'dr_mortis', 
      pass: 'autopsy2025', 
      code: '',
      ip: '172.16.99.5',
      difficulty: 2,
      ports: [80, 443, 5432]
    },
    'mainblack.gov': { 
      user: 'agent_k_001', 
      pass: 'blackops', 
      code: 'CLEARANCE-7',
      ip: '198.51.100.42',
      difficulty: 4,
      ports: [22, 443, 9000, 31337]
    }
  };

  let gameActive = false;
  let modalEl = null;
  let consoleEl = null;
  let inputEl = null;
  let currentHack = null;
  let hackProgress = { scanned: false, exploited: false, decrypted: false };

  function openHackConsole() {
    if (gameActive) return;
    gameActive = true;

    modalEl = document.createElement('div');
    modalEl.id = '__hackModal';
    modalEl.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:999999;display:flex;align-items:center;justify-content:center;';

    const panel = document.createElement('div');
    panel.style.cssText = 'background:#000;border:2px solid #0f0;border-radius:10px;width:90%;max-width:800px;padding:20px;color:#0f0;font-family:Consolas,monospace;';

    const title = document.createElement('h2');
    title.innerHTML = '*** HACKNET CONSOLE v2.5 ***';
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
    printBanner();
    print('Type "help" for available commands.\n');

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
    currentHack = null;
    hackProgress = { scanned: false, exploited: false, decrypted: false };
    document.removeEventListener('keydown', escHandler);
  }

  function print(text) {
    if (!consoleEl) return;
    consoleEl.innerHTML += text + '\n';
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }

  function printBanner() {
    print(' ╦ ╦╔═╗╔═╗╦╔═╔╗╔╔═╗╔╦╗');
    print(' ╠═╣╠═╣║  ╠╩╗║║║║╣  ║ ');
    print(' ╩ ╩╩ ╩╚═╝╩ ╩╝╚╝╚═╝ ╩ ');
    print('━━━━━━━━━━━━━━━━━━━━━━━');
    print('Unauthorized Access Tool');
    print('━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  function handleCommand(cmd) {
    print('> ' + cmd);
    if (!cmd) return;

    const parts = cmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch(command) {
      case 'help':
      case 'manual':
        printManual();
        break;
      case 'targets':
        listTargets();
        break;
      case 'hack':
        if (args.length === 0) {
          print('[ERROR] Usage: hack <target>');
          print('Type "targets" to see available targets.');
        } else {
          selectTarget(args[0]);
        }
        break;
      case 'scan':
        if (!currentHack) {
          print('[ERROR] No target selected. Use: hack <target>');
        } else {
          scanTarget();
        }
        break;
      case 'exploit':
        if (!currentHack) {
          print('[ERROR] No target selected. Use: hack <target>');
        } else if (!hackProgress.scanned) {
          print('[ERROR] Run "scan" first to map the target network.');
        } else {
          exploitTarget();
        }
        break;
      case 'decrypt':
        if (!currentHack) {
          print('[ERROR] No target selected. Use: hack <target>');
        } else if (!hackProgress.exploited) {
          print('[ERROR] Run "exploit" first to gain system access.');
        } else {
          decryptCredentials();
        }
        break;
      case 'status':
        showStatus();
        break;
      case 'about':
        printAbout();
        break;
      case 'clear':
        consoleEl.innerHTML = '';
        break;
      case 'close':
      case 'exit':
        closeHackConsole();
        break;
      default:
        print('[ERROR] Unknown command: ' + command);
        print('Type "help" for available commands.');
    }
  }

  function printManual() {
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    print('HACKNET MANUAL');
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    print('');
    print('BASIC COMMANDS:');
    print('  help/manual   - Display this manual');
    print('  targets       - List all secured targets');
    print('  about         - Display system information');
    print('  status        - Show current hack progress');
    print('  clear         - Clear console output');
    print('  close/exit    - Close HACKNET console');
    print('');
    print('HACKING WORKFLOW:');
    print('  1. hack <target>  - Select target system');
    print('     Example: hack name.ofsite');
    print('');
    print('  2. scan           - Port scan & network mapping');
    print('     Identifies open ports and services');
    print('');
    print('  3. exploit        - Execute vulnerability exploit');
    print('     Gains system access via discovered services');
    print('');
    print('  4. decrypt        - Crack encrypted credentials');
    print('     Reveals usernames, passwords, and codes');
    print('');
    print('NOTES:');
    print('  - Commands must be executed in order');
    print('  - Each target has different difficulty levels');
    print('  - Press ESC to close console at any time');
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  function listTargets() {
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    print('SECURED TARGETS');
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (const [name, info] of Object.entries(targets)) {
      const stars = '★'.repeat(info.difficulty);
      print(`  ${name.padEnd(20)} ${info.ip.padEnd(15)} ${stars}`);
    }
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  function selectTarget(site) {
    if (!targets[site]) {
      print('[ERROR] Unknown target: ' + site);
      print('Type "targets" to see available targets.');
      return;
    }
    currentHack = site;
    hackProgress = { scanned: false, exploited: false, decrypted: false };
    const info = targets[site];
    print('[INFO] Target selected: ' + site);
    print('[INFO] IP Address: ' + info.ip);
    print('[INFO] Difficulty: ' + '★'.repeat(info.difficulty));
    print('[INFO] Type "scan" to begin reconnaissance.\n');
  }

  function scanTarget() {
    if (hackProgress.scanned) {
      print('[WARNING] Target already scanned.\n');
      return;
    }

    const info = targets[currentHack];
    print('[SCAN] Initiating port scan on ' + info.ip + '...');
    
    let portIndex = 0;
    const scanInterval = setInterval(() => {
      if (portIndex < info.ports.length) {
        const port = info.ports[portIndex];
        print('[SCAN] Port ' + port + ' ...... OPEN');
        portIndex++;
      } else {
        clearInterval(scanInterval);
        print('[SCAN] Scan complete. ' + info.ports.length + ' open ports found.');
        print('[INFO] Type "exploit" to attempt intrusion.\n');
        hackProgress.scanned = true;
      }
    }, 400);
  }

  function exploitTarget() {
    if (hackProgress.exploited) {
      print('[WARNING] Target already exploited.\n');
      return;
    }

    const info = targets[currentHack];
    print('[EXPLOIT] Analyzing vulnerabilities...');
    
    setTimeout(() => {
      print('[EXPLOIT] Buffer overflow detected on port ' + info.ports[0]);
    }, 600);

    setTimeout(() => {
      print('[EXPLOIT] Injecting payload...');
    }, 1200);

    setTimeout(() => {
      print('[EXPLOIT] Escalating privileges...');
    }, 1800);

    setTimeout(() => {
      print('[EXPLOIT] *** ROOT ACCESS GRANTED ***');
      print('[INFO] Type "decrypt" to extract credentials.\n');
      hackProgress.exploited = true;
    }, 2400);
  }

  function decryptCredentials() {
    if (hackProgress.decrypted) {
      print('[WARNING] Credentials already decrypted.\n');
      return;
    }

    const info = targets[currentHack];
    print('[DECRYPT] Locating encrypted database...');
    
    setTimeout(() => {
      print('[DECRYPT] Database found: /etc/shadow.db');
    }, 500);

    setTimeout(() => {
      print('[DECRYPT] Applying brute-force algorithm...');
    }, 1000);

    let crackProgress = 0;
    const crackInterval = setInterval(() => {
      crackProgress += 25;
      print('[DECRYPT] Progress: ' + crackProgress + '%');
      
      if (crackProgress >= 100) {
        clearInterval(crackInterval);
        setTimeout(() => {
          print('');
          print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          print('*** CREDENTIALS DECRYPTED ***');
          print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          print('TARGET: ' + currentHack);
          print('USERNAME: ' + info.user);
          print('PASSWORD: ' + info.pass);
          if (info.code) print('CLEARANCE: ' + info.code);
          print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          print('[SUCCESS] Breach complete!\n');
          hackProgress.decrypted = true;
        }, 500);
      }
    }, 600);
  }

  function showStatus() {
    if (!currentHack) {
      print('[STATUS] No active target.');
      print('Use "hack <target>" to select a target.\n');
      return;
    }

    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    print('HACK PROGRESS: ' + currentHack);
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    print('[1] SCAN     ' + (hackProgress.scanned ? '[✓] COMPLETE' : '[ ] PENDING'));
    print('[2] EXPLOIT  ' + (hackProgress.exploited ? '[✓] COMPLETE' : '[ ] PENDING'));
    print('[3] DECRYPT  ' + (hackProgress.decrypted ? '[✓] COMPLETE' : '[ ] PENDING'));
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  function printAbout() {
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    print('HACKNET v2.5');
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    print('Network Penetration Framework');
    print('Developed by: UNKNOWN');
    print('Build: 2025.01.R3');
    print('');
    print('This tool is for educational purposes only.');
    print('Unauthorized access is illegal.');
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  // Expose global hack() function
  window.hack = function() {
    console.log('%c[HACKNET] Initiating console...', 'color:#0f0;font-weight:bold;');
    openHackConsole();
  };

  console.log('%c*** HIDDEN CONSOLE AVAILABLE ***', 'color:#0f0;font-weight:bold;font-size:14px;');
  console.log('%cType hack() to access HACKNET', 'color:#0f0;');
})();
