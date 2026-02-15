package com.medlink.tracker.controller;

import com.medlink.tracker.model.Prescription;
import com.medlink.tracker.service.PrescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "*")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    @PostMapping
    public ResponseEntity<Prescription> create(@RequestBody Prescription prescription) {
        return ResponseEntity.ok(prescriptionService.create(prescription));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Prescription>> getByPatient(@PathVariable String patientId) {
        return ResponseEntity.ok(prescriptionService.getByPatientId(patientId));
    }

    @GetMapping("/patient/{patientId}/active")
    public ResponseEntity<List<Prescription>> getActiveByPatient(@PathVariable String patientId) {
        return ResponseEntity.ok(prescriptionService.getActiveByPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Prescription>> getByDoctor(@PathVariable String doctorId) {
        return ResponseEntity.ok(prescriptionService.getByDoctorId(doctorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prescription> getById(@PathVariable String id) {
        return ResponseEntity.ok(prescriptionService.getById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Prescription> updateStatus(@PathVariable String id,
                                                      @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(prescriptionService.updateStatus(id, body.get("status")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        prescriptionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
