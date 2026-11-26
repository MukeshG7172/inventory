package com.inventory.vault.controller;

import com.inventory.vault.dto.OrderRequest;
import com.inventory.vault.dto.OrderResponse;
import com.inventory.vault.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders & Purchases", description = "Endpoints for buying products and viewing purchase history")
@SecurityRequirement(name = "BearerAuth")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/buy")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Buy a product", description = "Allows users with SELLER role to buy available products in inventory.")
    public ResponseEntity<OrderResponse> buyProduct(@Valid @RequestBody OrderRequest request,
                                                    @AuthenticationPrincipal UserDetails userDetails) {
        OrderResponse response = orderService.buyProduct(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-orders")
    @Operation(summary = "List my purchases", description = "Retrieves all purchases made by the current user.")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(orderService.getMyOrders(userDetails.getUsername()));
    }

    @GetMapping("/my-sales")
    @Operation(summary = "List sales of my products", description = "Retrieves all orders placed for products added by the current user.")
    public ResponseEntity<List<OrderResponse>> getMySales(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(orderService.getOrdersForMyProducts(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", description = "Retrieves order details by ID.")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id,
                                                      @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(orderService.getOrderById(id, userDetails.getUsername()));
    }

    @GetMapping
    @Operation(summary = "List all orders", description = "Retrieves all orders in the system.")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }
}
