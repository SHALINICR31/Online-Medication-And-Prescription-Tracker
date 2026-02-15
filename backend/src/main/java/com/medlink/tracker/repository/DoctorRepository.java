package com.medlink.tracker.repository;

import com.medlink.tracker.model.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends MongoRepository<Doctor, String> {
    Optional<Doctor> findByUserId(String userId);
    List<Doctor> findBySpecialization(String specialization);
    List<Doctor> findByAvailableTrue();
    boolean existsByUserId(String userId);
}
