
const API_URL = "https://campus-lost-found-la7c.onrender.com/api/items";


// ---------------------------------
// REPORT LOST OR FOUND ITEM
// ---------------------------------

const reportForm = document.getElementById("reportForm");

if (reportForm) {
    reportForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("title").value;
        const description = document.getElementById("description").value;
        const category = document.getElementById("category").value;
        const location = document.getElementById("location").value;
        const type = document.getElementById("type").value;
        const imageFile = document.getElementById("image").files[0];

        const token = localStorage.getItem("token");

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("location", location);
        formData.append("type", type);

        if (imageFile) {
            formData.append("image", imageFile);
        }

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            alert(data.message || "Item reported successfully!");

            if (response.ok) {
                reportForm.reset();
            }

        } catch (error) {
            alert("Unable to connect to server.");
        }
    });
}

// ---------------------------------
// SEARCH AND FILTER ITEMS
// ---------------------------------

const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");

let allItems = [];

async function loadItems() {
    const container = document.getElementById("itemsContainer");

    if (!container) return;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        allItems = data.items || data;

        displayItems(allItems);

    } catch (error) {
        container.textContent = "Unable to load items. Please try again.";
    }
}



function displayItems(items) {
    const container = document.getElementById("itemsContainer");

    if (!container) return;

    container.innerHTML = "";

    if (items.length === 0) {
        container.innerHTML = "<p>No matching items found.</p>";
        return;
    }

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "feature-card";

        // Display uploaded image
        if (item.image) {
            const img = document.createElement("img");
            img.src = "//https://campus-lost-found-la7c.onrender.com${item.image}";
            img.alt = item.title;
            img.style.width = "100%";
            img.style.maxHeight = "180px";
            img.style.objectFit = "cover";
            img.style.borderRadius = "8px";

            card.appendChild(img);
        }

        const details = document.createElement("div");

        details.innerHTML = `
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <p>Category: ${item.category}</p>
            <p>Location: ${item.location}</p>
            <p>Type: ${item.type.toUpperCase()}</p>
        `;

        card.appendChild(details);

        if (item.approvalStatus === "approved" && item.itemStatus === "open") {
            const claimButton = document.createElement("button");
            claimButton.className = "btn";
            claimButton.textContent = "Claim Item";

            claimButton.addEventListener("click", () => {
                submitClaim(item._id);
            });

            card.appendChild(claimButton);
        }

        container.appendChild(card);
    });
}



async function submitClaim(itemId) {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first.");
        return;
    }

    const message = prompt("Why do you want to claim this item?");

    if (!message || !message.trim()) return;

    try {
        const response = await fetch(
            "https://campus-lost-found-la7c.onrender.com/api/claims",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    itemId,
                    message: message.trim()
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to claim item.");
            return;
        }

        alert(data.message || "Claim submitted successfully!");

    } catch (error) {
        console.error("Claim error:", error);
        alert("Unable to connect to server.");
    }
}




function filterItems() {
    const searchText = searchInput.value.toLowerCase();
    const selectedType = typeFilter.value;
    const selectedDate = document.getElementById("dateSort").value;

    let filteredItems = allItems.filter(item => {
        const matchesSearch =
            item.title.toLowerCase().includes(searchText) ||
            item.category.toLowerCase().includes(searchText) ||
            item.location.toLowerCase().includes(searchText);

        const matchesType =
            selectedType === "all" || item.type === selectedType;

        return matchesSearch && matchesType;
    });

    filteredItems.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt);
        const dateB = new Date(b.date || b.createdAt);

        return selectedDate === "newest"
            ? dateB - dateA
            : dateA - dateB;
    });

    displayItems(filteredItems);
}


const dateSort = document.getElementById("dateSort");

if (searchInput && typeFilter) {
    searchInput.addEventListener("input", filterItems);
    typeFilter.addEventListener("change", filterItems);

    if (dateSort) {
        dateSort.addEventListener("change", filterItems);
    }
}

// ---------------------------------
// MY REPORTS
// ---------------------------------

const myItemsContainer = document.getElementById("myItemsContainer");


async function loadMyItems() {
    if (!myItemsContainer) return;

    const token = localStorage.getItem("token");

    if (!token) {
        myItemsContainer.innerHTML =
            "<p>Please login to view your reports.</p>";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/my-items`, {
            cache: "no-store",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            myItemsContainer.innerHTML =
                `<p>${data.message || "Unable to load your reports."}</p>`;
            return;
        }

        const myItems = data.items || data;

        myItemsContainer.innerHTML = "";

        if (!Array.isArray(myItems) || myItems.length === 0) {
            myItemsContainer.innerHTML =
                "<p>You have not reported any items yet.</p>";
            return;
        }

        myItems.forEach(item => {
            const card = document.createElement("div");
            card.className = "feature-card";

            // Display uploaded image
            if (item.image) {
                const img = document.createElement("img");
                img.src = `http://https://campus-lost-found-la7c.onrender.com${item.image}`;
                img.alt = item.title;
                img.style.width = "100%";
                img.style.maxHeight = "180px";
                img.style.objectFit = "cover";
                img.style.borderRadius = "8px";

                card.appendChild(img);
            }

            const details = document.createElement("div");

            details.innerHTML = `
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <p>Category: ${item.category}</p>
                <p>Location: ${item.location}</p>
                <p>Type: ${item.type.toUpperCase()}</p>
                <p>Approval: ${item.approvalStatus.toUpperCase()}</p>
            `;

            card.appendChild(details);
            myItemsContainer.appendChild(card);
        });

    } catch (error) {
        myItemsContainer.innerHTML =
            "<p>Server connection failed.</p>";
    }
}


// ---------------------------------
// LOAD PAGE DATA
// ---------------------------------

loadItems();
loadMyItems();

 // ---------------------------------
 // MY CLAIMS
 // ---------------------------------

const myClaimsContainer = document.getElementById("myClaimsContainer");

async function loadMyClaims() {
    if (!myClaimsContainer) return;

    const token = localStorage.getItem("token");

    if (!token) {
        myClaimsContainer.innerHTML = "<p>Please login to view your claims.</p>";
        return;
    }

    try {
        const response = await fetch("https://campus-lost-found-la7c.onrender.com/api/claims/my-claims", {
            cache: "no-store",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            myClaimsContainer.innerHTML = "<p>Unable to load claims.</p>";
            return;
        }

        const claims = data.claims || data;

        myClaimsContainer.innerHTML = "";

        if (!Array.isArray(claims) || claims.length === 0) {
            myClaimsContainer.innerHTML = "<p>You have not submitted any claims yet.</p>";
            return;
        }

        claims.forEach(claim => {
            const card = document.createElement("div");
            card.className = "feature-card";

            card.innerHTML = `
                <h3>${claim.item ? claim.item.title : "Item unavailable"}</h3>
                <p>Message: ${claim.message || "No message"}</p>
                <p>Claim Status: ${claim.status.toUpperCase()}</p>
            `;

            myClaimsContainer.appendChild(card);
        });

    } catch (error) {
        myClaimsContainer.innerHTML = "<p>Server connection failed.</p>";
    }
}

loadMyClaims();

 // ---------------------------------
 // ADMIN CLAIM MANAGEMENT
 // ---------------------------------

const adminClaimsContainer = document.getElementById("adminClaimsContainer");

async function loadAdminClaims() {
    if (!adminClaimsContainer) return;

    const token = localStorage.getItem("token");

    if (!token) {
        adminClaimsContainer.innerHTML = "<p>Please login as admin.</p>";
        return;
    }

    try {
        const response = await fetch(
            "//https://campus-lost-found-la7c.onrender.com/api/claims/all",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            adminClaimsContainer.innerHTML =
                `<p>${data.message || "Unable to load claims."}</p>`;
            return;
        }

        const claims = data.claims || [];

        adminClaimsContainer.innerHTML = "";

        if (claims.length === 0) {
            adminClaimsContainer.innerHTML = "<p>No claim requests found.</p>";
            return;
        }

        claims.forEach(claim => {
            const card = document.createElement("div");
            card.className = "feature-card";

            card.innerHTML = `
                <h3>${claim.item ? claim.item.title : "Item unavailable"}</h3>
                <p>Student: ${claim.claimant ? claim.claimant.name : "Unknown"}</p>
                <p>Email: ${claim.claimant ? claim.claimant.email : "Unknown"}</p>
                <p>Message: ${claim.message}</p>
                <p>Status: ${claim.status.toUpperCase()}</p>
            `;

            if (claim.status === "pending") {
                const approveButton = document.createElement("button");
                approveButton.className = "btn";
                approveButton.textContent = "Approve";

                approveButton.onclick = () =>
                    updateAdminClaim(claim._id, "approved");

                const rejectButton = document.createElement("button");
                rejectButton.className = "btn secondary";
                rejectButton.textContent = "Reject";

                rejectButton.onclick = () =>
                    updateAdminClaim(claim._id, "rejected");

                card.appendChild(approveButton);
                card.appendChild(rejectButton);
            }

            adminClaimsContainer.appendChild(card);
        });

    } catch (error) {
        adminClaimsContainer.innerHTML =
            "<p>Server connection failed.</p>";
    }
}

async function updateAdminClaim(claimId, status) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(
            "//https://campus-lost-found-la7c.onrender.com/api/claims/${claimId}",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            }
        );

        const data = await response.json();

        alert(data.message);

        if (response.ok) {
            loadAdminClaims();
        }

    } catch (error) {
        alert("Server connection failed.");
    }
}

loadAdminClaims();
 
// ---------------------------------
// ADMIN ITEM MANAGEMENT
// ---------------------------------

const adminItemsContainer = document.getElementById("adminItemsContainer");

async function loadAdminItems() {
    if (!adminItemsContainer) return;

    const token = localStorage.getItem("token");

    if (!token) {
        adminItemsContainer.innerHTML = "<p>Please login as admin.</p>";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/pending`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            adminItemsContainer.innerHTML =
                `<p>${data.message || "Unable to load items."}</p>`;
            return;
        }

        const items = data.items || data;

        adminItemsContainer.innerHTML = "";

        if (items.length === 0) {
            adminItemsContainer.innerHTML = "<p>No pending reports.</p>";
            return;
        }

        items.forEach(item => {
            const card = document.createElement("div");
            card.className = "feature-card";

            card.innerHTML = `
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <p>Category: ${item.category}</p>
                <p>Location: ${item.location}</p>
                <p>Type: ${item.type.toUpperCase()}</p>
                <p>Status: ${item.approvalStatus.toUpperCase()}</p>
            `;

            const approveButton = document.createElement("button");
            approveButton.className = "btn";
            approveButton.textContent = "Approve";
            approveButton.onclick = () =>
                updateAdminItem(item._id, "approved");

            const rejectButton = document.createElement("button");
            rejectButton.className = "btn secondary";
            rejectButton.textContent = "Reject";
            rejectButton.onclick = () =>
                updateAdminItem(item._id, "rejected");

            card.appendChild(approveButton);
            card.appendChild(rejectButton);

            adminItemsContainer.appendChild(card);
        });

    } catch (error) {
        adminItemsContainer.innerHTML = "<p>Server connection failed.</p>";
    }
}

async function updateAdminItem(itemId, status) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(
            `${API_URL}/${itemId}/approval`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    approvalStatus: status
                })
            }
        );

        const data = await response.json();
        alert(data.message);

        if (response.ok) {
            loadAdminItems();
        }

    } catch (error) {
        alert("Server connection failed.");
    }
}

loadAdminItems();
