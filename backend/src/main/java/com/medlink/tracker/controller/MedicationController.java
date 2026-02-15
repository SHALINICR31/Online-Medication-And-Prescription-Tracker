package com.medlink.tracker.controller;

import com.medlink.tracker.model.IntakeLog;
import com.medlink.tracker.model.Medication;
import com.medlink.tracker.service.MedicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medications")
@CrossOrigin(origins = "*")
public class MedicationController {

    @Autowired
    private MedicationService medicationService;

    @PostMapping
    public ResponseEntity<Medication> create(@RequestBody Medication medication) {
        return ResponseEntity.ok(medicationService.create(medication));
    }

    @GetMapping
    public ResponseEntity<List<Medication>> getAll() {
        return ResponseEntity.ok(medicationService.getAll());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Medication>> search(@RequestParam String name) {
        return ResponseEntity.ok(medicationService.search(name));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medication> getById(@PathVariable String id) {
        return ResponseEntity.ok(medicationService.getById(id));
    }

    // Intake log endpoints
    @PostMapping("/intake")
    public ResponseEntity<IntakeLog> logIntake(@RequestBody IntakeLog log) {
        return ResponseEntity.ok(medicationService.logIntake(log));
    }

    @GetMapping("/intake/today/{patientId}")
    public ResponseEntity<List<IntakeLog>> getTodayIntakes(@PathVariable String patientId) {
        return ResponseEntity.ok(medicationService.getTodayIntakes(patientId));
    }

    @GetMapping("/intake/history/{patientId}")
    public ResponseEntity<List<IntakeLog>> getIntakeHistory(@PathVariable String patientId) {
        return ResponseEntity.ok(medicationService.getIntakeHistory(patientId));
    }

    @GetMapping("/intake/{patientId}/date")
    public ResponseEntity<List<IntakeLog>> getByDate(
            @PathVariable String patientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(medicationService.getIntakesByDate(patientId, date));
    }

    @GetMapping("/adherence/{patientId}")
    public ResponseEntity<Map<String, Object>> getAdherence(@PathVariable String patientId) {
        return ResponseEntity.ok(medicationService.getAdherenceStats(patientId));
    }

    @PatchMapping("/intake/{logId}/status")
    public ResponseEntity<IntakeLog> updateStatus(@PathVariable String logId,
                                                   @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(medicationService.updateIntakeStatus(logId, body.get("status")));
    }
}
