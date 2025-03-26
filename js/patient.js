// Patient Dashboard Functions

function loadBookAppointment() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'patient') return;
    
    const doctors = getDoctors();
    const specializations = [...new Set(doctors.map(d => d.specialization))];
    
    const content = `
        <div class="book-appointment">
            <div class="card">
                <div class="card-header">
                    <h3>Book New Appointment</h3>
                </div>
                <div class="card-body">
                    <form id="bookAppointmentForm">
                        <div class="form-group">
                            <label for="appointment-specialization">Specialization</label>
                            <select id="appointment-specialization" required>
                                <option value="">Select Specialization</option>
                                ${specializations.map(spec => `
                                    <option value="${spec}">${spec}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="appointment-doctor">Doctor</label>
                            <select id="appointment-doctor" required disabled>
                                <option value="">Select Doctor</option>
                            </select>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="appointment-date">Date</label>
                                <input type="date" id="appointment-date" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="appointment-time">Time</label>
                                <input type="time" id="appointment-time" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="appointment-reason">Reason</label>
                            <textarea id="appointment-reason" rows="3" placeholder="Please describe the reason for your appointment"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="cancel-book-appointment">Cancel</button>
                            <button type="submit" class="btn btn-primary">Book Appointment</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    loadContent(content);
    
    // Set default date to today
    document.getElementById('appointment-date').valueAsDate = new Date();
    
    // Update doctor dropdown based on specialization selection
    document.getElementById('appointment-specialization').addEventListener('change', function() {
        const specialization = this.value;
        const doctorSelect = document.getElementById('appointment-doctor');
        
        doctorSelect.innerHTML = '<option value="">Select Doctor</option>';
        doctorSelect.disabled = !specialization;
        
        if (specialization) {
            const filteredDoctors = doctors.filter(d => d.specialization === specialization);
            
            filteredDoctors.forEach(doctor => {
                const option = document.createElement('option');
                option.value = doctor.id;
                option.textContent = `Dr. ${doctor.name}`;
                doctorSelect.appendChild(option);
            });
        }
    });
    
    // Form submission
    document.getElementById('bookAppointmentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const doctorId = parseInt(document.getElementById('appointment-doctor').value);
        const date = document.getElementById('appointment-date').value;
        const time = document.getElementById('appointment-time').value;
        const reason = document.getElementById('appointment-reason').value.trim();
        
        // Validate
        if (!doctorId || !date || !time) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Get doctor details
        const doctor = doctors.find(d => d.id === doctorId);
        if (!doctor) {
            showNotification('Doctor not found', 'error');
            return;
        }
        
        // Check if doctor is available at this time
        const dayOfWeek = new Date(date).toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
        const doctorAvailability = doctor.availability[dayOfWeek];
        
        if (!doctorAvailability) {
            showNotification('Doctor is not available on this day', 'error');
            return;
        }
        
        const appointmentTime = new Date(`1970-01-01T${time}`);
        const startTime = new Date(`1970-01-01T${doctorAvailability.start}`);
        const endTime = new Date(`1970-01-01T${doctorAvailability.end}`);
        
        if (appointmentTime < startTime || appointmentTime > endTime) {
            showNotification(`Doctor is only available from ${doctorAvailability.start} to ${doctorAvailability.end} on ${dayOfWeek}`, 'error');
            return;
        }
        
        // Check if doctor already has an appointment at this time
        const existingAppointment = getAppointments().find(a => 
            a.doctorId === doctorId && 
            a.date === date && 
            a.time === time && 
            a.status !== 'cancelled'
        );
        
        if (existingAppointment) {
            showNotification('Doctor already has an appointment at this time', 'error');
            return;
        }
        
        // Create new appointment
        const newAppointment = {
            id: generateId(getAppointments()),
            patientId: currentUser.id,
            patientName: currentUser.name,
            doctorId,
            doctorName: doctor.name,
            date,
            time,
            reason,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        const appointments = getAppointments();
        appointments.push(newAppointment);
        saveAppointments(appointments);
        
        showNotification('Appointment booked successfully', 'success');
        
        // Redirect to appointments list
        loadPatientAppointments();
    });
    
    // Cancel button
    document.getElementById('cancel-book-appointment').addEventListener('click', function() {
        loadPatientDashboard();
    });
}

// ... (rest of the patient.js file remains the same)