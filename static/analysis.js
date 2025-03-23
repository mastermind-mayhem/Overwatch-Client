const matchData = JSON.parse(sessionStorage.getItem('forAnalysis') || '{}');

let teamData = {};

// Aggregate scores
Object.values(matchData).forEach(match => {
    Object.entries(match.rankings).forEach(([team, scores]) => {
        if (!teamData[team]) {
            teamData[team] = { auto: 0, coral: 0, algae: 0, driver: 0, end: 0, matches: 0, notes: [] };
        }

        Object.keys(scores).forEach(category => {
            teamData[team][category] += scores[category];
        });

        teamData[team].matches += 1;
    });

    Object.entries(match.notes).forEach(([team, note]) => {
        // if notes is not an empty string
        if (!note.trim()) return;
        if (!teamData[team]) {
            teamData[team] = { auto: 0, coral: 0, algae: 0, driver: 0, end: 0, matches: 0, notes: [] };
        }
        console.log(match);
        teamData[team].notes.push('(' + match.matchType[0] + match.matchNumber + ') ' + note.trim());
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
        overall: overall.toFixed(2),
        notes: data.notes.join('; '),
    };
});

function interpolateColor(value) {
    let red = [175, 0, 0];
    let green = [0, 175, 0];
    if (value <= 2) {
        let opacity = (2-value);
        if (opacity < 0.3) {
            opacity = 0.3;
        }
        return `rgba(${green[0]}, ${green[1]}, ${green[2]}, ${opacity})`;
    } else {
        let opacity = (3-value);
        opacity = 1 - opacity;
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
    let number = 0;
    sortedData.forEach(team => {
        number += 1;
        let row = `<tr>
            <td>${number}</td>
            <td>${team.team}</td>
            <td style="background-color: ${interpolateColor(team.auto)}">${team.auto}</td>
            <td style="background-color: ${interpolateColor(team.coral)}">${team.coral}</td>
            <td style="background-color: ${interpolateColor(team.algae)}">${team.algae}</td>
            <td style="background-color: ${interpolateColor(team.driver)}">${team.driver}</td>
            <td style="background-color: ${interpolateColor(team.end)}">${team.end}</td>
            <td style="background-color: ${interpolateColor(team.overall)}">${team.overall}</td>
            <td>${team.notes}</td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

function sortTable(category) {
    document.getElementById("sortCategory").value = category;
    updateTable();
}

updateTable(); // Initial table population
  
function exportTableToPDF() {
    const table = document.getElementById("rankingsTable");

    // Temporarily apply styles to make the table more condensed
    const originalStyles = table.getAttribute('style') || '';
    table.setAttribute('style', `${originalStyles}; border-collapse: collapse; padding: 1px;`);

    // Capture the table with html2canvas
    html2canvas(table, {
        scale: 2, // Increase the scale to make the image high definition
        onrendered: function(canvas) {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pageWidth = pdf.internal.pageSize.width;
            const pageHeight = pdf.internal.pageSize.height;
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            // Calculate the aspect ratio
            const ratio = Math.min(pageWidth / imgWidth, (pageHeight - 20) / imgHeight); // Make room for label
            const newWidth = (imgWidth * ratio)+40;
            const newHeight = (imgHeight * ratio)-20; // Make room for label

            // Calculate the position to center the image
            const x = (pageWidth - newWidth) / 2;
            const y = 30; // Start below the label

            // Add label in the top left corner
            pdf.text(document.getElementById("sortCategory").value, 10, 20);

            // Add the image of the table
            pdf.addImage(imgData, 'PNG', x, y, newWidth, newHeight);
            pdf.save(document.getElementById("sortCategory").value+'.pdf');

            // Restore the original styles
            table.setAttribute('style', originalStyles);
        }
    });
}