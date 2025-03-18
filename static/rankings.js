// rankings.js - Rankings page script (continued)
class OverwatchRankings {
    constructor() {
        this.form = document.getElementById('rankingForm');
        this.categories = ['autoRankings', 'coralRankings', 'algaeRankings', 'driverRankings', 'endRankings'];
        this.matchData = JSON.parse(sessionStorage.getItem('matchData') || '{}');
        this.eventData = JSON.parse(sessionStorage.getItem('eventData') || '{}');

        if (!this.matchData.teams) {
            window.location.href = '/';
            return;
        }

        this.initializeEventListeners();
        this.displayMatchInfo();
        this.setupTeamNotesField();
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

    setupTeamNotesField() {
        const table = document.createElement('table');
        const headerRow = table.insertRow();
        headerRow.insertCell().textContent = "Team";
        headerRow.insertCell().textContent = "Alliance";
        headerRow.insertCell().textContent = "Notes";

        const container = document.getElementById(`team-notes`);
        container.innerHTML = '';
        [...this.matchData.teams.red, ...this.matchData.teams.blue].forEach((teamNumber, index) => {
            let alliance = "red";
            if (index > 2) {
                alliance = "blue";
            }

            const row = table.insertRow();
            row.insertCell().textContent = teamNumber;
            row.insertCell().textContent = alliance;

            const notesCell = row.insertCell();
            const notesInput = document.createElement('input');
            notesInput.type = 'text';
            notesInput.dataset.notes = teamNumber;
            notesInput.placeholder = 'Enter notes here';
            notesInput.value = '';
            notesCell.appendChild(notesInput);
            var style = window.getComputedStyle(document.body)
            notesCell.style.backgroundColor = style.getPropertyValue(`--${alliance}-alliance`);
        });
        container.appendChild(table);
    }

    setupRankingGrids() {
        this.categories.forEach(categoryId => {
            const container = document.getElementById(categoryId);
            container.innerHTML = '';

            // do this twice. once for red and once for blue
            for (let i = 0; i < 2; i++) {
                const table = document.createElement('table');
                const headerRow = table.insertRow();
                headerRow.insertCell().textContent = "";

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

    collectNotes() {
        const notes = {};
        [...this.matchData.teams.red, ...this.matchData.teams.blue].forEach((teamNumber, index) => {
            const teamNotes = document.querySelectorAll(`input[data-notes="${teamNumber}"]`);
            notes[teamNumber] = teamNotes[0].value;
        })
        return notes;
    }

    handleSubmit(e) {
        e.preventDefault();

        const scoutingData = {
            matchNumber: this.matchData.matchNumber,
            matchType: this.matchData.matchType,
            timestamp: new Date().toISOString(),
            rankings: this.collectRankings(),
            notes: this.collectNotes(),
        };

        // Save to local storage
        sessionStorage.removeItem('matchData');

        // Convert JSON object to a string
        const jsonString = JSON.stringify(scoutingData, null, 2);

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
