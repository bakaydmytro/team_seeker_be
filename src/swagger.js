const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0", 
    info: {
      title: "API Documentation",
      version: "1.2.9",
      description: "API documentation for backend developers",
    },
    servers: [
      {
        url: "http://localhost:5000", 
      },
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
  },
  apis: ["./src/routes/userRoutes.js", "./src/routes/chatRoutes.js", "./src/routes/friendRoutes.js",
         "./src/routes/adminRoutes.js",
  ], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

