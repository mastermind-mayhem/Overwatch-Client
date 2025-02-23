// script.js - Main page script
class OverwatchApp {
    constructor() {
        this.form = document.getElementById('matchForm');
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    handleSubmit(e) {
        e.preventDefault();
        
        // Store match data in sessionStorage
        const matchData = {
            matchNumber: document.getElementById('matchNumber').value,
            matchType: document.getElementById('matchType').value,
            teams: {
                red: [
                    document.getElementById('red1').value,
                    document.getElementById('red2').value,
                    document.getElementById('red3').value
                ],
                blue: [
                    document.getElementById('blue1').value,
                    document.getElementById('blue2').value,
                    document.getElementById('blue3').value
                ]
            }
        };

        sessionStorage.setItem('matchData', JSON.stringify(matchData));
        window.location.href = '/rankings';
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.overwatchApp = new OverwatchApp();
});