//using FluentValidation;
//using FluentValidation.AspNetCore;
//using HotelManagementSystem.Models;
//using Microsoft.AspNetCore.Authentication.JwtBearer;
//using Microsoft.AspNetCore.Http.Features;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.IdentityModel.Tokens;
//using Microsoft.OpenApi.Models;
//using QuestPDF.Infrastructure;
//using System.Text;

//var builder = WebApplication.CreateBuilder(args);

//// QuestPDF License
//// Required to avoid runtime exception
//QuestPDF.Settings.License = LicenseType.Community;

//// Services
//builder.Services.AddControllers();

//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

//// Database
//builder.Services.AddDbContext<HotelManagementSystemContext>(options =>
//    options.UseSqlServer(
//        builder.Configuration.GetConnectionString("ConnectionString")
//    )
//);

//// FluentValidation
//builder.Services.AddFluentValidationAutoValidation();
//builder.Services.AddValidatorsFromAssemblyContaining<Program>();

//// Global Model Validation Response Format
//builder.Services.Configure<ApiBehaviorOptions>(options =>
//{
//    options.InvalidModelStateResponseFactory = context =>
//    {
//        var errors = context.ModelState
//            .Where(x => x.Value.Errors.Count > 0)
//            .SelectMany(x => x.Value.Errors)
//            .Select(e => e.ErrorMessage)
//            .ToList();

//        return new BadRequestObjectResult(new
//        {
//            message = "Validation failed",
//            errors = errors
//        });
//    };
//});

//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("AllowReactApp",
//        policy =>
//        {
//            policy.WithOrigins(
//                    "http://localhost:5173" // Vite frontend
//                )
//                .AllowAnyHeader()
//                .AllowAnyMethod();
//        });
//});

//builder.Services.AddScoped<IAuthService, AuthService>();

//// Configure Authentication with JWT
//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//    .AddJwtBearer(options =>
//    {
//        options.TokenValidationParameters = new TokenValidationParameters
//        {
//            ValidateIssuer = true,               // Validate token issuer
//            ValidateAudience = true,             // Validate token audience
//            ValidateLifetime = true,             // Validate token expiry
//            ValidateIssuerSigningKey = true,     // Validate signing key

//            ValidIssuer = builder.Configuration["Jwt:Issuer"],
//            ValidAudience = builder.Configuration["Jwt:Audience"],

//            // Secret key used to verify token
//            IssuerSigningKey = new SymmetricSecurityKey(
//                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])
//            )
//        };
//    });

//builder.Services.AddAuthorization();

//builder.Services.AddSwaggerGen(options =>
//{
//    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
//    {
//        Name = "Authorization",
//        Type = SecuritySchemeType.Http,
//        Scheme = "Bearer",
//        BearerFormat = "JWT",
//        In = ParameterLocation.Header,
//        Description = "Enter 'Bearer {token}'"
//    });

//    options.AddSecurityRequirement(new OpenApiSecurityRequirement
//    {
//        {
//            new OpenApiSecurityScheme
//            {
//                Reference = new OpenApiReference
//                {
//                    Type = ReferenceType.SecurityScheme,
//                    Id = "Bearer"
//                }
//            },
//            new string[] {}
//        }
//    });
//});

//// Limit file upload size (e.g., 15MB) to prevent abuse
//builder.Services.Configure<FormOptions>(options =>
//{
//    options.MultipartBodyLengthLimit = 15 * 1024 * 1024; // 15 MiB
//});

//var app = builder.Build();

//app.UseCors("AllowReactApp");


//// Middleware order is IMPORTANT
//app.UseAuthentication();   // First authenticate
//app.UseAuthorization();    // Then authorize

//// Middleware
//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}
//app.UseHttpsRedirection();
//app.UseAuthorization();
//app.MapControllers();

//// Enable static files for serving uploads
//app.UseStaticFiles();

//app.Run();
using FluentValidation;
using FluentValidation.AspNetCore;
using HotelManagementSystem.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using QuestPDF.Infrastructure;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuration & Core Services 
QuestPDF.Settings.License = LicenseType.Community;
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 2. Database Connection 
builder.Services.AddDbContext<HotelManagementSystemContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ConnectionString"))
);

// 3. Custom Business Services 
builder.Services.AddScoped<IAuthService, AuthService>();

// Program.cs
var jwtKey = builder.Configuration["Jwt:Key"]; // Must match appsettings.json EXACTLY

builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        // THE CRITICAL LINE:
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

// 5. Swagger Configuration with JWT Support 
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter only the JWT token. Example: 'your_token_here'"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// 6. CORS & Validation
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(x => x.Value.Errors.Count > 0)
            .SelectMany(x => x.Value.Errors)
            .Select(e => e.ErrorMessage)
            .ToList();

        return new BadRequestObjectResult(new { message = "Validation failed", errors });
    };
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 15 * 1024 * 1024;
});

// 7. App Middleware Pipeline
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseCors("AllowReactApp");
app.UseAuthentication(); // Identity verification
app.UseAuthorization();  // Permission verification

app.MapControllers();
app.Run();