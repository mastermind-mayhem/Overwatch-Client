// rankings.js - Rankings page script (continued)
class OverwatchRankings {
    constructor() {
        this.form = document.getElementById('rankingForm');
        this.categories = ['autoRankings', 'teleopRankings', 'defenseRankings'];
        this.matchData = JSON.parse(sessionStorage.getItem('matchData') || '{}');
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
                
                const rankSelect = document.createElement('select');
                rankSelect.className = 'rank-select';
                rankSelect.dataset.team = teamNumber;
                rankSelect.innerHTML = `
                    <option value="">Rank</option>
                    ${[1, 2, 3, 4, 5, 6].map(n => 
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
        const selectedRanks = new Set();
        
        selects.forEach(select => {
            if (select.value) {
                if (selectedRanks.has(select.value)) {
                    select.value = '';
                    alert('Each rank can only be used once per category');
                } else {
                    selectedRanks.add(select.value);
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
            const selectedRanks = new Set();
            
            for (const select of selects) {
                if (!select.value) return false;
                if (selectedRanks.has(select.value)) return false;
                selectedRanks.add(select.value);
            }
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
        this.rankings.push(matchRankings);
        localStorage.setItem('rankings', JSON.stringify(this.rankings));

        // Clear session storage
        sessionStorage.removeItem('matchData');

        // Return to home page
        alert('Rankings saved successfully!');
        window.location.href = '/';
    }

    exportRankings() {
        const csv = this.convertRankingsToCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'overwatch_rankings.csv';
        a.click();
    }

    convertRankingsToCSV() {
        const headers = ['Match', 'Type', 'Team', 'Auto', 'Teleop', 'Defense', 'Notes', 'Timestamp'];
        const rows = this.rankings.flatMap(match => 
            Object.entries(match.rankings).map(([team, ranks]) => [
                match.matchNumber,
                match.matchType,
                team,
                ranks.auto,
                ranks.teleop,
                ranks.defense,
                match.notes.replace(/,/g, ';'),
                match.timestamp
            ])
        );
        
        return [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
    }
}

// Initialize rankings page
document.addEventListener('DOMContentLoaded', () => {
    window.overwatchRankings = new OverwatchRankings();
});