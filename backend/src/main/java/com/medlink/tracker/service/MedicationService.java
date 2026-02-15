package com.medlink.tracker.service;

import com.medlink.tracker.exception.ResourceNotFoundException;
import com.medlink.tracker.model.IntakeLog;
import com.medlink.tracker.model.Medication;
import com.medlink.tracker.repository.IntakeLogRepository;
import com.medlink.tracker.repository.MedicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MedicationService {

    @Autowired private MedicationRepository medicationRepository;
    @Autowired private IntakeLogRepository intakeLogRepository;

    public Medication create(Medication medication) {
        medication.setCreatedAt(LocalDateTime.now());
        return medicationRepository.save(medication);
    }

    public List<Medication> getAll() {
        return medicationRepository.findByActiveTrue();
    }

    public List<Medication> search(String name) {
        return medicationRepository.findByNameContainingIgnoreCase(name);
    }

    public Medication getById(String id) {
        return medicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medication not found: " + id));
    }

    // Intake log operations
    public IntakeLog logIntake(IntakeLog log) {
        log.setCreatedAt(LocalDateTime.now());
        if ("TAKEN".equals(log.getStatus())) {
            log.setTakenAt(LocalDateTime.now());
        }
        return intakeLogRepository.save(log);
    }

    public List<IntakeLog> getTodayIntakes(String patientId) {
        return intakeLogRepository.findByPatientIdAndScheduledDate(patientId, LocalDate.now());
    }

    public List<IntakeLog> getIntakesByDate(String patientId, LocalDate date) {
        return intakeLogRepository.findByPatientIdAndScheduledDate(patientId, date);
    }

    public List<IntakeLog> getIntakeHistory(String patientId) {
        return intakeLogRepository.findByPatientId(patientId);
    }

    public Map<String, Object> getAdherenceStats(String patientId) {
        long taken = intakeLogRepository.countByPatientIdAndStatus(patientId, "TAKEN");
        long missed = intakeLogRepository.countByPatientIdAndStatus(patientId, "MISSED");
        long total = taken + missed;
        double adherenceRate = total > 0 ? (double) taken / total * 100 : 0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("taken", taken);
        stats.put("missed", missed);
        stats.put("total", total);
        stats.put("adherenceRate", Math.round(adherenceRate));
        return stats;
    }

    public IntakeLog updateIntakeStatus(String logId, String status) {
        IntakeLog log = intakeLogRepository.findById(logId)
                .orElseThrow(() -> new ResourceNotFoundException("Intake log not found: " + logId));
        log.setStatus(status);
        if ("TAKEN".equals(status)) {
            log.setTakenAt(LocalDateTime.now());
        }
        return intakeLogRepository.save(log);
    }
}
