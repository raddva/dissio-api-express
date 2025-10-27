import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Dissio API",
    description: "API documentation for Dissio",
  },
  servers: [
    {
      url: "https://api-dissio.vercel.app/api",
      description: "Production server",
    },
    {
      url: "http://localhost:3000/api",
      description: "Local Development server",
    },
  ],
  schemas: {
    CreateUserRequest: {
      fullName: "Mandyoso",
      username: "mandy",
      password: "Secret101%",
      confirmPassword: "Secret101%",
    },
    AuthRequest: {
      username: "mandy",
      password: "Secret101%",
    },
  },
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routes/api.ts"];

swaggerAutogen({
  openapi: "3.0.0",
})(outputFile, endpointsFiles, doc).then(() => {
  console.log("Swagger documentation file generated successfully.");
});
