package com.inventory.vault.service;

import com.inventory.vault.dto.OrderRequest;
import com.inventory.vault.dto.OrderResponse;
import com.inventory.vault.entity.Order;
import com.inventory.vault.entity.OrderStatus;
import com.inventory.vault.entity.Product;
import com.inventory.vault.entity.Role;
import com.inventory.vault.entity.User;
import com.inventory.vault.exception.ResourceNotFoundException;
import com.inventory.vault.repository.OrderRepository;
import com.inventory.vault.repository.ProductRepository;
import com.inventory.vault.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderResponse buyProduct(OrderRequest request, String buyerUsername) {
        User buyer = userRepository.findByUsername(buyerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + buyerUsername));

        if (buyer.getRole() != Role.SELLER) {
            throw new AccessDeniedException("Only users with SELLER role can buy products.");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (!product.hasStock(request.getQuantity())) {
            throw new IllegalStateException("Insufficient stock! Requested: " + request.getQuantity() +
                    ", Available: " + product.getQuantity());
        }

        product.decreaseStock(request.getQuantity());
        productRepository.save(product);

        BigDecimal totalPrice = product.getPrice().multiply(BigDecimal.valueOf(request.getQuantity()));

        Order order = new Order(
                buyer,
                product,
                request.getQuantity(),
                product.getPrice(),
                totalPrice,
                OrderStatus.COMPLETED
        );

        Order savedOrder = orderRepository.save(order);
        return OrderResponse.fromEntity(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(String buyerUsername) {
        User buyer = userRepository.findByUsername(buyerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + buyerUsername));

        return orderRepository.findByBuyer(buyer)
                .stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersForMyProducts(String sellerUsername) {
        User seller = userRepository.findByUsername(sellerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + sellerUsername));

        return orderRepository.findByProductAddedBy(seller)
                .stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id, String username) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        boolean isBuyer = order.getBuyer().getUsername().equals(username);
        boolean isSeller = order.getProduct().getAddedBy().getUsername().equals(username);

        if (!isBuyer && !isSeller) {
            throw new AccessDeniedException("You are not authorized to view this order.");
        }

        return OrderResponse.fromEntity(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }
}
