
Console Manual (open inside the HACKNET console)
------------------------------------------------
You can open the interactive hacking console by invoking the global `hack()` function in the browser console or by loading pages that include the `hacknet.js` script and using the UI it provides.

- **Open manual**: Type `manual` (or `help`) inside the HACKNET console to view the full manual. The console will attempt to fetch this `hacking/MANUAL.md` and display it; if that fails it will show the built-in quick manual.

- **Common commands**:
  - `scan` — Performs a network sweep to discover active hosts on the local site.
  - `nmap <nameofsite.html>` — Port-scan a discovered host.
  - `connect <port>` — Connect to a specific open port from the last `nmap`.
  - `exploit` — Attempt to exploit the currently connected service (if vulnerable).
  - `ls` — List files in the current directory (available after a successful exploit).
  - `cd <folder>` — Change directory.
  - `cat <filename>` — Display the contents of a file.
  - `crack <file>` — Attempt to decrypt a password/encrypted file.
  - `reset` — Reset console progress for the current target.
  - `clear` — Clear console output.
  - `close` or `exit` — Close the HACKNET console.

Notes:
- The console prints warnings on repeated failed attempts and can temporarily lock access 
