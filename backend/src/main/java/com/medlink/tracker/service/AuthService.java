package com.medlink.tracker.service;

import com.medlink.tracker.model.Doctor;
import com.medlink.tracker.model.Patient;
import com.medlink.tracker.model.User;
import com.medlink.tracker.repository.DoctorRepository;
import com.medlink.tracker.repository.PatientRepository;
import com.medlink.tracker.repository.UserRepository;
import com.medlink.tracker.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private PatientRepository patientRepository;
    @Autowired private DoctorRepository doctorRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    public Map<String, Object> register(Map<String, String> request) {
        String email = request.get("email");
String roleStr = request.get("role");
if (roleStr == null || roleStr.isEmpty()) {
    throw new RuntimeException("Role is required");
}
String role = roleStr.toUpperCase();
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(request.get("name"));
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.get("password")));
        user.setRole(role);
        user.setPhoneNumber(request.get("phoneNumber"));
        userRepository.save(user);

        // Create role-specific profile
        if ("PATIENT".equals(role)) {
            Patient patient = new Patient();
            patient.setUserId(user.getId());
            patient.setName(user.getName());
            patient.setEmail(user.getEmail());
            patient.setPhoneNumber(user.getPhoneNumber());
            patientRepository.save(patient);
        } else if ("DOCTOR".equals(role)) {
            Doctor doctor = new Doctor();
            doctor.setUserId(user.getId());
            doctor.setName(user.getName());
            doctor.setEmail(user.getEmail());
            doctor.setPhoneNumber(user.getPhoneNumber());
            doctor.setSpecialization(request.getOrDefault("specialization", "General"));
            doctor.setLicenseNumber(request.getOrDefault("licenseNumber", ""));
            doctorRepository.save(doctor);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole());
        response.put("userId", user.getId());
        response.put("name", user.getName());
        return response;
    }

    public Map<String, Object> login(Map<String, String> request) {
        String email = request.get("email");
        Optional<User> optUser = userRepository.findByEmail(email);

        if (optUser.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = optUser.get();
        if (!passwordEncoder.matches(request.get("password"), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        String profileId = null;
        if ("PATIENT".equals(user.getRole())) {
            profileId = patientRepository.findByUserId(user.getId())
                    .map(p -> p.getId()).orElse(null);
        } else if ("DOCTOR".equals(user.getRole())) {
            profileId = doctorRepository.findByUserId(user.getId())
                    .map(d -> d.getId()).orElse(null);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole());
        response.put("userId", user.getId());
        response.put("profileId", profileId);
        response.put("name", user.getName());
        return response;
    }
}
