const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Plant Store API',
    version: '1.0.0',
    description: 'REST API for the Plant Store ecommerce application. Auth endpoints are served by the `/api/auth` router; all others are handled directly in the main server.',
  },
  servers: [
    { url: 'http://localhost:5001', description: 'Local development' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from /api/auth/login or /api/auth/register',
      },
    },
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id:          { type: 'integer', example: 1 },
          name:        { type: 'string',  example: 'Snake Plant' },
          price:       { type: 'number',  format: 'float', example: 29.99 },
          description: { type: 'string',  example: 'Low-maintenance indoor plant perfect for beginners' },
          category:    { type: 'string',  example: 'Indoor Plants' },
          image:       { type: 'string',  format: 'uri', example: 'https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=400' },
          stock:       { type: 'integer', example: 15 },
        },
      },
      User: {
        type: 'object',
        properties: {
          id:    { type: 'integer', example: 1 },
          name:  { type: 'string',  example: 'Jane Doe' },
          email: { type: 'string',  format: 'email', example: 'jane@example.com' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user:  { $ref: '#/components/schemas/User' },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjF9.abc123' },
        },
      },
      OrderItem: {
        type: 'object',
        required: ['id', 'quantity'],
        properties: {
          id:       { type: 'integer', example: 1 },
          name:     { type: 'string',  example: 'Snake Plant' },
          price:    { type: 'number',  format: 'float', example: 29.99 },
          quantity: { type: 'integer', minimum: 1, example: 2 },
        },
      },
      ShippingInfo: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name:    { type: 'string', example: 'Jane Doe' },
          email:   { type: 'string', format: 'email', example: 'jane@example.com' },
          address: { type: 'string', example: '123 Garden Lane' },
          city:    { type: 'string', example: 'Portland' },
          zipCode: { type: 'string', example: '97201' },
          phone:   { type: 'string', example: '5031234567' },
        },
      },
      OrderResponse: {
        type: 'object',
        properties: {
          id:      { type: 'integer', example: 42 },
          orderId: { type: 'integer', example: 42 },
          message: { type: 'string',  example: 'Order placed successfully' },
        },
      },
      StockError: {
        type: 'object',
        properties: {
          errors:        { type: 'array', items: { type: 'string' }, example: ['Not enough stock for "Fiddle Leaf Fig". Only 2 available.'] },
          adjustedItems: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Something went wrong' },
        },
      },
    },
  },
  paths: {
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Get all products',
        responses: {
          200: {
            description: 'Array of all products',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
              },
            },
          },
          500: { description: 'Database error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/products/category/{category}': {
      get: {
        tags: ['Products'],
        summary: 'Get products by category',
        parameters: [
          {
            name: 'category',
            in: 'path',
            required: true,
            schema: { type: 'string', example: 'Indoor Plants' },
            description: 'Category name (case-sensitive)',
          },
        ],
        responses: {
          200: {
            description: 'Products in the given category (empty array if category not found)',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } } } },
          },
          500: { description: 'Database error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get a single product by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer', example: 1 },
          },
        ],
        responses: {
          200: {
            description: 'The product',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } },
          },
          404: { description: 'Product not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Database error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/categories': {
      get: {
        tags: ['Products'],
        summary: 'Get all distinct categories',
        responses: {
          200: {
            description: 'Array of category name strings',
            content: {
              'application/json': {
                schema: { type: 'array', items: { type: 'string' }, example: ['Indoor Plants', 'Outdoor Plants'] },
              },
            },
          },
          500: { description: 'Database error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name:     { type: 'string',  example: 'Jane Doe' },
                  email:    { type: 'string',  format: 'email', example: 'jane@example.com' },
                  password: { type: 'string',  format: 'password', example: 'Password123!' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User created — returns user object and JWT token (expires in 24 h)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          400: {
            description: 'Missing fields or email already registered',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email:    { type: 'string', format: 'email', example: 'jane@example.com' },
                  password: { type: 'string', format: 'password', example: 'Password123!' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful — returns user object and JWT token (expires in 24 h)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          400: {
            description: 'Missing fields or invalid credentials',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get the currently authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'The authenticated user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'No token or invalid token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Place a new order',
        description: 'Creates an order and decrements stock for each item. Returns a 400 with adjusted quantities if any item exceeds available stock.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['items', 'total', 'shipping'],
                properties: {
                  items:    { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
                  total:    { type: 'number', format: 'float', example: 59.98 },
                  shipping: { $ref: '#/components/schemas/ShippingInfo' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Order placed successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/OrderResponse' } } },
          },
          400: {
            description: 'Missing required fields or insufficient stock. When stock is the issue, `adjustedItems` is returned so the client can update the cart.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StockError' } } },
          },
          500: { description: 'Database error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
