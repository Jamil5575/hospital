// Initialize localStorage with sample data if empty
const doctorSpecializations = [
    "General Practitioner",
    "Cardiologist",
    "Dermatologist",
    "Pediatrician",
    "Neurologist",
    "Oncologist",
    "Psychiatrist",
    "Surgeon",
    "Orthopedic Surgeon",
    "Ophthalmologist",
    "ENT Specialist",
    "Gynecologist",
    "Urologist",
    "Endocrinologist",
    "Gastroenterologist",
    "Pulmonologist",
    "Nephrologist",
    "Rheumatologist",
    "Allergist/Immunologist",
    "Infectious Disease Specialist",
    "Anesthesiologist",
    "Radiologist",
    "Pathologist",
    "Emergency Medicine",
    "Sports Medicine",
    "Geriatric Medicine",
    "Hematologist",
    "Plastic Surgeon",
    "Cardiothoracic Surgeon",
    "Neurosurgeon",
    "Vascular Surgeon",
    "Maxillofacial Surgeon",
    "Physical Medicine and Rehabilitation",
    "Pain Management",
    "Sleep Medicine",
    "Nuclear Medicine",
    "Preventive Medicine",
    "Occupational Medicine",
    "Family Medicine",
    "Internal Medicine",
    "Critical Care Medicine",
    "Palliative Care",
    "Neonatologist",
    "Perinatologist",
    "Reproductive Endocrinologist",
    "Andrologist",
    "Diabetologist",
    "Hepatologist",
    "Proctologist",
    "Podiatrist"
];

function initializeData() {
    if (!localStorage.getItem('hospitalUsers')) {
        const users = [
            {
                id: 1,
                name: 'Admin User',
                email: 'admin@hospital.com',
                password: 'admin123',
                role: 'admin',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Dr. John Smith',
                email: 'doctor@hospital.com',
                password: 'doctor123',
                role: 'doctor',
                specialization: 'Cardiologist',
                availability: {
                    monday: { start: '09:00', end: '17:00' },
                    tuesday: { start: '09:00', end: '17:00' },
                    wednesday: { start: '09:00', end: '17:00' },
                    thursday: { start: '09:00', end: '17:00' },
                    friday: { start: '09:00', end: '17:00' }
                },
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                name: 'Patient One',
                email: 'patient@hospital.com',
                password: 'patient123',
                role: 'patient',
                medicalHistory: [],
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('hospitalUsers', JSON.stringify(users));
    }

    if (!localStorage.getItem('hospitalPatients')) {
        const patients = [
            {
                id: 3,
                name: 'Patient One',
                email: 'patient@hospital.com',
                phone: '1234567890',
                address: '123 Main St, City',
                bloodGroup: 'A+',
                allergies: ['Penicillin'],
                medicalHistory: [
                    {
                        date: '2023-01-15',
                        diagnosis: 'Common cold',
                        treatment: 'Rest and hydration',
                        doctor: 'Dr. John Smith'
                    }
                ],
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('hospitalPatients', JSON.stringify(patients));
    }

    if (!localStorage.getItem('hospitalDoctors')) {
        const doctors = [
            {
                id: 2,
                name: 'Dr. John Smith',
                email: 'doctor@hospital.com',
                specialization: 'Cardiologist',
                phone: '9876543210',
                availability: {
                    monday: { start: '09:00', end: '17:00' },
                    tuesday: { start: '09:00', end: '17:00' },
                    wednesday: { start: '09:00', end: '17:00' },
                    thursday: { start: '09:00', end: '17:00' },
                    friday: { start: '09:00', end: '17:00' }
                },
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('hospitalDoctors', JSON.stringify(doctors));
    }

    if (!localStorage.getItem('hospitalAppointments')) {
        const appointments = [
            {
                id: 1,
                patientId: 3,
                patientName: 'Patient One',
                doctorId: 2,
                doctorName: 'Dr. John Smith',
                date: '2023-06-15',
                time: '10:00',
                reason: 'Regular checkup',
                status: 'completed',
                notes: 'Patient doing well',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                patientId: 3,
                patientName: 'Patient One',
                doctorId: 2,
                doctorName: 'Dr. John Smith',
                date: '2023-06-20',
                time: '14:00',
                reason: 'Follow up',
                status: 'pending',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('hospitalAppointments', JSON.stringify(appointments));
    }

    if (!localStorage.getItem('hospitalPrescriptions')) {
        const prescriptions = [
            {
                id: 1,
                patientId: 3,
                patientName: 'Patient One',
                doctorId: 2,
                doctorName: 'Dr. John Smith',
                date: '2023-06-15',
                medications: [
                    {
                        name: 'Paracetamol',
                        dosage: '500mg',
                        frequency: 'Every 6 hours',
                        duration: '3 days'
                    }
                ],
                instructions: 'Take after meals',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('hospitalPrescriptions', JSON.stringify(prescriptions));
    }

    if (!localStorage.getItem('hospitalBills')) {
        const bills = [
            {
                id: 1,
                patientId: 3,
                patientName: 'Patient One',
                appointmentId: 1,
                items: [
                    {
                        description: 'Consultation Fee',
                        amount: 100
                    },
                    {
                        description: 'Lab Tests',
                        amount: 150
                    }
                ],
                total: 250,
                status: 'paid',
                paymentDate: '2023-06-15',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('hospitalBills', JSON.stringify(bills));
    }
}

// Call initialize function when the page loads
window.addEventListener('DOMContentLoaded', initializeData);

// Data access functions
function getUsers() {
    return JSON.parse(localStorage.getItem('hospitalUsers')) || [];
}

function getPatients() {
    return JSON.parse(localStorage.getItem('hospitalPatients')) || [];
}

function getDoctors() {
    return JSON.parse(localStorage.getItem('hospitalDoctors')) || [];
}

function getAppointments() {
    return JSON.parse(localStorage.getItem('hospitalAppointments')) || [];
}

function getPrescriptions() {
    return JSON.parse(localStorage.getItem('hospitalPrescriptions')) || [];
}

function getBills() {
    return JSON.parse(localStorage.getItem('hospitalBills')) || [];
}

function saveUsers(users) {
    localStorage.setItem('hospitalUsers', JSON.stringify(users));
}

function savePatients(patients) {
    localStorage.setItem('hospitalPatients', JSON.stringify(patients));
}

function saveDoctors(doctors) {
    localStorage.setItem('hospitalDoctors', JSON.stringify(doctors));
}

function saveAppointments(appointments) {
    localStorage.setItem('hospitalAppointments', JSON.stringify(appointments));
}

function savePrescriptions(prescriptions) {
    localStorage.setItem('hospitalPrescriptions', JSON.stringify(prescriptions));
}

function saveBills(bills) {
    localStorage.setItem('hospitalBills', JSON.stringify(bills));
}

// Helper function to generate IDs
function generateId(items) {
    return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
}

// Get all specializations
function getDoctorSpecializations() {
    return doctorSpecializations;
}