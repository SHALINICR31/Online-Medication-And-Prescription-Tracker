package com.medlink.tracker.repository;

import com.medlink.tracker.model.Prescription;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PrescriptionRepository extends MongoRepository<Prescription, String> {
    List<Prescription> findByPatientId(String patientId);
    List<Prescription> findByDoctorId(String doctorId);
    List<Prescription> findByPatientIdAndStatus(String patientId, String status);
    List<Prescription> findByDoctorIdAndStatus(String doctorId, String status);
}
