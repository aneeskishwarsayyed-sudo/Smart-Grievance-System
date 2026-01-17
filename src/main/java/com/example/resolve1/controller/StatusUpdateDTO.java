package com.example.resolve1.controller;

public class StatusUpdateDTO {
    private String status;
    private String note;
    private Long employeeId;

    public StatusUpdateDTO() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
}