package com.medlink.tracker.service;

import com.medlink.tracker.exception.ResourceNotFoundException;
import com.medlink.tracker.model.Prescription;
import com.medlink.tracker.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    public Prescription create(Prescription prescription) {
        prescription.setPrescribedDate(LocalDate.now());
        prescription.setStatus("ACTIVE");
        prescription.setCreatedAt(LocalDateTime.now());
        prescription.setUpdatedAt(LocalDateTime.now());
        return prescriptionRepository.save(prescription);
    }

    public List<Prescription> getByPatientId(String patientId) {
        return prescriptionRepository.findByPatientId(patientId);
    }

    public List<Prescription> getByDoctorId(String doctorId) {
        return prescriptionRepository.findByDoctorId(doctorId);
    }

    public Prescription getById(String id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found: " + id));
    }

    public Prescription updateStatus(String id, String status) {
        Prescription prescription = getById(id);
        prescription.setStatus(status);
        prescription.setUpdatedAt(LocalDateTime.now());
        return prescriptionRepository.save(prescription);
    }

    public List<Prescription> getActiveByPatient(String patientId) {
        return prescriptionRepository.findByPatientIdAndStatus(patientId, "ACTIVE");
    }

    public void delete(String id) {
        prescriptionRepository.deleteById(id);
    }
}
