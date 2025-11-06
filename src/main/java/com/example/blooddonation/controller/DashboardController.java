package com.example.blooddonation.controller;

import com.example.blooddonation.model.Donor;
import com.example.blooddonation.model.Request;
import com.example.blooddonation.service.DonorService;
import com.example.blooddonation.service.RequestService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class DashboardController {

    private final DonorService donorService;
    private final RequestService requestService;

    public DashboardController(DonorService donorService, RequestService requestService) {
        this.donorService = donorService;
        this.requestService = requestService;
    }

    @GetMapping("/")
    public String dashboard(Model model) {
        // Fetch all donors and requests
        List<Donor> donors = donorService.filterDonors(null, null, null);  // Using filter method
        List<Request> requests = requestService.filterRequests(null, null, null);

        // Add attributes for Thymeleaf
        model.addAttribute("donors", donors);
        model.addAttribute("requests", requests);
        model.addAttribute("totalDonors", donors.size());
        model.addAttribute("totalRequests", requests.size());

        return "dashboard"; // Renders dashboard.html
    }
}
