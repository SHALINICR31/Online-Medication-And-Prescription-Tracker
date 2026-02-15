package com.medlink.tracker.service;

import com.medlink.tracker.exception.ResourceNotFoundException;
import com.medlink.tracker.model.Doctor;
import com.medlink.tracker.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    public Doctor getById(String id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + id));
    }

    public Doctor getByUserId(String userId) {
        return doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user: " + userId));
    }

    public List<Doctor> getAll() {
        return doctorRepository.findAll();
    }

    public List<Doctor> getBySpecialization(String specialization) {
        return doctorRepository.findBySpecialization(specialization);
    }

    public Doctor update(String id, Doctor updatedDoctor) {
        Doctor doctor = getById(id);
        doctor.setSpecialization(updatedDoctor.getSpecialization());
        doctor.setHospital(updatedDoctor.getHospital());
        doctor.setDepartment(updatedDoctor.getDepartment());
        doctor.setQualifications(updatedDoctor.getQualifications());
        doctor.setYearsOfExperience(updatedDoctor.getYearsOfExperience());
        doctor.setConsultationTimings(updatedDoctor.getConsultationTimings());
        doctor.setAvailable(updatedDoctor.isAvailable());
        doctor.setUpdatedAt(LocalDateTime.now());
        return doctorRepository.save(doctor);
    }

    public void addPatient(String doctorId, String patientId) {
        Doctor doctor = getById(doctorId);
        List<String> patients = doctor.getPatientIds();
        if (!patients.contains(patientId)) {
            patients.add(patientId);
            doctor.setPatientIds(patients);
            doctorRepository.save(doctor);
        }
    }
}
