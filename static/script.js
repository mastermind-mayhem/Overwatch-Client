// script.js - Main page script
class OverwatchApp {
    constructor() {
        this.form = document.getElementById('matchForm');
        this.initializeEventListeners();
        this.events = {};
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    handleSubmit(e) {
        e.preventDefault();
        let selectedvalue = document.getElementById("eventlist").value
        var json;
        if (selectedvalue == "other") {
            eventSig = document.getElementById("eventSig").value;
            json = displayEventData(eventSig);
        } else {
            json = events[selectedvalue];
        }

        sessionStorage.setItem('eventData', JSON.stringify(json));
        window.location.href = '/matchSet';
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.overwatchApp = new OverwatchApp();
    LoadEvents();
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
      return data;

    } else {
      console.log('Failed to retrieve event data.');
    }
  }

  async function LoadEvents() {
    let maxFiles = 4;
    let basePath = "/preload/";
    container = document.getElementById('eventlist');
    container.innerHTML = '';
    events = {};


    for (let i = 1; i <= maxFiles; i++) {
        let filePath = `${basePath}2025event${i}.json`; // Adjust naming pattern
        try {
            let response = await fetch(filePath);
            if (response.ok) {
                let data = await response.json();
                events[filePath] = data;
            }
        } catch (error) {
            break;

        }
    }
    container.innerHTML += `<option value=""></option>`;
    for (let event in events) {
      container.innerHTML += `<option value="${event}">${events[event]["event"]["short_name"]}</option>`;
    }
    container.innerHTML += `<option value="other">Other</option>`;
    container.addEventListener('change', () => checkOther());
}

function checkOther() {
    let value = document.getElementById('eventlist').value;
    if (value == "other") {
        document.getElementById('eventSigDiv').style.display = 'block';
        document.getElementById('eventSigDiv').innerHTML = `<label for="eventSig">Event Signifier (ex.2025nhsal for 2025 Granite State Event)</label>
                            <input type="text" id="eventSig" required>`;
    } else {
        document.getElementById('eventSigDiv').style.display = 'none';
        document.getElementById('eventSigDiv').innerHTML = ``;
    }
}

