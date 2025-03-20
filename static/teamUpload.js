// DOM Elements
const fileInput = document.getElementById('jsonFileInput');
const fileTable = document.getElementById('fileTable');
const fileTableBody = document.getElementById('fileTableBody');
const processingOption = document.getElementById('processingOption');
const processButton = document.getElementById('processButton');
const processedDataContainer = document.getElementById('processedDataContainer');
const processedDataElement = document.getElementById('processedData');
const errorMessageElement = document.getElementById('error-message');
const clearFilesButton = document.getElementById('clearFilesButton');

// Global variable to store parsed JSON files
const jsonFiles = new Map();

// Determine content type and item count
function analyzeJsonContent(data) {
    if (Array.isArray(data)) {
        return {
            type: 'Array',
            itemCount: data.length
        };
    } else if (typeof data === 'object' && data !== null) {
        return {
            type: 'Object',
            itemCount: Object.keys(data).length
        };
    }
    return {
        type: typeof data,
        itemCount: 1
    };
}

// Combine JSON data from selected files
function combineJsonData(selectedFiles) {
    // Detect if all files are arrays or objects
    const allArrays = selectedFiles.every(({data}) => Array.isArray(data));
    const allObjects = selectedFiles.every(({data}) => typeof data === 'object' && !Array.isArray(data));

    if (allArrays) {
        // Combine arrays - concatenate all arrays
        return selectedFiles.reduce((combined, {file, data}) => {
            return [...combined, ...data];
        }, []);
    } else if (allObjects) {
        // Combine objects - merge keys
        return selectedFiles.reduce((combined, {file, data}) => {
            return {
                ...combined,
                [file.name.replace(/\.json$/, '')]: data
            };
        }, {});
    } else {
        // Mixed types - create an object with filenames as keys
        return selectedFiles.reduce((combined, {file, data}) => {
            return {
                ...combined,
                [file.name.replace(/\.json$/, '')]: data
            };
        }, {});
    }
}

// Sort file table alphabetically
function sortFileTable() {
    const rows = Array.from(fileTableBody.querySelectorAll('tr'));

    rows.sort((a, b) => {
        const nameA = a.querySelector('td:first-child').textContent;
        const nameB = b.querySelector('td:first-child').textContent;
        return nameA.localeCompare(nameB);
    });

    // Clear table and re-add sorted rows
    fileTableBody.innerHTML = '';
    rows.forEach(row => fileTableBody.appendChild(row));
}

// Add file to table
function addFileToTable(file, parsedJson) {
    const { type, itemCount } = analyzeJsonContent(parsedJson);

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${file.name}</td>
        <td>
            <input type="checkbox" class="file-checkbox" data-filename="${file.name}" style="display:none;" checked>
            <button class="remove-file" data-filename="${file.name}">Remove</button>
        </td>
    `;

    fileTableBody.appendChild(row);
    fileTable.style.display = 'table';
    processButton.disabled = false;

    // Sort table after adding new file
    sortFileTable();
}

// File upload event listener
fileInput.addEventListener('change', function(event) {
    // Clear previous error messages
    errorMessageElement.textContent = '';

    // Process each uploaded file
    Array.from(event.target.files).forEach(file => {
        // Check if file is already uploaded
        if (jsonFiles.has(file.name)) {
            errorMessageElement.textContent += `File ${file.name} is already uploaded.\n`;
            return;
        }

        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                const parsedJson = JSON.parse(e.target.result);
                jsonFiles.set(file.name, {
                    file: file,
                    data: parsedJson
                });

                // Add file to table
                addFileToTable(file, parsedJson);
            } catch (error) {
                errorMessageElement.textContent += `Error parsing ${file.name}: Invalid JSON\n`;
            }
        };

        reader.readAsText(file);
    });
});

// Remove file event delegation
fileTableBody.addEventListener('click', function(event) {
    // Remove file button
    if (event.target.classList.contains('remove-file')) {
        const filename = event.target.dataset.filename;
        jsonFiles.delete(filename);
        event.target.closest('tr').remove();

        // Hide table if no files
        if (jsonFiles.size === 0) {
            fileTable.style.display = 'none';
            processButton.disabled = true;
        }
    }
});

// Clear all files
clearFilesButton.addEventListener('click', function() {
    window.location.reload();
});

// Sorting for table headers
fileTable.addEventListener('click', function(event) {
    const th = event.target.closest('th');
    if (!th) return;

    const sortKey = th.dataset.sort;
    const rows = Array.from(fileTableBody.querySelectorAll('tr'));

    const sortMultiplier = th.dataset.sortDirection === 'asc' ? -1 : 1;
    th.dataset.sortDirection = sortMultiplier === 1 ? 'asc' : 'desc';

    rows.sort((a, b) => {
        const cellA = a.querySelector(`td:nth-child(${th.cellIndex + 1})`).textContent;
        const cellB = b.querySelector(`td:nth-child(${th.cellIndex + 1})`).textContent;

        // Convert to number for numeric sorting
        const numA = isNaN(cellA) ? cellA : Number(cellA);
        const numB = isNaN(cellB) ? cellB : Number(cellB);

        return sortMultiplier * (numA > numB ? 1 : numA < numB ? -1 : 0);
    });

    // Clear table and re-add sorted rows
    fileTableBody.innerHTML = '';
    rows.forEach(row => fileTableBody.appendChild(row));
});

// Process button event listener
processButton.addEventListener('click', function() {
    // Get selected files
    const selectedCheckboxes = document.querySelectorAll('.file-checkbox:checked');

    if (selectedCheckboxes.length === 0) {
        errorMessageElement.textContent = 'Please select files to process.';
        return;
    }

    const selectedFiles = Array.from(selectedCheckboxes).map(
        checkbox => jsonFiles.get(checkbox.dataset.filename)
    );

    let result = JSON.stringify(combineJsonData(selectedFiles), null, 2);

    sessionStorage.setItem('forAnalysis', result);
    window.location.href = '/analysis';
});