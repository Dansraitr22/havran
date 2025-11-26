document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginScreen = document.getElementById('loginScreen');
    const mainSystem = document.getElementById('mainSystem');
    const loginError = document.getElementById('loginError');
    const searchButton = document.getElementById('searchButton');
    const logoutBtn = document.getElementById('logoutBtn');
    const systemTime = document.getElementById('systemTime');
    const activityLog = document.getElementById('activityLog');

    // Case database with detailed information
    const cases = [
        {
            id: "8821",
            title: "ORGANIZED CRIME RING",
            type: "ORGANIZED CRIME",
            status: "ACTIVE",
            priority: "HIGH",
            date: "2025-11-13",
            location: "DOWNTOWN DISTRICT",
            officer: "DET. JOHNSON",
            description: "Multi-agency investigation into suspected trafficking network operating in the downtown district.",
            evidence: [
                "Surveillance footage from 5 locations",
                "Financial records - Bank transfers",
                "Witness statements (3 individuals)",
                "Phone records - 15 suspects"
            ],
            suspects: [
                "REDACTED - Primary suspect, male, 45",
                "REDACTED - Associate, female, 32",
                "REDACTED - Driver, male, 28"
            ],
            timeline: [
                "2025-10-01: Initial tip received",
                "2025-10-15: Surveillance initiated",
                "2025-11-01: Search warrant obtained",
                "2025-11-13: Active monitoring"
            ],
            notes: "Case requires coordination with federal agencies. Maintain strict operational security."
        },
        {
            id: "8819",
            title: "NARCOTICS OPERATION",
            type: "NARCOTICS",
            status: "ACTIVE",
            priority: "HIGH",
            date: "2025-11-12",
            location: "SECTOR 7-B",
            officer: "DET. MARTINEZ",
            description: "Undercover operation targeting drug distribution network. Multiple assets deployed.",
            evidence: [
                "Undercover recordings",
                "Product samples - Lab analysis pending",
                "Transaction records",
                "Location surveillance"
            ],
            suspects: [
                "SUSPECT-A: Male, 38, known dealer",
                "SUSPECT-B: Male, 25, distributor",
                "SUSPECT-C: Female, 30, courier"
            ],
            timeline: [
                "2025-09-20: Investigation opened",
                "2025-10-10: Undercover insertion",
                "2025-11-05: First controlled buy",
                "2025-11-12: Ongoing operations"
            ],
            notes: "DO NOT APPROACH without backup. Suspects considered armed and dangerous."
        },
        {
            id: "8815",
            title: "VEHICLE THEFT RING",
            type: "THEFT",
            status: "INVESTIGATION",
            priority: "MEDIUM",
            date: "2025-11-11",
            location: "PARKING DISTRICT 3",
            officer: "DET. CHEN",
            description: "Series of vehicle thefts. Pattern identified across 3 districts.",
            evidence: [
                "CCTV footage - 8 incidents",
                "Vehicle descriptions and VINs",
                "Witness descriptions",
                "GPS tracking data (2 vehicles recovered)"
            ],
            suspects: [
                "Unknown male, approx 30-35 years",
                "Possible accomplice - vehicle make/model identified"
            ],
            timeline: [
                "2025-10-15: First theft reported",
                "2025-10-28: Pattern identified",
                "2025-11-03: Task force assembled",
                "2025-11-11: Ongoing investigation"
            ],
            notes: "Suspects appear to target high-end vehicles. Increase patrols in affected areas."
        },
        {
            id: "8812",
            title: "BURGLARY SERIES",
            type: "BURGLARY",
            status: "ACTIVE",
            priority: "MEDIUM",
            date: "2025-11-10",
            location: "RESIDENTIAL ZONE 3",
            officer: "DET. WILLIAMS",
            description: "Pattern of residential burglaries. 7 incidents in past 3 weeks. Similar MO.",
            evidence: [
                "Fingerprints - Partial match in system",
                "Forced entry points photographed",
                "Stolen items list",
                "Neighborhood canvas results"
            ],
            suspects: [
                "Possible match: Known offender, male, 42",
                "DNA sample collected - Analysis pending"
            ],
            timeline: [
                "2025-10-20: First incident",
                "2025-10-25: Second incident",
                "2025-11-01: Pattern recognized",
                "2025-11-10: Forensics processing"
            ],
            notes: "Entry method consistent - rear window access. Recommend security awareness campaign."
        },
        {
            id: "8807",
            title: "FRAUD INVESTIGATION",
            type: "FRAUD",
            status: "REVIEW",
            priority: "LOW",
            date: "2025-11-08",
            location: "FINANCIAL DISTRICT",
            officer: "DET. ANDERSON",
            description: "Financial fraud investigation. Elderly victims targeted. Total loss: $125,000.",
            evidence: [
                "Bank statements and wire transfers",
                "Phone records from victims",
                "Email correspondence",
                "IP address traces"
            ],
            suspects: [
                "Unknown - Operating from overseas location",
                "Multiple phone numbers identified"
            ],
            timeline: [
                "2025-10-01: First victim report",
                "2025-10-15: Additional victims identified",
                "2025-10-25: Federal agencies contacted",
                "2025-11-08: Evidence compilation"
            ],
            notes: "International cooperation required. Victims require support services."
        },
        {
            id: "8801",
            title: "ASSAULT CASE",
            type: "ASSAULT",
            status: "CLOSED",
            priority: "LOW",
            date: "2025-11-05",
            location: "BAR DISTRICT",
            officer: "DET. THOMPSON",
            description: "Assault case - Suspect identified and arrested. Case closed pending prosecution.",
            evidence: [
                "Witness statements (4 individuals)",
                "Bar security footage",
                "Medical reports",
                "Arrest report"
            ],
            suspects: [
                "ARRESTED: Male, 28, charged with assault"
            ],
            timeline: [
                "2025-11-01: Incident occurred",
                "2025-11-02: Suspect identified",
                "2025-11-03: Arrest made",
                "2025-11-05: Case closed"
            ],
            notes: "Case forwarded to prosecutor. Victim recovering."
        }
    ];

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
                
                // Load cases
                displayCases();
                
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
        // Activity logging disabled (RECENT ACTIVITY panel removed)
        return;
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
