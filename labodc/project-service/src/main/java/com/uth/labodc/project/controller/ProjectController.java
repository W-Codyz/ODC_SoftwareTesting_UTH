package com.uth.labodc.project.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.uth.labodc.project.dto.CreateProjectRequest;
import com.uth.labodc.project.dto.ProjectDetailResponse;
import com.uth.labodc.project.dto.ProjectResponse;
import com.uth.labodc.project.security.AuthenticatedUser;
import com.uth.labodc.project.service.ProjectService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectResponse create(@Valid @RequestBody CreateProjectRequest request, Authentication authentication) {
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        return projectService.createProject(user, request);
    }

    @GetMapping("/my")
    public List<ProjectResponse> my(Authentication authentication) {
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        return projectService.getMyProjects(user);
    }

    @PutMapping("/{id}/approve")
    public ProjectResponse approve(@PathVariable long id) {
        return projectService.approve(id);
    }

    @PutMapping("/{id}/reject")
        public ProjectResponse reject(@PathVariable long id) {
        return projectService.reject(id);
    }

    @PostMapping("/{id}/join")
    public ProjectDetailResponse join(@PathVariable long id, Authentication authentication) {
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        return projectService.join(id, user);
    }

    @GetMapping("/{id}")
    public ProjectDetailResponse get(@PathVariable long id, Authentication authentication) {
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        return projectService.getProject(id, user);
    }
}