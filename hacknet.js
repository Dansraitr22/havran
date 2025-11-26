/* Global hacking console injected into every page */
(function(){
  if (window.__hackConsoleLoaded) return;
  window.__hackConsoleLoaded = true;

  const targets = {
    '192.168.42.10': { 
      hostname: 'police.sub',
      user: 'officer_id_12345', 
      pass: 'securepass123', 
      code: 'CODE-ALPHA',
      ports: {
        22: { service: 'SSH', vulnerable: false },
        80: { service: 'HTTP', vulnerable: false },
        443: { service: 'HTTPS', vulnerable: false },
        8080: { service: 'HTTP-PROXY', vulnerable: true }
      },
      folders: ['/var/www', '/etc/config', '/home/users', '/var/log', '/opt/secure'],
      passwordFile: '/opt/secure/credentials.db'
    },
    '10.0.13.37': { 
      hostname: 'leviathan.cult',
      user: 'agent_leviathan', 
      pass: 'leviathan', 
      code: '',
      ports: {
        443: { service: 'HTTPS', vulnerable: false },
        3000: { service: 'NODE-API', vulnerable: true },
        8443: { service: 'HTTPS-ALT', vulnerable: false }
      },
      folders: ['/srv/data', '/usr/share', '/etc/secrets', '/var/backup', '/home/agent'],
      passwordFile: '/etc/secrets/auth.key'
    },
    '172.16.99.5': { 
      hostname: 'pitevna',
      user: 'dr_mortis', 
      pass: 'autopsy2025', 
      code: '',
      ports: {
        80: { service: 'HTTP', vulnerable: false },
        443: { service: 'HTTPS', vulnerable: false },
        5432: { service: 'PostgreSQL', vulnerable: true }
      },
      folders: ['/var/database', '/home/mortis', '/usr/local/app', '/var/reports', '/etc/auth'],
      passwordFile: '/etc/auth/users.enc'
    },
    '198.51.100.42': { 
      hostname: 'mainblack.gov',
      user: 'agent_k_001', 
      pass: 'blackops', 
      code: 'CLEARANCE-7',
      ports: {
        22: { service: 'SSH', vulnerable: false },
        443: { service: 'HTTPS', vulnerable: false },
        9000: { service: 'CUSTOM-SVC', vulnerable: false },
        31337: { service: 'BACKDOOR', vulnerable: true }
      },
      folders: ['/classified', '/var/cases', '/home/agents', '/tmp/cache', '/opt/intel', '/etc/clearance'],
      passwordFile: '/etc/clearance/level7.dat'
    }
  };

  let gameActive = false;
  let modalEl = null;
  let consoleEl = null;
  let inputEl = null;
  let currentTarget = null;
  let scannedPorts = [];
  let selectedPort = null;
  let breached = false;
  let currentFolder = null;
  let discoveredIPs = [];

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
    currentTarget = null;
    scannedPorts = [];
    selectedPort = null;
    breached = false;
    currentFolder = null;
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
        printManual();
        break;
      case 'nmap':
        if (args.length === 0) {
          print('[ERROR] Usage: nmap <IP address>');
        } else {
          nmapScan(args[0]);
        }
        break;
      case 'connect':
        if (args.length === 0) {
          print('[ERROR] Usage: connect <port>');
        } else {
          connectPort(args[0]);
        }
        break;
      case 'exploit':
        exploitVulnerability();
        break;
      case 'ls':
        listFiles();
        break;
      case 'cd':
        if (args.length === 0) {
          print('[ERROR] Usage: cd <folder>');
        } else {
          changeDirectory(args.join(' '));
        }
        break;
      case 'cat':
        if (args.length === 0) {
          print('[ERROR] Usage: cat <filename>');
        } else {
          readFile(args.join(' '));
        }
        break;
      case 'crack':
        if (args.length === 0) {
          print('[ERROR] Usage: crack <file>');
        } else {
          crackPassword(args.join(' '));
        }
        break;
      case 'hint':
        giveHint();
        break;
      case 'reset':
        resetProgress();
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
    print('HACKNET MANUAL v2.5');
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    print('');
    print('NETWORK RECONNAISSANCE:');
    print('');
    print('  nmap <IP address>');
    print('    Performs a port scan on the specified IP address.');
    print('    Discovers open ports and running services.');
    print('    Example: nmap 192.168.1.100');
    print('');
    print('EXPLOITATION:');
    print('');
    print('  connect <port>');
    print('    Establishes connection to a specific port.');
    print('    Must run nmap first to discover available ports.');
    print('    Reveals service information and vulnerabilities.');
    print('    Example: connect 8080');
    print('');
    print('  exploit');
    print('    Attempts to exploit the currently connected service.');
    print('    Only works if the service has known vulnerabilities.');
    print('    Grants root access to the target system on success.');
    print('');
    print('FILE SYSTEM NAVIGATION:');
    print('');
    print('  ls');
    print('    Lists contents of current directory.');
    print('    Shows folders (ending with /) and files.');
    print('    Only available after successful exploitation.');
    print('');
    print('  cd <folder>');
    print('    Changes current working directory.');
    print('    Use absolute paths (e.g., /etc/config) or');
    print('    relative paths (e.g., config).');
    print('    Use "/" to return to root directory.');
    print('    Example: cd /opt/secure');
    print('');
    print('  cat <filename>');
    print('    Displays contents of specified file.');
    print('    Encrypted files will show garbled output.');
    print('    Example: cat credentials.db');
    print('');
    print('PASSWORD CRACKING:');
    print('');
    print('  crack <filename>');
    print('    Attempts to decrypt an encrypted password file.');
    print('    Uses brute-force dictionary attack on encryption.');
    print('    Reveals usernames, passwords, and access codes.');
    print('    Example: crack credentials.db');
    print('');
    print('UTILITY COMMANDS:');
    print('');
    print('  hint');
    print('    Provides contextual guidance based on progress.');
    print('    Suggests next steps without revealing solutions.');
    print('');
    print('  reset');
    print('    Clears all progress on current target.');
    print('    Allows starting over from reconnaissance phase.');
    print('');
    print('  clear');
    print('    Clears console output for better visibility.');
    print('');
    print('  close / exit');
    print('    Closes the HACKNET console.');
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  function nmapScan(ip) {
    if (!targets[ip]) {
      print('[ERROR] No response from ' + ip);
      print('[INFO] Host appears to be down or unreachable.');
      return;
    }

    if (!discoveredIPs.includes(ip)) {
      discoveredIPs.push(ip);
    }

    currentTarget = ip;
    scannedPorts = [];
    selectedPort = null;
    breached = false;
    currentFolder = null;

    const targetData = targets[ip];
    print('[NMAP] Starting scan on ' + ip + '...');
    
    let portList = Object.keys(targetData.ports);
    let portIndex = 0;
    
    const scanInterval = setInterval(() => {
      if (portIndex < portList.length) {
        const port = portList[portIndex];
        const portInfo = targetData.ports[port];
        scannedPorts.push(port);
        print('[NMAP] ' + port + '/tcp  OPEN  ' + portInfo.service);
        portIndex++;
      } else {
        clearInterval(scanInterval);
        print('[NMAP] Scan complete. ' + portList.length + ' ports open.');
        print('');
      }
    }, 500);
  }

  function connectPort(port) {
    if (!currentTarget) {
      print('[ERROR] No target selected. Use "nmap <IP>" first.');
      return;
    }

    if (!scannedPorts.includes(port)) {
      print('[ERROR] Port ' + port + ' not found in scan results.');
      return;
    }

    const targetData = targets[currentTarget];
    const portInfo = targetData.ports[port];

    selectedPort = port;
    print('[CONNECT] Connecting to ' + currentTarget + ':' + port + '...');
    
    setTimeout(() => {
      print('[CONNECT] Connection established.');
      print('[INFO] Service: ' + portInfo.service);
      if (portInfo.vulnerable) {
        print('[VULN] Vulnerability detected! Service appears exploitable.');
      } else {
        print('[INFO] Service appears secure. Try other ports.');
      }
      print('');
    }, 800);
  }

  function exploitVulnerability() {
    if (!selectedPort) {
      print('[ERROR] No active connection. Use "connect <port>" first.');
      return;
    }

    if (breached) {
      print('[INFO] System already breached.');
      return;
    }

    const targetData = targets[currentTarget];
    const portInfo = targetData.ports[selectedPort];

    if (!portInfo.vulnerable) {
      print('[ERROR] This service is not vulnerable to known exploits.');
      print('[INFO] Try connecting to a different port.');
      return;
    }

    print('[EXPLOIT] Analyzing ' + portInfo.service + ' for vulnerabilities...');
    
    setTimeout(() => {
      print('[EXPLOIT] Found CVE-2024-' + Math.floor(Math.random() * 10000));
    }, 700);

    setTimeout(() => {
      print('[EXPLOIT] Preparing payload...');
    }, 1400);

    setTimeout(() => {
      print('[EXPLOIT] Injecting shellcode...');
    }, 2100);

    setTimeout(() => {
      print('[EXPLOIT] Escalating privileges...');
    }, 2800);

    setTimeout(() => {
      print('[EXPLOIT] *** ROOT ACCESS GRANTED ***');
      print('[INFO] You now have shell access to the system.');
      print('[INFO] Current directory: /');
      breached = true;
      currentFolder = '/';
      print('');
    }, 3500);
  }

  function listFiles() {
    if (!breached) {
      print('[ERROR] No system access. Exploit a vulnerability first.');
      return;
    }

    const targetData = targets[currentTarget];
    
    if (currentFolder === '/') {
      print('[LS] Contents of /:');
      targetData.folders.forEach(folder => {
        print('  ' + folder + '/');
      });
    } else if (targetData.folders.includes(currentFolder)) {
      print('[LS] Contents of ' + currentFolder + ':');
      if (currentFolder === targetData.passwordFile.substring(0, targetData.passwordFile.lastIndexOf('/'))) {
        const filename = targetData.passwordFile.substring(targetData.passwordFile.lastIndexOf('/') + 1);
        print('  ' + filename);
        print('  config.txt');
        print('  logs.dat');
      } else {
        print('  data.tmp');
        print('  readme.txt');
        print('  system.log');
      }
    } else {
      print('[ERROR] Invalid directory.');
    }
    print('');
  }

  function changeDirectory(folder) {
    if (!breached) {
      print('[ERROR] No system access. Exploit a vulnerability first.');
      return;
    }

    const targetData = targets[currentTarget];
    
    if (folder === '/' || folder === '~') {
      currentFolder = '/';
      print('[CD] Changed to /');
    } else if (folder.startsWith('/')) {
      if (targetData.folders.includes(folder)) {
        currentFolder = folder;
        print('[CD] Changed to ' + folder);
      } else {
        print('[ERROR] Directory not found: ' + folder);
      }
    } else {
      const newPath = currentFolder === '/' ? '/' + folder : currentFolder + '/' + folder;
      if (targetData.folders.includes(newPath)) {
        currentFolder = newPath;
        print('[CD] Changed to ' + newPath);
      } else {
        print('[ERROR] Directory not found: ' + folder);
      }
    }
    print('');
  }

  function readFile(filename) {
    if (!breached) {
      print('[ERROR] No system access. Exploit a vulnerability first.');
      return;
    }

    const targetData = targets[currentTarget];
    const fullPath = currentFolder === '/' ? '/' + filename : currentFolder + '/' + filename;

    if (fullPath === targetData.passwordFile) {
      print('[CAT] Reading ' + filename + '...');
      print('');
      print('██▓▒░▄▀■□▪▫◊○●◘◙♠♣♥♦♪♫☼►◄');
      print('░▒▓█▀▄─│┌┐└┘├┤┬┴┼═║╔╗╚╝╠');
      print('▓█░▒░█▓▒░▄▀■□▪▫◊○●◘◙♠♣♥♦');
      print('');
      print('[INFO] File appears to be encrypted.');
      print('[INFO] Use "crack ' + filename + '" to decrypt.');
      print('');
    } else {
      print('[ERROR] File not found: ' + filename);
      print('[INFO] Use "ls" to see available files.');
      print('');
    }
  }

  function crackPassword(filename) {
    if (!breached) {
      print('[ERROR] No system access. Exploit a vulnerability first.');
      return;
    }

    const targetData = targets[currentTarget];
    const fullPath = currentFolder === '/' ? '/' + filename : currentFolder + '/' + filename;

    if (fullPath !== targetData.passwordFile) {
      print('[ERROR] File not found or not an encrypted password file.');
      return;
    }

    print('[CRACK] Initializing password cracker...');
    
    setTimeout(() => {
      print('[CRACK] Analyzing encryption scheme...');
    }, 600);

    setTimeout(() => {
      print('[CRACK] Detected: AES-256-CBC');
    }, 1200);

    setTimeout(() => {
      print('[CRACK] Running dictionary attack...');
    }, 1800);

    let progress = 0;
    const crackInterval = setInterval(() => {
      progress += 20;
      print('[CRACK] Progress: ' + progress + '%');
      
      if (progress >= 100) {
        clearInterval(crackInterval);
        setTimeout(() => {
          print('');
          print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          print('*** DECRYPTION SUCCESSFUL ***');
          print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          print('HOST: ' + targetData.hostname);
          print('USERNAME: ' + targetData.user);
          print('PASSWORD: ' + targetData.pass);
          if (targetData.code) print('ACCESS CODE: ' + targetData.code);
          print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          print('[SUCCESS] Credentials extracted!\n');
        }, 500);
      }
    }, 700);
  }

  function giveHint() {
    if (!currentTarget) {
      print('[HINT] Start by scanning IP addresses on the network.');
      print('[HINT] Try common private IP ranges like 192.168.x.x, 10.0.x.x, 172.16.x.x');
    } else if (scannedPorts.length === 0) {
      print('[HINT] You\'ve found a target! Scan it with: nmap ' + currentTarget);
    } else if (!selectedPort) {
      print('[HINT] Connect to one of the open ports to investigate services.');
      print('[HINT] Look for services that might be vulnerable.');
    } else if (!breached) {
      print('[HINT] Try to exploit the vulnerable service you found.');
    } else if (currentFolder === '/') {
      const targetData = targets[currentTarget];
      const passDir = targetData.passwordFile.substring(0, targetData.passwordFile.lastIndexOf('/'));
      print('[HINT] Look for password files in system folders.');
      print('[HINT] Try checking: ' + passDir);
    } else {
      const targetData = targets[currentTarget];
      const filename = targetData.passwordFile.substring(targetData.passwordFile.lastIndexOf('/') + 1);
      print('[HINT] Found any encrypted files? Try: cat ' + filename);
    }
    print('');
  }

  function resetProgress() {
    currentTarget = null;
    scannedPorts = [];
    selectedPort = null;
    breached = false;
    currentFolder = null;
    print('[RESET] Progress cleared. Starting fresh.\n');
  }

  // Expose global hack() function
  window.hack = function() {
    console.log('%c[HACKNET] Initiating console...', 'color:#0f0;font-weight:bold;');
    openHackConsole();
  };

  console.log('%c*** HIDDEN CONSOLE AVAILABLE ***', 'color:#0f0;font-weight:bold;font-size:14px;');
  console.log('%cType hack() to access HACKNET', 'color:#0f0;');
})();
