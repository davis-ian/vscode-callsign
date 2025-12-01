# Callsign - OpenAPI Explorer & HTTP Client for VS Code

Callsign is a modern, developer-first OpenAPI extension for VS Code that turns your Swagger spec into an interactive API explorer and HTTP client without leaving your editor.

Whether you're building or consuming APIs, Callsign is your all-in-one tool for exploring, testing, and generating code from OpenAPI specifications.

## Features

- **OpenAPI Viewer**: Browse your OpenAPI spec in a fast, readable UI grouped by tag, native to VS Code
- **Interactive Testing**: Send real HTTP requests with custom headers, path parameters, query parameters, and request bodies
- **Request History**: Automatically saves all requests with full request/response details for replay and reference
- **Authentication Support**: Built-in support for Bearer tokens, API keys, and custom headers
- **cURL Generation**: Preview and copy fully-formed curl commands for any request
- **Code Generation**: Generate TypeScript clients using openapi-typescript-codegen directly from your spec
- **Localhost HTTPS Support**: Automatically bypasses SSL certificate validation for localhost development
- **Response Formatting**: View formatted JSON responses with syntax highlighting

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Callsign"
4. Click Install

## Getting Started

### Loading an OpenAPI Specification

**From URL:**
1. Open the Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type "Callsign: Load OpenAPI Spec from URL"
3. Enter your spec URL (e.g., `https://localhost:44348/swagger/v1/swagger.json`)
4. The spec will be saved and appear in your saved specs list

**From File:**
1. Open the Command Palette
2. Type "Callsign: Load OpenAPI Spec from File"
3. Select your local OpenAPI JSON or YAML file

**Quick Access:**
Use the keyboard shortcut `Ctrl+C Ctrl+K` (or `Cmd+C Cmd+K` on Mac) to open the Callsign command menu.

### Exploring Your API

Once loaded, your API endpoints appear in the sidebar tree view:
- Endpoints are organized by tags (matching Swagger UI grouping)
- Each endpoint shows its HTTP method (GET, POST, PUT, DELETE, etc.)
- Click any endpoint to expand and view details

### Testing Endpoints

1. **Select an Endpoint**: Click on any route in the tree view
2. **Fill in Parameters**:
   - Path parameters: Replace placeholders like `{id}` with actual values
   - Query parameters: Add optional or required query string parameters
   - Request body: For POST/PUT/PATCH requests, enter JSON data
3. **Set Authentication**:
   - Expand the Auth Header section
   - Enter header name (e.g., `Authorization`)
   - Enter header value (e.g., `Bearer your-token-here`)
4. **Send Request**: Click the Send Request button
5. **View Response**: See status code, headers, and formatted response body

### Using Request History

All requests are automatically saved:
1. Open the HISTORY section in the sidebar
2. Click any past request to view full details
3. Use the "Send Again" button to replay requests
4. Click the cURL icon to copy the command

### Generating TypeScript Clients

Generate a TypeScript client from your OpenAPI spec:
1. Open the Command Palette
2. Type "Callsign: Generate TypeScript Client"
3. Select your loaded spec
4. Choose an output directory
5. The generated client will appear in your workspace

## Usage Examples

### Simple GET Request
```
Endpoint: GET /api/users
Query Parameters:
  page: 1
  limit: 20

Response: 200 OK
{
  "data": [...],
  "total": 100,
  "page": 1
}
```

### POST Request with Authentication
```
Endpoint: POST /api/users
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  Content-Type: application/json
Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin"
}

Response: 201 Created
{
  "id": "usr_123456",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "createdAt": "2025-12-01T12:00:00Z"
}
```

### Request with Path Parameters
```
Endpoint: GET /api/users/{userId}/orders/{orderId}
Path Parameters:
  userId: usr_123456
  orderId: ord_789012

Response: 200 OK
{
  "orderId": "ord_789012",
  "userId": "usr_123456",
  "status": "completed",
  "total": 99.99
}
```

### Array Query Parameters

Callsign supports multiple formats for array parameters:
```
JSON Array: ["value1", "value2", "value3"]
Comma-separated: value1,value2,value3
```

Both formats work for query parameters that expect arrays.

## Tips and Best Practices

### Working with Local APIs

Callsign automatically handles localhost HTTPS without certificate warnings. Your local development servers on `localhost` or `127.0.0.1` will work seamlessly.

### Saving Time with History

Use the request history to:
- Quickly replay common requests during development
- Share cURL commands with teammates
- Debug by comparing previous successful requests
- Document API behavior with real examples

### Authentication Tokens

For Bearer token authentication:
- Include "Bearer " prefix: `Bearer your-token`
- Or just the token if your API adds the prefix: `your-token`

Check your API documentation for the exact format required.

### Managing Multiple Specs

You can load multiple OpenAPI specs:
- Each spec is saved separately
- Switch between specs using the command palette
- Previously loaded specs persist across VS Code sessions

## Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Open Callsign Commands | Ctrl+C Ctrl+K | Cmd+C Cmd+K |
| Open Command Palette | Ctrl+Shift+P | Cmd+Shift+P |
| Focus Sidebar | Ctrl+0 | Cmd+0 |

## Troubleshooting

### Cannot Connect to API

**Check the following:**
- Verify your API server is running
- Confirm the base URL in your OpenAPI spec is correct
- Ensure the port number is included in the URL
- Check network connectivity and firewall settings

**For localhost APIs:**
- Use `https://localhost:PORT` or `https://127.0.0.1:PORT`
- Port should match your API server configuration
- Callsign automatically bypasses SSL validation for localhost

### Invalid OpenAPI Spec

**Common causes:**
- Malformed JSON or YAML syntax
- Missing required OpenAPI fields (openapi version, info, paths)
- Incompatible spec version (Callsign supports 2.0 and 3.x)

**Solutions:**
- Validate your spec at [Swagger Editor](https://editor.swagger.io/)
- Check for JSON syntax errors with a linter
- Ensure your spec follows OpenAPI specification standards

### Authentication Errors

**Troubleshooting steps:**
- Verify header name matches API requirements exactly (case-sensitive)
- Check token format (Bearer prefix, API key format, etc.)
- Ensure token has not expired
- Confirm you have required permissions for the endpoint

### Extension Not Responding

**Try these steps:**
1. Reload VS Code: Open Command Palette > "Developer: Reload Window"
2. Check Output panel: View > Output > Select "Callsign" from dropdown
3. Update to latest version in Extensions panel
4. Restart VS Code completely

### Missing Endpoints

**Possible reasons:**
- Spec may not be fully loaded yet
- Endpoints may be hidden due to filtering
- Spec format may not be fully supported

**Solutions:**
- Try reloading the spec
- Check the Output panel for loading errors
- Verify all endpoints exist in the raw spec file

## Supported Specifications

- OpenAPI 3.0.x
- OpenAPI 3.1.x
- Swagger 2.0

Both JSON and YAML formats are supported.

## Privacy and Security

- All data is stored locally in VS Code workspace storage
- Authentication tokens are only used for API requests
- No data is transmitted to external services except your configured API endpoints
- Request history is stored locally and can be cleared at any time

## Roadmap

### Current Features

- Load OpenAPI specs from URL or file
- Interactive tree view grouped by tags
- Full endpoint details and documentation
- Send HTTP requests with custom parameters
- Authentication header support
- Request history with replay functionality
- cURL command generation
- TypeScript client code generation

### Planned Features

- Mock server for endpoint simulation
- Advanced request scripting and chaining
- Environment variable management
- Response schema validation
- Import/export request collections
- Custom themes and UI customization
- GraphQL support

## Contributing

Contributions are welcome! To get started:

1. Fork the repository on [GitHub](https://github.com/davis-ian/vscode-callsign)
2. Clone your fork locally
3. Follow the setup instructions in [DEVELOPMENT.md](./DEVELOPMENT.md)
4. Create a feature branch
5. Make your changes and test thoroughly
6. Submit a pull request

### Development Setup

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed instructions on:
- Setting up your development environment
- Running the extension locally
- Building and testing
- Project structure

## Feedback and Support

**Found a bug?**
- Open an issue on [GitHub](https://github.com/davis-ian/vscode-callsign/issues)
- Include error messages, steps to reproduce, and your environment details

**Feature request?**
- Check existing issues first to avoid duplicates
- Describe the feature and its use case
- Explain how it would improve your workflow

**Questions?**
- Check this README and the documentation first
- Search existing GitHub issues
- Open a new issue with the "question" label

## Resources

- [VS Code Extension API Documentation](https://code.visualstudio.com/api)
- [OpenAPI Specification](https://swagger.io/specification/)
- [openapi-typescript-codegen](https://github.com/ferdikoomen/openapi-typescript-codegen)
- [GitHub Repository](https://github.com/davis-ian/vscode-callsign)

## Release Notes

### Version 0.1.0

- Initial release
- OpenAPI 3.x and Swagger 2.0 support
- Interactive endpoint explorer with tag grouping
- HTTP request testing with full parameter support
- Authentication header configuration
- Request history and replay
- cURL command generation
- TypeScript client code generation
- Localhost HTTPS support

## License

[Specify your license here]

## Author

Built by [Ian Davis](https://iandavis.dev) - Creating tools for developers who value productivity and simplicity.

---

**Callsign - Test APIs without leaving your editor.**
