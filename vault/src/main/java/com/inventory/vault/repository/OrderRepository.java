package com.inventory.vault.repository;

import com.inventory.vault.entity.Order;
import com.inventory.vault.entity.Product;
import com.inventory.vault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByBuyer(User buyer);

    List<Order> findByProduct(Product product);

    List<Order> findByProductAddedBy(User addedBy);
}
