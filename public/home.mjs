console.log("Home module loaded!");

//////////////////////////////////////////////////////////////////////   GET   //////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM fully loaded, starting to fetch machines...");

    try {
        const response = await fetch('/api/machines');
        if (!response.ok) {
            throw new Error('Failed to fetch machines');
        }

        const machines = await response.json();
        console.log("Fetched machines:", machines);

        const listContainer = document.querySelector("#machines-list");
        console.log("List container:", listContainer);

        if (!listContainer) {
            console.error("Container element for machines not found!");
            return;
        }

        listContainer.innerHTML = '';

        machines.forEach(machine => {
            addMachineToList(machine);
        });

    } catch (error) {
        console.error("Error fetching machines:", error);
    }
});

/////////////////////////////////////////////////////////////////   POST    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const form = document.querySelector("#machine-form");
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const serial_number = document.querySelector("#serial_number").value;
    const machine_name = document.querySelector("#machine_name").value;
    const brand = document.querySelector("#brand").value;
    const model = document.querySelector("#model").value;

    const machineData = {
        serial_number,
        machine_name,
        brand,
        model
    };

    try {
        const response = await fetch('/api/machines', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(machineData),
        });

        if (!response.ok) {
            throw new Error('Failed to add machine');
        }

        const result = await response.json();
        console.log("Machine added successfully:", result);

        addMachineToList(result);

        form.reset();

    } catch (error) {
        console.error("Error adding machine:", error);
    }
});

/////////////////////////////////////////////////////////////////   DELETE    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function deleteMachine(machineId, listItem) {
    try {
        const response = await fetch(`/api/machines/${machineId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete machine');
        }

        console.log(`Machine with ID ${machineId} deleted successfully`);

        // Remove the machine from the UI
        listItem.remove();

    } catch (error) {
        console.error("Error deleting machine:", error);
    }
}

// Helper function to add machines to the list with a delete button
function addMachineToList(machine) {
    const listContainer = document.querySelector("#machines-list");

    const listItem = document.createElement("li");
    listItem.innerHTML = `
        Machine ID: ${machine.machine_id} | Serial Number: ${machine.serial_number} | 
        Name: ${machine.machine_name} | Brand: ${machine.brand} | Model: ${machine.model}
        <button class="delete-btn" data-id="${machine.machine_id}">Delete</button>
    `;

    listContainer.appendChild(listItem);

    // Attach delete event to the button
    const deleteButton = listItem.querySelector(".delete-btn");
    deleteButton.addEventListener("click", () => deleteMachine(machine.machine_id, listItem));
}
