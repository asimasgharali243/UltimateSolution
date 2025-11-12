using BackendWeightReader.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models; // ✅ Needed for Swagger configuration

var builder = WebApplication.CreateBuilder(args);

// ==========================
//   APPLICATION INFO
// ==========================
Console.WriteLine("=== APPLICATION STARTING ===");
Console.WriteLine($"Environment: {builder.Environment.EnvironmentName}");
Console.WriteLine($"Application Name: {builder.Environment.ApplicationName}");
Console.WriteLine($"Content Root Path: {builder.Environment.ContentRootPath}");
Console.WriteLine($"Is Development: {builder.Environment.IsDevelopment()}");
Console.WriteLine($"Is Production: {builder.Environment.IsProduction()}");

// ==========================
//   SERVICES CONFIGURATION
// ==========================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ==========================
//   SWAGGER CONFIGURATION
// ==========================
var enableSwagger = builder.Configuration.GetValue<bool>("SwaggerSettings:EnableSwagger");
Console.WriteLine($"Swagger Enabled: {enableSwagger}");

if (enableSwagger)
{
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "BackendWeightReader API",
            Version = "v1",
            Description = "API for managing scale readings, users, and pins."
        });
    });
    Console.WriteLine("✓ Swagger services registered");
}

// ==========================
//   CORS CONFIGURATION
// ==========================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});
Console.WriteLine("✓ CORS configured with AllowAll policy");

// ==========================
//   DATABASE CONFIGURATION
// ==========================
var connectionString = builder.Configuration.GetConnectionString("dbScaleConnection");

if (!string.IsNullOrEmpty(connectionString))
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(connectionString));
    Console.WriteLine("✓ Database context configured");
}
else
{
    Console.WriteLine("⚠ Database connection string not found in appsettings.json");
}

// ==========================
//   BUILD APPLICATION
// ==========================
var app = builder.Build();

// ==========================
//   MIDDLEWARE PIPELINE
// ==========================
app.UseCors("AllowAll");
Console.WriteLine("✓ CORS middleware enabled");

if (enableSwagger)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "BackendWeightReader API v1");
        c.RoutePrefix = "swagger"; // Access via /swagger
    });
    Console.WriteLine("✓ Swagger middleware enabled");
}

app.UseAuthorization();
app.MapControllers();
Console.WriteLine("✓ Authorization and controllers configured");

// ==========================
//   SERVER INFORMATION
// ==========================
Console.WriteLine("\n=== SERVER URLs ===");
if (app.Urls.Any())
{
    foreach (var url in app.Urls)
    {
        Console.WriteLine($"Listening on: {url}");
    }
}
else
{
    Console.WriteLine("Using default Kestrel URLs");
    Console.WriteLine("  Typically: https://localhost:5001 & http://localhost:5000");
}

if (enableSwagger)
{
    Console.WriteLine("  Swagger UI: https://localhost:5001/swagger");
    Console.WriteLine("  Swagger JSON: https://localhost:5001/swagger/v1/swagger.json");
}

// ==========================
//   REGISTERED ENDPOINTS
// ==========================
Console.WriteLine("\n=== REGISTERED API ENDPOINTS ===");
var endpointDataSource = app.Services.GetRequiredService<EndpointDataSource>();
var endpoints = endpointDataSource.Endpoints;

bool foundEndpoints = false;
foreach (var endpoint in endpoints)
{
    if (endpoint is RouteEndpoint routeEndpoint)
    {
        var method = routeEndpoint.Metadata.GetMetadata<HttpMethodMetadata>()?.HttpMethods?.FirstOrDefault() ?? "ANY";
        var route = routeEndpoint.RoutePattern.RawText ?? "Unknown";
        var displayName = endpoint.DisplayName ?? "Unknown";

        // Only show your controllers (ignore framework routes)
        if (!displayName.Contains("Swagger") && !displayName.Contains("Framework"))
        {
            Console.WriteLine($"  {method.PadRight(6)} {route}");
            foundEndpoints = true;
        }
    }
}

if (!foundEndpoints)
{
    Console.WriteLine("  ⚠ No API endpoints found. Make sure controllers have [ApiController] and [Route] attributes.");
}

Console.WriteLine("\n=== APPLICATION STARTED ===");
Console.WriteLine("Press Ctrl + C to stop the server...");

app.Run();
