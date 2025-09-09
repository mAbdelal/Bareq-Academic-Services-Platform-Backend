const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

// Generate OpenAPI specification from JSDoc comments in route files
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Bareq API",
            version: "1.0.0",
            description: "REST API documentation for Bareq backend",
        },
        servers: [
            { url: "/api/v1" },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            { bearerAuth: [] },
        ],
    },
    apis: [
        path.join(__dirname, "routes", "*.js"),
    ],
}); 

// Mount Swagger UI and JSON spec on the provided Express app
function setupSwagger(app) {
    if (!app) return;
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
    app.get("/api-docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
}

module.exports = { setupSwagger, swaggerSpec }; 


