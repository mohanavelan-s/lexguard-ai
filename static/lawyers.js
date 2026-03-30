// ==========================================
// 1. SMART DATA (Indian Advocates Mock DB)
// ==========================================
const lawyers = [
    { 
        name: "Adv. Rajesh Kumar", 
        spec: "Criminal Defense", 
        city: "Chennai", 
        fees: "₹5,000", 
        exp: "15 Yrs",
        cases: 342,
        match: 65, // Base score
        tags: ["arrest", "police", "bail", "jail", "theft", "murder", "station", "fir", "criminal"], 
        img: "static/images/lawyer1.jpg" 
    },
    { 
        name: "Adv. Priya Sharma", 
        spec: "Divorce & Family", 
        city: "Delhi", 
        fees: "₹4,500", 
        exp: "12 Yrs",
        cases: 210,
        match: 60, 
        tags: ["marriage", "wife", "husband", "custody", "alimony", "divorce", "dowry", "family", "child"], 
        img: "static/images/lawyer2.jpg" 
    },
    { 
        name: "Adv. Vikram Singh", 
        spec: "Property Dispute", 
        city: "Mumbai", 
        fees: "₹8,000", 
        exp: "20 Yrs",
        cases: 500,
        match: 55, 
        tags: ["land", "rent", "tenant", "eviction", "flat", "house", "property", "agreement", "real estate"], 
        img: "static/images/lawyer3.jpg" 
    },
    { 
        name: "Adv. Anand", 
        spec: "Cyber Crime", 
        city: "Bangalore", 
        fees: "₹7,000", 
        exp: "8 Yrs",
        cases: 150,
        match: 70, 
        tags: ["fraud", "online", "hack", "data", "bank", "money", "scam", "cyber", "internet"], 
        img: "static/images/lawyer4.avif" 
    },
    { 
        name: "Adv. Suresh Menon", 
        spec: "Corporate Law", 
        city: "Chennai", 
        fees: "₹15,000", 
        exp: "22 Yrs",
        cases: 600,
        match: 50, 
        tags: ["company", "startup", "tax", "contract", "business", "gst", "corporate", "merger"], 
        img: "static/images/lawyer5.jpeg" 
    },
    { 
        name: "Adv. Muthu Reddy", 
        spec: "Civil Rights", 
        city: "Hyderabad", 
        fees: "₹4,000", 
        exp: "10 Yrs",
        cases: 180,
        match: 68, 
        tags: ["neighbor", "defamation", "consumer", "rights", "civil", "fight", "harass"], 
        img: "static/images/lawyer6.jpeg" 
    }
];

const grid = document.getElementById("lawyersGrid");

// ==========================================
// 2. RENDER FUNCTION (Generates Cards)
// ==========================================
function renderLawyers(data) {
    grid.innerHTML = "";

    if (data.length === 0) {
        grid.innerHTML = `<p style="text-align:center; width:100%; color:#888;">No lawyers found matching your criteria.</p>`;
        return;
    }

    data.forEach((lawyer, index) => {
        // Dynamic Color Logic based on Match Score
        let matchColor = "#ffaa00"; // Orange (Low)
        if (lawyer.match > 75) matchColor = "#00c6ff"; // Blue (Medium)
        if (lawyer.match > 90) matchColor = "#00ff88"; // Green (High)

        const card = document.createElement("div");
        card.className = "card";
        // Staggered Animation
        card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
        card.style.opacity = "0"; 

        card.innerHTML = `
            <div class="verified-badge">✔ VERIFIED</div>
            <div class="card-header">
                <img src="${lawyer.img}" class="avatar" alt="Lawyer">
                <div class="info">
                    <h3>${lawyer.name}</h3>
                    <p>${lawyer.spec} • ${lawyer.city}</p>
                </div>
            </div>

            <div class="match-section">
                <div class="match-label">
                    <span>AI Match Score</span>
                    <span style="color:${matchColor}; font-weight:800;">${lawyer.match}%</span>
                </div>
                <div class="progress-bg">
                    <div class="progress-fill" style="width: ${lawyer.match}%; background: ${matchColor}; box-shadow: 0 0 10px ${matchColor};"></div>
                </div>
            </div>

            <div class="stats">
                <div class="stat-item">
                    <span class="stat-val">${lawyer.cases}</span>
                    <span class="stat-label">Cases</span>
                </div>
                <div class="stat-item">
                    <span class="stat-val">${lawyer.exp}</span>
                    <span class="stat-label">Exp</span>
                </div>
                <div class="stat-item">
                    <span class="stat-val">${lawyer.fees}</span>
                    <span class="stat-label">Per Day</span>
                </div>
            </div>

            <button class="check-btn" onclick="contactLawyer('${lawyer.name}')">Book Consultation</button>
        `;

        grid.appendChild(card);
    });
}

// ==========================================
// 3. 🔥 THE INNOVATIVE AI ENGINE
// ==========================================
function calculateAIMatch() {
    const userInput = document.getElementById("caseInput").value.toLowerCase();
    const indicator = document.getElementById("aiThinking");

    // 1. Show "Thinking" animation
    if (userInput.length > 3) {
        indicator.style.opacity = "1";
    } else {
        indicator.style.opacity = "0";
    }

    // 2. Score Calculation Loop
    lawyers.forEach(lawyer => {
        let baseScore = 50; // Everyone starts at 50%
        let boost = 0;

        // A. Keyword Matching (The Brain)
        lawyer.tags.forEach(tag => {
            if (userInput.includes(tag)) {
                boost += 15; // Huge boost if keyword found
            }
        });

        // B. Specialization Matching
        if (userInput.includes(lawyer.spec.toLowerCase().split(" ")[0])) {
            boost += 20;
        }

        // C. City Matching (Context awareness)
        if (userInput.includes(lawyer.city.toLowerCase())) {
            boost += 10;
        }

        // Apply Boost & Cap at 99%
        lawyer.match = Math.min(baseScore + boost, 99);
    });

    // 3. Sort Data (Highest Match First)
    const sortedLawyers = [...lawyers].sort((a, b) => b.match - a.match);

    // 4. Re-render Grid
    renderLawyers(sortedLawyers);
}

// ==========================================
// 4. TRADITIONAL FILTER LOGIC
// ==========================================
function findLawyers() {
    const cityInput = document.getElementById("cityInput").value.toLowerCase().trim();
    const specInput = document.getElementById("specInput").value;

    const filtered = lawyers.filter(l => {
        // Logic: (Match City OR City Empty) AND (Match Spec OR Spec Empty)
        const matchesCity = cityInput === "" || l.city.toLowerCase().includes(cityInput);
        const matchesSpec = specInput === "" || l.spec.includes(specInput); 
        return matchesCity && matchesSpec;
    });

    renderLawyers(filtered);
}

function contactLawyer(name) {
    alert(`Request sent to ${name}. They will review your case and contact you shortly.`);
}

// ==========================================
// 5. INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Inject Keyframe for FadeIn
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);

    // Sort by default match score initially
    const initialSort = [...lawyers].sort((a, b) => b.match - a.match);
    renderLawyers(initialSort);
});