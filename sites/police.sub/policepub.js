document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginScreen = document.getElementById('loginScreen');
    const mainSystem = document.getElementById('mainSystem');
    const loginError = document.getElementById('loginError');
    const searchButton = document.getElementById('searchButton');
    const logoutBtn = document.getElementById('logoutBtn');
    const systemTime = document.getElementById('systemTime');
    const activityLog = document.getElementById('activityLog');

    // Cases are now provided as downloadable documents; keep inline list empty
    const cases = [];

    // Handle login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const officerId = document.getElementById('officerId').value;
            const password = document.getElementById('password').value;
            const securityCode = document.getElementById('securityCode').value;

            // Validate credentials from hacknet
            if (officerId === 'officer_id_12345' && password === 'securepass123' && securityCode === 'CODE-ALPHA') {
                // Log successful login
                console.log('[SYSTEM] Login attempt - SUCCESS');
                console.log(`[SYSTEM] Officer ID: ${officerId}`);
                
                loginScreen.style.display = 'none';
                mainSystem.style.display = 'block';
                
                // Set officer ID in display
                document.getElementById('displayOfficerId').textContent = officerId;
                
                // Load cases (none inline) and available documents
                displayCases();
                loadDocuments();

                // Add login activity
                addActivity(`Officer ${officerId} logged in`);
                
            } else {
                loginError.style.display = 'block';
                loginError.textContent = '*** ACCESS DENIED *** All fields required';
                console.log('[SYSTEM] Login attempt - FAILED');
                
                setTimeout(() => {
                    loginError.style.display = 'none';
                }, 3000);
            }
        });
    }

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginScreen.style.display = 'block';
            mainSystem.style.display = 'none';
            loginForm.reset();
            console.log('[SYSTEM] User logged out');
        });
    }

    // Display cases
    function displayCases() {
        const caseList = document.getElementById('caseList');
        
        caseList.innerHTML = cases.map(caseItem => {
            return `
                <div class="case-item" data-case-id="${caseItem.id}">
                    <div style="margin-bottom:5px;">
                        <strong style="color:#00ffff;">[CASE #${caseItem.id}]</strong>
                        <span style="float:right;color:#ffaa00;">${caseItem.date}</span>
                    </div>
                    <h3 style="margin:5px 0;color:#00ff00;">${caseItem.title}</h3>
                    <div style="font-size:11px;color:#cccccc;margin:5px 0;">
                        Type: ${caseItem.type} | Location: ${caseItem.location} | Officer: ${caseItem.officer}
                    </div>
                    <div style="margin:10px 0;">
                        <span class="case-status-${caseItem.status.toLowerCase()}">${caseItem.status}</span>
                        <span class="case-priority-${caseItem.priority.toLowerCase()}">${caseItem.priority} PRIORITY</span>
                    </div>
                    <button class="btn" onclick="viewCaseDetails('${caseItem.id}')" style="margin-top:5px;">VIEW DETAILS</button>
                </div>
            `;
        }).join('');
    }

    // View case details (global function)
    window.viewCaseDetails = function(caseId) {
        const caseItem = cases.find(c => c.id === caseId);
        if (!caseItem) return;

        const modal = document.getElementById('caseDetailModal');
        const title = document.getElementById('caseDetailTitle');
        const content = document.getElementById('caseDetailContent');

        title.textContent = `CASE #${caseItem.id} - ${caseItem.title}`;
        
        content.innerHTML = `
            <div style="background:#0a0a0a;padding:15px;border:1px solid #003366;margin-bottom:15px;">
                <table width="100%" style="color:#00ff00;">
                    <tr><td width="150"><strong>Case Number:</strong></td><td>${caseItem.id}</td></tr>
                    <tr><td><strong>Type:</strong></td><td>${caseItem.type}</td></tr>
                    <tr><td><strong>Status:</strong></td><td><span class="case-status-${caseItem.status.toLowerCase()}">${caseItem.status}</span></td></tr>
                    <tr><td><strong>Priority:</strong></td><td><span class="case-priority-${caseItem.priority.toLowerCase()}">${caseItem.priority}</span></td></tr>
                    <tr><td><strong>Date Opened:</strong></td><td>${caseItem.date}</td></tr>
                    <tr><td><strong>Location:</strong></td><td>${caseItem.location}</td></tr>
                    <tr><td><strong>Assigned Officer:</strong></td><td>${caseItem.officer}</td></tr>
                </table>
            </div>

            <div style="background:#0a0a0a;padding:15px;border:1px solid #003366;margin-bottom:15px;">
                <h3 style="color:#00ffff;margin-top:0;">DESCRIPTION</h3>
                <p style="color:#cccccc;">${caseItem.description}</p>
            </div>

            <div style="background:#0a0a0a;padding:15px;border:1px solid #003366;margin-bottom:15px;">
                <h3 style="color:#00ffff;margin-top:0;">EVIDENCE</h3>
                <ul style="color:#cccccc;">
                    ${caseItem.evidence.map(e => `<li>${e}</li>`).join('')}
                </ul>
            </div>

            <div style="background:#0a0a0a;padding:15px;border:1px solid #003366;margin-bottom:15px;">
                <h3 style="color:#00ffff;margin-top:0;">SUSPECTS</h3>
                <ul style="color:#cccccc;">
                    ${caseItem.suspects.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>

            <div style="background:#0a0a0a;padding:15px;border:1px solid #003366;margin-bottom:15px;">
                <h3 style="color:#00ffff;margin-top:0;">TIMELINE</h3>
                <ul style="color:#cccccc;">
                    ${caseItem.timeline.map(t => `<li>${t}</li>`).join('')}
                </ul>
            </div>

            <div style="background:#330000;padding:15px;border:1px solid #cc0000;">
                <h3 style="color:#ffaa00;margin-top:0;">CASE NOTES</h3>
                <p style="color:#ffff00;">${caseItem.notes}</p>
            </div>
        `;

        modal.style.display = 'block';
        addActivity(`Case #${caseId} accessed`);
    };

    // Search functionality
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') performSearch();
            });
        }
    }

    function performSearch() {
        const query = document.getElementById('searchInput').value.trim().toLowerCase();
        const searchResults = document.getElementById('searchResults');
        
        if (!query) {
            searchResults.innerHTML = '<p style="color:#ff0000;">*** ERROR: SEARCH QUERY REQUIRED ***</p>';
            return;
        }

        const results = cases.filter(c =>
            c.id.toLowerCase().includes(query) ||
            c.title.toLowerCase().includes(query) ||
            c.type.toLowerCase().includes(query) ||
            c.location.toLowerCase().includes(query) ||
            c.officer.toLowerCase().includes(query) ||
            c.description.toLowerCase().includes(query)
        );

        if (results.length > 0) {
            searchResults.innerHTML = `
                <p style="color:#00ff00;">*** ${results.length} RECORD(S) FOUND ***</p>
                ${results.map(r => `
                    <div class="result-item" style="margin:10px 0;">
                        <strong style="color:#00ffff;">[CASE #${r.id}] ${r.title}</strong><br>
                        <span style="color:#cccccc;font-size:11px;">${r.type} | ${r.location} | ${r.date}</span><br>
                        <button class="btn" onclick="viewCaseDetails('${r.id}')" style="margin-top:5px;">VIEW DETAILS</button>
                    </div>
                `).join('')}
            `;
            addActivity(`Database search: "${query}"`);
        } else {
            searchResults.innerHTML = '<p style="color:#ffaa00;">*** NO RECORDS MATCH SEARCH CRITERIA ***</p>';
        }
    }

    // Update system time
    function updateSystemTime() {
        if (!systemTime) return;
        const now = new Date();
        const timeStr = now.toLocaleString('en-US', { 
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        systemTime.innerHTML = `<strong>SYSTEM TIME:</strong><br>${timeStr}<br>GMT-0500`;
    }

    // Add activity to log
    function addActivity(message) {
        console.log(`[ACTIVITY] ${message}`);
        try {
            const activityLogEl = document.getElementById('activityLog');
            if (activityLogEl) {
                const entry = document.createElement('div');
                entry.textContent = `${new Date().toLocaleString()} - ${message}`;
                entry.style.color = '#cccccc';
                activityLogEl.prepend(entry);
            }
        } catch (e) {
            // ignore
        }
    }

    // Load documents metadata from the docs folder and render download links
    function loadDocuments() {
        const docsList = document.getElementById('docsList');
        if (!docsList) return;

        fetch('docs/documents.json')
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(list => {
                if (!Array.isArray(list) || list.length === 0) {
                    docsList.innerHTML = '<p style="color:#ffaa00;">No documents available.</p>';
                    return;
                }

                docsList.innerHTML = list.map(d => {
                    const title = d.title || d.filename || 'Document';
                    const desc = d.description ? `<div style="color:#cccccc;font-size:12px;margin-top:4px;">${d.description}</div>` : '';
                    const file = d.filename;
                    return `
                        <div class="doc-item" style="margin-bottom:10px;padding:8px;border:1px solid #003366;background:#070707;">
                            <strong style="color:#00ffff;">${title}</strong>
                            <div style="color:#cccccc;font-size:12px;">${d.id || ''}</div>
                            ${desc}
                            <div style="margin-top:8px;"><a class="btn" href="docs/${file}" download onclick="try{addActivity('Downloaded ${file}');}catch(e){}">DOWNLOAD</a></div>
                        </div>
                    `;
                }).join('');
            })
            .catch(err => {
                docsList.innerHTML = '<p style="color:#ff0000;">Error loading documents</p>';
                console.error('Error loading documents.json', err);
            });
    }

    // Initialize
    updateSystemTime();
    setInterval(updateSystemTime, 1000);

    // System logging
    console.log('*** CLASSIFIED SYSTEM INITIALIZED ***');
    console.log('Security Level: RESTRICTED');
    console.log('All activity is monitored and logged');
    console.log('Unauthorized access will be prosecuted');
});
