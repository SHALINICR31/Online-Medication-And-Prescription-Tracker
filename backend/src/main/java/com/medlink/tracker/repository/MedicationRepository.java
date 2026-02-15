package com.medlink.tracker.repository;

import com.medlink.tracker.model.Medication;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MedicationRepository extends MongoRepository<Medication, String> {
    List<Medication> findByCategory(String category);
    List<Medication> findByNameContainingIgnoreCase(String name);
    List<Medication> findByActiveTrue();
}
