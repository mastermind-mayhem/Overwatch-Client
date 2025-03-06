const matchData = JSON.parse(sessionStorage.getItem('forAnalysis') || '{}');

let teamData = {};

// Aggregate scores
Object.values(matchData).forEach(match => {
    Object.entries(match.rankings).forEach(([team, scores]) => {
        if (!teamData[team]) {
            teamData[team] = { auto: 0, coral: 0, algae: 0, driver: 0, end: 0, matches: 0 };
        }

        Object.keys(scores).forEach(category => {
            teamData[team][category] += scores[category];
        });

        teamData[team].matches += 1;
    });
});

// Compute averages
let averageRankings = Object.entries(teamData).map(([team, data]) => {
    let overall = (data.auto + data.coral + data.algae + data.driver + data.end) / (5 * data.matches);
    return {
        team: parseInt(team),
        auto: (data.auto / data.matches).toFixed(2),
        coral: (data.coral / data.matches).toFixed(2),
        algae: (data.algae / data.matches).toFixed(2),
        driver: (data.driver / data.matches).toFixed(2),
        end: (data.end / data.matches).toFixed(2),
        overall: overall.toFixed(2)  // Overall score
    };
});

function interpolateColor(value) {
    let red = [175, 0, 0];
    let green = [0, 175, 0];
    console.log(value);
    if (value <= 2) {
        let opacity = (2-value);
        if (opacity < 0.3) {
            opacity = 0.3;
        }
        return `rgba(${green[0]}, ${green[1]}, ${green[2]}, ${opacity})`;
    } else {
        let opacity = (3-value);
        if (opacity < 0.3) {
            opacity = 0.3;
        }
        return `rgba(${red[0]}, ${red[1]}, ${red[2]}, ${opacity})`;
    }
}

function updateTable() {
    let category = document.getElementById("sortCategory").value;
    let sortedData = [...averageRankings].sort((a, b) => a[category] - b[category]);

    let tableBody = document.querySelector("#rankingsTable tbody");
    tableBody.innerHTML = "";

    sortedData.forEach(team => {
        let row = `<tr>
            <td>${team.team}</td>
            <td style="background-color: ${interpolateColor(team.auto)}">${team.auto}</td>
            <td style="background-color: ${interpolateColor(team.coral)}">${team.coral}</td>
            <td style="background-color: ${interpolateColor(team.algae)}">${team.algae}</td>
            <td style="background-color: ${interpolateColor(team.driver)}">${team.driver}</td>
            <td style="background-color: ${interpolateColor(team.end)}">${team.end}</td>
            <td style="background-color: ${interpolateColor(team.overall)}">${team.overall}</td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

function sortTable(category) {
    document.getElementById("sortCategory").value = category;
    updateTable();
}

updateTable(); // Initial table population