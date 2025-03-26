// Admin Dashboard Functions with API integration

async function loadAdminDashboard() {
    try {
        const token = localStorage.getItem('token');
        
        // Fetch stats in parallel
        const [doctorsRes, patientsRes, appointmentsRes, billsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/admin/doctors`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }),
            fetch(`${API_BASE_URL}/admin/patients`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }),
            fetch(`${API_BASE_URL}/admin/appointments`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }),
            fetch(`${API_BASE_URL}/admin/bills?status=paid&paymentDate=${new Date().toISOString().split('T')[0]}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
        ]);
        
        const [doctors, patients, appointments, bills] = await Promise.all([
            doctorsRes.json(),
            patientsRes.json(),
            appointmentsRes.json(),
            billsRes.json()
        ]);
        
        // Calculate today's revenue
        const todayRevenue = bills.data.reduce((sum, bill) => sum + bill.total, 0);
        
        const content = `
            <div class="dashboard-overview">
                <h2>Admin Dashboard</h2>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-user-md"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="doctors-count">${doctors.count || 0}</h3>
                            <p>Doctors</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-procedures"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="patients-count">${patients.count || 0}</h3>
                            <p>Patients</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="appointments-count">${appointments.count || 0}</h3>
                            <p>Appointments</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="revenue-count">${formatCurrency(todayRevenue)}</h3>
                            <p>Today's Revenue</p>
                        </div>
                    </div>
                </div>
                
                <div class="recent-appointments mt-20">
                    <div class="card">
                        <div class="card-header">
                            <h3>Recent Appointments</h3>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Patient</th>
                                            <th>Doctor</th>
                                            <th>Date & Time</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="recent-appointments-list">
                                        <!-- Appointments will be loaded here -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        loadContent(content);
        
        // Load recent appointments
        loadRecentAppointments();
    } catch (error) {
        showNotification('Failed to load dashboard data', 'error');
        console.error('Dashboard error:', error);
    }
}

async function loadRecentAppointments() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/appointments?sort=-createdAt&limit=5`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const { data: appointments } = await response.json();
        
        const appointmentsList = document.getElementById('recent-appointments-list');
        if (!appointmentsList) return;
        
        appointmentsList.innerHTML = '';
        
        if (!appointments || appointments.length === 0) {
            appointmentsList.innerHTML = '<tr><td colspan="5" class="text-center">No recent appointments found</td></tr>';
            return;
        }
        
        appointments.forEach(appointment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${appointment.patientName}</td>
                <td>${appointment.doctorName}</td>
                <td>${formatDate(appointment.date)} at ${formatTime(appointment.time)}</td>
                <td><span class="status-badge ${appointment.status}">${appointment.status}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm view-appointment" data-id="${appointment._id}">View</button>
                </td>
            `;
            appointmentsList.appendChild(row);
        });
        
        // Add event listeners to view buttons
        document.querySelectorAll('.view-appointment').forEach(button => {
            button.addEventListener('click', function() {
                const appointmentId = this.getAttribute('data-id');
                viewAppointment(appointmentId);
            });
        });
    } catch (error) {
        showNotification('Failed to load appointments', 'error');
        console.error('Appointments error:', error);
    }
}

async function viewAppointment(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/appointments/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const { data: appointment } = await response.json();
        
        if (!appointment) {
            showNotification('Appointment not found', 'error');
            return;
        }
        
        const content = `
            <div class="appointment-details">
                <h3>Appointment Details</h3>
                
                <div class="detail-row">
                    <div class="detail-label">Patient:</div>
                    <div class="detail-value">${appointment.patientName}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Doctor:</div>
                    <div class="detail-value">${appointment.doctorName}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Date:</div>
                    <div class="detail-value">${formatDate(appointment.date)}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Time:</div>
                    <div class="detail-value">${formatTime(appointment.time)}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Reason:</div>
                    <div class="detail-value">${appointment.reason || 'Not specified'}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value"><span class="status-badge ${appointment.status}">${appointment.status}</span></div>
                </div>
                
                ${appointment.notes ? `
                <div class="detail-row">
                    <div class="detail-label">Notes:</div>
                    <div class="detail-value">${appointment.notes}</div>
                </div>
                ` : ''}
                
                <div class="detail-actions mt-20">
                    <button class="btn btn-primary" id="close-appointment-modal">Close</button>
                </div>
            </div>
        `;
        
        showModal('Appointment Details', content);
        
        document.getElementById('close-appointment-modal').addEventListener('click', closeModal);
    } catch (error) {
        showNotification('Failed to load appointment details', 'error');
        console.error('Appointment error:', error);
    }
}