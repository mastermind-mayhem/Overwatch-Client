// rankings.js - Rankings page script (continued)
class OverwatchRankings {
    constructor() {
        this.form = document.getElementById('rankingForm');
        this.categories = ['autoRankings', 'coralRankings', 'algaeRankings', 'driverRankings', 'endRankings'];
        this.matchData = JSON.parse(sessionStorage.getItem('matchData') || '{}');
        this.eventData = JSON.parse(sessionStorage.getItem('eventData') || '{}');
        this.rankings = JSON.parse(localStorage.getItem('rankings') || '[]');
        
        this.initializeEventListeners();
        this.displayMatchInfo();
        this.setupRankingGrids();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    displayMatchInfo() {
        document.getElementById('matchDisplay').textContent = 
            `Match #: ${this.matchData.matchNumber || '?'}`;
        document.getElementById('typeDisplay').textContent = 
            `Type: ${this.matchData.matchType || '?'}`;
    }

    setupRankingGrids() {
        if (!this.matchData.teams) {
            window.location.href = '/';
            return;
        }

        this.categories.forEach(categoryId => {
            const container = document.getElementById(categoryId);
            container.innerHTML = '';
            
            // Create ranking items for all teams
            [...this.matchData.teams.red, ...this.matchData.teams.blue].forEach((teamNumber, index) => {
                const rankingItem = document.createElement('div');
                rankingItem.className = `ranking-item ${index < 3 ? 'red-team' : 'blue-team'}`;
                
                const teamDisplay = document.createElement('div');
                teamDisplay.className = 'team-number';
                teamDisplay.textContent = `Team ${teamNumber}`;
                var style = window.getComputedStyle(document.body)
                teamDisplay.style.backgroundColor = index < 3 ? style.getPropertyValue('--blue-alliance') : style.getPropertyValue('--red-alliance');
                
                const rankSelect = document.createElement('select');
                rankSelect.className = 'rank-select';
                rankSelect.dataset.team = teamNumber;
                rankSelect.innerHTML = `
                    <option value="">Rank</option>
                    ${[1, 2, 3].map(n => 
                        `<option value="${n}">${n}</option>`
                    ).join('')}
                `;
                
                rankSelect.addEventListener('change', () => this.validateRankSelection(categoryId));
                
                rankingItem.appendChild(teamDisplay);
                rankingItem.appendChild(rankSelect);
                container.appendChild(rankingItem);
            });
        });
    }

    validateRankSelection(categoryId) {
        const selects = document.querySelectorAll(`#${categoryId} select`);
        const blueSelectedRanks = new Set();
        const redSelectedRanks = new Set();
        
        selects.forEach((select, index) => {
            if (index < 3) {
                if (select.value) {
                    if (redSelectedRanks.has(select.value)) {
                        select.value = '';
                        alert('Each rank can only be used once per category');
                    } else {
                        redSelectedRanks.add(select.value);
                    }
                }
            } else {
                if (select.value) {
                    if (blueSelectedRanks.has(select.value)) {
                        select.value = '';
                        alert('Each rank can only be used once per category');
                    } else {
                        blueSelectedRanks.add(select.value);
                    }
                }
            }
        });
    }

    collectRankings() {
        const rankings = {};
        
        this.categories.forEach(categoryId => {
            const selects = document.querySelectorAll(`#${categoryId} select`);
            selects.forEach(select => {
                const teamNumber = select.dataset.team;
                if (!rankings[teamNumber]) {
                    rankings[teamNumber] = {};
                }
                rankings[teamNumber][categoryId.replace('Rankings', '')] = parseInt(select.value) || 0;
            });
        });
        
        return rankings;
    }

    validateAllRankings() {
        for (const categoryId of this.categories) {
            const selects = document.querySelectorAll(`#${categoryId} select`);
            const blueSelectedRanks = new Set();
            const redSelectedRanks = new Set();
            
            selects.forEach((select, index) => {
                if (!select.value) return false;
                if (index < 3) {
                    if (select.value) {
                        if (redSelectedRanks.has(select.value)) {
                            return false;
                        } else {
                            redSelectedRanks.add(select.value);
                        }
                    }
                } else {
                    if (select.value) {
                        if (blueSelectedRanks.has(select.value)) {
                            return false;
                        } else {
                            blueSelectedRanks.add(select.value);
                        }
                    }
                }
            });
            
        }
        return true;
    }

    handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateAllRankings()) {
            alert('Please ensure all teams are ranked uniquely (1-6) in each category');
            return;
        }

        const matchRankings = {
            matchNumber: this.matchData.matchNumber,
            matchType: this.matchData.matchType,
            timestamp: new Date().toISOString(),
            rankings: this.collectRankings(),
            notes: document.getElementById('notes').value
        };

        // Save to local storage
        sessionStorage.removeItem('matchData');

        // Convert JSON object to a string
        const jsonString = JSON.stringify(matchRankings, null, 2);

        // Create a Blob containing the JSON data
        const blob = new Blob([jsonString], { type: "application/json" });

        // Create a temporary link element
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = this.eventData.event.first_event_code+_match+this.matchData.matchNumber+".json";  // Filename

        // Append to the DOM, trigger download, and remove the element
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // window.location.href = '/';
    }
}

// Initialize rankings page
document.addEventListener('DOMContentLoaded', () => {
    window.overwatchRankings = new OverwatchRankings();
});