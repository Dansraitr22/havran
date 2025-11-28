/* Global hacking console injected into every page */
(function(){
  if (window.__hackConsoleLoaded) return;
  window.__hackConsoleLoaded = true;

  // Obfuscated target data - decoded at runtime
  const _t = {
    'a': {'h':'police.sub','u':'officer_id_12345','p':'securepass123','c':'CODE-ALPHA','po':{'22':{'s':'SSH','v':false},'80':{'s':'HTTP','v':false},'443':{'s':'HTTPS','v':false},'8080':{'s':'HTTP-PROXY','v':true}},'f':['/var/www','/etc/config','/home/users','/var/log','/opt/secure'],'pf':'/opt/secure/credentials.db'},
    'b': {'h':'leviathan.cult','u':'agent_leviathan','p':'leviathan','c':'','po':{'443':{'s':'HTTPS','v':false},'3000':{'s':'NODE-API','v':true},'8443':{'s':'HTTPS-ALT','v':false}},'f':['/srv/data','/usr/share','/etc/secrets','/var/backup','/home/agent'],'pf':'/etc/secrets/auth.key'},
    'c': {'h':'pitevna','u':'dr_mortis','p':'autopsy2025','c':'','po':{'80':{'s':'HTTP','v':false},'443':{'s':'HTTPS','v':false},'5432':{'s':'PostgreSQL','v':true}},'f':['/var/database','/home/mortis','/usr/local/app','/var/reports','/etc/auth'],'pf':'/etc/auth/users.enc'},
    'd': {'h':'mainblack.gov','u':'agent_k_001','p':'blackops','c':'CLEARANCE-7','po':{'22':{'s':'SSH','v':false},'443':{'s':'HTTPS','v':false},'9000':{'s':'CUSTOM-SVC','v':false},'31337':{'s':'BACKDOOR','v':true}},'f':['/classified','/var/cases','/home/agents','/tmp/cache','/opt/intel','/etc/clearance'],'pf':'/etc/clearance/level7.dat'}
  };
  const _ip = {'a':'192.168.42.10','b':'10.0.13.37','c':'172.16.99.5','d':'198.51.100.42'};
  const targets = {};
  Object.keys(_t).forEach(k => {
    const t = _t[k];
    const ports = {};
    Object.keys(t.po).forEach(p => {
      ports[p] = {service: t.po[p].s, vulnerable: t.po[p].v};
    });
    targets[_ip[k]] = {
      hostname: t.h,
      user: t.u,
      pass: t.p,
      code: t.c,
      ports: ports,
      folders: t.f,
      passwordFile: t.pf
    };
  });

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
  let failedAttempts = 0;
  let lockoutUntil = null;

  function checkLockout() {
    const locked = localStorage.getItem('hacknet_lockout');
    if (locked) {
      const unlockTime = parseInt(locked);
      if (Date.now() < unlockTime) {
        lockoutUntil = unlockTime;
        return true;
      } else {
        localStorage.removeItem('hacknet_lockout');
        lockoutUntil = null;
      }
    }
    return false;
  }

  function triggerLockout() {
    const lockTime = Date.now() + (5 * 60 * 1000); // 5 minutes
    localStorage.setItem('hacknet_lockout', lockTime.toString());
    lockoutUntil = lockTime;
    failedAttempts = 0;
  }

  function openHackConsole() {
    if (gameActive) return;
    
    if (checkLockout()) {
      const remainingMs = lockoutUntil - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      console.log('%c[LOCKOUT] System locked. Remaining time: ' + remainingMin + ' minutes', 'color:#f00;font-weight:bold;');
      alert('SYSTEM LOCKED\n\nIntrusion detected. Access denied.\nLockout expires in ' + remainingMin + ' minutes.');
      return;
    }
    
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

    // Check lockout before processing any command
    if (checkLockout()) {
      const remainingMs = lockoutUntil - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      print('[LOCKOUT] System access denied.');
      print('[LOCKOUT] Intrusion countermeasures active.');
      print('[LOCKOUT] Time remaining: ' + remainingMin + ' minutes.');
      return;
    }

    const parts = cmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch(command) {
      case 'help':
        printManual();
        break;
      case 'manual':
        fetchManual();
        break;
      case 'man':
        fetchManual();
        break;
      case 'try':
        openTry();
        break;
      case 'scan':
        networkScan();
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
    print('  scan');
    print('    Performs network sweep to discover active hosts.');
    print('    Lists all accessible IP addresses on the network.');
    print('    Run this first to find targets.');
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
    print('  reset');
    print('    Clears all progress on current target.');
    print('    Allows starting over from reconnaissance phase.');
    print('');
    print('  clear');
    print('    Clears console output for better visibility.');
    print('');
    print('  manual / man');
    print('    Loads the full hacking manual from `hacking/MANUAL.md` into the console.');
    print('  try');
    print('    Opens the demo site available at /try in a new tab (or navigates current tab if blocked).');
    print('  close / exit');
    print('    Closes the HACKNET console.');
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  // Try to fetch a richer manual from the repository (hacking/MANUAL.md)
  function fetchManual() {
    // Try common candidate locations for the manual so it works when served from /try or root
    const candidates = [
      '../hacking/MANUAL.md',
      '/hacking/MANUAL.md',
      'hacking/MANUAL.md'
    ];

    (function tryNext(i){
      if (i >= candidates.length) {
        print('[INFO] Could not load remote MANUAL.md — showing local quick manual.');
        printManual();
        return;
      }
      const url = candidates[i];
      fetch(url).then(function(res){
        if (!res.ok) throw new Error('not ok');
        return res.text();
      }).then(function(text){
        const lines = text.replace(/\r\n/g,'\n').split('\n');
        print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        print('HACK CONSOLE — Remote Manual (' + url + ')');
        print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        lines.forEach(function(l){ print(l); });
        print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }).catch(function(){
        tryNext(i+1);
      });
    })(0);
  }

  // Open the /try demo site in a new tab (or same window if blocked)
  function openTry() {
    try {
      const w = window.open('/try', '_blank');
      if (w) {
        print('[TRY] Opened /try in a new tab/window.');
        w.focus();
      } else {
        // Popup blocked — navigate current window instead
        print('[TRY] Popup blocked, navigating current tab to /try');
        window.location.href = '/try';
      }
    } catch (e) {
      print('[ERROR] Could not open /try: ' + (e && e.message ? e.message : e));
    }
    print('');
  }

  function networkScan() {
    // Detect which site the user is currently on
    const currentPath = window.location.pathname;
    let currentSiteIP = null;
    let currentHostname = null;
    
    // Map paths to hostnames
    if (currentPath.includes('police.sub') || currentPath.includes('policepub')) {
      currentHostname = 'police.sub';
    } else if (currentPath.includes('leviathan')) {
      currentHostname = 'leviathan.cult';
    } else if (currentPath.includes('pitevna')) {
      currentHostname = 'pitevna';
    } else if (currentPath.includes('mainblack') || currentPath.includes('Mainblack')) {
      currentHostname = 'mainblack.gov';
    }
    
    // Find the IP for the current hostname
    if (currentHostname) {
      for (const [ip, data] of Object.entries(targets)) {
        if (data.hostname === currentHostname) {
          currentSiteIP = ip;
          break;
        }
      }
    }
    
    if (!currentSiteIP) {
      print('[ERROR] No network interface detected on this host.');
      print('[INFO] Scan command not available from this location.');
      print('');
      return;
    }
    
    print('[SCAN] Initiating network sweep...');
    print('[SCAN] Scanning local subnet ranges...');
    
    setTimeout(() => {
      print('[SCAN] Host found: ' + currentSiteIP + ' (' + currentHostname + ')');
    }, 800);
    
    setTimeout(() => {
      print('[SCAN] Network sweep complete.');
      print('[SCAN] Found 1 active host(s).');
      print('[INFO] Use "nmap <IP>" to scan individual hosts.');
      print('');
    }, 1400);
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
        failedAttempts++;
        print('[ERROR] Directory not found: ' + folder);
        print('[WARNING] Invalid access attempt logged. (' + failedAttempts + '/3)');
        if (failedAttempts >= 3) {
          print('');
          print('[ALERT] Multiple failed attempts detected!');
          print('[ALERT] Intrusion countermeasures activated!');
          print('[ALERT] System locked for 5 minutes.');
          triggerLockout();
          setTimeout(() => closeHackConsole(), 2000);
          return;
        }
      }
    } else {
      const newPath = currentFolder === '/' ? '/' + folder : currentFolder + '/' + folder;
      if (targetData.folders.includes(newPath)) {
        currentFolder = newPath;
        print('[CD] Changed to ' + newPath);
      } else {
        failedAttempts++;
        print('[ERROR] Directory not found: ' + folder);
        print('[WARNING] Invalid access attempt logged. (' + failedAttempts + '/3)');
        if (failedAttempts >= 3) {
          print('');
          print('[ALERT] Multiple failed attempts detected!');
          print('[ALERT] Intrusion countermeasures activated!');
          print('[ALERT] System locked for 5 minutes.');
          triggerLockout();
          setTimeout(() => closeHackConsole(), 2000);
          return;
        }
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
      failedAttempts++;
      print('[ERROR] File not found: ' + filename);
      print('[WARNING] Invalid access attempt logged. (' + failedAttempts + '/3)');
      if (failedAttempts >= 3) {
        print('');
        print('[ALERT] Multiple failed attempts detected!');
        print('[ALERT] Intrusion countermeasures activated!');
        print('[ALERT] System locked for 5 minutes.');
        triggerLockout();
        setTimeout(() => closeHackConsole(), 2000);
        return;
      }
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

  function resetProgress() {
    currentTarget = null;
    scannedPorts = [];
    selectedPort = null;
    breached = false;
    currentFolder = null;
    failedAttempts = 0;
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
