package com.saree.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductFilterOptions {

    private List<String> categories;
    private List<String> fabrics;
    private List<String> colors;
}
