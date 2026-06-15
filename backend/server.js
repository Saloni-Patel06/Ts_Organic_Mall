
const express = require('express');
const { connectDB, getDB } = require('./config/db');

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/uploads", express.static("uploads"));

const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const contactRoutes = require('./routes/contactRoutes');
const supportRoutes = require('./routes/supportRoutes');
const verifyPaymentRoutes = require('./routes/verifyPaymentRoutes');
const cartRoutes = require('./routes/cartRoutes');
const walletRoutes = require('./routes/walletRoutes');
const authRoutes = require('./routes/authRoutes');
const agentregRoutes = require('./routes/agentregRoutes');
const withdrawRoutes = require('./routes/withdrawRoutes');


app.use('/', userRoutes);
app.use("/manage-products", productRoutes);
app.use('/', orderRoutes);
app.use('/', verifyPaymentRoutes);
app.use('/', contactRoutes);
app.use('/', supportRoutes);
app.use('/', cartRoutes);
app.use('/', walletRoutes);
app.use('/', authRoutes);
app.use('/', agentregRoutes);
app.use('/', withdrawRoutes);

const errorHandler = require('./middleware/errorMiddleware');
app.use(errorHandler);


// Swagger Setup
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User API",
      version: "1.0.0",
      description: "Express API with Routes and Controller"
    },
    servers: [
      {
        url: "http://localhost:5000"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Test Backend Function

const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs at /api-docs`);
  });
};


startServer();