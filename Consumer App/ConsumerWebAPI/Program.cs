using ConsumerWebAPI.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ------------------------------------
// 1️⃣  Add core services
// ------------------------------------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ------------------------------------
// 2️⃣  Configure SQL Server connection
// ------------------------------------
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("dbScaleConnection")));

// ------------------------------------
// 3️⃣  Configure CORS (Cross-Origin Resource Sharing)
// ------------------------------------
// This allows Swagger, React, or any frontend app to call your API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()    // Allow requests from any domain
            .AllowAnyMethod()    // GET, POST, PUT, DELETE, etc.
            .AllowAnyHeader();   // Allow all custom headers (Authorization, Content-Type, etc.)
    });
});

var app = builder.Build();

// ------------------------------------
// 4️⃣  Enable CORS globally
// ------------------------------------
app.UseCors("AllowAll");

// ------------------------------------
// 5️⃣  Enable Swagger (only in Development)
// ------------------------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.DocumentTitle = "Consumer Web API Documentation";
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "ConsumerWebAPI v1");
    });
}

// ------------------------------------
// 6️⃣  Redirect HTTP → HTTPS
// ------------------------------------
// app.UseHttpsRedirection();

// ------------------------------------
// 7️⃣  Add Authorization (optional if using JWT later)
// ------------------------------------
app.UseAuthorization();

// ------------------------------------
// 8️⃣  Map controller routes
// ------------------------------------
app.MapControllers();

// ------------------------------------
// 9️⃣  Run the app
// ------------------------------------
app.Run("http://0.0.0.0:5172");

