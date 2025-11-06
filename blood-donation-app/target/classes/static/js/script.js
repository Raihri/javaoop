// ===============================
// Backend URLs
// ===============================
const donorAPI = "http://localhost:8080/api/donors";
const requestAPI = "http://localhost:8080/api/requests";

// ===============================
// Tab Navigation
// ===============================
const navButtons = document.querySelectorAll('.top-nav button');
const sections = document.querySelectorAll('.section');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        sections.forEach(s => s.classList.remove('active'));
        document.getElementById(btn.dataset.section).classList.add('active');
    });
});

// ===============================
// Modals
// ===============================
const donorModal = document.getElementById('donorModal');
const requestModal = document.getElementById('requestModal');
const diseaseModal = document.getElementById('diseaseModal');
const diseaseList = document.getElementById('diseaseList');

function openDonorModal() { donorModal.classList.add('show'); }
function closeDonorModal() { donorModal.classList.remove('show'); document.forms['donorForm'].reset(); }

function openRequestModal() { requestModal.classList.add('show'); }
function closeRequestModal() { requestModal.classList.remove('show'); document.forms['requestForm'].reset(); }

function closeDiseaseModal() { diseaseModal.classList.remove('show'); }

// ===============================
// Backend CRUD Functions
// ===============================
async function loadDonors() {
    const res = await fetch(donorAPI);
    return await res.json();
}

async function saveDonor(donor) {
    if (donor.id) {
        await fetch(`${donorAPI}/${donor.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donor)
        });
    } else {
        await fetch(donorAPI, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donor)
        });
    }
}

async function deleteDonorBackend(id) {
    await fetch(`${donorAPI}/${id}`, { method: 'DELETE' });
}

async function loadRequests() {
    const res = await fetch(requestAPI);
    return await res.json();
}

async function saveRequest(request) {
    if (request.id) {
        await fetch(`${requestAPI}/${request.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });
    } else {
        await fetch(requestAPI, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });
    }
}

async function deleteRequestBackend(id) {
    await fetch(`${requestAPI}/${id}`, { method: 'DELETE' });
}

// ===============================
// Eligibility Calculation
// ===============================
function computeEligibility(lastDonated, diseases) {
    const today = new Date();
    const lastDate = lastDonated ? new Date(lastDonated) : new Date('2000-01-01');
    const monthsDiff = (today.getFullYear() - lastDate.getFullYear()) * 12 + (today.getMonth() - lastDate.getMonth());
    const recentDonation = monthsDiff < 3;
    const hasSevereDisease = diseases.some(d => parseInt(d.level) >= 2);
    if (recentDonation) return "Cannot Donate (Recent)";
    if (hasSevereDisease) return "Cannot Donate (Disease)";
    return "Eligible";
}

// ===============================
// Render Tables
// ===============================
const donorTableBody = document.querySelector('#donorTable tbody');
async function renderDonors() {
    donorTableBody.innerHTML = '';
    const donors = await loadDonors();
    donors.forEach((d, index) => {
        const eligibility = computeEligibility(d.lastDonated, d.diseases || []);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${d.name}</td>
            <td>${d.age}</td>
            <td>${d.gender}</td>
            <td>${d.bloodGroup}</td>
            <td>${d.contact}</td>
            <td class="status-${d.status}">${d.status}</td>
            <td>${d.lastDonated || ''}</td>
            <td>${eligibility}</td>
            <td>
                <button class="btn btn-warning" onclick="editDonor(${index})">Edit</button>
                <button class="btn btn-danger" onclick="deleteDonor(${index})">Delete</button>
                <button class="btn btn-primary" onclick="viewDiseases(${index})">View Details</button>
            </td>`;
        donorTableBody.appendChild(row);
    });
    filterDonors();
    updateAdminCounts();
}

const requestTableBody = document.querySelector('#requestTable tbody');
async function renderRequests() {
    requestTableBody.innerHTML = '';
    const requests = await loadRequests();
    requests.forEach((r, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${r.name}</td>
            <td>${r.bloodGroup}</td>
            <td>${r.units}</td>
            <td class="status-${r.status}">${r.status}</td>
            <td>
                <button class="btn btn-warning" onclick="editRequest(${index})">Edit</button>
                <button class="btn btn-danger" onclick="deleteRequest(${index})">Delete</button>
            </td>`;
        requestTableBody.appendChild(row);
    });
    filterRequests();
    updateAdminCounts();
}

// ===============================
// Form Submissions
// ===============================
document.getElementById('donorForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const f = e.target;
    const diseases = Array.from(f.querySelectorAll('input[name="disease"]:checked')).map(chk => {
        return { name: chk.value, level: chk.dataset.level.toString() };
    });

    const donor = {
        id: f.donorIndex.value ? parseInt(f.donorIndex.value) : null,
        name: f.name.value,
        age: parseInt(f.age.value),
        gender: f.gender.value,
        bloodGroup: f.bloodGroup.value,
        contact: f.contact.value,
        status: f.status.value,
        lastDonated: f.lastDonated.value || null,
        diseases: diseases
    };

    try {
        await saveDonor(donor);
        closeDonorModal();
        renderDonors();
    } catch (err) {
        console.error("Error saving donor:", err);
        alert("Failed to save donor. Check backend connection.");
    }
});

document.getElementById('requestForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const f = e.target;
    const request = {
        id: f.requestIndex.value ? parseInt(f.requestIndex.value) : null,
        name: f.name.value,
        bloodGroup: f.bloodGroup.value,
        units: parseInt(f.units.value),
        status: f.status.value
    };

    try {
        await saveRequest(request);
        closeRequestModal();
        renderRequests();
    } catch (err) {
        console.error("Error saving request:", err);
        alert("Failed to save request. Check backend connection.");
    }
});

// ===============================
// Edit/Delete
// ===============================
async function editDonor(index) {
    const donors = await loadDonors();
    const d = donors[index];
    const f = document.forms['donorForm'];
    f.name.value = d.name; f.age.value = d.age; f.gender.value = d.gender;
    f.bloodGroup.value = d.bloodGroup; f.contact.value = d.contact;
    f.status.value = d.status; f.lastDonated.value = d.lastDonated || '';
    f.donorIndex.value = d.id;
    f.querySelectorAll('input[name="disease"]').forEach(chk => chk.checked = false);
    (d.diseases || []).forEach(ds => f.querySelector(`input[name="disease"][value="${ds.name}"]`)?.checked = true);
    openDonorModal();
}

async function deleteDonor(index) {
    if (confirm('Delete this donor?')) {
        const donors = await loadDonors();
        await deleteDonorBackend(donors[index].id);
        renderDonors();
    }
}

async function editRequest(index) {
    const requests = await loadRequests();
    const r = requests[index];
    const f = document.forms['requestForm'];
    f.name.value = r.name; f.bloodGroup.value = r.bloodGroup; f.units.value = r.units;
    f.status.value = r.status; f.requestIndex.value = r.id;
    openRequestModal();
}

async function deleteRequest(index) {
    if (confirm('Delete this request?')) {
        const requests = await loadRequests();
        await deleteRequestBackend(requests[index].id);
        renderRequests();
    }
}

// ===============================
// Filters
// ===============================
function filterDonors() {
    const n = document.getElementById('donorFilterName').value.toLowerCase();
    const b = document.getElementById('donorFilterBlood').value.toLowerCase();
    const s = document.getElementById('donorFilterStatus').value.toLowerCase();
    Array.from(donorTableBody.rows).forEach(row => {
        const rowName = row.cells[0].innerText.toLowerCase();
        const rowBlood = row.cells[3].innerText.toLowerCase();
        const rowStatus = row.cells[5].innerText.toLowerCase();
        row.style.display = (rowName.includes(n) && rowBlood.includes(b) && (s === '' || rowStatus === s)) ? '' : 'none';
    });
}

function filterRequests() {
    const n = document.getElementById('requestFilterName').value.toLowerCase();
    const b = document.getElementById('requestFilterBlood').value.toLowerCase();
    Array.from(requestTableBody.rows).forEach(row => {
        const rowName = row.cells[0].innerText.toLowerCase();
        const rowBlood = row.cells[1].innerText.toLowerCase();
        row.style.display = (rowName.includes(n) && rowBlood.includes(b)) ? '' : 'none';
    });
}

// ===============================
// Disease Modal
// ===============================
async function viewDiseases(index) {
    const donors = await loadDonors();
    const diseases = donors[index].diseases || [];
    diseaseList.innerHTML = diseases.length ? 
        diseases.map(d => `<li>${d.name} (Danger Level: ${d.level})</li>`).join('') :
        '<li>No diseases reported</li>';
    diseaseModal.classList.add('show');
}

// ===============================
// Admin Counts
// ===============================
async function updateAdminCounts() {
    const donors = await loadDonors();
    const requests = await loadRequests();
    document.getElementById('totalDonors').innerText = donors.length;
    document.getElementById('totalRequests').innerText = requests.length;
}

// ===============================
// Initial Render
// ===============================
renderDonors();
renderRequests();
