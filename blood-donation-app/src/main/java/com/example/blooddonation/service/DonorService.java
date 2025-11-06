package com.example.blooddonation.service;

import com.example.blooddonation.model.Donor;
import com.example.blooddonation.repository.DonorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DonorService {
    private final DonorRepository donorRepository;

    public DonorService(DonorRepository donorRepository){ this.donorRepository = donorRepository; }

    public List<Donor> getAllDonors(){ return donorRepository.findAll(); }
    public Donor saveDonor(Donor donor){ return donorRepository.save(donor); }
    public void deleteDonor(Long id){ donorRepository.deleteById(id); }
    public Donor getDonor(Long id){ return donorRepository.findById(id).orElse(null); }

    // Added method to match DashboardController
    public List<Donor> filterDonors(String name, String bloodGroup, String city){
        // For now, just return all donors (parameters can be used later for filtering)
        return donorRepository.findAll();
    }
}
