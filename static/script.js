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

async function getTBAEventData(eventKey) {
    const apiKey = 'ORsATVgqwTfsLS8XqcHRXNVIHmtY6hNdzgN7pOieyzONulNij6AXyfiA5RlTpirD'; // Replace with your actual API key
    const baseUrl = 'https://www.thebluealliance.com/api/v3';
  
    try {
      // Fetch event details
      const eventResponse = await fetch(`${baseUrl}/event/${eventKey}`, {
        headers: { 'X-TBA-Auth-Key': apiKey },
      });
      if (!eventResponse.ok) {
        throw new Error(`Failed to fetch event details: ${eventResponse.status} ${eventResponse.statusText}`);
      }
      const eventData = await eventResponse.json();
  
      // Fetch teams in the event
      const teamsResponse = await fetch(`${baseUrl}/event/${eventKey}/teams/simple`, {
        headers: { 'X-TBA-Auth-Key': apiKey },
      });
      if (!teamsResponse.ok) {
        throw new Error(`Failed to fetch teams: ${teamsResponse.status} ${teamsResponse.statusText}`);
      }
      const teamsData = await teamsResponse.json();
  
      return { event: eventData, teams: teamsData };
    } catch (error) {
      console.error('Error fetching data from The Blue Alliance:', error);
      return null;
    }
  }
  
  // Example usage:
  async function displayEventData(eventKey) {
    const data = await getTBAEventData(eventKey);
  
    if (data) {
      console.log(data);
  
    } else {
      console.log('Failed to retrieve event data.');
    }
  }
  
  // Replace '2023nytr' with the desired event key (e.g., 2023nytr, 2024calb)
//   const eventKey = '2025nhsal'; // Example event key
//   displayEventData(eventKey);