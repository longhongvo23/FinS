package com.stockapp.userservice.web.rest.vm;

import jakarta.validation.constraints.NotBlank;

/**
 * View Model for delete account request
 */
public class DeleteAccountVM {

    @NotBlank(message = "Password is required")
    private String password;

    public DeleteAccountVM() {
        // Empty constructor needed for Jackson.
    }

    public DeleteAccountVM(String password) {
        this.password = password;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "DeleteAccountVM{" +
                "password='[PROTECTED]'" +
                '}';
    }
}
