console.log("Nachhaltig Watt Injected");

let isUpdating = false;

const observer = new MutationObserver((mutationsList) => {
    let shouldUpdate = false;

    for (const mutation of mutationsList) {
        if (mutation.type === "childList" || mutation.type === "attributes") {
            shouldUpdate = true;
            break;
        }
    }

    if (shouldUpdate) {
        addSustainabilityColumn();
    }
});

function observeTableForChanges(tables) {
    if (tables && tables.length > 0) {
        tables.forEach((table) => {
            observer.observe(table, {childList: true, subtree: true});
        });
    } else {
        observer.observe(document.body, {childList: true, subtree: true});
    }
}

function addSustainabilityColumn() {
    if (isUpdating) return; // Avoid simultaneous executions
    isUpdating = true;
    observer.disconnect()

    const tables = document.querySelectorAll(".rc-rating-table");
    try {
        if (tables.length > 0) {
            const tableHeader = tables[0]; // Assume header is in the first table
            const tableBody = tables[1];  // Assume body is in the second table

            const headerRows = tableHeader.querySelectorAll("tr");
            const bodyRows = tableBody.querySelectorAll("tr");

            if (headerRows.length > 0) {
                const firstRow = headerRows[0];
                const sustainabilityColumn = firstRow.querySelector("#nachhaltig-watt-header");

                if (sustainabilityColumn) {
                    sustainabilityColumn.remove();
                    tableBody.querySelectorAll(".nachhaltig-watt-cell").forEach((cell) => {cell.remove()})
                    //deleteLastColumn(bodyRows);
                }

                // Add a header for the new column
                const header = firstRow.insertCell(-1);
                header.id = "nachhaltig-watt-header"; // Unique ID
                header.textContent = "Stromanbieter-Check 23";
                header.style.fontWeight = "bold";

                bodyRows.forEach((row, index) => {
                    if (row.cells.length === firstRow.cells.length - 1) {
                        const firstCell = row.cells[1];
                        let cellText = firstCell?.textContent.trim() || "no data";

                        const newCell = row.insertCell(-1);
                        newCell.appendChild(calculateSustainabilityScore(cellText));
                        newCell.className = "nachhaltig-watt-cell";
                    }
                });

                bodyRows.item(bodyRows.length - 1).firstChild.colSpan = 6;
            } else {
                //console.log("No header rows found.");
            }
        } else {
            //console.log("No target tables found.");
        }
    } finally {
        isUpdating = false;
        observeTableForChanges(tables);
    }
}

// Brand to Sustainability Output
function calculateSustainabilityScore(brand) {
    var companies = window.elcompanies;
    let company = companies[brand];
    // Example: simple logic based on brand name
    if (company) {
        var element = createIcon(categoryMapper(company.category));
        if (company.parent && companies[company.parent]) {
            var parent = createIcon(categoryMapper(companies[company.parent].category));
            parent.title += ", Parent: " + company.parent;
            element.appendChild(parent);
        }
        return element;
    }
    return createIcon(categoryMapper(undefined));
}

function createIcon(info) {
    let element = document.createElement("i");
    if (info.icon === "leaf") {
        element.className = "product-properties-icon fab fa-envira";
    } else if (info.icon === "warning") {
        element.className = "product-properties-icon fa fa-exclamation-triangle";
    } else if (info.icon === "question") {
        element.className = "product-properties-icon fa fa-question-circle";
    }
    element.style.color = info.col;
    element.title = info.txt;
    return element;
}

function categoryMapper(category) {
    switch (category) {
        case 1:
            return {
                txt: "Leader",
                col: "rgb(99, 255, 49)",
                icon: "leaf"
            };
        case 2:
            return {
                txt: "Solid",
                col: "rgb(99, 170, 49)",
                icon: "leaf"
            };
        case 3:
            return {
                txt: "Adapting",
                col: "rgb(253, 199, 69)",
                icon: "leaf"
            };
        case 4:
            return {
                txt: "Provider with challenges",
                col: "rgb(245, 166, 35)",
                icon: "warning"
            };
        case 10:
            return {
                txt: "Declined to Answer",
                col: "rgb(208, 2, 27)",
                icon: "question"
            };
        case 99:
            return {
                txt: "New/Not accessed",
                col: "#0066a9",
                icon: "question"
            };
        default:
            console.warn("Unknown category: ", category);
            return {
                txt: "Error",
                col: "#333333",
                icon: "question"
            };
    }
}

observeTableForChanges(document.querySelectorAll(".rc-rating-table"));
addSustainabilityColumn();
