package com.saree.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnquiryRequestDto {

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must be at most 100 characters")
    private String fullName;

    @NotBlank(message = "Business/Boutique name is required")
    @Size(max = 150, message = "Business name must be at most 150 characters")
    private String businessName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be a valid 10-digit number")
    private String phone;

    @Email(message = "Email must be a valid email address")
    @Size(max = 150, message = "Email must be at most 150 characters")
    private String email;

    @NotBlank(message = "City/State is required")
    @Size(max = 100, message = "City must be at most 100 characters")
    private String city;

    private String selectedProduct;

    private String sku;

    @NotBlank(message = "Estimated quantity is required")
    @Size(max = 100, message = "Quantity must be at most 100 characters")
    private String quantity;

    @Size(max = 2000, message = "Message must be at most 2000 characters")
    private String message;

    // Spam Protection fields
    @JsonAlias({"website", "trap"})
    private String honeypot;

    private String turnstileToken;

    /**
     * Normalizes the phone number before validation by stripping whitespace,
     * hyphens, parentheses, and optional country/trunk prefixes (+91, 91, 0).
     */
    public void setPhone(String phone) {
        if (phone != null) {
            String cleaned = phone.replaceAll("[\\s\\-\\(\\)\\.]", "");
            if (cleaned.startsWith("+91") && cleaned.length() == 13) {
                cleaned = cleaned.substring(3);
            } else if (cleaned.startsWith("91") && cleaned.length() == 12) {
                cleaned = cleaned.substring(2);
            } else if (cleaned.startsWith("0") && cleaned.length() == 11) {
                cleaned = cleaned.substring(1);
            }
            this.phone = cleaned;
        } else {
            this.phone = null;
        }
    }
}

