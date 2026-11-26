package com.inventory.vault.entity;

public enum Role {
    BUYER,
    SELLER;

    public String getAuthority() {
        return "ROLE_" + name();
    }
}
