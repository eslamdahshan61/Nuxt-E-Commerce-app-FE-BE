export default defineEventHandler(async (event) => {
  const openApiSpec = {
      openapi: "3.0.0",
      info: {
          title: "E-Commerce API",
          description:
              "Full-stack E-Commerce API with NuxtJS, MySQL, Prisma, and Redis",
          version: "1.0.0",
          contact: {
              name: "API Support",
              email: "eslamdahshan61@gmail.com",
          },
      },
      servers: [
          {
              url: process.env.CORS_ORIGIN,
              description: "Live server",
          },
          {
              url: "http://localhost:3000",
              description: "Development server",
          },
      ],
      tags: [
          { name: "Authentication", description: "Authentication endpoints" },
          { name: "Categories", description: "Category management" },
          { name: "Products", description: "Product management" },
          { name: "Users", description: "User management" },
      ],
      components: {
          securitySchemes: {
              bearerAuth: {
                  type: "http",
                  scheme: "bearer",
                  bearerFormat: "JWT",
              },
          },
          schemas: {
              User: {
                  type: "object",
                  properties: {
                      id: { type: "integer" },
                      username: { type: "string" },
                      email: { type: "string", format: "email" },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                  },
              },
              Category: {
                  type: "object",
                  properties: {
                      id: { type: "integer" },
                      name: { type: "string" },
                      parentId: { type: "integer", nullable: true },
                      parent: {
                          $ref: "#/components/schemas/Category",
                          nullable: true,
                      },
                      children: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Category" },
                      },
                      recursiveProductCount: {
                          type: "integer",
                          description:
                              "Total products in this category and all subcategories",
                      },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                  },
              },
              Product: {
                  type: "object",
                  properties: {
                      id: { type: "integer" },
                      name: { type: "string" },
                      description: { type: "string" },
                      price: { type: "number", format: "decimal" },
                      categoryId: { type: "integer" },
                      category: { $ref: "#/components/schemas/Category" },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                  },
              },
              LoginRequest: {
                  type: "object",
                  required: ["identifier", "password"],
                  properties: {
                      identifier: { type: "string", minLength: 3 },
                      password: { type: "string", minLength: 3 },
                  },
              },
              RegisterRequest: {
                  type: "object",
                  required: ["username", "email", "password"],
                  properties: {
                      username: { type: "string", minLength: 3 },
                      email: { type: "string", format: "email" },
                      password: { type: "string", minLength: 3 },
                  },
              },
              AuthResponse: {
                  type: "object",
                  properties: {
                      user: { $ref: "#/components/schemas/User" },
                      accessToken: { type: "string" },
                      tokenType: { type: "string", default: "Bearer" },
                  },
              },
              PaginatedResponse: {
                  type: "object",
                  properties: {
                      data: { type: "array", items: {} },
                      meta: {
                          type: "object",
                          properties: {
                              total: { type: "integer" },
                              page: { type: "integer" },
                              limit: { type: "integer" },
                              totalPages: { type: "integer" },
                          },
                      },
                  },
              },
              Error: {
                  type: "object",
                  properties: {
                      statusCode: { type: "integer" },
                      statusMessage: { type: "string" },
                      data: { type: "object" },
                  },
              },
          },
      },
      paths: {
          "/api/auth/register": {
              post: {
                  tags: ["Authentication"],
                  summary: "Register a new user",
                  requestBody: {
                      required: true,
                      content: {
                          "application/json": {
                              schema: {
                                  $ref: "#/components/schemas/RegisterRequest",
                              },
                          },
                      },
                  },
                  responses: {
                      "200": {
                          description: "User registered successfully",
                          content: {
                              "application/json": {
                                  schema: {
                                      $ref: "#/components/schemas/AuthResponse",
                                  },
                              },
                          },
                      },
                      "409": { description: "User already exists" },
                      "400": { description: "Invalid input" },
                  },
              },
          },
          "/api/auth/login": {
              post: {
                  tags: ["Authentication"],
                  summary: "Login user",
                  description:
                      "Authenticate user and return JWT token. Use credentials: username=admin, password=admin",
                  requestBody: {
                      required: true,
                      content: {
                          "application/json": {
                              schema: {
                                  $ref: "#/components/schemas/LoginRequest",
                              },
                          },
                      },
                  },
                  responses: {
                      "200": {
                          description: "Login successful",
                          content: {
                              "application/json": {
                                  schema: {
                                      $ref: "#/components/schemas/AuthResponse",
                                  },
                              },
                          },
                      },
                      "401": { description: "Invalid credentials" },
                  },
              },
          },
          "/api/auth/logout": {
              post: {
                  tags: ["Authentication"],
                  summary: "Logout user",
                  security: [{ bearerAuth: [] }],
                  responses: {
                      "200": { description: "Logout successful" },
                      "401": { description: "Unauthorized" },
                  },
              },
          },
          "/api/auth/me": {
              get: {
                  tags: ["Authentication"],
                  summary: "Get current user",
                  security: [{ bearerAuth: [] }],
                  responses: {
                      "200": {
                          description: "Current user details",
                          content: {
                              "application/json": {
                                  schema: { $ref: "#/components/schemas/User" },
                              },
                          },
                      },
                      "401": { description: "Unauthorized" },
                  },
              },
          },
          "/api/categories": {
              get: {
                  tags: ["Categories"],
                  summary: "List all categories with recursive product count",
                  parameters: [
                      {
                          name: "page",
                          in: "query",
                          schema: { type: "integer", default: 1 },
                      },
                      {
                          name: "limit",
                          in: "query",
                          schema: { type: "integer", default: 10 },
                      },
                      {
                          name: "parentId",
                          in: "query",
                          schema: { type: "integer" },
                          description: "Filter by parent category",
                      },
                  ],
                  responses: {
                      "200": {
                          description: "Categories retrieved successfully",
                          content: {
                              "application/json": {
                                  schema: {
                                      allOf: [
                                          {
                                              $ref: "#/components/schemas/PaginatedResponse",
                                          },
                                          {
                                              properties: {
                                                  data: {
                                                      type: "array",
                                                      items: {
                                                          $ref: "#/components/schemas/Category",
                                                      },
                                                  },
                                              },
                                          },
                                      ],
                                  },
                              },
                          },
                      },
                  },
              },
              post: {
                  tags: ["Categories"],
                  summary: "Create a new category",
                  security: [{ bearerAuth: [] }],
                  requestBody: {
                      required: true,
                      content: {
                          "application/json": {
                              schema: {
                                  type: "object",
                                  required: ["name"],
                                  properties: {
                                      name: { type: "string" },
                                      parentId: {
                                          type: "integer",
                                          nullable: true,
                                      },
                                  },
                              },
                          },
                      },
                  },
                  responses: {
                      "200": {
                          description: "Category created",
                          content: {
                              "application/json": {
                                  schema: {
                                      $ref: "#/components/schemas/Category",
                                  },
                              },
                          },
                      },
                      "401": { description: "Unauthorized" },
                      "409": { description: "Category already exists" },
                  },
              },
          },
          "/api/categories/{id}": {
              get: {
                  tags: ["Categories"],
                  summary: "Get category by ID with recursive product count",
                  parameters: [
                      {
                          name: "id",
                          in: "path",
                          required: true,
                          schema: { type: "integer" },
                      },
                  ],
                  responses: {
                      "200": {
                          description: "Category details",
                          content: {
                              "application/json": {
                                  schema: {
                                      $ref: "#/components/schemas/Category",
                                  },
                              },
                          },
                      },
                      "404": { description: "Category not found" },
                  },
              },
              put: {
                  tags: ["Categories"],
                  summary: "Update category",
                  security: [{ bearerAuth: [] }],
                  parameters: [
                      {
                          name: "id",
                          in: "path",
                          required: true,
                          schema: { type: "integer" },
                      },
                  ],
                  requestBody: {
                      required: true,
                      content: {
                          "application/json": {
                              schema: {
                                  type: "object",
                                  properties: {
                                      name: { type: "string" },
                                      parentId: {
                                          type: "integer",
                                          nullable: true,
                                      },
                                  },
                              },
                          },
                      },
                  },
                  responses: {
                      "200": { description: "Category updated" },
                      "401": { description: "Unauthorized" },
                      "404": { description: "Category not found" },
                  },
              },
              delete: {
                  tags: ["Categories"],
                  summary: "Delete category",
                  security: [{ bearerAuth: [] }],
                  parameters: [
                      {
                          name: "id",
                          in: "path",
                          required: true,
                          schema: { type: "integer" },
                      },
                  ],
                  responses: {
                      "200": { description: "Category deleted" },
                      "401": { description: "Unauthorized" },
                      "404": { description: "Category not found" },
                  },
              },
          },
          "/api/products": {
              get: {
                  tags: ["Products"],
                  summary: "List all products",
                  parameters: [
                      {
                          name: "page",
                          in: "query",
                          schema: { type: "integer", default: 1 },
                      },
                      {
                          name: "limit",
                          in: "query",
                          schema: { type: "integer", default: 10 },
                      },
                      {
                          name: "categoryId",
                          in: "query",
                          schema: { type: "integer" },
                      },
                      {
                          name: "search",
                          in: "query",
                          schema: { type: "string" },
                      },
                      {
                          name: "minPrice",
                          in: "query",
                          schema: { type: "number" },
                      },
                      {
                          name: "maxPrice",
                          in: "query",
                          schema: { type: "number" },
                      },
                  ],
                  responses: {
                      "200": {
                          description: "Products retrieved successfully",
                          content: {
                              "application/json": {
                                  schema: {
                                      allOf: [
                                          {
                                              $ref: "#/components/schemas/PaginatedResponse",
                                          },
                                          {
                                              properties: {
                                                  data: {
                                                      type: "array",
                                                      items: {
                                                          $ref: "#/components/schemas/Product",
                                                      },
                                                  },
                                              },
                                          },
                                      ],
                                  },
                              },
                          },
                      },
                  },
              },
              post: {
                  tags: ["Products"],
                  summary: "Create a new product",
                  security: [{ bearerAuth: [] }],
                  requestBody: {
                      required: true,
                      content: {
                          "application/json": {
                              schema: {
                                  type: "object",
                                  required: [
                                      "name",
                                      "description",
                                      "price",
                                      "categoryId",
                                  ],
                                  properties: {
                                      name: { type: "string" },
                                      description: { type: "string" },
                                      price: { type: "number" },
                                      categoryId: { type: "integer" },
                                  },
                              },
                          },
                      },
                  },
                  responses: {
                      "200": { description: "Product created" },
                      "401": { description: "Unauthorized" },
                  },
              },
          },
          "/api/products/{id}": {
              get: {
                  tags: ["Products"],
                  summary: "Get product by ID",
                  parameters: [
                      {
                          name: "id",
                          in: "path",
                          required: true,
                          schema: { type: "integer" },
                      },
                  ],
                  responses: {
                      "200": {
                          description: "Product details",
                          content: {
                              "application/json": {
                                  schema: {
                                      $ref: "#/components/schemas/Product",
                                  },
                              },
                          },
                      },
                      "404": { description: "Product not found" },
                  },
              },
              put: {
                  tags: ["Products"],
                  summary: "Update product",
                  security: [{ bearerAuth: [] }],
                  parameters: [
                      {
                          name: "id",
                          in: "path",
                          required: true,
                          schema: { type: "integer" },
                      },
                  ],
                  requestBody: {
                      content: {
                          "application/json": {
                              schema: {
                                  type: "object",
                                  properties: {
                                      name: { type: "string" },
                                      description: { type: "string" },
                                      price: { type: "number" },
                                      categoryId: { type: "integer" },
                                  },
                              },
                          },
                      },
                  },
                  responses: {
                      "200": { description: "Product updated" },
                      "401": { description: "Unauthorized" },
                      "404": { description: "Product not found" },
                  },
              },
              delete: {
                  tags: ["Products"],
                  summary: "Delete product",
                  security: [{ bearerAuth: [] }],
                  parameters: [
                      {
                          name: "id",
                          in: "path",
                          required: true,
                          schema: { type: "integer" },
                      },
                  ],
                  responses: {
                      "200": { description: "Product deleted" },
                      "401": { description: "Unauthorized" },
                      "404": { description: "Product not found" },
                  },
              },
          },
          "/api/users": {
              get: {
                  tags: ["Users"],
                  summary: "List all users",
                  security: [{ bearerAuth: [] }],
                  parameters: [
                      {
                          name: "page",
                          in: "query",
                          schema: { type: "integer", default: 1 },
                      },
                      {
                          name: "limit",
                          in: "query",
                          schema: { type: "integer", default: 10 },
                      },
                  ],
                  responses: {
                      "200": { description: "Users retrieved successfully" },
                      "401": { description: "Unauthorized" },
                  },
              },
          },
          "/api/users/{id}": {
              get: {
                  tags: ["Users"],
                  summary: "Get user by ID",
                  security: [{ bearerAuth: [] }],
                  parameters: [
                      {
                          name: "id",
                          in: "path",
                          required: true,
                          schema: { type: "integer" },
                      },
                  ],
                  responses: {
                      "200": { description: "User details" },
                      "401": { description: "Unauthorized" },
                      "404": { description: "User not found" },
                  },
              },
              put: {
                  tags: ["Users"],
                  summary: "Update user profile",
                  security: [{ bearerAuth: [] }],
                  parameters: [
                      {
                          name: "id",
                          in: "path",
                          required: true,
                          schema: { type: "integer" },
                      },
                  ],
                  requestBody: {
                      content: {
                          "application/json": {
                              schema: {
                                  type: "object",
                                  properties: {
                                      username: { type: "string" },
                                      email: { type: "string" },
                                      password: { type: "string" },
                                  },
                              },
                          },
                      },
                  },
                  responses: {
                      "200": { description: "User updated" },
                      "401": { description: "Unauthorized" },
                      "403": {
                          description:
                              "Forbidden - Can only update own profile",
                      },
                      "404": { description: "User not found" },
                  },
              },
          },
      },
  };

  return openApiSpec;
});
