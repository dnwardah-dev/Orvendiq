package com.orvendiq.backend.auth;

import jakarta.persistence.*;

@Entity
@Table(name = "ROLES")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ROLE_ID")
    private Long roleId;

    @Column(name = "ROLE_NAME", nullable = false, unique = true, length = 30)
    private String roleName;

    protected Role() {}

    public Long getRoleId() { return roleId; }
    public String getRoleName() { return roleName; }
}