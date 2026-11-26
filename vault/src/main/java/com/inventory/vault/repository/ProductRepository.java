package com.inventory.vault.repository;

import com.inventory.vault.entity.Product;
import com.inventory.vault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByAddedBy(User user);

    List<Product> findByQuantityGreaterThan(Integer minQuantity);

    List<Product> findByNameContainingIgnoreCase(String name);
}
