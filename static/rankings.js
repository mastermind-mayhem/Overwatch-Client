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

            // do this twice. once for red and once for blue
            for (let i = 0; i < 2; i++) {
                const table = document.createElement('table');
                const headerRow = table.insertRow();
                headerRow.insertCell().textContent = ""; //Empty cell for rank

                // Add team headers
                let teams = this.matchData.teams.red;
                let alliance = "red";
                if (i == 1) {
                    teams = this.matchData.teams.blue;
                    alliance = "blue";
                }
                [...teams].forEach((teamNumber, index) => {
                    const headerCell = headerRow.insertCell();
                    headerCell.textContent = `Team ${teamNumber}`;
                    var style = window.getComputedStyle(document.body)
                    headerCell.style.backgroundColor = style.getPropertyValue(`--${alliance}-alliance`);
                });

                // Add rank rows with radio buttons
                [1, 2, 3].forEach(rank => {
                    const row = table.insertRow();
                    const rankCell = row.insertCell();
                    rankCell.textContent = `${rank}st`;


                    [...teams].forEach((teamNumber, index) => {
                        const cell = row.insertCell();
                        const radio = document.createElement('input');
                        radio.type = 'radio';
                        radio.name = `${categoryId}-${alliance}-${rank}`;
                        radio.value = teamNumber;
                        radio.dataset.rank = rank;
                        radio.dataset.category = categoryId;
                        radio.dataset.alliance = alliance;
                        cell.addEventListener('click', () => {
                            radio.checked = true;
                        });
                        cell.appendChild(radio);
                    });
                });
                container.appendChild(table);
            }
        });
    }

    collectRankings() {
        const rankings = {};
        this.categories.forEach(categoryId => {
            const radios = document.querySelectorAll(`input[data-category="${categoryId}"]`);
            radios.forEach(radio => {
                if (radio.checked) {
                    const teamNumber = radio.value;
                    const rank = parseInt(radio.dataset.rank);
                    if (!rankings[teamNumber]) {
                        rankings[teamNumber] = {};
                    }
                    rankings[teamNumber][categoryId.replace('Rankings', '')] = rank;
                }
            });
        });
        return rankings;
    }

    validateAllRankings() {
        for (const categoryId of this.categories) {
            const radios = document.querySelectorAll(`input[data-category="${categoryId}"]`);
            const selectedRanks = new Set();
            let count = 0; //check if 3 ranks are selected
            radios.forEach(radio => {
                if (radio.checked) {
                    count++;
                    selectedRanks.add(radio.dataset.rank);
                }
            });
            if(count != 6) return false;
        }
        return true;
    }

    handleSubmit(e) {
        e.preventDefault();

        if (!this.validateAllRankings()) {
            alert('Please ensure all teams are ranked uniquely (1-3) in each category');
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
        a.download = this.eventData.event.first_event_code + "_match" + this.matchData.matchNumber + ".json";  // Filename

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
