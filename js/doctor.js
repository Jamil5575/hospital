// Doctor Dashboard Functions

function loadDoctorDashboard() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'doctor') return;
    
    const doctorId = currentUser.id;
    const appointments = getAppointments().filter(a => a.doctorId === doctorId);
    const today = new Date().toISOString().split('T')[0];
    const todaysAppointments = appointments.filter(a => a.date === today && a.status !== 'cancelled');
    
    const content = `
        <div class="doctor-dashboard">
            <h2>Doctor Dashboard</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${todaysAppointments.length}</h3>
                        <p>Today's Appointments</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-user-clock"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${appointments.filter(a => a.status === 'pending').length}</h3>
                        <p>Pending Appointments</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-prescription-bottle-alt"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${getPrescriptions().filter(p => p.doctorId === doctorId).length}</h3>
                        <p>Prescriptions</p>
                    </div>
                </div>
            </div>
            
            <div class="todays-schedule mt-20">
                <div class="card">
                    <div class="card-header">
                        <h3>Today's Schedule (${formatDate(today)})</h3>
                    </div>
                    <div class="card-body">
                        ${todaysAppointments.length > 0 ? `
                            <div class="appointments-timeline">
                                ${todaysAppointments
                                    .sort((a, b) => a.time.localeCompare(b.time))
                                    .map(appt => `
                                    <div class="timeline-item ${appt.status}">
                                        <div class="timeline-time">${formatTime(appt.time)}</div>
                                        <div class="timeline-content">
                                            <div class="timeline-title">${appt.patientName}</div>
                                            <div class="timeline-desc">${appt.reason || 'No reason specified'}</div>
                                            <div class="timeline-status">${appt.status}</div>
                                        </div>
                                        <div class="timeline-actions">
                                            <button class="btn btn-secondary btn-sm view-appointment" data-id="${appt.id}">View</button>
                                            ${appt.status === 'pending' ? `
                                                <button class="btn btn-primary btn-sm confirm-appointment" data-id="${appt.id}">Confirm</button>
                                            ` : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <p>No appointments scheduled for today.</p>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    loadContent(content);
    
    // Add event listeners to appointment buttons
    document.querySelectorAll('.view-appointment').forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = parseInt(this.getAttribute('data-id'));
            viewAppointment(appointmentId);
        });
    });
    
    document.querySelectorAll('.confirm-appointment').forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = parseInt(this.getAttribute('data-id'));
            confirmAppointment(appointmentId);
        });
    });
}

function loadDoctorAppointments() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'doctor') return;
    
    const doctorId = currentUser.id;
    
    const content = `
        <div class="doctor-appointments">
            <div class="card">
                <div class="card-header">
                    <h3>My Appointments</h3>
                </div>
                <div class="card-body">
                    <div class="filters mb-20">
                        <div class="filter-group">
                            <label for="doctor-appointment-status">Status:</label>
                            <select id="doctor-appointment-status">
                                <option value="all">All</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="doctor-appointment-date">Date:</label>
                            <input type="date" id="doctor-appointment-date">
                        </div>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Date & Time</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="doctor-appointments-list">
                                <!-- Appointments will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    loadContent(content);
    
    // Load appointments list
    loadDoctorAppointmentsList(doctorId);
    
    // Set up filter event listeners
    document.getElementById('doctor-appointment-status').addEventListener('change', function() {
        loadDoctorAppointmentsList(doctorId);
    });
    
    document.getElementById('doctor-appointment-date').addEventListener('change', function() {
        loadDoctorAppointmentsList(doctorId);
    });
}

function loadDoctorAppointmentsList(doctorId) {
    let appointments = getAppointments().filter(a => a.doctorId === doctorId);
    
    // Apply filters
    const statusFilter = document.getElementById('doctor-appointment-status').value;
    if (statusFilter !== 'all') {
        appointments = appointments.filter(a => a.status === statusFilter);
    }
    
    const dateFilter = document.getElementById('doctor-appointment-date').value;
    if (dateFilter) {
        appointments = appointments.filter(a => a.date === dateFilter);
    }
    
    // Sort by date (newest first)
    appointments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const appointmentsList = document.getElementById('doctor-appointments-list');
    if (!appointmentsList) return;
    
    appointmentsList.innerHTML = '';
    
    if (appointments.length === 0) {
        appointmentsList.innerHTML = '<tr><td colspan="5" class="text-center">No appointments found</td></tr>';
        return;
    }
    
    appointments.forEach(appointment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appointment.patientName}</td>
            <td>${formatDate(appointment.date)} at ${formatTime(appointment.time)}</td>
            <td>${appointment.reason || 'Not specified'}</td>
            <td><span class="status-badge ${appointment.status}">${appointment.status}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm view-appointment" data-id="${appointment.id}">View</button>
                ${appointment.status === 'pending' ? `
                    <button class="btn btn-primary btn-sm confirm-appointment" data-id="${appointment.id}">Confirm</button>
                ` : ''}
                ${appointment.status !== 'cancelled' && appointment.status !== 'completed' ? `
                    <button class="btn btn-danger btn-sm cancel-appointment" data-id="${appointment.id}">Cancel</button>
                ` : ''}
                ${appointment.status === 'confirmed' ? `
                    <button class="btn btn-success btn-sm complete-appointment" data-id="${appointment.id}">Complete</button>
                ` : ''}
            </td>
        `;
        appointmentsList.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.view-appointment').forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = parseInt(this.getAttribute('data-id'));
            viewAppointment(appointmentId);
        });
    });
    
    document.querySelectorAll('.confirm-appointment').forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = parseInt(this.getAttribute('data-id'));
            confirmAppointment(appointmentId);
        });
    });
    
    document.querySelectorAll('.cancel-appointment').forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = parseInt(this.getAttribute('data-id'));
            confirmCancelAppointment(appointmentId);
        });
    });
    
    document.querySelectorAll('.complete-appointment').forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = parseInt(this.getAttribute('data-id'));
            completeAppointment(appointmentId);
        });
    });
}

function confirmAppointment(id) {
    const appointments = getAppointments();
    const appointmentIndex = appointments.findIndex(a => a.id === id);
    
    if (appointmentIndex !== -1) {
        appointments[appointmentIndex].status = 'confirmed';
        saveAppointments(appointments);
        showNotification('Appointment confirmed successfully', 'success');
        
        // Refresh the view
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser?.role === 'doctor') {
            loadDoctorAppointmentsList(currentUser.id);
        }
    }
}

function completeAppointment(id) {
    const appointment = getAppointments().find(a => a.id === id);
    if (!appointment) {
        showNotification('Appointment not found', 'error');
        return;
    }
    
    const content = `
        <div class="complete-appointment-form">
            <h3>Complete Appointment</h3>
            <form id="completeAppointmentForm">
                <div class="form-group">
                    <label for="appointment-diagnosis">Diagnosis</label>
                    <textarea id="appointment-diagnosis" rows="3" required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="appointment-treatment">Treatment Provided</label>
                    <textarea id="appointment-treatment" rows="3"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="appointment-notes">Notes</label>
                    <textarea id="appointment-notes" rows="3"></textarea>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="create-prescription"> Create Prescription
                    </label>
                </div>
                
                <div id="prescription-fields" style="display: none;">
                    <h4>Prescription Details</h4>
                    <div id="prescription-items">
                        <div class="prescription-item">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Medication Name</label>
                                    <input type="text" class="med-name" required>
                                </div>
                                <div class="form-group">
                                    <label>Dosage</label>
                                    <input type="text" class="med-dosage" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Frequency</label>
                                    <input type="text" class="med-frequency" required>
                                </div>
                                <div class="form-group">
                                    <label>Duration</label>
                                    <input type="text" class="med-duration" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Instructions</label>
                                <textarea class="med-instructions" rows="2"></textarea>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn btn-secondary" id="add-medication">Add Another Medication</button>
                </div>
                
                <div class="form-actions mt-20">
                    <button type="button" class="btn btn-secondary" id="cancel-complete-appointment">Cancel</button>
                    <button type="submit" class="btn btn-success">Complete Appointment</button>
                </div>
            </form>
        </div>
    `;
    
    showModal('Complete Appointment', content);
    
    // Toggle prescription fields
    document.getElementById('create-prescription').addEventListener('change', function() {
        document.getElementById('prescription-fields').style.display = this.checked ? 'block' : 'none';
    });
    
    // Add medication button
    document.getElementById('add-medication').addEventListener('click', function() {
        const itemsContainer = document.getElementById('prescription-items');
        const newItem = document.createElement('div');
        newItem.className = 'prescription-item';
        newItem.innerHTML = `
            <hr>
            <div class="form-row">
                <div class="form-group">
                    <label>Medication Name</label>
                    <input type="text" class="med-name" required>
                </div>
                <div class="form-group">
                    <label>Dosage</label>
                    <input type="text" class="med-dosage" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Frequency</label>
                    <input type="text" class="med-frequency" required>
                </div>
                <div class="form-group">
                    <label>Duration</label>
                    <input type="text" class="med-duration" required>
                </div>
            </div>
            <div class="form-group">
                <label>Instructions</label>
                <textarea class="med-instructions" rows="2"></textarea>
            </div>
            <button type="button" class="btn btn-danger btn-sm remove-medication">Remove</button>
        `;
        itemsContainer.appendChild(newItem);
        
        // Add remove button event
        newItem.querySelector('.remove-medication').addEventListener('click', function() {
            itemsContainer.removeChild(newItem);
        });
    });
    
    // Form submission
    document.getElementById('completeAppointmentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const diagnosis = document.getElementById('appointment-diagnosis').value.trim();
        const treatment = document.getElementById('appointment-treatment').value.trim();
        const notes = document.getElementById('appointment-notes').value.trim();
        const createPrescription = document.getElementById('create-prescription').checked;
        
        // Validate
        if (!diagnosis) {
            showNotification('Please enter a diagnosis', 'error');
            return;
        }
        
        // Get prescription data if needed
        let prescription = null;
        if (createPrescription) {
            const items = Array.from(document.querySelectorAll('.prescription-item')).map(item => {
                return {
                    name: item.querySelector('.med-name').value.trim(),
                    dosage: item.querySelector('.med-dosage').value.trim(),
                    frequency: item.querySelector('.med-frequency').value.trim(),
                    duration: item.querySelector('.med-duration').value.trim(),
                    instructions: item.querySelector('.med-instructions').value.trim()
                };
            });
            
            // Validate prescription items
            if (items.some(item => !item.name || !item.dosage || !item.frequency || !item.duration)) {
                showNotification('Please fill in all required medication fields', 'error');
                return;
            }
            
            prescription = {
                id: generateId(getPrescriptions()),
                patientId: appointment.patientId,
                patientName: appointment.patientName,
                doctorId: appointment.doctorId,
                doctorName: appointment.doctorName,
                date: new Date().toISOString().split('T')[0],
                medications: items,
                instructions: notes,
                createdAt: new Date().toISOString()
            };
        }
        
        // Update appointment
        const appointments = getAppointments();
        const appointmentIndex = appointments.findIndex(a => a.id === id);
        
        if (appointmentIndex !== -1) {
            appointments[appointmentIndex].status = 'completed';
            appointments[appointmentIndex].diagnosis = diagnosis;
            appointments[appointmentIndex].treatment = treatment;
            appointments[appointmentIndex].notes = notes;
            
            saveAppointments(appointments);
            
            // Add prescription if created
            if (prescription) {
                const prescriptions = getPrescriptions();
                prescriptions.push(prescription);
                savePrescriptions(prescriptions);
            }
            
            // Add to patient's medical history
            const patients = getPatients();
            const patientIndex = patients.findIndex(p => p.id === appointment.patientId);
            
            if (patientIndex !== -1) {
                patients[patientIndex].medicalHistory.push({
                    date: new Date().toISOString().split('T')[0],
                    diagnosis,
                    treatment,
                    doctor: appointment.doctorName
                });
                
                savePatients(patients);
            }
            
            showNotification('Appointment completed successfully', 'success');
            closeModal();
            
            // Refresh the view
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            if (currentUser?.role === 'doctor') {
                loadDoctorAppointmentsList(currentUser.id);
            }
        }
    });
    
    // Cancel button
    document.getElementById('cancel-complete-appointment').addEventListener('click', closeModal);
}

function loadPrescriptions() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'doctor') return;
    
    const doctorId = currentUser.id;
    
    const content = `
        <div class="doctor-prescriptions">
            <div class="card">
                <div class="card-header">
                    <h3>My Prescriptions</h3>
                </div>
                <div class="card-body">
                    <div class="filters mb-20">
                        <div class="filter-group">
                            <label for="prescription-patient-filter">Patient:</label>
                            <select id="prescription-patient-filter">
                                <option value="all">All Patients</option>
                                ${getPatients().map(patient => `
                                    <option value="${patient.id}">${patient.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="prescription-date-filter">Date:</label>
                            <input type="date" id="prescription-date-filter">
                        </div>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Patient</th>
                                    <th>Medications</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="prescriptions-list">
                                <!-- Prescriptions will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    loadContent(content);
    
    // Load prescriptions list
    loadPrescriptionsList(doctorId);
    
    // Set up filter event listeners
    document.getElementById('prescription-patient-filter').addEventListener('change', function() {
        loadPrescriptionsList(doctorId);
    });
    
    document.getElementById('prescription-date-filter').addEventListener('change', function() {
        loadPrescriptionsList(doctorId);
    });
}

function loadPrescriptionsList(doctorId) {
    let prescriptions = getPrescriptions().filter(p => p.doctorId === doctorId);
    
    // Apply filters
    const patientFilter = document.getElementById('prescription-patient-filter').value;
    if (patientFilter !== 'all') {
        const patientId = parseInt(patientFilter);
        prescriptions = prescriptions.filter(p => p.patientId === patientId);
    }
    
    const dateFilter = document.getElementById('prescription-date-filter').value;
    if (dateFilter) {
        prescriptions = prescriptions.filter(p => p.date === dateFilter);
    }
    
    // Sort by date (newest first)
    prescriptions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const prescriptionsList = document.getElementById('prescriptions-list');
    if (!prescriptionsList) return;
    
    prescriptionsList.innerHTML = '';
    
    if (prescriptions.length === 0) {
        prescriptionsList.innerHTML = '<tr><td colspan="4" class="text-center">No prescriptions found</td></tr>';
        return;
    }
    
    prescriptions.forEach(prescription => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(prescription.date)}</td>
            <td>${prescription.patientName}</td>
            <td>${prescription.medications.length} medications</td>
            <td>
                <button class="btn btn-secondary btn-sm view-prescription" data-id="${prescription.id}">View</button>
                <button class="btn btn-primary btn-sm edit-prescription" data-id="${prescription.id}">Edit</button>
            </td>
        `;
        prescriptionsList.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.view-prescription').forEach(button => {
        button.addEventListener('click', function() {
            const prescriptionId = parseInt(this.getAttribute('data-id'));
            viewPrescription(prescriptionId);
        });
    });
    
    document.querySelectorAll('.edit-prescription').forEach(button => {
        button.addEventListener('click', function() {
            const prescriptionId = parseInt(this.getAttribute('data-id'));
            showEditPrescriptionForm(prescriptionId);
        });
    });
}

function viewPrescription(id) {
    const prescription = getPrescriptions().find(p => p.id === id);
    if (!prescription) {
        showNotification('Prescription not found', 'error');
        return;
    }
    
    const content = `
        <div class="prescription-details">
            <h3>Prescription Details</h3>
            
            <div class="detail-row">
                <div class="detail-label">Date:</div>
                <div class="detail-value">${formatDate(prescription.date)}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Patient:</div>
                <div class="detail-value">${prescription.patientName}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Doctor:</div>
                <div class="detail-value">${prescription.doctorName}</div>
            </div>
            
            <div class="detail-section mt-20">
                <h4>Medications</h4>
                <table class="medications-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Dosage</th>
                            <th>Frequency</th>
                            <th>Duration</th>
                            <th>Instructions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${prescription.medications.map(med => `
                            <tr>
                                <td>${med.name}</td>
                                <td>${med.dosage}</td>
                                <td>${med.frequency}</td>
                                <td>${med.duration}</td>
                                <td>${med.instructions || 'None'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            ${prescription.instructions ? `
            <div class="detail-section mt-20">
                <h4>Additional Instructions</h4>
                <p>${prescription.instructions}</p>
            </div>
            ` : ''}
            
            <div class="detail-actions mt-20">
                <button class="btn btn-primary" id="close-prescription-modal">Close</button>
            </div>
        </div>
    `;
    
    showModal('Prescription Details', content);
    
    document.getElementById('close-prescription-modal').addEventListener('click', closeModal);
}

function showEditPrescriptionForm(id) {
    const prescription = getPrescriptions().find(p => p.id === id);
    if (!prescription) {
        showNotification('Prescription not found', 'error');
        return;
    }
    
    const content = `
        <div class="prescription-form">
            <h3>Edit Prescription</h3>
            <form id="editPrescriptionForm">
                <div class="form-group">
                    <label for="edit-prescription-date">Date</label>
                    <input type="date" id="edit-prescription-date" value="${prescription.date}" required>
                </div>
                
                <div id="prescription-items-edit">
                    ${prescription.medications.map((med, index) => `
                        <div class="prescription-item">
                            ${index > 0 ? '<hr>' : ''}
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Medication Name</label>
                                    <input type="text" class="med-name" value="${med.name}" required>
                                </div>
                                <div class="form-group">
                                    <label>Dosage</label>
                                    <input type="text" class="med-dosage" value="${med.dosage}" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Frequency</label>
                                    <input type="text" class="med-frequency" value="${med.frequency}" required>
                                </div>
                                <div class="form-group">
                                    <label>Duration</label>
                                    <input type="text" class="med-duration" value="${med.duration}" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Instructions</label>
                                <textarea class="med-instructions" rows="2">${med.instructions || ''}</textarea>
                            </div>
                            ${index > 0 ? `
                                <button type="button" class="btn btn-danger btn-sm remove-medication">Remove</button>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
                
                <button type="button" class="btn btn-secondary" id="add-medication-edit">Add Another Medication</button>
                
                <div class="form-group mt-20">
                    <label for="edit-prescription-instructions">Additional Instructions</label>
                    <textarea id="edit-prescription-instructions" rows="3">${prescription.instructions || ''}</textarea>
                </div>
                
                <div class="form-actions mt-20">
                    <button type="button" class="btn btn-secondary" id="cancel-edit-prescription">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
    
    showModal('Edit Prescription', content);
    
    // Add medication button
    document.getElementById('add-medication-edit').addEventListener('click', function() {
        const itemsContainer = document.getElementById('prescription-items-edit');
        const newItem = document.createElement('div');
        newItem.className = 'prescription-item';
        newItem.innerHTML = `
            <hr>
            <div class="form-row">
                <div class="form-group">
                    <label>Medication Name</label>
                    <input type="text" class="med-name" required>
                </div>
                <div class="form-group">
                    <label>Dosage</label>
                    <input type="text" class="med-dosage" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Frequency</label>
                    <input type="text" class="med-frequency" required>
                </div>
                <div class="form-group">
                    <label>Duration</label>
                    <input type="text" class="med-duration" required>
                </div>
            </div>
            <div class="form-group">
                <label>Instructions</label>
                <textarea class="med-instructions" rows="2"></textarea>
            </div>
            <button type="button" class="btn btn-danger btn-sm remove-medication">Remove</button>
        `;
        itemsContainer.appendChild(newItem);
        
        // Add remove button event
        newItem.querySelector('.remove-medication').addEventListener('click', function() {
            itemsContainer.removeChild(newItem);
        });
    });
    
    // Remove medication buttons
    document.querySelectorAll('.remove-medication').forEach(button => {
        button.addEventListener('click', function() {
            const item = this.closest('.prescription-item');
            item.parentNode.removeChild(item);
        });
    });
    
    // Form submission
    document.getElementById('editPrescriptionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const date = document.getElementById('edit-prescription-date').value;
        const instructions = document.getElementById('edit-prescription-instructions').value.trim();
        
        // Get medication data
        const items = Array.from(document.querySelectorAll('#prescription-items-edit .prescription-item')).map(item => {
            return {
                name: item.querySelector('.med-name').value.trim(),
                dosage: item.querySelector('.med-dosage').value.trim(),
                frequency: item.querySelector('.med-frequency').value.trim(),
                duration: item.querySelector('.med-duration').value.trim(),
                instructions: item.querySelector('.med-instructions').value.trim()
            };
        });
        
        // Validate
        if (items.length === 0) {
            showNotification('Please add at least one medication', 'error');
            return;
        }
        
        if (items.some(item => !item.name || !item.dosage || !item.frequency || !item.duration)) {
            showNotification('Please fill in all required medication fields', 'error');
            return;
        }
        
        // Update prescription
        const prescriptions = getPrescriptions();
        const prescriptionIndex = prescriptions.findIndex(p => p.id === id);
        
        if (prescriptionIndex !== -1) {
            prescriptions[prescriptionIndex] = {
                ...prescriptions[prescriptionIndex],
                date,
                medications: items,
                instructions
            };
            
            savePrescriptions(prescriptions);
            showNotification('Prescription updated successfully', 'success');
            closeModal();
            
            // Refresh the view
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            if (currentUser?.role === 'doctor') {
                loadPrescriptionsList(currentUser.id);
            }
        }
    });
    
    // Cancel button
    document.getElementById('cancel-edit-prescription').addEventListener('click', closeModal);
}

function loadDoctorAvailability() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'doctor') return;
    
    const doctor = getDoctors().find(d => d.id === currentUser.id);
    if (!doctor) return;
    
    const content = `
        <div class="doctor-availability">
            <div class="card">
                <div class="card-header">
                    <h3>My Availability</h3>
                </div>
                <div class="card-body">
                    <form id="availabilityForm">
                        <div class="availability-grid">
                            ${Object.entries({
                                monday: 'Monday',
                                tuesday: 'Tuesday',
                                wednesday: 'Wednesday',
                                thursday: 'Thursday',
                                friday: 'Friday',
                                saturday: 'Saturday',
                                sunday: 'Sunday'
                            }).map(([dayKey, dayName]) => {
                                const availability = doctor.availability?.[dayKey] || { start: '', end: '' };
                                return `
                                    <div class="availability-day">
                                        <label>
                                            <input type="checkbox" class="day-checkbox" data-day="${dayKey}" 
                                                ${availability.start ? 'checked' : ''}>
                                            ${dayName}
                                        </label>
                                        <div class="time-inputs" style="display: ${availability.start ? 'flex' : 'none'}">
                                            <input type="time" class="start-time" data-day="${dayKey}" 
                                                value="${availability.start || '09:00'}">
                                            <span>to</span>
                                            <input type="time" class="end-time" data-day="${dayKey}" 
                                                value="${availability.end || '17:00'}">
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        
                        <div class="form-actions mt-20">
                            <button type="button" class="btn btn-secondary" id="cancel-availability">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Availability</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    loadContent(content);
    
    // Toggle time inputs when day checkboxes are clicked
    document.querySelectorAll('.day-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const timeInputs = this.closest('.availability-day').querySelector('.time-inputs');
            timeInputs.style.display = this.checked ? 'flex' : 'none';
        });
    });
    
    // Form submission
    document.getElementById('availabilityForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const availability = {};
        
        // Get checked days and their times
        document.querySelectorAll('.day-checkbox:checked').forEach(checkbox => {
            const day = checkbox.getAttribute('data-day');
            const startTime = document.querySelector(`.start-time[data-day="${day}"]`).value;
            const endTime = document.querySelector(`.end-time[data-day="${day}"]`).value;
            
            if (startTime && endTime) {
                availability[day] = { start: startTime, end: endTime };
            }
        });
        
        // Update doctor in doctors collection
        const doctors = getDoctors();
        const doctorIndex = doctors.findIndex(d => d.id === currentUser.id);
        
        if (doctorIndex !== -1) {
            doctors[doctorIndex].availability = availability;
            saveDoctors(doctors);
        }
        
        // Update doctor in users collection
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id && u.role === 'doctor');
        
        if (userIndex !== -1) {
            users[userIndex].availability = availability;
            saveUsers(users);
            
            // Update current user in session
            const updatedUser = { ...users[userIndex] };
            sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
        
        showNotification('Availability updated successfully', 'success');
    });
    
    // Cancel button
    document.getElementById('cancel-availability').addEventListener('click', function() {
        // Refresh the view to discard changes
        loadDoctorAvailability();
    });
}