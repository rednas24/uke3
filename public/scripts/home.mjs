console.log("Home module loaded!");

function addMachineToList(machine, listContainer) {
    console.log("Adding machine:", machine);

    const listItem = document.createElement("li");
    listItem.innerHTML = `
        <span class="machine-name" data-id="${machine.machine_id}">
            <strong style="font-size: 1.2em;">${machine.machine_name}</strong> <br>
            Merke: ${machine.brand} <br>
            Type maskin: ${machine.model} <br>
            SNr: ${machine.serial_number}
        </span>
        <button class="delete-btn" data-id="${machine.machine_id}">Delete</button>
    `;
    listContainer.appendChild(listItem);
}

// Fetch all the machines 
document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM fully loaded, fetching machines...");

    try {
        const response = await fetch('/api/machines');
        if (!response.ok) throw new Error('Failed to fetch machines');

        const machines = await response.json();
        console.log("Fetched machines:", machines);

        const listContainer = document.querySelector("#machines-list");
        if (!listContainer) return console.error("Container for machines not found!");

        listContainer.innerHTML = ''; 

        const groupedMachines = groupMachinesByType(machines);

        for (const [type, machinesByType] of Object.entries(groupedMachines)) {
            const section = document.createElement("section");
            const heading = document.createElement("h2");
            heading.innerText = type;
            section.appendChild(heading);

            const typeList = document.createElement("ul");
            machinesByType.forEach(machine => addMachineToList(machine, typeList));

            section.appendChild(typeList);
            listContainer.appendChild(section);
        }
    } catch (error) {
        console.error("Error fetching machines:", error);
    }
});

// Group machines by type
function groupMachinesByType(machines) {
    return machines.reduce((grouped, machine) => {
        const type = machine.model || "Unknown";  
        if (!grouped[type]) {
            grouped[type] = [];
        }
        grouped[type].push(machine);
        return grouped;
    }, {});
}


document.querySelector("#machine-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const serial_number = document.querySelector("#serial_number").value;
    const machine_name = document.querySelector("#machine_name").value;
    const brand = document.querySelector("#brand").value;
    const model = document.querySelector("#model").value;

    if (!serial_number || !machine_name || !brand || !model) {
        return alert("All fields are required!");
    }

    try {
        const response = await fetch('/api/machines', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serial_number, machine_name, brand, model }),
        });

        if (!response.ok) throw new Error('Failed to add machine');

        const result = await response.json();
        console.log("Machine added successfully:", result);


        const listContainer = document.querySelector("#machines-list");
        listContainer.innerHTML = ''; 

        const machines = await fetch('/api/machines').then(res => res.json());
        const groupedMachines = groupMachinesByType(machines);
        for (const [type, machinesByType] of Object.entries(groupedMachines)) {
            const section = document.createElement("section");
            const heading = document.createElement("h2");
            heading.innerText = type;
            section.appendChild(heading);

            const typeList = document.createElement("ul");
            machinesByType.forEach(machine => addMachineToList(machine, typeList));

            section.appendChild(typeList);
            listContainer.appendChild(section);
        }

        event.target.reset(); 
    } catch (error) {
        console.error("Error adding machine:", error);
    }
});



document.querySelector("#machines-list").addEventListener("click", async (event) => {
    const machineId = event.target.dataset.id;

    if (event.target.classList.contains("delete-btn")) {
        deleteMachine(machineId, event.target.closest("li"));
    } else if (event.target.classList.contains("machine-name")) {
        fetchMachineStatus(machineId);
    }
});


async function deleteMachine(machineId, listItem) {
    if (!confirm("Are you sure you want to delete this machine?")) return;

    try {
        const response = await fetch(`/api/machines/${machineId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete machine');

        console.log(`Machine with ID ${machineId} deleted successfully`);
        listItem.remove();
    } catch (error) {
        console.error("Error deleting machine:", error);
    }
}


async function fetchMachineStatus(machineId) {
    console.log("Fetching status for machine ID:", machineId);

    try {
        const response = await fetch(`/api/machines/${machineId}/status`);
        const data = response.ok ? await response.json() : null;

        if (!data || !data.details) {
            console.log("No status found. Creating a new status entry...");
            showStatusModal({}, machineId, null);
        } else {
            console.log("Fetched machine status:", data);
            showStatusModal(data.details, machineId, data.details.borrow_id);
        }
    } catch (error) {
        console.error("Error fetching machine status:", error);
        alert("Error fetching status. Please try again.");
    }
}

// modal shown
function showStatusModal(statusDetails = {}, machineId = null, statusId = null) {
    const modal = document.getElementById("status-modal");
    modal.style.display = "flex";

    document.getElementById("borrower_name").value = statusDetails.borrower_name || "";
    document.getElementById("return_date").value = statusDetails.return_date ? new Date(statusDetails.return_date).toISOString().split('T')[0] : "";
    document.getElementById("comments").value = statusDetails.comments || "";

    const statusForm = document.getElementById("status-form");

    statusForm.onsubmit = null;
    statusForm.onsubmit = async (event) => {
        event.preventDefault();

        const updatedData = {
            borrower_name: document.getElementById("borrower_name").value,
            return_date: document.getElementById("return_date").value,
            comments: document.getElementById("comments").value
        };

        try {
            const url = `/api/machines/${machineId}/status`;
            const method = statusId ? "PUT" : "POST";

            const updateResponse = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            if (!updateResponse.ok) throw new Error("Failed to update machine status");

            alert("Machine status updated successfully!");
            modal.style.display = "none";
        } catch (error) {
            console.error("Error updating machine status:", error);
            alert("Error updating machine status.");
        }
    };

    const clearStatusButton = document.getElementById("clear-status");

    // Removes old event listner
    clearStatusButton.replaceWith(clearStatusButton.cloneNode(true));
    document.getElementById("clear-status").addEventListener("click", async () => {
        if (!statusId) return alert("Status ID is required to delete status.");

        if (confirm("Are you sure you want to delete this machine's status?")) {
            try {
                const deleteResponse = await fetch(`/api/machines/status/${statusId}`, { method: 'DELETE' });
                if (!deleteResponse.ok) throw new Error("Failed to delete machine status");

                alert("Machine status deleted successfully.");
                modal.style.display = "none";
            } catch (error) {
                console.error("Error deleting machine status:", error);
                alert("Error deleting machine status.");
            }
        }
    });

    
    document.getElementById("close-modal").addEventListener("click", () => {
        modal.style.display = "none";
    });
}

function logout() {
    // Send a logout request to the server hopefully !!!!!!! fix
    fetch('/api/auth/logout', { method: 'POST' })
        .then(response => {
            if (response.ok) {
                alert('You have been logged out.');
                window.location.href = '/';
            } else {
                alert('Logout failed.');
            }
        })
        .catch(error => {
            console.error('Logout error:', error);
            alert('Error logging out.');
        });
}

document.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.createElement("button");
    logoutButton.innerText = "Logout";
    logoutButton.id = "logout-button";
    logoutButton.addEventListener("click", logout);
    const navContainer = document.querySelector("body");
    navContainer.appendChild(logoutButton);
});